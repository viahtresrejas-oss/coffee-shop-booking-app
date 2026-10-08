import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
// FIX (deep-scan): `src/theme.js` (file) and `src/theme/` (directory) both
// exist, so `from '../theme'` is ambiguous for Metro and can resolve to the
// wrong module. Import the file explicitly.
import { F, colors } from '../theme.js';

export default function CafeCard({ cafe, onPress }) {
  // FIX (deep-scan): CafeCard is currently unused, but guard it anyway —
  // `cafe.image` / `cafe.rating` undefined would crash it the moment it is
  // wired into Explore/Home.
  const safe = cafe ?? {};
  const imgUri = typeof safe.image === 'string' && safe.image.length > 0 ? safe.image : null;
  return (
    <Pressable
      style={({ pressed }) => [cafeCardStyle.card, pressed && { opacity: 0.92 }]}
      onPress={onPress}
    >
      {imgUri ? (
        <Image source={{ uri: imgUri }} style={cafeCardStyle.image} />
      ) : (
        <View style={[cafeCardStyle.image, cafeCardStyle.imageFallback]} />
      )}
      <View style={cafeCardStyle.body}>
        <View style={cafeCardStyle.row}>
          <Text style={cafeCardStyle.name} numberOfLines={1}>
            {safe.name ?? 'Cafe'}
          </Text>
          <View style={cafeCardStyle.ratingPill}>
            <Text style={cafeCardStyle.star}>★</Text>
            <Text style={cafeCardStyle.ratingText}>{safe.rating ?? '–'}</Text>
          </View>
        </View>
        <Text style={cafeCardStyle.meta}>
          {safe.distance ?? ''}{safe.distance && safe.neighborhood ? ' · ' : ''}{safe.neighborhood ?? ''}
        </Text>
        <View style={cafeCardStyle.footerRow}>
          <View style={cafeCardStyle.categoryPill}>
            <Text style={cafeCardStyle.categoryText}>{safe.category ?? 'Cafe'}</Text>
          </View>
          <Text style={cafeCardStyle.price}>{safe.price ?? ''}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const cafeCardStyle = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  imageFallback: { backgroundColor: '#E5E7EB' },
  body: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: F.displaySemi,
    color: colors.espresso,
    marginRight: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.peach,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  star: {
    fontSize: 11,
    color: colors.caramel,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: colors.espresso,
  },
  meta: {
    fontSize: 12,
    fontFamily: F.body,
    color: colors.muted,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryPill: {
    backgroundColor: colors.skyBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: F.bodyMed,
    color: colors.ocean,
  },
  price: {
    fontSize: 13,
    fontFamily: F.bodyBold,
    color: colors.espresso,
  },
});
