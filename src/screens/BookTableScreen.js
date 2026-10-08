import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Coffee, Plus, Minus } from 'lucide-react-native';
import { useBookings } from '../contexts/BookingContext';
import { getCafeById } from '../services/db';

export default function BookTableScreen({ navigation, route }) {
  const { addBooking } = useBookings();
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState('10:00 AM');

  // Lab 05: the selected cafe comes from SQLite (passed via route params).
  const cafeId = route?.params?.cafeId;
  const cafe = useMemo(() => {
    try {
      return getCafeById(cafeId);
    } catch {
      return null;
    }
  }, [cafeId]);

  const cafeName = cafe?.name ?? route?.params?.cafeName ?? 'The Daily Grind & Co.';
  const cafeImage = cafe?.image ?? route?.params?.cafeImage ?? '';
  const resolvedCafeId = cafe?.id ?? (Number.isFinite(Number(cafeId)) ? Number(cafeId) : 0);

  const confirm = () => {
    addBooking({
      cafeId: resolvedCafeId,
      cafeName,
      cafeImage,
      dateLabel: 'Thu, 24 Oct',
      dateNum: '24',
      dateMonth: 'OCT',
      timeLabel: time,
      guests,
      seatingLabel: 'Indoor',
      status: 'Confirmed',
    });
    navigation?.replace('MyBookingsScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <TouchableOpacity style={{ marginBottom: 12 }} onPress={() => navigation?.goBack()}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Reserve Table</Text>

        {/* Cafe summary pill */}
        <View style={styles.cafePill}>
          <Coffee size={18} color="#78350F" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.cafePillTitle}>{cafeName}</Text>
            <Text style={styles.cafePillSub}>
              {cafe?.category ? `${cafe.category} • ` : ''}Table for study or work • Power & Wi-Fi
            </Text>
          </View>
        </View>

        {/* Guest Counter */}
        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Number of Guests</Text>
            <Text style={styles.cardSub}>Spacious bench & single desks</Text>
          </View>
          <View style={styles.counterBox}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setGuests(Math.max(1, guests - 1))}
            >
              <Minus size={14} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.counterText}>{guests} Guests</Text>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: '#006689' }]}
              onPress={() => setGuests(guests + 1)}
            >
              <Plus size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time slots */}
        <Text style={styles.sectionHeader}>Select Time Slot</Text>
        <View style={styles.timeGrid}>
          {['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'].map((t, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.timeSlot, time === t && styles.activeTimeSlot]}
              onPress={() => setTime(t)}
            >
              <Text style={[styles.timeSlotText, time === t && styles.activeTimeText]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Requests */}
        <Text style={styles.sectionHeader}>Special Requests</Text>
        <TextInput
          placeholder="e.g., Near power outlet, quiet corner..."
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerBar}>
        <View>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>Reservation</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>
            Thu, {time}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={confirm}
        >
          <Text style={styles.confirmBtnText}>Confirm Booking →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F6' },
  screenTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 16 },
  cafePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  cafePillTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  cafePillSub: { fontSize: 10, color: '#6B7280' },
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 10, color: '#6B7280' },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 4,
    borderRadius: 12,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: { fontSize: 11, fontWeight: '700', marginHorizontal: 8 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeSlot: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeTimeSlot: { backgroundColor: '#006689', borderColor: '#006689' },
  timeSlotText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  activeTimeText: { color: '#FFF' },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 12,
  },
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
  confirmBtn: {
    backgroundColor: '#006689',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  confirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
