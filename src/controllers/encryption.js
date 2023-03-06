const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`
    {"serverErrorResponse": "Error en el servidor, contactese con el soporte.", 
    "errorType": "bcrypt",
    "errorMessage": "Error durante la encriptacion, error desconocido.",
    "errorInCode": "${error.message}",
    "password": "${password}"}`);
  }
};

const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};
