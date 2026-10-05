const { Quotation, QuotationItem } = require("../models");

const createQuotation = async (data) => {
  const {
    quotation_no,
    company_id,
    customer_id,
    quotation_date,
    subject,
    sac_no,
    prq_no,
    work_completion_days,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    amount_in_words,
    status,
    items,
  } = data;

  const quotation = await Quotation.create({
    quotation_no,
    company_id,
    customer_id,
    quotation_date,
    subject,
    sac_no,
    prq_no,
    work_completion_days,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    amount_in_words,
    status,
  });

  const quotationItems = items.map((item) => ({
    quotation_id: quotation.id,
    serial_no: item.serial_no,
    job_description: item.job_description,
    quantity: item.quantity,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
  }));

  await QuotationItem.bulkCreate(quotationItems);

  return quotation;
};

const getQuotations = async () => {
  return await Quotation.findAll({
    include: [
      {
        model: QuotationItem,
        as: "items",
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getQuotationById = async (id) => {
  return await Quotation.findByPk(id, {
    include: [
      {
        model: QuotationItem,
        as: "items",
      },
    ],
  });
};

const updateQuotation = async (id, data) => {
  const quotation = await Quotation.findByPk(id);

  if (!quotation) {
    return null;
  }

  const updateData = {};

  if (data.quotation_no !== undefined)
    updateData.quotation_no = data.quotation_no;

  if (data.company_id !== undefined)
    updateData.company_id = data.company_id;

  if (data.customer_id !== undefined)
    updateData.customer_id = data.customer_id;

  if (data.quotation_date !== undefined)
    updateData.quotation_date = data.quotation_date;

  if (data.subject !== undefined)
    updateData.subject = data.subject;

  if (data.sac_no !== undefined)
    updateData.sac_no = data.sac_no;

  if (data.prq_no !== undefined)
    updateData.prq_no = data.prq_no;

  if (data.work_completion_days !== undefined)
    updateData.work_completion_days = data.work_completion_days;

  if (data.subtotal !== undefined)
    updateData.subtotal = data.subtotal;

  if (data.cgst_amount !== undefined)
    updateData.cgst_amount = data.cgst_amount;

  if (data.sgst_amount !== undefined)
    updateData.sgst_amount = data.sgst_amount;

  if (data.igst_amount !== undefined)
    updateData.igst_amount = data.igst_amount;

  if (data.grand_total !== undefined)
    updateData.grand_total = data.grand_total;

  if (data.amount_in_words !== undefined)
    updateData.amount_in_words = data.amount_in_words;

  if (data.status !== undefined)
    updateData.status = data.status;

  await quotation.update(updateData);

  if (data.items && Array.isArray(data.items)) {
    await QuotationItem.destroy({
      where: { quotation_id: id },
    });

    const quotationItems = data.items.map((item) => ({
      quotation_id: id,
      serial_no: item.serial_no,
      job_description: item.job_description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount,
    }));

    if (quotationItems.length > 0) {
      await QuotationItem.bulkCreate(quotationItems);
    }
  }

  return quotation;
};

const deleteQuotation = async (id) => {
  const quotation = await Quotation.findByPk(id);

  if (!quotation) {
    return null;
  }

  await QuotationItem.destroy({
    where: {
      quotation_id: id,
    },
  });

  await quotation.destroy();

  return quotation;
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};