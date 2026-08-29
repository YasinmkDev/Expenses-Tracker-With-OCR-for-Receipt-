import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { Transaction } from '../../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <CategoryIcon
          categoryName={transaction.category}
          size={18}
          containerSize={42}
        />

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
              <Text style={styles.itemsCount}>
                • {transaction.lineItems.length} items
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>
          -${Number(transaction.amount || 0).toFixed(2)}
        </Text>
        <Text style={styles.time}>{transaction.time || transaction.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
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
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  aiBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
  aiText: {
    fontSize: 9,
    fontFamily: 'Menlo',
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  itemsCount: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    paddingLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontFamily: 'Menlo',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
});
