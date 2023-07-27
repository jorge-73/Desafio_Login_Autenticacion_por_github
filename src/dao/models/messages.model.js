import mongoose from "mongoose";

const messagesCollection = "messages";

const messageSchema = mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
});

mongoose.set("strictQuery", false);
const messageModel = mongoose.model(messagesCollection, messageSchema);

export default messageModel;