import express from "express";
import {
  createBook,
  deleteBook,
  getSingleBook,
  listBooks,
  updateBook,
} from "./bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();
// Creating a new router instance for handling book-related routes.

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  // Configuring Multer to store uploaded files in the specified directory.
  limits: { fileSize: 3e7 },
  // Setting a file size limit for uploads (30 MB in this case).
});

bookRouter.post(
  "/",
  authenticate,
  // Applying the `authenticate` middleware to ensure the user is authenticated.
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    // Defining a field for uploading a single cover image.
    { name: "file", maxCount: 1 },
    // Defining a field for uploading a single file (e.g., book content or document).
  ]),
  createBook
  // Attaching the `createBook` controller to handle the creation of a new book.
);

bookRouter.post(
  "/:bookId",
  authenticate,
  // Applying the `authenticate` middleware to ensure the user is authenticated.
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    // Defining a field for uploading a new cover image during updates.
    { name: "file", maxCount: 1 },
    // Defining a field for uploading a new file during updates.
  ]),
  updateBook
  // Attaching the `updateBook` controller to handle updating an existing book's details.
);

bookRouter.get("/", listBooks);

bookRouter.get("/:bookId", getSingleBook);

bookRouter.delete("/:bookId", authenticate, deleteBook);
export default bookRouter;
// Exporting the router so it can be used in other parts of the application.
