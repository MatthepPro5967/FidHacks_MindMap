import type { Skill } from "../types";
import { localDateStr } from "./stats";

export const GRID_WEEKS = 13;

export function buildActivityGrid(skills: Skill[], weekOffset: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dow = today.getDay();
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() + (dow === 0 ? 0 : 7 - dow));
  endSunday.setDate(endSunday.getDate() - weekOffset * GRID_WEEKS * 7);

  const startMonday = new Date(endSunday);
  startMonday.setDate(endSunday.getDate() - GRID_WEEKS * 7 + 1);

  const countByDay: Record<string, number> = {};
  skills.forEach((s) => {
    if (s.createdAt) {
      const day = localDateStr(new Date(s.createdAt));
      countByDay[day] = (countByDay[day] ?? 0) + 1;
    }
  });

  const weeks: Array<Array<{ date: string; count: number; future: boolean }>> = [];
  const cur = new Date(startMonday);
  for (let w = 0; w < GRID_WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = localDateStr(cur);
      week.push({ date: dateStr, count: countByDay[dateStr] ?? 0, future: cur > today });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, startDate: new Date(startMonday), endDate: new Date(endSunday) };
}

export function activityColor(count: number, future: boolean): string {
  if (future) return "transparent";
  if (count === 0) return "var(--border)";
  if (count === 1) return "#86efac";
  if (count <= 3) return "#4ade80";
  return "#00754A";
}
