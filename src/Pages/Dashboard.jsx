import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

import "./Dashboard.css";
import {
  FileBadge2,
  ReceiptIndianRupee,
  ShieldCheck,
  Building2,
  BadgeCheck,
  CalendarCheck2,
  Plus,
} from "lucide-react";

function DocumentIcon({ type }) {
  const normalizedType = String(type || "").toLowerCase();

  if (["bill", "billing", "bills"].includes(normalizedType)) {
    return (
      <div className="doc-icon bill">
        <ReceiptIndianRupee size={20} />
      </div>
    );
  }

  if (["risk", "tara", "risk-assessment", "risk_assessment", "risk assessment"].includes(normalizedType)) {
    return (
      <div className="doc-icon risk">
        <ShieldCheck size={20} />
      </div>
    );
  }

  return (
    <div className="doc-icon quotation">
      <FileBadge2 size={20} />
    </div>
  );
}

function Status({ value }) {
  const status = value || "DRAFT";

  return (
    <span className={`status ${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [quotationCount, setQuotationCount] = useState(0);
  const [billCount, setBillCount] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [recentDocuments, setRecentDocuments] = useState([]);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/dashboard");

      const data = response.data.data;
   console.log(data,"dash data========")

      // Summary counts
      setQuotationCount(data.thisMonthTotalQuotation || 0);
      setBillCount(data.thisMonthTotalBill || 0);
      setRiskCount(data.thisMonthRiskAndHazard || 0);

      // Recent documents
      setRecentDocuments(data.recentDocuments || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="dashboard-content">

      {/* Summary Cards */}
      <div className="summary">

        {/* Quotations */}
        <div className="summary-card">
          <div className="summary-top">
            <div className="summary-icon quotation-icon">
              <FileBadge2 size={20} />
            </div>
            <p>Quotations this month</p>
          </div>

          <div className="summary-value">
            <strong>{quotationCount}</strong>
            <span className="growth quotation-growth">↑ 20%</span>
          </div>

          <div className="mini-chart">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>

        {/* Bills */}
        <div className="summary-card">
          <div className="summary-top">
            <div className="summary-icon bill-icon">
              <ReceiptIndianRupee size={20} />
            </div>
            <p>Bills awaiting approval</p>
          </div>

          <div className="summary-value">
            <strong>{billCount}</strong>
            <span className="growth bill-growth">↑ 12%</span>
          </div>

          <div className="mini-chart">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>

        {/* Risk */}
        <div className="summary-card">
          <div className="summary-top">
            <div className="summary-icon risk-icon">
              <ShieldCheck size={20} />
            </div>
            <p>Risk assessments filed</p>
          </div>

          <div className="summary-value">
            <strong>{riskCount}</strong>
            <span className="growth risk-growth">↑ 14%</span>
          </div>

          <div className="mini-chart">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>

      </div>

     {/* Actions */}
<div className="actions">

  {/* New Quotation */}
  <button
    className="action-button"
    onClick={() => navigate("/quotations")}
  >
    <span className="plus">
      <Plus size={16} />
    </span>
    New quotation
  </button>

  {/* New Bill */}
  <button
    className="action-button"
    onClick={() => navigate("/bills")}
  >
    <span className="plus">
      <Plus size={16} />
    </span>
    New bill
  </button>

  {/* New TaRA */}
  <button
    className="action-button"
    onClick={() => navigate("/risk-assessments")}
  >
    <span className="plus">
      <Plus size={16} />
    </span>
    New TaRA
  </button>

</div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">

        {/* Recent Documents */}
        <section className="recent">
          <div className="recent-title">
    <h3>Recent documents</h3>

    <button
      className="view-all-button"
      onClick={() => navigate("/documents")}
    >
      View all
      <span>→</span>
    </button>
  </div>

          <div className="documents-header">
            <span>Document</span>
            <span>Project / Description</span>
            <span>Date</span>
            <span>Status</span>
          </div>

          <div className="documents">

            {recentDocuments.length > 0 ? (
              recentDocuments.map((document) => (
                <button
                  className="document"
                  key={`${document.type}-${document.id}`}
                  onClick={() => {
                    const type = String(document.type || "")
                      .trim()
                      .toLowerCase();
                    const id = String(document.id || "").trim();

                    if (!type || !id) {
                      console.error("Invalid recent document:", document);
                      return;
                    }

                    const normalizedType =
                      type === "quotation" || type === "quotations" || type === "quote"
                        ? "quotation"
                        : type === "bill" || type === "billing" || type === "bills"
                          ? "billing"
                          : type === "tara" || type === "risk" || type === "risk-assessment" || type === "risk_assessment" || type === "risk assessment"
                            ? "tara"
                            : null;

                    if (!normalizedType) {
                      console.error("Unknown recent document type:", document);
                      return;
                    }

                    navigate(
                      `/document/${encodeURIComponent(normalizedType)}/${encodeURIComponent(id)}`,
                      {
                        state: {
                          from: "dashboard",
                        },
                      }
                    );
                  }}
                >

                  {/* Document ID / Number */}
                  <div className="document-main">
                    <DocumentIcon type={document.type} />

                    <div className="document-id">
                      {document.id}
                    </div>
                  </div>

                  {/* Company + Description */}
                  <div className="document-description">
                    <span>{document.description}</span>
                  </div>

                  {/* Date */}
                  <div className="document-date">
                    {document.date || "—"}
                  </div>

                  {/* Status */}
                  <Status value={document.status} />

                </button>
              ))
            ) : (
              <div className="document">
                <div className="document-main">
                  <div className="document-id">
                    No recent documents
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* This Month Overview */}
        <section className="overview">

          <h3>This Month Overview</h3>

          <div className="overview-chart">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="overview-stats">

            {/* Active Projects */}
            <div className="overview-stat">

              <div className="overview-stat-icon projects-icon">
                <Building2 size={18} />
              </div>

              <div className="overview-stat-content">
                <strong>{quotationCount}</strong>
                <span>Active Projects</span>
              </div>

            </div>

            {/* Pending Approvals */}
            <div className="overview-stat">

              <div className="overview-stat-icon approval-icon">
                <BadgeCheck size={18} />
              </div>

              <div className="overview-stat-content">
                <strong>{billCount}</strong>
                <span>Pending Approvals</span>
              </div>

            </div>

            {/* Inspections Scheduled */}
            <div className="overview-stat">

              <div className="overview-stat-icon inspection-icon">
                <CalendarCheck2 size={18} />
              </div>

              <div className="overview-stat-content">
                <strong>{riskCount}</strong>
                <span>Inspections Scheduled</span>
              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}