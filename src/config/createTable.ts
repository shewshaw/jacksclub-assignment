import { 
    CreateTableCommand,
    DynamoDBClient

 } from "@aws-sdk/client-dynamodb";

 const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
 });

 async function createTables() {
    try {
        // create user_wallets table
        const createWalletsTable = new CreateTableCommand({
            TableName: "wallets",
            KeySchema: [{AttributeName: "userId", KeyType: "HASH"}],
            AttributeDefinitions: [{AttributeName: "userId", AttributeType: "S"}],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        });
        await client.send(createWalletsTable);
        console.log("Wallets table created");

        // create user_transactions table
        const createTransactionsTable = new CreateTableCommand({
            TableName: "transactions",
            KeySchema: [{AttributeName: "idempotentKey", KeyType: "HASH"}],
            AttributeDefinitions: [{AttributeName: "idempotentKey", AttributeType: "S"}],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        });
        await client.send(createTransactionsTable);
        console.log("Transactions table created");

    } catch(error: any) {
        if(error.name === "ResourceInUseException") {
            console.log("Table already exists");
        } else {
            console.error("Error creating tables:", error);
        }
    }
 }

 createTables();