import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSchedule } from "../ScheduleContext";

const { width } = Dimensions.get("window");

export default function StatsScreen() {
  const { stats, loading } = useSchedule();

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Уншиж байна...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { weekly, monthly, daily } = stats;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Статистик</Text>
          <Text style={styles.subtitle}>Гүйцэтгэлийн тайлан</Text>
        </View>

        {/* Weekly Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>7 хоногийн гүйцэтгэл</Text>
            <Text style={styles.percentageLarge}>{weekly.percentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${weekly.percentage}%`,
                  backgroundColor: getColorForPercentage(weekly.percentage),
                },
              ]}
            />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{weekly.completed}</Text>
              <Text style={styles.statLabel}>Дууссан</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, styles.totalColor]}>
                {weekly.total}
              </Text>
              <Text style={styles.statLabel}>Нийт</Text>
            </View>
          </View>
        </View>

        {/* Monthly Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{monthly.month}</Text>
            <Text style={styles.percentageLarge}>{monthly.percentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${monthly.percentage}%`,
                  backgroundColor: getColorForPercentage(monthly.percentage),
                },
              ]}
            />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{monthly.completed}</Text>
              <Text style={styles.statLabel}>Дууссан</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, styles.totalColor]}>
                {monthly.total}
              </Text>
              <Text style={styles.statLabel}>Нийт</Text>
            </View>
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Өдрийн задаргаа</Text>
          <View style={styles.dailyGrid}>
            {daily.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString("mn-MN", {
                weekday: "short",
              });
              const dayNumber = date.getDate();

              return (
                <View key={day.date} style={styles.dayCard}>
                  <Text style={styles.dayName}>{dayName}</Text>
                  <Text style={styles.dayNumber}>{dayNumber}</Text>
                  <View style={styles.dayProgressContainer}>
                    <View
                      style={[
                        styles.dayProgressBar,
                        { height: `${day.percentage}%` },
                        {
                          backgroundColor: getColorForPercentage(
                            day.percentage,
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayPercentage}>{day.percentage}%</Text>
                  <Text style={styles.dayStats}>
                    {day.completed}/{day.total}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Дүн шинжилгээ</Text>
          <View style={styles.insightsList}>
            <InsightItem
              icon="🎯"
              title="Сайн явц"
              description={`${weekly.percentage}% гүйцэтгэлтэй явж байна`}
              positive={weekly.percentage >= 70}
            />
            <InsightItem
              icon="📈"
              title="Сарын үр дүн"
              description={`${monthly.completed} ажил дуусгасан`}
              positive={monthly.percentage >= 60}
            />
            <InsightItem
              icon="💪"
              title="Идэвхтэй өдрүүд"
              description={`7 хоногт ${daily.filter((d) => d.completed > 0).length} өдөр идэвхтэй`}
              positive={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InsightItemProps {
  icon: string;
  title: string;
  description: string;
  positive: boolean;
}

const InsightItem: React.FC<InsightItemProps> = ({
  icon,
  title,
  description,
  positive,
}) => (
  <View style={styles.insightItem}>
    <Text style={styles.insightIcon}>{icon}</Text>
    <View style={styles.insightContent}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text
        style={[
          styles.insightDescription,
          positive ? styles.positiveText : styles.neutralText,
        ]}
      >
        {description}
      </Text>
    </View>
  </View>
);

const getColorForPercentage = (percentage: number): string => {
  if (percentage >= 80) return "#4CAF50";
  if (percentage >= 60) return "#8BC34A";
  if (percentage >= 40) return "#FF9800";
  return "#f44336";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  percentageLarge: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4CAF50",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 4,
  },
  totalColor: {
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  dailyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dayCard: {
    alignItems: "center",
    width: (width - 72) / 7,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  dayProgressContainer: {
    height: 80,
    width: 24,
    backgroundColor: "#e9ecef",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: 8,
  },
  dayProgressBar: {
    width: "100%",
    borderRadius: 12,
  },
  dayPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  dayStats: {
    fontSize: 10,
    color: "#6c757d",
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  insightIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
  },
  positiveText: {
    color: "#4CAF50",
  },
  neutralText: {
    color: "#6c757d",
  },
});
