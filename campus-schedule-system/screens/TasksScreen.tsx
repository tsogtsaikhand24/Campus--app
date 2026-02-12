import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSchedule } from "../ScheduleContext";
import { Task } from "../types";

export default function TasksScreen() {
  const { tasks, createTask, editTask, removeTask, loadTasks } = useSchedule();

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedMinutes: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      estimatedMinutes: "",
      priority: "medium",
    });
    setEditingTask(null);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        estimatedMinutes: task.estimatedMinutes?.toString() || "",
        priority: task.priority,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Алдаа", "Ажлын нэр оруулна уу");
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      estimatedMinutes: formData.estimatedMinutes
        ? parseInt(formData.estimatedMinutes)
        : undefined,
      priority: formData.priority,
    };

    try {
      if (editingTask) {
        await editTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      handleCloseModal();
    } catch (error) {
      Alert.alert("Алдаа", "Хадгалахад алдаа гарлаа");
    }
  };

  const handleDelete = (taskId: string) => {
    Alert.alert("Устгах", "Энэ ажлыг устгах уу?", [
      { text: "Үгүй", style: "cancel" },
      {
        text: "Тийм",
        style: "destructive",
        onPress: async () => {
          await removeTask(taskId);
        },
      },
    ]);
  };

  const tasksByPriority = {
    high: tasks.filter((t) => t.priority === "high"),
    medium: tasks.filter((t) => t.priority === "medium"),
    low: tasks.filter((t) => t.priority === "low"),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ажлууд</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Text style={styles.addButtonText}>+ Шинэ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* High Priority */}
        {tasksByPriority.high.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.priorityDot, styles.highPriority]} />
              <Text style={styles.sectionTitle}>
                Яаралтай ({tasksByPriority.high.length})
              </Text>
            </View>
            {tasksByPriority.high.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </View>
        )}

        {/* Medium Priority */}
        {tasksByPriority.medium.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.priorityDot, styles.mediumPriority]} />
              <Text style={styles.sectionTitle}>
                Дунд ({tasksByPriority.medium.length})
              </Text>
            </View>
            {tasksByPriority.medium.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </View>
        )}

        {/* Low Priority */}
        {tasksByPriority.low.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.priorityDot, styles.lowPriority]} />
              <Text style={styles.sectionTitle}>
                Бага ({tasksByPriority.low.length})
              </Text>
            </View>
            {tasksByPriority.low.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>Ажил алга байна</Text>
            <Text style={styles.emptySubtext}>
              "+ Шинэ" товч дарж ажил үүсгээрэй
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Task Form Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? "Ажил засах" : "Шинэ ажил"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ажлын нэр *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  placeholder="Жишээ: Математикийн даалгавар"
                  placeholderTextColor="#adb5bd"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Тайлбар</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Нэмэлт мэдээлэл"
                  placeholderTextColor="#adb5bd"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Хугацаа (минут)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.estimatedMinutes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, estimatedMinutes: text })
                  }
                  placeholder="30"
                  placeholderTextColor="#adb5bd"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Чухал байдал</Text>
                <View style={styles.prioritySelector}>
                  {[
                    { key: "low", label: "Бага", color: "#4CAF50" },
                    { key: "medium", label: "Дунд", color: "#FF9800" },
                    { key: "high", label: "Яаралтай", color: "#f44336" },
                  ].map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      style={[
                        styles.priorityButton,
                        formData.priority === priority.key && {
                          backgroundColor: priority.color,
                        },
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          priority: priority.key as any,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.priorityButtonText,
                          formData.priority === priority.key &&
                            styles.priorityButtonTextActive,
                        ]}
                      >
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingTask ? "Хадгалах" : "Үүсгэх"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const priorityColor =
    task.priority === "high"
      ? "#f44336"
      : task.priority === "medium"
        ? "#FF9800"
        : "#4CAF50";

  return (
    <View style={styles.taskCard}>
      <View
        style={[styles.taskPriorityBar, { backgroundColor: priorityColor }]}
      />
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
        {task.estimatedMinutes && (
          <Text style={styles.taskTime}>⏱ {task.estimatedMinutes} минут</Text>
        )}
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.actionIcon}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.actionIcon}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  highPriority: {
    backgroundColor: "#f44336",
  },
  mediumPriority: {
    backgroundColor: "#FF9800",
  },
  lowPriority: {
    backgroundColor: "#4CAF50",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  taskCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskPriorityBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 13,
    color: "#6c757d",
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6c757d",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalClose: {
    fontSize: 28,
    color: "#6c757d",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  prioritySelector: {
    flexDirection: "row",
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
  },
  priorityButtonTextActive: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
