const db = require("../config/db");

class OTPModel {
  static async create(email, otp, expiresAt) {
    const query = `
      INSERT INTO otp_verifications
      (email, otp, expires_at)
      VALUES (?, ?, ?)
    `;

    return db.query(query, [email, otp, expiresAt]);
  }

  static async deleteExisting(email) {
    return db.query(
      "DELETE FROM otp_verifications WHERE email = ?",
      [email]
    );
  }

  static async findOTP(email, otp) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM otp_verifications
      WHERE email = ?
      AND otp = ?
      AND is_used = FALSE
      ORDER BY id DESC
      LIMIT 1
      `,
      [email, otp]
    );

    return rows[0];
  }

  static async markUsed(id) {
    return db.query(
      `
      UPDATE otp_verifications
      SET is_used = TRUE
      WHERE id = ?
      `,
      [id]
    );
  }
}

module.exports = OTPModel;