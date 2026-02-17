
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// 1. Mock DOM
const dom = new JSDOM(`<!DOCTYPE html>
<html>
    <body>
        <div id="wrapper">
            <div id="activityArea"></div>
            <button id="activityActionBtn"></button>
            <div id="activityTitle"></div>
            <div id="activityIcon"></div>
            <div id="inAppActionArea"></div>
        </div>
    </body>
</html>`);

global.window = dom.window;
global.document = dom.window.document;
global.navigator = { mediaDevices: { getUserMedia: jest.fn() }, vibrate: jest.fn() };
global.HTMLElement = dom.window.HTMLElement;

// Mock AudioContext
global.window.AudioContext = class {
    createOscillator() { return { start: () => { }, stop: () => { }, connect: () => { }, frequency: { setValueAtTime: () => { } }, type: '' }; }
    createGain() { return { gain: { setValueAtTime: () => { }, exponentialRampToValueAtTime: () => { } }, connect: () => { } }; }
    get currentTime() { return 0; }
    resume() { }
};
global.window.webkitAudioContext = global.window.AudioContext;

// Mock Activities.js loading
const activitiesPath = path.join(__dirname, 'js/activities_v2.9.1.js');
let Activities;

try {
    const code = fs.readFileSync(activitiesPath, 'utf8');
    // Simple eval to load the object (since it's not a module)
    // We need to strip "const Activities =" and just return implementation
    // Or just run it in vm
    eval(code);
    Activities = global.Activities || Activities;
} catch (e) {
    console.error("Failed to load activities:", e);
    process.exit(1);
}

// Helper to check strategy
function checkStrategy(name, expectedKeywords) {
    console.log(`Testing [${name}]...`);
    Activities.setupActivity(name, 'icon');

    // Wait for timeout in setupActivity
    return new Promise(resolve => {
        setTimeout(() => {
            const area = document.getElementById('activityArea').innerHTML;
            const missing = expectedKeywords.filter(k => !area.includes(k));
            if (missing.length > 0) {
                console.error(`❌ [${name}] FAILED. Missing: ${missing.join(', ')}`);
                console.log(`   Content: ${area.substring(0, 100)}...`);
                resolve(false);
            } else {
                console.log(`✅ [${name}] PASSED.`);
                resolve(true);
            }
        }, 500); // Wait longer than the 100ms inside setupActivity
    });
}

// Run Tests
async function run() {
    console.log("=== Phase 10 Strategy Verification ===");

    const results = [];

    // Phase 1
    results.push(await checkStrategy('Count to Calm', ['countDisplay', 'Count slowly']));
    results.push(await checkStrategy('Comfort Object', ['🧸', 'Hug your favorite']));
    results.push(await checkStrategy('Drink Water', ['waterFill', 'Tap to fill']));

    // Phase 2
    results.push(await checkStrategy('Happy Journal', ['😊', '😂', 'placeholder="Type here..."']));
    results.push(await checkStrategy('Gratitude', ['gratitudePerson', 'gratitudeThing', 'gratitudePlace', 'gratitudeGarden']));
    results.push(await checkStrategy('Talk to Someone', ['script-card', 'I feel sad because...', 'Can you just listen?']));
    results.push(await checkStrategy('Take a Walk', ['strategyTimer', '🚶']));
    results.push(await checkStrategy('Energy Shake', ['shakeIcon', 'shakeTitle', 'Arm Shake!']));
    results.push(await checkStrategy('Fresh Air', ['strategyTimer', 'Open a window']));
    results.push(await checkStrategy('Mindful Moment', ['breathing-circle', 'Focus on your breath']));

    const passed = results.filter(r => r).length;
    console.log(`\nResults: ${passed}/${results.length} Passed.`);

    if (passed === results.length) {
        console.log("🎉 ALL STRATEGIES VERIFIED LOCALLY.");
    } else {
        console.error("⚠️ SOME STRATEGIES FAILED.");
        process.exit(1);
    }
}

// Mock UI object
global.UI = {
    goToScreen: (id, type) => console.log(`Navigated to ${id} with ${type}`)
};

run();
