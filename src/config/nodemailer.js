var nodemailer = require("nodemailer");

// Configuracion unica para usarla con email de outlook, en caso de usar otro tipo de correo busque como hacerlo.

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", 
  secureConnection: false, 
  port: 587, 
  tls: {
    ciphers: "SSLv3",
  },
  auth: {
    user: `${process.env.nodemailer_EMAIL}`,
    pass: `${process.env.nodemailer_PASSWORD}`,
  },
});

module.exports = { transporter };
