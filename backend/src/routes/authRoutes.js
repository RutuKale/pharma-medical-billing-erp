const express = require("express");
const {
  sendOtp,
  verifyOtp,
  sendMobileOtp,
  verifyMobileOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);

module.exports = router;