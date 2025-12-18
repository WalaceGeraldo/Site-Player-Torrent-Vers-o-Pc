console.log('Versions:', process.versions);
console.log('Process Type:', process.type);
console.log('Process ExecPath:', process.execPath);

try {
    const electron = require('electron');
    console.log('Require electron:', typeof electron);
    if (typeof electron === 'object') console.log('Keys:', Object.keys(electron));
    else console.log('Value:', electron);
} catch (e) {
    console.log('Require electron failed:', e.message);
}

try {
    const main = require('electron/main');
    console.log('Require electron/main:', main);
} catch (e) {
    console.log('Require electron/main failed:', e.message);
}
