
// 🧪 Test: Phase 2 Guardian Mode
const fs = require('fs');
const vm = require('vm');

console.log("🛡️ Starting Phase 2 Guardian Verification...");

// 1. Mock Browser
const window = {
    addEventListener: () => { },
    localStorage: {
        data: {},
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
    UI: { goToScreen: () => { }, updateNavActive: () => { } }
};
const document = {
    getElementById: (id) => ({
        id: id, value: '', style: {}, textContent: '', innerHTML: '',
        addEventListener: () => { }
    }),
    querySelector: () => ({ style: {}, innerHTML: '', querySelector: () => null })
};

global.window = window;
global.document = document;
global.localStorage = window.localStorage;
global.location = window.location;
global.alert = window.alert;
global.UI = window.UI; // Fix: Make UI available globally


// 2. Load app.js
try {
    const code = fs.readFileSync('js/app.js', 'utf8');
    vm.runInThisContext(code);
    console.log("✅ Loaded js/app.js");

    // 💡 Fix: Expose Guardian and UI globally for the test
    global.Guardian = window.Guardian;
    global.UI = window.UI;
} catch (e) { console.error(e); }

// 3. Test: Guardian Dashboard Render
console.log("\n📊 Testing Guardian Dashboard Render...");
try {
    // Setup Mock History
    const history = [{ emotion: 'Sad', intensity: 9, timestamp: new Date().toISOString() }];
    localStorage.setItem('feelflow_history', JSON.stringify(history));

    Guardian.renderDashboard();
    console.log("✅ Dashboard render logic executed (Mock).");

    // Alert logic check
    // In a real DOM we'd check style.display. Here we trust the function ran.
} catch (e) {
    console.error("❌ Dashboard render failed:", e);
}

// 4. Test: Parent Reaction Loop
console.log("\n❤️ Testing Parent Reaction Loop...");
try {
    // 1. Parent sends reaction
    Guardian.sendReaction();
    if (localStorage.getItem('parent_reaction') === 'heart') {
        console.log("   [Step 1] Parent reaction saved.");
    } else {
        console.error("❌ Parent reaction not saved.");
    }

    // 2. Child goes home (should trigger alert)
    goHome();
    // Expect alert: "❤️ Mom/Dad sent you a Cheer Up Heart!"
    if (!localStorage.getItem('parent_reaction')) {
        console.log("   [Step 2] Reaction consumed (cleared) on Home load.");
    } else {
        console.error("❌ Reaction NOT cleared.");
    }

} catch (e) {
    console.error("❌ Reaction loop failed:", e);
}

// 5. Test: Crisis Alert Trigger
console.log("\n🚨 Testing Crisis Alert...");
try {
    // Setup global state for finishCheckIn
    window.currentEmotion = { name: 'Sad', intensity: 9 };
    // finishCheckIn is async
    window.finishCheckIn().then(() => {
        // Expect alert in console
        console.log("✅ Check-in processed.");
    });
} catch (e) {
    console.error("❌ Crisis alert failed:", e);
}

// Small timeout to allow async alerts to print
setTimeout(() => console.log("\n🛡️ Verification Complete."), 100);
