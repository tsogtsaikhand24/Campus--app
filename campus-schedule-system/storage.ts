import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DailyTaskEntry,
  NotificationConfig,
  Task,
  WeekSchedule,
} from "./types";
import { STORAGE_KEYS } from "./utils";

// Task Storage
export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
    throw error;
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting tasks:", error);
    return [];
  }
};

export const addTask = async (task: Task): Promise<void> => {
  const tasks = await getTasks();
  tasks.push(task);
  await saveTasks(tasks);
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>,
): Promise<void> => {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    await saveTasks(tasks);
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  await saveTasks(filtered);
};

// Daily Entry Storage
export const saveDailyEntries = async (
  entries: DailyTaskEntry[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_ENTRIES,
      JSON.stringify(entries),
    );
  } catch (error) {
    console.error("Error saving daily entries:", error);
    throw error;
  }
};

export const getDailyEntries = async (): Promise<DailyTaskEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting daily entries:", error);
    return [];
  }
};

export const addDailyEntry = async (entry: DailyTaskEntry): Promise<void> => {
  const entries = await getDailyEntries();
  entries.push(entry);
  await saveDailyEntries(entries);
};

export const updateDailyEntry = async (
  entryId: string,
  updates: Partial<DailyTaskEntry>,
): Promise<void> => {
  const entries = await getDailyEntries();
  const index = entries.findIndex((e) => e.id === entryId);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    await saveDailyEntries(entries);
  }
};

export const getEntriesForDate = async (
  date: string,
): Promise<DailyTaskEntry[]> => {
  const entries = await getDailyEntries();
  return entries.filter((e) => e.date === date);
};

// Week Schedule Storage
export const saveWeekSchedules = async (
  schedules: WeekSchedule[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.WEEK_SCHEDULES,
      JSON.stringify(schedules),
    );
  } catch (error) {
    console.error("Error saving week schedules:", error);
    throw error;
  }
};

export const getWeekSchedules = async (): Promise<WeekSchedule[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEK_SCHEDULES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting week schedules:", error);
    return [];
  }
};

export const getCurrentWeekSchedule = async (
  weekStartDate: string,
): Promise<WeekSchedule | null> => {
  const schedules = await getWeekSchedules();
  return schedules.find((s) => s.weekStartDate === weekStartDate) || null;
};

export const saveWeekSchedule = async (
  schedule: WeekSchedule,
): Promise<void> => {
  const schedules = await getWeekSchedules();
  const index = schedules.findIndex((s) => s.id === schedule.id);

  if (index !== -1) {
    schedules[index] = schedule;
  } else {
    schedules.push(schedule);
  }

  await saveWeekSchedules(schedules);
};

// Notification Config Storage
export const saveNotificationConfig = async (
  config: NotificationConfig,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_CONFIG,
      JSON.stringify(config),
    );
  } catch (error) {
    console.error("Error saving notification config:", error);
    throw error;
  }
};

export const getNotificationConfig = async (): Promise<NotificationConfig> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_CONFIG);
    return data
      ? JSON.parse(data)
      : {
          enabled: true,
          time: "20:00",
          sound: true,
          vibration: true,
        };
  } catch (error) {
    console.error("Error getting notification config:", error);
    return {
      enabled: true,
      time: "20:00",
      sound: true,
      vibration: true,
    };
  }
};
