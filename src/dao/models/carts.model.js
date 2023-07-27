import mongoose from "mongoose";

const cartsCollection = "carts";

const cartSchema = new mongoose.Schema({
  products: {
    type: [
      {
        _id: false,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: Number,
      },
    ],
    default: [],
  },
});

cartSchema.pre("findOne", function () {
  this.populate("products.product");
});

mongoose.set("strictQuery", false);
export const cartModel = mongoose.model(cartsCollection, cartSchema);
