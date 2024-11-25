import { NextFunction, Request, Response } from "express";
// Importing types from Express to define request, response, and middleware functions.

import createHttpError from "http-errors";
// Importing a utility to create HTTP error objects with standardized error messages.

import userModel from "./userModel";
// Importing the user model to interact with the database.

import bcrypt from "bcrypt";
// Importing bcrypt for hashing and verifying passwords.

import { sign } from "jsonwebtoken";
// Importing the `sign` function from `jsonwebtoken` to generate JWT tokens.

import { config } from "../config/config";
// Importing application configuration, such as the JWT secret.

import { User } from "./userTypes";
// Importing the `User` type to enforce type safety for user-related objects.

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // Controller to handle user registration.

  // Validation
  const { name, email, password } = req.body;
  // Extracting name, email, and password from the request body.

  if (!name || !email || !password) {
    // Checking if any required fields are missing.
    const error = createHttpError(400, "All required fields");
    // Creating a 400 Bad Request error if validation fails.
    return next(error);
    // Passing the error to the error-handling middleware.
  }

  // Database operations
  try {
    const user = await userModel.findOne({ email: email });
    // Checking if a user with the given email already exists.

    if (user) {
      // If the email is already registered, return an error.
      const error = createHttpError(400, "Email already exists");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
    // Returning a 500 Internal Server Error if the database query fails.
  }

  // Hashing password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Hashing the user's password using bcrypt with a salt of 10 rounds.

  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    // Creating a new user in the database with the hashed password.
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
    // Returning a 500 Internal Server Error if the user creation fails.
  }

  try {
    // Token generation
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    // Generating a JWT token with the user's ID (`sub` claims the subject) and a 7-day expiration.

    // Response
    res.status(201).json({ accessToken: token });
    // Returning the generated token in the response with a 201 Created status.
  } catch (error) {
    return next(createHttpError(500, "Error while generating token"));
    // Returning a 500 Internal Server Error if token generation fails.
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  // Controller to handle user login.

  // Validation
  const { email, password } = req.body;
  // Extracting email and password from the request body.

  if (!email || !password) {
    // Checking if any required fields are missing.
    const error = createHttpError(400, "All required fields");
    return next(error);
  }

  // Database operations
  let user: User | null;
  try {
    user = await userModel.findOne({ email: email });
    // Retrieving the user from the database by email.

    if (!user) {
      // If the user does not exist, return an error.
      const error = createHttpError(401, "Invalid email or password");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
    // Returning a 500 Internal Server Error if the database query fails.
  }

  // Password comparison
  const isMatch = await bcrypt.compare(password, user.password);
  // Comparing the provided password with the stored hashed password.

  if (!isMatch) {
    // If the passwords do not match, return an error.
    const error = createHttpError(401, "Invalid email or password");
    return next(error);
  }

  try {
    // Token generation
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    // Generating a JWT token with the user's ID and a 7-day expiration.

    // Response
    res.json({ accessToken: token });
    // Returning the generated token in the response.
  } catch (error) {
    return next(createHttpError(500, "Error while generating token"));
    // Returning a 500 Internal Server Error if token generation fails.
  }
};

export { createUser, loginUser };
// Exporting the `createUser` and `loginUser` functions for use in routes.
