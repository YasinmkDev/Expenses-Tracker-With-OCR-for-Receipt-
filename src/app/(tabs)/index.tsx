import { TransactionItem } from '@/components/native/TransactionItem';
import {
  AppButton,
  AppText,
  Card,
  Divider,
  FadeSlideIn,
  IconButton,
} from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { BackendService } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { useLedgerStore } from '@/store/ledgerStore';
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  Camera,
  LogOut,
  Plus,
  ReceiptText,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const {
    transactions,
    totalMonthlySpend,
    monthlyLimit,
    percentUsed,
    daysRemaining,
    userProfile,
  } = useLedgerStore();

  const isUnderBudget = monthlyLimit >= totalMonthlySpend;
  const variance = Math.abs(monthlyLimit - totalMonthlySpend);
  const barColor = percentUsed >= 100 ? Colors.rust : percentUsed >= 80 ? Colors.gold : Colors.mint;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Leave this Ledger session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await BackendService.signOut();
          } finally {
            await SafeStorage.removeItem('@ledger_guest_session');
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <FadeSlideIn index={0}>
          <View style={styles.header}>
            <View style={styles.brandCol}>
              <View style={styles.brandRow}>
                <View style={styles.logoDot} />
                <AppText variant="label" tone="accent" uppercase style={styles.brandTitle}>
                  Ledger
                </AppText>
              </View>
              <AppText variant="heading" style={styles.greeting}>
                Hi, {userProfile.name}
              </AppText>
            </View>
            <IconButton
              icon={LogOut}
              variant="surface"
              onPress={handleSignOut}
              accessibilityLabel="Sign out"
            />
          </View>
        </FadeSlideIn>

        {/* Signature spend card — electric grape retail-style hero */}
        <FadeSlideIn index={1}>
          <View style={styles.heroCard}>
            <View style={styles.cardHeader}>
              <AppText variant="label" tone="onDarkMuted" uppercase>
                Total monthly spend
              </AppText>
              <View style={[styles.usedBadge, percentUsed >= 90 && styles.usedBadgeAlert]}>
                <AppText
                  variant="caption"
                  style={{
                    color: percentUsed >= 90 ? Colors.rust : Colors.mint,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                  }}
                >
                  {percentUsed}% USED
                </AppText>
              </View>
            </View>

            <View style={styles.amountRow}>
              <AppText variant="numeric" tone="onDark">
                ${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </AppText>
              <AppText variant="body" tone="onDarkMuted" style={styles.maxSpend}>
                / ${monthlyLimit.toLocaleString()}
              </AppText>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, percentUsed)}%`, backgroundColor: barColor }]} />
            </View>

            <Divider onDark />

            <View style={styles.cardFooter}>
              <AppText variant="caption" tone="onDarkMuted">
                {daysRemaining} days remaining
              </AppText>
              <View style={styles.statusRow}>
                {isUnderBudget ? (
                  <TrendingUp size={13} color={Colors.mint} />
                ) : (
                  <TrendingDown size={13} color={Colors.rust} />
                )}
                <AppText
                  variant="caption"
                  style={{ color: isUnderBudget ? Colors.mint : Colors.rust, fontWeight: '600' }}
                >
                  {isUnderBudget ? `On track · $${variance.toFixed(0)} under` : `Over cap · $${variance.toFixed(0)}`}
                </AppText>
              </View>
            </View>
          </View>
        </FadeSlideIn>

        {/* Quick Actions */}
        <FadeSlideIn index={2}>
          <View style={styles.actionsRow}>
            <AppButton
              label="Scan receipt"
              icon={Camera}
              variant="accent"
              onPress={() => router.push('/(modal)/scanner')}
              style={styles.actionBtn}
            />
            <AppButton
              label="Manual entry"
              icon={Plus}
              variant="secondary"
              onPress={() => router.push('/(modal)/add-manual')}
              style={styles.actionBtn}
            />
          </View>
        </FadeSlideIn>

        {/* AI Verified Banner */}
        <FadeSlideIn index={3}>
          <Card surface="mint" style={styles.aiBanner}>
            <Sparkles size={16} color={Colors.primaryLight} />
            <AppText variant="caption" tone="accent" style={styles.aiBannerText}>
              Vision OCR active · instant line-item categorization & spend intelligence
            </AppText>
          </Card>
        </FadeSlideIn>

        {/* Recent Transactions Header */}
        <FadeSlideIn index={4}>
          <View style={styles.sectionHeader}>
            <AppText variant="subheading">Recent activity</AppText>
            {transactions.length > 0 && (
              <AppButton
                label={`View all (${transactions.length})`}
                variant="ghost"
                iconRight
                icon={ArrowUpRight}
                onPress={() => router.push('/(tabs)/transactions')}
                style={styles.viewAll}
              />
            )}
          </View>
        </FadeSlideIn>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <FadeSlideIn index={5}>
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <ReceiptText size={28} color={Colors.primaryLight} />
              </View>
              <AppText variant="subheading" center>
                No transactions yet
              </AppText>
              <AppText variant="body" tone="muted" center style={styles.emptySub}>
                Scan your physical receipts or add manual expenses to start tracking your spend.
              </AppText>
              <AppButton
                label="Scan first receipt"
                icon={Camera}
                variant="accent"
                onPress={() => router.push('/(modal)/scanner')}
                style={styles.emptyAction}
              />
            </View>
          </FadeSlideIn>
        ) : (
          <View style={styles.txList}>
            {transactions.slice(0, 5).map((tx, i) => (
              <FadeSlideIn key={tx.id} index={5 + i}>
                <TransactionItem
                  transaction={tx}
                  onPress={() => {
                    router.push({
                      pathname: '/(modal)/review',
                      params: {
                        data: JSON.stringify({
                          id: tx.id,
                          isExisting: true,
                          merchant: tx.merchant,
                          date: tx.date,
                          total: tx.amount,
                          tax: tx.tax || 0,
                          category: tx.category,
                          lineItems: tx.lineItems || [],
                        }),
                      },
                    });
                  }}
                />
              </FadeSlideIn>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.huge,
    gap: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandCol: { gap: 4 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.rust,
  },
  brandTitle: { letterSpacing: 2 },
  greeting: { marginTop: 2 },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.surface,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    gap: Spacing.base,
    shadowColor: Colors.primaryLight,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  maxSpend: {},
  usedBadge: {
    backgroundColor: 'rgba(171,255,174,0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  usedBadgeAlert: {
    backgroundColor: 'rgba(193,68,59,0.18)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,252,246,0.12)',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: { flex: 1 },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  aiBannerText: { flex: 1, lineHeight: 17 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  viewAll: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minHeight: 0,
  },
  txList: {
    gap: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.surface,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: Radius.surface,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptySub: { maxWidth: 300 },
  emptyAction: { marginTop: Spacing.sm, minWidth: 200 },
});
