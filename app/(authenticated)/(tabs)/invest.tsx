import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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

interface Investment {
  id: string;
  name: string;
  type: string;
  apy: number;
  minInvestment: number;
}

const investments: Investment[] = [
  { id: '1', name: 'Stock Portfolio', type: 'Stocks', apy: 5.2, minInvestment: 100 },
  { id: '2', name: 'Corporate Bonds', type: 'Bonds', apy: 3.8, minInvestment: 500 },
  { id: '3', name: 'Crypto Fund', type: 'Crypto', apy: 8.5, minInvestment: 200 },
  { id: '4', name: 'Real Estate Trust', type: 'REIT', apy: 4.5, minInvestment: 1000 },
];

const Invest = () => {
  const headerHeight = useHeaderHeight();
  const { balance } = useBalanceStore();
  const { primaryCurrency, setPrimaryCurrency } = useCurrencyStore();
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const buttonScale = useSharedValue(1);
  const itemScales = investments.reduce((acc, investment) => ({
    ...acc,
    [investment.id]: useSharedValue(1),
  }), {} as Record<string, Animated.SharedValue<number>>);

  const onInvest = (investmentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    itemScales[investmentId].value = withSpring(0.95, {}, () => (itemScales[investmentId].value = withSpring(1)));
    setSelectedInvestment(investmentId);
    console.log(`Initiate investment for ID: ${investmentId}`);
  };

  const handleInvestNow = () => {
    if (selectedInvestment) {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      buttonScale.value = withSpring(0.95, {}, () => (buttonScale.value = withSpring(1)));
      setTimeout(() => setIsLoading(false), 1000); // Simulate async operation
      console.log('Investing in:', selectedInvestment);
    }
  };

  const toggleCurrency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrimaryCurrency(primaryCurrency === 'EUR' ? 'NGN' : 'EUR');
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
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

        <Text style={[defaultStyles.sectionHeader, styles.sectionHeader]}>Investment Options</Text>
        <View style={styles.investmentContainer}>
          {investments.map((investment, index) => {
            const animatedItemStyle = useAnimatedStyle(() => ({
              transform: [{ scale: itemScales[investment.id].value }],
            }));
            const primaryMinInvestment = formatCurrency(investment.minInvestment, primaryCurrency, true);
            const secondaryMinInvestment = formatCurrency(
              investment.minInvestment,
              primaryCurrency === 'EUR' ? 'NGN' : 'EUR',
              false
            );
            return (
              <Animated.View
                key={investment.id}
                entering={FadeInUp.delay(index * 100)}
                style={[styles.investmentItem, animatedItemStyle]}
              >
                <TouchableOpacity
                  style={[
                    styles.investmentContent,
                    selectedInvestment === investment.id && styles.selected,
                  ]}
                  onPress={() => onInvest(investment.id)}
                >
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text style={styles.investmentName}>{investment.name}</Text>
                    <Text style={styles.investmentType}>{investment.type}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={styles.investmentApy}>{investment.apy}% APY</Text>
                    <Text style={styles.investmentMin}>Min: {primaryMinInvestment.value}</Text>
                    <Text style={styles.secondaryInvestmentMin}>{secondaryMinInvestment.value}</Text>
                  </View>
                  <Ionicons
                    name={selectedInvestment === investment.id ? 'checkmark-circle' : 'chevron-forward'}
                    size={20}
                    color={selectedInvestment === investment.id ? Colors.primary : Colors.gray}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View style={[animatedButtonStyle, { alignItems: 'center' }]}>
          <TouchableOpacity
            style={[
              defaultStyles.pillButton,
              styles.actionButton,
              selectedInvestment ? styles.enabled : styles.disabled,
            ]}
            onPress={handleInvestNow}
            disabled={!selectedInvestment || isLoading}
          >
            <Text style={defaultStyles.buttonText}>Invest Now</Text>
            {isLoading && <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />}
          </TouchableOpacity>
        </Animated.View>
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
  investmentContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  investmentItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  investmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray + '33',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  selected: {
    borderColor: Colors.primary + '66',
    backgroundColor: Colors.primaryMuted + '33',
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  investmentType: {
    fontSize: 14,
    color: Colors.gray,
  },
  investmentApy: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  investmentMin: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  secondaryInvestmentMin: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    width: '80%',
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
  buttonLoader: {
    marginLeft: 8,
  },
});

export default Invest;