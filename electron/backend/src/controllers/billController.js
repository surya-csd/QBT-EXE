const billService = require("../services/billService");

const createBill = async (req, res) => {
  try {
    const {
      bill_no,
      company_id,
      customer_id,
      quotation_id,
      items,
    } = req.body;

    if (!bill_no) {
      return res.status(400).json({
        success: false,
        message: "bill_no is required",
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

    if (!quotation_id) {
      return res.status(400).json({
        success: false,
        message: "quotation_id is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one bill item is required",
      });
    }

    const bill = await billService.createBill(req.body);

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill_id: bill.id,
    });
  } catch (error) {
    console.error("Create bill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create bill",
      error: error.message,
    });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await billService.getBills();

    return res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get bills",
      error: error.message,
    });
  }
};

const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billService.getBillById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Get bill by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get bill",
      error: error.message,
    });
  }
};

const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billService.updateBill(id, req.body);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bill updated successfully",
    });
  } catch (error) {
    console.error("Update bill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update bill",
      error: error.message,
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billService.deleteBill(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Delete bill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete bill",
      error: error.message,
    });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
};