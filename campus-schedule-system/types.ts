// Schedule System Types
export type TaskStatus = "pending" | "completed" | "skipped";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

export interface DailyTaskEntry {
  id: string;
  taskId: string;
  date: string; // ISO date string
  status: TaskStatus;
  completedAt?: Date;
  notes?: string;
}

export interface WeekSchedule {
  id: string;
  weekStartDate: string; // ISO date string (Monday)
  tasks: {
    [key in DayOfWeek]?: string[]; // Array of task IDs
  };
  createdAt: Date;
}

export interface CompletionStats {
  daily: {
    date: string;
    total: number;
    completed: number;
    percentage: number;
  }[];
  weekly: {
    weekStartDate: string;
    total: number;
    completed: number;
    percentage: number;
  };
  monthly: {
    month: string;
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface NotificationConfig {
  enabled: boolean;
  time: string; // HH:mm format (e.g., "20:00")
  sound: boolean;
  vibration: boolean;
}
