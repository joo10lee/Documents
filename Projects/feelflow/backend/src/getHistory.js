const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "FeelFlowData";

exports.handler = async (event) => {
    try {
        const userId = event.queryStringParameters?.userId;
        const limit = event.queryStringParameters?.limit || 15;

        if (!userId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
        }

        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
                ":sk": "ENTRY#"
            },
            Limit: parseInt(limit),
            ScanIndexForward: false // Newest first
        };

        const result = await dynamo.send(new QueryCommand(params));

        // Transform back to frontend format if needed
        const history = (result.Items || []).map(item => ({
            timestamp: item.timestamp || item.createdAt,
            emotion: item.emotion,
            intensity: item.intensity,
            afterIntensity: item.afterIntensity, // 🆕 Expose rich data
            triggers: item.triggers,             // 🆕 Expose rich data
            notes: item.notes,
            photo: item.photo,                   // 🆕 Expose rich data
            activityData: item.activityData      // 🆕 Expose rich data
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(history)
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
