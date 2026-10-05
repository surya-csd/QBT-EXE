import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  FileBadge2,
  ReceiptIndianRupee,
  ShieldCheck,
} from "lucide-react";

import "./Documents.css";


// =====================================================
// DOCUMENT ICON
// =====================================================

function DocumentIcon({ type }) {
  const normalizedType = String(type || "").toLowerCase();

  if (["risk", "tara", "risk-assessment", "risk_assessment", "risk assessment"].includes(normalizedType)) {
    return (
      <div className="documents-icon risk">
        <ShieldCheck size={20} />
      </div>
    );
  }

  if (["bill", "billing", "bills"].includes(normalizedType)) {
    return (
      <div className="documents-icon bill">
        <ReceiptIndianRupee size={20} />
      </div>
    );
  }

  return (
    <div className="documents-icon quotation">
      <FileBadge2 size={20} />
    </div>
  );
}


// =====================================================
// STATUS
// =====================================================

function Status({ value }) {
  const status = value || "DRAFT";

  return (
    <span className={`documents-status ${status.toLowerCase()}`}>
      {status}
    </span>
  );
}


// =====================================================
// FILTER HELPERS
// =====================================================

// Normalise the backend document type to one of the filter values
function normalizeType(type) {
  const t = String(type || "").trim().toLowerCase();

  if (["bill", "billing", "bills"].includes(t)) return "bill";
  if (["risk", "tara", "risk-assessment", "risk_assessment", "risk assessment"].includes(t)) return "tara";
  return "quotation";
}

// The backend sends dates as DD-MM-YYYY; convert to YYYY-MM-DD so they
// compare correctly against <input type="date"> values
function toIsoDate(value) {
  const s = String(value || "").trim();

  let m = s.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  return null;
}


// =====================================================
// DOCUMENTS PAGE
// =====================================================

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const navigate = useNavigate();

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      if (typeFilter !== "all" && normalizeType(document.type) !== typeFilter) {
        return false;
      }

      if (fromDate || toDate) {
        const date = toIsoDate(document.date);

        // Documents without a valid date can't match a date range
        if (!date) return false;
        if (fromDate && date < fromDate) return false;
        if (toDate && date > toDate) return false;
      }

      return true;
    });
  }, [documents, fromDate, toDate, typeFilter]);

  const hasFilters = fromDate || toDate || typeFilter !== "all";

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setTypeFilter("all");
  };


  // ===================================================
  // LOAD DOCUMENTS
  // ===================================================

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await api.get(
          "/dashboard"
        );

        const data = response.data.data;

        console.log("DASHBOARD DATA:", data);
        console.log("ALL DOCUMENTS:", data.allDocuments);

        // Get ALL documents
        setDocuments(data.allDocuments || []);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);


  // ===================================================
  // OPEN DOCUMENT
  //
  // Navigation is based on BOTH:
  // document.type
  // document.id
  // ===================================================

  const handleDocumentClick = (document) => {
    if (!document?.type || !document?.id) {
      console.error(
        "Invalid document:",
        document
      );
      return;
    }

    const type = String(document.type)
      .trim()
      .toLowerCase();

    const id = String(document.id)
      .trim();

    console.log("OPEN DOCUMENT:", {
      type,
      id,
    });

    if (
      type === "quotation" ||
      type === "quotations" ||
      type === "quote"
    ) {
      navigate(
        `/document/quotation/${encodeURIComponent(id)}`,
        {
          state: {
            from: "documents",
          },
        }
      );

      return;
    }

    if (
      type === "bill" ||
      type === "billing" ||
      type === "bills"
    ) {
      navigate(
        `/document/billing/${encodeURIComponent(id)}`,
        {
          state: {
            from: "documents",
          },
        }
      );

      return;
    }

    if (
      type === "tara" ||
      type === "risk-assessment" ||
      type === "risk_assessment" ||
      type === "risk assessment" ||
      type === "risk"
    ) {
      navigate(
        `/document/tara/${encodeURIComponent(id)}`,
        {
          state: {
            from: "documents",
          },
        }
      );

      return;
    }

    console.error(
      "Unknown document type:",
      document
    );
  };


  return (
    <div className="documents-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="documents-page-header">

        <div>
          <h3
            onClick={() => navigate("/")}
            className="back"
          >
            ⬅ Back to Dashboard
          </h3>
        </div>

      </div>


      {/* =================================================
          DOCUMENT CARD
      ================================================= */}

      <div className="documents-card">

        {/* ===============================================
            CARD HEADER
        =============================================== */}

        <div className="documents-card-header">

          <h3>All Documents</h3>

          <span className="documents-count">
            {hasFilters
              ? `${filteredDocuments.length} of ${documents.length} Documents`
              : `${documents.length} Documents`}
          </span>

        </div>


        {/* ===============================================
            FILTERS
        =============================================== */}

        <div className="documents-filters">

          <label className="documents-filter">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label className="documents-filter">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>

          <label className="documents-filter">
            <span>Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="bill">Bills</option>
              <option value="quotation">Quotations</option>
              <option value="tara">TaRA</option>
            </select>
          </label>

          <button
            type="button"
            className="documents-filter-clear"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Clear
          </button>

        </div>


        {/* ===============================================
            TABLE HEADER
        =============================================== */}

        <div className="documents-table-header">

          <span>Document</span>

          <span>
            Project / Description
          </span>

          <span>Date</span>

          <span>Status</span>

        </div>


        {/* ===============================================
            DOCUMENT LIST
        =============================================== */}

        <div className="documents-list">

          {loading ? (

            <div className="documents-loading">
              Loading documents...
            </div>

          ) : filteredDocuments.length > 0 ? (

            filteredDocuments.map((document) => (

              <div
                className="documents-row"
                key={`${document.type}-${document.id}`}
                onClick={() =>
                  handleDocumentClick(document)
                }
                style={{
                  cursor: "pointer",
                }}
              >

                {/* =====================================
                    DOCUMENT
                ===================================== */}

                <div className="documents-main">

                  <DocumentIcon
                    type={document.type}
                  />

                  <div className="documents-id">
                    {document.id}
                  </div>

                </div>


                {/* =====================================
                    DESCRIPTION
                ===================================== */}

                <div className="documents-description">

                  <span>
                    {document.description}
                  </span>

                </div>


                {/* =====================================
                    DATE
                ===================================== */}

                <div className="documents-date">

                  {document.date || "—"}

                </div>


                {/* =====================================
                    STATUS
                ===================================== */}

                <Status
                  value={document.status}
                />

              </div>

            ))

          ) : (

            <div className="documents-loading">
              {hasFilters
                ? "No documents match the selected filters."
                : "No documents found."}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}