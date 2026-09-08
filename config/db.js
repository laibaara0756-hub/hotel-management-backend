import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected!!");
    } catch (e) {
        console.log("Connection failed due to " + e);
        process.exit(1);
    }
};

export default connectDB;