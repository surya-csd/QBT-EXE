import {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import "./BillingPage.css";
import { amountInWords } from "../utils/amountInWords";
import Header from "../Components/Header";
import api from "../services/api"

const splitAmount = (value) => {
  const [rs, ps] = Number(value || 0)
    .toFixed(2)
    .split(".");

  return { rs, ps };
};

function BillingPage({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { billNo } = useParams();

  const [bill, setBill] = useState({
    billNo: "",
    date: "",
    subject: "",
    purchaseOrderNo: "",
    poDate: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      description: "",
      quantity: 1,
      unit: "Each",
      rate: 0,
    },
  ]);

  const [masterData, setMasterData] = useState([]);
  const [companyMaster, setCompanyMaster] = useState(null);
  const [customerMaster, setCustomerMaster] = useState(null);
  const [gstMaster, setGstMaster] = useState(null);

  const [showQuotationList, setShowQuotationList] = useState(false);
  const [approvedQuotations, setApprovedQuotations] = useState([]);
  const [quotationSearch, setQuotationSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [editingBillId, setEditingBillId] = useState(null);
  const [savedBills, setSavedBills] = useState([]);
  const [showSavedBills, setShowSavedBills] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [popup, setPopup] = useState(null);

  const showAlert = useCallback((message, type = "info", title = "") => {
    setPopup({
      type,
      title: title || (type === "error" ? "Error" : type === "success" ? "Success" : type === "warning" ? "Notice" : "Information"),
      message,
    });
  }, []);

  const showConfirm = useCallback((message, onConfirm, title = "Confirm Action") => {
    setPopup({
      type: "confirm",
      title,
      message,
      onConfirm: () => {
        setPopup(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => setPopup(null),
    });
  }, []);

  const closePopup = useCallback(() => setPopup(null), []);

  const isSavedBillsRoute =
    location.pathname === "/bills/savedbills";

  const shouldShowSavedBills =
    showSavedBills || isSavedBillsRoute;

  const fetchMasterData = useCallback(async () => {
    try {
      const response = await api.get(
        "/master"
      );

      if (response.data.success) {
        const data = response.data.data || [];

        setMasterData(data);

        const company = data.find(
          (item) => item.type === "company"
        );

        const customer = data.find(
          (item) => item.type === "customer"
        );

        const gst = data.find(
          (item) => item.type === "gst"
        );

        setCompanyMaster(company || null);
        setCustomerMaster(customer || null);
        setGstMaster(gst || null);
      }
    } catch (error) {
      console.error("Master Data Fetch Error:", error);

      showAlert(
        error.response?.data?.message ||
          "Failed to load master data.",
        "error"
      );
    }
  }, [showAlert]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMasterData();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchMasterData]);

  const cgstRate = Number(gstMaster?.cgstRate || 0);
  const sgstRate = Number(gstMaster?.sgstRate || 0);

  const updateBill = (field, value) => {
    setBill((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadQuotations = useCallback(async () => {
    try {
      const response = await api.get(
        "/quotations"
      );

      const result = response.data;

      if (result.success) {
        const approved = (result.data || []).filter(
          (quotation) =>
            quotation.status?.toUpperCase() === "APPROVED"
        );

        setApprovedQuotations(approved);

        return approved;
      }

      return [];
    } catch (error) {
      console.error("Failed to load quotations:", error);
      return [];
    }
  }, []);

  const handleLoadQuotation = async () => {
    const approved = await loadQuotations();

    if (approved.length === 0) {
      showAlert("No approved quotations available.", "warning");
      return;
    }

    setShowQuotationList(true);
  };

  const handleSelectQuotation = (quotation) => {
    setSelectedQuotation(quotation);

    updateBill("subject", quotation.subject || "");

    const quotationItems = quotation.items || [];

    setItems(
      quotationItems.map((item, index) => ({
        id: Date.now() + index,
        description: item.job_description || "",
        quantity: Number(item.quantity) || 1,
        unit: item.unit || "Each",
        rate: Number(item.rate) || 0,
      }))
    );

    setShowQuotationList(false);
    setQuotationSearch("");
  };

  const resetBillForm = () => {
    setIsResetting(true);

    setTimeout(() => {
      setBill({
        billNo: "",
        date: "",
        subject: "",
        purchaseOrderNo: "",
        poDate: "",
      });

      setItems([
        {
          id: Date.now(),
          description: "",
          quantity: 1,
          unit: "Each",
          rate: 0,
        },
      ]);

      setSelectedQuotation(null);
      setEditingBillId(null);
      setIsResetting(false);
    }, 700);
  };

  const handleResetBill = () => {
    resetBillForm();
    navigate("/bills");
  };

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 0) *
        (Number(item.rate) || 0),
    0
  );

  const cgst = subtotal * (cgstRate / 100);
  const sgst = subtotal * (sgstRate / 100);
  const total = subtotal + cgst + sgst;

  const handleLoadBills = useCallback(async () => {
    try {
      const response = await api.get(
        "/bills"
      );

      if (response.data.success) {
        setSavedBills(response.data.data || []);

        console.log(
          "Saved bills:",
          response.data.data
        );
      }
    } catch (error) {
      console.error("Failed to load bills:", error);
    }
  }, []);

  const handleSelectSavedBill = useCallback(
    (savedBill, shouldNavigate = true, mode = "edit") => {
      setEditingBillId(savedBill.id);

      setBill({
        billNo:
          savedBill.bill_no ||
          savedBill.billNo ||
          "",
        date:
          savedBill.bill_date ||
          savedBill.date ||
          "",
        subject: savedBill.subject || "",
        purchaseOrderNo:
          savedBill.purchase_order_no ||
          savedBill.purchaseOrderNo ||
          "",
        poDate:
          savedBill.purchase_order_date ||
          savedBill.poDate ||
          "",
      });

      setSelectedQuotation({
        id: savedBill.quotation_id,
        company_id: savedBill.company_id,
        customer_id: savedBill.customer_id,
        quotation_no: savedBill.reference || "",
        sac_no: savedBill.sac_no || "",
      });

      setItems(
        (savedBill.items || []).length > 0
          ? savedBill.items.map((item, index) => ({
              id: Date.now() + index,
              description:
                item.job_description ||
                item.description ||
                "",
              quantity: Number(item.quantity) || 0,
              unit: item.unit || "Each",
              rate: Number(item.rate) || 0,
            }))
          : [
              {
                id: Date.now(),
                description: "",
                quantity: 1,
                unit: "Each",
                rate: 0,
              },
            ]
      );

      setShowSavedBills(false);

      const bNo =
        savedBill.bill_no ||
        savedBill.billNo;

      if (shouldNavigate && bNo) {
        const nextPath = `/bills/savedbills/${encodeURIComponent(bNo)}`;

        navigate(nextPath, {
          state: {
            from: "saved-bills",
            openPreview: mode === "preview",
          },
        });

        if (mode === "preview") {
          setShowPreview(true);
        } else {
          setShowPreview(false);
        }
      }
    },
    [navigate]
  );

  const loadBillByNumber = useCallback(
    async (targetNo) => {
      try {
        const response = await api.get(
          "/bills"
        );

        if (response.data.success) {
          const bills = response.data.data || [];

          setSavedBills(bills);

          const found = bills.find(
            (b) =>
              String(
                b.bill_no ||
                  b.billNo ||
                  ""
              ).toLowerCase() ===
              String(targetNo).toLowerCase()
          );

          if (found) {
            handleSelectSavedBill(found, false);
          } else {
            const today = new Date()
              .toISOString()
              .slice(0, 10);

            setBill({
              billNo: targetNo,
              date: today,
              subject: "Bill details for " + targetNo,
              purchaseOrderNo: "PO-" + targetNo,
              poDate: today,
            });

            setShowSavedBills(false);
          }
        }
      } catch (error) {
        console.error(
          "Load bill by number error:",
          error
        );
      }
    },
    [handleSelectSavedBill]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSavedBillsRoute) {
        setShowPreview(false);
        handleLoadBills();
        return;
      }

      if (billNo) {
        // Preview is opt-in. Edit routes stay in the billing form.
        const shouldOpenPreview =
          location.state?.openPreview === true;

        setShowPreview(shouldOpenPreview);

        // Load the route target once. Do not depend on the editable bill number.
        loadBillByNumber(billNo);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [
    isSavedBillsRoute,
    billNo,
    handleLoadBills,
    loadBillByNumber,
    location.state,
  ]);

  const handleSaveBill = async () => {
    if (!bill.billNo.trim()) {
      showAlert("Please enter Bill No.", "warning");
      return;
    }

    if (!bill.date) {
      showAlert("Please select Bill Date.", "warning");
      return;
    }

    if (!selectedQuotation) {
      showAlert("Please select an approved quotation.", "warning");
      return;
    }

    if (!companyMaster?.id) {
      showAlert("Company master data is not available.", "warning");
      return;
    }

    if (!customerMaster?.id) {
      showAlert("Customer master data is not available.", "warning");
      return;
    }

    if (!gstMaster) {
      showAlert("GST master data is not available.", "warning");
      return;
    }

    try {
      const payload = {
        bill_no: bill.billNo,
        company_id:
          selectedQuotation.company_id ||
          companyMaster.id,
        customer_id:
          selectedQuotation.customer_id ||
          customerMaster.id,
        quotation_id: selectedQuotation.id,
        purchase_order_no:
          bill.purchaseOrderNo || null,
        purchase_order_date:
          bill.poDate || null,
        bill_date: bill.date,
        subject: bill.subject,
        reference:
          selectedQuotation.quotation_no ||
          null,
        sac_no:
          selectedQuotation.sac_no ||
          null,
        subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: 0,
        grand_total: total,
        amount_in_words: amountInWords(total),
        items: items.map((item, index) => ({
          serial_no: index + 1,
          job_description: item.description,
          quantity: Number(item.quantity) || 0,
          unit: item.unit,
          rate: Number(item.rate) || 0,
          amount:
            (Number(item.quantity) || 0) *
            (Number(item.rate) || 0),
        })),
      };

      let response;

      if (editingBillId) {
        response = await api.put(
          `/bills/${editingBillId}`,
          payload
        );

        console.log(
          "Bill updated:",
          response.data
        );

        showAlert("Bill updated successfully!", "success");

        resetBillForm();
      } else {
        response = await api.post(
          "/bills",
          payload
        );

        console.log(
          "Bill created:",
          response.data
        );

        showAlert("Bill saved successfully!", "success");
      }

      await handleLoadBills();
    } catch (error) {
      console.error(
        "Save/Update Bill Error:",
        error
      );

      showAlert(
        error.response?.data?.message ||
          "Failed to save/update bill.",
        "error"
      );
    }
  };

  const handleDeleteBill = (billId) => {
    showConfirm(
      "Are you sure you want to delete this bill?",
      async () => {
        try {
          const response = await api.delete(
            `/bills/${billId}`
          );

          console.log(
            "Bill deleted:",
            response.data
          );

          showAlert("Bill deleted successfully!", "success");

          await handleLoadBills();
        } catch (error) {
          console.error(
            "Delete Bill Error:",
            error
          );

          showAlert(
            error.response?.data?.message ||
              "Failed to delete bill.",
            "error"
          );
        }
      },
      "Delete Bill"
    );
  };

  const handleCloseSavedBills = () => {
    setShowSavedBills(false);
    setShowPreview(false);
    navigate("/bills");
  };

  const handleClosePreview = () => {
    if (location.state?.from === "documents") {
      navigate("/documents");
      return;
    }

    if (location.state?.from === "dashboard") {
      navigate("/");
      return;
    }

    if (
      location.state?.from === "saved-bills" ||
      location.state?.from === "saved-quotations"
    ) {
      setShowPreview(false);
      return;
    }

    setShowPreview(false);
  };

  const handlePrint = () => {
    const billDocument =
      document.querySelector(
        ".billing-bill-document"
      );

    if (!billDocument) {
      showAlert("Bill preview not found.", "warning");
      return;
    }

    const printContainer =
      document.createElement("div");

    printContainer.className =
      "billing-print-container";
    printContainer.innerHTML =
      billDocument.outerHTML;
    document.body.appendChild(
      printContainer
    );

    const printStyle =
      document.createElement("style");
    printStyle.id = "billing-print-style";
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          overflow: hidden !important;
          background: white !important;
        }

        body > *:not(.billing-print-container) {
          display: none !important;
        }

        .billing-print-container,
        .billing-print-container * {
          visibility: visible !important;
        }

        .billing-print-container {
          display: block !important;
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: white !important;
          box-sizing: border-box !important;
        }

        .billing-print-container .billing-bill-document {
          width: 794px !important;
          height: 1123px !important;
          min-height: 1123px !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 55px 54px !important;
          box-sizing: border-box !important;
          background: white !important;
          color: #20242c !important;
          border: none !important;
          box-shadow: none !important;
          overflow: hidden !important;
          zoom: 1 !important;
        }

        .billing-print-container .billing-bill-document * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          text-shadow: none !important;
        }

        .billing-print-container .billing-bill-document-title {
          color: #205783 !important;
        }

        .billing-print-container .billing-bill-document-title h1 {
          color: #174b78 !important;
        }

        .billing-print-container .billing-bill-party-box,
        .billing-print-container .billing-bill-subject-row,
        .billing-print-container .billing-bill-items-table,
        .billing-print-container .billing-bill-items-table th,
        .billing-print-container .billing-bill-items-table td {
          background: #ffffff !important;
        }

        .billing-print-container .billing-bill-party-box {
          color: #1f2937 !important;
          border-color: #b8b8b8 !important;
        }

        .billing-print-container .billing-bill-party-label {
          color: #01142f !important;
        }

        .billing-print-container .billing-bill-party-name,
        .billing-print-container .billing-bill-party-box strong,
        .billing-print-container .billing-bill-subject-row strong,
        .billing-print-container .billing-bill-meta-row strong {
          color: #172033 !important;
        }

        .billing-print-container .billing-bill-party-text {
          color: #031128 !important;
        }

        .billing-print-container .billing-bill-subject-row,
        .billing-print-container .billing-bill-meta-row {
          color: #1f2937 !important;
        }

        .billing-print-container .billing-bill-items-table th {
          color: #031d32 !important;
          font-size: 15px !important;
          padding: 7px 6px !important;
        }

        .billing-print-container .billing-bill-items-table td {
          color: #031532 !important;
          font-size: 14px !important;
          padding: 7px 6px !important;
        }

        .billing-print-container .billing-bill-items-table tbody tr,
        .billing-print-container .billing-bill-items-table tbody tr:has(.billing-sno-cell:empty) {
          height: 26px !important;
        }

        .billing-print-container .billing-bill-items-table tbody tr:has(.billing-sno-cell:empty) td {
          height: 26px !important;
          min-height: 26px !important;
          padding: 0 !important;
          background: transparent !important;
          border-top: none !important;
          border-bottom: none !important;
        }

        .billing-print-container table {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .billing-print-container tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .billing-print-container * {
          page-break-before: auto !important;
        }
      }

      @media screen {
        .billing-print-container {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(printStyle);

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        printContainer.remove();
        printStyle.remove();
      }, 500);
    }, 200);
  };

  const filteredQuotations =
    approvedQuotations.filter((quotation) => {
      const search = quotationSearch
        .toLowerCase()
        .trim();

      return (
        quotation.quotation_no
          ?.toLowerCase()
          .includes(search) ||
        quotation.subject
          ?.toLowerCase()
          .includes(search)
      );
    });

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addLineItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        unit: "Each",
        rate: 0,
      },
    ]);
  };

  const removeLineItem = (id) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const MAX_BILL_PREVIEW_ITEMS = 14;

  const previewItems = Array.from(
    {
      length: Math.max(
        MAX_BILL_PREVIEW_ITEMS,
        items.length
      ),
    },
    (_, index) =>
      items[index] || {
        id: `blank-${index}`,
        description: "",
        quantity: "",
        unit: "",
        rate: 0,
      }
  );

  const selectedCompany =
    masterData.find(
      (item) =>
        item.type === "company" &&
        item.id === selectedQuotation?.company_id
    ) || companyMaster;

  const selectedCustomer =
    masterData.find(
      (item) =>
        item.type === "customer" &&
        item.id === selectedQuotation?.customer_id
    ) || customerMaster;

  return (
    <>
      {shouldShowSavedBills && (
        <div
          className="saved-bills-overlay"
          onClick={handleCloseSavedBills}
        >
          <div
            className="saved-bills-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="saved-bills-header">
              <h2>Saved Bills</h2>

              <button
                type="button"
                className="saved-bills-close"
                onClick={handleCloseSavedBills}
              >
                ×
              </button>
            </div>

            <div className="saved-bills-list">
              {savedBills.length === 0 ? (
                <p>No saved bills found.</p>
              ) : (
                savedBills.map((savedBill) => (
                  <div
                    className="saved-bill-card"
                    key={savedBill.id}
                  >
                    <div className="saved-bill-info">
                      <strong>
                        {savedBill.bill_no}
                      </strong>

                      <span>
                        {savedBill.bill_date}
                      </span>
                    </div>

                    <div className="saved-bill-subject">
                      <span>
                        {savedBill.subject ||
                          "No subject"}
                      </span>
                    </div>

                    <div className="saved-bill-right">
                      <strong>
                        ₹{" "}
                        {Number(
                          savedBill.grand_total || 0
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>

                      <div className="saved-bill-actions">
                        <button
                          type="button"
                          className="saved-bill-edit-button"
                          onClick={() =>
                            handleSelectSavedBill(
                              savedBill,
                              true,
                              "preview"
                            )
                          }
                        >
                          Preview
                        </button>

                        <button
                          type="button"
                          className="saved-bill-edit-button"
                          onClick={() =>
                            handleSelectSavedBill(
                              savedBill,
                              true,
                              "edit"
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="saved-bill-delete-button"
                          onClick={() =>
                            handleDeleteBill(
                              savedBill.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Header
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Billing"
      >
        <div className="billing-actions">
          <button
            type="button"
            className="billing-saved-bills-button"
            onClick={async () => {
              navigate("/bills/savedbills");
              await handleLoadBills();
              setShowSavedBills(true);
            }}
          >
            Saved Bills
          </button>

          <button
            type="button"
            className="billing-load-button"
            onClick={handleLoadQuotation}
          >
            <span></span>
            Load from quotation
          </button>

          <button
            type="button"
            className="billing-preview-button"
            onClick={() => setShowPreview(true)}
          >
            <span>◉</span>
            Preview
          </button>

          <button
            type="button"
            className="billing-new-bill-action"
            onClick={handleResetBill}
          >
            ↻ Reset
          </button>
        </div>
      </Header>

      <div
        className={`billing-page ${
          isResetting
            ? "billing-resetting"
            : ""
        }`}
      >
        {isResetting && (
          <div className="billing-reset-loading">
            <div className="billing-reset-spinner"></div>

            <span>Resetting...</span>
          </div>
        )}

        {showQuotationList && (
          <div className="billing-quotation-modal-overlay">
            <div className="billing-quotation-modal">
              <div className="billing-quotation-modal-header">
                <h2>
                  Select Approved Quotation

                  <span className="billing-quotation-count">
                    {approvedQuotations.length} available
                  </span>
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuotationList(false);
                    setQuotationSearch("");
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="billing-quotation-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search quotation no. or subject..."
                  value={quotationSearch}
                  onChange={(e) =>
                    setQuotationSearch(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="billing-quotation-list">
                {filteredQuotations.length === 0 ? (
                  <p>No quotations found.</p>
                ) : (
                  filteredQuotations.map(
                    (quotation) => (
                      <div
                        className="billing-quotation-card"
                        key={quotation.id}
                      >
                        <div>
                          <strong>
                            {quotation.quotation_no}
                          </strong>

                          <p>
                            {quotation.subject ||
                              "No subject"}
                          </p>

                          <span>
                            Total: ₹
                            {(quotation.items || [])
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  (Number(
                                    item.quantity
                                  ) || 0) *
                                    (Number(
                                      item.rate
                                    ) || 0),
                                0
                              )
                              .toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectQuotation(
                              quotation
                            )
                          }
                        >
                          Select
                        </button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {showPreview && (
          <div
            className="billing-bill-preview-overlay"
            onClick={handleClosePreview}
          >
            <div
              className="billing-bill-preview-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="billing-bill-preview-header">
                <div>
                  <h2>Bill</h2>

                  <p>
                    {bill.billNo
                      ? `Bill No: ${bill.billNo}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="billing-preview-close-button"
                  onClick={handleClosePreview}
                >
                  ×
                </button>
              </div>

              <div className="billing-bill-preview-content">
                <div className="billing-bill-document">
                  <div className="billing-bill-document-title">
                    <h1>BILL</h1>
                  </div>

                  <div className="billing-bill-parties">
                    <div className="billing-bill-party-box">
                      <div className="billing-bill-party-label">
                        From
                      </div>

                      <div className="billing-bill-party-name">
                        {selectedCompany?.name ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        {selectedCompany?.address ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        Mobile No:{" "}
                        {selectedCompany?.mobile ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        E-mail:{" "}
                        {selectedCompany?.email ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        Vendor No:{" "}
                        {selectedCompany?.vendorNo ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        GST No:{" "}
                        {selectedCompany?.gstNo ||
                          "—"}
                      </div>
                    </div>

                    <div className="billing-bill-party-box">
                      <div className="billing-bill-party-label">
                        To
                      </div>

                      <div className="billing-bill-party-name">
                        {selectedCustomer?.name ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        {selectedCustomer?.address ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        Mobile No:{" "}
                        {selectedCustomer?.mobile ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        E-mail:{" "}
                        {selectedCustomer?.email ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        Through:{" "}
                        {selectedCustomer?.through ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-text">
                        GST:{" "}
                        {selectedCustomer?.gstNo ||
                          "—"}
                      </div>

                      <div className="billing-bill-party-bill-info">
                        <span>
                          Bill No:{" "}
                          {bill.billNo || "—"}
                        </span>

                        <span>
                          Date:{" "}
                          {bill.date || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="billing-bill-subject-row">
                    <strong>Sub:</strong>

                    <span>
                      {bill.subject || "—"}
                    </span>
                  </div>

                  <div className="billing-bill-meta-row">
                    <div>
                      <strong>Ref:</strong>{" "}
                      {selectedQuotation?.quotation_no ||
                        "—"}
                    </div>

                    <div>
                      <strong>
                        Purchase Order:
                      </strong>{" "}
                      {bill.purchaseOrderNo ||
                        "—"}
                    </div>

                    <div>
                      <strong>Date:</strong>{" "}
                      {bill.poDate || "—"}
                    </div>

                    <div>
                      <strong>SAC No:</strong>{" "}
                      {selectedQuotation?.sac_no ||
                        "—"}
                    </div>
                  </div>

                  <table className="billing-bill-items-table">
                    <thead>
                      <tr>
                        <th
                          rowSpan="2"
                          className="billing-col-sno"
                        >
                          S. No
                        </th>

                        <th
                          rowSpan="2"
                          className="billing-col-description"
                        >
                          Job Description
                        </th>

                        <th
                          rowSpan="2"
                          className="billing-col-qty"
                        >
                          Qty
                        </th>

                        <th
                          rowSpan="2"
                          className="billing-col-unit"
                        >
                          Unit
                        </th>

                        <th
                          colSpan="2"
                          className="billing-group-header"
                        >
                          Rate
                        </th>

                        <th
                          colSpan="2"
                          className="billing-group-header"
                        >
                          Amount
                        </th>
                      </tr>

                      <tr>
                        <th className="billing-money-sub-header">
                          Rs.
                        </th>

                        <th className="billing-money-sub-header">
                          Ps.
                        </th>

                        <th className="billing-money-sub-header">
                          Rs.
                        </th>

                        <th className="billing-money-sub-header">
                          Ps.
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {previewItems.map(
                        (item, index) => {
                          const amount =
                            (Number(
                              item.quantity
                            ) || 0) *
                            (Number(
                              item.rate
                            ) || 0);

                          const rateParts =
                            splitAmount(
                              item.rate
                            );

                          const amountParts =
                            splitAmount(
                              amount
                            );

                          return (
                            <tr
                              key={item.id}
                              className={
                                index >= items.length
                                  ? "billing-empty-preview-row"
                                  : ""
                              }
                            >
                              <td className="billing-sno-cell">
                                {index <
                                items.length
                                  ? String(
                                      (index + 1) *
                                        10
                                    ).padStart(
                                      3,
                                      "0"
                                    )
                                  : ""}
                              </td>

                              <td className="billing-description-cell">
                                {index <
                                items.length
                                  ? item.description ||
                                    "—"
                                  : ""}
                              </td>

                              <td className="billing-qty-cell">
                                {index <
                                items.length
                                  ? item.quantity ||
                                    "—"
                                  : ""}
                              </td>

                              <td className="billing-unit-cell">
                                {index <
                                items.length
                                  ? item.unit ||
                                    "—"
                                  : ""}
                              </td>

                              <td className="billing-money-cell">
                                {index <
                                items.length
                                  ? rateParts.rs
                                  : ""}
                              </td>

                              <td className="billing-money-cell">
                                {index <
                                items.length
                                  ? rateParts.ps
                                  : ""}
                              </td>

                              <td className="billing-money-cell">
                                {index <
                                items.length
                                  ? amountParts.rs
                                  : ""}
                              </td>

                              <td className="billing-money-cell">
                                {index <
                                items.length
                                  ? amountParts.ps
                                  : ""}
                              </td>
                            </tr>
                          );
                        }
                      )}

                      <tr className="billing-bill-total-row">
                        <td
                          colSpan="6"
                          className="billing-total-empty-cell"
                        ></td>

                        <td
                          colSpan="2"
                          className="billing-total-combined-cell"
                        >
                          <span>Subtotal</span>

                          <strong>
                            ₹{" "}
                            {subtotal.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </strong>
                        </td>
                      </tr>

                      <tr className="billing-bill-total-row">
                        <td
                          colSpan="6"
                          className="billing-total-empty-cell"
                        ></td>

                        <td
                          colSpan="2"
                          className="billing-total-combined-cell"
                        >
                          <span>
                            CGST {cgstRate}%
                          </span>

                          <strong>
                            ₹{" "}
                            {cgst.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </strong>
                        </td>
                      </tr>

                      <tr className="billing-bill-total-row">
                        <td
                          colSpan="6"
                          className="billing-total-empty-cell"
                        ></td>

                        <td
                          colSpan="2"
                          className="billing-total-combined-cell"
                        >
                          <span>
                            SGST {sgstRate}%
                          </span>

                          <strong>
                            ₹{" "}
                            {sgst.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </strong>
                        </td>
                      </tr>

                      <tr className="billing-bill-grand-total-row">
                        <td
                          colSpan="6"
                          className="billing-total-empty-cell"
                        ></td>

                        <td
                          colSpan="2"
                          className="billing-total-combined-cell billing-grand-total-cell"
                        >
                          <div className="billing-total-content">
                            <span>TOTAL</span>

                            <strong>
                              ₹{" "}
                              {total.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="billing-preview-actions">
                <button
                  type="button"
                  className="billing-preview-cancel-button"
                  onClick={handleClosePreview}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="billing-print-button"
                  onClick={handlePrint}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="billing-billing-form">
          <div className="billing-form-row">
            <div className="billing-form-group">
              <label>Bill no.</label>

              <input
                type="text"
                value={bill.billNo}
                onChange={(e) =>
                  updateBill(
                    "billNo",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="billing-form-group">
              <label>Date</label>

              <input
                type="date"
                value={bill.date}
                onChange={(e) =>
                  updateBill(
                    "date",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="billing-form-group billing-full-width">
            <label>Subject</label>

            <input
              type="text"
              value={bill.subject}
              onChange={(e) =>
                updateBill(
                  "subject",
                  e.target.value
                )
              }
            />
          </div>

          <div className="billing-form-row">
            <div className="billing-form-group">
              <label>
                Purchase order no.
              </label>

              <input
                type="text"
                value={bill.purchaseOrderNo}
                onChange={(e) =>
                  updateBill(
                    "purchaseOrderNo",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="billing-form-group">
              <label>PO date</label>

              <input
                type="date"
                value={bill.poDate}
                onChange={(e) =>
                  updateBill(
                    "poDate",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="billing-line-items-section">
          <label className="billing-section-label">
            Line items
          </label>

          <div className="billing-items-table">
            <div className="billing-table-header">
              <div>S.No</div>
              <div>Job description</div>
              <div>Qty</div>
              <div>Unit</div>
              <div>Rate (Rs.)</div>
              <div>Amount</div>
              <div></div>
            </div>

            {items.map((item, index) => {
              const amount =
                (Number(item.quantity) || 0) *
                (Number(item.rate) || 0);

              return (
                <div
                  className="billing-table-row"
                  key={item.id}
                >
                  <div className="billing-serial-number">
                    {String(
                      (index + 1) * 10
                    ).padStart(3, "0")}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Enter job description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unit",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "rate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="billing-amount">
                    {amount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </div>

                  <button
                    type="button"
                    className="billing-delete-button"
                    onClick={() =>
                      removeLineItem(item.id)
                    }
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="billing-add-item-button"
            onClick={addLineItem}
          >
            <span>＋</span>
            Add line item
          </button>
        </div>

        <div className="billing-bottom-section">
          <div className="billing-gst-box">
            <h2>GST details</h2>

            <div className="billing-quotation-field">
              <label>GST rate</label>

              <div className="billing-gst-value">
                GST {cgstRate + sgstRate}%
              </div>
            </div>

            <div className="billing-amount-words">
              <span>Amount in words</span>

              <strong>
                {amountInWords(total)}
              </strong>
            </div>
          </div>

          <div className="billing-totals">
            <div className="billing-total-row">
              <span>Subtotal</span>

              <strong>
                {subtotal.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div className="billing-total-row">
              <span>
                CGST {cgstRate}%
              </span>

              <strong>
                {cgst.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div className="billing-total-row">
              <span>
                SGST {sgstRate}%
              </span>

              <strong>
                {sgst.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div className="billing-total-divider"></div>

            <div className="billing-total-row billing-final-total">
              <span>Total</span>

              <strong>
                {total.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="billing-save-actions">
          <button
            type="button"
            className="billing-save-button"
            onClick={handleSaveBill}
          >
            {editingBillId
              ? "Update Bill"
              : "Save Bill"}
          </button>
        </div>
      </div>

      {popup && (
        <div className="custom-popup-overlay" onClick={closePopup}>
          <div
            className={`custom-popup-modal custom-popup-${popup.type}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="custom-popup-header">
              <div className="custom-popup-title-area">
                <span className={`custom-popup-icon-badge popup-icon-${popup.type}`}>
                  {popup.type === "success" && "✓"}
                  {popup.type === "error" && "✕"}
                  {popup.type === "warning" && "!"}
                  {popup.type === "info" && "i"}
                  {popup.type === "confirm" && "?"}
                </span>
                <h3 className="custom-popup-title">{popup.title}</h3>
              </div>

              <button
                type="button"
                className="custom-popup-close-btn"
                onClick={closePopup}
              >
                ×
              </button>
            </div>

            <div className="custom-popup-body">
              <p>{popup.message}</p>
            </div>

            <div className="custom-popup-footer">
              {popup.type === "confirm" ? (
                <>
                  <button
                    type="button"
                    className="custom-popup-btn custom-popup-cancel-btn"
                    onClick={popup.onCancel || closePopup}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="custom-popup-btn custom-popup-confirm-btn"
                    onClick={popup.onConfirm}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="custom-popup-btn custom-popup-ok-btn"
                  onClick={closePopup}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BillingPage;