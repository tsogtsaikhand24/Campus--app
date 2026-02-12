import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  cancelAllNotifications,
  scheduleDailyNotification,
} from "./notifications";
import {
  addTask,
  deleteTask,
  getCurrentWeekSchedule,
  getDailyEntries,
  getEntriesForDate,
  getNotificationConfig,
  getTasks,
  saveNotificationConfig,
  saveWeekSchedule,
  updateDailyEntry,
  updateTask,
} from "./storage";
import {
  CompletionStats,
  DailyTaskEntry,
  NotificationConfig,
  Task,
  WeekSchedule,
} from "./types";
import {
  calculateDailyStats,
  calculateMonthlyStats,
  calculateWeeklyStats,
  formatDate,
  generateId,
  getWeekDates,
  getWeekStartDate,
} from "./utils";

interface ScheduleContextType {
  // Tasks
  tasks: Task[];
  loadTasks: () => Promise<void>;
  createTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  editTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;

  // Daily Entries
  dailyEntries: DailyTaskEntry[];
  todayEntries: DailyTaskEntry[];
  loadDailyEntries: () => Promise<void>;
  completeTask: (entryId: string, notes?: string) => Promise<void>;
  skipTask: (entryId: string) => Promise<void>;
  undoTask: (entryId: string) => Promise<void>;

  // Week Schedule
  currentWeekSchedule: WeekSchedule | null;
  loadCurrentWeekSchedule: () => Promise<void>;
  updateWeekSchedule: (schedule: WeekSchedule) => Promise<void>;

  // Statistics
  stats: CompletionStats | null;
  loadStats: () => Promise<void>;

  // Notifications
  notificationConfig: NotificationConfig;
  updateNotificationConfig: (config: NotificationConfig) => Promise<void>;

  // Loading state
  loading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined,
);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyTaskEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<DailyTaskEntry[]>([]);
  const [currentWeekSchedule, setCurrentWeekSchedule] =
    useState<WeekSchedule | null>(null);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [notificationConfig, setNotificationConfig] =
    useState<NotificationConfig>({
      enabled: true,
      time: "20:00",
      sound: true,
      vibration: true,
    });
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadDailyEntries(),
        loadCurrentWeekSchedule(),
        loadNotificationConfig(),
      ]);
      await loadStats();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tasks
  const loadTasks = async () => {
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
  };

  const createTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
    };
    await addTask(newTask);
    await loadTasks();
  };

  const editTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    await loadTasks();
  };

  const removeTask = async (taskId: string) => {
    await deleteTask(taskId);
    await loadTasks();
  };

  // Daily Entries
  const loadDailyEntries = async () => {
    const entries = await getDailyEntries();
    setDailyEntries(entries);

    const today = formatDate(new Date());
    const todayEntriesData = await getEntriesForDate(today);
    setTodayEntries(todayEntriesData);
  };

  const completeTask = async (entryId: string, notes?: string) => {
    await updateDailyEntry(entryId, {
      status: "completed",
      completedAt: new Date(),
      notes,
    });
    await loadDailyEntries();
    await loadStats();
  };

  const skipTask = async (entryId: string) => {
    await updateDailyEntry(entryId, {
      status: "skipped",
    });
    await loadDailyEntries();
    await loadStats();
  };

  const undoTask = async (entryId: string) => {
    await updateDailyEntry(entryId, {
      status: "pending",
      completedAt: undefined,
    });
    await loadDailyEntries();
    await loadStats();
  };

  // Week Schedule
  const loadCurrentWeekSchedule = async () => {
    const weekStart = getWeekStartDate(new Date());
    const weekStartStr = formatDate(weekStart);
    const schedule = await getCurrentWeekSchedule(weekStartStr);
    setCurrentWeekSchedule(schedule);
  };

  const updateWeekSchedule = async (schedule: WeekSchedule) => {
    await saveWeekSchedule(schedule);
    await loadCurrentWeekSchedule();
  };

  // Statistics
  const loadStats = async () => {
    const entries = await getDailyEntries();
    const now = new Date();
    const weekStart = getWeekStartDate(now);
    const weekDates = getWeekDates(weekStart);

    const weeklyStats = calculateWeeklyStats(entries, weekStart);
    const monthlyStats = calculateMonthlyStats(entries, now);
    const dailyStats = calculateDailyStats(entries, weekDates);

    setStats({
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats,
    });
  };

  // Notifications
  const loadNotificationConfig = async () => {
    const config = await getNotificationConfig();
    setNotificationConfig(config);
  };

  const updateNotificationConfig = async (config: NotificationConfig) => {
    await saveNotificationConfig(config);
    setNotificationConfig(config);

    if (config.enabled) {
      await scheduleDailyNotification();
    } else {
      await cancelAllNotifications();
    }
  };

  return (
    <ScheduleContext.Provider
      value={{
        tasks,
        loadTasks,
        createTask,
        editTask,
        removeTask,
        dailyEntries,
        todayEntries,
        loadDailyEntries,
        completeTask,
        skipTask,
        undoTask,
        currentWeekSchedule,
        loadCurrentWeekSchedule,
        updateWeekSchedule,
        stats,
        loadStats,
        notificationConfig,
        updateNotificationConfig,
        loading,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};
