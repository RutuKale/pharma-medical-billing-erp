const db = require("../config/db");

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return rows[0];
  }

  static async create(email) {
    return db.query(
      `
      INSERT INTO users
      (email, provider, is_verified)
      VALUES (?, 'otp', TRUE)
      `,
      [email]
    );
  }
}

module.exports = UserModel;