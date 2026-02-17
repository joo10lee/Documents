const https = require('https');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { history } = body;

        if (!process.env.GEMINI_API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: "API Key not configured" }) };
        }

        // 1. Construct Prompt
        const historyText = history.map(h =>
            `- ${h.timestamp}: ${h.emotion} (Intensity: ${h.intensity})`
        ).join("\n");

        const prompt = `
You are an empathetic child psychologist assistant for PARENTS using the "FeelFlow" app.
Analyze the following recent emotion history of their child:
${historyText}

Provide a short, 1-sentence insight for the PARENT about their child's emotional state.
Examples: "Jason seems very happy lately!", "Jason has been a bit anxious, maybe check in?", "Overall stable, but keep an eye on Tuesday."
Do NOT address the child. Address the parent.
Keep it warm, professional but accessible.
`;

        // 2. Call Gemini API
        const data = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let chunks = [];
                res.on('data', (d) => chunks.push(d));
                res.on('end', () => resolve(Buffer.concat(chunks).toString()));
            });
            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });

        const result = JSON.parse(response);
        const insight = result.candidates?.[0]?.content?.parts?.[0]?.text || "Keep up the great work!";

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ insight })
        };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
