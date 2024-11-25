import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Authorization token is required"));
  }

  const parsedToken = token.split(" ")[1];

  // Validate token and retrieve user details from database
  try {
    const decodedToken = verify(parsedToken, config.jwtSecret as string);
    // console.log("Decoded token: ", decodedToken);
    const _req = req as AuthRequest;
    _req.userId = decodedToken.sub as string;
    next();
  } catch (error) {
    return next(createHttpError(401, "Token expired"));
  }
};

export default authenticate;
