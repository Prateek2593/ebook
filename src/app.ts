import express from "express";
import globalErrorHannler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello APIs!" });
});

app.use("/api/users", userRouter);

// global error handler
app.use(globalErrorHannler);
export default app;
