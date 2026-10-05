const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousand(number) {
  let words = "";

  if (number >= 100) {
    words += `${ones[Math.floor(number / 100)]} Hundred `;
    number %= 100;
  }

  if (number >= 20) {
    words += `${tens[Math.floor(number / 10)]} `;
    number %= 10;
  }

  if (number >= 10) {
    words += `${teens[number - 10]} `;
    number = 0;
  }

  if (number > 0) {
    words += `${ones[number]} `;
  }

  return words.trim();
}

export function amountInWords(amount) {
  let number = Math.floor(Number(amount));

  if (!Number.isFinite(number)) {
    return "";
  }

  if (number === 0) {
    return "Zero Only";
  }

  let words = "";

  const crore = Math.floor(number / 10000000);
  number %= 10000000;

  const lakh = Math.floor(number / 100000);
  number %= 100000;

  const thousand = Math.floor(number / 1000);
  number %= 1000;

  if (crore > 0) {
    words += `${convertBelowThousand(crore)} Crore `;
  }

  if (lakh > 0) {
    words += `${convertBelowThousand(lakh)} Lakh `;
  }

  if (thousand > 0) {
    words += `${convertBelowThousand(thousand)} Thousand `;
  }

  if (number > 0) {
    words += `${convertBelowThousand(number)} `;
  }

  return `${words.trim()} Only`;
}