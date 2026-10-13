import dayjs from "dayjs";

// Values must match the enum on Service.repairPartner (backend/models/Service.js)
export const REPAIR_PARTNERS = [
  { value: "termopasta", label: "Termopasta" },
  { value: "fixas", label: "Fixas" },
  { value: "telesfera", label: "Telesfera" },
  { value: "mindaugas", label: "Mindaugas" },
  { value: "other", label: "Kita" },
];

export const getRepairPartnerLabel = (value) =>
  REPAIR_PARTNERS.find((p) => p.value === value)?.label || value;

// Dates are saved from <input type="date"> as UTC midnight, so the UTC
// calendar day is the day that was picked.
export const toDateInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

// "overdue" | "today" | "upcoming" | null
export const getRepairDueState = (date) => {
  const day = toDateInputValue(date);
  if (!day) return null;
  const today = dayjs().format("YYYY-MM-DD");
  if (day < today) return "overdue";
  if (day === today) return "today";
  return "upcoming";
};
