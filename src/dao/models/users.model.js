import mongoose from "mongoose";

const usersCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: false },
  password: { type: String, required: true },
  role: {type: String, default: "User"},
});

mongoose.set("strictQuery", false);
export const userModel = mongoose.model(usersCollection, userSchema);
