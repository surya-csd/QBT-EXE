import { useState } from "react";
import Header from "./Components/Header";

import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";

import Sidebar from "./Components/Sidebar";
import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import QuotationPage from "./Pages/QuotationPage";
import BillingPage from "./Pages/BillingPage";
import TSA from "./Pages/TSA";
import Documents from "./Pages/Documents";

import "./App.css";


// =====================================================
// DOCUMENT REDIRECT
// Navigation is based on BOTH type and id
// =====================================================

function DocumentRedirect() {
  const { type, id } = useParams();
  const location = useLocation();

  const documentType = String(type || "")
    .trim()
    .toLowerCase();

  const documentId = String(id || "").trim();

  // -----------------------------------------
  // QUOTATION
  // -----------------------------------------
  if (
    documentType === "quotation" ||
    documentType === "quotations" ||
    documentType === "quote"
  ) {
    return (
      <Navigate
        to={`/quotations/savedquotations/${encodeURIComponent(documentId)}`}
        replace
        state={{ ...(location.state || {}), openPreview: true }}
      />
    );
  }

  // -----------------------------------------
  // BILLING
  // -----------------------------------------
  if (
    documentType === "billing" ||
    documentType === "bill" ||
    documentType === "bills"
  ) {
    return (
      <Navigate
        to={`/bills/savedbills/${encodeURIComponent(documentId)}`}
        replace
        state={{ ...(location.state || {}), openPreview: true }}
      />
    );
  }

  // -----------------------------------------
  // TARA / RISK ASSESSMENT
  // -----------------------------------------
  if (
    documentType === "tara" ||
    documentType === "risk-assessment" ||
    documentType === "risk_assessment" ||
    documentType === "risk assessment"
  ) {
    return (
      <Navigate
        to={`/risk-assessments/savedtara/${encodeURIComponent(documentId)}`}
        replace
        state={{ ...(location.state || {}), openPreview: true }}
      />
    );
  }

  // -----------------------------------------
  // Unknown document type
  // Do NOT assume it is TARA
  // -----------------------------------------
  return (
    <Navigate
      to="/documents"
      replace
      state={location.state}
    />
  );
}


// =====================================================
// OLD TARA REDIRECT SUPPORT
// Keeps existing TARA URLs working
// =====================================================

function RiskAssessmentRedirect() {
  const { taraId } = useParams();

  if (!taraId || taraId === "savedtara") {
    return (
      <Navigate
        to="/risk-assessments/savedtara"
        replace
      />
    );
  }

  return (
    <Navigate
      to={`/risk-assessments/savedtara/${encodeURIComponent(taraId)}`}
      replace
    />
  );
}


// =====================================================
// APP CONTENT
// =====================================================

function AppContent() {
  const [isOpen, setIsOpen] = useState(true);

  const location = useLocation();

  // =================================================
  // PAGE TYPE CHECK
  // =================================================

  const isQuotationPage =
    location.pathname === "/quotations" ||
    location.pathname.startsWith("/quotations/");

  const isBillingPage =
    location.pathname === "/bills" ||
    location.pathname.startsWith("/bills/");

  const isRiskAssessmentPage =
    location.pathname === "/risk-assessments" ||
    location.pathname.startsWith("/risk-assessments/");

  // =================================================
  // COMMON HEADER
  //
  // Quotation, Billing and TARA already have
  // their own Header components.
  //
  // So App.jsx must NOT render another Header
  // for those pages.
  // =================================================

  const shouldShowAppHeader =
    !isQuotationPage &&
    !isBillingPage &&
    !isRiskAssessmentPage &&
    !location.pathname.startsWith("/document/");

  // =================================================
  // MAIN HEADER TITLE
  // =================================================

  let headerTitle = "";

  if (location.pathname === "/") {
    headerTitle = "Dashboard";
  } else if (location.pathname === "/settings") {
    headerTitle = "Settings";
  } else if (location.pathname === "/documents") {
    headerTitle = "Documents";
  }

  return (
    <div className="dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        className={`main ${
          location.pathname === "/settings"
            ? "settings-active"
            : ""
        } ${
          isOpen
            ? "sidebar-open"
            : "sidebar-closed"
        }`}
      >

        {/* =================================================
            COMMON HEADER

            Only:
            Dashboard
            Settings
            Documents

            No duplicate header for:
            Quotation
            Billing
            TARA
        ================================================= */}

        {shouldShowAppHeader && (
          <Header
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={headerTitle}
          />
        )}


        {/* =================================================
            ROUTES
        ================================================= */}

        <Routes>

          {/* ===============================================
              DASHBOARD
          =============================================== */}

          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* ===============================================
              DOCUMENTS
          =============================================== */}

          <Route
            path="/documents"
            element={<Documents />}
          />


          {/* ===============================================
              SETTINGS
          =============================================== */}

          <Route
            path="/settings"
            element={<Settings />}
          />


          {/* ===============================================
              QUOTATION
          =============================================== */}

          <Route
            path="/quotations"
            element={
              <QuotationPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/quotations/savedquotations"
            element={
              <QuotationPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/quotations/savedquotations/:quotationNo"
            element={
              <QuotationPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/quotations/*"
            element={
              <QuotationPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />


          {/* ===============================================
              BILLING
          =============================================== */}

          <Route
            path="/bills"
            element={
              <BillingPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/bills/savedbills"
            element={
              <BillingPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/bills/savedbills/:billNo"
            element={
              <BillingPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/bills/:billNo"
            element={
              <BillingPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/bills/*"
            element={
              <BillingPage
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />


          {/* ===============================================
              TARA / RISK ASSESSMENT
          =============================================== */}

          <Route
            path="/risk-assessments"
            element={
              <TSA
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/risk-assessments/savedtara"
            element={
              <TSA
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/risk-assessments/savedtara/:taraId"
            element={
              <TSA
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            }
          />

          <Route
            path="/risk-assessments/:taraId"
            element={
              <RiskAssessmentRedirect />
            }
          />


          {/* ===============================================
              DOCUMENT REDIRECT

              IMPORTANT:
              type + id

              Example:

              /document/quotation/Q003
              /document/billing/B003
              /document/tara/TARA003
          =============================================== */}

          <Route
            path="/document/:type/:id"
            element={
              <DocumentRedirect />
            }
          />

        </Routes>

      </main>

    </div>
  );
}


// =====================================================
// APP
// =====================================================

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}