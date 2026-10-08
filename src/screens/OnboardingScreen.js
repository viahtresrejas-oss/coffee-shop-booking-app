import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coffee, ArrowRight, Wifi, ShieldCheck } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Coffee size={22} color="#006689" />
          <Text style={styles.logoText}>nook</Text>
        </View>
        <TouchableOpacity onPress={() => navigation?.navigate('HomeScreen')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Center Graphic Card */}
      <View style={styles.cardWrapper}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
          }}
          style={styles.heroImage}
        />
        <View style={styles.liveBadge}>
          <View style={styles.tealDot} />
          <Text style={styles.liveText}>Live Seating</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.wifiIconBg}>
            <Wifi size={18} color="#78350F" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>High-Speed Work Nooks</Text>
            <Text style={styles.infoSub}>Guaranteed power & quiet zones</Text>
          </View>
          <ShieldCheck size={18} color="#006689" />
        </View>
      </View>

      {/* Text Info */}
      <View style={styles.contentSection}>
        <View style={styles.artisanBadge}>
          <Text style={styles.artisanText}>★ Artisan Coffee Spaces</Text>
        </View>

        <Text style={styles.titleText}>
          Find & Reserve Your Ideal Work or Sip Spot
        </Text>
        <Text style={styles.descriptionText}>
          Skip the wait and guarantee your favorite nook with high-speed Wi-Fi
          and artisan roasts.
        </Text>

        {/* Indicator Dots */}
        <View style={styles.dotRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation?.navigate('HomeScreen')}
        >
          <Text style={styles.ctaText}>Get Started</Text>
          <ArrowRight size={18} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.featuresRow}>
          <Text style={styles.featureItem}>⚡ Instant booking</Text>
          <Text style={styles.featureItem}>•</Text>
          <Text style={styles.featureItem}>🪑 Curated seating</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F6',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#006689',
    marginLeft: 6,
  },
  skipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  cardWrapper: {
    height: 320,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  heroImage: { width: '100%', height: '100%' },
  liveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#006689',
    marginRight: 6,
  },
  liveText: { fontSize: 11, fontWeight: '700', color: '#006689' },
  infoCard: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wifiIconBg: {
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    marginRight: 10,
  },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  infoSub: { fontSize: 10, color: '#6B7280' },
  contentSection: { alignItems: 'center' },
  artisanBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  artisanText: { fontSize: 11, fontWeight: '700', color: '#78350F' },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  },
  descriptionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  dotRow: { flexDirection: 'row', marginTop: 16 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  activeDot: { width: 22, backgroundColor: '#006689' },
  bottomSection: { marginBottom: 20 },
  ctaButton: {
    backgroundColor: '#006689',
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  featureItem: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
});
