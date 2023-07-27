import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import session from "express-session";
import MongoStore from "connect-mongo";
import { PORT, __dirname, MONGO_DB_NAME, MONGO_URI, SECRET_PASS } from "./utils.js";
import run from "./run.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configurar el middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(`${__dirname}/public`));
// Configurar el motor de plantillas Handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      dbName: MONGO_DB_NAME,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    }),
    secret: SECRET_PASS,
    resave: true,
    saveUninitialized: true,
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

try {
  await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`);
  // Iniciar el servidor HTTP
  const serverHttp = app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
  );
  // Crear una instancia de Socket.IO y vincularla al servidor HTTP
  const io = new Server(serverHttp);
  // Establecer el objeto "socketio" en la aplicación para que esté disponible en todas las rutas
  app.set("socketio", io);

  run(io, app);
} catch (error) {
  console.log(`Cannot connect to dataBase: ${error}`);
  process.exit();
}
