import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSchedule } from "../ScheduleContext";
import { WeekSchedule, DayOfWeek, Task } from "../types";
import {
  generateId,
  getWeekStartDate,
  formatDate,
  getWeekDates,
} from "../utils";

const { width } = Dimensions.get("window");

// Color constants
const COLORS = {
  primary: "#4CAF50",
  secondary: "#2196F3",
  accent: "#FF9800",
  error: "#f44336",
  success: "#4CAF50",
  background: "#f8f9fa",
  surface: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#6c757d",
  border: "#e9ecef",
  overlay: "rgba(0, 0, 0, 0.5)",
};

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "monday", label: "Даваа", short: "Да" },
  { key: "tuesday", label: "Мягмар", short: "Мя" },
  { key: "wednesday", label: "Лхагва", short: "Лх" },
  { key: "thursday", label: "Пүрэв", short: "Пү" },
  { key: "friday", label: "Баасан", short: "Ба" },
  { key: "saturday", label: "Бямба", short: "Бя" },
  { key: "sunday", label: "Ням", short: "Ня" },
];

export default function WeekPlannerScreen() {
  const {
    tasks,
    currentWeekSchedule,
    updateWeekSchedule,
    loadCurrentWeekSchedule,
    loadTasks,
  } = useSchedule();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [localSchedule, setLocalSchedule] = useState<WeekSchedule | null>(null);

  useEffect(() => {
    loadCurrentWeekSchedule();
    loadTasks();
  }, []);

  useEffect(() => {
    if (currentWeekSchedule) {
      setLocalSchedule(currentWeekSchedule);
    } else {
      const weekStart = getWeekStartDate(new Date());
      const newSchedule: WeekSchedule = {
        id: generateId(),
        weekStartDate: formatDate(weekStart),
        tasks: {},
        createdAt: new Date(),
      };
      setLocalSchedule(newSchedule);
    }
  }, [currentWeekSchedule]);

  const handleAddTaskToDay = (day: DayOfWeek) => {
    setSelectedDay(day);
    setShowTaskModal(true);
  };

  const handleTaskSelect = (taskId: string) => {
    if (!localSchedule || !selectedDay) return;

    const dayTasks = localSchedule.tasks[selectedDay] || [];

    if (dayTasks.includes(taskId)) {
      const updatedSchedule = {
        ...localSchedule,
        tasks: {
          ...localSchedule.tasks,
          [selectedDay]: dayTasks.filter((id) => id !== taskId),
        },
      };
      setLocalSchedule(updatedSchedule);
    } else {
      const updatedSchedule = {
        ...localSchedule,
        tasks: {
          ...localSchedule.tasks,
          [selectedDay]: [...dayTasks, taskId],
        },
      };
      setLocalSchedule(updatedSchedule);
    }
  };

  const handleSaveSchedule = async () => {
    if (localSchedule) {
      await updateWeekSchedule(localSchedule);
    }
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find((t) => t.id === taskId);
  };

  const getTasksForDay = (day: DayOfWeek): Task[] => {
    if (!localSchedule) return [];
    const taskIds = localSchedule.tasks[day] || [];
    return taskIds
      .map((id) => getTaskById(id))
      .filter((t): t is Task => t !== undefined);
  };

  const getTodayIndex = (): number => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  };

  const getPriorityColor = (priority: "low" | "medium" | "high"): string => {
    switch (priority) {
      case "high":
        return COLORS.error;
      case "medium":
        return COLORS.accent;
      case "low":
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  if (!localSchedule) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Уншиж байна...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weekDates = getWeekDates(new Date(localSchedule.weekStartDate));
  const todayIndex = getTodayIndex();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>7 хоногийн төлөвлөгөө</Text>
          <Text style={styles.subtitle}>
            {weekDates[0].toLocaleDateString("mn-MN", {
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("mn-MN", {
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSchedule}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Хадгалах</Text>
        </TouchableOpacity>
      </View>

      {/* Week Grid - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekScroll}
        decelerationRate="fast"
        snapToInterval={width * 0.38}
        snapToAlignment="start"
      >
        {DAYS.map((day, index) => {
          const dayTasks = getTasksForDay(day.key);
          const isToday = index === todayIndex;

          return (
            <View
              key={day.key}
              style={[styles.dayColumn, isToday && styles.todayColumn]}
            >
              {/* Day Header */}
              <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
                <Text style={[styles.dayLabel, isToday && styles.todayText]}>
                  {day.short}
                </Text>
                <Text style={[styles.dayDate, isToday && styles.todayText]}>
                  {weekDates[index].getDate()}
                </Text>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddTaskToDay(day.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ Нэмэх</Text>
              </TouchableOpacity>

              {/* Task List */}
              <ScrollView
                style={styles.taskListScroll}
                showsVerticalScrollIndicator={false}
              >
                {dayTasks.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📝</Text>
                    <Text style={styles.emptyText}>Хоосон</Text>
                  </View>
                ) : (
                  dayTasks.map((task) => (
                    <View key={task.id} style={styles.taskCard}>
                      <View
                        style={[
                          styles.priorityBar,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      />
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle} numberOfLines={2}>
                          {task.title}
                        </Text>
                        {task.estimatedMinutes && (
                          <View style={styles.timeRow}>
                            <Text style={styles.timeIcon}>⏱</Text>
                            <Text style={styles.timeText}>
                              {task.estimatedMinutes}м
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Footer with count */}
              {dayTasks.length > 0 && (
                <View style={styles.dayFooter}>
                  <Text style={styles.taskCount}>{dayTasks.length} ажил</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Task Selection Modal */}
      <Modal
        visible={showTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDay && DAYS.find((d) => d.key === selectedDay)?.label}{" "}
                - Ажил сонгох
              </Text>
              <TouchableOpacity
                onPress={() => setShowTaskModal(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Empty State or Task List */}
            {tasks.length === 0 ? (
              <View style={styles.emptyModalState}>
                <Text style={styles.emptyModalIcon}>📝</Text>
                <Text style={styles.emptyModalTitle}>Ажил алга байна</Text>
                <Text style={styles.emptyModalText}>
                  "Ажлууд" tab руу орж эхлээд ажил үүсгэнэ үү
                </Text>
              </View>
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedDay
                    ? (localSchedule.tasks[selectedDay] || []).includes(item.id)
                    : false;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.taskSelectItem,
                        isSelected && styles.taskSelectItemActive,
                      ]}
                      onPress={() => handleTaskSelect(item.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.selectPriorityBar,
                          { backgroundColor: getPriorityColor(item.priority) },
                        ]}
                      />
                      <View style={styles.taskSelectInfo}>
                        <Text
                          style={[
                            styles.taskSelectTitle,
                            isSelected && styles.taskSelectTitleActive,
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text style={styles.taskSelectDesc} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                        {item.estimatedMinutes && (
                          <Text style={styles.taskSelectTime}>
                            ⏱ {item.estimatedMinutes} минут
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxActive,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.taskListContent}
              />
            )}

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowTaskModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Болсон</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  weekScroll: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dayColumn: {
    width: width * 0.36,
    marginHorizontal: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  todayHeader: {
    backgroundColor: COLORS.primary,
    borderBottomColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayDate: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  todayText: {
    color: "#fff",
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    margin: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  taskListScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  taskCard: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  dayFooter: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },
  taskCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  emptyModalState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyModalIcon: {
    fontSize: 72,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyModalText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  taskListContent: {
    paddingBottom: 12,
  },
  taskSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskSelectItemActive: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowOpacity: 0.1,
  },
  selectPriorityBar: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  taskSelectInfo: {
    flex: 1,
  },
  taskSelectTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  taskSelectTitleActive: {
    color: COLORS.secondary,
    fontWeight: "600",
  },
  taskSelectDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  taskSelectTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkboxActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
