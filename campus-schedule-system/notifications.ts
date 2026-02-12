import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getNotificationConfig } from "./storage";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-tasks", {
      name: "Daily Task Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

// Schedule daily notification
export const scheduleDailyNotification = async (): Promise<void> => {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const config = await getNotificationConfig();

    if (!config.enabled) {
      return;
    }

    const [hours, minutes] = config.time.split(":").map(Number);

    // Schedule daily notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 Өнөөдрийн ажлууд",
        body: "Өнөөдрийн төлөвлөгөөгөө шалгаад гүйцэтгэлээ check хийгээрэй!",
        data: { type: "daily-reminder" },
        sound: config.sound ? "default" : undefined,
        vibrate: config.vibration ? [0, 250, 250, 250] : undefined,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log("Daily notification scheduled successfully");
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
};

// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Send immediate notification (for testing)
export const sendTestNotification = async (): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🧪 Test Notification",
      body: "Notification системийн тест",
      data: { type: "test" },
    },
    trigger: null, // Send immediately
  });
};

// Get scheduled notifications
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};
