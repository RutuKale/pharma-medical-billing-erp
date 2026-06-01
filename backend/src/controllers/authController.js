const nodemailer = require("nodemailer");

const OTPModel = require("../models/otp.model");
const UserModel = require("../models/user.model");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await OTPModel.deleteExisting(email);

    await OTPModel.create(
      email,
      otp,
      expiresAt
    );

    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shaikh.umar.iqra@gmail.com",
          pass: "dfnb cysm bnse iufg",
        },
      });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "PharmaMed ERP OTP",
      html: `
        <h2>PharmaMed ERP Login</h2>
        <h1>${otp}</h1>
        <p>OTP expires in 5 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpData =
      await OTPModel.findOTP(email, otp);

    if (!otpData) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      new Date() >
      new Date(otpData.expires_at)
    ) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }

    await OTPModel.markUsed(otpData.id);

    let user =
      await UserModel.findByEmail(email);

    if (!user) {
      await UserModel.create(email);

      user =
        await UserModel.findByEmail(email);
    }

    res.json({
      success: true,
      message: "Login Successful",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
};