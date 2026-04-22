const users = [
  { id: "usr_1", name: "Ava Patel", email: "ava@example.com", balance: 2450.5 },
  { id: "usr_2", name: "Marcus Chen", email: "marcus@example.com", balance: 1325.25 },
  { id: "usr_3", name: "Jordan Smith", email: "jordan@example.com", balance: 860.0 }
];

const transactions = [
  {
    id: "txn_1001",
    senderId: "usr_1",
    receiverId: "usr_2",
    amount: 75.0,
    currency: "USD",
    status: "completed",
    fraudFlag: false,
    failureReason: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: "txn_1002",
    senderId: "usr_2",
    receiverId: "usr_3",
    amount: 1250.0,
    currency: "USD",
    status: "pending",
    fraudFlag: true,
    failureReason: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  }
];

export function getUsers() {
  return users;
}

export function getUserById(userId) {
  return users.find((user) => user.id === userId);
}

export function getTransactions() {
  return transactions
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addTransaction(transaction) {
  transactions.unshift(transaction);
  return transaction;
}

export function updateTransaction(transactionId, updates) {
  const transaction = transactions.find((item) => item.id === transactionId);
  if (!transaction) {
    return null;
  }

  Object.assign(transaction, updates, { updatedAt: new Date().toISOString() });
  return transaction;
}

export function updateUserBalance(userId, nextBalance) {
  const user = users.find((item) => item.id === userId);
  if (!user) {
    return null;
  }

  user.balance = Number(nextBalance.toFixed(2));
  return user;
}
