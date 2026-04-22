import { getTransactions } from "../data/store.js";

export function evaluateFraudRisk({ senderId, amount }) {
  const recentSenderTransactions = getTransactions().filter((transaction) => {
    const isSameSender = transaction.senderId === senderId;
    const happenedRecently =
      Date.now() - new Date(transaction.createdAt).getTime() < 1000 * 60 * 2;
    return isSameSender && happenedRecently;
  });

  const rapidTransferSpike = recentSenderTransactions.length >= 3;
  const highAmount = amount > 1000;
  const extremeAmount = amount >= 2000;

  return {
    flagged: highAmount || rapidTransferSpike,
    autoFail: extremeAmount,
    reasons: [
      ...(highAmount ? ["Amount exceeds review threshold"] : []),
      ...(rapidTransferSpike ? ["Multiple rapid transfers detected"] : []),
      ...(extremeAmount ? ["Amount exceeds auto-fail limit"] : [])
    ]
  };
}
