import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const testSchema = new mongoose.Schema({ name: String, createdAt: Date });
const TestModel = mongoose.model('ConnectionTest', testSchema);

async function testDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Testing write operation...");
    const doc = await TestModel.create({ name: "Write Test", createdAt: new Date() });
    console.log(`Write successful! Document ID: ${doc._id}`);

    console.log("Testing read operation...");
    const foundDoc = await TestModel.findById(doc._id);
    console.log(`Read successful! Found document with name: ${foundDoc.name}`);

    console.log("Testing delete operation...");
    await TestModel.findByIdAndDelete(doc._id);
    console.log("Delete successful!");

    console.log("All operations performed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database operation failed:", error);
    process.exit(1);
  }
}

testDatabase();
