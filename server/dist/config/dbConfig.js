import mongoose from "mongoose";
export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI environment variable is not set");
    }
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.log(`MongoDB connection error: ${error}`);
    }
};
export default mongoose;
//# sourceMappingURL=dbConfig.js.map