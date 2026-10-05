const TaskRiskAssessment = require("./taskRiskAssessment");
const TaskRiskItem = require("./taskRiskItem");
const Sop = require("./sop");
const Master = require("./masterModel");
const Quotation = require("./Quotation");
const QuotationItem = require("./QuotationItem");
const Bill = require("./Bills");
const BillItem = require("./BillItems");

TaskRiskAssessment.hasMany(TaskRiskItem, {
    foreignKey: "assessment_id",
    as: "items",
});

TaskRiskItem.belongsTo(TaskRiskAssessment, {
    foreignKey: "assessment_id",
    as: "assessment",
});

TaskRiskAssessment.hasMany(Sop, {
    foreignKey: "task_risk_assessment_id",
    as: "sops",
});

Sop.belongsTo(TaskRiskAssessment, {
    foreignKey: "task_risk_assessment_id",
    as: "assessment",
});

// Quotation → Quotation Items
Quotation.hasMany(QuotationItem, {
  foreignKey: "quotation_id",
  as: "items",
});

QuotationItem.belongsTo(Quotation, {
  foreignKey: "quotation_id",
  as: "quotation",
});

// Bill → Bill Items
Bill.hasMany(BillItem, {
  foreignKey: "bill_id",
  as: "items",
});

BillItem.belongsTo(Bill, {
  foreignKey: "bill_id",
  as: "bill",
});

// Bill → Quotation
Bill.belongsTo(Quotation, {
  foreignKey: "quotation_id",
  as: "quotation",
});

Quotation.hasMany(Bill, {
  foreignKey: "quotation_id",
  as: "bills",
});

module.exports = {
    TaskRiskAssessment,
    TaskRiskItem,
    Sop,
    Master,
    Quotation,
    QuotationItem,
    Bill,
    BillItem
};