// test_phase3_round2.js
const fs = require('fs');
const vm = require('vm');

const js = fs.readFileSync('js/app.js', 'utf8');

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
    querySelectorAll: () => ([createElement('tab1'), createElement('tab2')]),
    createElement: () => createElement('temp'),
    body: {
        getAttribute: () => null,
        setAttribute: () => { }
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
    addEventListener: () => { },
    Date: Date
};

let storage = {};
const context = vm.createContext(windowMock);

// Load App
try {
    vm.runInContext("window = globalThis; window.UI = { goToScreen: () => {} };", context);
    vm.runInContext(js, context);
} catch (e) {
    console.error("Script Execution Error:", e);
}

const { Guardian } = context;
console.log("🚀 Starting Round 2 Verification...");

// 1. Verify Goal Score Logic
console.log("👉 Testing Goal Score...");
// Mock 14 entries in last week -> 100% Score
const now = new Date();
const history = [];
for (let i = 0; i < 14; i++) {
    history.push({
        emotion: 'Happy',
        intensity: 5,
        timestamp: new Date(now.getTime() - i * 3600 * 1000).toISOString()
    });
}
storage['feelflow_history'] = JSON.stringify(history);

Guardian.loadGoal();
const badge = dom.getElementById('goalScoreBadge');
const banner = dom.getElementById('goalActionBanner');
const btnBook = dom.getElementById('btnBookNext');

if (badge.textContent.includes('100')) {
    console.log("✅ Goal Score calculated correctly (100%).");
} else {
    console.error("❌ Goal Score failed:", badge.textContent);
}

if (banner.style.display === 'block' && btnBook.style.display === 'inline-block') {
    console.log("✅ High Score: Banner & Book Button visible.");
} else {
    console.error("❌ High Score UI mismatch.");
}

// 2. Verify Recent History Photos
console.log("👉 Testing Recent History Photos...");
// Add photo to one entry
history[0].photo = 'data:image/png;base64,test';
storage['feelflow_history'] = JSON.stringify(history);

Guardian.renderRecentHistory();
const recentHTML = dom.getElementById('guardianRecentHistory').innerHTML;
if (recentHTML.includes('background:url(\'data:image/png;base64,test\')')) {
    console.log("✅ Photo thumbnail rendered correctly.");
} else {
    console.error("❌ Photo thumbnail missing.");
}

// 3. Verify Chart Modes (Today)
console.log("👉 Testing Chart Mode: Today...");
Guardian.renderWeather('today');
const chart = Guardian.chartInstance;
// Check X-Axis labels (2-hour intervals)
const xLabels = chart.config.data.labels;
if (xLabels.length === 9 && xLabels[0] === '6AM' && xLabels[8] === '10PM') {
    console.log("✅ Today Chart X-Axis correct (2h intervals).");
} else {
    console.error("❌ Today Chart X-Axis incorrect:", xLabels);
}

// 4. Verify Chart Modes (Weekly)
console.log("👉 Testing Chart Mode: Weekly...");
Guardian.renderWeather('weekly');
const chartWeekly = Guardian.chartInstance;
if (chartWeekly.config.type === 'bar' && chartWeekly.config.data.labels.length === 7) {
    console.log("✅ Weekly Chart correct (Bar type, 7 days).");
} else {
    console.error("❌ Weekly Chart failed.");
}

console.log("🏁 Verification Complete.");
