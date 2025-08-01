import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBalanceStore } from '@/store/balanceStore';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { formatCurrency, useCurrencyStore } from '@/utils/currencyUtils';

enum TransferType {
  Phone,
  Email,
}

const Transfers = () => {
  const headerHeight = useHeaderHeight();
  const { balance, runTransaction } = useBalanceStore();
  const { primaryCurrency, setPrimaryCurrency } = useCurrencyStore();
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Phone);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const buttonScale = useSharedValue(1);
  const switchScale = useSharedValue(1);

  const onTransfer = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Please enter a valid amount.');
      return;
    }
    const amountInEur = primaryCurrency === 'NGN' ? Number(amount) / 1600 : Number(amount);
    if (amountInEur > balance()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Insufficient balance.');
      return;
    }
    if (transferType === TransferType.Phone && !phoneNumber.match(/^\d{10,15}$/)) {
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Error);
      alert('Please enter a valid phone number (10-15 digits).');
      return;
    }
    if (transferType === TransferType.Email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Error);
      alert('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    buttonScale.value = withSpring(0.95, {}, () => (buttonScale.value = withSpring(1)));
    try {
      runTransaction({
        id: Math.random().toString(),
        amount: -amountInEur,
        date: new Date(),
        title: `Transfer to ${transferType === TransferType.Phone ? phoneNumber : email}`,
      });
      alert('Transfer successful!');
      setPhoneNumber('');
      setEmail('');
      setAmount('');
    } catch (error) {
      alert('Transfer failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchInput = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchScale.value = withSpring(0.95, {}, () => (switchScale.value = withSpring(1)));
    setTransferType(transferType === TransferType.Phone ? TransferType.Email : TransferType.Phone);
    setPhoneNumber('');
    setEmail('');
  };

  const toggleCurrency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrimaryCurrency(primaryCurrency === 'EUR' ? 'NGN' : 'EUR');
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedSwitchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: switchScale.value }],
  }));

  const primaryBalance = formatCurrency(balance(), primaryCurrency, true);
  const secondaryBalance = formatCurrency(balance(), primaryCurrency === 'EUR' ? 'NGN' : 'EUR', false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 80,
          paddingHorizontal: 16,
        }}
      >
        <Animated.View entering={FadeInUp.duration(500)} style={styles.balanceCard}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <TouchableOpacity onPress={toggleCurrency} style={styles.balanceRow}>
              <Text style={styles.balance}>{primaryBalance.value}</Text>
              <Text style={styles.currency}>{primaryBalance.symbol}</Text>
            </TouchableOpacity>
            <Text style={styles.secondaryBalance}>{secondaryBalance.value}</Text>
          </View>
        </Animated.View>

        <Text style={[defaultStyles.sectionHeader, styles.sectionHeader]}>Transfer Details</Text>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.inputSection}>
          {transferType === TransferType.Phone && (
            <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputFocused]}>
              <Ionicons name="call" size={20} color={Colors.dark} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={Colors.gray}
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={15}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          )}
          {transferType === TransferType.Email && (
            <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputFocused]}>
              <Ionicons name="mail" size={20} color={Colors.dark} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Colors.gray}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          )}
          <View style={[styles.inputContainer, focusedInput === 'amount' && styles.inputFocused]}>
            <Ionicons name="cash" size={20} color={Colors.dark} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={`Amount (${primaryCurrency})`}
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setFocusedInput('amount')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </Animated.View>

        <View style={styles.buttonSection}>
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={[
                defaultStyles.pillButton,
                (transferType === TransferType.Phone ? phoneNumber : email) && amount
                  ? styles.enabled
                  : styles.disabled,
                styles.actionButton,
              ]}
              onPress={onTransfer}
              disabled={!(transferType === TransferType.Phone ? phoneNumber : email) || !amount || loading}
            >
              <Text style={defaultStyles.buttonText}>Transfer</Text>
              {loading && <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or transfer with</Text>
            <View style={styles.dividerLine} />
          </View>

          <Animated.View style={animatedSwitchStyle}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleSwitchInput}
              disabled={loading}
            >
              <Ionicons
                name={transferType === TransferType.Phone ? 'mail' : 'call'}
                size={24}
                color={Colors.dark}
              />
              <Text style={styles.socialButtonText}>
                {transferType === TransferType.Phone ? 'Use Email' : 'Use Phone'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  balanceCard: {
    marginVertical: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: Colors.background,
  },
  balanceContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primaryMuted + '33',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  balance: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.dark,
  },
  currency: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.gray,
  },
  secondaryBalance: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
    fontSize: 22,
    fontWeight: '600',
    color: Colors.dark,
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray + '33',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputFocused: {
    borderColor: Colors.primary + '66',
    shadowOpacity: 0.2,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.dark,
  },
  inputIcon: {
    padding: 16,
  },
  buttonSection: {
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  enabled: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.primaryMuted,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray + '33',
  },
  dividerText: {
    color: Colors.gray,
    fontSize: 14,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray + '33',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  socialButtonText: {
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonLoader: {
    marginLeft: 8,
  },
});

export default Transfers;