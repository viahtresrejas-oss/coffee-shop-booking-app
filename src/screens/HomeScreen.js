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
  Sun,
  Wifi,
  Zap,
  Coffee,
  Compass,
  Calendar,
  User,
} from 'lucide-react-native';
import { useProfile } from '../contexts/ProfileContext';
import { getCafes } from '../services/db';

export default function HomeScreen({ navigation }) {
  const { profile } = useProfile();
  // FIX (deep-scan): `profile` can be null before AsyncStorage loads;
  // `profile.photo` would throw. Same for a broken remote image.
  const avatarUri =
    typeof profile?.photo === 'string' && profile.photo.length > 0 ? profile.photo : null;

  // Lab 05: cafes come from SQLite (offline-first). Same card design.
  // Read helpers are plain functions so the first read can happen in a lazy
  // useState initializer (App.js guarantees initDatabase() ran already) —
  // no setState directly inside an effect.
  const readLists = (q) => {
    try {
      const rows = getCafes(q, 'All');
      return { featured: rows.slice(0, 5), nearby: rows.slice(0, 5) };
    } catch {
      return { featured: [], nearby: [] };
    }
  };

  const [query, setQuery] = useState('');
  const [lists, setLists] = useState(() => readLists(''));
  const featured = lists.featured;
  const nearby = lists.nearby;

  const load = useCallback((q) => setLists(readLists(q)), []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 250);
    return () => clearTimeout(t);
  }, [query, load]);

  const openCafe = (cafe) => {
    navigation?.navigate('CafeDetailsScreen', { cafeId: cafe?.id, cafeName: cafe?.name });
  };

  const renderFeatured = ({ item }) => (
    <TouchableOpacity style={styles.featuredCard} onPress={() => openCafe(item)}>
      <View style={styles.imgContainer}>
        {item?.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: '#E5E7EB' }]} />
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {String(item?.rating ?? '–')}</Text>
        </View>
      </View>

      <View style={styles.quietTag}>
        <Text style={styles.tagText}>{item?.category ?? 'Cafe'}</Text>
      </View>

      <Text style={styles.cafeName}>{item?.name ?? 'Cafe'}</Text>
      <Text style={styles.cafeSub}>{item?.location ?? ''}</Text>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.slotLabel}>Seats</Text>
          <Text style={styles.slotTime}>{String(item?.seats_available ?? '–')} free</Text>
        </View>
        <TouchableOpacity style={styles.reserveBtn} onPress={() => openCafe(item)}>
          <Text style={styles.reserveBtnText}>Reserve &gt;</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderNearby = ({ item }) => (
    <TouchableOpacity style={styles.nearbyRow} onPress={() => openCafe(item)}>
      {item?.image ? (
        <Image source={{ uri: item.image }} style={styles.nearbyImg} />
      ) : (
        <View style={[styles.nearbyImg, { backgroundColor: '#E5E7EB' }]} />
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.nearbyName}>{item?.name ?? 'Cafe'}</Text>
        <Text style={styles.nearbyDist}>{item?.location ?? ''}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{item?.category ?? ''}</Text>
        </View>
      </View>
      <Text style={styles.starText}>★ {String(item?.rating ?? '–')}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Maya ☕</Text>
            <Text style={styles.subGreeting}>Find a table nearby</Text>
          </View>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {String(profile?.name ?? 'M').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search cafes, seating, amenities..."
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

        {/* Filters Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity style={[styles.pill, styles.activePill]}>
            <Sun size={14} color="#FFF" />
            <Text style={styles.activePillText}>Outdoor Patio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill}>
            <Wifi size={14} color="#4B5563" />
            <Text style={styles.pillText}>Fast Wi-Fi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill}>
            <Zap size={14} color="#4B5563" />
            <Text style={styles.pillText}>Outlets Near</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Cafes</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('ExploreScreen')}>
            <Text style={styles.seeAll}>See all &gt;</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featured}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          renderItem={renderFeatured}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          ListEmptyComponent={<Text style={styles.cafeSub}>No cafes found.</Text>}
        />

        {/* Nearby Cafes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Cafes</Text>
          <Text style={styles.subTitle}>{nearby.length} spots within 2 miles</Text>
        </View>

        <View style={styles.listContainer}>
          {nearby.length === 0 ? (
            <Text style={styles.cafeSub}>No cafes found.</Text>
          ) : (
            nearby.map((item) => <View key={String(item?.id ?? item?.name)}>{renderNearby({ item })}</View>)
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Coffee size={20} color="#006689" />
          <Text style={[styles.navText, { color: '#006689', fontWeight: '700' }]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation?.navigate('ExploreScreen')}
        >
          <Compass size={20} color="#9CA3AF" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation?.navigate('MyBookingsScreen')}
        >
          <Calendar size={20} color="#9CA3AF" />
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation?.navigate('ProfileScreen')}
        >
          <User size={20} color="#9CA3AF" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F6' },
  scrollContent: { padding: 16, paddingBottom: 90 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subGreeting: { fontSize: 12, color: '#6B7280' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E5E7EB' },
  avatarFallback: {
    backgroundColor: '#006689',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
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
  searchInput: { flex: 1, fontSize: 13, marginLeft: 8, color: '#111827' },
  filterBtn: {
    backgroundColor: '#E0F2FE',
    padding: 6,
    borderRadius: 16,
  },
  filterScroll: { marginBottom: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  activePill: { backgroundColor: '#006689', borderColor: '#006689' },
  pillText: { fontSize: 12, color: '#374151', marginLeft: 6, fontWeight: '500' },
  activePillText: { fontSize: 12, color: '#FFF', marginLeft: 6, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 12, color: '#006689', fontWeight: '600' },
  subTitle: { fontSize: 11, color: '#6B7280' },
  featuredCard: {
    width: 240,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imgContainer: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  cardImage: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#111827' },
  quietTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#78350F' },
  cafeName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cafeSub: { fontSize: 11, color: '#6B7280', marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  slotLabel: { fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase' },
  slotTime: { fontSize: 12, fontWeight: '700', color: '#111827' },
  reserveBtn: {
    backgroundColor: '#006689',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reserveBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  listContainer: { gap: 10 },
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nearbyImg: { width: 54, height: 54, borderRadius: 14 },
  nearbyName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  nearbyDist: { fontSize: 10, color: '#6B7280' },
  statusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: { fontSize: 9, color: '#78350F', fontWeight: '600' },
  starText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, color: '#9CA3AF', marginTop: 3 },
});
