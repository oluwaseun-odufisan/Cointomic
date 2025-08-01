import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBalanceStore } from '@/store/balanceStore';
import { formatCurrency, useCurrencyStore } from '@/utils/currencyUtils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const services: Service[] = [
  {
    id: '1',
    name: 'Streaming Subscription',
    description: 'Access premium movies and shows',
    price: 12.99,
    icon: 'tv',
  },
  {
    id: '2',
    name: 'Fitness Membership',
    description: 'Gym access and online classes',
    price: 29.99,
    icon: 'fitness',
  },
  {
    id: '3',
    name: 'Gift Card',
    description: 'Shop at your favorite stores',
    price: 50.00,
    icon: 'gift',
  },
];

const Lifestyle = () => {
  const headerHeight = useHeaderHeight();
  const { balance } = useBalanceStore();
  const { primaryCurrency, setPrimaryCurrency } = useCurrencyStore();
  const itemScales = services.reduce((acc, service) => ({
    ...acc,
    [service.id]: useSharedValue(1),
  }), {} as Record<string, Animated.SharedValue<number>>);

  const onSelectService = (serviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    itemScales[serviceId].value = withSpring(0.95, {}, () => (itemScales[serviceId].value = withSpring(1)));
    console.log(`Selected service ID: ${serviceId}`);
  };

  const toggleCurrency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrimaryCurrency(primaryCurrency === 'EUR' ? 'NGN' : 'EUR');
  };

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

        <Text style={[defaultStyles.sectionHeader, styles.sectionHeader]}>Lifestyle Services</Text>
        <View style={styles.serviceContainer}>
          {services.map((service, index) => {
            const animatedItemStyle = useAnimatedStyle(() => ({
              transform: [{ scale: itemScales[service.id].value }],
            }));
            const primaryPrice = formatCurrency(service.price, primaryCurrency, true);
            const secondaryPrice = formatCurrency(service.price, primaryCurrency === 'EUR' ? 'NGN' : 'EUR', false);
            return (
              <Animated.View
                key={service.id}
                entering={FadeInUp.delay(index * 100)}
                style={[styles.serviceItem, animatedItemStyle]}
              >
                <TouchableOpacity
                  style={styles.serviceContent}
                  onPress={() => onSelectService(service.id)}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name={service.icon} size={30} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={styles.servicePrice}>{primaryPrice.value}</Text>
                    <Text style={styles.secondaryServicePrice}>{secondaryPrice.value}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
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
  serviceContainer: {
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
  serviceItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  serviceContent: {
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
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted + '33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.gray,
    flexWrap: 'wrap',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  secondaryServicePrice: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
  },
});

export default Lifestyle;