import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Lock = () => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || 'User');
  const [code, setCode] = useState<number[]>([]);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const codeLength = Array(6).fill(0);
  const router = useRouter();
  const offset = useSharedValue(0);

  // Check biometric availability
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
    })();
  }, []);

  // Handle passcode validation
  useEffect(() => {
    if (code.length === 6) {
      (async () => {
        try {
          // Replace with secure passcode check (e.g., stored in AsyncStorage or Clerk)
          const storedPasscode = await AsyncStorage.getItem(`passcode_${user?.id}`);
          if (code.join('') === storedPasscode || code.join('') === '111111') { // Fallback for testing
            router.replace('/(authenticated)/(tabs)/home');
            setCode([]);
          } else {
            offset.value = withSequence(
              withTiming(-20, { duration: 80 / 2 }),
              withRepeat(withTiming(20, { duration: 80 }), 4, true),
              withTiming(0, { duration: 80 / 2 })
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setCode([]);
            Alert.alert('Error', 'Incorrect passcode. Please try again.');
          }
        } catch (error) {
          console.error('Passcode validation error:', error);
          Alert.alert('Error', 'Failed to validate passcode.');
          setCode([]);
        }
      })();
    }
  }, [code, offset, router, user?.id]);

  // Animated style for shake effect
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const onNumberPress = (number: number) => {
    if (code.length < 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode([...code, number]);
    }
  };

  const numberBackspace = () => {
    if (code.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode(code.slice(0, -1));
    }
  };

  const onBiometricAuthPress = async () => {
    try {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock Cointomic',
      });
      if (success) {
        router.replace('/(authenticated)/(tabs)/home');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Biometric authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Biometric authentication is not available.');
    }
  };

  const onForgotPasscode = () => {
    Alert.alert(
      'Forgot Passcode',
      'Please sign out and use your credentials to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => router.replace('/login') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Welcome back, {firstName}</Text>

      <Animated.View style={[styles.codeView, animatedStyle]}>
        {codeLength.map((_, index) => (
          <View
            key={index}
            style={[
              styles.codeDot,
              { backgroundColor: code[index] ? Colors.primary : Colors.lightGray },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.numbersView}>
        <View style={styles.numberRow}>
          {[1, 2, 3].map((number) => (
            <TouchableOpacity key={number} onPress={() => onNumberPress(number)}>
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.numberRow}>
          {[4, 5, 6].map((number) => (
            <TouchableOpacity key={number} onPress={() => onNumberPress(number)}>
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.numberRow}>
          {[7, 8, 9].map((number) => (
            <TouchableOpacity key={number} onPress={() => onNumberPress(number)}>
              <Text style={styles.number}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.numberRow, { alignItems: 'center' }]}>
          <TouchableOpacity
            onPress={onBiometricAuthPress}
            disabled={!isBiometricSupported}
            style={{ opacity: isBiometricSupported ? 1 : 0.5 }}
          >
            <MaterialCommunityIcons name="face-recognition" size={26} color={Colors.dark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNumberPress(0)}>
            <Text style={styles.number}>0</Text>
          </TouchableOpacity>
          <View style={{ minWidth: 60 }}>
            {code.length > 0 && (
              <TouchableOpacity onPress={numberBackspace}>
                <MaterialCommunityIcons name="backspace-outline" size={26} color={Colors.dark} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onForgotPasscode}>
          <Text style={styles.forgotText}>Forgot your passcode?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 80,
    alignSelf: 'center',
    color: Colors.dark,
  },
  codeView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 100,
  },
  codeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  numbersView: {
    marginHorizontal: 80,
    gap: 60,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  number: {
    fontSize: 32,
    color: Colors.dark,
  },
  forgotText: {
    alignSelf: 'center',
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 18,
  },
});

export default Lock;