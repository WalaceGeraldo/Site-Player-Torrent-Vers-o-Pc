import WebTorrent from 'webtorrent';

const client = new WebTorrent();
// Sintel torrent
const magnetURI = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F';

console.log('Adding torrent...');
client.add(magnetURI, (torrent) => {
    console.log('Torrent ready.');
    if (typeof torrent.createServer === 'function') {
        console.log('torrent.createServer exists!');
        const server = torrent.createServer();
        server.close();
    } else {
        console.log('torrent.createServer does NOT exist.');
        console.log('Keys on torrent object:', Object.keys(torrent));
        console.log('Prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(torrent)));
    }
    client.destroy();
    process.exit(0);
});

// Timeout
setTimeout(() => {
    console.log('Timeout waiting for torrent metadata.');
    process.exit(1);
}, 10000);
