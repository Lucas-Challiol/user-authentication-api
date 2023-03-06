var express = require("express");
var router = express.Router();

// Controllers
const jwt = require("../controllers/tokens");
const sendEmail = require("../controllers/emails");

// Database
const { userLoginModel, login } = require("../models/users/userLogin");

// Logs control
const logs = require("../../logs/logs.js");

/* ////////////////////////////////////////////////////////// */ 
/*             Proceso de registro de un nuevo usuario.       */
/* ////////////////////////////////////////////////////////// */ 

// Registro de un nuevo usuario */
router.post("/register", async function (req, res) {
  const registerData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const newUser = new userLoginModel(registerData);
    await newUser.saveNewUser();
    const newUserToken = jwt.createToken( { user_id: newUser["_id"].toString() }, "register_token");
    // await sendEmail.emailVerification(newUser, token)
    // res.send("cuenta creada con exito");
    // Activar en produccion, para testear se usa la linea de abajo.
    res.json({
      message: "cuenta creada con exito",
      token: newUserToken,
    });
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

// Valida el email de una cuenta.
router.post("/emailValidation/:token", async function (req, res) {
  const newUserToken = req.params.token;

  try {
    const tokenData = jwt.validateToken(newUserToken, 0);
    const user_id = tokenData.user_id;

    const userData = await userLoginModel.findById(user_id);

    if (userData === null)
    throw Error('{"serverErrorResponse": "La cuenta no existe", "type": "normalError"}');
    if (userData.emailValidation)
    throw Error('{"serverErrorResponse": "La cuenta ya a sido validada, "type": "normalError""}');

    const sessionToken = userData.validateEmail();

    res.json({
      message: "cuenta validada con exito",
      session: sessionToken,
    });
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

/* ////////////////////////////////////////////////////////// */ 
/*             Logeo y navegacion del usuario.                */
/* ////////////////////////////////////////////////////////// */ 

// Logea a un usuario con email y password.
router.post("/login", async function (req, res) {
  const loginData = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const sessionToken = await login(
      loginData.email,
      loginData.password
    );

    res.json({
      message: "Inicio de sesion exitoso",
      session: sessionToken,
    });
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

// Deslogea al usuario, eliminando la sesion actual de su cuenta.
router.post("/unLogin", async function (req, res) {
  const actualSession = req.headers.authorization;

  try {
    const sessionData = jwt.validateToken(actualSession, 1);

    const userData = await userLoginModel.findById(sessionData["user_id"]);

    if (userData === null)
    throw Error('{"serverErrorResponse": "El Usuario dueño de la sesion actual no existe", "type": "normalError"}');
    if (!userData.validateSession(actualSession))
    throw Error('{"serverErrorResponse": "Sesion actual no encontrada.", "type": "normalError"}');

    userData.deleteSession(actualSession)

    res.send("Proceso completado con exito.");
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
})

// Valida la sesion del usuario y devuelve la informacion de su sesion.
router.post("/sessionValidate", async function (req, res) {
  const actualSession = req.headers.authorization;

  try {
    const sessionData = jwt.validateToken(actualSession, 1);

    const userData = await userLoginModel.findById(sessionData["user_id"]);

    if (userData === null)
    throw Error('{"serverErrorResponse": "El Usuario dueño de la sesion actual no existe", "type": "normalError"}');
    if (!userData.validateSession(actualSession))
    throw Error('{"serverErrorResponse": "Sesion no encontrado en las sesiones del usuario.", "type": "normalError"}');

    return res.json({
      user_id: sessionData.user_id,
      permissions: sessionData.permissions,
    });
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

/* ////////////////////////////////////////////////////////// */ 
/* Rutas de utillidades para el usuario dentro de la cuenta.  */ 
/* ////////////////////////////////////////////////////////// */ 

// Cambiar los datos de la cuenta cuando se tiene acceso a esta.
router.patch("/changeUserData", async function (req, res) {
  const actualSession = req.headers.authorization;
  const fieldToChange = req.body.fieldToChange;
  const newData = req.body.newData;

  try {
    const sessionData = jwt.validateToken(actualSession, 1);

    const userData = await userLoginModel.findById(sessionData["user_id"]);
    
    if (userData == null)
    throw Error('{"serverErrorResponse": "Usuario no encontrado", "type": "normalError"}');

    if(fieldToChange === "username") {
      if(await userLoginModel.findOne({ name: newData }) != null) 
      throw new Error('{"serverErrorResponse": "Nombre de usuario en uso", "errorType": "normalError"}')
    }

    userData.modifyField(fieldToChange, newData);

    res.send("Proceso completado con exito.");
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

// Solicita la eliminacion de una sesion de la cuenta.
router.post("/requestDeleteSession", async function (req, res) {
  const actualSession = req.headers.authorization;
  const sessionToDelete = req.body.sessionToDelete;

  try {
    const sessionData = jwt.validateToken(actualSession, 1);
    jwt.validateToken(sessionToDelete, 1)

    const userData = await userLoginModel.findById(sessionData["user_id"]);

    if (userData === null)
    throw Error('{"serverErrorResponse": "El Usuario dueño de la sesion actual no existe", "type": "normalError"}');
    if (!userData.validateSession(actualSession))
    throw Error('{"serverErrorResponse": "Sesion actual no encontrada.", "type": "normalError"}');
    if (!userData.validateSession(sessionToDelete))
    throw Error('{"serverErrorResponse": "Sesion a eliminar no encontrada.", "type": "normalError"}');

    const sessionDeleteToken = jwt.createToken({ user_id: sessionData["user_id"], sessionToDelete: sessionToDelete },"deleteSessionToken");

    // sendEmail.SessionDeleteEmail(userData.email, sessionDeleteToken);
    // res.send("Email enviado con exito")
    // Descomentar y borrar la linea de codigo de abajo en produccion.
    res.json({ 
      message: "Email enviado con exito", 
      token: sessionDeleteToken 
    });
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

// Se usa el token que se obtiene en requestDeleteSession para eliminar la sesion de la cuenta.
router.delete("/deleteSession/:token", async function (req, res) {
  const sessionDeleteToken = req.params.token;

  try {
    const tokenData = jwt.validateToken(sessionDeleteToken, 2);
    const sessionToDelete = tokenData.sessionToDelete;

    const userData = await userLoginModel.findById(tokenData["user_id"]);

    if (!userData.deleteSession(sessionToDelete))
    throw Error('{"serverErrorResponse": "Sesion a eliminar no encontrada.", "type": "normalError"}');

    res.send("Sesion eliminada con exito");
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

/* ////////////////////////////////////////////////////////// */ 
/* Rutas de utillidades para el usuario fuera de su cuenta.   */ 
/* ////////////////////////////////////////////////////////// */ 

// Solicitar un cambio de contraseña si no se tiene acceso de la cuenta.
router.post("/forgotenPassword", async function (req, res) {
  const userEmail = req.body.email;
  const newPassword = req.body.newPassword;

  try {
    const userData = await userLoginModel.findOne({ email: userEmail });

    if (userData == null)
    throw Error('{"serverErrorResponse": "Usuario no encontrado", "type": "normalError"}');
    if (!userData.emailValidation)
    throw Error(`{"serverErrorResponse": "El email aun no a sido validado", "errorType": "normalError"}`);

    const passwordChangeToken = jwt.createToken({
        user_id: userData._id.toString(),
        newPassword: newPassword,
      },"passwordChangeToken");

    // await sendEmail.passwordChangeEmail(userData.email, passwordChangeToken);
    // res.send("cuenta creada con exito");
    // Activar en produccion, para testear se usa la linea de abajo.
    res.json({
      message: "email enviado con exito",
      token: passwordChangeToken,
    });
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

// Se usa el token que se obtiene en requestPasswordChange para cambiar la contraseña.
router.patch("/resetPassword/:token", async function (req, res) {
  const passwordChangeToken = req.params.token;

  try {
    const tokenData = jwt.validateToken(passwordChangeToken, 3);

    const userData = await userLoginModel.findById(tokenData["user_id"]);

    if (userData === null)
    throw Error('{"serverErrorResponse": "Usuario no encontrado", "type": "normalError"}');

    userData.modifyField("password", tokenData.newPassword);

    return res.send("Contraseña cambiada con exito.");
  } catch (error) {
    errorMessage = JSON.parse(error.message);
    logs.makeNewAuthLog(JSON.parse(error.message));
    return res.status(400).send(`${errorMessage.serverErrorResponse}`);
  }
});

module.exports = router;