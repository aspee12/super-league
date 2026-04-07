import { HandHeart, LucideIcon, RectangleVertical, Shield, Trophy } from "lucide-react";

export const CATEGORY_CONFIG: Record<StatCategory, CategoryConfig> = {
  goals: {
    label: "Goals",
    shortLabel: "Goals",
    cardTitle: "Top Scorers",
    icon: Trophy,
    valueKey: "goals",
    valueLabel: "Goals",
  },
  assists: {
    label: "Assists",
    shortLabel: "Assists",
    cardTitle: "Assists",
    icon: HandHeart,
    valueKey: "assists",
    valueLabel: "Assists",
  },
  cleanSheet: {
    label: "Clean Sheet",
    shortLabel: "CS",
    cardTitle: "Clean Sheets",
    icon: Shield,
    valueKey: "cleanSheets",
    valueLabel: "Clean Sheet",
    iconClassName: "text-green-600 fill-green-100",
  },
  yellowCard: {
    label: "Yellow Card",
    shortLabel: "Yellow",
    cardTitle: "Yellow Cards",
    icon: RectangleVertical,
    valueKey: "yellowCards",
    valueLabel: "Yellow Card",
    iconClassName: "text-yellow-500 fill-yellow-500",
  },
  redCard: {
    label: "Red Card",
    shortLabel: "Red",
    cardTitle: "Red Cards",
    icon: RectangleVertical,
    valueKey: "redCards",
    valueLabel: "Red Card",
    iconClassName: "text-red-500 fill-red-500",
  },
};

export type StatCategory = "goals" | "assists" | "cleanSheet" | "yellowCard" | "redCard";

export interface CategoryConfig {
    label: string;
    shortLabel: string;
    cardTitle: string;
    icon: LucideIcon;
    valueKey: string;
    valueLabel: string;
    iconClassName?: string;
  }
