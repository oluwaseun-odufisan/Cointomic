import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCurrencyStore } from '@/utils/currencyUtils';
import { useUserStore } from '@/utils/userStore';
import { useState } from 'react';

const CustomHeader = () => {
  const { top } = useSafeAreaInsets();
  const { primaryCurrency, setPrimaryCurrency } = useCurrencyStore();
  const { user } = useUserStore();
  const [imageError, setImageError] = useState(false);
  const profileScale = useSharedValue(1);
  const searchScale = useSharedValue(1);
  const currencyScale = useSharedValue(1);
  const settingsScale = useSharedValue(1);

  // Extract initials from fullName
  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === '') return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || 'U';
    return `${names[0][0]?.toUpperCase() || ''}${names[names.length - 1][0]?.toUpperCase() || ''}` || 'U';
  };

  const handlePress = (scale: Animated.SharedValue<number>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.9, {}, () => (scale.value = withSpring(1)));
  };

  const toggleCurrency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    currencyScale.value = withSpring(0.9, {}, () => (currencyScale.value = withSpring(1)));
    setPrimaryCurrency(primaryCurrency === 'EUR' ? 'NGN' : 'EUR');
  };

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  const currencyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: currencyScale.value }],
  }));

  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: settingsScale.value }],
  }));

  return (
    <BlurView intensity={90} tint="light" style={[styles.container, { paddingTop: top }]}>
      <View style={styles.headerContainer}>
        <Link href="/(authenticated)/(modals)/account" asChild>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handlePress(profileScale)}
          >
            <Animated.View style={[styles.profileCircle, profileAnimatedStyle]}>
              {user.profilePicture && !imageError ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.profileImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.profileText}>{getInitials(user.fullName)}</Text>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          style={styles.searchSection}
          onPress={() => handlePress(searchScale)}
        >
          <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
            <Ionicons style={styles.searchIcon} name="search" size={18} color={Colors.dark} />
            <TextInput
              style={styles.input}
              placeholder="Search transactions..."
              placeholderTextColor={Colors.gray}
              autoCapitalize="none"
              editable={false}
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.currencyButton}
          onPress={toggleCurrency}
        >
          <Animated.View style={[styles.currencyCircle, currencyAnimatedStyle]}>
            <Text style={styles.currencyText}>{primaryCurrency === 'EUR' ? '€' : '₦'}</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handlePress(settingsScale)}
        >
          <Animated.View style={[styles.iconCircle, settingsAnimatedStyle]}>
            <Ionicons name="settings-outline" size={20} color={Colors.dark} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + '33',
    backgroundColor: Colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  profileButton: {
    borderRadius: 25,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profileText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 18,
  },
  searchSection: {
    flex: 1,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    paddingVertical: 10,
  },
  currencyButton: {
    borderRadius: 20,
  },
  currencyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  iconButton: {
    borderRadius: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default CustomHeader;