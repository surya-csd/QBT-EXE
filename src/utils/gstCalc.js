export function calculateGST(amount, gstRate, type = "CGST_SGST") {
  const taxableAmount = Number(amount) || 0;
  const rate = Number(gstRate) || 0;

  const gstAmount = (taxableAmount * rate) / 100;

  if (type === "IGST") {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: taxableAmount + gstAmount,
    };
  }

  const halfGST = gstAmount / 2;

  return {
    cgst: halfGST,
    sgst: halfGST,
    igst: 0,
    total: taxableAmount + gstAmount,
  };
}