const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "FeelFlowData";

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const userId = event.queryStringParameters?.userId;

        if (!userId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
        }

        const PK = `USER#${userId}`;
        const SK = `GOALS`;

        if (method === 'POST') {
            const body = JSON.parse(event.body);
            const { goals } = body;

            if (!goals) {
                return { statusCode: 400, body: JSON.stringify({ error: "Missing goals data" }) };
            }

            await dynamo.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK,
                    SK,
                    goals,
                    updatedAt: new Date().toISOString()
                }
            }));

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ message: "Goals synchronized" })
            };
        } else if (method === 'GET') {
            const result = await dynamo.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK, SK }
            }));

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result.Item?.goals || null)
            };
        }

        return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
