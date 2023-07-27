import fs from "fs";
import { __dirname } from "../../utils.js";

class ProductManager {
  #path;
  #format;
  constructor(path) {
    this.#path = path;
    this.#format = "utf-8";
    this.products = [];
  }

  #validateProduct = async (product) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();

    // Validamos que no se repita el campo "code"
    const existingProduct = await products.find(
      (prod) => prod.code === product.code
    );
    if (existingProduct !== undefined) {
      console.log("Ya existe un producto con el mismo código");
      return false;
    }

    return true;
  };

  // Devolvemos el arreglo con todos los productos creados hasta ese momento. En caso de error lo mostramos por consola
  getProducts = async () => {
    try {
      return JSON.parse(
        await fs.promises.readFile(this.#path, this.#format)
      );
    } catch (error) {
      console.log("error: archivo no encontrado");
      return [];
    }
  };

  // Asignar un id autoincrementable al nuevo producto
  #generateId = async () => {
    // Leer el contenido del archivo
    const products = await this.getProducts();
    return products.length === 0 ? 1 : products[products.length - 1].id + 1;
  };

  // Agregamos un producto al arreglo de productos inicial
  addProduct = async (title, description, price, thumbnail, code, category, stock) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();

    const newProduct = {
      id: await this.#generateId(),
      title,
      description,
      price,
      thumbnail: thumbnail || [],
      code,
      category,
      stock,
      status: true,
    };

    // Validar producto
    if (await this.#validateProduct(newProduct)) {
      // Agregar el nuevo producto al array de productos
      products.push(newProduct);

      // Escribir el array actualizado de productos en el archivo
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(products, null, "\t")
      );

      // Actualizar el array de productos en la instancia de ProductManager
      this.products = products;

      // Devolver el nuevo producto
      return newProduct;
    }
  };

  // Buscamos en el arreglo el producto que coincida con el id
  getProductsById = async (id) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();
    // Buscar el producto con el id especificado
    const product = products.find((prod) => prod.id === id);
    // Devolver el producto o un mensaje en el case de que no se encontró
    return product /* || "El producto con ese id no existe" */;
  };

  // Actualizamos un producto en especifico buscando con su id y los parametros a actualizar
  updateProduct = async (id, update) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();

    // Buscar el índice del producto con el id especificado
    const index = products.findIndex((prod) => prod.id === id);

    // Si el producto existe, actualizarlo
    if (index !== -1) {

      // Validar el objeto de actualización
      const isValid = await this.#validateProduct(update);
      if (!isValid) {
        return console.log(
          "Error al actualizar: actualización inválida"
        );
      }

      // Crear un nuevo objeto producto actualizado
      products[index] = { ...products[index], ...update };

      // Escribir el array de productos actualizado al archivo
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(products, null, "\t"),
        this.#format
      );

      // Actualizar el array de productos en la instancia de ProductManager
      this.products = products;

      // Devolver el producto actualizado
      return console.log("Producto Actualizado", products[index]);
    }

    // Si el producto no existe, devolvemos un mensaje
    return console.log("Error al actualizar: Producto no encontrado");
  };

  // Eliminamos un producto en especifico buscando con su id
  deleteProduct = async (id) => {
    try {
      // Leer el contenido del archivo
      const products = await this.getProducts();
      // Filtrar el array de productos, excluyendo el producto con el id especificado
      const filterProducts = products.filter((prod) => prod.id !== id);
      // Si se eliminó algún producto, escribir el array de productos actualizado al archivo
      if (products.length !== filterProducts.length) {
        await fs.promises.writeFile(
          this.#path,
          JSON.stringify(filterProducts, null, "\t"),
          this.#format
        );
        // Actualizar el array de productos en la instancia de ProductManager
        this.products = filterProducts;
        // Devolvemos un mensaje que el producto se ha eliminado con exito
        return "Producto eliminado con exito";
      }
      // Si no se eliminó ningún producto, devolvemos un mensaje que no se encontro ese ID
      return "No existe el producto con ese ID";
    } catch (err) {
      console.log(err);
    }
  };
}

export const productManager = new ProductManager(`${__dirname}/api/products.json`);
