import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export async function setupTestDB() {
  await mongoose.connect(MONGO_URI);
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
