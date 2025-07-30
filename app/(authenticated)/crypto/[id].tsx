import { Stack, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
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

const categories = ['Overview', 'News', 'Orders', 'Transactions'];

const Page = () => {
  const { id } = useLocalSearchParams();
  const headerHeight = useHeaderHeight();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch coin info from /api/info
  const { data: info, isLoading: infoLoading, error: infoError } = useQuery({
    queryKey: ['info', id],
    queryFn: async () => {
      const response = await fetch(`/api/info?ids=${id}`);
      if (!response.ok) throw new Error('Failed to fetch coin info');
      const json = await response.json();
      return json[id]; // Adjust based on api/info+api.ts response structure
    },
  });

  // Fetch tickers from /api/tickers
  const { data: tickers, isLoading: tickersLoading, error: tickersError } = useQuery({
    queryKey: ['tickers', id],
    queryFn: async () => {
      const response = await fetch(`/api/tickers`);
      if (!response.ok) throw new Error('Failed to fetch tickers');
      return response.json();
    },
  });

  // Mock data for fallback
  const mockInfo = {
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
  };

  const mockTickers = [
    { timestamp: '2024-03-01T00:00:00Z', price: 61904.78 },
    { timestamp: '2024-03-02T00:00:00Z', price: 62055.01 },
    { timestamp: '2024-03-03T00:00:00Z', price: 62278.41 },
    { timestamp: '2024-03-04T00:00:00Z', price: 65381.54 },
    { timestamp: '2024-03-05T00:00:00Z', price: 66231.42 },
  ];

  // Prepare chart data for react-native-chart-kit
  const chartData = {
    labels:
      tickers?.map((item: any) =>
        format(new Date(item.timestamp), 'MM/dd')
      ) || mockTickers.map((item) => format(new Date(item.timestamp), 'MM/dd')),
    datasets: [
      {
        data: tickers?.map((item: any) => item.price) || mockTickers.map((item) => item.price),
        color: () => Colors.primary, // Line color
        strokeWidth: 3,
      },
    ],
  };

  // Latest price for display
  const latestPrice = tickers && tickers.length > 0 
    ? tickers[tickers.length - 1].price 
    : mockTickers[mockTickers.length - 1].price;

  return (
    <>
      <Stack.Screen options={{ title: info?.name || mockInfo.name }} />
      <SectionList
        style={{ marginTop: headerHeight }}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(i) => i.title}
        sections={[{ data: [{ title: 'Chart' }] }]}
        renderSectionHeader={() => (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveIndex(index)}
                style={activeIndex === index ? styles.categoriesBtnActive : styles.categoriesBtn}>
                <Text
                  style={activeIndex === index ? styles.categoryTextActive : styles.categoryText}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.subtitle}>{info?.symbol || mockInfo.symbol}</Text>
              <Image
                source={{ uri: info?.logo || mockInfo.logo }}
                style={styles.logo}
                onError={() => console.log('Failed to load logo')}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[defaultStyles.pillButtonSmall, styles.buyButton]}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={[defaultStyles.buttonText, { color: '#fff' }]}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[defaultStyles.pillButtonSmall, styles.receiveButton]}>
                <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                <Text style={[defaultStyles.buttonText, { color: Colors.primary }]}>Receive</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        renderItem={() => (
          <>
            <View style={[defaultStyles.block, styles.chartContainer]}>
              {infoLoading || tickersLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (infoError || tickersError) ? (
                <Text style={styles.errorText}>
                  Error loading data: {infoError?.message || tickersError?.message}
                </Text>
              ) : (
                <>
                  <Text style={styles.priceText}>{latestPrice.toFixed(2)} €</Text>
                  <Text style={styles.dateText}>Today</Text>
                  <LineChart
                    data={chartData}
                    width={Dimensions.get('window').width - 32}
                    height={400}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 2,
                      color: () => Colors.primary,
                      labelColor: () => Colors.gray,
                      propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: Colors.primary,
                      },
                      propsForBackgroundLines: {
                        stroke: Colors.lightGray,
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </>
              )}
            </View>
            <View style={[defaultStyles.block, styles.overviewContainer]}>
              <Text style={styles.subtitle}>Overview</Text>
              <Text style={styles.overviewText}>
                {info?.description || 
                  'Bitcoin is a decentralized digital currency, without a central bank or single ' +
                  'administrator, that can be sent from user to user on the peer-to-peer bitcoin ' +
                  'network without the need for intermediaries. Transactions are verified by network ' +
                  'nodes through cryptography and recorded in a public distributed ledger called a blockchain.'
                }
              </Text>
            </View>
          </>
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.gray,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.gray,
  },
  categoryTextActive: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '600',
  },
  categoriesBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  categoriesBtnActive: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 12,
    marginVertical: 12,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  receiveButton: {
    backgroundColor: Colors.primaryMuted,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  chartContainer: {
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error || '#ff0000',
    textAlign: 'center',
  },
  overviewContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  overviewText: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
  },
});

export default Page;