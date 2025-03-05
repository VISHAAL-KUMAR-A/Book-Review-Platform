const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const validate = require("../middleware/validate");
const {
  registerValidation,
  loginValidation,
} = require("../validations/authValidations");

router.post("/register", validate(registerValidation), register);

router.post("/login", validate(loginValidation), login);

module.exports = router;
