const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "FeelFlowData";

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { userId, emotion, intensity, afterIntensity, triggers, note, notes, photo, activityData, timestamp } = body;

        if (!userId || !emotion) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        const item = {
            PK: `USER#${userId}`,
            SK: `ENTRY#${timestamp || new Date().toISOString()}`,
            emotion,
            intensity,
            afterIntensity, // 🆕 Re-measurement
            triggers: triggers || [], // 🆕 Trigger Tags
            notes: note || notes, // 💡 Handle both (Frontend uses 'note')
            photo,
            activityData,
            timestamp: timestamp || new Date().toISOString(), // Save the client timestamp!
            createdAt: new Date().toISOString() // Keep server time for audit
        };

        await dynamo.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Entry saved", item })
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
