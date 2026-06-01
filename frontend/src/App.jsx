import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import AddMedicines from "./pages/Inventory/AddMedicines";
import UploadExcel from "./pages/Inventory/UploadExcel";
import StockIn from "./pages/Inventory/StockIn";
import Stock from "./pages/Inventory/Stock";
import ExpiryAlerts from "./pages/Inventory/ExpiryAlerts";
import Billing from "./pages/Billing/Billing";
import BillingHistory from "./pages/Billing/BillingHistory";
import Patients from "./pages/Patients/Patients";
import Reminders from "./pages/Patients/Reminders";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings";
import { Suspense } from "react";
import AppLoader from "./components/AppLoader";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Suspense fallback={<AppLoader />}>
          <Routes>
            {/* LOGIN */}
            <Route path="/login" element={<Login />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route
                        path="/inventory/add-medicine"
                        element={<AddMedicines />}
                      />
                      <Route path="/inventory/stock" element={<Stock />} />
                      <Route path="/inventory/stock-in" element={<StockIn />} />
                      <Route
                        path="/inventory/expiry-alerts"
                        element={<ExpiryAlerts />}
                      />
                      <Route path="/inventory/upload" element={<UploadExcel />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route
                        path="/billing-history"
                        element={<BillingHistory />}
                      />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/reminders" element={<Reminders />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
