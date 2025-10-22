import mongoose from "mongoose";

export async function connectDB(uri: string) {
  try {
    
      await mongoose.connect(uri);
      console.log("connected to MongoDB");
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
};