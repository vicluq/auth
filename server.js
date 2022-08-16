const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");
const cors = require("cors");
const bcrypt = require('bcryptjs');

const UserModel = require("./models/User");
const { default: mongoose } = require("mongoose");

const app = express();

mongoose.connect("mongodb://127.0.0.1/auth_test");

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/scripts", express.static("./front/scripts"));

// ! MognoDB Store -> store sessions
// Guardamos as sessions no banco, pois, se fechar o server, o processo sai de memoria e apaga as sessions
const sessionStore = new MongoDBStore({
  uri: "mongodb://127.0.0.1/auth_test", // MongoDB URI to database
  collection: "sessions",
  expires: 100000, // MongoDb will clean after the MS has passed
});

// ! Sessions middleware -> add o objeto sessions em cada requisição
app.use(
  session({
    cookie: { maxAge: 100000 }, // ? Podemos config as propriedades do cookie da session
    secret: "long string in production stored in env file",
    resave: false, // ? Nao salvar a session no banco a cada req/res, só se algo mudar na session
    saveUninitialized: false, // ? Não salvar em uma req que nao mexe na session
    store: sessionStore,
  })
);

app.get("/signup", (req, res) => {
  if (req.session.logged) res.redirect("/");

  res.sendFile(path.join(__dirname, "./front/signup.html"));
});

app.post("/signup", (req, res) => {
  const password = req.body.password;
  const hashTimes = 12;

  // ! Encriptando Senhas
  bcrypt.hash(password, hashTimes)
    .then(hashedPass => {
      const user = new UserModel({
        email: req.body.email,
        name: req.body.name,
        password: hashedPass, // TODO confirm password
        admin: req.body.admin,
      });

      // ? Email é um index unico, logo se houver repetição, irá falhar o salvamento
      user
        .save()
        .then((response) => {
          req.session.user = user;
          req.session.logged = true;

          res.setHeader('Location', req.headers.origin); // '/'
          res.json({ email: user.email, name: user.name, admin: user.admin });
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ error: err });
        });
    })
    .catch(err => console.log(err));
});

app.get("/login", (req, res) => {
  if (req.session.logged) {
    res.redirect("/"); // * Redirect em POST é diferente, tem que fazer no front
  } else {
    res.sendFile(path.join(__dirname, "./front/login.html"));
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);

  UserModel.findOne({ email: req.body.email })
    .then(user => {
      console.log(user)
      if (user) {
        // ! Validating Password
        bcrypt.compare(req.body.password, user.password)
          .then((areEqual) => {
            if (areEqual) {
              res.setHeader("Location", req.headers.origin + "/"); // URL to redirect on client
              req.session.logged = true; // ? Salvo por requests mas nao por usuarios/maquinas diferentes, pois nao ha o cookie da sessionId/nso eh a mesma session
              req.session.user = user;

              res.cookie('logged', 'true');

              return res.status(200).json({ email: user.email, name: user.name });
            }

            return res.status(404).json({ error: true, message: "Invalid password" });
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          })
      }
      else {
        // ? if user is not found
        res.status(404).json({ empty: true, message: "No user found" });
      }
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
    })
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    
    res.cookie('logged', 'false');
    if (!err) res.redirect("/login");
  });
});

app.get("/", (req, res) => {
  if (req.session.logged) {
    console.log("is logged");
    return res.sendFile(path.join(__dirname, "./front/index.html"));
  } else {
    res.redirect("/signup");
  }
});

app.listen(8080, () => {
  console.log("App running on port 8080");
});
