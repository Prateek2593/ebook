import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  // Extract the title and genre from the request body
  const { title, genre } = req.body;

  // Extract the uploaded files from the request (typed as Multer files)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Get the MIME type of the cover image and extract the file extension
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);

  // Get the filename of the uploaded cover image
  const filename = files.coverImage[0].filename;

  // Construct the full file path for the uploaded cover image
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads", // Directory where the file was temporarily stored
    filename
  );

  try {
    // Upload the cover image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename, // Keep the original file name
      folder: "book-covers", // Specify the folder in Cloudinary for book covers
      format: coverImageMimeType, // Convert the file to the appropriate format
    });

    // Get the filename of the book file (e.g., a PDF file)
    const bookFileName = files.file[0].filename;

    // Construct the full file path for the uploaded book file
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads", // Directory where the book file was temporarily stored
      bookFileName
    );

    // Upload the book file to Cloudinary
    const uploadBookResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw", // Indicate this is a non-image file
      filename_override: bookFileName, // Keep the original file name
      folder: "book-files", // Specify the folder in Cloudinary for book files
      format: "pdf", // Ensure the file is uploaded as a PDF
    });

    // Cast the request to include user authentication information
    const _req = req as AuthRequest;

    // Create a new book entry in the database with the uploaded file URLs
    const newBook = await bookModel.create({
      title, // Book title
      genre, // Book genre
      author: _req.userId, // ID of the logged-in user (author of the book)
      coverImage: uploadResult.secure_url, // URL of the uploaded cover image
      file: uploadBookResult.secure_url, // URL of the uploaded book file
    });

    // Delete the temporary files from the server after successful upload
    try {
      await fs.promises.unlink(filePath); // Remove the cover image file
      await fs.promises.unlink(bookFilePath); // Remove the book file
    } catch (error) {
      // Handle errors in deleting temporary files
      return next(createHttpError(500, "Error in deleting temporary files"));
    }

    // Respond with the ID of the newly created book
    res.status(201).json({ id: newBook._id });
  } catch (error) {
    // Handle errors that occur during the upload or database operations
    return next(createHttpError(500, "Error while uploading"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  // Extract fields from the request body
  const { title, description, genre } = req.body;

  // Extract the book ID from the request parameters
  const bookId = req.params.bookId;

  // Find the book in the database by its ID
  const book = await bookModel.findOne({ _id: bookId });

  // If the book is not found, return a 404 error
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // Check if the logged-in user is the author of the book
  const _req = req as AuthRequest; // Cast the request to include user information
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }

  // Extract uploaded files from the request (if any)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Initialize a variable to hold the updated cover image URL
  let completeCoverImage = "";

  // If a new cover image is provided, process it
  if (files.coverImage) {
    const filename = files.coverImage[0].filename; // Get the uploaded file's name
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1); // Extract the file type
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    ); // Construct the file path

    // Upload the new cover image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename, // Keep the original filename
      folder: "book-covers", // Cloudinary folder for book covers
      format: converMimeType, // Convert the file to its detected format
    });

    // Store the URL of the uploaded image
    completeCoverImage = uploadResult.secure_url;

    // Delete the temporary file from the server
    await fs.promises.unlink(filePath);
  }

  // Initialize a variable to hold the updated book file URL
  let completeFileName = "";

  // If a new book file is provided, process it
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    ); // File path
    const bookFileName = files.file[0].filename; // Uploaded book filename

    // Upload the new book file to Cloudinary
    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw", // Indicates a non-image file
      filename_override: bookFileName, // Keep the original filename
      folder: "book-pdfs", // Cloudinary folder for book files
      format: "pdf", // Ensure the file is in PDF format
    });

    // Store the URL of the uploaded book file
    completeFileName = uploadResultPdf.secure_url;

    // Delete the temporary file from the server
    await fs.promises.unlink(bookFilePath);
  }

  // Update the book in the database with new details
  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId, // Match the book ID
    },
    {
      title: title, // Update title
      description: description, // Update description
      genre: genre, // Update genre
      // Use new cover image URL if provided; otherwise, keep the old one
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      // Use new file URL if provided; otherwise, keep the old one
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true } // Return the updated document
  );

  // Send the updated book as the response
  res.json(updatedBook);
};

export { createBook, updateBook };
