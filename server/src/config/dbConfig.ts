import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = "mongodb+srv://sydneyiqbal52:Mapiqbal18%40@cluster0.lfstj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(`MongoDB connection error: ${error}`);
    }
}

export default mongoose;