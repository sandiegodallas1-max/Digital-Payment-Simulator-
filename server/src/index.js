import cors from "cors";
import express from "express";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Payment simulator API running on port ${PORT}`);
});
