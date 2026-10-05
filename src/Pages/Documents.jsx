import { useEffect, useState } from "react";
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
// DOCUMENTS PAGE
// =====================================================

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


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
          <h1>All Documents</h1>
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

          <h3
            onClick={() => navigate("/")}
            className="back"
          >
            ⬅ Back to Dashboard
          </h3>

          <span className="documents-count">
            {documents.length} Documents
          </span>

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

          ) : documents.length > 0 ? (

            documents.map((document) => (

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
              No documents found.
            </div>

          )}

        </div>

      </div>

    </div>
  );
}