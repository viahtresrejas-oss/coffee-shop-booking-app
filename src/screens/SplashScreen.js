import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Coffee, ArrowRight } from 'lucide-react-native';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['#10739E', '#085078', '#053C5B']}
          style={styles.gradient}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.statusPill}>
              <View style={styles.amberDot} />
              <Text style={styles.statusText}>TABLE BOOKING ACTIVE</Text>
            </View>
            <View style={styles.iconCircle}>
              <Coffee size={20} color="#FFF" />
            </View>
          </View>

          {/* Center Content */}
          <View style={styles.centerArea}>
            <View style={styles.glowRing}>
              <View style={styles.whiteCircle}>
                <Coffee size={46} color="#085078" strokeWidth={2.2} />
              </View>
            </View>
            <Text style={styles.title}>Coffee Shop</Text>
            <Text style={styles.subtitle}>Reserve your perfect cup</Text>
            <View style={styles.badgePill}>
              <Text style={styles.star}>✪</Text>
              <Text style={styles.badgeText}>
                Single-origin beans & curated tables
              </Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={styles.getStartedBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('OnboardingScreen')}
            >
              <Text style={styles.btnText}>Get Started</Text>
              <ArrowRight size={18} color="#085078" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => navigation?.navigate('ExploreScreen')}
            >
              <Text style={styles.skipText}>Skip directly to Explore ›</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    maxHeight: 780,
    borderRadius: 36,
    overflow: 'hidden',
    elevation: 8,
  },
  gradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerArea: { alignItems: 'center', width: '100%' },
  glowRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  whiteCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FFF9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  star: { color: '#FFF', marginRight: 6 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  bottomArea: { width: '100%', alignItems: 'center' },
  getStartedBtn: {
    width: '100%',
    backgroundColor: '#FFF9F6',
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#085078',
    marginRight: 8,
  },
  skipBtn: { paddingVertical: 6 },
  skipText: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 13 },
});
