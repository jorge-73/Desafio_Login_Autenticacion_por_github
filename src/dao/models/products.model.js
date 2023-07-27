import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productsCollection = "products";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnails: { type: [String], default: [] },
  code: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  status: { type: Boolean, default: true },
});

productSchema.plugin(mongoosePaginate);
mongoose.set("strictQuery", false);
export const productModel = mongoose.model(productsCollection, productSchema);
