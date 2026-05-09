# Expo Mobile Clerk Authentication

Status: Active implementation note.

The app has pivoted from Supabase Auth to Clerk Auth.

## Runtime Shape

- Expo Router wraps the app in `ClerkProvider` with `@clerk/expo/token-cache`.
- `app/sign-in.tsx` renders Clerk native `AuthView` for sign-in and sign-up.
- `app/_layout.tsx` protects the translator and account screens with `Stack.Protected`.
- `app/index.tsx` retrieves the current Clerk session token before translation requests.
- `lib/api.ts` sends `Authorization: Bearer <Clerk session token>` to `/v1/translate-audio`.
- `server/index.mjs` verifies the Clerk session before any OpenAI or Darija ASR provider call.

## Environment

Mobile:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

Server:

```bash
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Development Note

Clerk native components require a development build. Use `npm run ios` or `npm run android` for the full native sign-in flow.
