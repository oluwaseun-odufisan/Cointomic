import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import CustomHeader from '@/components/CustomHeader';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const tabs = [
  { name: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'invest', title: 'Invest', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  { name: 'transfers', title: 'Transfer', icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal' },
  { name: 'crypto', title: 'Crypto', icon: 'wallet-outline', activeIcon: 'wallet' },
  { name: 'lifestyle', title: 'Lifestyle', icon: 'heart-outline', activeIcon: 'heart' },
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <BlurView intensity={95} tint="extraLight" style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const { options } = descriptors[state.routes[index].key];
          const isFocused = state.index === index;
          const scale = useSharedValue(isFocused ? 1.1 : 1);
          const opacity = useSharedValue(isFocused ? 1 : 0.7);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
          }));

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            scale.value = withSpring(1.15, { damping: 15 }, () => {
              scale.value = withSpring(isFocused ? 1.1 : 1);
            });
            opacity.value = withTiming(isFocused ? 1 : 0.7);
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityLabel={`${tab.title} tab`}
            >
              <Animated.View style={[styles.tabContent, animatedStyle]}>
                {isFocused ? (
                  <LinearGradient
                    colors={[Colors.primaryMuted, Colors.primary]}
                    style={styles.tabGradient}
                  >
                    <Ionicons
                      name={tab.activeIcon}
                      size={26}
                      color={Colors.background}
                    />
                  </LinearGradient>
                ) : (
                  <View style={styles.tabIconContainer}>
                    <Ionicons
                      name={tab.icon}
                      size={26}
                      color={Colors.gray}
                    />
                  </View>
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? Colors.primary : Colors.gray },
                  ]}
                >
                  {tab.title}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
};

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        header: () => <CustomHeader />,
        headerTransparent: true,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.background + 'CC',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray + '22',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tabGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray + '33',
    shadowColor: Colors.dark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default Layout;