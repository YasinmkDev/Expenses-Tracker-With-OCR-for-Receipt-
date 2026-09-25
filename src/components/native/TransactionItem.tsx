import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Transaction } from '../../types';
import { CategoryIcon } from './CategoryIcon';
import { PressableScale } from '../ui/motion';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.merchant}, ${transaction.category}, $${Number(transaction.amount || 0).toFixed(2)}`}
    >
      <View style={styles.left}>
        <CategoryIcon categoryName={transaction.category} size={18} containerSize={44} />

        <View style={styles.info}>
          <Text style={styles.merchant} numberOfLines={1}>
            {transaction.merchant}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{transaction.category}</Text>
            {transaction.isAiScanned && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>AI Verified</Text>
              </View>
            )}
            {transaction.lineItems && transaction.lineItems.length > 1 && (
              <Text style={styles.itemsCount}>• {transaction.lineItems.length} items</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>-${Number(transaction.amount || 0).toFixed(2)}</Text>
        <Text style={styles.time}>{transaction.time || transaction.date}</Text>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  aiBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  aiText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: Colors.primaryLight,
  },
  itemsCount: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    paddingLeft: Spacing.sm,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
