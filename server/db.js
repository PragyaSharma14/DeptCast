import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn("MONGODB_URI is not set. Skipping DB connection.");
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
