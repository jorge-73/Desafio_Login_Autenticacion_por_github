import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import { userModel } from "../dao/models/users.model.js";
import bcrypt from "bcrypt";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  createHash,
  isValidPassword,
} from "../utils.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const user = await userModel.findOne({ email: username });
          if (user) {
            console.log("User already exists");
            return done(null, false);
          }
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          };
          if (
            newUser.email === "adminCoder@coder.com" &&
            bcrypt.compareSync("adminCod3r123", newUser.password)
          ) {
            newUser.role = "Admin";
          }
          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          console.log(error);
          return done('Error creating user: ' + error.message);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          console.log(error);
          return done("Error getting user");
        }
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "http://localhost:8080/sessions/githubcallback",
        scope: ["user:email"],
      },
      async (accessTocken, refreshToken, profile, done) => {
        try {
          // console.log(profile);
          const userName = profile.displayName || profile.username;
          const userEmail = profile._json.email;

          const existingUser = await userModel.findOne({ email: userEmail });
          if (existingUser) return done(null, existingUser);
          const newUser = {
            first_name: userName,
            last_name: " ",
            email: userEmail,
            password: " ",
          };
          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          console.log(error);
          return done("Error getting user");
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});

export default initializePassport;
