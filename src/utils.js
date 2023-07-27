import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import { config } from "dotenv";
import bcrypt from "bcrypt";

config();

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const SECRET_PASS = process.env.SECRET_PASS;

export const PORT = 8080;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/public/img`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const uploader = multer({ storage });

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

// Middleware para comprobar si hay un usuario activo. sino redirigir a login
export const requireAuth = (req, res, next) => {
  if (!req.session?.passport?.user) {
    res.redirect("/sessions/login");
  } else {
    next();
  }
};
