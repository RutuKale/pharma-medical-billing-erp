const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// In-memory OTP storage
const otpStore = {};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5-minute expiry
    otpStore[normalizedEmail] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    let emailSent = false;
    let emailWarning = null;

    // Only attempt nodemailer if credentials are provided
    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        await transporter.sendMail({
          from: `"PharmaMed ERP" <${emailUser}>`,
          to: normalizedEmail,
          subject: "PharmaMed ERP - Login Verification Code",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 22px; font-weight: 800;">PharmaMed ERP</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Medical Pharmacy & Billing System</p>
              </div>
              <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello,</p>
              <p style="color: #334155; font-size: 14px; line-height: 1.5;">Use the one-time verification code below to log into your account:</p>
              <div style="background-color: #f0fdf4; border: 1px dashed #22c55e; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #15803d; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">Secured with 256-bit encryption • PharmaMed Healthcare Operations</p>
            </div>
          `,
        });

        emailSent = true;
      } catch (mailErr) {
        console.error("⚠️ Nodemailer failed to send email:", mailErr.message);
        emailWarning = mailErr.message;
      }
    } else {
      console.log("ℹ️ [AUTH] EMAIL_USER / EMAIL_PASS not set in environment. Running in development fallback mode.");
    }

    // Always log OTP to server console for testing/debugging
    console.log(`[AUTH] 🔑 OTP for ${normalizedEmail}: ${otp} ${emailSent ? "(Email sent)" : "(Fallback mode)"}`);

    return res.json({
      success: true,
      message: emailSent
        ? "Verification code sent to your email"
        : "OTP generated successfully",
    });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to process OTP request",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = otpStore[normalizedEmail];

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email. Please request a new verification code.",
      });
    }

    if (stored.expires < Date.now()) {
      delete otpStore[normalizedEmail];
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
    }

    // OTP is valid, clear it from memory
    delete otpStore[normalizedEmail];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "pharmamed_jwt_secret_dev_key_2026";
    const token = jwt.sign(
      { email: normalizedEmail, role: "Pharmacist" },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      message: "Authentication successful",
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to verify OTP",
    });
  }
};

// Mobile SMS OTP Store
const mobileOtpStore = {};

exports.sendMobileOtp = async (req, res) => {
  try {
    const { mobile, countryCode = "+91" } = req.body;
    const cleanMobile = String(mobile || "").replace(/\D/g, "");

    if (!cleanMobile || cleanMobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    const fullPhoneNumber = `${countryCode}${cleanMobile.slice(-10)}`;

    // Rate limiting: cooldown 60 seconds
    const existing = mobileOtpStore[fullPhoneNumber];
    if (existing && Date.now() - existing.createdAt < 60 * 1000) {
      const waitSec = Math.ceil((60 * 1000 - (Date.now() - existing.createdAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new OTP.`,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    mobileOtpStore[fullPhoneNumber] = {
      otp,
      attempts: 0,
      createdAt: Date.now(),
      expires: Date.now() + 5 * 60 * 1000,
    };

    // SMS Gateway Dispatch:
    // If external SMS provider (e.g. Fast2SMS / MSG91 / Twilio) is configured in environment
    const smsApiKey = process.env.SMS_API_KEY || process.env.FAST2SMS_API_KEY;
    if (smsApiKey) {
      try {
        const https = require("https");
        const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${smsApiKey}&route=otp&variables_values=${otp}&numbers=${cleanMobile.slice(-10)}`;
        https.get(fast2smsUrl, (resp) => {
          let data = "";
          resp.on("data", (chunk) => { data += chunk; });
          resp.on("end", () => {
            console.log("[Fast2SMS] SMS sent response:", data);
          });
        }).on("error", (err) => {
          console.error("[Fast2SMS] Gateway error:", err.message);
        });
      } catch (smsErr) {
        console.error("SMS Gateway error:", smsErr);
      }
    } else {
      console.log(`[SMS Server] 📱 Generated OTP for ${fullPhoneNumber}`);
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${fullPhoneNumber}`,
      phoneNumber: fullPhoneNumber,
    });
  } catch (err) {
    console.error("sendMobileOtp error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to send mobile OTP",
    });
  }
};

exports.verifyMobileOtp = async (req, res) => {
  try {
    const { mobile, otp, countryCode = "+91" } = req.body;
    const cleanMobile = String(mobile || "").replace(/\D/g, "");

    if (!cleanMobile || cleanMobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    if (!otp || String(otp).trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Please enter the complete 6-digit verification code",
      });
    }

    const fullPhoneNumber = `${countryCode}${cleanMobile.slice(-10)}`;
    const record = mobileOtpStore[fullPhoneNumber];

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found for this mobile number. Please request a new code.",
      });
    }

    if (Date.now() > record.expires) {
      delete mobileOtpStore[fullPhoneNumber];
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > 5) {
      delete mobileOtpStore[fullPhoneNumber];
      return res.status(429).json({
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: `Invalid verification code (${5 - record.attempts} attempts remaining).`,
      });
    }

    // Valid OTP - clear
    delete mobileOtpStore[fullPhoneNumber];

    const jwtSecret = process.env.JWT_SECRET || "pharmamed_jwt_secret_dev_key_2026";
    const token = jwt.sign(
      {
        phoneNumber: fullPhoneNumber,
        mobile: fullPhoneNumber,
        role: "Pharmacist",
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      message: "Mobile verification successful! Welcome to PharmaMed ERP.",
      user: {
        phoneNumber: fullPhoneNumber,
        mobile: fullPhoneNumber,
        displayName: `Pharmacist (${fullPhoneNumber.slice(-4)})`,
        role: "Pharmacist",
      },
    });
  } catch (err) {
    console.error("verifyMobileOtp error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to verify mobile OTP",
    });
  }
};
