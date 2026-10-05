const {
  Bill,
  BillItem,
  Quotation,
} = require("../models");

const createBill = async (data) => {
  const {
    bill_no,
    company_id,
    customer_id,
    quotation_id,
    purchase_order_no,
    purchase_order_date,
    bill_date,
    subject,
    reference,
    sac_no,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    amount_in_words,
    items,
  } = data;
  const quotation = await Quotation.findByPk(quotation_id);


  const existingBill = await Bill.findOne({
  where: {
    bill_no,
  },
});

if (existingBill) {
  throw new Error("Bill number already exists");
}
 
  if (!quotation) {
    throw new Error("Quotation not found");
  }

  if (quotation.status !== "Approved") {
  throw new Error("Bill can be created only for an approved quotation");
  }

  const bill = await Bill.create({
    bill_no,
    company_id,
    customer_id,
    quotation_id,
    purchase_order_no,
    purchase_order_date,
    bill_date,
    subject,
    reference,
    sac_no,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    amount_in_words,
  });

  const billItems = items.map((item) => ({
    bill_id: bill.id,
    serial_no: item.serial_no,
    job_description: item.job_description,
    quantity: item.quantity,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
  }));

  await BillItem.bulkCreate(billItems);

  return bill;
};

const getBills = async () => {
  return await Bill.findAll({
    include: [
      {
        model: BillItem,
        as: "items",
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getBillById = async (id) => {
  return await Bill.findByPk(id, {
    include: [
      {
        model: BillItem,
        as: "items",
      },
    ],
  });
};

const updateBill = async (id, data) => {
  const {
    bill_no,
    company_id,
    customer_id,
    quotation_id,
    purchase_order_no,
    purchase_order_date,
    bill_date,
    subject,
    reference,
    sac_no,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    amount_in_words,
    items,
  } = data;

  const bill = await Bill.findByPk(id);

  if (!bill) {
    return null;
  }

  const existingBill = await Bill.findOne({
  where: {
    bill_no,
  },
});

if (existingBill && existingBill.id !== id) {
  throw new Error("Bill number already exists");
}

  await bill.update({
    bill_no,
    company_id,
    customer_id,
    quotation_id,
    purchase_order_no,
    purchase_order_date,
    bill_date,
    subject,
    reference,
    sac_no,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    grand_total,
    amount_in_words,
  });

  if (items && Array.isArray(items)) {
    await BillItem.destroy({
      where: {
        bill_id: id,
      },
    });

    const billItems = items.map((item) => ({
      bill_id: id,
      serial_no: item.serial_no,
      job_description: item.job_description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount,
    }));

    if (billItems.length > 0) {
      await BillItem.bulkCreate(billItems);
    }
  }

  return bill;
};

const deleteBill = async (id) => {
  const bill = await Bill.findByPk(id);

  if (!bill) {
    return null;
  }

  await BillItem.destroy({
    where: {
      bill_id: id,
    },
  });

  await bill.destroy();

  return bill;
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
};