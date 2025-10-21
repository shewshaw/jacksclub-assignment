import { Router, Request, Response } from "express";
import { makeTransaction } from "../functions/transact";
import { getBalance } from "../functions/getBalance";

const router = Router();

/**
 * GET /getBalance?userId=1
 */
router.get("/getBalance", async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if(!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid userId" });
        }
        // Assuming that the `getBalance` function is called only for registered users.
        // In our current implementation, getBalance will auto-create a user wallet if it does not exist.
        const result = await getBalance({ userId });
        res.json({
            success: true,
            result,
        });
    } catch(error: any) {
        console.error("Error in /getBalance:", error);
        res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
});

/**
 * POST /create-transaction
 * Body:
 * {
 *   "idempotentKey": "1",
 *   "userId": "1",
 *   "amount": 10,
 *   "type": "credit"
 * }
 */
router.post("/create-transaction", async (req: Request, res: Response) => {
    try {
        const { idempotentKey, userId, amount, type } = req.body;
        if(!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }
        if(!idempotentKey || !userId || !type) { 
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Assuming that the `getBalance` function is called only for registered users.
        // In our current implementation, getBalance will auto-create a user wallet if it does not exist.
        // Therefore, by calling it here, we ensure the user wallet exists before creating a transaction.
        await getBalance({ userId });
        // create transaction
        const result = await makeTransaction({ idempotentKey, userId, amount, type });
        res.json(result);
    } catch(error: any) {
        console.error("Error in /create-transaction:", error);
        res.status(500).json({ success: false, error: error.message || "Transaction failed" });
    }
});

export default router;
