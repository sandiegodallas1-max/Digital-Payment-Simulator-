import express from "express";
import {
  createTransfer,
  listDashboardData,
  resolvePendingTransaction
} from "../services/paymentService.js";

const router = express.Router();

router.get("/dashboard", (_request, response) => {
  response.json(listDashboardData());
});

router.post("/transactions", (request, response) => {
  const result = createTransfer(request.body);
  if (result.error) {
    return response.status(result.statusCode).json({ error: result.error });
  }

  return response.status(201).json(result);
});

router.patch("/transactions/:transactionId", (request, response) => {
  const result = resolvePendingTransaction(
    request.params.transactionId,
    request.body.status
  );

  if (result.error) {
    return response.status(result.statusCode).json({ error: result.error });
  }

  return response.json(result);
});

export default router;
