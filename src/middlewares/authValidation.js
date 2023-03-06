const { check, validationResult } = require("express-validator");
var express = require("express");
var router = express.Router();

/* ////////////////////////////////////////////////////////// */
/*             Proceso de registro de un nuevo usuario.       */
/* ////////////////////////////////////////////////////////// */

router.post("/register",
  [
    check("name")
      .notEmpty()
      .trim()
      .isLength({ min: 4, max: 25 })
      .withMessage("El campo name debe tener de 3 a 25 caracteres")
      .isString()
      .withMessage("El campo name debe ser un string"),

    check("email")
      .isLength({ min: 8, max: 40 })
      .withMessage("El campo email debe tener de 8 a 40 caracteres")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email no valido"),

    check("password")
      .trim()
      .isLength({ min: 6, max: 30 })
      .withMessage("El campo password debe tener de 6 a 30 caracteres")
      .isString()
      .withMessage("El campo password debe ser un string"),
  ],

  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });

    next();
  }
);

router.post("/emailValidation/:token",
  check(`token`)
    .notEmpty()
    .withMessage("El campo token no debe estar vacio.")
    .isString()
    .withMessage("El campo token debe de ser una string"),
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

/* ////////////////////////////////////////////////////////// */
/*             Logeo y navegacion del usuario.                */
/* ////////////////////////////////////////////////////////// */

router.post("/login",
  [
    check("email")
      .isLength({ min: 8, max: 40 })
      .withMessage("El campo email debe tener de 8 a 40 caracteres")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email no valido"),

    check("password")
      .trim()
      .isLength({ min: 6, max: 30 })
      .withMessage("El campo password debe tener de 6 a 30 caracteres")
      .isString()
      .withMessage("Password debe ser un string"),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });

    if (
      !typeof req.body.password === "string" ||
      !typeof req.body.email === "string"
    ) {
      return res.send("Datos enviados no validos");
    }

    next();
  }
);

router.post("/unLogin",
  [
    check("authorization")
      .notEmpty()
      .withMessage("El campo authorization no debe estar vacio.")
      .isString()
      .withMessage("El campo authorization debe de ser una string"),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

router.post("/sessionValidate",
  check("authorization")
    .notEmpty()
    .withMessage("El campo authorization no debe estar vacio.")
    .isString()
    .withMessage("El campo authorization debe de ser una string"),
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

/* ////////////////////////////////////////////////////////// */
/* Rutas de utillidades para el usuario dentro de la cuenta.  */
/* ////////////////////////////////////////////////////////// */

router.patch("/changeUserData",
  [
    check("authorization")
      .notEmpty()
      .withMessage("El campo authorization no debe estar vacio.")
      .isString()
      .withMessage("El campo authorization debe de ser una string"),

    check("fieldToChange")
      .notEmpty()
      .withMessage("El campo fieldToChange no debe de estar vacio.")
      .isString()
      .withMessage("El campo fieldToChange debe ser una string.")
      .isLength({ min: 8, max: 8 })
      .withMessage("El campo fieldToChange debe tener 8 caracteres"),

    check("newData")
      .notEmpty()
      .withMessage("El campo newData no debe de estar vacio.")
      .isString()
      .withMessage("El campo newData debe ser una string."),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });

    const fieldToChange = req.body.fieldToChange;
    const newData = req.body.newData;

    if (newData.length < 6 && fieldToChange === "password")
    return res.status(400).json({"Error": "password no valida, debe tener mas de 5 caracteres."});

    if (newData.length < 4 || (newData.length > 25 && fieldToChange === "username"))
    return res.status(400).json({"Error": "username no valido, debe tener mas de 4 caracteres y menos de 25 caracteres."});

    next();
  }
);

router.post("/requestDeleteSession",
  [
    check("authorization")
      .notEmpty()
      .withMessage("El campo authorization no debe estar vacio.")
      .isString()
      .withMessage("El campo authorization debe de ser una string"),

    check("sessionToDelete")
      .notEmpty()
      .withMessage("El campo sessionToDelete no debe estar vacio.")
      .isString()
      .withMessage("El campo sessionToDelete debe de ser una string"),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

router.delete("/deleteSession",
  [
    check("sessionDeleteToken")
      .notEmpty()
      .withMessage("El campo sessionDeleteToken no debe estar vacio.")
      .isString()
      .withMessage("El campo sessionDeleteToken debe de ser una string"),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

/* ////////////////////////////////////////////////////////// */
/* Rutas de utillidades para el usuario fuera de su cuenta.   */
/* ////////////////////////////////////////////////////////// */

router.post("/forgotenPassword",
  [
    check("email")
      .isLength({ min: 8, max: 40 })
      .withMessage("El campo email debe tener de 8 a 40 caracteres")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email no valido"),
    check("newPassword")
      .trim()
      .isLength({ min: 6, max: 30 })
      .withMessage("El campo newPassword debe tener de 6 a 30 caracteres")
      .isString()
      .withMessage("El campo newPassword debe ser un string"),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

router.patch("/resetPassword",
  [
    check("passwordChangeToken")
      .notEmpty()
      .withMessage("El campo passwordChangeToken no debe estar vacio.")
      .isString()
      .withMessage("El campo passwordChangeToken debe de ser una string"),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);
    if (!error.isEmpty()) return res.status(400).json({ error: error.array() });
    next();
  }
);

module.exports = router;
