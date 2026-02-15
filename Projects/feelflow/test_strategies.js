
// Mock document and window
const document = {
    getElementById: (id) => ({
        className: '',
        innerHTML: ''
    })
};

// Paste Activities logic here (simplified for testing)
const Activities = {
    renderStrategies(emotionName, intensity) {
        const name = emotionName ? emotionName.toString().trim().toLowerCase() : "";
        const level = parseInt(intensity) || 5;
        console.log(`🧠 [STRATEGY DEBUG] Input Name: "${emotionName}", Parsed: "${name}", Level: ${level}`);

        let quests = [];

        // Logic from activities.js
        if (name.includes('happy') || name.includes('😊')) {
            console.log("Matched: HAPPY");
        }
        else if (name.includes('sad') || name.includes('😢')) {
            console.log("Matched: SAD");
        }
        else if (name.includes('anxious') || name.includes('😰')) {
            console.log("Matched: ANXIOUS");
        }
        else if (name.includes('angry') || name.includes('😠')) {
            console.log("Matched: ANGRY");
        }
        else if (name.includes('calm') || name.includes('😌')) {
            console.log("Matched: CALM");
        }
        else if (name.includes('tired') || name.includes('😫')) {
            console.log("Matched: TIRED");
        }
        else {
            console.log("Matched: DEFAULT");
        }
    }
};

// Test Cases
console.log("--- Testing Happy ---");
Activities.renderStrategies('Happy', 5);
Activities.renderStrategies('😊', 5);

console.log("\n--- Testing Sad ---");
Activities.renderStrategies('Sad', 5);
Activities.renderStrategies('😢', 5);
Activities.renderStrategies(' Sad ', 5);

console.log("\n--- Testing Anxious ---");
Activities.renderStrategies('Anxious', 5);
Activities.renderStrategies('😰', 5);

console.log("\n--- Testing Angry ---");
Activities.renderStrategies('Angry', 5);
Activities.renderStrategies('😠', 5);

console.log("\n--- Testing Calm ---");
Activities.renderStrategies('Calm', 5);
Activities.renderStrategies('😌', 5);

console.log("\n--- Testing Tired ---");
Activities.renderStrategies('Tired', 5);
Activities.renderStrategies('😫', 5);
