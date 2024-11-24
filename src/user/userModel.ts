import mongoose from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<User>("User", userSchema);
