import { BarChart3, LayoutGrid, Trophy, Users } from 'lucide-react';
import { NavItem } from '../types/sidenav';

export const navItems: NavItem[] = [
    { path: "/table", label: "Table", icon: LayoutGrid },
    { path: "/matches", label: "Matches", icon: Trophy },
    { path: "/stats", label: "Stats", icon: BarChart3 },
    { path: "/teams", label: "Teams", icon: Users },
  ];