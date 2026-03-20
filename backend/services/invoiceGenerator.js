const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png");
const INVOICES_DIR = path.join(__dirname, "..", "invoices");

const units = [
  "", "Vienas", "Du", "Trys", "Keturi",
  "Penki", "Šeši", "Septyni", "Aštuoni", "Devyni",
];
const teens = [
  "Dešimt", "Vienuolika", "Dvylika", "Trylika", "Keturiolika",
  "Penkiolika", "Šešiolika", "Septyniolika", "Aštuoniolika", "Devyniolika",
];
const tens = [
  "", "Dešimt", "Dvidešimt", "Trisdešimt", "Keturiasdešimt",
  "Penkiasdešimt", "Šešiasdešimt", "Septyniasdešimt", "Aštuoniasdešimt", "Devyniasdešimt",
];
const hundreds = [
  "", "Šimtas", "Du šimtai", "Trys šimtai", "Keturi šimtai",
  "Penki šimtai", "Šeši šimtai", "Septyni šimtai", "Aštuoni šimtai", "Devyni šimtai",
];
const thousands = [
  "", "Tūkstantis", "Du tūkstančiai", "Trys tūkstančiai", "Keturi tūkstančiai",
  "Penki tūkstančiai", "Šeši tūkstančiai", "Septyni tūkstančiai", "Aštuoni tūkstančiai", "Devyni tūkstančiai",
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

function formatCurrencyInWords(amount) {
  const euros = Math.floor(amount);
  const cents = Math.round((amount - euros) * 100);
  return `${numberToWordsLT(euros)} EUR ${cents.toString().padStart(2, "0")} ct`;
}

function formatDate(date) {
  return new Date(date).toISOString().substring(0, 10);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLogoSrc() {
  if (!fs.existsSync(LOGO_PATH)) return "";
  const logoBase64 = fs.readFileSync(LOGO_PATH).toString("base64");
  return `data:image/png;base64,${logoBase64}`;
}

function buildInvoiceHTML(payment) {
  const amount = Number(payment.amount);
  const netAmount = amount / 1.21;
  const vatAmount = amount - netAmount;
  const logoSrc = buildLogoSrc();
  const paymentLabel = payment.paymentMethod === "kortele" ? "kortele" : "grynais";

  const buyerBlock =
    payment.clientType === "privatus"
      ? `<p class="bold">${escapeHtml(payment.clientName || "Privatus klientas")}</p>`
      : `
        <p class="bold">${escapeHtml(payment.companyName)}</p>
        <p>Įmonės kodas: ${escapeHtml(payment.companyCode)}</p>
        <p>PVM kodas: ${escapeHtml(payment.pvmCode)}</p>
        <p>Adresas: ${escapeHtml(payment.address)}</p>
      `;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 20px 25px; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.5px;
    color: #000;
    -webkit-print-color-adjust: exact;
  }
  .bold { font-weight: 700; letter-spacing: 0.5px; }
  .thin { font-weight: 300; letter-spacing: 0.5px; }
  .large { font-size: 18px; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header .logo { margin-bottom: 25px; }
  .header .logo img { width: 100px; }
  .header .series {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 10px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 70px;
  }
  .info-row .col { width: 50%; }

  .supplier-label,
  .buyer-label,
  .bank-label { margin-bottom: 10px; }

  .bank-section { margin-top: 10px; }

  .table-section { margin: 10px 0; }
  .items-table { width: 100%; border-collapse: collapse; }
  .items-table th,
  .items-table td {
    padding: 5px 3px;
    border-bottom: 0.5px solid #000;
  }
  .items-table th { text-align: left; font-weight: 700; }
  .items-table th.center,
  .items-table td.center { text-align: center; }

  .totals {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .totals-row {
    display: flex;
    justify-content: flex-end;
  }
  .totals-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .totals-cell {
    padding: 2px 3px;
    font-size: 14px;
    text-align: right;
  }

  .words { margin-bottom: 10px; }
  .payment-method { margin-bottom: 70px; }

  .signatures {
    display: flex;
    justify-content: space-between;
  }
  .signature-box {
    width: 130px;
    text-align: center;
    border-top: 1px solid #000;
    padding-top: 8px;
    margin: 0 15px;
    margin-bottom: 25px;
  }
</style>
</head>
<body>

  <div class="header">
    <div class="logo">
      ${logoSrc ? `<img src="${logoSrc}" />` : ""}
    </div>
    <div class="series">
      <p class="bold large">PVM sąskaita faktūra</p>
      <p class="thin large">Serija ${escapeHtml(payment.seriesNumber)}</p>
      <p class="thin">${formatDate(payment.paidDate)}</p>
    </div>
  </div>

  <div class="info-row">
    <div class="col">
      <p class="bold supplier-label">Tiekėjas:</p>
      <p class="bold">IT112, MB</p>
      <p>Įm. k. 306561580</p>
      <p>PVM kodas: LT100016378016</p>
      <p>Adresas: Kalvarijų g. 2, Vilnius</p>

      <div class="bank-section">
        <p class="bold bank-label">Įmonės sąskaita:</p>
        <p>AB Swedbank,</p>
        <p>LT077300010181630587</p>
      </div>
    </div>

    <div class="col">
      <p class="bold buyer-label">Pirkėjas:</p>
      ${buyerBlock}
    </div>
  </div>

  <p class="bold">Atsiskaityti už:</p>

  <div class="table-section">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:40%">Pavadinimas</th>
          <th class="center" style="width:20%">Kiekis</th>
          <th class="center" style="width:20%">Kaina</th>
          <th class="center" style="width:20%">Suma</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(payment.serviceName)}</td>
          <td class="center">1</td>
          <td class="center">${netAmount.toFixed(2)} €</td>
          <td class="center">${netAmount.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="totals-row">
      <div class="totals-col">
        <span class="totals-cell">Suma:</span>
        <span class="totals-cell">PVM 21%:</span>
        <span class="totals-cell bold">IŠ VISO:</span>
      </div>
      <div class="totals-col">
        <span class="totals-cell">${netAmount.toFixed(2)} EUR</span>
        <span class="totals-cell">${vatAmount.toFixed(2)} EUR</span>
        <span class="totals-cell bold">${amount.toFixed(2)} EUR</span>
      </div>
    </div>
  </div>

  <p class="words">Suma žodžiais: ${formatCurrencyInWords(amount)}</p>
  <p class="payment-method">Sumokėta ${paymentLabel}.</p>

  <div class="signatures">
    <div class="signature-box">Darbuotojo parašas</div>
    <div class="signature-box">Užsakovo parašas</div>
  </div>

</body>
</html>`;
}

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserInstance;
}

/**
 * Generate a PVM invoice PDF and write it to disk.
 * Returns the absolute file path of the generated PDF.
 */
async function generateInvoicePDF(payment) {
  if (!fs.existsSync(INVOICES_DIR)) {
    fs.mkdirSync(INVOICES_DIR, { recursive: true });
  }

  const fileName = `${payment.seriesNumber}.pdf`;
  const filePath = path.join(INVOICES_DIR, fileName);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const html = buildInvoiceHTML(payment);
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "25px", bottom: "20px", left: "25px" },
    });
  } finally {
    await page.close();
  }

  return filePath;
}

process.on("exit", () => {
  if (browserInstance) browserInstance.close().catch(() => {});
});

module.exports = { generateInvoicePDF };
