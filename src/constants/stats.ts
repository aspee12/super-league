import { HandHeart, LucideIcon, RectangleVertical, Trophy } from "lucide-react";
import { playerStats } from "../data/matchMockData";

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
    valueKey: "goals",
    valueLabel: "Assists",
  },
  yellowCard: {
    label: "Yellow Card",
    shortLabel: "Yellow",
    cardTitle: "Yellow Cards",
    icon: RectangleVertical,
    valueKey: "goals",
    valueLabel: "Yellow Card",
    iconClassName: "text-yellow-500 fill-yellow-500",
  },
  redCard: {
    label: "Red Card",
    shortLabel: "Red",
    cardTitle: "Red Cards",
    icon: RectangleVertical,
    valueKey: "goals",
    valueLabel: "Red Card",
    iconClassName: "text-red-500 fill-red-500",
  },
};

export type StatCategory = "goals" | "assists" | "yellowCard" | "redCard";

export interface CategoryConfig {
    label: string;
    shortLabel: string;
    cardTitle: string;
    icon: LucideIcon;
    valueKey: keyof any;
    valueLabel: string;
    iconClassName?: string;
  }
