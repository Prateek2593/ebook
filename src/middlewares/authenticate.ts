import { NextFunction, Request, Response } from "express";
// Importing types from Express for request, response, and next function handling.

import createHttpError from "http-errors";
// Importing a utility to create HTTP error objects with standardized error messages.

import { verify } from "jsonwebtoken";
// Importing the `verify` function from `jsonwebtoken` to validate and decode JWT tokens.

import { config } from "../config/config";
// Importing application configuration, such as the JWT secret, from the config module.

export interface AuthRequest extends Request {
  // Extending the default Express `Request` interface to include a `userId` property.
  userId: string;
  // Represents the authenticated user's ID, extracted from the token.
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Defining the `authenticate` middleware function for token-based authentication.

  const token = req.header("Authorization");
  // Retrieving the `Authorization` header from the incoming request.

  if (!token) {
    // Checking if the token is missing.
    return next(createHttpError(401, "Authorization token is required"));
    // Returning a 401 Unauthorized error if the token is not provided.
  }

  const parsedToken = token.split(" ")[1];
  // Extracting the actual token from the `Bearer <token>` format.

  // Validate token and retrieve user details from database
  try {
    // Wrapping token verification in a try-catch block to handle errors gracefully.

    const decodedToken = verify(parsedToken, config.jwtSecret as string);
    // Decoding and verifying the token using the JWT secret from the config.

    const _req = req as AuthRequest;
    // Casting the incoming request to the extended `AuthRequest` type.

    _req.userId = decodedToken.sub as string;
    // Extracting the `sub` (subject) field from the decoded token, which typically contains the user ID.

    next();
    // Passing control to the next middleware or route handler if the token is valid.
  } catch (error) {
    // Handling errors that occur during token verification.
    return next(createHttpError(401, "Token expired"));
    // Returning a 401 Unauthorized error if the token is invalid or expired.
  }
};

export default authenticate;
// Exporting the `authenticate` middleware for use in routes to enforce authentication.
