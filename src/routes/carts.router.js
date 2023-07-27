import { Router } from "express";
import { productModel } from "../dao/models/products.model.js";
import { cartModel } from "../dao/models/carts.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const cart = req.body;
    const addCart = await cartModel.create(cart);
    res.json({ status: "success", payload: addCart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productModel.findById(pid);
    if (!product) {
      return res.status(404).json({ error: "Invalid product" });
    }
    const cid = req.params.cid;
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Invalid cart" });
    }
    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.findIndex((item) =>
      item.product.equals(pid)
    );
    if (existingProduct !== -1) {
      // Incrementar la cantidad del producto existente
      cart.products[existingProduct].quantity += 1;
    } else {
      // Agregar el producto al carrito
      const newProduct = {
        product: pid,
        quantity: 1,
      };
      cart.products.push(newProduct);
    }
    const result = await cart.save();
    res.json({ status: "success", payload: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    // Obtenemos el Id del carrito
    const cartId = req.params.cid;
    // Obtenemos el producto por ID
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return res
        .status(404)
        .json({ error: `The cart with id ${cartId} does not exist` });
    }
    // Enviamos el carrito como respuesta si se encuentra
    res.json({ status: "success", payload: cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Invalid cart" });
    }
    const pid = req.params.pid;
    const existingProduct = cart.products.findIndex((item) =>
      item.product.equals(pid)
    );
    if (existingProduct === -1) {
      return res.status(404).json({ error: "Invalid product" });
    }
    const quantity = req.body.quantity;
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        status: error,
        message: "Quantity must be a positive integer",
      });
    }
    // Actualizamos la cantidad del producto existente
    cart.products[existingProduct].quantity = quantity;
    // Guardamos el carrito actualizado
    const result = await cart.save();
    res.json({
      status: "success",
      payload: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Invalid Cart" });
    }
    const products = req.body.products;
    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: "error",
        message: "The product array format is invalid",
      });
    }
    cart.products = products;
    // Guardamos el carrito actualizado
    const result = await cart.save();

    const totalPages = 1;
    const prevPage = null;
    const nextPage = null;
    const page = 1;
    const hasPrevPage = false;
    const hasNextPage = false;
    const prevLink = null;
    const nextLink = null;

    res.json({
      status: "success",
      payload: result.products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartModel.findByIdAndUpdate(cid, { products: [] }, { new: true }).lean().exec();
    if (!cart) {
      return res
        .status(404)
        .json({ status: "success", message: "Invalid cart" });
    }
    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Invalid cart" });
    }
    const pid = req.params.pid;
    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.findIndex((item) =>
      item.product.equals(pid)
    );
    if (existingProduct === -1) {
      return res.status(404).json({ error: "Invalid product" });
    }
    // Eliminamos el producto del carrito
    cart.products.splice(existingProduct, 1);
    const result = await cart.save();
    res.json({
      status: "success",
      payload: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
