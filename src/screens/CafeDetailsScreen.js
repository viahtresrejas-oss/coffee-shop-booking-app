import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2, MapPin, Wifi, Zap, Volume2, Wind } from 'lucide-react-native';
import { getCafeById } from '../services/db';

export default function CafeDetailsScreen({ navigation, route }) {
  // Lab 05: resolve the cafe from SQLite using the id passed by Home/Explore.
  const cafeId = route?.params?.cafeId;
  const cafe = useMemo(() => {
    try {
      return getCafeById(cafeId);
    } catch {
      return null;
    }
  }, [cafeId]);

  const heroUri = cafe?.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800';
  const title = cafe?.name ?? route?.params?.cafeName ?? 'The Daily Grind & Co.';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.heroWrapper}>
          <Image
            source={{
              uri: heroUri,
            }}
            style={styles.heroImg}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <ArrowLeft size={18} color="#111827" />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconCircle}>
              <Heart size={18} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Share2 size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bodyContent}>
          <Text style={styles.tagline}>{String(cafe?.category ?? 'ARTISANAL ROASTERY & BAKERY').toUpperCase()}</Text>
          <Text style={styles.cafeTitle}>{title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingTag}>
              <Text style={styles.ratingText}>★ {cafe?.rating ?? '–'}</Text>
            </View>
            <Text style={styles.timeText}>🕒 Open until 9 PM</Text>
          </View>

          <View style={styles.addressBox}>
            <MapPin size={16} color="#006689" />
            <Text style={styles.addressText}>{cafe?.location ?? '142 Elmwood Ave, Downtown'}</Text>
            <Text style={styles.distText}>{cafe?.seats_available ?? 0} seats</Text>
          </View>

          <Text style={styles.sectionHeader}>Amenities & Atmosphere</Text>
          <View style={styles.grid}>
            <View style={styles.gridBox}>
              <Wifi size={18} color="#006689" />
              <Text style={styles.gridLabel}>Wi-Fi Speed</Text>
              <Text style={styles.gridVal}>250 Mbps</Text>
            </View>
            <View style={styles.gridBox}>
              <Zap size={18} color="#006689" />
              <Text style={styles.gridLabel}>Outlets</Text>
              <Text style={styles.gridVal}>Every Table</Text>
            </View>
            <View style={styles.gridBox}>
              <Volume2 size={18} color="#006689" />
              <Text style={styles.gridLabel}>Noise Level</Text>
              <Text style={styles.gridVal}>Quiet Study</Text>
            </View>
            <View style={styles.gridBox}>
              <Wind size={18} color="#006689" />
              <Text style={styles.gridLabel}>Climate</Text>
              <Text style={styles.gridVal}>Cool & Airy</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.feeLabel}>Workspace & Table</Text>
          <Text style={styles.feeAmount}>$0 <Text style={styles.feeSub}>Booking Fee</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() =>
            navigation?.navigate('BookTableScreen', {
              cafeId: cafe?.id ?? cafeId,
              cafeName: title,
              cafeImage: heroUri,
            })
          }
        >
          <Text style={styles.bookBtnText}>Book a Table →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F6' },
  heroWrapper: { height: 260, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  topActions: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', gap: 8 },
  iconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  bodyContent: {
    backgroundColor: '#FFF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 20,
  },
  tagline: { fontSize: 10, fontWeight: '800', color: '#78350F', letterSpacing: 1 },
  cafeTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginVertical: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  ratingTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#78350F' },
  timeText: { fontSize: 12, color: '#006689', fontWeight: '600' },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  addressText: { flex: 1, fontSize: 12, color: '#111827', marginLeft: 6, fontWeight: '500' },
  distText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridBox: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  gridVal: { fontSize: 12, fontWeight: '700', color: '#111827' },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  feeLabel: { fontSize: 10, color: '#6B7280' },
  feeAmount: { fontSize: 18, fontWeight: '800', color: '#111827' },
  feeSub: { fontSize: 12, color: '#006689' },
  bookBtn: {
    backgroundColor: '#006689',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bookBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
