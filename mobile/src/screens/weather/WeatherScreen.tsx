import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { RootStackParamList } from '../../types/navigation';
import { WeatherData } from '../../types/weatherAndMarket';
import { fetchWeatherData } from '../../services/weatherAndMarketService';
import { Colors, Spacing } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Weather'>;

const DISTRICTS = [
  { id: 'Trichy', nameEn: 'Trichy', nameTa: 'திருச்சி' },
  { id: 'Chennai', nameEn: 'Chennai', nameTa: 'சென்னை' },
  { id: 'Erode', nameEn: 'Erode', nameTa: 'ஈரோடு' },
  { id: 'Madurai', nameEn: 'Madurai', nameTa: 'மதுரை' },
  { id: 'Salem', nameEn: 'Salem', nameTa: 'சேலம்' },
  { id: 'Coimbatore', nameEn: 'Coimbatore', nameTa: 'கோவை' },
  { id: 'Thanjavur', nameEn: 'Thanjavur', nameTa: 'தஞ்சாவூர்' },
  { id: 'Nagercoil', nameEn: 'Nagercoil', nameTa: 'நாகர்கோவில்' },
];

export const WeatherScreen: React.FC<Props> = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Trichy');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTamil, setIsTamil] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const loadWeather = async (district: string, lat?: number, lon?: number) => {
    setIsLoading(true);
    try {
      const data = await fetchWeatherData(district, lat, lon);
      setWeather(data);
    } catch (e: any) {
      Alert.alert('Weather Error', 'Could not fetch meteorological data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedDistrict);
  }, [selectedDistrict]);

  const handleUseGps = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Needed',
          'Please allow location permission to display live local weather for your current field coordinates.'
        );
        setIsLocating(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await loadWeather('GPS Location', position.coords.latitude, position.coords.longitude);
    } catch (err: any) {
      Alert.alert('GPS Error', 'Could not determine device GPS coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            loadWeather(selectedDistrict);
          }}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Language & GPS Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseGps}
          disabled={isLocating}
          activeOpacity={0.8}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={Colors.primary} />
              <Text style={styles.gpsButtonText}>
                {isTamil ? 'என் இருப்பிடம்' : 'Use My GPS'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setIsTamil(!isTamil)}
        >
          <MaterialCommunityIcons name="translate" size={14} color={Colors.primary} />
          <Text style={styles.langBtnText}>{isTamil ? 'English' : 'தமிழ்'}</Text>
        </TouchableOpacity>
      </View>

      {/* District Selector Chips */}
      <View style={styles.districtSection}>
        <Text style={styles.sectionLabel}>
          {isTamil ? 'வேளாண் மாவட்டத்தைத் தேர்வு செய்யவும்:' : 'Select Agricultural District:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {DISTRICTS.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.districtChip, selectedDistrict === d.id && styles.districtChipActive]}
              onPress={() => setSelectedDistrict(d.id)}
            >
              <Text style={[styles.chipText, selectedDistrict === d.id && styles.chipTextActive]}>
                {isTamil ? d.nameTa : d.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !weather ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {isTamil ? 'வானிலை தரவு பெறப்படுகிறது...' : 'Connecting to Open-Meteo satellite feed...'}
          </Text>
        </View>
      ) : weather ? (
        <>
          {/* Today Weather Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroLocation}>
                  {weather.location}
                </Text>
                <Text style={styles.heroSource}>
                  {weather.source}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={(weather.current.icon as any) || 'weather-partly-cloudy'}
                size={54}
                color={Colors.white}
              />
            </View>

            <View style={styles.heroTempRow}>
              <Text style={styles.heroTemp}>{weather.current.temperature}°C</Text>
              <View style={styles.heroConditionCol}>
                <Text style={styles.heroCondition}>
                  {isTamil ? weather.current.conditionTa : weather.current.conditionEn}
                </Text>
                <Text style={styles.heroFeelsLike}>
                  {isTamil
                    ? `உணரப்படுவது: ${weather.current.apparentTemperature}°C`
                    : `Feels like ${weather.current.apparentTemperature}°C`}
                </Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="water-percent" size={20} color="#C8E6C9" />
                <Text style={styles.metricLabel}>{isTamil ? 'ஈரப்பதம்' : 'Humidity'}</Text>
                <Text style={styles.metricVal}>{weather.current.humidity}%</Text>
              </View>

              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="weather-windy" size={20} color="#C8E6C9" />
                <Text style={styles.metricLabel}>{isTamil ? 'காற்று' : 'Wind'}</Text>
                <Text style={styles.metricVal}>{weather.current.windSpeed} km/h</Text>
              </View>

              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="umbrella" size={20} color="#C8E6C9" />
                <Text style={styles.metricLabel}>{isTamil ? 'மழை வாய்ப்பு' : 'Rain Prob.'}</Text>
                <Text style={styles.metricVal}>{weather.current.rainProbability}%</Text>
              </View>
            </View>
          </View>

          {/* Agricultural Advisories */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="alert-decagram" size={20} color="#E65100" />
            <Text style={styles.sectionTitle}>
              {isTamil ? 'வேளாண் வானிலை வழிகாட்டுதல்' : 'Agricultural Weather Advisories'}
            </Text>
          </View>

          {weather.advisories && weather.advisories.length > 0 ? (
            weather.advisories.map((adv, idx) => (
              <View key={idx} style={styles.advisoryCard}>
                <View style={styles.advisoryHeader}>
                  <MaterialCommunityIcons
                    name={(adv.icon as any) || 'information'}
                    size={22}
                    color={adv.severity === 'High' ? '#C62828' : adv.severity === 'Medium' ? '#EF6C00' : '#2E7D32'}
                  />
                  <Text style={styles.advisoryTitle}>
                    {isTamil ? adv.titleTa : adv.titleEn}
                  </Text>
                </View>
                <Text style={styles.advisoryDetail}>
                  {isTamil ? adv.detailTa : adv.detailEn}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.advisoryCard}>
              <Text style={styles.advisoryDetail}>
                {isTamil ? 'தற்போது தீவிர வானிலை எச்சரிக்கைகள் இல்லை.' : 'No severe agricultural alerts currently active.'}
              </Text>
            </View>
          )}

          {/* 7-Day Forecast */}
          <View style={[styles.sectionHeaderRow, { marginTop: Spacing.md }]}>
            <MaterialCommunityIcons name="calendar-week" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {isTamil ? '7 நாள் முன்னறிவிப்பு' : '7-Day Agronomic Forecast'}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
            {weather.forecast.map((day, idx) => (
              <View key={idx} style={styles.forecastCard}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <MaterialCommunityIcons
                  name={(day.icon as any) || 'weather-partly-cloudy'}
                  size={28}
                  color={Colors.primary}
                />
                <Text style={styles.forecastTemp}>{day.maxTemp}° / {day.minTemp}°</Text>
                <View style={styles.rainBadge}>
                  <MaterialCommunityIcons name="water" size={12} color="#0288D1" />
                  <Text style={styles.rainBadgeText}>{day.rainProbability}%</Text>
                </View>
                <Text style={styles.forecastCondition} numberOfLines={1}>
                  {isTamil ? day.conditionTa : day.conditionEn}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Data Transparency Notice */}
          <View style={styles.transparencyBox}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color="#455A64" />
            <Text style={styles.transparencyText}>
              Real-time atmospheric modeling by Open-Meteo. Observations update every hour.
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gpsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  districtSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  districtChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  districtChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  loadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  heroCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLocation: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  heroSource: {
    fontSize: 11,
    color: '#C8E6C9',
    marginTop: 2,
  },
  heroTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 16,
  },
  heroTemp: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.white,
  },
  heroConditionCol: {
    flex: 1,
  },
  heroCondition: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  heroFeelsLike: {
    fontSize: 12,
    color: '#C8E6C9',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#C8E6C9',
    marginTop: 4,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  advisoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  advisoryDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginLeft: 30,
  },
  forecastScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  forecastCard: {
    width: 96,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.sm + 2,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  forecastDay: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  rainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  rainBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0288D1',
  },
  forecastCondition: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  transparencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECEFF1',
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  transparencyText: {
    fontSize: 11,
    color: '#455A64',
    flex: 1,
  },
});
