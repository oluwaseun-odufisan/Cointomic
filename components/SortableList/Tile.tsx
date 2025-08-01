import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useBalanceStore, Transaction } from '@/store/balanceStore';
import { SIZE } from './Config';

interface TileProps {
  id: string;
  onLongPress: () => void;
}

const Tile = ({ id, onLongPress }: TileProps) => {
  const { transactions } = useBalanceStore();

  const spentThisMonth = transactions
    .filter((t: Transaction) => t.amount < 0)
    .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {id === 'spent' && (
        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: 'System' }]}>Spent This Month</Text>
          <Text style={styles.value}>{spentThisMonth.toFixed(2)}€</Text>
        </View>
      )}

      {id === 'cashback' && (
        <View style={styles.cashbackContent}>
          <View style={styles.cashbackCircle}>
            <Text style={styles.cashbackValue}>5%</Text>
          </View>
          <Text style={[styles.cashbackTitle, { fontFamily: 'System' }]}>Cashback</Text>
        </View>
      )}

      {id === 'recent' && (
        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: 'System' }]}>Recent Transaction</Text>
          {transactions.length === 0 ? (
            <Text style={[styles.noData, { fontFamily: 'System' }]}>No transactions</Text>
          ) : (
            <>
              <Text style={styles.value}>
                {transactions[transactions.length - 1].amount.toFixed(2)}€
              </Text>
              <Text style={[styles.subtitle, { fontFamily: 'System' }]}>
                {transactions[transactions.length - 1].title}
              </Text>
              <Text style={[styles.subtitle, { fontFamily: 'System' }]}>
                {(() => {
                  try {
                    return new Date(transactions[transactions.length - 1].date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  } catch {
                    return 'Invalid Date';
                  }
                })()}
              </Text>
            </>
          )}
        </View>
      )}

      {id === 'cards' && (
        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: 'System' }]}>Cards</Text>
          <Ionicons
            name="card"
            size={50}
            color={Colors.primary}
            style={styles.cardIcon}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE - 8,
    height: 160,
    backgroundColor: Colors.background,
    borderRadius: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    padding: 16,
    margin: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 4,
  },
  noData: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 8,
  },
  cashbackContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cashbackCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cashbackValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
  cashbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  cardIcon: {
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default Tile;