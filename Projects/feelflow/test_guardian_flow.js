const fs = require('fs');
const vm = require('vm');
const path = require('path');

// 1. Setup Mock DOM & Environment
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const jsApp = fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8');
const jsUI = fs.readFileSync(path.join(__dirname, 'js/ui.js'), 'utf8');

const mockLocalStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
};

const mockWindow = {
    localStorage: mockLocalStorage,
    console: console,
    document: {
        getElementById: (id) => {
            console.log(`🔎 getElementById: ${id}`);
            const base = {
                value: '',
                style: {},
                classList: { add: () => { }, remove: () => { }, toggle: () => { }, contains: () => true },
                querySelector: () => ({ style: {} }),
                getContext: () => ({}),
                innerHTML: '',
                textContent: '',
                addEventListener: () => { }
            };

            if (id === 'loginPin') return { ...base, value: '1234' };
            if (id === 'signupName') return { ...base, value: 'TestParent' };
            if (id === 'signupPhone') return { ...base, value: '123' };
            if (id === 'signupPin') return { ...base, value: '1234' };
            if (id === 'childKeywords') return { ...base, value: '' };
            if (id === 'guardianGoalInput') return { ...base, value: '' };

            return base;
        },
        querySelector: (sel) => {
            console.log(`🔎 querySelector: ${sel}`);
            return {
                innerHTML: '',
                style: {},
                classList: { remove: () => { }, add: () => { } },
                addEventListener: () => { }
            };
        },
        querySelectorAll: (sel) => {
            console.log(`🔎 querySelectorAll: ${sel}`);
            return [];
        },
        createElement: () => ({ style: {}, classList: { add: () => { } }, innerHTML: '' }),
    },
    location: { href: '' },
    Chart: class MockChart {
        constructor(ctx, config) {
            console.log(`📊 Chart Created: Type=${config.type}, DataPoints=${config.data.datasets[0].data.length}`);
            this.destroy = () => console.log("📊 Chart Destroyed");
        }
    },
    addEventListener: (type, fn) => { console.log(`👂 Event Listener Added: ${type}`); },
    scrollTo: (x, y) => { console.log(`📜 Scrolled to ${x},${y}`); },
    UI: {
        goToScreen: (id) => console.log(`📱 Navigating to ${id}`),
        updateNavActive: () => { }
    },
    alert: (msg) => console.log(`🚨 Alert: ${msg}`)
};

// Global context
const context = vm.createContext({
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockLocalStorage,
    console: console,
    navigator: { vibrate: undefined }, // Fix for audio/haptic checks
    Chart: mockWindow.Chart,
    UI: mockWindow.UI,
    alert: mockWindow.alert,
    setTimeout: (fn) => fn(),
    setInterval: () => { },
    AudioContext: class { },
    webkitAudioContext: class { }
});

// Load Scripts
try {
    vm.runInContext(jsUI, context); // Load UI first
    vm.runInContext(jsApp, context); // Load App

    console.log("✅ Scripts Loaded Successfully");

    // Test 1: Signup
    console.log("\n🧪 Test 1: Guardian Signup");
    context.window.GuardianAuth.signup();
    const profile = JSON.parse(mockLocalStorage.getItem('guardian_profile'));
    if (profile && profile.name === 'TestParent') {
        console.log("✅ Signup Successful. Profile saved.");
    } else {
        console.error("❌ Signup Failed.");
    }

    // Test 2: Login
    console.log("\n🧪 Test 2: Guardian Login");
    // 💡 Override removed: The main mock already handles loginPin
    context.window.GuardianAuth.login();
    // 💡 Check if chartInstance exists (proof that Guardian.init() ran)
    if (context.window.Guardian.chartInstance) {
        console.log("✅ Login Successful. Chart Initialized.");
    } else {
        console.error("❌ Login Failed. Chart not initialized.");
    }

    // Test 3: Chart Rendering
    console.log("\n🧪 Test 3: Render Charts");
    // Seed some data
    mockLocalStorage.setItem('feelflow_history', JSON.stringify([
        { timestamp: new Date().toISOString(), intensity: 8, emotion: 'Happy' },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), intensity: 4, emotion: 'Sad' }
    ]));

    context.window.Guardian.renderWeather('today');
    context.window.Guardian.renderWeather('weekly');
    context.window.Guardian.renderWeather('monthly');

    // Test 4: AI Insight
    console.log("\n🧪 Test 4: AI Insight Generation");
    context.window.Guardian.generateAIInsight();
    // No crash means success for simple logic

} catch (e) {
    console.error("❌ Test Failed:", e);
}
