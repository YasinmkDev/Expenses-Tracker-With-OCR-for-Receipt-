import { BudgetCard } from '@/components/native/BudgetCard';
import { AppButton, AppText, Divider, FadeSlideIn } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLedgerStore } from '@/store/ledgerStore';
import { useRouter } from 'expo-router';
import { Plus, Sliders, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetsScreen() {
  const router = useRouter();
  const { computedBudgets, totalMonthlySpend, monthlyLimit, percentUsed, daysRemaining } =
    useLedgerStore();

  const totalBudget = computedBudgets.reduce((sum, c) => sum + c.budget, 0);
  const remainingTotal = Math.max(0, totalBudget - totalMonthlySpend);
  const barColor = percentUsed >= 100 ? Colors.rust : percentUsed >= 80 ? Colors.gold : Colors.mint;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Header */}
        <FadeSlideIn index={0}>
          <View style={styles.headerRow}>
            <View>
              <AppText variant="title">Budgets</AppText>
              <AppText variant="caption" tone="muted" style={styles.subtitle}>
                Current fiscal period
              </AppText>
            </View>
            <AppButton
              label="Set budgets"
              icon={Sliders}
              variant="accent"
              onPress={() => router.push('/(modal)/budget-manager')}
              style={styles.manageButton}
            />
          </View>
        </FadeSlideIn>

        {/* Master Spend Card — spruce signature surface */}
        <FadeSlideIn index={1}>
          <View style={styles.masterCard}>
            <View style={styles.masterHeader}>
              <AppText variant="label" tone="onDarkMuted" uppercase>
                Total monthly spend
              </AppText>
              <View style={styles.usedBadge}>
                <AppText variant="caption" style={styles.usedText}>
                  {percentUsed}% USED
                </AppText>
              </View>
            </View>

            <View style={styles.currencyRow}>
              <AppText variant="numeric" tone="onDark">
                ${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </AppText>
              <AppText variant="body" tone="onDarkMuted">
                / ${monthlyLimit.toLocaleString()}
              </AppText>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, percentUsed)}%`, backgroundColor: barColor }]} />
            </View>

            <Divider onDark />

            <View style={styles.progressFooter}>
              <AppText variant="caption" tone="onDarkMuted">
                {daysRemaining} days remaining
              </AppText>
              <View style={styles.statusRow}>
                <TrendingUp size={13} color={Colors.mint} />
                <AppText variant="caption" style={styles.footerActive}>
                  ${remainingTotal.toLocaleString()} remaining pool
                </AppText>
              </View>
            </View>
          </View>
        </FadeSlideIn>

        {/* Categories Header */}
        <FadeSlideIn index={2}>
          <View style={styles.categoryHeader}>
            <AppText variant="subheading">Category caps</AppText>
            <AppButton
              label="New"
              icon={Plus}
              variant="ghost"
              onPress={() => router.push('/(modal)/budget-manager')}
              style={styles.addCategoryBtn}
            />
          </View>
        </FadeSlideIn>

        {/* Budget List */}
        <View style={styles.grid}>
          {computedBudgets.map((cat, i) => (
            <FadeSlideIn key={cat.id} index={3 + Math.min(i, 8)}>
              <BudgetCard category={cat} onPress={() => router.push('/(modal)/budget-manager')} />
            </FadeSlideIn>
          ))}
        </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  subtitle: { marginTop: 4 },
  manageButton: {
    minHeight: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  masterCard: {
    backgroundColor: Colors.spruce,
    borderRadius: Radius.surface,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.spruceElevated,
    gap: Spacing.base,
  },
  masterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  usedBadge: {
    backgroundColor: 'rgba(171,255,174,0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  usedText: { color: Colors.mint, fontWeight: '700', letterSpacing: 0.5 },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,252,246,0.12)',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerActive: { color: Colors.mint, fontWeight: '600' },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addCategoryBtn: {
    minHeight: 0,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  grid: {
    gap: Spacing.md,
  },
});
