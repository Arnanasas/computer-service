import dayjs from "dayjs";

// Values must match the enum on Service.repairPartner (backend/models/Service.js).
// Colors are distinct from statusConfig and keep white badge text readable (WCAG AA).
export const REPAIR_PARTNERS = [
  { value: "termopasta", label: "Termopasta", hex: "#c2410c" },
  { value: "fixas", label: "Fixas", hex: "#7c3aed" },
  { value: "telesfera", label: "Telesfera", hex: "#be185d" },
  { value: "mindaugas", label: "Mindaugas", hex: "#0f766e" },
  { value: "other", label: "Kita", hex: "#57534e" },
];

export const getRepairPartner = (value) =>
  REPAIR_PARTNERS.find((p) => p.value === value) || null;

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
