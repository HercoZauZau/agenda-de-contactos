const express = require("express");
const app = express();
const route = require("./routes");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const {
  globalMid,
  checkCsrfError,
  csrfMiddleware,
} = require("./src/middlewares/middlewareGlobal");

const mongoose = require("mongoose");
// const helmet = require("helmet");
const csrf = require("csurf");
require("dotenv").config();

// app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

/**
 * Rodar o app na localhost usando HELMET cria erros ao enviar os formulários com CSURF por causa do SSL
 *
 * Não usar HELMET na localhost
 * 
 * Substituir o "process.env.CONNECTIONSTRING" pelo link de conexão da Base de Dados
 */

const sessionOptions = session({
  secret: "valar morghulis",
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }), 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
});

app.use(sessionOptions);
app.use(flash());

mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("conectado a DB");
    app.emit("conectado");
  })
  .catch((e) => {
    console.log("erro de conexao");
    console.log(e);
  });

app.set("views", "./src/views");
app.set("view engine", "ejs");
app.use(csrf());
app.use(globalMid);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(route);

app.on("conectado", () => {
  app.listen(3000, () => {
    console.log("Executando Servidor...");
    console.log("http://localhost:3000");
  });
});
