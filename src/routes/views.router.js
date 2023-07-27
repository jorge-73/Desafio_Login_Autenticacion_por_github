import { Router } from "express";
import { productModel } from "../dao/models/products.model.js";
import messageModel from "../dao/models/messages.model.js";
import { cartModel } from "../dao/models/carts.model.js";
import { userModel } from "../dao/models/users.model.js";
import {requireAuth} from "../utils.js"

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || "";
    const category = req.query.category || "";
    const availability = parseInt(req.query.stock) || "";

    let filter = {};
    // Aplicar filtro por categoría si se proporciona
    if (req.query.category) {
      filter = { category };
    }
    // Aplicar filtro por stock si se proporciona
    if (req.query.stock) {
      filter = { ...filter, stock: availability };
    }
    let sortOptions = {};
    // Aplicar ordenamiento si se proporciona sort
    if (sort === "asc") {
      sortOptions = { price: 1 };
    } else if (sort === "desc") {
      sortOptions = { price: -1 };
    }
    const options = {
      limit,
      page,
      sort: sortOptions,
      lean: true,
    };

     const sessionUser = await userModel.findById(req.session?.passport?.user).lean().exec();

    let sessionAdmin;
    if (sessionUser) {
     sessionAdmin = sessionUser?.role === "Admin" ? true : false; 
    }
    //console.log(sessionAdmin);

    const products = await productModel.paginate(filter, options);
    res.render("products", { products, sessionUser, sessionAdmin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/realTimeProducts", requireAuth, async (req, res) => {
  try {
    const allProducts = await productModel.find().lean().exec();
    res.render("realTimeProducts", { allProducts: allProducts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/chat", async (req, res) => {
  try {
    const messages = await messageModel.find().lean().exec();
    res.render("chat", { messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/product/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productModel.findById(pid).lean().exec();
    res.render("product", { product });
    if (product === null) {
      return res.status(404).json({ error: `The product does not exist` });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartModel.findById(cid).lean().exec();
    if (cart === null || cart.products.length === 0) {
      const emptyCart = "Cart Empty";
      req.app.get("socketio").emit("updatedCarts", cart.products);
      return res.render("carts", { emptyCart });
    }
    const carts = cart.products;
    req.app.get("socketio").emit("updatedCarts", carts);

    res.render("carts", { carts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

export default router;
