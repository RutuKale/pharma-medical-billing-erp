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
const supplierRoutes = require("./routes/supplier.routes");

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

// ROUTES (Mount both /api/<resource> and /<resource> for maximum compatibility)
app.use("/api/medicines", medicineRoutes);
app.use("/medicines", medicineRoutes);

app.use("/api/patients", patientRoutes);
app.use("/patients", patientRoutes);

app.use("/api/bills", billingRoutes);
app.use("/bills", billingRoutes);

app.use("/api/billing", billingRoutes);
app.use("/billing", billingRoutes);

app.use("/api/patient-bills", billingRoutes);
app.use("/patient-bills", billingRoutes);

app.use("/api/patient/bills", billingRoutes);
app.use("/patient/bills", billingRoutes);

app.use("/api/inventory", inventoryRoutes);
app.use("/inventory", inventoryRoutes);

app.use("/api/expiry", expiryRoutes);
app.use("/expiry", expiryRoutes);

app.use("/api/reports", reportsRoutes);
app.use("/reports", reportsRoutes);

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/suppliers", supplierRoutes);
app.use("/suppliers", supplierRoutes);

// DIRECT PATIENT BILL UPDATE ALIASES
const billingController = require("./controllers/billing.controller");
app.put("/api/patient/bill/:id", billingController.updateBill);
app.put("/patient/bill/:id", billingController.updateBill);
app.post("/api/patient/bill/:id", billingController.updateBill);
app.post("/patient/bill/:id", billingController.updateBill);

app.put("/api/patient-bill/:id", billingController.updateBill);
app.put("/patient-bill/:id", billingController.updateBill);
app.post("/api/patient-bill/:id", billingController.updateBill);
app.post("/patient-bill/:id", billingController.updateBill);

// DIRECT RETURN BILL ALIASES
const expiryController = require("./controllers/expiry.controller");
app.post("/api/return-bill", expiryController.processReturnBill);
app.post("/return-bill", expiryController.processReturnBill);
app.post("/api/expiry/return-bill", expiryController.processReturnBill);
app.post("/expiry/return-bill", expiryController.processReturnBill);

// HOME ROUTE
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PharmaCare API Running Successfully",
  });
});

// 404 ROUTE
app.use((req, res) => {
  console.warn(`[404 Route Not Found] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// GLOBAL ERROR MIDDLEWARE
app.use(errorMiddleware);

module.exports = app;
