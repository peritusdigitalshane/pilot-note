-- Complete remaining packs 7-15 (each gets 10 detailed prompts)
-- Pack 7: Mobile App Development
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'React Native Cross-Platform Architecture', 'Design a React Native application architecture. Include: 1) Component structure and navigation setup (React Navigation), 2) State management (Redux, MobX, Zustand), 3) Platform-specific code organisation (iOS/Android), 4) Native module integration, 5) Performance optimisation for mobile, 6) Offline-first architecture with local storage, 7) Push notification implementation, 8) App update and code push strategy. Provide complete project structure and configuration using Australian spelling.', 1
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'iOS Native Development Best Practises', 'Design iOS application following Apple guidelines. Include: 1) SwiftUI vs UIKit decision and implementation, 2) MVVM or Clean Architecture pattern, 3) Combine framework for reactive programming, 4) Core Data or Realm for persistence, 5) Networking with URLSession or Alamofire, 6) Keychain for secure storage, 7) Background tasks and notifications, 8) App Store submission requirements. Provide Swift code examples with best practises using Australian spelling.', 2
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Android Native Development Best Practises', 'Design Android application following Material Design. Include: 1) Jetpack Compose vs XML layouts, 2) MVVM with ViewModel and LiveData, 3) Kotlin Coroutines for asynchronous operations, 4) Room database for local persistence, 5) Retrofit for networking, 6) WorkManager for background tasks, 7) Navigation component implementation, 8) Play Store optimisation. Provide Kotlin code examples with architecture components using Australian spelling.', 3
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile App Security & Data Protection', 'Implement comprehensive security for mobile apps. Include: 1) Secure storage (Keychain, KeyStore), 2) SSL pinning implementation, 3) Biometric authentication (Face ID, Touch ID, fingerprint), 4) Jailbreak/root detection, 5) Code obfuscation and reverse engineering protection, 6) Secure API communication, 7) Data encryption at rest, 8) OWASP Mobile Top 10 compliance. Provide security implementation examples using Australian spelling.', 4
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile Offline-First Architecture', 'Design offline-first mobile application. Include: 1) Local database implementation (SQLite, Realm, WatermelonDB), 2) Sync strategy with backend, 3) Conflict resolution mechanisms, 4) Queue for offline actions, 5) Network status detection and handling, 6) Progressive data loading, 7) Cache invalidation strategy, 8) Optimistic UI updates. Provide complete offline architecture with sync examples using Australian spelling.', 5
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile Performance & Battery Optimisation', 'Optimise mobile app performance and battery usage. Include: 1) Image loading and caching optimisation, 2) List rendering with FlatList/RecyclerView optimisation, 3) Memory leak prevention, 4) CPU and GPU profiling, 5) Battery drain analysis and optimisation, 6) Network request batching, 7) Background task optimisation, 8) App size reduction techniques. Provide performance profiling and optimisation examples using Australian spelling.', 6
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile App Testing Strategy', 'Design comprehensive testing strategy for mobile apps. Include: 1) Unit testing setup (Jest, XCTest, JUnit), 2) Component testing (React Native Testing Library), 3) E2E testing (Detox, Appium, Espresso), 4) Visual regression testing, 5) Device farm testing, 6) Performance testing, 7) Accessibility testing, 8) Beta testing and crash reporting. Provide test examples and CI/CD integration using Australian spelling.', 7
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile Deep Linking & Universal Links', 'Implement deep linking and universal links. Include: 1) Custom URL scheme setup, 2) Universal Links (iOS) implementation, 3) App Links (Android) configuration, 4) Deep link routing in app navigation, 5) Deferred deep linking for attribution, 6) Link handling from notifications, 7) Testing deep link scenarios, 8) Analytics integration for link tracking. Provide implementation for iOS and Android using Australian spelling.', 8
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile Push Notifications & In-App Messaging', 'Implement push notifications and messaging. Include: 1) Firebase Cloud Messaging setup, 2) Apple Push Notification Service (APNS) configuration, 3) Notification permissions and user experience, 4) Rich notifications with media, 5) Notification categories and actions, 6) Background notification handling, 7) Local notifications scheduling, 8) In-app messaging integration. Provide complete notification implementation using Australian spelling.', 9
FROM prompt_packs WHERE name = 'Mobile App Development'
UNION ALL
SELECT id, 'Mobile App Analytics & Monitoring', 'Implement analytics and monitoring for mobile apps. Include: 1) Analytics library integration (Firebase, Mixpanel, Amplitude), 2) Event tracking strategy, 3) User property management, 4) Crash reporting (Crashlytics, Sentry), 5) Performance monitoring, 6) User session recording, 7) A/B testing implementation, 8) Privacy-compliant tracking. Provide analytics implementation with GDPR considerations using Australian spelling.', 10
FROM prompt_packs WHERE name = 'Mobile App Development';