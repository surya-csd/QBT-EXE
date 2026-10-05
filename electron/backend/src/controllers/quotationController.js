// const { Quotation, QuotationItem } = require("../models");

const quotationService = require("../services/quotationService");
const createQuotation = async (req, res) => {
  try {
    const {
      quotation_no,
      company_id,
      customer_id,
      items,
    } = req.body;

    if (!quotation_no) {
      return res.status(400).json({
        success: false,
        message: "quotation_no is required",
      });
    }

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one quotation item is required",
      });
    }

    const quotation = await quotationService.createQuotation(req.body);

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      quotation_id: quotation.id,
    });
  } catch (error) {
  console.error("Create quotation error:", error);

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: `Quotation number "${req.body.quotation_no}" already exists. Please enter a different quotation number.`,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Failed to create quotation",
    error: error.message,
  });
}
};


// GET ALL QUOTATIONS
const getQuotations = async (req, res) => {
  try {
    const quotations = await quotationService.getQuotations();

    return res.status(200).json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    console.error("Get quotations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get quotations",
      error: error.message,
    });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await quotationService.getQuotationById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Get quotation by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get quotation",
      error: error.message,
    });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await quotationService.updateQuotation(
      id,
      req.body
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
    });
  } catch (error) {
    console.error("Update quotation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await quotationService.deleteQuotation(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete quotation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};