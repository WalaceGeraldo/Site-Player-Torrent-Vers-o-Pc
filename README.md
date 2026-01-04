# Torrent Player

Um reprodutor de torrents desktop moderno construído com Electron, React e WebTorrent. Permite assistir a vídeos via streaming de torrent magnet links ou arquivos sem precisar esperar o download completo.

## 🚀 Funcionalidades

- **Streaming de Torrents**: Assista a vídeos enquanto eles são baixados.
- **Busca Integrada**: Pesquise torrents diretamente no aplicativo (integração com API PirateBay).
- **Interface Moderna**: UI limpa e responsiva construída com React e estilizada para uma ótima experiência de usuário.
- **Suporte a Magnet Links**: Abra magnet links diretamente.

## 🛠️ Tecnologias Utilizadas

- **[Electron](https://www.electronjs.org/)**: Para criação da aplicação desktop.
- **[React](https://reactjs.org/)**: Biblioteca para construção da interface do usuário.
- **[Vite](https://vitejs.dev/)**: Build tool e servidor de desenvolvimento rápido.
- **[WebTorrent](https://webtorrent.io/)**: Protocolo de streaming de torrent via WebRTC/TCP/UDP.

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- npm (geralmente vem com o Node.js)

## 🔧 Instalação

1. Clone o repositório (se aplicável) ou navegue até a pasta do projeto.
2. Instale as dependências:

```bash
npm install
```

## ▶️ Como Executar

Para iniciar o ambiente de desenvolvimento (React + Electron):

```bash
npm run electron:dev
```

> **Nota**: Se você encontrar erros relacionados ao `ELECTRON_RUN_AS_NODE`, certifique-se de que essa variável de ambiente não está definida no seu terminal. No PowerShell, você pode usar `$env:ELECTRON_RUN_AS_NODE=""` antes de executar.

## 🏗️ Build (Produção)

Para gerar o build de produção da aplicação React:

```bash
npm run build
```

## 📝 Estrutura do Projeto

- `electron/`: Código do processo principal do Electron (`main.cjs`, `preload.cjs`).
- `src/`: Código fonte da aplicação React (Componentes, Estilos, etc.).
- `public/`: Assets estáticos.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---
Desenvolvido por Walace Geraldo
