# JacksClub Assignment - DynamoDB Balance Service

A simple wallet service built with Node.js, Express, and AWS DynamoDB for managing user balances and transactions.

## Prerequisites

- Node.js (v16 or higher)
- AWS DynamoDB Local (running on localhost:8000) OR Docker & Docker Compose

## Setup

### Option 1: Using Docker Compose (Recommended)

1. Install dependencies:
```bash
npm install
```

2. Start DynamoDB Local using Docker Compose:
```bash
docker-compose up -d
```

### Option 2: Manual DynamoDB Local Setup

1. Install dependencies:
```bash
npm install
```

2. Start DynamoDB Local on port 8000 manually

3. Create tables (run once):
```bash
npx ts-node src/config/createTable.ts
```

4. Create .env file with the following:

```
NODE_ENV=development
AWS_REGION=ap-south-1
PORT=3000
DYNAMODB_ENDPOINT=http://localhost:8000
```

5. Start the server:
```bash
npm run start
```
or
```bash
npx ts-node src/server.ts
```

## Docker Commands

- Start DynamoDB Local: `docker-compose up -d`
- Stop DynamoDB Local: `docker-compose down`
- View logs: `docker-compose logs -f dynamodb`

Server runs on `http://localhost:3000`

## APIs

### 1. Get Balance
**GET** `/api/getBalance?userId=1`

**Response:**
```json
{
  "success": true,
  "result": {
    "userId": "1",
    "balance": 100
  }
}
```

### 2. Create Transaction
**POST** `/api/create-transaction`

**Request Body:**
```json
{
  "idempotentKey": "unique-key-123",
  "userId": "1",
  "amount": 50,
  "type": "credit"
}
```

**Response:**
```json
{
  "result": {
    "success": true,
    "message": "credit of 50 processed successfully."
  }
}
```

## Testing Examples

### Credit Transaction
```bash
curl -X POST "http://localhost:3000/api/create-transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "idempotentKey": "credit-001",
    "userId": "1",
    "amount": 100,
    "type": "credit"
  }'
```

### Debit Transaction
```bash
curl -X POST "http://localhost:3000/api/create-transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "idempotentKey": "debit-001",
    "userId": "1",
    "amount": 25,
    "type": "debit"
  }'
```

### Get Balance
```bash
curl "http://localhost:3000/api/getBalance?userId=1"
```

## Notes

- `idempotentKey` must be unique for each transaction to prevent duplicates
- Debit transactions will fail if insufficient balance
- `type` must be either "credit" or "debit"
- `amount` must be greater than 0
