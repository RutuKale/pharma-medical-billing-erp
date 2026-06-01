const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// ROUTES
const medicineRoutes = require("./routes/medicine.routes");
const patientRoutes = require("./routes/patient.routes");
const billingRoutes = require("./routes/billing.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const expiryRoutes = require("./routes/expiry.routes");
const reportsRoutes = require("./routes/reports.routes");
const authRoutes = require("./routes/authRoutes");

// MIDDLEWARE
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// MIDDLEWARES
app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ROUTES
app.use("/api/medicines", medicineRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/bills", billingRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/expiry", expiryRoutes);

app.use("/api/reports", reportsRoutes);

app.use("/api/auth", authRoutes);

// HOME ROUTE
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PharmaCare API Running Successfully",
  });
});

// 404 ROUTE
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// GLOBAL ERROR MIDDLEWARE
app.use(errorMiddleware);

module.exports = app;
