import mongoose from "mongoose";

// const MONGO_URI = "";

export async function setupTestDB() {
  await mongoose.connect("mongodb+srv://monaski:a3sDU6WUw4tTPKBA@cluster0.jumilbv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}

export async function teardownTestDB() {
  // Drop the entire test database
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}