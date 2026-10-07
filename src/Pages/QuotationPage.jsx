import {
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import "./QuotationPage.css";
import { calculateGST } from "../utils/gstCalc";
import { amountInWords } from "../utils/amountInWords";
import Header from "../Components/Header";
import api from "../services/api"


function QuotationPage({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { quotationNo } = useParams();

  const [quotation, setQuotation] = useState({
    quotationNo: "",
    quotationDate: "",
    sacNo: "",
    subject: "",
    workCompletionDays: "",
  });

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      unit: "Each",
      rate: 0,
    },
  ]);

  const resetRequestRef = useRef(0);
  const resetTimerRef = useRef(null);   
  const isResettingRef = useRef(false);

  const [companyMaster, setCompanyMaster] =
    useState(null);

  const [customerMaster, setCustomerMaster] =
    useState(null);

  const [gstMaster, setGstMaster] =
    useState(null);

  const [showPreview, setShowPreview] =
    useState(false);

  const [savedQuotations, setSavedQuotations] =
    useState([]);

  const [quotationSearch, setQuotationSearch] =
    useState("");

  const [status, setStatus] =
    useState("DRAFT");

  const [quotationId, setQuotationId] =
    useState(null);

  const [isEditMode, setIsEditMode] =
    useState(false);

  const [showResetLoading, setShowResetLoading] =
    useState(false);

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

  const showSavedQuotations =
    location.pathname ===
    "/quotations/savedquotations";

  const fetchMasterData = useCallback(
    async () => {
      try {
        const response = await api.get(
          "/master"
        );

        if (response.data.success) {
          const data =
            response.data.data || [];

          const company = data.find(
            (item) => item.type === "company"
          );

          const customer = data.find(
            (item) => item.type === "customer"
          );

          const gst = data.find(
            (item) => item.type === "gst"
          );

          setCompanyMaster(
            company || null
          );

          setCustomerMaster(
            customer || null
          );

          setGstMaster(
            gst || null
          );
        }
      } catch (error) {
        console.error(
          "Master Data Fetch Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to load master data.",
          "error"
        );
      }
    },
    [showAlert]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMasterData();
  }, [fetchMasterData]);

  const fetchSavedQuotationsData =
    useCallback(async () => {
      try {
        const response = await api.get(
          "/quotations"
        );

        const quotations =
          response.data.data ||
          response.data.quotations ||
          response.data;

        setSavedQuotations(
          Array.isArray(quotations)
            ? quotations
            : []
        );
      } catch (error) {
        console.error(
          "Load Quotations Error:",
          error
        );
      }
    }, []);

 const loadQuotationByNumber = useCallback(
  async (targetNo) => {
    const requestId = ++resetRequestRef.current;

    try {
      const response = await api.get("/quotations");

      // Reset happened while API was running
      if (requestId !== resetRequestRef.current) {
        return;
      }

      const quotations =
        response.data.data ||
        response.data.quotations ||
        response.data;

      if (!Array.isArray(quotations)) {
        return;
      }

      setSavedQuotations(quotations);

      const found = quotations.find(
        (q) =>
          String(
            q.quotation_no ||
              q.quotationNo ||
              ""
          ).toLowerCase() ===
          String(targetNo).toLowerCase()
      );

      if (!found) {
        // Check again before changing state
        if (requestId !== resetRequestRef.current) {
          return;
        }

        setIsEditMode(false);
        setQuotationId(null);
        setStatus("DRAFT");

        setQuotation({
          quotationNo: targetNo,
          quotationDate: new Date()
            .toISOString()
            .slice(0, 10),
          sacNo: "998719",
          subject:
            "Quotation details for " + targetNo,
          workCompletionDays: 30,
        });

        setItems([
          {
            description: "",
            quantity: 1,
            unit: "Each",
            rate: 0,
          },
        ]);

        return;
      }

      const qId =
        found.id ||
        found.quotation_id;

      if (!qId) {
        return;
      }

      const detailRes = await api.get(
        `/quotations/${qId}`
      );

      // VERY IMPORTANT
      // If reset happened while detail API was loading,
      // don't put old quotation data back
      if (requestId !== resetRequestRef.current) {
        return;
      }

      const selectedQuotation =
        detailRes.data.data ||
        detailRes.data.quotation ||
        detailRes.data;

      setQuotation({
        quotationNo:
          selectedQuotation.quotation_no ||
          selectedQuotation.quotationNo ||
          "",

        quotationDate:
          selectedQuotation.quotation_date
            ? String(
                selectedQuotation.quotation_date
              ).slice(0, 10)
            : "",

        sacNo:
          selectedQuotation.sac_no ||
          "",

        subject:
          selectedQuotation.subject ||
          "",

        workCompletionDays:
          selectedQuotation.work_completion_days ?? "",
      });

      const quotationItems =
        selectedQuotation.items || [];

      setItems(
        quotationItems.length > 0
          ? quotationItems.map((item) => ({
              description:
                item.job_description || "",

              quantity:
                item.quantity ?? 1,

              unit:
                item.unit || "Each",

              rate:
                item.rate ?? 0,
            }))
          : [
              {
                description: "",
                quantity: 1,
                unit: "Each",
                rate: 0,
              },
            ]
      );

      setQuotationId(qId);
      setIsEditMode(true);

      setStatus(
        String(
          selectedQuotation.status ||
            "Draft"
        ).toUpperCase()
      );
    } catch (error) {
      // Ignore old API request after reset
      if (requestId !== resetRequestRef.current) {
        return;
      }

      console.error(
        "Error loading quotation by number:",
        error
      );

      setQuotation({
        quotationNo: "",
        quotationDate: "",
        sacNo: "",
        subject: "",
        workCompletionDays: "",
      });

      setItems([
        {
          description: "",
          quantity: 1,
          unit: "Each",
          rate: 0,
        },
      ]);

      setQuotationId(null);
      setIsEditMode(false);
      setStatus("DRAFT");
    }
  },
  []
);

  useEffect(() => {
  if (isResettingRef.current) {
    return;
  }

  if (
    location.pathname === "/quotations/savedquotations"
  ) {
    setShowPreview(false);
    fetchSavedQuotationsData();
    return;
  }

  if (quotationNo) {
    const shouldOpenPreview =
      location.state?.openPreview !== false;

    setShowPreview(shouldOpenPreview);

    if (quotation.quotationNo !== quotationNo) {
      loadQuotationByNumber(quotationNo);
    }

    return;
  }

  setShowPreview(false);
}, [
  location.pathname,
  location.state,
  quotationNo,
  quotation.quotationNo,
  fetchSavedQuotationsData,
  loadQuotationByNumber,
]);
  const cgstRate = Number(
    gstMaster?.cgstRate || 0
  );

  const sgstRate = Number(
    gstMaster?.sgstRate || 0
  );

  const gstRate =
    cgstRate + sgstRate;

  const handleQuotationChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setQuotation((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        description: "",
        quantity: 1,
        unit: "Each",
        rate: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const subtotal = items.reduce(
    (total, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const rate =
        Number(item.rate) || 0;

      return (
        total +
        quantity * rate
      );
    },
    0
  );

  const gstResult = calculateGST(
    subtotal,
    gstRate
  );

  const handleOpenSavedQuotations =
    async () => {
      navigate(
        "/quotations/savedquotations"
      );

      try {
        const response = await api.get(
          "/quotations"
        );

        console.log(
          "Saved quotations:",
          response.data
        );

        const quotations =
          response.data.data ||
          response.data.quotations ||
          response.data;

        setSavedQuotations(
          Array.isArray(quotations)
            ? quotations
            : []
        );
      } catch (error) {
        console.error(
          "Load Quotations Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to load quotations.",
          "error"
        );
      }
    };

  const handleCloseSavedQuotations =
    () => {
      if (quotation.quotationNo) {
        navigate(
          `/quotations/savedquotations/${encodeURIComponent(
            quotation.quotationNo
          )}`
        );
      } else {
        navigate("/quotations");
      }
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
      location.state?.from === "saved-quotations" ||
      location.state?.from === "saved-bills"
    ) {
      setShowPreview(false);
      return;
    }

    setShowPreview(false);
  };

  const filteredQuotations =
    savedQuotations.filter((item) => {
      const search =
        quotationSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        String(
          item.quotation_no || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(item.subject || "")
          .toLowerCase()
          .includes(search) ||
        String(item.status || "")
          .toLowerCase()
          .includes(search) ||
        String(
          item.quotation_date || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  const handleDeleteQuotation = (quotationItem) => {
    const quotationId =
      quotationItem.id ||
      quotationItem.quotation_id;

    if (!quotationId) {
      showAlert(
        "Quotation ID not found.",
        "warning"
      );
      return;
    }

    showConfirm(
      `Are you sure you want to delete quotation "${quotationItem.quotation_no || ""}"?`,
      async () => {
        try {
          await api.delete(
            `/quotations/${quotationId}`
          );

          setSavedQuotations((previous) =>
            previous.filter(
              (item) =>
                (item.id ||
                  item.quotation_id) !==
                quotationId
            )
          );

          showAlert(
            "Quotation deleted successfully.",
            "success"
          );
        } catch (error) {
          console.error(
            "Delete Quotation Error:",
            error
          );

          showAlert(
            error.response?.data?.message ||
              "Failed to delete quotation.",
            "error"
          );
        }
      },
      "Delete Quotation"
    );
  };

  const handleSelectQuotation =
    async (quotationItem, mode = "edit") => {
      try {
        const qId =
          quotationItem.id ||
          quotationItem.quotation_id;

        if (!qId) {
          showAlert(
            "Quotation ID not found.",
            "warning"
          );
          return;
        }

        const response = await api.get(
          `/quotations/${qId}`
        );

        const selectedQuotation =
          response.data.data ||
          response.data.quotation ||
          response.data;

        console.log(
          "Selected quotation:",
          selectedQuotation
        );

        setQuotation({
          quotationNo:
            selectedQuotation.quotation_no ||
            selectedQuotation.quotationNo ||
            "",

          quotationDate:
            selectedQuotation.quotation_date
              ? String(
                  selectedQuotation.quotation_date
                ).slice(0, 10)
              : "",

          sacNo:
            selectedQuotation.sac_no ||
            "",

          subject:
            selectedQuotation.subject ||
            "",

          workCompletionDays:
            selectedQuotation.work_completion_days ??
            "",
        });

        const quotationItems =
          selectedQuotation.items || [];

        setItems(
          quotationItems.length > 0
            ? quotationItems.map(
                (item) => ({
                  description:
                    item.job_description ||
                    "",

                  quantity:
                    item.quantity ?? 1,

                  unit:
                    item.unit ||
                    "Each",

                  rate:
                    item.rate ?? 0,
                })
              )
            : [
                {
                  description: "",
                  quantity: 1,
                  unit: "Each",
                  rate: 0,
                },
              ]
        );

        setQuotationId(qId);
        setIsEditMode(true);

        const selectedStatus =
          String(
            selectedQuotation.status ||
              "Draft"
          ).toUpperCase();

        setStatus(selectedStatus);

        const targetQuotationNo =
          selectedQuotation.quotation_no ||
          selectedQuotation.quotationNo ||
          quotationItem.quotation_no ||
          quotationItem.quotationNo;

        if (targetQuotationNo) {
          const nextPath = `/quotations/savedquotations/${encodeURIComponent(
            targetQuotationNo
          )}`;

          navigate(nextPath, {
            state: {
              from: mode === "preview" ? "saved-quotations" : "saved-quotations",
              openPreview: mode === "preview",
            },
          });

          if (mode === "preview") {
            setShowPreview(true);
          } else {
            setShowPreview(false);
          }
        }
      } catch (error) {
        console.error(
          "Select Quotation Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to load quotation.",
          "error"
        );
      }
    };

  const createQuotationPayload = (
    quotationStatus
  ) => {
    return {
      quotation_no:
        quotation.quotationNo,

      company_id:
        companyMaster?.id || null,

      customer_id:
        customerMaster?.id || null,

      quotation_date:
        quotation.quotationDate,

      subject:
        quotation.subject,

      sac_no:
        quotation.sacNo || null,

      prq_no: null,

      work_completion_days:
        quotation.workCompletionDays ===
        ""
          ? null
          : Number(
              quotation.workCompletionDays
            ),

      subtotal: subtotal,

      cgst_amount:
        gstResult.cgst,

      sgst_amount:
        gstResult.sgst,

      igst_amount: 0,

      grand_total:
        gstResult.total,

      amount_in_words:
        amountInWords(
          gstResult.total
        ),

      status:
        quotationStatus,

      items: items.map(
        (item, index) => ({
          serial_no: index + 1,

          job_description:
            item.description,

          quantity:
            Number(item.quantity) || 0,

          unit:
            item.unit || "",

          rate:
            Number(item.rate) || 0,

          amount:
            (Number(item.quantity) || 0) *
            (Number(item.rate) || 0),
        })
      ),
    };
  };

  const handleSaveDraft =
    async () => {
      try {
        if (
          !quotation.quotationNo.trim()
        ) {
          showAlert(
            "Please enter Quotation No.",
            "warning"
          );
          return;
        }

        if (!quotation.quotationDate) {
          showAlert(
            "Please select Quotation Date.",
            "warning"
          );
          return;
        }

        if (!quotation.subject.trim()) {
          showAlert(
            "Please enter Subject.",
            "warning"
          );
          return;
        }

        if (!companyMaster?.id) {
          showAlert(
            "Company master data not found.",
            "warning"
          );
          return;
        }

        if (!customerMaster?.id) {
          showAlert(
            "Customer master data not found.",
            "warning"
          );
          return;
        }

        if (!gstMaster) {
          showAlert(
            "GST master data not found.",
            "warning"
          );
          return;
        }

        const payload =
          createQuotationPayload(
            "Draft"
          );

        const response =
          await api.post(
            "/quotations",
            payload
          );

        console.log(
          "Quotation saved:",
          response.data
        );

        const savedQuotation =
          response.data.data ||
          response.data.quotation ||
          response.data;

        console.log(
          "Saved quotation object:",
          savedQuotation
        );

        console.log(
          "Saved quotation ID:",
          savedQuotation?.id
        );

        setQuotationId(
          savedQuotation?.id ||
            savedQuotation?.quotation_id
        );

        setStatus("DRAFT");

        showAlert(
          "Quotation saved successfully.",
          "success"
        );
      } catch (error) {
        console.error(
          "Save Draft Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to save quotation.",
          "error"
        );
      }
    };

  const handleSubmit =
    async () => {
      try {
        if (!quotationId) {
          showAlert(
            "Please save the quotation as Draft first.",
            "warning"
          );
          return;
        }

        if (status !== "DRAFT") {
          showAlert(
            "Only Draft quotations can be submitted.",
            "warning"
          );
          return;
        }

        if (!companyMaster?.id) {
          showAlert(
            "Company master data not found.",
            "warning"
          );
          return;
        }

        if (!customerMaster?.id) {
          showAlert(
            "Customer master data not found.",
            "warning"
          );
          return;
        }

        if (!gstMaster) {
          showAlert(
            "GST master data not found.",
            "warning"
          );
          return;
        }

        const payload =
          createQuotationPayload(
            "Submitted"
          );

        const response =
          await api.put(
            `/quotations/${quotationId}`,
            payload
          );

        console.log(
          "Quotation submitted:",
          response.data
        );

        setStatus("SUBMITTED");

        showAlert(
          "Quotation submitted successfully.",
          "success"
        );
      } catch (error) {
        console.error(
          "Submit Quotation Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to submit quotation.",
          "error"
        );
      }
    };

  const handleUpdate = async () => {
    try {
      if (!quotationId) {
        showAlert("Quotation ID not found.", "warning");
        return;
      }

      if (!quotation.quotationNo.trim()) {
        showAlert("Please enter Quotation No.", "warning");
        return;
      }

      if (!quotation.quotationDate) {
        showAlert("Please select Quotation Date.", "warning");
        return;
      }

      if (!quotation.subject.trim()) {
        showAlert("Please enter Subject.", "warning");
        return;
      }

      if (!companyMaster?.id) {
        showAlert("Company master data not found.", "warning");
        return;
      }

      if (!customerMaster?.id) {
        showAlert("Customer master data not found.", "warning");
        return;
      }

      if (!gstMaster) {
        showAlert("GST master data not found.", "warning");
        return;
      }

      const payload = createQuotationPayload(displayStatus);

      const response = await api.put(
        `/quotations/${quotationId}`,
        payload
      );

      console.log("Quotation updated:", response.data);

      await fetchSavedQuotationsData();

      showAlert("Quotation updated successfully.", "success");
    } catch (error) {
      console.error("Update Quotation Error:", error);
      showAlert(
        error.response?.data?.message ||
          "Failed to update quotation.",
        "error"
      );
    }
  };

  const handleApprove =
    async () => {
      try {
        if (!quotationId) {
          showAlert(
            "Quotation ID not found.",
            "warning"
          );
          return;
        }

        await api.put(
          `/quotations/${quotationId}`,
          {
            status: "Approved",
          }
        );

        setStatus("APPROVED");
        await fetchSavedQuotationsData();

        showAlert(
          "Quotation approved successfully.",
          "success"
        );
      } catch (error) {
        console.error(
          "Approve Quotation Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to approve quotation.",
          "error"
        );
      }
    };

  const handleReject =
    async () => {
      try {
        if (!quotationId) {
          showAlert(
            "Quotation ID not found.",
            "warning"
          );
          return;
        }

        await api.put(
          `/quotations/${quotationId}`,
          {
            status: "Rejected",
          }
        );

        setStatus("REJECTED");
        await fetchSavedQuotationsData();

        showAlert(
          "Quotation rejected successfully.",
          "success"
        );
      } catch (error) {
        console.error(
          "Reject Quotation Error:",
          error
        );

        showAlert(
          error.response?.data?.message ||
            "Failed to reject quotation.",
          "error"
        );
      }
    };

  const handleReset = () => {
  resetRequestRef.current += 1;
  isResettingRef.current = true;

  if (resetTimerRef.current) {
    clearTimeout(resetTimerRef.current);
  }

  setShowResetLoading(true);

  setQuotation({
    quotationNo: "",
    quotationDate: "",
    sacNo: "",
    subject: "",
    workCompletionDays: "",
  });

  setItems([
    {
      description: "",
      quantity: 1,
      unit: "Each",
      rate: 0,
    },
  ]);

  setStatus("DRAFT");
  setQuotationId(null);
  setIsEditMode(false);
  setShowPreview(false);
  setQuotationSearch("");

  resetTimerRef.current = setTimeout(() => {
    navigate("/quotations", {
      replace: true,
      state: null,
    });
  navigate("/quotations", {
    replace: true,
    state: null,
  });

  setShowResetLoading(false);

   isResettingRef.current = false;
  }, 1000);
};

  const handlePrint = () => {
    const quotationDocument =
      document.querySelector(
        ".quotation-preview-document"
      );

    if (!quotationDocument) {
      showAlert(
        "Quotation preview not found.",
        "warning"
      );
      return;
    }

    const printContainer =
      document.createElement("div");

    printContainer.className =
      "quotation-print-container";

    printContainer.innerHTML =
      quotationDocument.outerHTML;

    document.body.appendChild(
      printContainer
    );

    const printStyle =
      document.createElement("style");

    printStyle.id =
      "quotation-print-style";

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

        body > *:not(.quotation-print-container) {
          display: none !important;
        }

        .quotation-print-container {
          display: block !important;
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: white !important;
          box-sizing: border-box !important;
        }

        .quotation-print-container
        .quotation-preview-document {
          width: 269.23mm !important;
          height: 380.77mm !important;
          min-height: 297mm !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 4mm 8mm 8mm !important;
          box-sizing: border-box !important;
          background: white !important;
          border: none !important;
          box-shadow: none !important;
          overflow: hidden !important;
          zoom: 0.78 !important;
        }

        .quotation-preview-overlay,
        .quotation-preview-modal-header,
        .quotation-preview-modal-footer {
          display: none !important;
        }

        .quotation-print-container table {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .quotation-print-container tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .quotation-print-container * {
          page-break-before: auto !important;
        }
      }

      @media screen {
        .quotation-print-container {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(
      printStyle
    );

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        printContainer.remove();
        printStyle.remove();
      }, 500);
    }, 200);
  };

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const displayStatus =
    {
      DRAFT: "Draft",
      SUBMITTED: "Submitted",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    }[status] || status;

  return (
    <>
      {showResetLoading && (
        <div className="quotation-reset-loading">
          <div className="quotation-reset-spinner"></div>

          <span>
            Resetting quotation...
          </span>
        </div>
      )}

      <Header
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Quotations"
      >
        <div className="quotation-header-actions">
          <button
            type="button"
            className="quotation-saved-quotations-button"
            onClick={
              handleOpenSavedQuotations
            }
          >
            <span>▣</span>
            Saved Quotations
          </button>

          <button
            type="button"
            className="quotation-preview-button"
            onClick={() =>
              setShowPreview(true)
            }
          >
            <span>◉</span>
            Preview
          </button>

          <button
            type="button"
            className="quotation-reset-button"
            onClick={handleReset}
          >
            ↻ Reset
          </button>
        </div>
      </Header>

      <main className="quotation-main">
        <section className="quotation-form-section">
          <div className="quotation-two-column">
            <div className="quotation-field">
              <label>
                Quotation no.
              </label>

              <input
                type="text"
                name="quotationNo"
                value={
                  quotation.quotationNo
                }
                onChange={
                  handleQuotationChange
                }
              />
            </div>

            <div className="quotation-field">
              <label>Date</label>

              <input
                type="date"
                name="quotationDate"
                value={
                  quotation.quotationDate
                }
                onChange={
                  handleQuotationChange
                }
              />
            </div>
          </div>

          <div className="quotation-field quotation-full-width">
            <label>Subject</label>

            <input
              type="text"
              name="subject"
              value={
                quotation.subject
              }
              onChange={
                handleQuotationChange
              }
              placeholder="Enter quotation subject"
            />
          </div>

          <div className="quotation-two-column">
            <div className="quotation-field">
              <label>SAC no.</label>

              <input
                type="text"
                name="sacNo"
                value={
                  quotation.sacNo
                }
                onChange={
                  handleQuotationChange
                }
              />
            </div>

            <div className="quotation-field">
              <label>
                Work completion, days after PO
              </label>

              <input
                type="number"
                min="0"
                name="workCompletionDays"
                value={
                  quotation.workCompletionDays
                }
                onChange={
                  handleQuotationChange
                }
              />
            </div>
          </div>
        </section>

        <section className="quotation-items-section">
          <div className="quotation-section-title-row">
            <div>
              <h2>Line items</h2>

              <p>
                Add the work or materials
                included in this quotation.
              </p>
            </div>
          </div>

          <div className="quotation-items-table-wrapper">
            <table className="quotation-items-table">
              <thead>
                <tr>
                  <th className="quotation-serial-column">
                    S.No
                  </th>

                  <th>
                    Job description
                  </th>

                  <th className="quotation-qty-column">
                    Qty
                  </th>

                  <th className="quotation-unit-column">
                    Unit
                  </th>

                  <th className="quotation-rate-column">
                    Rate (Rs.)
                  </th>

                  <th className="quotation-amount-column">
                    Amount
                  </th>

                  <th className="quotation-delete-column"></th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (item, index) => {
                    const amount =
                      (Number(
                        item.quantity
                      ) || 0) *
                      (Number(
                        item.rate
                      ) || 0);

                    return (
                      <tr key={index}>
                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <input
                            className="quotation-table-input quotation-description-input"
                            type="text"
                            value={
                              item.description
                            }
                            onChange={(
                              event
                            ) =>
                              handleItemChange(
                                index,
                                "description",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Enter job description"
                          />
                        </td>

                        <td>
                          <input
                            className="quotation-table-input quotation-small-input"
                            type="number"
                            min="0"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              handleItemChange(
                                index,
                                "quantity",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="quotation-table-input"
                            type="text"
                            value={
                              item.unit
                            }
                            onChange={(
                              event
                            ) =>
                              handleItemChange(
                                index,
                                "unit",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="quotation-table-input quotation-rate-input"
                            type="number"
                            min="0"
                            value={
                              item.rate
                            }
                            onChange={(
                              event
                            ) =>
                              handleItemChange(
                                index,
                                "rate",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td className="quotation-amount-cell">
                          {money(amount)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="quotation-delete-button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            disabled={
                              items.length ===
                              1
                            }
                            title="Delete item"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="quotation-add-item-button"
            onClick={addItem}
          >
            <span>＋</span>
            Add line item
          </button>
        </section>

        <section className="quotation-bottom-section">
          <div className="quotation-gst-box">
            <h2>GST details</h2>

            <div className="quotation-field">
              <label>GST rate</label>

              <div className="quotation-gst-value">
                {gstMaster
                  ? `GST ${gstRate}%`
                  : "—"}
              </div>
            </div>

            <div className="quotation-amount-words">
              <span>
                Amount in words
              </span>

              <strong>
                {amountInWords(
                  gstResult.total
                )}
              </strong>
            </div>
          </div>

          <div className="quotation-totals-box">
            <div className="quotation-total-row">
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div className="quotation-total-row">
              <span>
                CGST {cgstRate}%
              </span>

              <strong>
                {money(
                  gstResult.cgst
                )}
              </strong>
            </div>

            <div className="quotation-total-row">
              <span>
                SGST {sgstRate}%
              </span>

              <strong>
                {money(
                  gstResult.sgst
                )}
              </strong>
            </div>

            <div className="quotation-total-divider"></div>

            <div className="quotation-grand-total-row">
              <span>
                Total
              </span>

              <strong>
                {money(
                  gstResult.total
                )}
              </strong>
            </div>
          </div>
        </section>

        <div className="quotation-status-area">
          <span className="quotation-status-label">
            Status
          </span>

          <span
            className={`quotation-status-badge quotation-status-${status.toLowerCase()}`}
          >
            {displayStatus}
          </span>
        </div>

        <div className="quotation-action-bar">
          {!isEditMode ? (
            <>
              <button
                type="button"
                className="quotation-button quotation-secondary-button"
                onClick={handleSaveDraft}
                disabled={status !== "DRAFT" || !!quotationId}
              >
                Save Draft
              </button>

              <button
                type="button"
                className="quotation-button quotation-primary-button"
                onClick={handleSubmit}
                disabled={!quotationId || status !== "DRAFT"}
              >
                Submit
              </button>

              {quotationId &&
                ["SUBMITTED", "APPROVED", "REJECTED"].includes(status) && (
                  <>
                    <button
                      type="button"
                      className="quotation-button quotation-approve-button"
                      onClick={handleApprove}
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      className="quotation-button quotation-reject-button"
                      onClick={handleReject}
                    >
                      Reject
                    </button>
                  </>
                )}
            </>
          ) : (
            <>
              <button
                type="button"
                className="quotation-button quotation-update-button quotation-primary-button"
                onClick={handleUpdate}
              >
                Update
              </button>

              <button
                type="button"
                className="quotation-button quotation-approve-button"
                onClick={handleApprove}
              >
                Approve
              </button>

              <button
                type="button"
                className="quotation-button quotation-reject-button"
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </main>

      {showSavedQuotations && (
        <div
          className="quotation-preview-overlay"
          onClick={
            handleCloseSavedQuotations
          }
        >
          <div
            className="quotation-preview-modal quotation-saved-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="quotation-preview-modal-header">
              <div>
                <h2>
                  Saved Quotations
                </h2>
              </div>

              <button
                type="button"
                className="quotation-preview-close-button"
                onClick={
                  handleCloseSavedQuotations
                }
              >
                ×
              </button>
            </div>

            <div className="quotation-saved-search">
              <input
                type="text"
                value={
                  quotationSearch
                }
                onChange={(event) =>
                  setQuotationSearch(
                    event.target.value
                  )
                }
                placeholder="Search quotation..."
              />
            </div>

            <div className="quotation-preview-scroll-area">
              {savedQuotations.length ===
              0 ? (
                <p>
                  No quotations found.
                </p>
              ) : filteredQuotations.length ===
                0 ? (
                <p>
                  No matching quotations
                  found.
                </p>
              ) : (
                filteredQuotations.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="quotation-saved-card"
                    >
                      <div className="quotation-saved-main">
                        <div className="quotation-saved-number">
                          {item.quotation_no ||
                            "No quotation number"}
                        </div>

                        <div className="quotation-saved-date">
                          {item.quotation_date
                            ? String(
                                item.quotation_date
                              ).slice(
                                0,
                                10
                              )
                            : "—"}
                        </div>
                      </div>

                      <div className="quotation-saved-middle">
                        <div className="quotation-saved-subject">
                          {item.subject ||
                            "No subject"}
                        </div>

                        <div
                          className={`quotation-saved-status quotation-status-${String(
                            item.status ||
                              "draft"
                          ).toLowerCase()}`}
                        >
                          {item.status ||
                            "Draft"}
                        </div>
                      </div>

                      <div className="quotation-saved-right">
                        <div className="quotation-saved-total">
                          ₹{" "}
                          {money(
                            item.grand_total
                          )}
                        </div>

                        <div className="quotation-saved-actions">
                          <button
                            type="button"
                            className="quotation-saved-edit-button"
                            onClick={() =>
                              handleSelectQuotation(
                                item,
                                "preview"
                              )
                            }
                          >
                            Preview
                          </button>

                          <button
                            type="button"
                            className="quotation-saved-edit-button"
                            onClick={() =>
                              handleSelectQuotation(
                                item,
                                "edit"
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="quotation-saved-delete-button"
                            onClick={() =>
                              handleDeleteQuotation(
                                item
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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
          className="quotation-preview-overlay"
          onClick={handleClosePreview}
        >
          <div
            className="quotation-preview-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="quotation-preview-modal-header">
              <div>
                <h2>Quotation</h2>
              </div>

              <button
                type="button"
                className="quotation-preview-close-button"
                onClick={handleClosePreview}
              >
                ×
              </button>
            </div>

            <div className="quotation-preview-scroll-area">
              <div className="quotation-preview-document">
                <div className="quotation-document-title">
                  <h1>QUOTATION</h1>
                </div>

                <div className="quotation-document-meta">
                  <span>
                    Quotation No:{" "}
                    <strong>
                      {quotation.quotationNo ||
                        "—"}
                    </strong>
                  </span>

                  <span>
                    Date:{" "}
                    <strong>
                      {quotation.quotationDate ||
                        "—"}
                    </strong>
                  </span>
                </div>

                <div className="quotation-document-parties">
                  <div className="quotation-document-party">
                    <div className="quotation-document-label">
                      From
                    </div>

                    <strong>
                      {companyMaster?.name ||
                        "—"}
                    </strong>

                    <p>
                      {companyMaster?.address ||
                        "—"}
                    </p>

                    <p>
                      Mobile No:{" "}
                      {companyMaster?.mobile ||
                        "—"}
                    </p>

                    {companyMaster?.email && (
                      <p>
                        E-mail:{" "}
                        {companyMaster.email}
                      </p>
                    )}

                    <p>
                      Vendor No:{" "}
                      {companyMaster?.vendorNo ||
                        "—"}
                    </p>

                    <p>
                      GST No:{" "}
                      {companyMaster?.gstNo ||
                        "—"}
                    </p>
                  </div>

                  <div className="quotation-document-party">
                    <div className="quotation-document-label">
                      To
                    </div>

                    <strong>
                      {customerMaster?.name ||
                        "—"}
                    </strong>

                    <p>
                      {customerMaster?.address ||
                        "—"}
                    </p>

                    <p>
                      Through:{" "}
                      {customerMaster?.through ||
                        "—"}
                    </p>

                    <p>
                      Mobile No:{" "}
                      {customerMaster?.mobile ||
                        "—"}
                    </p>

                    {customerMaster?.email && (
                      <p>
                        E-mail:{" "}
                        {customerMaster.email}
                      </p>
                    )}

                    <p>
                      GST:{" "}
                      {customerMaster?.gstNo ||
                        "—"}
                    </p>

                    <p>
                      Q. No:{" "}
                      {quotation.quotationNo ||
                        "—"}
                      <br />
                      Date:{" "}
                      {quotation.quotationDate ||
                        "—"}
                    </p>
                  </div>
                </div>

                <div className="quotation-document-subject-row">
                  <div>
                    <strong>
                      Sub:
                    </strong>{" "}
                    {quotation.subject ||
                      "—"}
                  </div>

                  <div>
                    <strong>
                      SAC No:
                    </strong>{" "}
                    {quotation.sacNo ||
                      "—"}
                  </div>
                </div>

                <div className="quotation-document-reference-row">
                  <div>
                    <strong>
                      Ref:
                    </strong>{" "}
                    —
                  </div>

                  <div>
                    <strong>
                      Purchase Order:
                    </strong>{" "}
                    —
                  </div>

                  <div>
                    <strong>
                      Date:
                    </strong>{" "}
                    {quotation.quotationDate ||
                      "—"}
                  </div>

                  <div>
                    <strong>
                      SAC No:
                    </strong>{" "}
                    {quotation.sacNo ||
                      "—"}
                  </div>
                </div>

                <table className="quotation-document-items-table">
                 <colgroup>
  <col className="col-sno-width" />
  <col className="col-description-width" />
  <col className="col-qty-width" />
  <col className="col-unit-width" />

  <col className="col-rate-rs-width" />
  <col className="col-rate-ps-width" />

  <col className="col-amount-rs-width" />
  <col className="col-amount-ps-width" />
</colgroup>
                  <thead>
                    <tr>
                      <th
                        rowSpan="2"
                        className="col-sno"
                      >
                        S. No
                      </th>

                      <th
                        rowSpan="2"
                        className="col-description"
                      >
                        Job Description
                      </th>

                      <th
                        rowSpan="2"
                        className="col-qty"
                      >
                        Qty
                      </th>

                      <th
                        rowSpan="2"
                        className="col-unit"
                      >
                        Unit
                      </th>

                      <th
                        colSpan="2"
                        className="col-rate"
                      >
                        Rate
                      </th>

                      <th
                        colSpan="2"
                        className="col-amount"
                      >
                        Amount
                      </th>
                    </tr>

                    <tr>
                      <th>Rs.</th>
                      <th>Ps.</th>
                      <th>Rs.</th>
                      <th>Ps.</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (item, index) => {
                        const quantity =
                          Number(
                            item.quantity
                          ) || 0;

                        const rate =
                          Number(
                            item.rate
                          ) || 0;

                        const amount =
                          quantity * rate;

                        const rateRs =
                          Math.floor(
                            rate
                          );

                        const ratePs =
                          Math.round(
                            (rate -
                              rateRs) *
                              100
                          );

                        const amountRs =
                          Math.floor(
                            amount
                          );

                        const amountPs =
                          Math.round(
                            (amount -
                              amountRs) *
                              100
                          );

                        return (
                          <tr
                            key={index}
                          >
                            <td>
                              {String(
                                index + 1
                              ).padStart(
                                3,
                                "0"
                              )}
                            </td>

                            <td className="description-cell">
                              {item.description ||
                                "—"}
                            </td>

                            <td>
                              {item.quantity ||
                                0}
                            </td>

                            <td>
                              {item.unit ||
                                "Each"}
                            </td>

                            <td>
                              {rateRs.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              {String(
                                ratePs
                              ).padStart(
                                2,
                                "0"
                              )}
                            </td>

                            <td>
                              {amountRs.toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              {String(
                                amountPs
                              ).padStart(
                                2,
                                "0"
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}

                    {Array.from({
                      length: Math.max(0, 5 - items.length)
                      }).map((_, index) => (
                      <tr
                        key={`empty-${index}`}
                        className="quotation-empty-row"
                      >
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                  ))}

<tr className="quotation-summary-row">
  <td colSpan="2"></td>

  <td
    colSpan="4"
    className="quotation-summary-label-cell"
  >
    <span>Subtotal</span>
  </td>

  <td
    colSpan="2"
    className="quotation-summary-value-cell"
  >
    <strong>
      ₹{money(subtotal)}
    </strong>
  </td>
</tr>

<tr className="quotation-summary-row">
  <td colSpan="2"></td>

  <td
    colSpan="4"
    className="quotation-summary-label-cell"
  >
    <span>CGST {cgstRate}%</span>
  </td>

  <td
    colSpan="2"
    className="quotation-summary-value-cell"
  >
    <strong>
      ₹{money(gstResult.cgst)}
    </strong>
  </td>
</tr>

<tr className="quotation-summary-row">
  <td colSpan="2"></td>

  <td
    colSpan="4"
    className="quotation-summary-label-cell"
  >
    <span>SGST {sgstRate}%</span>
  </td>

  <td
    colSpan="2"
    className="quotation-summary-value-cell"
  >
    <strong>
      ₹{money(gstResult.sgst)}
    </strong>
  </td>
</tr>

<tr className="quotation-summary-row quotation-total-row">
  <td colSpan="2"></td>

  <td
    colSpan="4"
    className="quotation-summary-label-cell"
  >
    <span>TOTAL</span>
  </td>

  <td
    colSpan="2"
    className="quotation-summary-value-cell"
  >
    <strong>
      ₹{money(gstResult.total)}
    </strong>
  </td>
</tr>
                  </tbody>
                </table>

                <div className="quotation-document-amount-words">
                  <strong>
                    Amount in words:
                  </strong>{" "}
                  {amountInWords(
                    gstResult.total
                  )}
                </div>

                <div className="quotation-document-work">
                  <strong>
                    Work Complete After PO:
                  </strong>{" "}
                  {quotation.workCompletionDays
                    ? `${quotation.workCompletionDays} DAYS`
                    : "—"}
                </div>

                <div className="quotation-document-signature">
                  <div className="quotation-signature-line"></div>

                  <strong>
                    Contractor
                  </strong>
                </div>
              </div>
            </div>

            <div className="quotation-preview-modal-footer">
              <button
                type="button"
                className="quotation-button quotation-secondary-button"
                onClick={handleClosePreview}
              >
                Close
              </button>

              <button
                type="button"
                className="quotation-button quotation-primary-button"
                onClick={handlePrint}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

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
      )}col-sno-width
    </>
  );
}

export default QuotationPage;