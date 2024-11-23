import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import User from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  //Validation
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = createHttpError(400, "All required fields");
    return next(error);
  }

  //Database operations
  const user = await User.findOne({ email: email });
  if (user) {
    const error = createHttpError(400, "Email already exists");
    return next(error);
  }
  //Logic
  //Response
  res.json({ message: "user created" });
};

export { createUser };
