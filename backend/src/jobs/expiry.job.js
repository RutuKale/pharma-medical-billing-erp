const cron = require("node-cron");

const pool = require("../config/db");


// RUN EVERY DAY AT MIDNIGHT
cron.schedule("0 0 * * *", async () => {

    console.log("Running Expiry Check Job...");

    try {

        // MARK EXPIRED MEDICINES
        await pool.query(`
            UPDATE medicines
            SET status = 'EXPIRED'
            WHERE expiry_date < CURDATE()
        `);

        console.log("Expiry status updated");

    } catch (error) {

        console.log(error.message);

    }

});