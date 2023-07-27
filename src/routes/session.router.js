import { Router } from "express";
import passport from "passport";

const router = Router();

// Vista de Login
router.get("/login", (req, res) => {
  res.render("sessions/login");
});
// API para login
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/sessions/failLogin",
  }),
  async (req, res) => {
    res.redirect("/products");
  }
);

router.get("/failLogin", (req, res) => {
  // res.json({ status: "error", error: "Failed!" });
  res.render("errors/errorPage", { status: "error", error: "Failed Login!" });
});

//Vista para registrar usuarios
router.get("/register", (req, res) => {
  res.render("sessions/register");
});
// API para crear usuarios en la DB
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/sessions/failRegister",
  }),
  async (req, res) => {
    res.redirect("/sessions/login");
  }
);

router.get("/failRegister", (req, res) => {
  res.json({ status: "error", error: "Failed!" });
});

// Rutas para autentificacion por github
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);
router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/sessions/login" }),
  async (req, res) => {
    res.redirect("/products");
  }
);

// Eliminar Session
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).render("errors/errorPage", { error: err });
    }
    res.redirect("/sessions/login");
  });
});

router.get("/error", (req, res) => {
  res.render("errors/errorPage");
});

export default router;
