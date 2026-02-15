const fs = require('fs');
const vm = require('vm');

console.log("🛡️ Starting Robustness Verification...");

// 1. Mock Browser with CORRUPTED Data
const window = {
    addEventListener: () => { },
    localStorage: {
        data: {
            'feelflow_routines': '{ INVALID JSON }', // 💥 CORRUPTED DATA
            'feelflow_history': 'null',
            'feelflow_medals': 'undefined'
        },
        getItem: (k) => window.localStorage.data[k] || null,
        setItem: (k, v) => { window.localStorage.data[k] = v.toString(); },
        removeItem: (k) => { delete window.localStorage.data[k]; }
    },
    navigator: { vibrate: () => { } },
    console: console,
    Date: Date,
    location: { href: '' },
    alert: (msg) => console.log(`   📱 [Alert]: ${msg}`),
    FeelFlow: { medals: [] },
    UI: { goToScreen: () => { }, updateNavActive: () => { } },
    AudioContext: class { }, // Mock AudioContext to isolate Data Crash
    setTimeout: setTimeout
};

global.window = window;
global.document = {
    getElementById: () => ({ style: {}, addEventListener: () => { } }),
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => { } } }),
    body: { appendChild: () => { } },
    querySelector: () => null
};
global.localStorage = window.localStorage;
global.location = window.location;
global.alert = window.alert;
global.UI = window.UI;

// 2. Load app.js and Catch Crash
try {
    const code = fs.readFileSync('js/app.js', 'utf8');
    vm.runInThisContext(code);
    console.log("✅ Loaded js/app.js (Survived?)");
} catch (e) {
    console.error("❌ CRASH DETECTED:", e.message);
}

// 3. Verify Vital Functions exist
if (typeof window.menuNavigate === 'function') {
    console.log("✅ menuNavigate is defined. App is alive.");
} else {
    console.error("❌ menuNavigate is UNDEFINED. App is dead.");
}
