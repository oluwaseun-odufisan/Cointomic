import { useBalanceStore, Transaction } from '@/store/balanceStore';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useEffect, useState } from 'react';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Dropdown from '@/components/Dropdown';
import RoundBtn from '@/components/RoundBtn';
import WidgetList from '@/components/SortableList/WidgetList';
import { formatCurrency, useCurrencyStore } from '@/utils/currencyUtils';

const Home = () => {
  const { balance, runTransaction, transactions, clearTransactions } = useBalanceStore();
  const { primaryCurrency, setPrimaryCurrency } = useCurrencyStore();
  const headerHeight = useHeaderHeight();
  const [isLoading, setIsLoading] = useState(true);
  const scale = useSharedValue(1);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
    console.log('Transactions:', transactions.map(t => ({ ...t, date: t.date })));
  }, [transactions]);

  const onAddMoney = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      scale.value = withSpring(0.95, {}, () => (scale.value = withSpring(1)));
      runTransaction({
        id: Math.random().toString(),
        amount: Math.floor(Math.random() * 1000) * (Math.random() > 0.5 ? 1 : -1),
        date: new Date(),
        title: 'Added money',
      });
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  const toggleCurrency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrimaryCurrency(primaryCurrency === 'EUR' ? 'NGN' : 'EUR');
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const primaryBalance = formatCurrency(balance(), primaryCurrency, true);
  const secondaryBalance = formatCurrency(balance(), primaryCurrency === 'EUR' ? 'NGN' : 'EUR', false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: 100,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <>
          <Animated.View entering={FadeInUp.duration(500)} style={styles.balanceCard}>
            <View style={styles.gradient}>
              <Text style={styles.balanceTitle}>Your Balance</Text>
              <TouchableOpacity onPress={toggleCurrency} style={styles.balanceRow}>
                <Text style={styles.balance}>{primaryBalance.value}</Text>
                <Text style={styles.currency}>{primaryBalance.symbol}</Text>
              </TouchableOpacity>
              <Text style={styles.secondaryBalance}>{secondaryBalance.value}</Text>
              <TouchableOpacity style={[defaultStyles.pillButtonSmall, styles.accountsButton]}>
                <Text style={[defaultStyles.buttonTextSmall, { color: Colors.dark }]}>
                  View Accounts
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.actionRow}>
            <Animated.View style={animatedButtonStyle}>
              <RoundBtn icon={'add'} text={'Add Money'} onPress={onAddMoney} />
            </Animated.View>
            <Animated.View style={animatedButtonStyle}>
              <RoundBtn icon={'refresh'} text={'Exchange'} onPress={clearTransactions} />
            </Animated.View>
            <Animated.View style={animatedButtonStyle}>
              <RoundBtn icon={'list'} text={'Details'} onPress={() => console.log('Details pressed')} />
            </Animated.View>
            <Dropdown />
          </View>

          <Text style={[defaultStyles.sectionHeader, styles.sectionHeader]}>Recent Transactions</Text>
          <View style={styles.transactions}>
            {transactions.length === 0 ? (
              <Animated.Text entering={FadeInUp.delay(100)} style={styles.noTransactions}>
                No transactions yet
              </Animated.Text>
            ) : (
              transactions.slice(0, 5).map((transaction: Transaction, index: number) => {
                const primaryAmount = formatCurrency(transaction.amount, primaryCurrency, true);
                const secondaryAmount = formatCurrency(
                  transaction.amount,
                  primaryCurrency === 'EUR' ? 'NGN' : 'EUR',
                  false
                );
                return (
                  <Animated.View
                    key={transaction.id}
                    entering={FadeInUp.delay(index * 100)}
                    style={styles.transactionRow}
                  >
                    <View style={styles.transactionIcon}>
                      <Ionicons
                        name={transaction.amount > 0 ? 'add-circle' : 'remove-circle'}
                        size={24}
                        color={transaction.amount > 0 ? Colors.primary : Colors.gray}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionDate}>
                        {(() => {
                          try {
                            return new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                          } catch {
                            return 'Invalid Date';
                          }
                        })()}
                      </Text>
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          { color: transaction.amount > 0 ? Colors.primary : Colors.dark },
                        ]}
                      >
                        {transaction.amount > 0 ? '+' : ''}{primaryAmount.value}
                      </Text>
                      <Text style={styles.secondaryTransactionAmount}>
                        {transaction.amount > 0 ? '+' : ''}{secondaryAmount.value}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })
            )}
          </View>

          <Text style={[defaultStyles.sectionHeader, styles.sectionHeader]}>Widgets</Text>
          <WidgetList />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    marginTop: 100,
  },
  balanceCard: {
    marginHorizontal: 16,
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
  gradient: {
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
  accountsButton: {
    marginTop: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 22,
    fontWeight: '600',
  },
  transactions: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    gap: 12,
  },
  noTransactions: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    padding: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + '33',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryTransactionAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 4,
  },
});

export default Home;