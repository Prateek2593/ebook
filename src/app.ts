import express from "express";
import globalErrorHannler from "./middlewares/globalErrorHandler";

const app = express();

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello APIs!" });
});

// global error handler
app.use(globalErrorHannler);
export default app;
