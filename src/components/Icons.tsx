import { Trophy, HelpCircle, Diamond, Zap, Check } from 'lucide-react';
import type { Category } from '../types';
export const categoryIcons = { trophy: Trophy, riddle: HelpCircle, breakable: Diamond, bomb: Zap };
export function CategoryIcon({ category, size = 18, completed = false }: { category: Category; size?: number; completed?: boolean }) {
  const Icon = completed ? Check : categoryIcons[category];
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
export const glyphs: Record<Category, string> = {
  trophy: '<path d="M8 3h8v7a4 4 0 0 1-8 0V3Z M8 5H4v3a4 4 0 0 0 4 4 M16 5h4v3a4 4 0 0 1-4 4 M12 14v6 M8 21h8"/>',
  riddle: '<path d="M9 8a3 3 0 1 1 5 2.2c-2 1-2 2-2 3 M12 17v.2"/><circle cx="12" cy="12" r="9"/>',
  breakable: '<path d="m12 3 9 9-9 9-9-9 9-9Z M9 9l6 6 M15 9l-6 6"/>', bomb: '<path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/>',
};
export function svgIcon(category: Category, done: boolean) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${done ? '<path d="m5 12 4 4L19 6"/>' : glyphs[category]}</svg>`;
}
