import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getBookings as dbGetBookings,
  insertBooking as dbInsertBooking,
  updateBooking as dbUpdateBooking,
  deleteBooking as dbDeleteBooking,
} from '../services/db';

const BookingContext = createContext();
const BOOKINGS_KEY = '@nook_bookings_v1';

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Lab 05: load from SQLite on mount. One-time migration copies any
  // legacy AsyncStorage bookings into SQLite so nothing is lost.
  useEffect(() => {
    (async () => {
      try {
        try {
          const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const existing = dbGetBookings();
              if (existing.length === 0) {
                for (const b of parsed) {
                  if (!b || typeof b !== 'object') continue;
                  dbInsertBooking({
                    cafe_id: b.cafe_id ?? b.cafeId ?? 0,
                    cafe_name: b.cafe_name ?? b.cafeName ?? 'Cafe',
                    date: b.date ?? b.dateLabel ?? 'Thu, 24 Oct',
                    time_slot: b.time_slot ?? b.timeLabel ?? '10:00 AM',
                    guests: b.guests ?? 1,
                    seating: b.seating ?? b.seatingLabel ?? 'Indoor',
                    status: b.status === 'Confirmed' ? 'active' : b.status ?? 'active',
                    cafe_image: b.cafe_image ?? b.cafeImage ?? '',
                    date_label: b.date_label ?? b.dateLabel ?? b.date ?? '',
                    time_label: b.time_label ?? b.timeLabel ?? b.time_slot ?? '',
                    seating_label: b.seating_label ?? b.seatingLabel ?? b.seating ?? '',
                  });
                }
              }
              await AsyncStorage.removeItem(BOOKINGS_KEY).catch(() => {});
            }
          }
        } catch {
          // Corrupted legacy storage — fall through to SQLite.
        }
        const rows = dbGetBookings();
        setBookings(Array.isArray(rows) ? rows.filter((b) => b && typeof b === 'object') : []);
      } catch {
        setBookings([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const refresh = useCallback(() => {
    try {
      const rows = dbGetBookings();
      setBookings(Array.isArray(rows) ? rows.filter((b) => b && typeof b === 'object') : []);
    } catch {
      // Read failed — keep in-memory copy so the screen never crashes.
    }
  }, []);

  const addBooking = useCallback(
    (booking) => {
      const safe = booking && typeof booking === 'object' ? booking : {};
      try {
        const rowId = dbInsertBooking({
          cafe_id: safe.cafe_id ?? safe.cafeId ?? 0,
          cafe_name: safe.cafe_name ?? safe.cafeName ?? 'Cafe',
          date: safe.date ?? safe.dateLabel ?? 'Thu, 24 Oct',
          time_slot: safe.time_slot ?? safe.timeLabel ?? '10:00 AM',
          guests: safe.guests ?? 1,
          seating: safe.seating ?? safe.seatingLabel ?? 'Indoor',
          status: safe.status === 'Confirmed' ? 'active' : safe.status ?? 'active',
          cafe_image: safe.cafe_image ?? safe.cafeImage ?? '',
          date_label: safe.date_label ?? safe.dateLabel ?? safe.date ?? '',
          time_label: safe.time_label ?? safe.timeLabel ?? safe.time_slot ?? '',
          seating_label: safe.seating_label ?? safe.seatingLabel ?? safe.seating ?? '',
        });
        refresh();
        if (rowId != null) {
          const created = dbGetBookings().find((b) => String(b?._rowId ?? b?.id) === String(rowId));
          if (created) return created;
          return { ...safe, id: String(rowId) };
        }
      } catch {
        // DB write failed — fall back to in-memory so UI keeps working.
      }
      const fallback = {
        ...safe,
        id: typeof safe.id === 'string' && safe.id.length > 0 ? safe.id : Date.now().toString(),
      };
      setBookings((prev) => [fallback, ...prev]);
      return fallback;
    },
    [refresh],
  );

  // Lab 05 Update: reschedule an existing booking (date + time slot).
  const rescheduleBooking = useCallback(
    (id, date, timeSlot) => {
      try {
        const ok = dbUpdateBooking(id, { date, dateLabel: date, time_slot: timeSlot, timeLabel: timeSlot });
        if (ok) refresh();
        return ok;
      } catch {
        return false;
      }
    },
    [refresh],
  );

  // Lab 05 Delete: confirm, then remove the booking row.
  const cancelBooking = useCallback(
    (id) => {
      Alert.alert('Cancel booking?', 'This will remove the booking from your list.', [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => {
            try {
              dbDeleteBooking(id);
            } catch {
              // fall through to in-memory removal
            }
            setBookings((prev) => prev.filter((b) => String(b?.id) !== String(id) && String(b?._rowId) !== String(id)));
            refresh();
          },
        },
      ]);
    },
    [refresh],
  );

  const removeBooking = useCallback(
    (id) => {
      try {
        dbDeleteBooking(id);
      } catch {
        // fall through to in-memory removal
      }
      setBookings((prev) => prev.filter((b) => String(b?.id) !== String(id) && String(b?._rowId) !== String(id)));
      refresh();
    },
    [refresh],
  );

  return (
    <BookingContext.Provider
      value={{ bookings, addBooking, removeBooking, cancelBooking, rescheduleBooking, refresh, loaded }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
