import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
// FIX (deep-scan): `src/theme.js` (file) and `src/theme/` (directory) both
// exist, so `from '../theme'` is ambiguous for Metro and can resolve to the
// wrong module. Import the file explicitly.
import { photo, F, colors } from '../theme.js';

export default function AppHeader({ title, onBack, showAvatar, navigation, avatar }) {
  const goProfile = () => {
    // FIX (deep-scan): routes are *Screen names (see AppNavigator.js).
    // 'Profile' / 'Bookings' do not exist and would throw
    // "no such route". Use optional chaining so header never crashes
    // when rendered without a navigation prop (e.g. in tests).
    navigation?.navigate?.('ProfileScreen');
  };
  const goBookings = () => {
    navigation?.navigate?.('MyBookingsScreen');
  };
  return (
    <View style={appHeader.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={appHeader.backBtn} hitSlop={8}>
          <Text style={appHeader.backIcon}>←</Text>
        </Pressable>
      ) : (
        <Pressable onPress={goProfile} style={appHeader.backBtn} hitSlop={8}>
          <Image
            source={{ uri: avatar || photo('photo-1507003211169-0a1dd7228f2d', 200) }}
            style={appHeader.avatar}
          />
        </Pressable>
      )}

      <Text style={appHeader.title} numberOfLines={1}>
        {title ?? ''}
      </Text>

      {showAvatar && avatar ? (
        <Pressable onPress={goProfile} hitSlop={8}>
          <Image source={{ uri: avatar }} style={appHeader.avatarRight} />
        </Pressable>
      ) : onBack ? (
        <View style={appHeader.spacer} />
      ) : (
        <Pressable style={appHeader.actionBtn} onPress={goBookings} hitSlop={8}>
          <Text style={appHeader.headerAction}>🎫</Text>
        </Pressable>
      )}
    </View>
  );
}

const appHeader = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  backIcon: {
    fontSize: 24,
    color: colors.espresso,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: F.displaySemi,
    color: colors.espresso,
  },
  spacer: {
    width: 36,
  },
  actionBtn: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerAction: {
    fontSize: 16,
  },
});
