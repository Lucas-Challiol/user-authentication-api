const express = require("express");
const helmet = require("helmet");

const app = express();
const port = 3000;

require("dotenv").config();

// Configuracion Express
app.use(express.json());

// Middelweres
// Te defiende de la mayoria de cosas
app.use(helmet());

// Gestion De Usuarios
const userAuth = require("./src/routes/auth");
const authValidation = require("./src/middlewares/authValidation");

app.use("/api/account/", authValidation, userAuth);

app.listen(port, async (error) => {
  if (error) {
    console.error("Ha sucedido el siguiente error: ", error);
    return;
  }
  console.log("\n       [* INICIANDO SERVIDOR *]");
  console.log(`\n      .-Puerto: localhost:${port}\n`);
  require("./src/config/database.js");
  console.log("      .-DB: Conexion exitosa\n");
  require("./src/config/nodemailer.js");
  console.log("      .-Email: Conexion exitosa\n");
});
