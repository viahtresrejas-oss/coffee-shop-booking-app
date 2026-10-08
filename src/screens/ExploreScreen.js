import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  SlidersHorizontal,
  Coffee,
  Compass,
  Calendar,
  User,
} from 'lucide-react-native';
import { getCafes } from '../services/db';

const CATEGORIES = ['All', 'Espresso Bar', 'Brunch Spot', 'Quiet Workspace', 'Late Night', 'Pet Friendly'];

export default function ExploreScreen({ navigation }) {
  // Lab 05: list + LIKE search + category filter all come from SQLite.
  // Plain read helper + lazy initializer so no setState runs synchronously
  // inside an effect (react-hooks/set-state-in-effect).
  const readCafes = (q, cat) => {
    try {
      return getCafes(q, cat);
    } catch {
      return [];
    }
  };

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [cafes, setCafes] = useState(() => readCafes('', 'All'));

  const load = useCallback((q, cat) => setCafes(readCafes(q, cat)), []);

  useEffect(() => {
    const t = setTimeout(() => load(query, category), 250);
    return () => clearTimeout(t);
  }, [query, category, load]);

  const openBook = (cafe) => {
    navigation?.navigate('BookTableScreen', { cafeId: cafe?.id, cafeName: cafe?.name });
  };

  const renderCafe = ({ item: cafe }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {cafe?.image ? (
          <Image source={{ uri: cafe.image }} style={styles.cardImg} />
        ) : (
          <View style={[styles.cardImg, { backgroundColor: '#E5E7EB' }]} />
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {String(cafe?.rating ?? '–')}</Text>
        </View>
        <View style={styles.locationTag}>
          <Text style={styles.locationText}>{cafe?.location ?? ''}</Text>
        </View>
      </View>

      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.cafeTitle}>{cafe?.name ?? 'Cafe'}</Text>
          <Text style={styles.cafeSub}>
            {cafe?.price ?? ''} {cafe?.price ? '•' : ''} {cafe?.category ?? ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => openBook(cafe)}>
          <Text style={styles.bookBtnText}>Book</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagRow}>
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>{cafe?.category ?? 'Cafe'}</Text>
        </View>
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>{`${cafe?.seats_available ?? 0} seats`}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={styles.pageTitle}>Explore</Text>

        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search specialty coffee, vibes, desks"
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={16} color="#006689" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.tagPill, active && { backgroundColor: '#006689' }, { marginRight: 6 }]}
              >
                <Text style={[styles.tagPillText, active && { color: '#FFF' }]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Free tables banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>● {cafes.length} artisan tables free nearby</Text>
          <TouchableOpacity>
            <Text style={styles.mapLink}>Map view →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cafe Cards from SQLite */}
      <FlatList
        data={cafes}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={renderCafe}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.cafeSub}>No cafes match your search.</Text>}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation?.navigate('HomeScreen')}>
          <Coffee size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.activeNavItem}>
          <Compass size={20} color="#006689" />
          <Text style={styles.activeNavText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate('MyBookingsScreen')}>
          <Calendar size={20} color="#9CA3AF" />
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
  scrollContent: { padding: 16, paddingBottom: 80 },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#111827',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 12, marginLeft: 8 },
  filterBtn: { backgroundColor: '#E0F2FE', padding: 6, borderRadius: 16 },
  banner: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerText: { fontSize: 11, fontWeight: '700', color: '#78350F' },
  mapLink: { fontSize: 11, fontWeight: '700', color: '#006689' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  cardImageContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  cardImg: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { fontSize: 10, fontWeight: '700' },
  locationTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  locationText: { fontSize: 10, color: '#FFF', fontWeight: '500' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cafeTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  cafeSub: { fontSize: 11, color: '#6B7280' },
  bookBtn: {
    backgroundColor: '#006689',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  tagRow: { flexDirection: 'row', marginTop: 10, gap: 6 },
  tagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPillText: { fontSize: 10, color: '#4B5563', fontWeight: '500' },
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
