const { Op } = require("sequelize");

const {
  Quotation,
  Bill,
  TaskRiskAssessment,
} = require("../models");

const getDashboardData = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfNextMonth = new Date(startOfMonth);
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

  const quotations = await Quotation.findAll({
    order: [["created_at", "DESC"]],
  });

  const bills = await Bill.findAll({
    order: [["created_at", "DESC"]],
  });

  // =========================
  // GET RISK ASSESSMENTS
  // =========================
  const risks = await TaskRiskAssessment.findAll({
    order: [["created_at", "DESC"]],
  });

  // =========================
  // THIS MONTH QUOTATION COUNT
  // =========================
  const thisMonthTotalQuotation = await Quotation.count({
    where: {
      created_at: {
        [Op.gte]: startOfMonth,
        [Op.lt]: startOfNextMonth,
      },
    },
  });

  const thisMonthTotalBill = await Bill.count({
    where: {
      created_at: {
        [Op.gte]: startOfMonth,
        [Op.lt]: startOfNextMonth,
      },
    },
  });

  // =========================
  // RISK & HAZARD COUNT
  // =========================
  const thisMonthRiskAndHazard = await TaskRiskAssessment.count();

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return null;

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return null;
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // =========================
  // RECENT DOCUMENTS
  // =========================
  const recentDocuments = [
    ...quotations.map((quotation) => ({
      id: quotation.quotation_no,
      company: quotation.company_id,
      description: quotation.subject,
      type: "quotation",
      status: quotation.status,
      date: formatDate(quotation.quotation_date),
      sortDate: quotation.created_at,
    })),

    ...bills.map((bill) => ({
      id: bill.bill_no,
      company: bill.company_id,
      description: bill.subject,
      type: "bill",
      status: bill.status,
      date: formatDate(bill.bill_date),
      sortDate: bill.created_at,
    })),

    // =========================
    // RISK ASSESSMENTS
    // =========================
    ...risks.map((risk) => ({
      id: risk.tara_no,
      description: risk.task_description,
      type: "risk",
      date: formatDate(risk.created_at),
      sortDate: risk.created_at,
    })),
  ];

  // =========================
  // SORT BY CREATED DATE
  // =========================
  recentDocuments.sort(
    (a, b) => new Date(b.sortDate || 0) - new Date(a.sortDate || 0)
  );

  // Remove internal sorting field
  const formattedRecentDocuments = recentDocuments.map(
    ({ sortDate, ...document }) => document
  );

  // =========================
  // RETURN DASHBOARD DATA
  // =========================
  return {
    thisMonthTotalBill,
    thisMonthTotalQuotation,
    thisMonthRiskAndHazard,
    quotations,
    bills,
    risks,

    // Latest 10 documents
    recentDocuments: formattedRecentDocuments.slice(0, 10),

    // All documents
    allDocuments: formattedRecentDocuments,
  };
};

module.exports = {
  getDashboardData,
};