import messageModel from "./dao/models/messages.model.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsProductsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/session.router.js";

const run = (io, app) => {
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Rutas para la API de productos, carritos y sessions
  app.use("/api/products", productsRouter);
  app.use("/api/carts", cartsRouter);
  app.use("/sessions", sessionRouter);
  // Ruta para las vistas de productos
  app.use("/products", viewsProductsRouter);

  // Evento de conexión de Socket.IO
  io.on("connection", async (socket) => {
    // console.log("Successful Connection");
    // Escucha el evento "productList" emitido por el cliente
    socket.on("productList", (data) => {
      // Emitir el evento "updatedCarts" a todos los clientes conectados
      console.log(data);
      io.emit("updatedProducts", data);
    });
    socket.on("cartList", (data) => {
      // Emitir el evento "updatedCarts" a todos los clientes conectados
      io.emit("updatedCarts", data);
    });

    let messages = (await messageModel.find()) ? await messageModel.find() : [];

    socket.broadcast.emit("alerta");
    socket.emit("logs", messages);
    socket.on("message", (data) => {
      messages.push(data);
      messageModel.create(messages);
      io.emit("logs", messages);
    });
  });

  // Ruta principal
  app.get("/", (req, res) => res.render("index", { name: "CoderHouse" }));
};

export default run;
