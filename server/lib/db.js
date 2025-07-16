import mongoose from "mongoose";

// Function to connect mongodb database
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
    });
    await mongoose.connect(`${process.env.MONGO_URI}/wassup`);
  } catch (error) {
    console.log(error);
  }
};
