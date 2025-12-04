import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useMobileConfig } from '../../../hooks/useMobileConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MobileNavigationProps {
  activeTab: 'tasks' | 'projects' | 'calendar' | 'settings';
  onTabChange: (tab: 'tasks' | 'projects' | 'calendar' | 'settings') => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  const { mobileConfig } = useMobileConfig();
  const navigation = useNavigation();

  const navItems = [
    { key: 'tasks', icon: 'checklist', label: 'Tasks' },
    { key: 'projects', icon: 'folder', label: 'Projects' },
    { key: 'calendar', icon: 'calendar-today', label: 'Calendar' },
    { key: 'settings', icon: 'settings', label: 'Settings' },
  ];

  const handleTabPress = (tab: 'tasks' | 'projects' | 'calendar' | 'settings') => {
    onTabChange(tab);
    // Navigation logic would go here
    if (tab === 'tasks') {
      navigation.navigate('Tasks');
    } else if (tab === 'projects') {
      navigation.navigate('Projects');
    } else if (tab === 'calendar') {
      navigation.navigate('Calendar');
    } else {
      navigation.navigate('Settings');
    }
  };

  return (
    <View style={[styles.container, mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer]}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.tabItem}
          onPress={() => handleTabPress(item.key as 'tasks' | 'projects' | 'calendar' | 'settings')}
        >
          <View style={styles.tabContent}>
            <Icon
              name={item.icon}
              size={24}
              color={activeTab === item.key ? mobileConfig.primaryColor : mobileConfig.secondaryColor}
            />
            <Text style={[
              styles.tabText,
              activeTab === item.key ? styles.activeTabText : styles.inactiveTabText,
              mobileConfig.darkMode ? styles.darkTabText : styles.lightTabText
            ]}>
              {item.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  darkContainer: {
    backgroundColor: '#2a2a2a',
    borderTopColor: '#444',
  },
  lightContainer: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  inactiveTabText: {
    opacity: 0.7,
  },
  darkTabText: {
    color: '#ffffff',
  },
  lightTabText: {
    color: '#333333',
  },
});