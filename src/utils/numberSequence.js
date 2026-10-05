export function formatQuotationNumber(number) {
  return `Q${String(number).padStart(4, "0")}`;
}

export function formatBillSerial(number) {
  return String(number).padStart(3, "0");
}