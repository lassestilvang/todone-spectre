import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { useMobileConfig } from '../../../hooks/useMobileConfig';
import { mobileUtils } from '../../../utils/mobileUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Project } from '../../../types/projectTypes';
import { Task } from '../../../types/taskTypes';

interface MobileProjectViewProps {
  project: Project;
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void;
}

export const MobileProjectView: React.FC<MobileProjectViewProps> = ({
  project,
  tasks,
  onTaskComplete,
  onTaskDelete,
  onProjectUpdate,
}) => {
  const { mobileConfig } = useMobileConfig();
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate project progress
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(task => task.completed).length;
      const newProgress = (completedTasks / tasks.length) * 100;
      setProgress(newProgress);
    }

    // Animation for project card
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [tasks, project]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleProjectComplete = () => {
    onProjectUpdate(project.id, { completed: !project.completed });
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => onTaskComplete(item.id)} style={styles.taskCheckbox}>
        <Icon
          name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
          size={20}
          color={item.completed ? '#4CAF50' : mobileConfig.secondaryColor}
        />
      </TouchableOpacity>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
          {item.title}
        </Text>
        {item.dueDate && (
          <Text style={[styles.taskDueDate, mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext]}>
            {mobileUtils.formatDate(item.dueDate)}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => onTaskDelete(item.id)} style={styles.deleteButton}>
        <Icon name="delete-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={toggleExpand} style={[styles.projectHeader, mobileConfig.darkMode ? styles.darkHeader : styles.lightHeader]}>
        <View style={styles.projectInfo}>
          <Text style={[styles.projectTitle, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
            {project.name}
          </Text>
          <Text style={[styles.projectDescription, mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext]}>
            {project.description || 'No description'}
          </Text>
        </View>

        <View style={styles.projectStats}>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
              {Math.round(progress)}%
            </Text>
          </View>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={mobileConfig.secondaryColor}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.projectDetails}>
          <View style={styles.projectMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar-today" size={16} color={mobileConfig.secondaryColor} />
              <Text style={[styles.metaText, mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext]}>
                {project.dueDate ? mobileUtils.formatDate(project.dueDate) : 'No due date'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="priority-high" size={16} color={mobileConfig.secondaryColor} />
              <Text style={[styles.metaText, mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext]}>
                {project.priority || 'Normal'}
              </Text>
            </View>
          </View>

          <View style={styles.tasksHeader}>
            <Text style={[styles.tasksTitle, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
              Tasks ({tasks.length})
            </Text>
            <TouchableOpacity onPress={handleProjectComplete}>
              <Icon
                name={project.completed ? 'check-circle' : 'radio-button-unchecked'}
                size={20}
                color={project.completed ? '#4CAF50' : mobileConfig.secondaryColor}
              />
            </TouchableOpacity>
          </View>

          {tasks.length > 0 ? (
            <FlatList
              data={tasks}
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.id}
              style={styles.tasksList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext]}>
                No tasks in this project
              </Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkHeader: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  lightHeader: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  projectDetails: {
    padding: 16,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tasksList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
  },
  taskDueDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  darkText: {
    color: '#ffffff',
  },
  lightText: {
    color: '#333333',
  },
  darkSubtext: {
    color: '#bbbbbb',
  },
  lightSubtext: {
    color: '#666666',
  },
});