import courses from "@/data/courses.json";
import institutions from "@/data/institutions.json";
import type { SearchOption } from "@/components/search-select";

export const POINTS_PER_UPLOAD = 50;
export const NAIRA_PER_50_POINTS = 200;
export const pointsToNaira = (points: number) => Math.floor(points / 50) * NAIRA_PER_50_POINTS;
export const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate"];
export const MATERIAL_TYPES = [
  "Lecture notes",
  "Past questions",
  "Textbook / handout",
  "Assignment / solution",
  "Summary",
  "Lab manual",
  "Other",
];
export const REFERRAL_SOURCES = [
  "Friend or classmate",
  "WhatsApp group",
  "Instagram",
  "TikTok",
  "X (Twitter)",
  "Facebook",
  "Google search",
  "Lecturer or school",
  "Other",
];
export const ACCEPTED_FILES = "application/pdf,image/png,image/jpeg,image/webp";
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

type Institution = { name: string; country: string; city?: string };
export const institutionOptions: SearchOption[] = (institutions as Institution[]).map((i) => ({
  label: i.name,
  meta: [i.city, i.country].filter(Boolean).join(", "),
}));
export const courseOptions: SearchOption[] = (courses as string[]).map((c) => ({ label: c }));
