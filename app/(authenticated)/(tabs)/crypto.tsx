import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/interfaces/crypto';
import { Link } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, useCurrencyStore } from '@/utils/currencyUtils';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path } from 'react-native-svg';
import { useState } from 'react';

const Crypto = () => {
  const headerHeight = useHeaderHeight();
  const { primaryCurrency } = useCurrencyStore();
  const [percentChangeType, setPercentChangeType] = useState<'1h' | '24h' | '7d'>('24h');

  // Fetch currency listings with sparkline data
  const { data: currencies, isLoading, error } = useQuery({
    queryKey: ['listings', primaryCurrency],
    queryFn: async (): Promise<Currency[]> => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${
          primaryCurrency === 'EUR' ? 'eur' : 'ngn'
        }&order=market_cap_desc&per_page=10&page=1&sparkline=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch currency listings');
      }
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        slug: item.id,
        num_market_pairs: 0,
        date_added: item.last_updated,
        tags: [],
        max_supply: item.max_supply || 0,
        circulating_supply: item.circulating_supply,
        total_supply: item.total_supply,
        infinite_supply: false,
        platform: null,
        cmc_rank: item.market_cap_rank,
        self_reported_circulating_supply: null,
        self_reported_market_cap: null,
        tvl_ratio: null,
        last_updated: item.last_updated,
        quote: {
          [primaryCurrency]: {
            price: item.current_price,
            volume_24h: item.total_volume,
            volume_change_24h: item.price_change_percentage_24h,
            percent_change_1h: item.price_change_percentage_1h_in_currency || 0,
            percent_change_24h: item.price_change_percentage_24h,
            percent_change_7d: item.price_change_percentage_7d_in_currency,
            percent_change_30d: 0,
            percent_change_60d: 0,
            percent_change_90d: 0,
            market_cap: item.market_cap,
            market_cap_dominance: 0,
            fully_diluted_market_cap: item.fully_diluted_valuation || 0,
            tvl: null,
            last_updated: item.last_updated,
            sparkline_7d: item.sparkline_in_7d?.price || [],
          },
        },
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Fetch coin info for logos
  const ids = currencies?.map((currency: Currency) => currency.id).join(',');
  const { data: infoData } = useQuery({
    queryKey: ['info', ids],
    queryFn: async () => {
      if (!ids) return {};
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${
          primaryCurrency === 'EUR' ? 'eur' : 'ngn'
        }&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch coin info');
      }
      const data = await response.json();
      const infoMap: { [key: string]: { logo: string } } = {};
      data.forEach((item: any) => {
        infoMap[item.id] = { logo: item.image };
      });
      return infoMap;
    },
    enabled: !!ids,
    staleTime: 1000 * 60 * 60,
  });

  // Function to draw sparkline
  const renderSparkline = (prices: number[]) => {
    if (!prices || prices.length < 2) return null;
    const width = 80;
    const height = 30;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = maxPrice - minPrice || 1;

    const pathData = prices
      .map((price, i) => {
        const x = (i / (prices.length - 1)) * width;
        const y = height - ((price - minPrice) / range) * height;
        return i === 0 ? `M${x},${y}` : `L${x},${y}`;
      })
      .join(' ');

    const isPositive = prices[prices.length - 1] > prices[0];
    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={pathData} stroke={isPositive ? '#22C55E' : '#EF4444'} strokeWidth={2} fill="none" />
      </Svg>
    );
  };

  const togglePercentChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPercentChangeType((prev) =>
      prev === '1h' ? '24h' : prev === '24h' ? '7d' : '1h'
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 120 }}
    >
      <LinearGradient
        colors={[Colors.primaryMuted + '22', Colors.background]}
        style={styles.headerGradient}
      >
        <Text style={[defaultStyles.sectionHeader, styles.sectionHeader]}>
          Crypto Markets
        </Text>
      </LinearGradient>
      <View style={styles.content}>
        {isLoading && (
          <Text style={styles.statusText}>Loading markets...</Text>
        )}
        {error && (
          <Text style={[styles.statusText, { color: Colors.error }]}>
            Error: {error.message}
          </Text>
        )}
        {currencies?.map((currency: Currency, index: number) => {
          const scale = useSharedValue(1);
          const opacity = useSharedValue(1);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
          }));

          const handlePress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            scale.value = withSpring(0.95, { damping: 15 }, () => {
              scale.value = withSpring(1);
            });
            opacity.value = withTiming(0.8, { duration: 100 }, () => {
              opacity.value = withTiming(1);
            });
          };

          const primaryPrice = formatCurrency(
            currency.quote[primaryCurrency].price,
            primaryCurrency,
            true
          );
          const secondaryPrice = formatCurrency(
            currency.quote[primaryCurrency].price,
            primaryCurrency === 'EUR' ? 'NGN' : 'EUR',
            false
          );
          const percentChange =
            percentChangeType === '1h'
              ? currency.quote[primaryCurrency].percent_change_1h
              : percentChangeType === '24h'
              ? currency.quote[primaryCurrency].percent_change_24h
              : currency.quote[primaryCurrency].percent_change_7d;

          return (
            <Link href={`/crypto/${currency.id}`} key={currency.id} asChild>
              <TouchableOpacity onPress={handlePress} style={styles.cardContainer}>
                <Animated.View
                  style={[styles.card, animatedStyle]}
                  entering={FadeInUp.delay(index * 100)}
                >
                  <LinearGradient
                    colors={[Colors.background, Colors.lightGray + 'CC']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.logoContainer}>
                        <Image
                          source={{
                            uri: infoData?.[currency.id]?.logo || 'https://via.placeholder.com/48',
                          }}
                          style={styles.currencyLogo}
                          onError={() =>
                            console.log(`Failed to load logo for ${currency.name}`)
                          }
                        />
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.currencyName}>{currency.name}</Text>
                        <Text style={styles.currencySymbol}>
                          {currency.symbol.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <TouchableOpacity onPress={togglePercentChange}>
                          <Text style={styles.price}>{primaryPrice.value}</Text>
                          <Text style={styles.secondaryPrice}>
                            {secondaryPrice.value}
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.percentChange}>
                          <Ionicons
                            name={percentChange > 0 ? 'caret-up' : 'caret-down'}
                            size={14}
                            color={percentChange > 0 ? '#22C55E' : '#EF4444'}
                          />
                          <Text
                            style={[
                              styles.percentText,
                              { color: percentChange > 0 ? '#22C55E' : '#EF4444' },
                            ]}
                          >
                            {percentChange.toFixed(2)}% ({percentChangeType})
                          </Text>
                        </View>
                        <View style={styles.sparkline}>
                          {renderSparkline(currency.quote[primaryCurrency].sparkline_7d)}
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    padding: 20,
    color: Colors.gray,
  },
  cardContainer: {
    borderRadius: 16,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray + '22',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryMuted + '33',
    shadowColor: Colors.dark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  currencyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  currencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  secondaryPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray,
  },
  percentChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sparkline: {
    marginTop: 4,
    width: 80,
    height: 30,
  },
});

export default Crypto;