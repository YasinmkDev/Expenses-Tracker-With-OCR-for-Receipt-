# Graph Report - ledger_react_native  (2026-09-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 283 nodes · 505 edges · 11 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d87a8931`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme.ts
- package.json
- react-native
- dependencies
- expo
- ledgerStore.tsx
- expo-router
- compilerOptions
- scanner.tsx
- reset-project.js
- scripts

## God Nodes (most connected - your core abstractions)
1. `react-native` - 28 edges
2. `react` - 22 edges
3. `Colors` - 18 edges
4. `expo-router` - 16 edges
5. `useLedgerStore()` - 15 edges
6. `lucide-react-native` - 14 edges
7. `expo` - 14 edges
8. `react-native-safe-area-context` - 11 edges
9. `compilerOptions` - 11 edges
10. `BudgetCategory` - 8 edges

## Surprising Connections (you probably didn't know these)
- `LineItemRowProps` --references--> `LineItem`  [EXTRACTED]
  src/components/native/LineItemRow.tsx → src/types.ts
- `ScannedReceiptResult` --references--> `LineItem`  [EXTRACTED]
  src/services/ocrEngine.ts → src/types.ts
- `BudgetCardProps` --references--> `BudgetCategory`  [EXTRACTED]
  src/components/native/BudgetCard.tsx → src/types.ts
- `TransactionItemProps` --references--> `Transaction`  [EXTRACTED]
  src/components/native/TransactionItem.tsx → src/types.ts
- `ManualAddModalScreen()` --calls--> `useLedgerStore()`  [EXTRACTED]
  src/app/(modal)/add-manual.tsx → src/store/ledgerStore.tsx

## Import Cycles
- None detected.

## Communities (11 total, 0 thin omitted)

### Community 0 - "theme.ts"
Cohesion: 0.07
Nodes (41): lucide-react-native, react, react-native-safe-area-context, styles, ManualAddModalScreen(), ManualLineItem, PAYMENT_METHODS, QUICK_MERCHANTS (+33 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (34): devDependencies, @types/react, typescript, main, name, private, version, expo-camera (+26 more)

### Community 2 - "react-native"
Cohesion: 0.11
Nodes (21): expo, expo-image, expo-symbols, react-native, styles, HintRowProps, styles, styles (+13 more)

### Community 3 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-camera, expo-constants, expo-device, expo-font, expo-glass-effect, expo-image (+21 more)

### Community 4 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, foregroundImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes, expo, android (+18 more)

### Community 5 - "ledgerStore.tsx"
Cohesion: 0.11
Nodes (20): @react-native-async-storage/async-storage, BudgetCardProps, styles, TransactionItemProps, INITIAL_BUDGET_CATEGORIES, INITIAL_TRANSACTIONS, initialBudgets, initialTransactions (+12 more)

### Community 6 - "expo-router"
Cohesion: 0.11
Nodes (10): assets_images_appsplashscreenfullscreenimage, expo-router, expo-status-bar, expo-web-browser, splashImage, styles, { width, height }, ExternalLink() (+2 more)

### Community 7 - "compilerOptions"
Cohesion: 0.12
Nodes (15): expo/tsconfig.base, compilerOptions, allowSyntheticDefaultImports, esModuleInterop, jsx, module, moduleResolution, paths (+7 more)

### Community 8 - "scanner.tsx"
Cohesion: 0.26
Nodes (10): expo-image-picker, ScannerModalScreen(), styles, parseReceiptWithGemini(), categorizeText(), CATEGORY_KEYWORDS, executeRealOCR(), parseRawReceiptText() (+2 more)

### Community 9 - "reset-project.js"
Cohesion: 0.17
Nodes (10): ref_fs, ref_path, ref_readline, exampleDirPath, fs, oldDirs, path, readline (+2 more)

### Community 10 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, android, ios, lint, reset-project, start, web

## Knowledge Gaps
- **150 isolated node(s):** `ManualLineItem`, `CategoryIconProps`, `NumericKeypadProps`, `ScreenType`, `HintRowProps` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 177 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `theme.ts`, `package.json`, `ledgerStore.tsx`, `expo-router`, `scanner.tsx`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `react` connect `theme.ts` to `package.json`, `react-native`, `ledgerStore.tsx`, `expo-router`, `scanner.tsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `ManualLineItem`, `CategoryIconProps`, `NumericKeypadProps` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.074034902168165 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05121951219512195 - nodes in this community are weakly interconnected._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.11229946524064172 - nodes in this community are weakly interconnected._