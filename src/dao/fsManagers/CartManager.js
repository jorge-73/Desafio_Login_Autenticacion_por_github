import fs from "fs";
import { __dirname } from "../../utils.js";
import { productManager } from "./ProductManager.js";

class CartManager {
  #path;
  #format;
  constructor(path) {
    this.#path = path;
    this.#format = "utf-8";
    this.carts = [];
  }

  // Devolvemos el arreglo con todos los productos agregados al carrito. En caso de error lo mostramos por consola
  getCarts = async () => {
    try {
      return JSON.parse(await fs.promises.readFile(this.#path, this.#format));
    } catch (error) {
      console.log("error: archivo no encontrado");
      return [];
    }
  };

  // Buscamos en el arreglo el carrito que coincida con el id
  getCartsById = async (id) => {
    // Leer el contenido del archivo
    const carts = await this.getCarts();
    // Buscar el carrito con el id especificado
    const cart = carts.find((prod) => prod.id === id);
    // Devolver el carrito o un mensaje en el case de que no se encontró
    return cart /* || "El carrito con ese id no existe" */;
  };

  // Asignar un id autoincrementable al nuevo producto
  #generateId = async () => {
    // Leer el contenido del archivo
    const carts = await this.getCarts();
    return carts.length === 0 ? 1 : carts[carts.length - 1].id + 1;
  };

  addCart = async (products) => {
    // Leer el contenido del archivo
    const carts = await this.getCarts();

    const newCart = {
      id: await this.#generateId(),
      products: (products = []),
    };

    carts.push(newCart);

    // Escribir el array actualizado del carrito en el archivo
    await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"));

    // Actualizar el array del carrito en la instancia de ProductManager
    this.carts = carts;

    // Devolver el nuevo producto
    return newCart;
  };

  addProductsToCart = async (cartId, productId) => {
    const products = productManager.getProductsById(productId);

    if (!products) {
      return `Error el producto con el id:${productId} no existe`;
    }

    let carts = await this.getCarts();

    // Obtener el carrito por ID
    const cart = await this.getCartsById(cartId);

    if (!cart) {
      return null; // Carrito no encontrado
    }

    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.find(
      (item) => item.product === productId
    );
    if (existingProduct) {
      existingProduct.quantity++; // Incrementar la cantidad del producto
    } else {
      // Agregar el producto al carrito
      const product = {
        product: productId,
        quantity: 1,
      };
      cart.products.push(product);
    }

    // Actualizar el carrito en el arreglo "carts"
    const cartIndex = carts.findIndex((item) => item.id === cartId);
    if (cartIndex !== -1) {
      carts[cartIndex] = cart;
    }

    // Guardar los cambios en el archivo
    await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"));

    return cart; // Devolver el carrito actualizado
  };
}

export const cartManager = new CartManager(`${__dirname}/api/carrito.json`);
