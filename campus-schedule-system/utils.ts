import { CompletionStats, DailyTaskEntry, DayOfWeek } from "./types";

// Date utilities
export const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getDay()];
};

export const getWeekStartDate = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Statistics calculation
export const calculateWeeklyStats = (
  entries: DailyTaskEntry[],
  weekStartDate: Date,
): CompletionStats["weekly"] => {
  const weekDates = getWeekDates(weekStartDate);
  const weekEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekDates[0] && entryDate <= weekDates[6];
  });

  const total = weekEntries.length;
  const completed = weekEntries.filter((e) => e.status === "completed").length;

  return {
    weekStartDate: formatDate(weekStartDate),
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const calculateMonthlyStats = (
  entries: DailyTaskEntry[],
  month: Date,
): CompletionStats["monthly"] => {
  const monthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() === month.getMonth() &&
      entryDate.getFullYear() === month.getFullYear()
    );
  });

  const total = monthEntries.length;
  const completed = monthEntries.filter((e) => e.status === "completed").length;

  return {
    month: month.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const calculateDailyStats = (
  entries: DailyTaskEntry[],
  dates: Date[],
): CompletionStats["daily"] => {
  return dates.map((date) => {
    const dateStr = formatDate(date);
    const dayEntries = entries.filter((e) => e.date === dateStr);
    const total = dayEntries.length;
    const completed = dayEntries.filter((e) => e.status === "completed").length;

    return {
      date: dateStr,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
};

// ID generation
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Local storage keys
export const STORAGE_KEYS = {
  TASKS: "@campus_schedule_tasks",
  DAILY_ENTRIES: "@campus_schedule_daily_entries",
  WEEK_SCHEDULES: "@campus_schedule_week_schedules",
  NOTIFICATION_CONFIG: "@campus_schedule_notification_config",
};
