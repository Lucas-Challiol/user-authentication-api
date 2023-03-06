const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const bcrypt = require("../../controllers/encryption");
const jwt = require("../../controllers/tokens");

const userLoginSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  emailValidation: {
    type: Boolean,
    default: false,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    immutable: true,
    default: () => {
      const fechaActual = new Date();
      const fechaDeCreacion = fechaActual.getTime();
      return fechaDeCreacion;
    },
  },
  sessions: {
    type: Array,
  },
});

userLoginSchema.methods.saveNewUser = async function saveNewUser() {
  if (!((await userLoginModel.findOne({ name: this.name })) == null))
  throw new Error('{"serverErrorResponse": "Nombre de usuario en uso", "errorType": "normalError"}');
  if (!((await userLoginModel.findOne({ email: this.email })) == null))
  throw new Error('{"serverErrorResponse": "Email en uso", "errorType": "normalError"}');

  try {
    this.password = await bcrypt.hashPassword(this.password);
    await this.save();
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

userLoginSchema.methods.modifyField = async function modifyField(fieldToChange, newData) {
  
  if (fieldToChange === "username") {
    this.name = newData;
    this.save();
    return;
  }

  if (fieldToChange === "password") {
    let encryptedPassword = await bcrypt.hashPassword(newData);
    this.password = encryptedPassword;
    let index = this.sessions.length;
    this.sessions.splice(0, index);
    this.save();
    return;
  }
  
};

userLoginSchema.methods.validateSession = function validateSession (sessionToValidate) {
  for (const sessionToken of this.sessions) {
    if (sessionToValidate === sessionToken) {
      return true;
    }
  }
  return false;
};

userLoginSchema.methods.deleteSession = function deleteSession (sessionToDelete) {
  let indexOfSessions = this.sessions.length;
  for (let i = 0; i <= indexOfSessions; i++) {
    if (sessionToDelete == this.sessions[i]) {
      this.sessions.splice(i, 1);
      this.save();
      return true;
    }
  }
  return false;
}

userLoginSchema.methods.validateEmail = function validateEmail() {
  const sessionToken = jwt.createToken({ user_id: this._id }, "session_token");
  this.emailValidation = true;
  this.sessions.push(sessionToken);
  this.save();
  return sessionToken;
}

async function login(email, password) {
  const userData = await userLoginModel.findOne({ email: email });

  if (userData === null) 
  throw Error(`{"serverErrorResponse": "Email o Contraseña incorrecta", "errorType": "normalError"}`);
  if (!userData.emailValidation) 
  throw Error(`{"serverErrorResponse": "El email aun no a sido validado", "errorType": "normalError"}`);
  if (!(await bcrypt.comparePassword(password, userData.password))) 
  throw Error(`{"serverErrorResponse": "Password no valida", "errorType": "normalError"}`);

  const sessionToken = jwt.createToken( { user_id: userData["_id"] }, "session_token");
  userData.sessions.push(sessionToken);
  userData.save();

  return sessionToken;
}

const userLoginModel = model(
  "userSensibleData",
  userLoginSchema,
  "user_sensible_data"
);

module.exports = {
  userLoginModel,
  login,
};