import { useAuth } from '@clerk/expo';
import { AuthView } from '@clerk/expo/native';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const palette = {
  page: '#111111',
  stone: '#C4BBB0',
} as const;

export default function SignInScreen() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={palette.stone} />
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authFrame}>
        <AuthView mode="signInOrUp" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.page,
    flex: 1,
  },
  authFrame: {
    flex: 1,
  },
});
