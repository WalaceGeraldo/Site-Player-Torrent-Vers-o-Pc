console.log('Process keys:', Object.keys(process));
console.log('Process ElectronBinding:', process.electronBinding);
try {
    console.log('Binding atom_browser_app:', process.electronBinding('app'));
} catch (e) { console.log('Binding error:', e.message); }
