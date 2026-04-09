import { config } from "./config.js";
import mongoose from "mongoose";

export async function connectToDB() {
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to DB");
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}