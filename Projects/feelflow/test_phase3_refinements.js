
// 🧪 Test: Phase 3 Verification
const fs = require('fs');
const vm = require('vm');

console.log("🟦 Starting Phase 3 Verification...");

// 1. Mock Browser
const window = {
    addEventListener: () => { },
    localStorage: {
        getItem: (k) => "[]",
        setItem: (k, v) => console.log(`   [Storage] Set ${k}:`, v.length > 50 ? v.substring(0, 50) + "..." : v)
    },
    navigator: { vibrate: (p) => console.log("   [Haptic] Vibrate:", p) },
    console: console,
    Date: Date,
    userInteracted: true, // Simulate interaction for sound
    UI: {
        goToScreen: (id, title) => console.log(`   [UI] Go to ${id}, Title: "${title}"`),
        showLegoAnimation: () => console.log("   [UI] Lego Animation Triggered")
    },
    FeelFlow: { medals: [] }
};
const document = {
    getElementById: () => ({
        id: 'mock', innerHTML: '', style: {}, classList: { remove: () => { }, add: () => { } }, value: ''
    }),
    querySelector: () => ({
        style: {}, innerHTML: '', querySelector: () => null
    })
};

global.window = window;
global.document = document;
global.navigator = window.navigator;
global.localStorage = window.localStorage;

// 2. Load app.js
try {
    const code = fs.readFileSync('js/app.js', 'utf8');
    vm.runInThisContext(code);
    console.log("✅ Loaded js/app.js");
} catch (e) {
    console.error("❌ Error loading app.js:", e);
    process.exit(1);
}

// 3. Test Dynamic Greeting
console.log("\n☀️ Testing Greeting...");
try {
    const greeting = getGreeting(); // Should be available
    console.log(`   Greeting Output: "${greeting}"`);
    if (!greeting.includes('Jason')) console.error("❌ Greeting missing name.");
} catch (e) {
    console.error("❌ getGreeting failed:", e);
}

// 4. Test Medal/Block System
console.log("\n🏆 Testing Block Award...");
try {
    // Simulate awarding a 'Block' (formerly Lego)
    FeelFlow.addMedalProgress(0, 'block');
    const medals = JSON.parse(localStorage.getItem('feelflow_medals'));
    console.log("   Medals in Storage:", medals);

    if (medals.includes('Block')) console.log("✅ PASS: Awarded 'Block' successfully.");
    else console.error("❌ FAILED: 'Block' not found in medals.");
} catch (e) {
    console.error("❌ Medal test failed:", e);
}

// 5. Test Haptics
console.log("\n📳 Testing Haptics...");
try {
    safeVibrate(50);
    // Expect output in console from mock
} catch (e) {
    console.error("❌ Haptic test failed:", e);
}

// 6. Test Switch Routine Haptics
console.log("\n🔄 Testing Switch Routine...");
try {
    if (typeof switchRoutine === 'function') {
        switchRoutine('evening');
        // Expect renderRoutineScreen call and vibration
        if (currentRoutineTab === 'evening') console.log("✅ PASS: Switched to Evening tab.");
        else console.error("❌ FAILED: Tab did not switch.");
    } else {
        console.error("❌ switchRoutine not found.");
    }
} catch (e) {
    console.error("❌ switchRoutine test failed:", e);
}

console.log("\n🟦 Verification Complete.");
