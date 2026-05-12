import { useClerk, useUser } from '@clerk/expo';
import { UserProfileView } from '@clerk/expo/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const palette = {
  shell: '#242424',
  page: '#111111',
  card: '#151515',
  cardRaised: '#191919',
  border: '#343434',
  borderSoft: '#252525',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#726F69',
  stone: '#C4BBB0',
  stoneText: '#171717',
  amber: '#D6B45C',
  red: '#D7625A',
  redDim: '#3A1715',
} as const;

type ProfilePanel = 'profile' | 'security' | null;

export default function AccountScreen() {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const [activePanel, setActivePanel] = useState<ProfilePanel>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress;
  const displayName = user?.fullName || user?.username || 'Signed in';
  const identityLine = email || user?.id || 'Clerk account';

  async function performSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await signOut();
      router.replace('/login' as Href);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unable to sign out.';
      setSignOutError(message);
      setIsSigningOut(false);
    }
  }

  function confirmSignOut() {
    if (isSigningOut) {
      return;
    }

    Alert.alert('Sign out?', 'You will return to the sign-in screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void performSignOut();
        },
      },
    ]);
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={palette.stone} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSummary}>
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={24} color={palette.stoneText} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.kicker}>Current account</Text>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text selectable numberOfLines={2} style={styles.emailText}>
              {identityLine}
            </Text>
          </View>
        </View>

        <View style={styles.actionList}>
          <AccountAction
            icon="create-outline"
            label="Manage profile"
            description="Update name, email, and profile details"
            onPress={() =>
              setActivePanel((current) => (current === 'profile' ? null : 'profile'))
            }
          />
          <AccountAction
            icon="shield-checkmark-outline"
            label="Security"
            description="Review sign-in and security settings"
            onPress={() =>
              setActivePanel((current) => (current === 'security' ? null : 'security'))
            }
          />
          <AccountAction
            icon="time-outline"
            label="Translation history"
            description="Review translations for this signed-in user"
            onPress={() => router.push('/history' as Href)}
          />
        </View>

        {signOutError ? (
          <View style={styles.errorPanel}>
            <Ionicons name="warning-outline" size={18} color={palette.amber} />
            <Text selectable style={styles.errorText}>
              {signOutError}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityHint="Return to the sign-in screen"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={confirmSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            isSigningOut ? styles.disabledButton : null,
            pressed && !isSigningOut ? styles.pressedButton : null,
          ]}
        >
          {isSigningOut ? (
            <ActivityIndicator color={palette.text} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={palette.text} />
          )}
          <Text style={styles.signOutText}>
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </Text>
        </Pressable>

        {activePanel ? (
          <View style={styles.profilePanel}>
            <View style={styles.profilePanelHeader}>
              <View>
                <Text style={styles.panelTitle}>
                  {activePanel === 'security' ? 'Profile and security' : 'Manage profile'}
                </Text>
                <Text style={styles.panelSubtitle}>Secured by Clerk</Text>
              </View>
              <Pressable
                accessibilityLabel="Close profile settings"
                accessibilityRole="button"
                onPress={() => setActivePanel(null)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.pressedButton : null,
                ]}
              >
                <Ionicons name="close" size={18} color={palette.textMuted} />
              </Pressable>
            </View>
            <View style={styles.clerkPanel}>
              <UserProfileView />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

interface AccountActionProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  onPress: () => void;
}

function AccountAction({ icon, label, description, onPress }: AccountActionProps) {
  return (
    <Pressable
      accessibilityHint={description}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed ? styles.pressedButton : null,
      ]}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={palette.stone} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.shell,
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 18,
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  profileSummary: {
    alignItems: 'center',
    backgroundColor: palette.page,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  kicker: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  nameText: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '900',
  },
  emailText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionList: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionRow: {
    alignItems: 'center',
    borderBottomColor: palette.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  actionText: {
    flex: 1,
    gap: 3,
  },
  actionLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
  actionDescription: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  errorPanel: {
    alignItems: 'center',
    backgroundColor: '#2A2112',
    borderColor: '#5B4522',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 13,
  },
  errorText: {
    color: '#F1D79B',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: palette.redDim,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 54,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.55,
  },
  signOutText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  profilePanel: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profilePanelHeader: {
    alignItems: 'center',
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  panelTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
  panelSubtitle: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  clerkPanel: {
    minHeight: 500,
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
