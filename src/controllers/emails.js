const { transporter } = require("../config/nodemailer.js");

// En produccion cambiar el (to:`${process.env.EMAIL}) a `${user_email}.
async function emailVerification(userData, token) {
  try {
    await transporter.sendMail({
      from: `${process.env.nodemailer_EMAIL}`,
      to: `${userData.email}`,
      // Asunto del email.
      subject: "Correo de verificacion",
      // Complete el email como mas le guste, puede usarse html css.
      text: `${token}`,
    });
  } catch (error) {
    throw new Error(
      `{"serverErrorResponse": "Problemas al enviar el email, contactese con el soporte.", 
        "errorType": "nodeEmailer",  
        "errorMessage": "Error durante el envio del email.",
        "errorInCode": "${error.message}",
        "email": "${userData.email}"}`
    );
  }
}

async function sessionDeleteEmail(userEmail, sessionToDelete) {
  try {
    await transporter.sendMail({
      from: `${process.env.nodemailer_EMAIL}`,
      to: `${userEmail}`,
      // Asunto del email.
      subject: "Eliminacion de sesion de ...",
      // Complete el email como mas le guste, puede usarse html css.
      text: `Se va a eliminar la siguiente sesion ${sessionToDelete} clickee en el siguiente boton si esta de acuerdo....`,
    });
  } catch (error) {
    throw new Error(
      `{"serverErrorResponse": "Problemas al enviar el email, contactese con el soporte.", 
        "errorType": "nodeEmailer",  
        "errorMessage": "Error durante el envio del email.",
        "errorInCode": "${error.message}",
        "email": "${userData.email}"}`
    );
  }
}

async function passwordChangeEmail(userEmail, passwordChangeToken) {
  try {
    await transporter.sendMail({
      from: `${process.env.nodemailer_EMAIL}`,
      to: `${userEmail}`,
      // Asunto del email.
      subject: "Solicitud de re-establecimieto de contraseña de ...",
      // Complete el email como mas le guste, puede usarse html css.
      text: `Se va a re-establecer la contraseña de su cuenta de ..., clickee en el siguiente boton si esta de acuerdo ${passwordChangeToken}.`,
    });
  } catch (error) {
    throw new Error(
      `{"serverErrorResponse": "Problemas al enviar el email, contactese con el soporte.", 
      "errorType": "nodeEmailer",  
      "errorMessage": "Error durante el envio del email.",
      "errorInCode": "${error.message}",
      "email": "${userData.email}"}`
    );
  }
}

module.exports = { emailVerification, sessionDeleteEmail, passwordChangeEmail };
