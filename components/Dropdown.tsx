/**
 * Custom Dropdown component for the "More" menu on the homepage.
 * @module components/Dropdown
 */

import { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import RoundBtn from '@/components/RoundBtn';

const Dropdown = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, { damping: 15 }, () => {
      scale.value = withSpring(1);
      setIsVisible(true);
    });
  };

  const menuItems = [
    { title: 'View Portfolio', icon: 'briefcase', action: () => console.log('Navigate to Portfolio') },
    { title: 'Settings', icon: 'settings', action: () => console.log('Navigate to Settings') },
    { title: 'Support', icon: 'help-circle', action: () => console.log('Navigate to Support') },
  ];

  return (
    <>
      <Animated.View style={[animatedStyle, styles.container]}>
        <RoundBtn
          icon={'ellipsis-horizontal'}
          text={'More'}
          onPress={handlePress}
          accessibilityLabel="More options"
        />
      </Animated.View>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <LinearGradient
            colors={[Colors.background, Colors.lightGray + 'CC']}
            style={styles.modalGradient}
          >
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.modalContent}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  style={[styles.menuItem, index === menuItems.length - 1 ? styles.lastMenuItem : null]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    item.action();
                    setIsVisible(false);
                  }}
                  accessibilityLabel={item.title}
                >
                  <Ionicons name={item.icon} size={20} color={Colors.dark} style={styles.menuIcon} />
                  <Text style={styles.menuText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.dark + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGradient: {
    borderRadius: 16,
    width: '80%',
    padding: 2, // Thin padding for gradient border effect
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    marginHorizontal: 32,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + '33',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
  },
});

export default Dropdown;