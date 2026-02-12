import React, { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSchedule } from "../ScheduleContext";
import { formatDate, getDayOfWeek } from "../utils";

export default function ScheduleScreen() {
  const {
    todayEntries,
    completeTask,
    skipTask,
    undoTask,
    loadDailyEntries,
    loading,
  } = useSchedule();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyEntries();
    setRefreshing(false);
  };

  const today = new Date();
  const dayName = getDayOfWeek(today);
  const dateStr = formatDate(today);

  const pendingTasks = todayEntries.filter((e) => e.status === "pending");
  const completedTasks = todayEntries.filter((e) => e.status === "completed");
  const skippedTasks = todayEntries.filter((e) => e.status === "skipped");

  const completionRate =
    todayEntries.length > 0
      ? Math.round((completedTasks.length / todayEntries.length) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.date}>
            {today.toLocaleDateString("mn-MN", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </Text>
          <Text style={styles.subtitle}>Өнөөдрийн төлөвлөгөө</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Гүйцэтгэл</Text>
            <Text style={styles.progressPercent}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${completionRate}%` }]}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Дууссан</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.pendingColor]}>
                {pendingTasks.length}
              </Text>
              <Text style={styles.statLabel}>Үлдсэн</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.skipColor]}>
                {skippedTasks.length}
              </Text>
              <Text style={styles.statLabel}>Алгассан</Text>
            </View>
          </View>
        </View>

        {/* Task Sections */}
        {pendingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Хийх ажлууд</Text>
            {pendingTasks.map((entry) => (
              <TaskCard
                key={entry.id}
                entry={entry}
                onComplete={() => completeTask(entry.id)}
                onSkip={() => skipTask(entry.id)}
              />
            ))}
          </View>
        )}

        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Дууссан ажлууд</Text>
            {completedTasks.map((entry) => (
              <TaskCard
                key={entry.id}
                entry={entry}
                onUndo={() => undoTask(entry.id)}
                completed
              />
            ))}
          </View>
        )}

        {skippedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Алгассан ажлууд</Text>
            {skippedTasks.map((entry) => (
              <TaskCard
                key={entry.id}
                entry={entry}
                onUndo={() => undoTask(entry.id)}
                skipped
              />
            ))}
          </View>
        )}

        {todayEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Өнөөдөр ажил алга байна</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface TaskCardProps {
  entry: any;
  onComplete?: () => void;
  onSkip?: () => void;
  onUndo?: () => void;
  completed?: boolean;
  skipped?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  entry,
  onComplete,
  onSkip,
  onUndo,
  completed,
  skipped,
}) => {
  return (
    <View
      style={[
        styles.taskCard,
        completed && styles.taskCardCompleted,
        skipped && styles.taskCardSkipped,
      ]}
    >
      <View style={styles.taskInfo}>
        <Text
          style={[
            styles.taskTitle,
            (completed || skipped) && styles.taskTitleDone,
          ]}
        >
          {entry.taskId}
        </Text>
        {entry.notes && <Text style={styles.taskNotes}>{entry.notes}</Text>}
      </View>

      <View style={styles.taskActions}>
        {!completed && !skipped && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={onComplete}
            >
              <Text style={styles.actionBtnText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.skipBtn]}
              onPress={onSkip}
            >
              <Text style={styles.actionBtnText}>→</Text>
            </TouchableOpacity>
          </>
        )}
        {(completed || skipped) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.undoBtn]}
            onPress={onUndo}
          >
            <Text style={styles.actionBtnText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  date: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
  },
  pendingColor: {
    color: "#FF9800",
  },
  skipColor: {
    color: "#9e9e9e",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskCardCompleted: {
    backgroundColor: "#f1f8f4",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  taskCardSkipped: {
    backgroundColor: "#f5f5f5",
    borderLeftWidth: 4,
    borderLeftColor: "#9e9e9e",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: "#6c757d",
  },
  taskNotes: {
    fontSize: 14,
    color: "#6c757d",
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  completeBtn: {
    backgroundColor: "#4CAF50",
  },
  skipBtn: {
    backgroundColor: "#9e9e9e",
  },
  undoBtn: {
    backgroundColor: "#2196F3",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
  },
});
