import { useClerk, useUser } from '@clerk/expo';
import { UserProfileView } from '@clerk/expo/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const palette = {
  shell: '#242424',
  page: '#111111',
  card: '#151515',
  border: '#343434',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#726F69',
  stone: '#C4BBB0',
  stoneText: '#171717',
  redDim: '#3A1715',
} as const;

export default function AccountScreen() {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress;

  async function handleSignOut() {
    await signOut();
    router.replace('/sign-in' as Href);
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={palette.stone} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.profileSummary}>
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={22} color={palette.stoneText} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.nameText}>
              {user?.fullName || user?.username || 'Signed in'}
            </Text>
            <Text selectable style={styles.emailText}>
              {email || user?.id}
            </Text>
          </View>
        </View>

        <View style={styles.profilePanel}>
          <UserProfileView />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed ? styles.pressedButton : null,
          ]}
        >
          <Ionicons name="log-out-outline" size={19} color={palette.text} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.shell,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 16,
    padding: 18,
  },
  profileSummary: {
    alignItems: 'center',
    backgroundColor: palette.page,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  nameText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emailText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  profilePanel: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: palette.redDim,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    justifyContent: 'center',
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  signOutText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
});
