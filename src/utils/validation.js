export function isRequired(value) {
  return value !== undefined &&
    value !== null &&
    String(value).trim() !== "";
}

export function isPositiveNumber(value) {
  return Number(value) >= 0;
}

export function isValidQuantity(value) {
  return Number(value) >= 0;
}

export function isValidRate(value) {
  return Number(value) >= 0;
}

export function isValidGSTRate(value) {
  return Number(value) >= 0 && Number(value) <= 100;
}

export function isValidDate(value) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}