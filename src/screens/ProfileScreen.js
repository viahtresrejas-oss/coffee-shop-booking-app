import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  Coffee,
  Compass,
  Calendar,
  User,
  Camera,
  Star,
  Download,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useProfile } from '../contexts/ProfileContext';
import { COLORS } from '../theme/theme.js';

export default function ProfileScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();

  const [draftName, setDraftName] = useState(null);
  const [draftEmail, setDraftEmail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reminders, setReminders] = useState(true);
  // FIX (deep-scan): broken remote avatar URI must not leave a blank box.
  const [avatarFailed, setAvatarFailed] = useState(false);

  // FIX (deep-scan): profile may be null on first render / corrupted storage.
  const safeProfile = profile ?? {};
  const name = draftName ?? safeProfile.name ?? '';
  const email = draftEmail ?? safeProfile.email ?? '';
  const avatarUri =
    !avatarFailed && typeof safeProfile.photo === 'string' && safeProfile.photo.length > 0
      ? safeProfile.photo
      : null;
  const dirty = draftName !== null || draftEmail !== null;

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert(
          'Permission needed',
          'Allow camera access in your device settings to take a profile photo.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      const uri = result?.assets?.[0]?.uri;
      if (!result?.canceled && uri) {
        await updateProfile({ photo: uri });
      }
    } catch (e) {
      console.warn('[ProfileScreen] takePhoto failed:', e);
      Alert.alert('Camera unavailable', 'Could not open the camera in this build.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert(
          'Permission needed',
          'Allow photo library access in your device settings to choose a picture.',
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      const uri = result?.assets?.[0]?.uri;
      if (!result?.canceled && uri) {
        await updateProfile({ photo: uri });
      }
    } catch (e) {
      console.warn('[ProfileScreen] pickFromGallery failed:', e);
      Alert.alert('Gallery unavailable', 'Could not open the photo library in this build.');
    }
  };

  const savePhotoToGallery = async () => {
    try {
      // FIX 1: `import * as MediaLibrary from 'expo-media-library'` at the top
      // of the file executes `requireNativeModule('ExpoMediaLibraryNext')`
      // DURING bundle evaluation. On Expo Go (stale native runtime), on Web,
      // or on any dev-client build without that native module, the whole
      // screen crashes with:
      //   "[runtime not ready]: Cannot find native module 'ExpoMediaLibraryNext'"
      // Solution: lazy-require INSIDE the handler + Platform guard, so the
      // native module is only touched when the user actually taps "Save".
      if (Platform.OS === 'web') {
        Alert.alert(
          'Not supported on web',
          'Saving to the device gallery only works in a native build (Expo dev build / TestFlight / Play internal). Your photo is already saved to your profile.',
        );
        return;
      }

      let MediaLibrary;
      try {
        MediaLibrary = require('expo-media-library/legacy');
      } catch {
        // Fallback for older/newer package layouts.
        try {
          MediaLibrary = require('expo-media-library');
        } catch {
          MediaLibrary = null;
        }
      }

      if (
        !MediaLibrary ||
        typeof MediaLibrary.requestPermissionsAsync !== 'function' ||
        typeof MediaLibrary.saveToLibraryAsync !== 'function'
      ) {
        Alert.alert(
          'Gallery unavailable',
          'The media-library native module is not installed in this build. Run a development build (`npx expo run:android` / `npx expo run:ios`) or EAS dev build instead of Expo Go.',
        );
        return;
      }

      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission needed',
          'Allow photo library access in your device settings to save images.',
        );
        return;
      }

      let localUri = profile?.photo;
      if (!localUri || typeof localUri !== 'string') {
        Alert.alert('Nothing to save', 'Choose a profile photo first.');
        return;
      }

      // FIX 2 (deep-scan): `expo-file-system/legacy` static import also ran at
      // bundle time. Lazy-load it here so web / stale runtimes don't crash.
      if (localUri.startsWith('http')) {
        let FileSystem = null;
        try {
          FileSystem = require('expo-file-system/legacy');
        } catch {
          try {
            FileSystem = require('expo-file-system');
          } catch {
            FileSystem = null;
          }
        }
        if (
          !FileSystem ||
          typeof FileSystem.cacheDirectory !== 'string' ||
          typeof FileSystem.downloadAsync !== 'function'
        ) {
          Alert.alert(
            'Cannot download photo',
            'File-system module is unavailable in this build. Try a native development build.',
          );
          return;
        }
        const fileUri = `${FileSystem.cacheDirectory}profile-${Date.now()}.jpg`;
        const downloaded = await FileSystem.downloadAsync(localUri, fileUri);
        localUri = downloaded?.uri ?? fileUri;
      }

      // FIX 3 (deep-scan): on SDK 57, `saveToLibraryAsync` imported from the
      // package root (`expo-media-library`) is a stub in `legacyWarnings.js`
      // that ALWAYS throws "deprecated — import from expo-media-library/legacy".
      // Because we lazy-required the `/legacy` entry above, this call is the
      // real implementation (native `ExpoMediaLibrary`). If that old native
      // module is gone and only `ExpoMediaLibraryNext` exists, fall back to
      // the new class API: `Asset.create(localUri)`.
      try {
        await MediaLibrary.saveToLibraryAsync(localUri);
      } catch (saveErr) {
        const msg = String(saveErr?.message ?? saveErr);
        const isDeprecatedStub = msg.includes('deprecated');
        const isMissingNative =
          msg.includes('Cannot find native module') ||
          msg.includes('UnavailabilityError') ||
          msg.includes('is not available');
        if (!isDeprecatedStub && !isMissingNative) throw saveErr;

        let NextLib = null;
        try {
          NextLib = require('expo-media-library');
        } catch {
          NextLib = null;
        }
        if (!NextLib?.Asset?.create) throw saveErr;
        await NextLib.Asset.create(localUri);
      }
      Alert.alert('Saved', 'Profile photo saved to your device gallery.');
    } catch (e) {
      console.warn('[ProfileScreen] savePhotoToGallery failed:', e);
      Alert.alert('Error', 'Could not save the photo to your gallery.');
    }
  };

  const onPhotoPress = () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Save to Gallery', onPress: savePhotoToGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      // FIX (deep-scan): `name`/`email` fall back to profile values but could
      // still be non-strings; `.trim()` would throw. Coerce safely.
      const safeName = String(name ?? profile?.name ?? '').trim();
      const safeEmail = String(email ?? profile?.email ?? '').trim();
      await updateProfile({
        name: safeName || profile?.name || 'Guest',
        email: safeEmail || profile?.email || '',
      });
      setDraftName(null);
      setDraftEmail(null);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      console.warn('[ProfileScreen] onSave failed:', e);
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Loyalty Tier Banner */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Star size={18} color="#78350F" />
            <Text style={styles.tierTitle}>Gold Brewer Tier</Text>
            <View style={styles.ptsBadge}>
              <Text style={styles.ptsText}>340 Pts</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>
                  {String(safeProfile.name ?? 'G').charAt(0).toUpperCase() || 'G'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editCamBtn} onPress={onPhotoPress}>
              <Camera size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{safeProfile.name ?? 'Guest'}</Text>
          <Text style={styles.userEmail}>{safeProfile.email ?? ''}</Text>

          {/* Gallery Export */}
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              style={styles.photoActionBtn}
              onPress={onPhotoPress}
            >
              <ImageIcon size={14} color="#006689" />
              <Text style={styles.photoActionText}>Upload / Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoActionBtn}
              onPress={savePhotoToGallery}
            >
              <Download size={14} color="#006689" />
              <Text style={styles.photoActionText}>Save to Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Profile Editor */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Profile Editor</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setDraftName}
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            style={styles.input}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setDraftEmail}
            placeholder="Your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.saveBtn, (!dirty || saving) && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={!dirty || saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Preferences */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Table Booking Reminders</Text>
            <Switch
              value={reminders}
              onValueChange={setReminders}
              trackColor={{ true: '#006689' }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation?.navigate('HomeScreen')}>
          <Coffee size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate('ExploreScreen')}>
          <Compass size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate('MyBookingsScreen')}>
          <Calendar size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.activeNavItem}>
          <User size={20} color="#006689" />
          <Text style={styles.activeNavText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  loyaltyCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tierTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#78350F' },
  ptsBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ptsText: { fontSize: 11, fontWeight: '800', color: '#006689' },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { width: '70%', height: '100%', backgroundColor: '#006689' },
  userHeader: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB' },
  avatarFallback: {
    backgroundColor: '#006689',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  editCamBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#006689',
    padding: 6,
    borderRadius: 12,
  },
  userName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  userEmail: { fontSize: 12, color: '#6B7280' },
  photoActionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  photoActionText: { fontSize: 12, fontWeight: '700', color: '#006689' },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  label: { fontSize: 10, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 12,
    marginBottom: 10,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#006689',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { fontSize: 12, fontWeight: '600', color: '#111827' },
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
