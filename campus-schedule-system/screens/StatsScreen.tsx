import React, { useMemo } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { useSchedule } from "../ScheduleContext";

const { width } = Dimensions.get("window");

// Colors
const COLORS = {
  primary: "#4CAF50",
  background: "#f8f9fa",
  surface: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#6c757d",
  border: "#e9ecef",
  success: "#4CAF50",
  checked: "#4CAF50",
  unchecked: "#e9ecef",
  chartFill: "#81C784",
  chartStroke: "#4CAF50",
};

export default function StatsScreen() {
  const { stats, loading, dailyEntries } = useSchedule();

  // Calculate habit grid data (last 30 days)
  const habitGridData = useMemo(() => {
    if (!dailyEntries) return [];

    const today = new Date();
    const last30Days = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayEntries = dailyEntries.filter((e) => e.date === dateStr);
      const completed = dayEntries.filter(
        (e) => e.status === "completed",
      ).length;
      const total = dayEntries.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      last30Days.push({
        date: dateStr,
        day: date.getDate(),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed,
        total,
        percentage,
      });
    }

    return last30Days;
  }, [dailyEntries]);

  // Calculate weekly completion for graph
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekData = habitGridData.slice(i * 7, (i + 1) * 7);
      const totalCompleted = weekData.reduce(
        (sum, day) => sum + day.completed,
        0,
      );
      const totalTasks = weekData.reduce((sum, day) => sum + day.total, 0);
      const percentage =
        totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

      weeks.push({
        week: i + 1,
        percentage: Math.round(percentage),
        completed: totalCompleted,
        total: totalTasks,
      });
    }
    return weeks;
  }, [habitGridData]);

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Уншиж байна...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { weekly, monthly } = stats;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Статистик</Text>
          <Text style={styles.subtitle}>
            {monthly.month} - {monthly.completed}/{monthly.total} ажил
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#e8f5e9" }]}>
            <Text style={styles.summaryValue}>{monthly.completed}</Text>
            <Text style={styles.summaryLabel}>Дууссан</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#fff3e0" }]}>
            <Text style={styles.summaryValue}>{monthly.percentage}%</Text>
            <Text style={styles.summaryLabel}>Гүйцэтгэл</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#e3f2fd" }]}>
            <Text style={styles.summaryValue}>{monthly.total}</Text>
            <Text style={styles.summaryLabel}>Нийт</Text>
          </View>
        </View>

        {/* Habit Grid (Last 30 Days) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Сүүлийн 30 хоног</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.gridScroll}
          >
            <View style={styles.grid}>
              {/* Day Names Header */}
              <View style={styles.gridRow}>
                {habitGridData.map((day, index) => (
                  <View key={index} style={styles.gridCell}>
                    <Text style={styles.gridDayName}>{day.dayName}</Text>
                  </View>
                ))}
              </View>

              {/* Day Numbers */}
              <View style={styles.gridRow}>
                {habitGridData.map((day, index) => (
                  <View key={index} style={styles.gridCell}>
                    <Text style={styles.gridDayNumber}>{day.day}</Text>
                  </View>
                ))}
              </View>

              {/* Completion Checkboxes */}
              <View style={styles.gridRow}>
                {habitGridData.map((day, index) => (
                  <View key={index} style={styles.gridCell}>
                    <View
                      style={[
                        styles.checkbox,
                        day.percentage >= 70 && styles.checkboxChecked,
                      ]}
                    >
                      {day.percentage >= 70 && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Percentage Row */}
              <View style={styles.gridRow}>
                {habitGridData.map((day, index) => (
                  <View key={index} style={styles.gridCell}>
                    <Text style={styles.gridPercentage}>{day.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Progress Graph */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>4 долоо хоногийн явц</Text>
          <ProgressGraph data={weeklyData} />
        </View>

        {/* Weekly Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>7 хоногийн дэлгэрэнгүй</Text>
          {weeklyData.reverse().map((week, index) => (
            <View key={index} style={styles.weekRow}>
              <View style={styles.weekInfo}>
                <Text style={styles.weekLabel}>7 хоног {4 - index}</Text>
                <Text style={styles.weekStats}>
                  {week.completed}/{week.total} ажил
                </Text>
              </View>
              <View style={styles.weekProgress}>
                <View style={styles.weekProgressBar}>
                  <View
                    style={[
                      styles.weekProgressFill,
                      {
                        width: `${week.percentage}%`,
                        backgroundColor: getColorForPercentage(week.percentage),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weekPercentage}>{week.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Monthly Summary */}
        <View style={[styles.card, { backgroundColor: "#e8f5e9" }]}>
          <Text style={styles.cardTitle}>Сарын дүгнэлт</Text>
          <View style={styles.monthlyStats}>
            <View style={styles.monthlyStatItem}>
              <Text style={styles.monthlyStatValue}>{monthly.percentage}%</Text>
              <Text style={styles.monthlyStatLabel}>Гүйцэтгэл</Text>
            </View>
            <View style={styles.monthlyStatDivider} />
            <View style={styles.monthlyStatItem}>
              <Text style={styles.monthlyStatValue}>{monthly.completed}</Text>
              <Text style={styles.monthlyStatLabel}>Дууссан ажил</Text>
            </View>
            <View style={styles.monthlyStatDivider} />
            <View style={styles.monthlyStatItem}>
              <Text style={styles.monthlyStatValue}>
                {habitGridData.filter((d) => d.percentage >= 70).length}
              </Text>
              <Text style={styles.monthlyStatLabel}>Амжилттай өдөр</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Progress Graph Component
const ProgressGraph: React.FC<{ data: any[] }> = ({ data }) => {
  const graphWidth = width - 64;
  const graphHeight = 150;
  const padding = 20;

  // Calculate points for the area chart
  const points = data.map((week, index) => {
    const x =
      padding + (index / (data.length - 1)) * (graphWidth - padding * 2);
    const y =
      graphHeight -
      padding -
      (week.percentage / 100) * (graphHeight - padding * 2);
    return { x, y, percentage: week.percentage };
  });

  // Create SVG path for filled area
  const createPath = () => {
    let path = `M ${padding} ${graphHeight - padding}`;
    points.forEach((point, index) => {
      if (index === 0) {
        path += ` L ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });
    path += ` L ${graphWidth - padding} ${graphHeight - padding}`;
    path += " Z";
    return path;
  };

  return (
    <View style={styles.graphContainer}>
      <Svg width={graphWidth} height={graphHeight}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value, index) => {
          const y =
            graphHeight - padding - (value / 100) * (graphHeight - padding * 2);
          return (
            <React.Fragment key={index}>
              <Rect
                x={padding}
                y={y}
                width={graphWidth - padding * 2}
                height={1}
                fill="#e9ecef"
              />
              <SvgText
                x={10}
                y={y + 5}
                fontSize="10"
                fill={COLORS.textSecondary}
              >
                {value}%
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Filled area */}
        <Path
          d={createPath()}
          fill={COLORS.chartFill}
          fillOpacity={0.3}
          stroke={COLORS.chartStroke}
          strokeWidth={2}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <React.Fragment key={index}>
            <Rect
              x={point.x - 3}
              y={point.y - 3}
              width={6}
              height={6}
              fill={COLORS.success}
              rx={3}
            />
            <SvgText
              x={point.x}
              y={graphHeight - 5}
              fontSize="10"
              fill={COLORS.textSecondary}
              textAnchor="middle"
            >
              W{index + 1}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const getColorForPercentage = (percentage: number): string => {
  if (percentage >= 80) return "#4CAF50";
  if (percentage >= 60) return "#8BC34A";
  if (percentage >= 40) return "#FF9800";
  return "#f44336";
};

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
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  gridScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  grid: {
    gap: 4,
  },
  gridRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  gridCell: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  gridDayName: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  gridDayNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.unchecked,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.checked,
    borderColor: COLORS.checked,
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  gridPercentage: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  graphContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekInfo: {
    flex: 1,
  },
  weekLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  weekStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  weekProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weekProgressBar: {
    width: 100,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  weekProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  weekPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    width: 45,
    textAlign: "right",
  },
  monthlyStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  monthlyStatItem: {
    alignItems: "center",
  },
  monthlyStatValue: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.success,
    marginBottom: 4,
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  monthlyStatDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
});
