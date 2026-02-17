
const fs = require('fs');
const path = require('path');

// 1. Minimal DOM Mock
const mockElement = (id) => ({
    id,
    style: {},
    classList: { add: () => { }, remove: () => { } },
    appendChild: () => { },
    addEventListener: () => { },
    // We will capture innerHTML assignments
    set innerHTML(val) { this._html = val; },
    get innerHTML() { return this._html || ''; },
    // Mock querying children
    querySelector: () => ({ innerText: '' }),
    querySelectorAll: () => [],
    textContent: '',
    value: ''
});

const elements = {};
global.document = {
    getElementById: (id) => {
        if (!elements[id]) elements[id] = mockElement(id);
        return elements[id];
    },
    querySelectorAll: () => [],
    createElement: () => mockElement('new'),
};

global.window = global;
global.window.addEventListener = () => { };
global.navigator = {
    mediaDevices: { getUserMedia: async () => ({ getTracks: () => [] }) },
    vibrate: () => { }
};

// Mock Audio & UI
global.window.AudioContext = class {
    createOscillator() { return { start: () => { }, stop: () => { }, connect: () => { }, frequency: { setValueAtTime: () => { } }, type: '' }; }
    createGain() { return { gain: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { } }, connect: () => { } }; }
    get currentTime() { return 0; }
    resume() { }
};
global.window.webkitAudioContext = global.window.AudioContext;
global.UI = { goToScreen: () => { } };

// 2. Load Activities Code
const activitiesPath = path.join(__dirname, 'js/activities_v2.9.1.js');
let Activities;

try {
    const code = fs.readFileSync(activitiesPath, 'utf8');
    // Append export
    eval(code + "; global.Activities = Activities;");
    Activities = global.Activities;
} catch (e) {
    console.error("Failed to load activities:", e);
    process.exit(1);
}

// 3. Test Runner
async function run() {
    console.log("=== Phase 10 Strategy Verification (No-Dep) ===");

    const strategies = [
        { name: 'Count to Calm', expect: ['countDisplay', 'Count slowly'] },
        { name: 'Comfort Object', check: () => elements['strategyIcon'].innerText.includes('🧸') && elements['strategyText'].innerText.includes('Find something') },
        { name: 'Drink Water', expect: ['waterFill', 'Tap to fill'] },
        { name: 'Happy Journal', expect: ['😊', '😂', 'placeholder="Type here..."'] },
        { name: 'Gratitude', expect: ['gratitudePerson', 'gratitudeThing', 'gratitudePlace', 'gratitudeGarden'] },
        { name: 'Talk to Someone', expect: ['script-card', 'I feel sad because...', 'Can you just listen?'] },
        { name: 'Take a Walk', check: () => elements['strategyIcon'].innerText.includes('🚶') && elements['strategyText'].innerText.includes('start walking') },
        { name: 'Energy Shake', expect: ['shakeIcon', 'shakeTitle', 'Arm Shake!'] },
        { name: 'Fresh Air', check: () => elements['strategyIcon'].innerText.includes('🚪') && elements['strategyText'].innerText.includes('Open a window') },
        { name: 'Mindful Moment', check: () => elements['strategyIcon'].innerText.includes('😌') && elements['strategyText'].innerText.includes('Close your eyes') }
    ];

    let passed = 0;

    for (const s of strategies) {
        console.log(`Testing [${s.name}]...`);

        // Reset Area and specific elements
        elements['activityArea'] = mockElement('activityArea');
        elements['strategyIcon'] = mockElement('strategyIcon'); // Reset specifically for check
        elements['strategyText'] = mockElement('strategyText');

        // Call Setup
        try {
            Activities.setupActivity(s.name, 'icon');
        } catch (e) { console.log("Error in setup:", e); }

        // Wait
        await new Promise(r => setTimeout(r, 200));

        let success = false;
        if (s.check) {
            try { success = s.check(); } catch (e) { console.log(e); }
        } else {
            const html = elements['activityArea'].innerHTML;
            const missing = s.expect.filter(k => !html.includes(k));
            success = missing.length === 0;
            if (!success) console.error(`Missing: ${missing.join(', ')}`);
        }

        if (success) {
            console.log(`✅ PASSED.`);
            passed++;
        } else {
            console.error(`❌ FAILED.`);
        }
    }

    console.log(`\nResults: ${passed}/${strategies.length} Passed.`);
    if (passed === strategies.length) console.log("🎉 ALL STRATEGIES IMPLEMENTED & VERIFIED.");
    else { console.error("⚠️ VERIFICATION FAILED."); process.exit(1); }
}

run();
