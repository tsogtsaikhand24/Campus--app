import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#6c757d",
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e9ecef",
            height: 84,
            paddingBottom: 28,
            paddingTop: 8,
          },
          default: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e9ecef",
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Өнөөдөр",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: "7 Хоног",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Ажлууд",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Статистик",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Тохиргоо",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
