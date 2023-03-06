// Como usar el sistema de logs?
// Cuando ocurre un error se debe usar un ( throw new error ) con los siguientes parametros:
// "serverErrorResponse": ""  => Respuesta que dara el servidor al cliente.
// "type": "", Tipo de error.
// "errorMessage": "" => Pequeño resumen de la posible razon del error.
// "errorInCode": "" => Error dado por el modulo.
// Este seria el estandar, si quiere puede mandarse mas datos dentro, tantos como sean necesarios.

const fs = require("fs");

async function makeNewAuthLog(errorData) {
  const fechaActual = new Date();
  var logIdentificator = fechaActual.getTime();
  logIdentificator += "-" + Math.floor((Math.random() * (200-0))+0);
  // Esto se hace por si dos errores ocurren en el mismo momento exacto.

  switch (errorData.errorType) {
    case "normalError": return;
    case "jsonWebToken":
      jsonWebTokenLog(errorData, logIdentificator);
      break;
    case "nodeEmailer":
      nodeEmailerLog(errorData, logIdentificator);
      break;
    case "bcrypt":
      bcryptLog(errorData, logIdentificator);
      break;
  }
}

function jsonWebTokenLog(errorData, logIdentificator) {
  fs.writeFile(
    `logs/jsonWebTokenLogs/log-${logIdentificator}-jsonwebtoken.txt`,
    `.-Server response: ${errorData.serverErrorResponse}
   \n.-Description of the error: ${errorData.errorMessage}
   \n.-Error In the code: ${errorData.errorInCode}`,
    (err) => {
      if (err) console.log(err);
      console.log("Guardado exitoso");
    }
  );
}

function nodeEmailerLog(errorData, logIdentificator) {
  fs.writeFile(
    `logs/nodeEmailerLogs/log-${logIdentificator}-nodeEmailer.txt`,
    `.-Server response: ${errorData.serverErrorResponse}
   \n.-Description of the error: ${errorData.errorMessage}
   \n.-Error In the code: ${errorData.errorInCode}
   \n.-Email: ${errorData.email}`,
    (err) => {
      if (err) console.log(err);
      console.log("Guardado exitoso");
    }
  );
}

function bcryptLog(errorData, logIdentificator) {
  fs.writeFile(
    `logs/bcryptLogs/log-${logIdentificator}-bcrypt.txt`,
    `.-Server response: ${errorData.serverErrorResponse}
   \n.-Description of the error: ${errorData.errorMessage}
   \n.-Error In the code: ${errorData.errorInCode}
   \n.-Password: ${errorData.password}`,
    (err) => {
      if (err) console.log(err);
      console.log("Guardado exitoso");
    }
  );
}

module.exports = { makeNewAuthLog };
