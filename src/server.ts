import "dotenv/config";
import express from "express";

import transactionRoutes from "./routes/transactionRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", transactionRoutes);

app.get("/healthcheck", (req, res) => {
    res.json({success: true, message: "DynamoDB Balance Service API is running"});
});

app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});