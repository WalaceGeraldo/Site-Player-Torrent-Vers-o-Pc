import WebTorrent from 'webtorrent';

const client = new WebTorrent();
const magnetURI = 'magnet:?xt=urn:btih:E8973124A65F2C26CEC61B2B3E0EFCCBD9F4D259&dn=Retro%20Freaks%20II&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftorrent.gresille.org%3A80%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969';

console.log('Testing Magnet Link:', magnetURI);
console.log('Waiting for metadata...');

client.add(magnetURI, (torrent) => {
    console.log('Client is downloading:', torrent.infoHash);
    console.log('Torrent name:', torrent.name);
    console.log('Files:');
    torrent.files.forEach(file => {
        console.log(' - ' + file.name);
    });

    console.log('Metadata received and parsed successfully.');
    client.destroy();
    process.exit(0);
});

client.on('error', (err) => {
    console.error('Client Error:', err);
    process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
    console.error('Timeout: Metadata not received after 30 seconds.');
    process.exit(1);
}, 30000);
