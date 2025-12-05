import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { mobileUtils } from "../../../utils/mobileUtils";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Task } from "../../../types/taskTypes";

interface MobileTaskViewProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const MobileTaskView: React.FC<MobileTaskViewProps> = ({
  task,
  onComplete,
  onDelete,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const { mobileConfig } = useMobileConfig();
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [showActions, setShowActions] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 20) {
          if (gestureState.dx > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (gestureState.dx < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  useEffect(() => {
    setIsCompleted(task.completed);
  }, [task.completed]);

  const handleComplete = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    onComplete(task.id);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const toggleActions = () => {
    setShowActions(!showActions);
    Animated.spring(scale, {
      toValue: showActions ? 1 : 1.05,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
        {
          transform: [{ translateX: pan.x }, { scale: scale }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.taskHeader}>
        <Text
          style={[
            styles.taskTitle,
            mobileConfig.darkMode ? styles.darkText : styles.lightText,
          ]}
        >
          {task.title}
        </Text>
        <Text
          style={[
            styles.taskDueDate,
            mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext,
          ]}
        >
          {task.dueDate ? mobileUtils.formatDate(task.dueDate) : "No due date"}
        </Text>
      </View>

      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskDescription,
            mobileConfig.darkMode ? styles.darkText : styles.lightText,
          ]}
        >
          {task.description || "No description"}
        </Text>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskPriority}>
          <Text
            style={[
              styles.priorityText,
              getPriorityStyle(task.priority, mobileConfig.darkMode),
            ]}
          >
            {task.priority || "Normal"}
          </Text>
        </View>

        <View style={styles.taskActions}>
          <TouchableOpacity
            onPress={handleComplete}
            style={styles.actionButton}
          >
            <Icon
              name={isCompleted ? "check-circle" : "radio-button-unchecked"}
              size={24}
              color={isCompleted ? "#4CAF50" : mobileConfig.secondaryColor}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleActions} style={styles.actionButton}>
            <Icon
              name="more-vert"
              size={24}
              color={mobileConfig.secondaryColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionMenu}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Icon name="delete" size={20} color="#F44336" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const getPriorityStyle = (priority: string | undefined, darkMode: boolean) => {
  const baseStyle = {
    fontWeight: "bold",
    fontSize: 12,
  };

  if (!priority) return baseStyle;

  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes("high")) {
    return { ...baseStyle, color: "#F44336" };
  } else if (priorityLower.includes("medium")) {
    return { ...baseStyle, color: "#FF9800" };
  } else if (priorityLower.includes("low")) {
    return { ...baseStyle, color: "#4CAF50" };
  } else {
    return { ...baseStyle, color: darkMode ? "#BB86FC" : "#6200EE" };
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
    borderWidth: 1,
  },
  lightContainer: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  taskDueDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  taskContent: {
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskPriority: {
    padding: 4,
    borderRadius: 4,
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionMenu: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  deleteText: {
    color: "#F44336",
    fontSize: 14,
  },
  darkText: {
    color: "#ffffff",
  },
  lightText: {
    color: "#333333",
  },
  darkSubtext: {
    color: "#bbbbbb",
  },
  lightSubtext: {
    color: "#666666",
  },
});
