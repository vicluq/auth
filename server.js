const express = require("express");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/scripts", express.static("./front/scripts"));

// ! MognoDB Store -> store sessions
const sessionStore = new MongoDBStore({
  uri: 'mongodb://127.0.0.1/auth_test', // MongoDB URI to database
  collection: 'sessions',
  expires: 100000 // MongoDb will clean after the MS has passed
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

app.get("/login", (req, res) => {
  if (req.session.logged) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "./front/login.html"));
  }
});

app.post("/login", (req, res) => {
  res.setHeader('Location', req.headers.origin + '/'); // URL to redirect on client

  console.log(req.body);
  req.session.logged = true; // ? Salvo por requests mas nao por usuarios/maquinas diferentes, pois nao ha o cookie da sessionId/nso eh a mesma session
  // ? Por enquanto ta em memoria, entao se fechar o server/browser, vai sumir, logo, guardaremos no banco

  // TODO: instead -> send user data + url to redirect
  res.json(req.body);
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    if (!err) res.redirect('/login');
  })
});

app.get("/", (req, res) => {
  console.log("[HOME_PAGE]");

  if (req.session.logged) {
    console.log("is logged");
    return res.sendFile(path.join(__dirname, "./front/index.html"));
  } else {
    res.redirect("/login");
  }
});

app.listen(8080, () => {
  console.log("App running on port 8080");
});
