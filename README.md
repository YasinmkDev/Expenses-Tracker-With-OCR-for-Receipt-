# Ledger AI — AI-Powered Receipt Scanner & Expense Engine 🧾✨

A high-performance, offline-first mobile expense tracker powered by **on-device OCR vision**, **AI-driven receipt parsing**, and **dynamic category budget enforcement**. Built with **React Native**, **Expo (SDK 57)**, and **TypeScript**.

---

## 🌟 Key Highlights & Architectural Features

### 📸 1. AI-Powered Receipt Ingestion & OCR Vision
- **Camera-Based Receipt Scanner**: Snap photos of paper receipts or select images from gallery.
- **Line-Item Extraction**: Automatically decomposes thermal/printed receipts into structured line items, merchant name, transaction date/time, and tax.
- **Confidence Scoring**: Flags parsed data with `high`, `medium`, or `low` confidence indicators for quick user verification.
- **Zero Manual Overhead**: Eliminates tedious manual expense logging while keeping 100% of financial data strictly on-device.

### 📊 2. Dynamic Budgeting & Spending Velocity
- **Category-Level Budgets**: Set and monitor limits across *Dining*, *Groceries*, *Transport*, *Shopping*, *Health*, *Utilities*, and *Travel*.
- **Visual Health Bars**: Color-coded progress indicators (*Emerald*, *Signal Gold*, *Amber Rust*) showing budget exhaustion.
- **Spending Velocity Metrics**: Real-time burn-rate analytics showing monthly projection vs. actual expenditure.

### 🗄️ 3. Offline-First Local Persistence
- **Zero-Latency Storage**: Uses `@react-native-async-storage/async-storage` for instant local caching and sub-second load times.
- **Privacy-Preserving**: No mandatory third-party bank logins or credentials required.
- **Instant Search & Filter**: Search transactions by merchant, category, date range, or amount with zero lag.

### 🎨 4. Fluid 60fps Native UI & Animations
- **Dark Elegance Aesthetic**: Curated dark palette with subtle glassmorphism and emerald accents.
- **Reanimated Transitions**: Powered by `react-native-reanimated` for smooth gesture-driven sheet modals, card expansions, and scanning animations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React Native 0.86](https://reactnative.dev/) / [Expo SDK 57](https://expo.dev/) |
| **Language** | [TypeScript 6.0](https://www.typescriptlang.org/) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) |
| **Animation** | [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) |
| **Camera & Media** | `expo-camera`, `expo-image-picker`, `expo-image` |
| **Icons & UI** | `lucide-react-native`, `@expo/ui`, `react-native-svg` |
| **Storage** | `@react-native-async-storage/async-storage` |

---

## 📂 Project Architecture

```
ledger_react_native/
├── assets/                  # App icons, splash screens, and demo assets
├── src/
│   ├── app/                 # Expo Router file-based screens & navigation
│   │   ├── _layout.tsx      # Root navigation provider & theme wrapper
│   │   └── (tabs)/          # Tab navigation (Home, Transactions, Scan, Budgets)
│   ├── components/          # Reusable UI components (Cards, Camera Viewfinder, Modals)
│   ├── constants/           # Color palettes, theme tokens, and typography
│   ├── data/                # Initial seed data and mock receipt images
│   ├── hooks/               # Custom hooks (useTransactions, useBudgets, useCamera)
│   ├── services/
│   │   ├── ocrEngine.ts     # Receipt text parsing and regex extraction engine
│   │   ├── geminiOcr.ts    # AI Vision API integration pipeline
│   │   └── storage.ts       # AsyncStorage CRUD layer
│   ├── store/               # Global state and reactive budget controllers
│   └── types.ts             # Domain interfaces (Transaction, LineItem, BudgetCategory)
├── app.json                 # Expo configuration & permissions
├── package.json             # Dependencies and build scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Expo Go on iOS/Android or an emulator/simulator

### 1. Clone & Install
```bash
# Navigate to project directory
cd ledger_react_native

# Install dependencies
npm install
```

### 2. Launch Development Server
```bash
# Start Expo development server
npx expo start
```

### 3. Run on Target Platform
- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`
- **Physical Device**: Scan the terminal QR code with the **Expo Go** app (Android) or **Camera app** (iOS).

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
"# Expenses-Tracker-With-OCR-for-Receipt-" 
