import { Stack, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { format } from 'date-fns';
import { Currency, Ticker } from '@/interfaces/crypto';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { formatCurrency, useCurrencyStore } from '@/utils/currencyUtils';

const categories = ['Overview', 'News', 'Orders', 'Transactions'];
const screenWidth = Dimensions.get('window').width;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const headerHeight = useHeaderHeight();
  const { primaryCurrency } = useCurrencyStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartRange, setChartRange] = useState<'1h' | '24h' | '7d'>('7d');

  // Fetch coin info
  const { data: info, isLoading: infoLoading, error: infoError } = useQuery({
    queryKey: ['info', id],
    queryFn: async (): Promise<{ name: string; symbol: string; logo: string; description: string }> => {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
      if (!response.ok) throw new Error('Failed to fetch coin info');
      const data = await response.json();
      return {
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        logo: data.image.large,
        description: data.description.en || 'No description available.',
      };
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });

  // Fetch historical price data based on chart range
  const { data: tickers, isLoading: tickersLoading, error: tickersError } = useQuery({
    queryKey: ['tickers', id, chartRange, primaryCurrency],
    queryFn: async (): Promise<Ticker[]> => {
      const days = chartRange === '1h' ? '1' : chartRange === '24h' ? '1' : '7';
      const interval = chartRange === '1h' ? 'hourly' : 'daily';
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${
          primaryCurrency === 'EUR' ? 'eur' : 'ngn'
        }&days=${days}&interval=${interval}`
      );
      if (!response.ok) throw new Error('Failed to fetch tickers');
      const data = await response.json();
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp).toISOString(),
        price,
        volume_24h: 0,
        market_cap: 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Mock data for fallback and other sections
  const mockInfo = {
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    description:
      'Bitcoin is a decentralized digital currency, without a central bank or single administrator...',
  };

  const mockTickers: Ticker[] = [
    { timestamp: '2025-07-31T00:00:00Z', price: 61904.78, volume_24h: 0, market_cap: 0 },
    { timestamp: '2025-07-31T01:00:00Z', price: 62055.01, volume_24h: 0, market_cap: 0 },
    { timestamp: '2025-07-31T02:00:00Z', price: 62278.41, volume_24h: 0, market_cap: 0 },
    { timestamp: '2025-07-31T03:00:00Z', price: 65381.54, volume_24h: 0, market_cap: 0 },
    { timestamp: '2025-07-31T04:00:00Z', price: 66231.42, volume_24h: 0, market_cap: 0 },
  ];

  const mockNews = [
    { id: '1', title: `${info?.name || 'Bitcoin'} Surges to New Highs`, date: '2025-07-30', summary: 'Market analysts predict continued growth due to institutional adoption.' },
    { id: '2', title: 'Blockchain Upgrade Announced', date: '2025-07-29', summary: 'New features enhance scalability and transaction speed.' },
  ];

  const mockOrders = [
    { id: '1', type: 'Buy', amount: 0.05, price: 62000, date: '2025-07-30' },
    { id: '2', type: 'Sell', amount: 0.02, price: 62500, date: '2025-07-29' },
  ];

  const mockTransactions = [
    { id: '1', type: 'Receive', amount: 0.01, date: '2025-07-30T10:00:00Z' },
    { id: '2', type: 'Send', amount: 0.03, date: '2025-07-29T15:30:00Z' },
  ];

  // Prepare chart data
  const chartData = {
    labels: (tickers || mockTickers).map((item, index) =>
      index % Math.ceil((tickers || mockTickers).length / 6) === 0
        ? format(
            new Date(item.timestamp),
            chartRange === '1h' ? 'HH:mm' : chartRange === '24h' ? 'HH:mm' : 'MM/dd'
          )
        : ''
    ),
    datasets: [
      {
        data: (tickers || mockTickers).map((item) => item.price),
        color: () => Colors.primary,
        strokeWidth: 3,
      },
    ],
  };

  const latestPrice = formatCurrency(
    tickers && tickers.length > 0
      ? tickers[tickers.length - 1].price
      : mockTickers[mockTickers.length - 1].price,
    primaryCurrency,
    true
  );
  const secondaryPrice = formatCurrency(
    tickers && tickers.length > 0
      ? tickers[tickers.length - 1].price
      : mockTickers[mockTickers.length - 1].price,
    primaryCurrency === 'EUR' ? 'NGN' : 'EUR',
    false
  );

  // Animation for tabs and buttons
  const handleTabPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveIndex(index);
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <>
      <Stack.Screen options={{ title: info?.name || mockInfo.name }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 140 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.primaryMuted + '33', Colors.background]}
          style={styles.headerGradient}
        >
          <BlurView intensity={95} tint="extraLight" style={styles.headerContainer}>
            <View style={styles.headerInfo}>
              <Image
                source={{ uri: info?.logo || mockInfo.logo }}
                style={styles.logo}
                onError={() => console.log('Failed to load logo')}
              />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{info?.name || mockInfo.name}</Text>
                <Text style={styles.headerSymbol}>{info?.symbol || mockInfo.symbol}</Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[defaultStyles.pillButtonSmall, styles.buyButton]}
                onPress={handleButtonPress}
                accessibilityLabel={`Buy ${info?.name || 'Bitcoin'}`}
              >
                <Ionicons name="add" size={22} color="#fff" />
                <Text style={[defaultStyles.buttonText, { color: '#fff', fontSize: 16 }]}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[defaultStyles.pillButtonSmall, styles.receiveButton]}
                onPress={handleButtonPress}
                accessibilityLabel={`Receive ${info?.name || 'Bitcoin'}`}
              >
                <Ionicons name="arrow-down" size={22} color={Colors.primary} />
                <Text style={[defaultStyles.buttonText, { color: Colors.primary, fontSize: 16 }]}>Receive</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>

        {/* Category Tabs */}
        <BlurView intensity={95} tint="extraLight" style={styles.tabBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
            {categories.map((item, index) => {
              const scale = useSharedValue(activeIndex === index ? 1.1 : 1);
              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scale.value }],
              }));

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    handleTabPress(index);
                    scale.value = withSpring(1.15, { damping: 15 }, () => {
                      scale.value = withSpring(activeIndex === index ? 1.1 : 1);
                    });
                  }}
                  style={activeIndex === index ? styles.tabActive : styles.tab}
                  accessibilityLabel={`${item} tab`}
                >
                  <Animated.View style={animatedStyle}>
                    <Text
                      style={activeIndex === index ? styles.tabTextActive : styles.tabText}
                    >
                      {item}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BlurView>

        {/* Content Sections */}
        <View style={styles.content}>
          {/* Chart Section */}
          {(activeIndex === 0 || activeIndex === -1) && (
            <View style={[defaultStyles.block, styles.card]}>
              <LinearGradient
                colors={[Colors.background, Colors.lightGray + 'CC']}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Price Chart</Text>
                  <View style={styles.chartHeader}>
                    {['1h', '24h', '7d'].map((range) => (
                      <TouchableOpacity
                        key={range}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setChartRange(range as '1h' | '24h' | '7d');
                        }}
                      >
                        <Text
                          style={chartRange === range ? styles.rangeTextActive : styles.rangeText}
                        >
                          {range.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {infoLoading || tickersLoading ? (
                  <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
                ) : infoError || tickersError ? (
                  <Text style={styles.errorText}>
                    Error: {(infoError || tickersError)?.message}
                  </Text>
                ) : (
                  <>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>{latestPrice.value}</Text>
                      <Text style={styles.secondaryPrice}>{secondaryPrice.value}</Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chartScroll}
                    >
                      <LineChart
                        data={chartData}
                        width={Math.max(screenWidth - 32, chartData.labels.length * 50)}
                        height={280}
                        chartConfig={{
                          backgroundColor: Colors.background,
                          backgroundGradientFrom: Colors.background,
                          backgroundGradientTo: Colors.background,
                          decimalPlaces: 2,
                          color: () => Colors.primary,
                          labelColor: () => Colors.gray,
                          fillShadowGradient: Colors.primaryMuted,
                          fillShadowGradientOpacity: 0.4,
                          propsForDots: {
                            r: '5',
                            strokeWidth: '2',
                            stroke: Colors.primary,
                          },
                          propsForBackgroundLines: {
                            stroke: Colors.lightGray,
                            strokeDasharray: '',
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />
                    </ScrollView>
                  </>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Overview Section */}
          {(activeIndex === 0 || activeIndex === -1) && (
            <View style={[defaultStyles.block, styles.card]}>
              <LinearGradient
                colors={[Colors.background, Colors.lightGray + 'CC']}
                style={styles.cardGradient}
              >
                <Text style={styles.sectionTitle}>Overview</Text>
                <Text style={styles.overviewText}>
                  {info?.description || mockInfo.description}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* News Section */}
          {(activeIndex === 1 || activeIndex === -1) && (
            <View style={[defaultStyles.block, styles.card]}>
              <LinearGradient
                colors={[Colors.background, Colors.lightGray + 'CC']}
                style={styles.cardGradient}
              >
                <Text style={styles.sectionTitle}>News</Text>
                {mockNews.map((news) => (
                  <View key={news.id} style={styles.newsItem}>
                    <Text style={styles.newsTitle}>{news.title}</Text>
                    <Text style={styles.newsDate}>{news.date}</Text>
                    <Text style={styles.newsSummary}>{news.summary}</Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          )}

          {/* Orders Section */}
          {(activeIndex === 2 || activeIndex === -1) && (
            <View style={[defaultStyles.block, styles.card]}>
              <LinearGradient
                colors={[Colors.background, Colors.lightGray + 'CC']}
                style={styles.cardGradient}
              >
                <Text style={styles.sectionTitle}>Orders</Text>
                {mockOrders.map((order) => (
                  <View key={order.id} style={styles.orderItem}>
                    <View style={styles.orderRow}>
                      <Text style={styles.orderType}>{order.type}</Text>
                      <Text style={styles.orderAmount}>
                        {order.amount} {info?.symbol || mockInfo.symbol}
                      </Text>
                    </View>
                    <Text style={styles.orderPrice}>
                      {formatCurrency(order.price, primaryCurrency, true).value}
                    </Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          )}

          {/* Transactions Section */}
          {(activeIndex === 3 || activeIndex === -1) && (
            <View style={[defaultStyles.block, styles.card]}>
              <LinearGradient
                colors={[Colors.background, Colors.lightGray + 'CC']}
                style={styles.cardGradient}
              >
                <Text style={styles.sectionTitle}>Transactions</Text>
                {mockTransactions.map((tx) => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionType}>{tx.type}</Text>
                      <Text style={styles.transactionAmount}>
                        {tx.amount} {info?.symbol || mockInfo.symbol}
                      </Text>
                    </View>
                    <Text style={styles.transactionDate}>
                      {format(new Date(tx.date), 'yyyy-MM-dd HH:mm')}
                    </Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  headerContainer: {
    padding: 10,
    backgroundColor: Colors.background + 'CC',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.gray + '33',
    shadowColor: Colors.dark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
  },
  headerSymbol: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
  },
  receiveButton: {
    backgroundColor: Colors.background,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    flex: 1,
    justifyContent: 'center',
  },
  tabBarContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray + '22',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tabBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.lightGray,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  tabActive: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted + '33',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray,
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  content: {
    paddingHorizontal: 1,
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGradient: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray + '22',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
  },
  chartHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  rangeTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark,
  },
  secondaryPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 4,
  },
  chartScroll: {
    paddingVertical: 8,
  },
  chart: {
    borderRadius: 12,
  },
  loader: {
    marginVertical: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.error,
    textAlign: 'center',
    marginVertical: 24,
  },
  overviewText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray,
    lineHeight: 26,
  },
  newsItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray + '33',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  newsDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
    marginVertical: 6,
  },
  newsSummary: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray,
    lineHeight: 24,
  },
  orderItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray + '33',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderType: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
    marginTop: 6,
  },
  transactionItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray + '33',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray,
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
  },
});

export default Page;