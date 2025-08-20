import mongoose from "mongoose";
const connectDB = async () => {
    try {
        console.log("Mongo URI:", process.env.MONGO_DB_URI);

        const conn=await mongoose.connect(process.env.MONGO_DB_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.log("Error in connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}
export default connectDB;