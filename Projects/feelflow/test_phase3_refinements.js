// test_phase3_refinements.js (No JSDOM)
const fs = require('fs');
const vm = require('vm');

const js = fs.readFileSync('js/app.js', 'utf8');
// const uiJs = fs.readFileSync('js/ui.js', 'utf8'); // Not loading UI JS to avoid complexity

// Mock DOM
const mockElements = {};
const createElement = (id) => {
    if (!mockElements[id]) {
        mockElements[id] = {
            id,
            value: '',
            style: {},
            classList: { add: () => { }, remove: () => { }, contains: () => false },
            innerHTML: '',
            textContent: '',
            querySelector: () => null,
            setAttribute: (k, v) => { },
            getAttribute: (k) => null,
            onclick: null
        };
    }
    return mockElements[id];
};

const dom = {
    getElementById: (id) => createElement(id),
    querySelector: (sel) => {
        if (sel === '#screen1 .section-title') return createElement('screen1_title');
        return null;
    },
    querySelectorAll: () => [],
    createElement: () => createElement('temp'),
    body: {
        appendChild: () => { },
        getAttribute: (attr) => mockElements['body'] ? mockElements['body'][attr] : null,
        setAttribute: (attr, val) => {
            if (!mockElements['body']) mockElements['body'] = {};
            mockElements['body'][attr] = val;
        }
    },
    addEventListener: () => { }
};

const windowMock = {
    document: dom,
    console: console,
    alert: (msg) => console.log("🚨 ALERT:", msg),
    localStorage: {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => storage[k] = v.toString(),
        removeItem: (k) => delete storage[k],
        clear: () => storage = {}
    },
    setTimeout: (fn) => fn(),
    location: { href: '' },
    Chart: class {
        constructor(ctx, config) {
            this.config = config;
            if (windowMock.Guardian) windowMock.Guardian.chartInstance = this;
        }
        destroy() { }
    },
    addEventListener: (event, callback) => { console.log(`[Mock] Added listener for ${event}`); }
};

let storage = {};
const context = vm.createContext(windowMock);

// Load Scripts
try {
    vm.runInContext("window = globalThis; window.UI = { goToScreen: (s) => { document.body.setAttribute('data-screen', s); } };", context);
    vm.runInContext(js, context);
} catch (e) {
    console.error("Script Execution Error:", e);
}

// Tests
console.log("🚀 Starting Phase 3 Refinements Test (No JSDOM)...");

const { document: doc } = context;
// Robust retrieval
const GuardianAuth = context.window && context.window.GuardianAuth ? context.window.GuardianAuth : context.GuardianAuth;
const Guardian = context.window && context.window.Guardian ? context.window.Guardian : context.Guardian;

if (!GuardianAuth || !Guardian) {
    console.error("❌ Failed to retrieve Guardian/GuardianAuth from context.");
    console.log("Context keys:", Object.keys(context));
    // console.log("Global keys:", Object.getOwnPropertyNames(context));
    process.exit(1);
}

// 1. Signup Relationship
doc.getElementById('signupName').value = "Test Mom";
doc.getElementById('signupPin').value = "1234";
doc.getElementById('signupRelationship').value = "Mom";

console.log("👉 Signing up...");
GuardianAuth.signup();

const profile = JSON.parse(storage['guardian_profile'] || '{}');
if (profile.relationship === 'Mom') {
    console.log("✅ Signup Relationship saved correctly.");
} else {
    console.error("❌ Signup Relationship failed:", profile);
}

// 2. Login & Dashboard Colors
console.log("👉 Logging in...");
doc.getElementById('loginPin').value = "1234";
GuardianAuth.login();

// 3. Legend HTML Check
console.log("👉 Checking Legend...");
Guardian.init();
const legend = doc.getElementById('guardianLegend');
if (legend.innerHTML.includes('Happy') && legend.innerHTML.includes('#FFD93D')) {
    console.log("✅ Legend rendered with correct colors.");
} else {
    console.error("❌ Legend rendering failed:", legend.innerHTML);
}

// 4. Chart Colors Check
console.log("👉 Checking Chart Colors...");
// Mock history
const history = [
    { emotion: 'Happy', intensity: 8, timestamp: new Date().toISOString() }
];
storage['feelflow_history'] = JSON.stringify(history);

Guardian.renderWeather('today');
const chart = Guardian.chartInstance;

if (chart) {
    const pointColors = chart.config.data.datasets[0].pointBackgroundColor;
    if (pointColors && pointColors[0] === '#FFD93D') {
        console.log("✅ Chart point colors mapped correctly (Happy -> #FFD93D).");
    } else {
        console.error("❌ Chart colors mismatch:", pointColors);
    }
} else {
    console.error("❌ Chart instance not found.");
}

// 5. Recent History Check
console.log("👉 Checking Recent History...");
Guardian.renderRecentHistory();
const recentContainer = doc.getElementById('guardianRecentHistory');
if (recentContainer.innerHTML.includes('Happy') && recentContainer.innerHTML.includes('Lv.8')) {
    console.log("✅ Recent History rendered correctly.");
} else {
    console.error("❌ Recent History rendering failed.");
}

console.log("🏁 Test Complete.");
