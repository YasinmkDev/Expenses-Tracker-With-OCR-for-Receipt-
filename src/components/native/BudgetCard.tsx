import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { BudgetCategory } from '../../types';
import { CategoryIcon } from './CategoryIcon';
import { PressableScale } from '../ui/motion';

interface BudgetCardProps {
  category: BudgetCategory;
  onPress?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ category, onPress }) => {
  const pct = Math.min(100, Math.round((category.spent / (category.budget || 1)) * 100));
  const isHigh = pct >= 80;
  const isOver = pct >= 100;
  const barColor = isOver ? Colors.rust : isHigh ? Colors.gold : Colors.primary;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${category.name} budget, ${pct}% used`}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <CategoryIcon
            name={category.icon}
            categoryName={category.name}
            color={barColor}
            size={18}
            containerSize={40}
          />
          <View>
            <Text style={styles.name}>{category.name}</Text>
            <Text style={styles.txCount}>{category.transactionCount} entries</Text>
          </View>
        </View>

        <View style={[styles.pctBadge, isHigh && styles.pctBadgeWarning, isOver && styles.pctBadgeDanger]}>
          <Text style={[styles.pctText, isHigh && styles.pctTextWarning, isOver && styles.pctTextDanger]}>
            {pct}%
          </Text>
        </View>
      </View>

      <View style={styles.spendRow}>
        <Text style={styles.spentAmount}>
          ${category.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
          <Text style={styles.budgetLimit}>/ ${category.budget.toLocaleString()}</Text>
        </Text>
        <Text style={[styles.remaining, { color: barColor }]}>
          {category.budget - category.spent >= 0
            ? `$${(category.budget - category.spent).toLocaleString()} left`
            : `$${Math.abs(category.budget - category.spent).toLocaleString()} over`}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.surface,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },
  txCount: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  pctBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  pctBadgeWarning: {
    backgroundColor: Colors.goldMuted,
  },
  pctBadgeDanger: {
    backgroundColor: Colors.rustMuted,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  pctTextWarning: {
    color: Colors.gold,
  },
  pctTextDanger: {
    color: Colors.rust,
  },
  spendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },
  budgetLimit: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  remaining: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
