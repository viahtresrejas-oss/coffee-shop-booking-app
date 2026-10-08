import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coffee, Compass, Calendar, User, QrCode } from 'lucide-react-native';
import { useBookings } from '../contexts/BookingContext';

const RESCHEDULE_SLOTS = ['10:30 AM', '11:00 AM', '11:30 AM'];

export default function MyBookingsScreen({ navigation }) {
  const { bookings, cancelBooking, rescheduleBooking } = useBookings();

  // Split active vs past using the booking status stored in SQLite.
  const { active, past } = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    const isActive = (b) => {
      const s = String(b?.status ?? 'active').toLowerCase();
      return s === 'active' || s === 'confirmed';
    };
    return { active: list.filter(isActive), past: list.filter((b) => !isActive(b)) };
  }, [bookings]);

  const onReschedule = (b) => {
    const buttons = RESCHEDULE_SLOTS.map((slot) => ({
      text: slot,
      onPress: () => rescheduleBooking(b?.id ?? b?._rowId, b?.dateLabel ?? b?.date, slot),
    }));
    buttons.push({ text: 'Keep current time', style: 'cancel' });
    Alert.alert('Reschedule booking', 'Pick a new time slot:', buttons);
  };

  const onCancel = (b) => {
    cancelBooking(b?.id ?? b?._rowId);
  };

  const renderCard = (b, isActive) => {
    // FIX (deep-scan): corrupted / legacy bookings may miss `id`;
    // `b.id.slice` would throw and white-screen the whole list.
    const code = String(b?.id ?? '000000').slice(-6).toUpperCase();
    return (
      <View key={String(b?.id ?? code)} style={styles.passCard}>
        <View style={styles.passHeader}>
          <Text style={isActive ? styles.activeLabel : styles.pastLabel}>
            {isActive ? '● ACTIVE RESERVATION' : '● PAST / CANCELLED'}
          </Text>
          <View style={[styles.bookedPill, !isActive && { backgroundColor: '#9CA3AF' }]}>
            <Text style={styles.bookedText}>{isActive ? '✓ Booked' : '✕ Ended'}</Text>
          </View>
        </View>

        <Text style={styles.cafeName}>{b?.cafeName ?? 'Cafe'}</Text>
        <Text style={styles.cafeSub}>
          {b?.dateLabel ?? ''} • {b?.timeLabel ?? ''} • {b?.guests ?? 1}{' '}
          {b?.guests === 1 ? 'guest' : 'guests'} • {b?.seatingLabel ?? ''}
        </Text>

        {/* QR Code Container */}
        <View style={styles.qrBox}>
          <QrCode size={90} color="#006689" />
          <Text style={styles.codeText}>Booking Code: {code}</Text>
        </View>

        {isActive ? (
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.rescheduleBtn} onPress={() => onReschedule(b)}>
              <Text style={styles.rescheduleText}>🗓 Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(b)}>
              <Text style={styles.cancelText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <Text style={styles.pageTitle}>Bookings</Text>

        <View style={styles.headerPill}>
          <Text style={styles.headerTitle}>Your Coffee Passes</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{active.length} Active</Text>
          </View>
        </View>

        {active.length === 0 && past.length === 0 ? (
          <View style={styles.passCard}>
            <Text style={styles.cafeName}>No bookings yet</Text>
            <Text style={styles.cafeSub}>
              Reserve a table from Home or Explore and your pass will appear here.
            </Text>
            <TouchableOpacity
              style={styles.rescheduleBtn}
              onPress={() => navigation?.navigate('ExploreScreen')}
            >
              <Text style={styles.rescheduleText}>Explore cafes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {active.map((b) => renderCard(b, true))}
            {past.length > 0 ? <Text style={styles.sectionTitle}>Past bookings</Text> : null}
            {past.map((b) => renderCard(b, false))}
          </>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation?.navigate('HomeScreen')}>
          <Coffee size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate('ExploreScreen')}>
          <Compass size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.activeNavItem}>
          <Calendar size={20} color="#006689" />
          <Text style={styles.activeNavText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate('ProfileScreen')}>
          <User size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F6' },
  pageTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  headerPill: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#78350F' },
  passCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  activeLabel: { fontSize: 10, fontWeight: '700', color: '#006689' },
  pastLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginTop: 8, marginBottom: 10 },
  bookedPill: { backgroundColor: '#006689', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  bookedText: { fontSize: 10, color: '#FFF', fontWeight: '700' },
  cafeName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cafeSub: { fontSize: 11, color: '#6B7280', marginBottom: 16 },
  qrBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: { fontSize: 11, fontWeight: '800', color: '#006689', marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 8 },
  rescheduleBtn: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  rescheduleText: { color: '#006689', fontWeight: '700', fontSize: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFE4E6',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelText: { color: '#E11D48', fontWeight: '700', fontSize: 12 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  activeNavItem: { alignItems: 'center' },
  activeNavText: { fontSize: 10, color: '#006689', fontWeight: '700' },
});
