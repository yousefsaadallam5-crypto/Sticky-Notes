import mongoose from "mongoose"

const connectDB = async () =>{
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stickyNotes"
  try {
    await mongoose.connect(uri)
    console.log("DB connected successfully")
  } catch (error) {
    console.error("DB connection failed:", error.message)
  }
}

export default connectDB
