const units = [
  "",
  "Vienas",
  "Du",
  "Trys",
  "Keturi",
  "Penki",
  "Šeši",
  "Septyni",
  "Aštuoni",
  "Devyni",
];

const teens = [
  "Dešimt",
  "Vienuolika",
  "Dvylika",
  "Trylika",
  "Keturiolika",
  "Penkiolika",
  "Šešiolika",
  "Septyniolika",
  "Aštuoniolika",
  "Devyniolika",
];

const tens = [
  "",
  "Dešimt",
  "Dvidešimt",
  "Trisdešimt",
  "Keturiasdešimt",
  "Penkiasdešimt",
  "Šešiasdešimt",
  "Septyniasdešimt",
  "Aštuoniasdešimt",
  "Devyniasdešimt",
];

const hundreds = [
  "",
  "Šimtas",
  "Du šimtai",
  "Trys šimtai",
  "Keturi šimtai",
  "Penki šimtai",
  "Šeši šimtai",
  "Septyni šimtai",
  "Aštuoni šimtai",
  "Devyni šimtai",
];

const thousands = [
  "",
  "Tūkstantis",
  "Du tūkstančiai",
  "Trys tūkstančiai",
  "Keturi tūkstančiai",
  "Penki tūkstančiai",
  "Šeši tūkstančiai",
  "Septyni tūkstančiai",
  "Aštuoni tūkstančiai",
  "Devyni tūkstančiai",
];

function numberToWordsLT(number) {
  if (number === 0) return "Nulis";

  let words = "";

  if (number >= 1000) {
    words += thousands[Math.floor(number / 1000)] + " ";
    number %= 1000;
  }

  if (number >= 100) {
    words += hundreds[Math.floor(number / 100)] + " ";
    number %= 100;
  }

  if (number >= 10 && number <= 19) {
    words += teens[number - 10];
    return words.trim();
  }

  if (number >= 20) {
    words += tens[Math.floor(number / 10)] + " ";
    number %= 10;
  }

  if (number > 0) {
    words += units[number] + " ";
  }

  return words.trim();
}

export function formatCurrencyInWords(amount) {
  const euros = Math.floor(amount);
  const cents = Math.round((amount - euros) * 100);

  return `${numberToWordsLT(euros)} EUR ${cents
    .toString()
    .padStart(2, "0")} ct`;
}
