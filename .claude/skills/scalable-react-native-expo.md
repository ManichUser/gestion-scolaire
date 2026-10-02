---
name: scalable-react-native-expo
description: Senior mobile engineer (10+ years) skill for building scalable, production-grade mobile apps with React Native and Expo. Use this whenever a project mentions React Native, Expo, a mobile app, iOS/Android development, or a client-side app that needs offline support — even if the user doesn't explicitly say "mobile architecture" or "offline-first". Covers: project structure, navigation, offline-first data sync, local storage, API integration, authentication, push notifications, performance, testing, and build/release conventions. Do not use for web-only projects (use a web-focused skill instead) or for throwaway prototypes with no intended production path.
---

# Senior React Native / Expo Engineer — Scalable Mobile Apps

This skill encodes how a senior mobile engineer builds a React Native/Expo app meant to grow — more users, more screens, intermittent connectivity, eventual App Store/Play Store release. It applies from the first screen, not as an afterthought.

## Guiding principle

Treat the backend as unreliable by default. Mobile apps run on networks that drop, batteries that die, and OS processes that get killed mid-task. Every feature should degrade gracefully rather than break when connectivity is poor or absent.

## 1. Project structure

Organize by feature, not by file type:

```
src/
├── features/<feature>/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── api/              # typed API calls for this feature
│   └── store/            # local state/cache specific to this feature
├── navigation/            # stack/tab navigators, route types
├── shared/
│   ├── ui/                # reusable design-system components
│   ├── api/                # shared API client (auth headers, base URL, interceptors)
│   └── storage/            # local DB client, sync queue
└── App.tsx
```

Avoid a global `components/`, `screens/`, `utils/` split with everything dumped in — it doesn't scale past a handful of screens.

## 2. Navigation

- React Navigation, typed routes (`RootStackParamList` etc.) so navigation calls are type-checked.
- Keep deep linking in mind from day one if the app will ever need push-notification-to-screen or share links — retrofitting it later touches every screen.
- Guard authenticated vs. unauthenticated navigation stacks at the root, not per-screen.

## 3. Offline-first data strategy

This is the part that separates a toy app from a production one.

- Local database (SQLite via `expo-sqlite` or WatermelonDB for larger datasets) as the source of truth for the UI. Screens read from local storage, not directly from network responses.
- A sync queue for writes made offline: each action (create, update, delete) is persisted locally first, queued, and flushed when connectivity returns. Never block the UI on network success for an action the user expects to feel instant.
- Conflict resolution strategy decided explicitly per entity, not left implicit:
  - Simple fields → last-write-wins with timestamp.
  - Fields where overwriting loses data (e.g. a grade, a payment) → flag the conflict and require explicit resolution rather than silently picking one side.
- Always show the user data freshness: a "synced just now" / "offline, last synced at..." indicator rather than pretending everything is live.
- Use `NetInfo` to detect connectivity changes and trigger queue flushes, but never assume connectivity state is instantly accurate — always have requests fail gracefully too.

## 4. API integration

- One typed API client (e.g. generated from an OpenAPI schema, or a thin typed wrapper) — no ad hoc `fetch` calls scattered across components.
- Automatic token refresh handled in an interceptor, not duplicated per call.
- Retry with backoff for idempotent requests; never silently retry a non-idempotent write (risk of duplicate submissions) — dedupe with a client-generated request ID instead.

## 5. Authentication

- Store tokens in secure storage (`expo-secure-store`), never in AsyncStorage or plain state.
- Biometric unlock (`expo-local-authentication`) as an option for returning sessions, not a requirement for the architecture.
- Handle "logged in but token expired while offline" explicitly: don't force a logout just because a refresh call failed due to no connectivity.

## 6. Push notifications

- Expo push tokens registered and refreshed on app start and on token change, stored server-side tied to the user and device.
- Handle notification taps by routing into the typed navigation stack, not by reloading the whole app.
- Respect OS-level permission flows — ask at a contextually relevant moment, not on first launch.

## 7. Performance

- `FlatList`/`FlashList` for any list that can grow beyond a screenful — never `.map()` into a `ScrollView` for dynamic data.
- Memoize expensive renders (`React.memo`, `useMemo`) only where profiling shows it matters — don't pre-optimize everything.
- Images: use `expo-image` with proper sizing and caching rather than raw `Image` for anything beyond a handful of static assets.
- Keep bundle size in check — audit dependencies before adding a heavy library for a small feature.

## 8. Testing

- Unit tests on business logic and sync/conflict-resolution logic specifically — this is the highest-risk code in an offline-first app.
- Component tests (React Native Testing Library) on critical screens (auth, checkout-equivalent flows).
- E2E (Detox or Maestro) on the two or three flows that would be catastrophic if broken (login, core data entry, payment-equivalent flow).

## 9. Build and release

- EAS Build with separate profiles for development, preview, and production.
- Environment variables per environment (dev/staging/prod API URLs) via `expo-constants` or EAS secrets — never hardcoded.
- Over-the-air updates (EAS Update) for JS-only changes; reserve store releases for native changes — but never ship a breaking change via OTA without a version gate, since not every device updates instantly.

## 10. Checklist before shipping a feature

- [ ] Screen reads from local storage, not directly from a network call
- [ ] Any write action works offline and queues for sync
- [ ] Conflict resolution strategy is explicit for any field that can be edited from two places
- [ ] Tokens are in secure storage, not AsyncStorage
- [ ] Lists use a virtualized component, not `.map()` in a `ScrollView`
- [ ] No hardcoded API URLs or secrets

## How to use this skill

When starting a new app or feature on this stack: define the local data model and sync strategy first — before writing a single screen. Decide, per entity, whether it needs offline write support or read-only caching is enough. Build the typed API client and local storage layer before the UI; retrofitting offline support after screens are built is far more expensive than designing for it from the start.
