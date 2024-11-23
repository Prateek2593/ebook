import mongoose from "mongoose";
import { config } from "./config";

// Connect to MongoDB
const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected',()=>{
            console.log("Connected to MongoDB");
        })

        mongoose.connection.on('error',(error)=>{
            console.error("MongoDB connection error:",error);
        })
        await mongoose.connect(config.databaseUrl as string);

        
    } catch (error) {
        console.error("Failed to connect to MongoDB",error);
        process.exit(1);
    }
}

export default connectDB;