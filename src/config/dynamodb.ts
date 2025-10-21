import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

export const docClient = DynamoDBDocumentClient.from(client);