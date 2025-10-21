import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb";

interface GetBalanceParams {
    userId: string;
}

export async function getBalance({userId}: GetBalanceParams) {
    try {
        const result = await docClient.send(
            new GetCommand({
                TableName: "wallets",
                Key: {
                    userId,
                },
            })
        );
        if(!result.Item) {
            const newwallet = {
                userId,
                balance: 0,
                updatedAt: new Date().toISOString(),
            }
            await docClient.send(
                new PutCommand({
                    TableName: "wallets",
                    Item: newwallet,
                    ConditionExpression: "attribute_not_exists(userId)", // avoid overwriting if race condition
                })
            );
        }
        return {
            userId,
            balance: result.Item?.balance ?? 0,
        }
    } catch(error: any) {
        if(error.name === "ConditionalCheckFailedException") {
            // retry once to handle race condition
            const retry = await docClient.send(
                new GetCommand({
                    TableName: "wallets",
                    Key: {
                        userId,
                    },
                })
            );
            return { userId, balance: retry.Item?.balance ?? 0 };
        } else {
            console.error("Error fetching or creating user balance:", error);
            throw new Error("Could not retrieve or initialize user balance");
        }
    }
}

