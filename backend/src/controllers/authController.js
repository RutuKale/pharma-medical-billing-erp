const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const otpStore = {};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Login OTP",
    html: `
      <h2>PharmaMed ERP Login OTP</h2>
      <h1>${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    `,
  });

  res.json({
    success: true,
    message: "OTP sent successfully",
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore[email];

  if (!stored) {
    return res.json({
      success: false,
      message: "OTP not found",
    });
  }

  if (stored.expires < Date.now()) {
    return res.json({
      success: false,
      message: "OTP expired",
    });
  }

  if (stored.otp !== otp) {
    return res.json({
      success: false,
      message: "Invalid OTP",
    });
  }

  delete otpStore[email];

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    success: true,
    token,
  });
};
