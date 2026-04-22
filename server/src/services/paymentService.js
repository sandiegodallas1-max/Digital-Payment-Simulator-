import {
  addTransaction,
  getTransactions,
  getUserById,
  updateTransaction,
  updateUserBalance
} from "../data/store.js";
import { evaluateFraudRisk } from "./fraudEngine.js";

function createTransactionId() {
  return `txn_${Date.now()}`;
}

export function listUsers() {
  return {
    users: [
      ...new Map(
        getTransactions()
          .flatMap((transaction) => [transaction.senderId, transaction.receiverId])
          .map((userId) => [userId, getUserById(userId)])
          .filter((entry) => entry[1])
      ).values()
    ]
  };
}

export function listDashboardData() {
  return {
    users: ["usr_1", "usr_2", "usr_3"].map((id) => getUserById(id)).filter(Boolean),
    transactions: getTransactions()
  };
}

export function createTransfer({ senderId, receiverId, amount, currency = "USD" }) {
  const sender = getUserById(senderId);
  const receiver = getUserById(receiverId);

  if (!sender || !receiver) {
    return { error: "Sender or receiver was not found.", statusCode: 404 };
  }

  if (senderId === receiverId) {
    return { error: "Sender and receiver must be different users.", statusCode: 400 };
  }

  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return { error: "Amount must be greater than zero.", statusCode: 400 };
  }

  if (sender.balance < normalizedAmount) {
    return { error: "Insufficient funds for this transfer.", statusCode: 400 };
  }

  const risk = evaluateFraudRisk({ senderId, amount: normalizedAmount });

  const transaction = addTransaction({
    id: createTransactionId(),
    senderId,
    receiverId,
    amount: Number(normalizedAmount.toFixed(2)),
    currency,
    status: "pending",
    fraudFlag: risk.flagged,
    failureReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (risk.autoFail) {
    return {
      transaction: updateTransaction(transaction.id, {
        status: "failed",
        failureReason: risk.reasons.join("; ")
      })
    };
  }

  if (risk.flagged) {
    return {
      transaction: updateTransaction(transaction.id, {
        status: "pending",
        failureReason: risk.reasons.join("; ")
      })
    };
  }

  updateUserBalance(sender.id, sender.balance - normalizedAmount);
  updateUserBalance(receiver.id, receiver.balance + normalizedAmount);

  return {
    transaction: updateTransaction(transaction.id, {
      status: "completed"
    })
  };
}

export function resolvePendingTransaction(transactionId, nextStatus) {
  const transaction = getTransactions().find((item) => item.id === transactionId);

  if (!transaction) {
    return { error: "Transaction not found.", statusCode: 404 };
  }

  if (transaction.status !== "pending") {
    return { error: "Only pending transactions can be resolved.", statusCode: 400 };
  }

  if (nextStatus === "completed") {
    const sender = getUserById(transaction.senderId);
    const receiver = getUserById(transaction.receiverId);

    if (!sender || !receiver) {
      return { error: "Related accounts could not be found.", statusCode: 404 };
    }

    if (sender.balance < transaction.amount) {
      return { error: "Sender no longer has enough balance.", statusCode: 400 };
    }

    updateUserBalance(sender.id, sender.balance - transaction.amount);
    updateUserBalance(receiver.id, receiver.balance + transaction.amount);
    return { transaction: updateTransaction(transaction.id, { status: "completed" }) };
  }

  return {
    transaction: updateTransaction(transaction.id, {
      status: "failed",
      failureReason: transaction.failureReason || "Rejected during manual review"
    })
  };
}
