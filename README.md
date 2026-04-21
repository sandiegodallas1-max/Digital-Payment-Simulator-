# Digital Payment Simulator

A full-stack payment processing simulator that models how money transfers move through a transaction lifecycle: `pending`, `completed`, and `failed`.

This project is designed as a portfolio piece for fintech and payment-processing roles. It demonstrates core backend ideas behind products like PayPal, Cash App, and merchant payment platforms, including transfer validation, fraud review, status transitions, and balance updates.

## Features

- Send money between mock users
- Track transaction history
- Support explicit status changes: `pending`, `completed`, `failed`
- Flag suspicious transfers with mock fraud rules
- Approve or reject flagged transactions from a fraud review queue
- Update account balances when transfers settle

## Why This Project Stands Out

- It maps directly to real payment-processing concepts instead of basic CRUD only
- It shows understanding of transaction lifecycle and settlement timing
- It separates frontend, backend, and database concerns
- It gives you strong talking points for fintech interviews

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database target: PostgreSQL
- Current persistence: in-memory store for easy local demo setup

## How It Works

1. A sender selects a recipient and submits a transfer amount.
2. The backend creates the transaction with an initial `pending` state.
3. Fraud logic evaluates the transfer.
4. The transaction is either:
   - completed immediately
   - kept pending for manual review
   - failed automatically
5. The UI updates balances, queue state, and transaction history.

## Fraud Rules In This MVP

- Transfers over `1000` are flagged for review
- Rapid back-to-back transfers from the same sender can be flagged
- Transfers of `2000` or more fail automatically

These rules are intentionally simple so the behavior is easy to explain and extend.

## Project Structure

```text
client/    React UI
server/    Express API and payment engine
database/  PostgreSQL schema for the next version
```

## Local Setup

Install Node.js 20+ first.

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Open the app at:

```text
http://localhost:5173
```

Backend runs at:

```text
http://localhost:4000
```

## Demo Scenarios

- Send `75` from one user to another to test a normal completed payment
- Send `1250` to trigger a fraud flag and move the transaction into the review queue
- Send `2000` to trigger an automatic failed transaction
- Approve or reject pending transactions and watch balances update

## Interview Talking Points

- Why payment systems should use explicit transaction states
- Why balances should only change after successful completion
- How fraud review can interrupt the normal settlement path
- Why idempotency, ledgers, and auditability matter in real payment systems

## Future Improvements

- Replace in-memory data with PostgreSQL
- Add authentication and per-user dashboards
- Add idempotency keys for duplicate-submission protection
- Add automated tests for fraud and status transitions
- Add webhook or queue-based async processing
