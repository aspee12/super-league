import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  /** Condensed label for the mobile bottom nav; falls back to `label`. */
  shortLabel?: string;
  icon: LucideIcon;
  path: string;
}
