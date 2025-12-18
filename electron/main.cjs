const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let client;

// Initialize WebTorrent dynamically since it might be ESM
(async () => {
    try {
        const webtorrentModule = await import('webtorrent');
        const WebTorrent = webtorrentModule.default || webtorrentModule;
        client = new WebTorrent();
        console.log('[DEBUG] WebTorrent initialized.');
    } catch (err) {
        console.error('[DEBUG] Failed to load WebTorrent:', err);
    }
})();

// Tratamento global de erros de promessa não tratados para evitar crash
process.on('unhandledRejection', (reason, p) => {
    console.error('[DEBUG] Rejeição de Promessa Não Tratada:', reason);
    // Não crashar a aplicação
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:5173'
            : `file://${path.join(__dirname, '../dist/index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handler to start torrent streaming
const startServerForTorrent = (torrent, resolve, reject) => {
    console.log(`[DEBUG] StartServerForTorrent chamado para: ${torrent.name}`);

    if (!torrent.files || torrent.files.length === 0) {
        console.error('[DEBUG] Arquivos não encontrados no torrent.');
        reject('Arquivos do torrent não encontrados localmente ainda.');
        return;
    }

    console.log(`[DEBUG] Torrent tem ${torrent.files.length} arquivos.`);

    // Filter for video files and sort by size (descending) to get the largest file (main movie/episode)
    const videoFiles = torrent.files.filter(file => {
        return file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.avi') || file.name.endsWith('.webm');
    });

    const file = videoFiles.length > 0
        ? videoFiles.sort((a, b) => b.length - a.length)[0]
        : torrent.files.sort((a, b) => b.length - a.length)[0];

    if (!file) {
        console.error('[DEBUG] Nenhum arquivo de vídeo acessível encontrado.');
        reject('Nenhum arquivo de vídeo encontrado.');
        return;
    }

    console.log(`[DEBUG] Arquivo selecionado: ${file.name}`);

    const server = http.createServer((req, res) => {
        const range = req.headers.range;
        if (!range) {
            res.statusCode = 200;
            res.setHeader('Content-Length', file.length);
            res.setHeader('Content-Type', 'video/mp4');
            if (file.name.endsWith('.mkv')) res.setHeader('Content-Type', 'video/x-matroska');
            if (file.name.endsWith('.webm')) res.setHeader('Content-Type', 'video/webm');
            file.createReadStream().pipe(res);
            return;
        }

        const positions = range.replace(/bytes=/, "").split("-");
        const start = parseInt(positions[0], 10);
        const total = file.length;
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        const chunksize = (end - start) + 1;

        res.statusCode = 206;
        res.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + total);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", chunksize);
        res.setHeader('Content-Type', 'video/mp4');
        if (file.name.endsWith('.mkv')) res.setHeader('Content-Type', 'video/x-matroska');
        if (file.name.endsWith('.webm')) res.setHeader('Content-Type', 'video/webm');

        const stream = file.createReadStream({ start, end });
        stream.pipe(res);

        stream.on('error', (streamErr) => {
            console.error('[DEBUG] Erro no stream:', streamErr);
            res.end();
        });
    });

    server.listen(0, () => {
        const port = server.address().port;
        const url = `http://localhost:${port}/`;
        console.log(`[DEBUG] Servidor ouvindo em ${url}`);
        resolve(url);
    });

    server.on('error', (err) => {
        console.error('[DEBUG] Erro no servidor:', err);
        reject(err.message);
    });
};

ipcMain.handle('start-stream', async (event, magnetLink) => {
    console.log(`[DEBUG] IPC start-stream recebido.`);
    const torrentId = magnetLink;

    if (!client) {
        console.error('[DEBUG] WebTorrent client not initialized yet.');
        return Promise.reject(new Error('Torrent client initializing...'));
    }

    return new Promise((resolve, reject) => {
        // Mecanismo de segurança de Timeout (15s)
        const timeout = setTimeout(() => {
            console.error('[DEBUG] start-stream expirou após 15s');
            // Rejeitamos com erro amigável, mas unhandledRejection handler evita crash se for tarde demais
            safeReject(new Error('Timeout: Metadados do torrent demoraram muito para carregar.'));
        }, 15000);

        const safeResolve = (url) => {
            clearTimeout(timeout);
            resolve(url);
        };
        const safeReject = (err) => {
            clearTimeout(timeout);
            reject(err);
        };

        try {
            // Tenta encontrar o torrent manualmente na lista de torrents do cliente
            // Isso é mais seguro do que client.get() para objetos quebrados
            const existing = client.torrents.find(t => t.magnetURI === torrentId || t.infoHash === torrentId);

            if (existing) {
                console.log(`[DEBUG] Torrent já existe na lista. InfoHash: ${existing.infoHash}`);

                // Se já tem arquivos, reutiliza
                if (existing.files && existing.files.length > 0) {
                    console.log('[DEBUG] Torrent existente parece válido e pronto. Reutilizando.');
                    startServerForTorrent(existing, safeResolve, safeReject);
                    return;
                }

                console.log('[DEBUG] Torrent existente está pendente ou inválido. Removendo forçadamente...');

                // Tenta destruir o objeto diretamente
                try {
                    // destroyStore: false garante que não tentamos apagar arquivos do disco se estiver meio bugado
                    existing.destroy({ destroyStore: false }, (err) => {
                        if (err) console.error('[DEBUG] Erro ao destruir torrent (callback):', err);
                        else console.log('[DEBUG] Torrent destruído com sucesso.');

                        // Mesmo com erro, prosseguimos
                        adicionarNovoTorrent();
                    });
                } catch (e) {
                    console.error('[DEBUG] Erro ao chamar destroy no objeto:', e);
                    // Se falhar o destroy, tenta remover pelo client como último recurso
                    try {
                        const hash = existing.infoHash || torrentId;
                        if (hash) {
                            client.remove(hash, () => adicionarNovoTorrent());
                        } else {
                            adicionarNovoTorrent();
                        }
                    } catch (removeErr) {
                        console.error('[DEBUG] Falha total na remoção. Tentando adicionar assim mesmo...');
                        adicionarNovoTorrent();
                    }
                }
                return;
            }

            // Se não encontrou, adiciona novo
            adicionarNovoTorrent();

            function adicionarNovoTorrent() {
                console.log('[DEBUG] Adicionando novo torrent...');
                try {
                    const torrent = client.add(torrentId);

                    torrent.on('ready', () => {
                        console.log('[DEBUG] Novo torrent está pronto (ready).');
                        startServerForTorrent(torrent, safeResolve, safeReject);
                    });

                    torrent.on('error', (err) => {
                        console.error('[DEBUG] Erro no Torrent (novo):', err);
                        safeReject(err);
                    });
                } catch (addErr) {
                    console.error('[DEBUG] Erro ao executar client.add:', addErr);
                    // Se erro for "Torrent already exists" e não pegamos antes, tentamos recuperar de novo?
                    // Por enquanto rejeita.
                    safeReject(addErr);
                }
            }

        } catch (err) {
            console.error('[DEBUG] Erro inesperado em start-stream:', err);
            safeReject(err);
        }
    });
});

ipcMain.handle('search-tpb', async (event, query) => {
    try {
        const response = await fetch(`https://apibay.org/q.php?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('TPB Search Error:', error);
        return [];
    }
});
