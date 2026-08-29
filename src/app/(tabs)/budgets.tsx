import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sliders, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { BudgetCard } from '@/components/native/BudgetCard';
import { useLedgerStore } from '@/store/ledgerStore';

export default function BudgetsScreen() {
  const router = useRouter();
  const { computedBudgets, totalMonthlySpend, monthlyLimit, percentUsed, daysRemaining } = useLedgerStore();

  const totalBudget = computedBudgets.reduce((sum, c) => sum + c.budget, 0);
  const remainingTotal = Math.max(0, totalBudget - totalMonthlySpend);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Budgets</Text>
            <Text style={styles.subtitle}>Current Fiscal Period</Text>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(modal)/budget-manager')}
          >
            <Sliders size={14} color="#002111" />
            <Text style={styles.manageButtonText}>SET BUDGETS</Text>
          </TouchableOpacity>
        </View>

        {/* Master Spend Card */}
        <View style={styles.masterCard}>
          <View style={styles.masterHeader}>
            <View>
              <Text style={styles.cardLabel}>TOTAL MONTHLY SPEND</Text>
              <View style={styles.currencyRow}>
                <Text style={styles.mainSpend}>${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.totalBudget}> / ${monthlyLimit.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.usedBadge}>
              <Text style={styles.usedText}>{percentUsed}% USED</Text>
            </View>
          </View>

          {/* Master Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${percentUsed}%`,
                  backgroundColor: percentUsed >= 100 ? Colors.rust : percentUsed >= 80 ? Colors.gold : Colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.footerMuted}>{daysRemaining} Days Remaining</Text>
            <View style={styles.statusRow}>
              <TrendingUp size={12} color={Colors.primaryLight} />
              <Text style={styles.footerActive}>${remainingTotal.toLocaleString()} Remaining Pool</Text>
            </View>
          </View>
        </View>

        {/* Categories Header */}
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Category Caps</Text>
          <TouchableOpacity
            style={styles.addCategoryBtn}
            onPress={() => router.push('/(modal)/budget-manager')}
          >
            <Plus size={13} color={Colors.primaryLight} />
            <Text style={styles.addCategoryText}>NEW CATEGORY</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Grid List */}
        <View style={styles.bentoGrid}>
          {computedBudgets.map((cat) => (
            <BudgetCard
              key={cat.id}
              category={cat}
              onPress={() => router.push('/(modal)/budget-manager')}
            />
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
    padding: 20,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    marginTop: 2,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    color: '#002111',
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '700',
  },
  masterCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 16,
  },
  masterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  mainSpend: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Menlo',
  },
  totalBudget: {
    fontSize: 16,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  usedBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  usedText: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerMuted: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerActive: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontWeight: '600',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  addCategoryText: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  bentoGrid: {
    gap: 12,
  },
});
