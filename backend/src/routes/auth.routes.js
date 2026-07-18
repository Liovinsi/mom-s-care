const express = require("express");
const auth = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { loginRules, socialRules } = require("../validators/common.validators");

const router = express.Router();

router.post("/login", loginRules, validate, auth.login);
router.post("/google", socialRules, validate, auth.googleLogin);
router.post("/facebook", socialRules, validate, auth.facebookLogin);
router.get("/me", authenticate, auth.me);

module.exports = router;
