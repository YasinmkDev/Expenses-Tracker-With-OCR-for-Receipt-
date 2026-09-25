import { TransactionItem } from '@/components/native/TransactionItem';
import { AppButton, AppInput, AppText, FadeSlideIn } from '@/components/ui';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/motion';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLedgerStore } from '@/store/ledgerStore';
import { CategoryType } from '@/types';
import { useRouter } from 'expo-router';
import { Plus, Receipt, Search, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES: Array<CategoryType | 'All'> = [
  'All',
  'Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Travel',
  'Electronics',
  'Health',
  'Utilities',
];

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, deleteTransaction } = useLedgerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.lineItems?.some((li) => li.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, merchant: string) => {
    Alert.alert('Delete Transaction', `Are you sure you want to delete ${merchant}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <FadeSlideIn index={0}>
          <View style={styles.header}>
            <View>
              <AppText variant="title">Transactions</AppText>
              <AppText variant="caption" tone="muted" style={styles.subtitle}>
                {filtered.length} recorded {filtered.length === 1 ? 'entry' : 'entries'}
              </AppText>
            </View>
            <AppButton
              label="Add"
              icon={Plus}
              variant="accent"
              onPress={() => router.push('/(modal)/add-manual')}
              style={styles.addBtn}
            />
          </View>
        </FadeSlideIn>

        {/* Search */}
        <FadeSlideIn index={1}>
          <AppInput
            icon={Search}
            placeholder="Search merchant or item…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </FadeSlideIn>

        {/* Category Filter Chips */}
        <FadeSlideIn index={2}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <PressableScale
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${cat}`}
                >
                  <AppText
                    variant="label"
                    style={isSelected ? styles.chipTextSelected : styles.chipText}
                  >
                    {cat}
                  </AppText>
                </PressableScale>
              );
            })}
          </ScrollView>
        </FadeSlideIn>

        {/* Transactions List */}
        <View style={styles.listContainer}>
          {filtered.length === 0 ? (
            <FadeSlideIn index={3}>
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Receipt size={26} color={Colors.primaryLight} />
                </View>
                <AppText variant="subheading" center>
                  No transactions found
                </AppText>
                <AppText variant="body" tone="muted" center style={styles.emptyDesc}>
                  {searchQuery || selectedCategory !== 'All'
                    ? 'No entries match your search filters.'
                    : 'Start recording expenses by scanning receipts or adding manual entries.'}
                </AppText>
              </View>
            </FadeSlideIn>
          ) : (
            filtered.map((tx, i) => (
              <FadeSlideIn key={tx.id} index={3 + Math.min(i, 8)}>
                <View style={styles.itemWrapper}>
                  <View style={styles.itemFlex}>
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
                  </View>
                  <IconButton
                    icon={Trash2}
                    variant="ghost"
                    size={38}
                    color={Colors.rust}
                    onPress={() => handleDelete(tx.id, tx.merchant)}
                    accessibilityLabel={`Delete ${tx.merchant}`}
                    style={styles.deleteAction}
                  />
                </View>
              </FadeSlideIn>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  subtitle: { marginTop: 4 },
  addBtn: {
    minHeight: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  chipsContainer: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  chipText: { color: Colors.textMuted },
  chipTextSelected: { color: Colors.onSpruce, fontWeight: '700' },
  listContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemFlex: { flex: 1 },
  deleteAction: {},
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.surface,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyDesc: { maxWidth: 300 },
});
