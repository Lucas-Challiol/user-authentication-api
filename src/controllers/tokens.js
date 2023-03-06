const jwt = require("jsonwebtoken");

function createToken(payloadData, tokenType) {
  let options;
  let payload = {};

  switch (tokenType) {
    // Token para un usuario que se acabe de registar.
    // Este se manda por el email que con el que se registro, para que verifique que tiene acceso al mismo.
    case "register_token":
      payload.user_id = payloadData.user_id;
      payload.type = 0;
      options = { expiresIn: "1d" };
      break;
    // Token para un usuario que haya verificado que tiene acceso a su email.
    // Este token tiene la funcion de ser las sesiones de un usuario normal. 
    case "session_token":
      payload.user_id = payloadData.user_id;
      payload.permissions = "user";
      payload.type = 1;
      options = { expiresIn: "31d" };
      break;
    // Token para eliminar una de las sesiones de un usuario dentro de su cuenta.
    // Este token tiene la funcion eliminar una sesion dentro de la cuenta.
    // Sirve para cuando el usuario vea una sesion la cual no sepa su procedencia. 
    // SE MANDA AL EMAIL DEL USUARIO.
    case "deleteSessionToken":
      payload.user_id = payloadData.user_id;
      payload.sessionToDelete = payloadData.sessionToDelete;
      payload.type = 2;
      options = { expiresIn: "1h" };
      break;
    // Token para cambiar la contraseña de una cuenta.
    // Este token tiene la funcion cambiar la contraseña de una cuenta cuando el usuario no tiene acceso a la misma.
    // SE MANDA AL EMAIL DEL USUARIO. 
    case "passwordChangeToken":
      payload.user_id = payloadData.user_id;
      payload.newPassword = payloadData.newPassword;
      payload.type = 3;
      options = { expiresIn: "1h" };
      break;
    default:
      throw new Error(
        `{"serverErrorResponse": "Problemas al crear el token, error en del servidor.", 
            "errorType": "jsonWebToken",  
            "errorMessage": "Error durante la creacion del token, tipo de token incorrecto o no especificado.",
            "errorInCode": "No existe."}`
      );
  }

  try {
    const token = jwt.sign(payload, process.env.SECRET, options);
    return token;
  } catch (error) {
    throw new Error(
      `{"serverErrorResponse": "Problemas al crear el token, error en del servidor.", 
        "errorType": "jsonWebToken",  
        "errorMessage": "Error durante la creacion del token, tipo de token correcto.",
        "errorInCode": "${error.message}"}`
    );
  }
}

const validateToken = (token, type) => {
  try {
    var decoded = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    throw Error('{"serverErrorResponse": "Token no valido.", "type": "normalError"}');
  }

  if (decoded.type != type)
  throw Error('{"serverErrorResponse": "Tipo de token no valido.", "type": "normalError"}');

  return decoded;
};

module.exports = { createToken, validateToken };
