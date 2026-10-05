import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import coatsLogo from "../assets/coats-logo.png";
import "./TSA.css";
import Header from "../Components/Header";
import api from "../services/api";
import dashboardData from "../Data/dashboardData";
const DEFAULT_ROWS = [
  {
    id: 1,
    job: "",
    hazard: "",
    control: "",
    f: "",
    d: "",
    n: "",
    c1: "",
    p: "",
    c2: "",
    pxc: "",
    actionReq: "",
    newControlMeasures: "",
    resF: "",
    resC: "",
    resPxc: "",
    date: "",
    currentRisk: "",
  },
  {
    id: 2,
    job: "",
    hazard: "",
    control: "",
    f: "",
    d: "",
    n: "",
    c1: "",
    p: "",
    c2: "",
    pxc: "",
    actionReq: "",
    newControlMeasures: "",
    resF: "",
    resC: "",
    resPxc: "",
    date: "",
    currentRisk: "",
  },
  {
    id: 3,
    job: "",
    hazard: "",
    control: "",
    f: "",
    d: "",
    n: "",
    c1: "",
    p: "",
    c2: "",
    pxc: "",
    actionReq: "",
    newControlMeasures: "",
    resF: "",
    resC: "",
    resPxc: "",
    date: "",
    currentRisk: "",
  },
  {
    id: 4,
    job: "",
    hazard: "",
    control: "",
    f: "",
    d: "",
    n: "",
    c1: "",
    p: "",
    c2: "",
    pxc: "",
    actionReq: "",
    newControlMeasures: "",
    resF: "",
    resC: "",
    resPxc: "",
    date: "",
    currentRisk: "",
  },
  {
    id: 5,
    job: "",
    hazard: "",
    control: "",
    f: "",
    d: "",
    n: "",
    c1: "",
    p: "",
    c2: "",
    pxc: "",
    actionReq: "",
    newControlMeasures: "",
    resF: "",
    resC: "",
    resPxc: "",
    date: "",
    currentRisk: "",
  },
];

const DEFAULT_TEAM_MEMBERS = [
  "GOPALSAMY P",
  "GOMATHI NAYAGAM. C",
  "M.STALIN",
  "Mani Karthick",
  "SARAVANAN M",
];

function TSA({ isOpen,setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { taraId: routeTaraId } = useParams();

  const [currentStep, setCurrentStep] = useState(1);

  const initialDraft = (() => {
    try {
      const saved = localStorage.getItem("tara_draft");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const [site, setSite] = useState("");
  const [department, setDepartment] = useState("");
  const [machine, setMachine] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [additionalTask, setAdditionalTask] = useState("");
  const [othersAtRisk, setOthersAtRisk] = useState("");

  const [taraId, setTaraId] = useState(() => {
    const draftTaraId = String(initialDraft?.taraId || "").trim();
    return draftTaraId && !["02", "engg-02"].includes(draftTaraId.toLowerCase())
      ? draftTaraId
      : "";
  });
  const [date, setDate] = useState(() => initialDraft?.date || "");
  const [revisionNo, setRevisionNo] = useState(() => {
    if (initialDraft?.revisionNo && initialDraft.revisionNo !== "1")
      return initialDraft.revisionNo;
    return "";
  });
  const [nextRevisionDate, setNextRevisionDate] = useState(
    () => initialDraft?.nextRevisionDate || "",
  );

  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = initialDraft?.teamMembers || initialDraft?.tara_team;
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return [...DEFAULT_TEAM_MEMBERS];
  });

  const [rows, setRows] = useState(DEFAULT_ROWS);

  const [sopSteps, setSopSteps] = useState([]);
  const [savedTaraList, setSavedTaraList] = useState([]);
  const [editingTaraId, setEditingTaraId] = useState(null);
  const [showSavedTara, setShowSavedTara] = useState(false);
  const [deleteConfirmTara, setDeleteConfirmTara] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isEditSubmit, setIsEditSubmit] = useState(false);

  const [errors, setErrors] = useState({});

  const [printTarget, setPrintTarget] = useState("all");

  const fetchTaraList = async () => {
    try {
      const response = await api.get("/tara");
      setSavedTaraList(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch TaRA records:", error);
      return [];
    }
  };

  const fetchTaraDetails = async (id) => {
    const [taraResponse, itemsResponse, sopsResponse] = await Promise.all([
      api.get(`/tara/${id}`),
      api.get(`/tara-items/assessment/${id}`).catch(() => ({ data: [] })),
      api.get(`/sops/assessment/${id}`).catch(() => ({ data: [] })),
    ]);

    const taraData = taraResponse.data?.data || taraResponse.data?.tara || taraResponse.data;
    const riskItems = itemsResponse.data?.data || itemsResponse.data || [];
    const sopSteps = sopsResponse.data?.data || sopsResponse.data || [];

    return {
      ...taraData,
      riskItems: taraData.riskItems || taraData.risk_items || riskItems,
      sopSteps: taraData.sopSteps || taraData.sop_steps || sopSteps,
    };
  };

  const applyTaraDataToState = (payload) => {
    const data = payload?.data || payload?.tara || payload || {};
    const riskItems =
      data.riskItems ||
      data.risk_items ||
      data.taskRiskItems ||
      data.TaskRiskItems ||
      data.items ||
      [];
    const sopRecords =
      data.sopSteps ||
      data.sop_steps ||
      data.sops ||
      data.Sops ||
      [];

    setEditingTaraId(data.id || null);

    setTaraId(data.tara_no || "");
    setSite(data.site || "");
    setDepartment(data.department || "");
    setMachine(data.machine_area || "");
    setTaskDescription(data.task_description || "");
    setAdditionalTask(data.performing_task || "");
    setOthersAtRisk(data.others_at_risk || "");

    setDate(
      data.assessment_date && data.assessment_date !== "0000-00-00"
        ? data.assessment_date
        : ""
    );

    setRevisionNo(
      data.revision_no !== null && data.revision_no !== undefined && data.revision_no !== 0
        ? String(data.revision_no)
        : ""
    );

    setNextRevisionDate(
      data.next_revision_date && data.next_revision_date !== "0000-00-00"
        ? data.next_revision_date
        : ""
    );

    if (riskItems.length > 0) {
      setRows(
        [...riskItems]
          .filter((item) => Object.entries(item).some(([key, value]) =>
            key !== "id" && value !== undefined && value !== null && String(value).trim() !== ""
          ))
          .sort((first, second) => (first.serial_no || 0) - (second.serial_no || 0))
          .map((item, index) => ({
          id: item.id || index + 1,
          job: item.description || "",
          hazard: item.potential_hazard || "",
          control: item.safe_practice || "",

          f: item.initial_F ?? "",
          d: item.initial_D ?? "",
          n: item.initial_N ?? "",
          c1: item.initial_C ?? "",
          p: item.initial_P ?? "",
          c2: item.initial_C2 ?? "",
          pxc: item.initial_PXC ?? "",

          actionReq: item.action_required || "",
          newControlMeasures: item.new_control_measures || "",

          resF: item.residual_P ?? "",
          resC: item.residual_C ?? "",
          resPxc: item.residual_PXC ?? "",

          date: item.date_completed || "",
          currentRisk: item.current_risk_total ?? "",

          ...item,
          }))
      );
    } else if (data.rows && data.rows.length > 0) {
      setRows(data.rows);
    } else {
      setRows(DEFAULT_ROWS);
    }

    if (sopRecords.length > 0) {
      setSopSteps(
        sopRecords.map((sop, index) => {
          let points = sop.points;

          if (typeof points === "string") {
            try {
              points = JSON.parse(points);
            } catch {
              // Keep original string if not valid JSON
            }
          }

          let instructions = "";

          if (Array.isArray(points)) {
            instructions = points
              .map((point) =>
                String(point)
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, '"')
                  .trim()
              )
              .filter(Boolean)
              .join("\n");
          } else if (typeof points === "string") {
            instructions = points
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
              .replace(/^"+|"+$/g, "")
              .trim();
          } else if (sop.instructions) {
            instructions = sop.instructions;
          }

          return {
            id: sop.id || index + 1,
            heading: sop.heading || "",
            instructions,
          };
        })
      );
    } else {
      setSopSteps([]);
    }

    let incomingTeam = data.tara_team || data.teamMembers || data.taraTeam;
    if (typeof incomingTeam === "string") {
      try {
        incomingTeam = JSON.parse(incomingTeam);
      } catch {
        incomingTeam = incomingTeam.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(incomingTeam) && incomingTeam.length > 0) {
      setTeamMembers(incomingTeam);
    } else {
      setTeamMembers([...DEFAULT_TEAM_MEMBERS]);
    }

    setErrors({});
  };

  const loadTaraByTaraNoOrId = async (targetId, isView = true) => {
    if (!targetId || targetId === "savedtara") return;

    try {
      let list = savedTaraList;
      if (!list || list.length === 0) {
        list = await fetchTaraList();
      }

      // Look up by tara_no (user-entered tara id) first, then by primary id (UUID)
      const found = list.find(
        (t) =>
          String(t.tara_no || "").trim().toLowerCase() === String(targetId).trim().toLowerCase() ||
          String(t.id || "").trim().toLowerCase() === String(targetId).trim().toLowerCase()
      );

      let taraData = null;
      const fetchId = found ? found.id : targetId;

      try {
        taraData = await fetchTaraDetails(fetchId);
      } catch (err) {
        console.warn("API get /tara/:id returned error:", err);
      }

      if (!taraData && found) {
        taraData = found;
      }

      // Fallback: check dashboardData recent documents or risks
      if (!taraData) {
        const recentDoc = dashboardData?.recentDocuments?.find(
          (doc) => String(doc.id).toLowerCase() === String(targetId).toLowerCase()
        );
        const riskDoc = dashboardData?.risks?.find(
          (r) => String(r.id).toLowerCase() === String(targetId).toLowerCase()
        );
        const match = recentDoc || riskDoc;
        if (match) {
          taraData = {
            tara_no: match.id,
            site: match.company || "Coats India",
            department: "Engineering",
            machine_area: match.description || "General Plant",
            task_description: match.description || "Risk Assessment Task",
            performing_task: "Technical Team",
            others_at_risk: "All Department Executives & Pedestrian workers",
            assessment_date: match.date || new Date().toISOString().split("T")[0],
            revision_no: 1,
            next_revision_date: "",
            riskItems: [
              {
                id: 1,
                description: match.description || "Site safety assessment",
                potential_hazard: "Operational hazard",
                safe_practice: "Follow standard safety practices",
                initial_F: 3,
                initial_D: 2,
                initial_N: 1,
                initial_C: 2,
                initial_P: 2,
                initial_C2: 2,
                initial_PXC: 4,
                action_required: "Use PPE",
                new_control_measures: "Standard operating procedure",
                residual_P: 1,
                residual_C: 2,
                residual_PXC: 2,
                date_completed: match.date || "",
                current_risk_total: 2,
              },
            ],
            sopSteps: [
              {
                id: 1,
                heading: "Safety Controls",
                instructions: "• Wear personal protective equipment\n• Follow supervisor instructions",
              },
            ],
          };
        }
      }

      if (taraData) {
        applyTaraDataToState(taraData);
        if (isView) {
          setIsReviewModalOpen(true);
          setShowSavedTara(false);
          setIsViewOnly(true);
        } else {
          setIsViewOnly(false);
        }
      } else {
        setToastMessage(`❌ TaRA "${targetId}" not found.`);
        setTimeout(() => setToastMessage(""), 4500);
      }
    } catch (error) {
      console.error("Failed to load TaRA by tara_no / id:", error);
      setToastMessage("❌ Failed to load TaRA details.");
      setTimeout(() => setToastMessage(""), 4500);
    }
  };

  const handleEditTara = async (id) => {
    try {
      const data = await fetchTaraDetails(id);
      console.log("Editing TaRA:", data);

      applyTaraDataToState(data);
      setEditingTaraId(id);
      setIsViewOnly(false);
      setCurrentStep(1);
      setShowSavedTara(false);
      navigate("/risk-assessments", { state: { editingTaraId: id } });
    } catch (error) {
      console.error("Failed to load TaRA for editing:", error);
    }
  };

const handleDeleteTara = (id, taraNo) => {
  setDeleteConfirmTara({
    id,
    taraNo,
  });
};

const confirmDeleteTara = async () => {
  if (!deleteConfirmTara) {
    return;
  }

  try {
    await api.delete(`/tara/${deleteConfirmTara.id}`);

    await fetchTaraList();

    setDeleteConfirmTara(null);

    setToastMessage("✓ TaRA deleted successfully!");
    setTimeout(() => setToastMessage(""), 3500);
  } catch (error) {
    console.error("Failed to delete TaRA:", error);

    setDeleteConfirmTara(null);

    setToastMessage("❌ Failed to delete TaRA. Please try again.");
    setTimeout(() => setToastMessage(""), 4500);
  }
};
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchTaraList();
  }, []);

  useEffect(() => {
    if (location.pathname === "/risk-assessments/savedtara") {
      setShowSavedTara(true);
      setIsReviewModalOpen(false);
      setIsViewOnly(false);
      fetchTaraList();
    } else if (routeTaraId && routeTaraId !== "savedtara") {
      setShowSavedTara(false);
      loadTaraByTaraNoOrId(decodeURIComponent(routeTaraId), true);
    } else if (location.pathname === "/risk-assessments") {
      setShowSavedTara(false);
      setIsReviewModalOpen(false);
      setIsViewOnly(false);
      if (!location.state?.editingTaraId) {
        setEditingTaraId(null);
      }
    }
  }, [location.pathname, routeTaraId]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleSaveAsDraft = () => {
    const draftData = {
      site,
      department,
      machine,
      taskDescription,
      additionalTask,
      othersAtRisk,
      taraId,
      date,
      revisionNo,
      nextRevisionDate,
      rows,
      sopSteps,
      teamMembers,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("tara_draft", JSON.stringify(draftData));
      setToastMessage("✓ Draft saved successfully!");
      setTimeout(() => setToastMessage(""), 3500);
    } catch {
      setToastMessage("Error saving draft");
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleRowChange = (index, field, value) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows.length + 1,
        job: "",
        hazard: "",
        control: "",
        f: "",
        d: "",
        n: "",
        c1: "",
        p: "",
        c2: "",
        pxc: "",
        actionReq: "",
        newControlMeasures: "",
        resF: "",
        resC: "",
        resPxc: "",
        date: "",
        currentRisk: "",
      },
    ]);
  };

  const handleDeleteRow = (indexToDelete) => {
    setRows((prevRows) => {
      if (prevRows.length <= 1) {
        return [
          {
            id: 1,
            job: "",
            hazard: "",
            control: "",
            f: "",
            d: "",
            n: "",
            c1: "",
            p: "",
            c2: "",
            pxc: "",
            actionReq: "",
            newControlMeasures: "",
            resF: "",
            resC: "",
            resPxc: "",
            date: "",
            currentRisk: "",
          },
        ];
      }
      return prevRows
        .filter((_, idx) => idx !== indexToDelete)
        .map((row, idx) => ({ ...row, id: idx + 1 }));
    });
  };

  const handleReset = () => {
    setRows(DEFAULT_ROWS);
  };

  const handleTeamMemberChange = (index, value) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddTeamMember = () => {
    setTeamMembers((prev) => [...prev, ""]);
  };

  const handleRemoveTeamMember = (indexToRemove) => {
    setTeamMembers((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSopHeadingChange = (index, value) => {
    if (errors.sop) setErrors((prev) => ({ ...prev, sop: undefined }));
    setSopSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], heading: value };
      return updated;
    });
  };

  const handleSopChange = (index, value) => {
    if (errors.sop) setErrors((prev) => ({ ...prev, sop: undefined }));
    let formattedValue = value;

    if (
      formattedValue.trim() === "" ||
      formattedValue === "•" ||
      formattedValue === "• "
    ) {
      formattedValue = "";
    } else if (
      formattedValue.length > 0 &&
      !formattedValue.startsWith("• ") &&
      !formattedValue.startsWith("•")
    ) {
      formattedValue = "• " + formattedValue.replace(/^•?\s*/, "");
    }
    setSopSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], instructions: formattedValue };
      return updated;
    });
  };

  const handleSopKeyDown = (e, index) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      if (!val || val.trim() === "") return;

      const lastNewline = val.lastIndexOf("\n", start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = val.substring(lineStart, start);

      if (currentLine.trim() === "•" || currentLine.trim() === "") {
        const newVal = val.substring(0, lineStart) + val.substring(end);
        setSopSteps((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], instructions: newVal };
          return updated;
        });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = lineStart;
        }, 0);
        return;
      }

      const bullet = "\n• ";
      const newVal = val.substring(0, start) + bullet + val.substring(end);
      setSopSteps((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], instructions: newVal };
        return updated;
      });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + bullet.length;
      }, 0);
    }
  };

  const handleAddSopStep = () => {
    setSopSteps((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        heading: "",
        instructions: "",
      },
    ]);
  };

  const handleRemoveSopStep = (indexToRemove) => {
    setSopSteps((prev) => {
      if (prev.length <= 1) {
        return [{ id: 1, heading: "", instructions: "" }];
      }
      return prev
        .filter((_, idx) => idx !== indexToRemove)
        .map((step, idx) => ({ ...step, id: idx + 1 }));
    });
  };

  const handlePrint = (target = "all") => {
    setPrintTarget(target);
    document.body.setAttribute("data-print-target", target);
    const printContainer = document.querySelector(".print-only-container");
    if (printContainer) {
      printContainer.classList.remove(
        "print-target-all",
        "print-target-tara",
        "print-target-sop",
      );
      printContainer.classList.add(`print-target-${target}`);
    }
    let styleEl = document.getElementById("tara-print-page-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "tara-print-page-style";
      document.head.appendChild(styleEl);
    }
    if (target === "sop") {
      styleEl.innerHTML = `
        @media print {
          @page { size: A4 portrait; margin: 10mm 12mm; }
          html, body, #root, .dashboard, .main, .tsa, .tsa-page {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            float: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          .print-page-1 { display: none !important; }
          .print-page-2,
          .tsa .print-page-2 {
            display: block !important;
            page: auto !important;
            page-break-before: auto !important;
            break-before: auto !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          .tsa .print-sop-content,
          .print-sop-content {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          .print-sop-main-title {
            text-align: left !important;
            margin: 0 0 14px 0 !important;
          }
        }
      `;
    } else if (target === "tara") {
      styleEl.innerHTML = `
        @media print {
          @page { size: A4 landscape; margin: 6mm 8mm; }
          @page tara-landscape { size: A4 landscape; margin: 6mm 8mm; }
          html, body, #root, .dashboard, .main, .tsa, .tsa-page {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            float: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only-container {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          .print-page-1,
          .tsa .print-page-1 {
            display: block !important;
            page: tara-landscape !important;
            page-break-after: auto !important;
            break-after: auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-tara-title-header {
            width: 100% !important;
            box-sizing: border-box !important;
            text-align: left !important;
            margin-bottom: 5px !important;
          }
          .print-tara-top-layout {
            width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 6px !important;
          }
          .print-table-wrapper {
            width: 100% !important;
            box-sizing: border-box !important;
            margin: 3px 0 0 0 !important;
            padding: 0 !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-risk-table {
            width: 100% !important;
            min-width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            box-sizing: border-box !important;
            border-bottom: 1px solid #000000 !important;
          }
          .col-sno { width: 3% !important; }
          .col-desc { width: 12.5% !important; }
          .col-hazard { width: 12.5% !important; }
          .col-control { width: 13% !important; }
          .col-init-group { width: 17.5% !important; }
          .col-action { width: 7.5% !important; }
          .col-new-control { width: 15% !important; }
          .col-res-group { width: 7.5% !important; }
          .col-date { width: 5.5% !important; }
          .col-current-risk { width: 6% !important; }
          .print-empty-space-row {
            height: 180px !important;
          }
          .print-empty-space-row td {
            height: 180px !important;
            padding: 0 !important;
            border-left: 1px solid #000000 !important;
            border-right: 1px solid #000000 !important;
            border-top: 0 !important;
            border-bottom: 1px solid #000000 !important;
          }
          .print-page-2 { display: none !important; }
        }
      `;
    } else {
      styleEl.innerHTML = `
        @media print {
          @page { size: A4 landscape; margin: 6mm 8mm; }
          @page tara-landscape { size: A4 landscape; margin: 6mm 8mm; }
          @page sop-portrait { size: A4 portrait; margin: 10mm 12mm; }
          html, body, #root, .dashboard, .main, .tsa, .tsa-page {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            float: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only-container {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          .print-page-1,
          .tsa .print-page-1 {
            display: block !important;
            page: tara-landscape !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-tara-title-header {
            width: 100% !important;
            box-sizing: border-box !important;
            text-align: left !important;
            margin-bottom: 5px !important;
          }
          .print-tara-top-layout {
            width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 6px !important;
          }
          .print-table-wrapper {
            width: 100% !important;
            box-sizing: border-box !important;
            margin: 3px 0 0 0 !important;
            padding: 0 !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-risk-table {
            width: 100% !important;
            min-width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            box-sizing: border-box !important;
            border-bottom: 1px solid #000000 !important;
          }
          .col-sno { width: 3% !important; }
          .col-desc { width: 12.5% !important; }
          .col-hazard { width: 12.5% !important; }
          .col-control { width: 13% !important; }
          .col-init-group { width: 17.5% !important; }
          .col-action { width: 7.5% !important; }
          .col-new-control { width: 15% !important; }
          .col-res-group { width: 7.5% !important; }
          .col-date { width: 5.5% !important; }
          .col-current-risk { width: 6% !important; }
          .print-empty-space-row {
            height: 180px !important;
          }
          .print-empty-space-row td {
            height: 180px !important;
            padding: 0 !important;
            border-left: 1px solid #000000 !important;
            border-right: 1px solid #000000 !important;
            border-top: 0 !important;
            border-bottom: 1px solid #000000 !important;
          }

          .print-page-2,
          .tsa .print-page-2 {
            display: block !important;
            page: sop-portrait !important;
            page-break-before: always !important;
            break-before: page !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .tsa .print-sop-content,
          .print-sop-content {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          .print-sop-main-title {
            text-align: left !important;
            margin: 0 0 14px 0 !important;
          }
        }
      `;
    }
    const origTitle = document.title;
    document.title = "";

    const cleanup = () => {
      document.title = origTitle;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      window.print();
    }, 150);
  };

  const validateStep1 = () => {
  const errs = {};

  if (!site || !site.trim()) errs.site = true;
  if (!department || !department.trim()) errs.department = true;
  if (!machine || !machine.trim()) errs.machine = true;
  if (!taskDescription || !taskDescription.trim())
    errs.taskDescription = true;

  if (!taraId || !taraId.trim()) errs.taraId = true;

  const firstRow = rows[0] || {};
  if (!firstRow.job?.trim()) errs.row0_job = true;
  if (!firstRow.hazard?.trim()) errs.row0_hazard = true;
  if (!firstRow.control?.trim()) errs.row0_control = true;
  if (!firstRow.actionReq?.trim()) errs.row0_actionReq = true;
  setErrors(errs);
  return Object.keys(errs).length === 0;
};

  const validateAll = () => {
    const errs = {};
    if (!site || !site.trim()) errs.site = true;
    if (!department || !department.trim()) errs.department = true;
    if (!machine || !machine.trim()) errs.machine = true;
    if (!taskDescription || !taskDescription.trim())
      errs.taskDescription = true;
      if (!taraId || !taraId.trim()) errs.taraId = true;
      const enteredTaraId = taraId.trim().toLowerCase();

      const duplicateTaraId =
       enteredTaraId &&
       savedTaraList.some((tara) => {
      const existingTaraId = String(tara.tara_no || "")
      .trim()
      .toLowerCase();

      return (
      existingTaraId === enteredTaraId &&
      tara.id !== editingTaraId
    );
  });

if (duplicateTaraId) {
  errs.taraId = "TaRa ID already exists";
}

    const firstRow = rows[0] || {};
    if (!firstRow.job?.trim()) errs.row0_job = true;
    if (!firstRow.hazard?.trim()) errs.row0_hazard = true;
    if (!firstRow.control?.trim()) errs.row0_control = true;

    const hasSop = sopSteps.some(
      (s) => s.heading?.trim() || s.instructions?.trim(),
    );
    if (!hasSop) errs.sop = true;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToSop = () => {
    if (!validateStep1()) {
      setToastMessage(
        "⚠️ Please fill in all required fields (*) before proceeding to SOP Details.",
      );
      setTimeout(() => setToastMessage(""), 4500);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handleOpenReview = () => {
    if (!validateAll()) {
      setToastMessage(
        "⚠️ Please fill in all required fields (*) before submitting.",
      );
      setTimeout(() => setToastMessage(""), 4500);
      if (
        !site ||
        !department ||
        !machine ||
        !taskDescription ||
        !rows[0]?.job ||
        !rows[0]?.hazard ||
        !rows[0]?.control
      ) {
        setCurrentStep(1);
      }
      return;
    }
    setErrors({});
    setIsViewOnly(false);
    setIsReviewModalOpen(true);
  };
  const handleViewTara = (taraItemOrId) => {
    let routeIdentifier;
    if (typeof taraItemOrId === "object" && taraItemOrId !== null) {
      routeIdentifier = taraItemOrId.tara_no || taraItemOrId.id;
    } else {
      const match = savedTaraList.find(
        (t) => t.id === taraItemOrId || t.tara_no === taraItemOrId
      );
      routeIdentifier = match ? (match.tara_no || match.id) : taraItemOrId;
    }

    setShowSavedTara(false);
    navigate(`/risk-assessments/savedtara/${encodeURIComponent(routeIdentifier)}`);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setIsSubmitted(false);
    setIsViewOnly(false);
    setIsEditSubmit(false);

    if (location.state?.from === "documents") {
      navigate("/documents");
      return;
    }

    if (location.state?.from === "dashboard") {
      navigate("/");
      return;
    }

    if (routeTaraId) {
      navigate("/risk-assessments/savedtara");
      return;
    }

    navigate("/");
  };

  const handleCloseDocument = () => {
    if (location.state?.from === "documents") {
      navigate("/documents");
      return;
    }

    if (location.state?.from === "dashboard") {
      navigate("/");
      return;
    }

    navigate("/");
  };


const handleFinalSubmit = async () => {
  if (!validateAll()) {
    setToastMessage(
      "⚠️ Submission blocked: Required fields (*) must be completed.",
    );
    setTimeout(() => setToastMessage(""), 4500);
    setIsReviewModalOpen(false);
    return;
  }
 

  try {
    console.log("BEFORE SUBMIT VALUES:", {
  taraId,
  date,
  revisionNo,
  nextRevisionDate,
});
    const taraData = {
      tara_no: taraId,
      site: site,
      department: department,
      machine_area: machine,
      task_description: taskDescription,
      performing_task: additionalTask,
      others_at_risk: othersAtRisk,
      tara_team: teamMembers.filter((m) => typeof m === "string" && m.trim() !== ""),
      task_risk_score: totalTaskRiskScore,
      assessment_date: date,
      revision_no: Number(revisionNo),
      revision_date: date,
      next_revision_date: nextRevisionDate,

      rows: rows,
      sopSteps: sopSteps,
    };

    console.log("Sending TaRA data:", taraData);

    const isUpdate = Boolean(editingTaraId);
    setIsEditSubmit(isUpdate);

    const response = isUpdate
      ? await api.put(`/tara/${editingTaraId}`, taraData)
      : await api.post("/tara", taraData);

    console.log("TaRA saved successfully:", response.data);

    setIsSubmitted(true);
    fetchTaraList();
  } catch (error) {
    console.error("TaRA submission failed:", error);

    setToastMessage("❌ Failed to save TaRA. Please try again.");
    setTimeout(() => setToastMessage(""), 4500);
  }
};const filledRows = rows.filter((row) =>
  [
    row.job,
    row.hazard,
    row.control,
    row.f,
    row.d,
    row.n,
    row.c1,
    row.p,
    row.c2,
    row.pxc,
    row.actionReq,
    row.newControlMeasures,
    row.resF,
    row.resC,
    row.resPxc,
    row.date,
    row.currentRisk,
  ].some(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  )
);

  const totalTaskRiskScore = rows.reduce((acc, row) => {
    const val = parseFloat(
      row.currentRisk !== undefined && row.currentRisk !== ""
        ? row.currentRisk
        : row.resPxc || 0,
    );
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="tsa tsa-page">
      <div className="screen-only">
         {showSavedTara && savedTaraList.length > 0 && (
     <div className="saved-tara-section">
    <h2>Task Risk Assessments</h2>

    <table className="saved-tara-table">
      <thead>
        <tr>
          <th>TaRA ID</th>
          <th>Site</th>
          <th>Department</th>
          <th>Action</th>
        </tr>
      </thead>
<tbody>
  {savedTaraList.map((tara) => (
    <tr key={tara.id}>
      <td>{tara.tara_no || "—"}</td>
      <td>{tara.site}</td>
      <td>{tara.department}</td>

     <td>
  <button
    type="button"
    onClick={() => handleViewTara(tara)}
  >
    View
  </button>

  <button
    type="button"
    onClick={() => handleEditTara(tara.id)}
  >
    Edit
  </button>

  <button
    type="button"
    className="saved-tara-delete-btn"
    onClick={() => handleDeleteTara(tara.id, tara.tara_no)}
  >
    Delete
  </button>
</td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
)}
{deleteConfirmTara && (
  <div className="delete-confirm-overlay">
    <div className="delete-confirm-popup">
      <div className="delete-confirm-icon">!</div>

      <h3>Delete TaRA?</h3>

      <p>
        Are you sure you want to delete TaRA{" "}
        <strong>{deleteConfirmTara.taraNo}</strong>?
      </p>

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="delete-cancel-btn"
          onClick={() => setDeleteConfirmTara(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-confirm-btn"
          onClick={confirmDeleteTara}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
        {toastMessage && (
          <div className="toast-notification" role="status">
            <span className="toast-icon">✓</span>
            <span>{toastMessage}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToastMessage("")}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        <div className="tsa-corner-tr" aria-hidden="true">
          <svg
            viewBox="0 0 280 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M70 0C140 15 220 70 280 180V0H70Z"
              fill="#7be1eb"
              fillOpacity="0.85"
            />
            <path
              d="M0 0C90 10 180 50 250 140L280 100V0H0Z"
              fill="#a4edf2"
              fillOpacity="0.65"
            />
          </svg>
        </div>

        <div className="tsa-corner-bl" aria-hidden="true">
          <svg
            viewBox="0 0 280 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 40C60 150 140 205 210 220H0V40Z"
              fill="#7be1eb"
              fillOpacity="0.85"
            />
            <path
              d="M0 120C70 170 160 210 250 220H0V120Z"
              fill="#a4edf2"
              fillOpacity="0.65"
            />
          </svg>
        </div>

        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title="TASK RISK ASSESSMENT (TaRA)"
        >
        <button
            type="button"
            className="saved-tara-btn"
            onClick={() => {
              if (showSavedTara || location.pathname.startsWith("/risk-assessments/savedtara")) {
                setShowSavedTara(false);
                setIsReviewModalOpen(false);
                navigate("/risk-assessments");
              } else {
                fetchTaraList();
                setShowSavedTara(true);
                navigate("/risk-assessments/savedtara");
              }
            }}
        >
            {showSavedTara ? "Hide Saved TaRA" : "Saved TaRA"}
        </button>  
          <nav className="stepper" aria-label="Progress">
            <div
               className={`step ${currentStep === 1 ? "active" : "completed"}`}
              onClick={() => setCurrentStep(1)}
              title="Go to Job / Risk Details"
            >
              <div className="step-circle">1</div>
              <span>Job / Risk Details</span>
            </div>

            <div className="step-line" aria-hidden="true"></div>

            <div
              className={`step ${currentStep === 2 ? "active" : ""}`}
              onClick={handleNextToSop}
              title="Go to SOP Details"
            >
              <div className="step-circle">2</div>
              <span>SOP Details</span>
            </div>

            <div className="step-line" aria-hidden="true"></div>

            <div
              className="step"
              onClick={handleOpenReview}
              title="Open Preview & Submit"
            >
              <div className="step-circle">3</div>
              <span>Preview &amp; Submit</span>
            </div>
          </nav>
        </Header>
        {showSavedTara && (
  <div
    className="saved-tara-overlay"
    onClick={() => {
      setShowSavedTara(false);
      navigate("/risk-assessments");
    }}
  >
    <div
      className="saved-tara-popup"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="saved-tara-popup-header">
        <div>
          <h2>Saved TaRA</h2>
          <p>Select a TaRA to view or edit</p>
        </div>

        <button
          type="button"
          className="saved-tara-close"
          onClick={() => {
            setShowSavedTara(false);
            navigate("/risk-assessments");
          }}
        >
          ×
        </button>
      </div>

      <div className="saved-tara-popup-body">

        {savedTaraList.length > 0 ? (
          <table className="saved-tara-popup-table">
            <thead>
              <tr>
                <th>TaRA ID</th>
                <th>Site</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {savedTaraList.map((tara) => (
                <tr key={tara.id}>
                  <td>{tara.tara_no || "—"}</td>
                  <td>{tara.site}</td>
                  <td>{tara.department}</td>

                 <td>
 <div className="saved-tara-action-buttons">

  <button
    type="button"
    className="saved-tara-view-btn"
    onClick={() => {
      handleViewTara(tara);
    }}
  >
    View
  </button>

  <button
    type="button"
    className="saved-tara-edit-btn"
    onClick={() => {
      handleEditTara(tara.id);
    }}
  >
    Edit
  </button>

  <button
    type="button"
    className="saved-tara-delete-btn"
    onClick={() => handleDeleteTara(tara.id, tara.tara_no)}
  >
    Delete
  </button>

</div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-saved-tara">
            No saved TaRA records found.
          </div>
        )}

      </div>
    </div>
  </div>
)}


        <main className="tsa-card">
          {currentStep === 1 ? (
            <>
              <section
                className="basic-details"
                aria-label="Assessment Basic Details"
              >
                <div className="details-left">
                  <div className="three-column">
                    <div
                      className={`field ${errors.site ? "field-error" : ""}`}
                    >
                      <label htmlFor="site-select">
                        Site <span>*</span>
                      </label>
                    <input
                      id="site-select"
                      type="text"
                      placeholder="Enter Site"
                      value={site}
                      onChange={(e) => {
                        setSite(e.target.value);

                        if (errors.site) {
                          setErrors((prev) => ({
                            ...prev,
                            site: undefined,
                          }));
                        }
                      }}
                    />
                    </div>

                    <div
                      className={`field ${errors.department ? "field-error" : ""}`}
                    >
                      <label htmlFor="dept-select">
                        Department <span>*</span>
                      </label>
                  <input
                    id="dept-select"
                    type="text"
                    placeholder="Enter Department"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);

                      if (errors.department) {
                        setErrors((prev) => ({
                          ...prev,
                          department: undefined,
                        }));
                      }
                    }}
                  />
                    </div>

                    <div
                      className={`field ${errors.machine ? "field-error" : ""}`}
                    >
                      <label htmlFor="machine-input">
                        Machine / Area / Plant <span>*</span>
                      </label>
                      <input
                        id="machine-input"
                        type="text"
                        placeholder="Enter Machine / Area / Plant"
                        value={machine}
                        onChange={(e) => {
                          setMachine(e.target.value);
                          if (errors.machine)
                            setErrors((prev) => ({
                              ...prev,
                              machine: undefined,
                            }));
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={`field ${errors.taskDescription ? "field-error" : ""}`}
                  >
                    <label htmlFor="task-desc">
                      Task Description <span>*</span>
                    </label>
                    <input
                      id="task-desc"
                      type="text"
                      placeholder="Enter task description"
                      value={taskDescription}
                      onChange={(e) => {
                        setTaskDescription(e.target.value);
                        if (errors.taskDescription)
                          setErrors((prev) => ({
                            ...prev,
                            taskDescription: undefined,
                          }));
                      }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="add-task">Additional Performing Task</label>
                    <input
                      id="add-task"
                      type="text"
                      placeholder="Enter additional performing task"
                      value={additionalTask}
                      onChange={(e) => setAdditionalTask(e.target.value)}
                    />
                  </div>

                  <div className="field readonly-field">
                    <label htmlFor="others-at-risk">Others at Risk</label>
                    <input
                      id="others-at-risk"
                      type="text"
                      value={othersAtRisk}
                      onChange={(e) => setOthersAtRisk(e.target.value)}
                    />
                  </div>
                </div>

                <aside className="team-section" aria-label="TaRA Team Members">
                  <div className="team-title">
                    <span>TaRA Team</span>
                  </div>

                  <div className="team-list">
                    {teamMembers.map((member, index) => (
                      <div className="team-member" key={index}>
                        <span className="team-indicator">▸</span>
                        <input
                          type="text"
                          className="team-member-input"
                          value={member}
                          placeholder={`Member ${index + 1}`}
                          onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                        />
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            className="team-member-remove-btn"
                            onClick={() => handleRemoveTeamMember(index)}
                            title="Remove member"
                            aria-label={`Remove team member ${index + 1}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="team-footer">
                    <button
                      type="button"
                      className="team-add-btn"
                      onClick={handleAddTeamMember}
                      title="Add Team Member"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add
                    </button>
                  </div>
                </aside>

                <div className="details-right">
                 <div
  className={`tara-id-row ${errors.taraId ? "field-error" : ""}`}
>
  <label htmlFor="tara-id">
    TaRA ID <span>*</span>
  </label>
<input  
  id="tara-id"  
  className="tara-id-input" 
  type="text"  
  placeholder="Enter TaRA ID"  
  value={taraId}  
  onChange={(e) => { 
    const value = e.target.value; 
    setTaraId(value); 
 
    const enteredTaraId = value.trim().toLowerCase(); 
 
    const duplicateTaraId = 
      enteredTaraId && 
      savedTaraList.some((tara) => { 
        const existingTaraId = String(tara.tara_no || "") 
          .trim() 
          .toLowerCase(); 
 
        return ( 
          existingTaraId === enteredTaraId && 
          tara.id !== editingTaraId 
        ); 
      }); 
 
    setErrors((prev) => ({ 
      ...prev, 
      taraId: duplicateTaraId 
        ? "TaRA ID already exists" 
        : undefined, 
    })); 
  }} 
/>
{typeof errors.taraId === "string" && (
  <span className="tara-id-error">
    {errors.taraId}
  </span>
)}
</div>

                  <div className="meta-group-box">
                    <div className="meta-row">
                      <label htmlFor="doc-date">Date</label>
                      <div className="input-wrapper">
                        <input
                          id="doc-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="meta-row center-input">
                      <label htmlFor="rev-no">Revision No.</label>
                      <div className="input-wrapper">
                        <input
                          id="rev-no"
                          className="revision-no-input"
                          type="text"
                          placeholder=""
                          value={revisionNo}
                          onChange={(e) => setRevisionNo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="meta-row">
                      <label htmlFor="next-rev-date">Next Revision Date</label>
                      <div className="input-wrapper">
                        <input
                          id="next-rev-date"
                          type="date"
                          value={nextRevisionDate}
                          onChange={(e) => setNextRevisionDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="risk-section"
                aria-label="Risk Assessment Table Section"
              >
                <div className="risk-heading">
                  <h2>Job / Risk Details</h2>
                  <p>
                    <span className="info-icon" aria-hidden="true">
                      i
                    </span>
                    <span>
                      Enter the details for each job / work including hazards,
                      controls and risk rating.
                    </span>
                  </p>

                  <div className="risk-buttons">
                    <button
                      type="button"
                      className="reset-btn"
                      onClick={handleReset}
                      title="Reset table to default 5 rows"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                      </svg>
                      Reset
                    </button>

                    <button
                      type="button"
                      className="add-btn"
                      onClick={handleAddRow}
                      title="Add a new row to table"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add Row
                    </button>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="risk-table">
                    <thead>
                      <tr>
                        <th rowSpan="2" className="sno-column">
                          S.No
                        </th>
                        <th rowSpan="2" className="job-column">
                          Description of
                          <br />
                          Job / Work <span>*</span>
                        </th>
                        <th rowSpan="2" className="hazard-column">
                          Potential Hazards <span>*</span>
                        </th>
                        <th rowSpan="2" className="control-column">
                          Safe Practices or Controls <span>*</span>
                        </th>

                        <th colSpan="7" className="group-heading">
                          Initial Risk
                          <br />
                          <small>(Select one)</small>
                        </th>

                        <th rowSpan="2" className="action-column">
                          Additional
                          <br />
                          Action Req? <span>*</span>
                        </th>

                        <th
                          colSpan="1"
                          className="group-heading new-control-column"
                        >
                          New Control Measures
                        </th>

                        <th colSpan="3" className="group-heading">
                          Residual Risk
                        </th>

                        <th rowSpan="2" className="date-column">
                          Date Completed
                        </th>
                        <th rowSpan="2" className="current-risk-column">
                          Current Risk
                          <br />
                          Total (I − R)
                        </th>
                        <th rowSpan="2" className="delete-column">
                          Action
                        </th>
                      </tr>

                      <tr>
                        <th className="risk-col-f">F</th>
                        <th className="risk-col-d">D</th>
                        <th className="risk-col-n">N</th>
                        <th className="risk-col-c">C</th>
                        <th className="risk-col-p">P</th>
                        <th className="risk-col-c2">C</th>
                        <th className="risk-col-pxc">P×C</th>

                        <th className="new-control-column">
                          Precautions to Eliminate,
                          <br />
                          Reduce or Control Risk
                        </th>

                        <th className="res-f">F</th>
                        <th className="res-c">C</th>
                        <th className="res-pxc">P×C</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index}>
                          <td className="sno-cell">{index + 1}</td>

                          <td>
                            <textarea
                              className={
                                errors.row0_job && index === 0
                                  ? "input-error"
                                  : ""
                              }
                              placeholder="Enter job / work description *"
                              value={row.job}
                              onChange={(e) => {
                                handleRowChange(index, "job", e.target.value);
                                if (errors.row0_job)
                                  setErrors((prev) => ({
                                    ...prev,
                                    row0_job: undefined,
                                    riskTable: undefined,
                                  }));
                              }}
                            />
                          </td>

                          <td>
                            <textarea
                              className={
                                errors.row0_hazard && index === 0
                                  ? "input-error"
                                  : ""
                              }
                              placeholder="Enter potential hazards *"
                              value={row.hazard}
                              onChange={(e) => {
                                handleRowChange(
                                  index,
                                  "hazard",
                                  e.target.value,
                                );
                                if (errors.row0_hazard)
                                  setErrors((prev) => ({
                                    ...prev,
                                    row0_hazard: undefined,
                                    riskTable: undefined,
                                  }));
                              }}
                            />
                          </td>

                          <td>
                            <textarea
                              className={
                                errors.row0_control && index === 0
                                  ? "input-error"
                                  : ""
                              }
                              placeholder="Enter control measures *"
                              value={row.control}
                              onChange={(e) => {
                                handleRowChange(
                                  index,
                                  "control",
                                  e.target.value,
                                );
                                if (errors.row0_control)
                                  setErrors((prev) => ({
                                    ...prev,
                                    row0_control: undefined,
                                    riskTable: undefined,
                                  }));
                              }}
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.f}
                              onChange={(e) =>
                                handleRowChange(index, "f", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.d}
                              onChange={(e) =>
                                handleRowChange(index, "d", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.n}
                              onChange={(e) =>
                                handleRowChange(index, "n", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.c1}
                              onChange={(e) =>
                                handleRowChange(index, "c1", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.p}
                              onChange={(e) =>
                                handleRowChange(index, "p", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.c2}
                              onChange={(e) =>
                                handleRowChange(index, "c2", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.pxc}
                              onChange={(e) =>
                                handleRowChange(index, "pxc", e.target.value)
                              }
                            />
                          </td>

                          <td>
                        <input
                          type="text"
                          className={`manual-cell-input action-input ${
                            errors.row0_actionReq && index === 0 ? "input-error" : ""
                          }`}
                          value={row.actionReq}
                          onChange={(e) => {
                            handleRowChange(index, "actionReq", e.target.value);

                            if (errors.row0_actionReq) {
                              setErrors((prev) => ({
                                ...prev,
                                row0_actionReq: undefined,
                              }));
                            }
                          }}
                        />
                          </td>

                          <td className="new-control-column">
                            <textarea
                              placeholder="Enter precautions to eliminate, reduce or control risk"
                              value={row.newControlMeasures}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "newControlMeasures",
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.resF ?? ""}
                              onChange={(e) =>
                                handleRowChange(index, "resF", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.resC ?? ""}
                              onChange={(e) =>
                                handleRowChange(index, "resC", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input"
                              value={row.resPxc ?? ""}
                              onChange={(e) =>
                                handleRowChange(index, "resPxc", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <div className="date-cell-wrapper">
                              <input
                                type="date"
                                className="completed-date"
                                value={row.date ?? ""}
                                onChange={(e) =>
                                  handleRowChange(index, "date", e.target.value)
                                }
                              />
                            </div>
                          </td>

                          <td>
                            <input
                              type="text"
                              className="manual-cell-input current-risk-input"
                              value={row.currentRisk ?? ""}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "currentRisk",
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          <td className="delete-column">
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => handleDeleteRow(index)}
                              title="Delete Row"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </td>
                        </tr>  
                      ))}
                       <tr className="print-empty-space-row">
                       {Array.from({ length: 18 }).map((_, index) => (
                      <td key={index}></td>
                      ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <footer className="footer-buttons">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCloseDocument}
                    title="Cancel and return to the source page"
                  >
                    Cancel
                  </button>

                  <div className="footer-right">
                    <button
                      type="button"
                      className="draft-btn"
                      onClick={handleSaveAsDraft}
                      title="Save current progress as draft"
                    >
                      <svg
                        className="draft-icon"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      className="next-btn"
                      onClick={handleNextToSop}
                    >
                      Next : SOP Details
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </footer>
              </section>
            </>
          ) : (
            <section
              className="sop-view-container"
              aria-label="Step 2 SOP Details"
            >
              {errors.sop && (
                <div className="sop-error-banner" role="alert">
                  ⚠️ Please enter at least one SOP step heading or instructions
                  before submitting.
                </div>
              )}
              <div className="sop-list">
                {sopSteps.map((step, index) => (
                  <div
                    className={`sop-card ${errors.sop && index === 0 ? "sop-card-error" : ""}`}
                    key={index}
                  >
                    <div className="sop-card-header">
                      <div className="sop-card-title-area">
                        <div className="sop-number-badge">{index + 1}</div>
                        <input
                          type="text"
                          className="sop-step-title-input"
                          placeholder="Enter step heading (e.g. Toolbox Talk, Hazard Controls, PPE)..."
                          value={step.heading || ""}
                          onChange={(e) =>
                            handleSopHeadingChange(index, e.target.value)
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="sop-remove-btn"
                        onClick={() => handleRemoveSopStep(index)}
                        title="Remove this SOP step"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Remove
                      </button>
                    </div>

                    <div className="sop-content-area">
                      <textarea
                        className="sop-textarea"
                        rows="5"
                        value={step.instructions}
                        onChange={(e) => handleSopChange(index, e.target.value)}
                        onKeyDown={(e) => handleSopKeyDown(e, index)}
                        placeholder="Enter SOP step precautions and instructions (Press Enter for new bullet point)..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="sop-actions-bar">
                <button
                  type="button"
                  className="add-sop-btn"
                  onClick={handleAddSopStep}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add SOP Step
                </button>
              </div>

              <footer className="footer-buttons">
                <button
                  type="button"
                  className="prev-btn"
                  onClick={() => setCurrentStep(1)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Previous
                </button>

                <div className="footer-right">
                  <button
                    type="button"
                    className="draft-btn"
                    onClick={handleSaveAsDraft}
                    title="Save current progress as draft"
                  >
                    <svg
                      className="draft-icon"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Save as Draft
                  </button>

                  <div className="print-dropdown-wrapper">
                    <button
                      type="button"
                      className="print-btn"
                      onClick={() => handlePrint("all")}
                      title="Print both pages (Page 1 Landscape, Page 2 Portrait)"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      Print All
                    </button>
                    <button
                      type="button"
                      className="print-opt-btn"
                      onClick={() => handlePrint("tara")}
                      title="Print Page 1: Task Risk Assessment Table in Landscape orientation"
                    >
                      TaRA
                    </button>
                    <button
                      type="button"
                      className="print-opt-btn"
                      onClick={() => handlePrint("sop")}
                      title="Print Page 2: SOP Details in Portrait orientation"
                    >
                      SOP
                    </button>
                  </div>

                  <button
                    type="button"
                    className="next-btn"
                    onClick={handleOpenReview}
                  >
                    Next : Preview &amp; Submit
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </footer>
            </section>
          )}
        </main>

        {isReviewModalOpen && (
          <div
            className="modal-overlay"
            onClick={handleCloseReviewModal}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {isViewOnly
                    ? "View Task Risk Assessment (TaRA)"
                    : "Preview & Submit Task Risk Assessment (TaRA)"}
                </h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={handleCloseReviewModal}
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {!isSubmitted ? (
                  <>
            <div className="preview-pages">

              <div className="preview-page-section">
                <div className="preview-page-title">
                  Page 1 — TaRA
                </div>

                <div className="preview-paper preview-tara">
                  <h4>Task Risk Assessment (TaRA)</h4>

                  <div className="preview-tara-info">
                    <div>
                      <strong>TaRA ID:</strong> {taraId || "—"}
                    </div>

                    <div>
                      <strong>Revision No:</strong> {revisionNo || "—"}
                    </div>

                    <div>
                      <strong>Site:</strong> {site || "—"}
                    </div>

                    <div>
                      <strong>Department:</strong> {department || "—"}
                    </div>

                    <div>
                      <strong>Machine / Area / Plant:</strong>{" "}
                      {machine || "—"}
                    </div>

                    <div>
                      <strong>Date:</strong> {date || "—"}
                    </div>
                  </div>

                  <div className="preview-table-wrapper">
                    <table className="preview-risk-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Description of Job / Work</th>
                          <th>Potential Hazards</th>
                          <th>Safe Practices / Controls</th>
                          <th>Initial Risk</th>
                          <th>Additional Action</th>
                          <th>New Control Measures</th>
                          <th>Residual Risk</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filledRows.map((row, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{row.job || ""}</td>
                            <td>{row.hazard || ""}</td>
                            <td>{row.control || ""}</td>
                            <td>
                              {row.pxc || ""}
                            </td>
                            <td>
                              {row.actionReq || ""}
                            </td>
                            <td>
                              {row.newControlMeasures || ""}
                            </td>
                            <td>
                              {row.resPxc || ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              {/* PAGE 2 - SOP */}
              <div className="preview-page-section">
                <div className="preview-page-title">
                  Page 2 — SOP
                </div>

                <div className="preview-paper preview-sop">
                  <h4>STANDARD OPERATING PROCEDURE</h4>

                  {sopSteps.map((step, index) => (
                    <div className="preview-sop-step" key={step.id || index}>
                      <strong>
                        {index + 1}. {step.heading || ""}
                      </strong>

                      <div>
                        {step.instructions || ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

                    <div className="modal-table-summary">
                      <h4>Assessment Overview</h4>
                      <p>
                        <strong>Task Description:</strong>{" "}
                        {taskDescription || "—"}
                      </p>
                      <p>
                        <strong>Others at Risk:</strong> {othersAtRisk}
                      </p>
                      <p>
                        <strong>Job / Risk Assessment Rows:</strong>{" "}
                        {rows.length} row(s) configured
                      </p>
                      <p>
                        <strong>SOP Step Count:</strong>{" "}
                        {sopSteps.filter((s) => s.heading || s.instructions)
                          .length || sopSteps.length}{" "}
                        step(s) documented
                      </p>
                      <p>
                        <strong>TaRA Team Members:</strong>{" "}
                        {teamMembers.filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>

                    {!isViewOnly ? (
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "12px",
                          color: "#5a7195",
                        }}
                      >
                        Click <strong>Preview &amp; Print</strong> to print the
                        2-page document (Page 1: Risk Details, Page 2: SOP
                        Details). Click{" "}
                        <strong>
                          {editingTaraId ? "Update TaRA" : "Submit TaRA"}
                        </strong>{" "}
                        to finalize.
                      </p>
                    ) : (
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "12px",
                          color: "#5a7195",
                        }}
                      >
                        Click print buttons below to print the document.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="submission-success">
                    <div className="success-icon">✓</div>
                    <h4>
                      {isEditSubmit
                        ? "TaRA Updated Successfully!"
                        : "TaRA Submitted Successfully!"}
                    </h4>
                    <p>
                      The Task Risk Assessment <strong>{taraId}</strong>{" "}
                      (Revision {revisionNo}) has been successfully{" "}
                      {isEditSubmit ? "updated" : "submitted"} and saved to the
                      system.
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                {!isSubmitted ? (
                  <>
                    <button
                      type="button"
                      className="modal-cancel-btn"
                      onClick={handleCloseReviewModal}
                    >
                      {isViewOnly ? "Close" : "Cancel"}
                    </button>
                    <button
                      type="button"
                      className="modal-print-btn print-btn-landscape"
                      onClick={() => handlePrint("tara")}
                      title="Print Page 1: Task Risk Assessment Table in Landscape"
                    >
                      TaRA (Landscape)
                    </button>
                    <button
                      type="button"
                      className="modal-print-btn print-btn-portrait"
                      onClick={() => handlePrint("sop")}
                      title="Print Page 2: SOP Details in Portrait"
                    >
                      SOP (Portrait)
                    </button>
                    <button
                      type="button"
                      className="modal-print-btn"
                      onClick={() => handlePrint("all")}
                      title="Print both pages"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      Print Both
                    </button>
                    {!isViewOnly && (
                      <button
                        type="button"
                        className="modal-submit-btn"
                        onClick={handleFinalSubmit}
                      >
                        {editingTaraId ? "Update TaRA" : "Submit TaRA"}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className="modal-submit-btn"
                    onClick={handleCloseReviewModal}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`print-only-container print-target-${printTarget}`}>
        <div className="print-page print-page-1">
          <div className="print-tara-title-header">
            <h1 className="print-tara-title">
              TASK RISK ASSESSMENT (TaRA)
              <span className="print-tara-version">v1b</span>
            </h1>
          </div>

          <div className="print-tara-top-layout">
            <div className="print-tara-left-col">
              <div className="print-tara-logo-table-wrap">
                <div className="print-tara-logo-box">
                  <img
                    src={coatsLogo}
                    alt="Coats Logo"
                    className="print-tara-logo"
                  />
                </div>
                <table className="print-tara-info-table">
                  <colgroup>
                    <col className="col-info-label" />
                    <col className="col-info-val-short" />
                    <col className="col-info-val-extend" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td className="info-th">Site:</td>
                      <td className="info-td info-td-short">{site || "—"}</td>
                      <td className="info-empty-td"></td>
                    </tr>
                    <tr>
                      <td className="info-th">Department:</td>
                      <td className="info-td info-td-short">
                        {department || "—"}
                      </td>
                      <td className="info-empty-td"></td>
                    </tr>
                    <tr>
                      <td className="info-th">Machine / Area:</td>
                      <td className="info-td info-td-short">
                        {machine || "—"}
                      </td>
                      <td className="info-empty-td"></td>
                    </tr>
                    <tr>
                      <td className="info-th">Task Description:</td>
                      <td className="info-td info-td-wide" colSpan={2}>
                        {taskDescription || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="info-th">Personnel Performing Task:</td>
                      <td className="info-td info-td-wide" colSpan={2}>
                        {additionalTask || ""}
                      </td>
                    </tr>
                    <tr className="empty-print-row">
                      <td className="info-th"></td>
                      <td className="info-td info-td-wide" colSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="info-th">Others at Risk:</td>
                      <td className="info-td info-td-wide" colSpan={2}>
                        {othersAtRisk ||
                          "All Department Executives & Pedestrian workers"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="print-tara-mid-col">
              <div className="print-tara-score-row">
                <span className="score-title">Task Risk Score:</span>
                <span className="score-display-box">{totalTaskRiskScore}</span>
              </div>
              <table className="print-tara-team-table">
                <thead>
                  <tr>
                    <th>TaRA Team Profiles</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.filter(Boolean).map((member, mIdx) => (
                    <tr key={mIdx}>
                      <td>{member}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="print-tara-right-col">
              <div className="print-tara-id-row">
                <span className="id-title">TaRA ID#</span>
                <span className="id-display-box">{taraId || ""}</span>
              </div>
              <table className="print-tara-meta-table">
                <tbody>
                  <tr>
                    <td className="meta-th">Date</td>
                    <td className="meta-td">{date || "—"}</td>
                  </tr>
                  <tr>
                    <td className="meta-th">Revision No:</td>
                    <td className="meta-td">{revisionNo || ""}</td>
                  </tr>
                  <tr>
                    <td className="meta-th">Next Review Date:</td>
                    <td className="meta-td">{nextRevisionDate || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="print-table-wrapper">
            <table className="print-risk-table">
              <thead>
                <tr>
                  <th rowSpan="2" className="col-sno">
                    Sl. No.
                  </th>
                  <th rowSpan="2" className="col-desc">
                    Description
                    <br />
                    <span className="th-sub">(Steps to Complete the Task)</span>
                  </th>
                  <th rowSpan="2" className="col-hazard">
                    Potential Hazards
                    <br />
                    <span className="th-sub">
                      (What can cause harm to you or others while performing the
                      step?)
                    </span>
                  </th>
                  <th rowSpan="2" className="col-control">
                    Safe Practices or Controls
                    <br />
                    <span className="th-sub">
                      (What method is currently in place to keep the hazard from
                      hurting you or others?)
                    </span>
                  </th>
                  <th colSpan="7" className="col-init-group">
                    INITIAL Risk
                  </th>
                  <th rowSpan="2" className="col-action">
                    Addl Action Req?
                  </th>
                  <th rowSpan="2" className="col-new-control">
                    NEW CONTROL MEASURES
                    <br />
                    <span className="th-sub">
                      Precautions to Eliminate, Reduce or Control Risk
                    </span>
                  </th>
                  <th colSpan="3" className="col-res-group">
                    RESIDUAL RISK
                  </th>
                  <th rowSpan="2" className="col-date">
                    Date Complete
                  </th>
                  <th rowSpan="2" className="col-current-risk">
                    Current Risk Total
                  </th>
                </tr>
                <tr>
                  <th className="sub-th">F</th>
                  <th className="sub-th">D</th>
                  <th className="sub-th">N</th>
                  <th className="sub-th">C</th>
                  <th className="sub-th">P</th>
                  <th className="sub-th">C</th>
                  <th className="sub-th bold">P×C</th>
                  <th className="sub-th">P</th>
                  <th className="sub-th">C</th>
                  <th className="sub-th bold">P×C</th>
                </tr>
              </thead>
              <tbody>
                {filledRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="center">{idx + 1}</td>
                    <td className="left">{row.job || ""}</td>
                    <td className="left">{row.hazard || ""}</td>
                    <td className="left">{row.control || ""}</td>
                    <td className="center">{row.f || ""}</td>
                    <td className="center">{row.d || ""}</td>
                    <td className="center">{row.n || ""}</td>
                    <td className="center">{row.c1 || ""}</td>
                    <td className="center">{row.p || ""}</td>
                    <td className="center">{row.c2 || ""}</td>
                    <td className="center bold">{row.pxc || ""}</td>
                    <td className="left">{row.actionReq || ""}</td>
                    <td className="left">{row.newControlMeasures || ""}</td>
                    <td className="center">{row.resF || ""}</td>
                    <td className="center">{row.resC || ""}</td>
                    <td className="center bold">{row.resPxc || ""}</td>
                    <td className="center">{row.date || ""}</td>
                    <td className="center bold">
                      {row.currentRisk !== undefined && row.currentRisk !== ""
                        ? row.currentRisk
                        : "0"}
                    </td>
                  </tr>
                ))}
                <tr className="print-empty-space-row">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <td key={index}></td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        <div className="print-page print-page-2">
          <div className="print-sop-content">
            <h2 className="print-sop-main-title">
              STANDARD OPERATING PROCEDURE
            </h2>
            {sopSteps.map((step, idx) =>
              step.heading?.trim() || step.instructions?.trim() ? (
                <div key={idx} className="print-sop-step">
                  {step.heading?.trim() && (
                    <div className="print-sop-step-heading">
                      {idx + 1}. {step.heading}
                    </div>
                  )}

                  {step.instructions?.trim() && (
                    <div className="print-sop-instructions">
                      {step.instructions
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, lineIdx) => {
                          const clean = line.replace(/^[•\-*\s]+/, "").trim();
                          return clean ? (
                            <div key={lineIdx} className="print-sop-line">
                              • {clean}
                            </div>
                          ) : null;
                        })}
                    </div>
                  )}
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TSA;
