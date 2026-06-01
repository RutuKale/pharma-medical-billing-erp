const app = require("./app");
const pool = require("./config/db");

// CRON JOB
require("./jobs/expiry.job");

// Render assigns the port dynamically
const PORT = process.env.PORT || 5000;

// TEST DATABASE CONNECTION
pool.getConnection()
  .then((connection) => {
    console.log("✅ Database Connected Successfully");
    console.log("📦 Host     : srv982.hstgr.io");
    console.log("📂 Database : u183177620_pharmaDB");
    console.log("👤 User     : u183177620_pharma");

    connection.release();

    // START SERVER
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database Connection Failed");
    console.error("🔴 Full Error:", error);

    process.exit(1);
  });
