import { TransactWriteCommand  } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/dynamodb";

interface TransactParams {
    idempotentKey: string;
    userId: string;
    amount: number;
    type: "credit" | "debit";
}

export async function makeTransaction({idempotentKey, userId, amount, type}: TransactParams) {
    // validate input
    if(amount <= 0) {
        throw new Error("Amount must be greater than 0");
    }

    // define signed amount based on type credit or debit
    const signedAmount = type === "credit" ? amount : -amount;

    try {
        const transactItems: any[] = [
            {
                // (A) Insert transaction record (for idempotency)
                Put: {
                    TableName: "transactions",
                    Item: {
                        idempotentKey,
                        userId,
                        amount,
                        type,
                        createdAt: new Date().toISOString(),
                    },
                    ConditionExpression: "attribute_not_exists(idempotentKey)",
                },
            }
        ];

        // For debit transactions, we need to check balance first
        if (type === "debit") {
            transactItems.push({
                Update: {
                    TableName: "wallets",
                    Key: {userId},
                    UpdateExpression: "SET balance = balance + :amt, updatedAt = :now",
                    ExpressionAttributeValues: {
                        ":amt": signedAmount,
                        ":now": new Date().toISOString(),
                        ":amount": amount,
                    },
                    ConditionExpression: "attribute_exists(userId) AND balance >= :amount",
                    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
                }
            });
        } else {
            // For credit transactions, just update balance
            transactItems.push({
                Update: {
                    TableName: "wallets",
                    Key: {userId},
                    UpdateExpression: "SET balance = balance + :amt, updatedAt = :now",
                    ExpressionAttributeValues: {
                        ":amt": signedAmount,
                        ":now": new Date().toISOString(),
                    },
                    ConditionExpression: "attribute_exists(userId)",
                    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
                }
            });
        }

        const command = new TransactWriteCommand({
            TransactItems: transactItems
        });
        await docClient.send(command);
        return {
            success: true,
            message: `${type} of ${amount} processed successfully.`
        }
        
    } catch(error: any) {
        console.error("Transaction failed:", error);
        // handle specific errors
        if(error.name === "TransactionCanceledException") {
            const reasons = error.CancellationReasons || [];
            if(reasons.some((r: any) => r.Code === "ConditionalCheckFailed" && !r.Item)) {
                return {
                    success: false,
                    message: "Duplicate transaction ignored (idempotent)."
                }
            }

            // Negative balance attempt
            if (reasons.some((r: any) => r.Code === "ConditionalCheckFailed")) {
                throw new Error("Insufficient balance for debit.");
            }
        }
        console.error("Transaction failed:", error);
        throw new Error("Transaction failed.");
    }
}