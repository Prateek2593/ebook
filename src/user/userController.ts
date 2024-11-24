import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  //Validation
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = createHttpError(400, "All required fields");
    return next(error);
  }

  //Database operations
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      const error = createHttpError(400, "Email already exists");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  //Hashing password
  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  try {
    //token generation
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    //Response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while generating token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  //Validation
  const { email, password } = req.body;
  if (!email || !password) {
    const error = createHttpError(400, "All required fields");
    return next(error);
  }

  //Database operations
  let user: User | null;
  try {
    user = await userModel.findOne({ email: email });
    if (!user) {
      const error = createHttpError(401, "Invalid email or password");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  //Password comparison
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = createHttpError(401, "Invalid email or password");
    return next(error);
  }

  try {
    //token generation
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    //Response
    res.json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while generating token"));
  }
};
export { createUser, loginUser };
