import mongoose from "mongoose";

const connectDb = async () =>{
    const DB_URI = process.env.DB_URI

    if(!DB_URI){
        throw new Error("Please define DB_URI in env file")
    }

    try {
        await mongoose.connect(DB_URI);

        console.log("Connected to DB")
    } catch (error) {
        console.error("Error connecting to DB", error)

        process.exit(1)
    }
}

export default connectDb;
