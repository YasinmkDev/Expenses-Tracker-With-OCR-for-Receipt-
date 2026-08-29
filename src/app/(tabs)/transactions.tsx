import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Plus, Trash2, Receipt } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { TransactionItem } from '@/components/native/TransactionItem';
import { useLedgerStore } from '@/store/ledgerStore';
import { CategoryType } from '@/types';

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
    const matchesCategory =
      selectedCategory === 'All' || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, merchant: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete ${merchant}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Transactions</Text>
            <Text style={styles.subtitle}>{filtered.length} Recorded Entries</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(modal)/add-manual')}
          >
            <Plus size={16} color="#002111" />
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search merchant or item..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity style={styles.filterIconBtn}>
            <Filter size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Transactions List */}
        <View style={styles.listContainer}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Receipt size={32} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery || selectedCategory !== 'All'
                  ? 'No entries match your search filters.'
                  : 'Start recording expenses by scanning receipts or adding manual entries.'}
              </Text>
            </View>
          ) : (
            filtered.map((tx) => (
              <View key={tx.id} style={styles.itemWrapper}>
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
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDelete(tx.id, tx.merchant)}
                >
                  <Trash2 size={15} color={Colors.rust} />
                </TouchableOpacity>
              </View>
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
    padding: 20,
    gap: 16,
  },
  header: {
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
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Menlo',
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  chipTextSelected: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  listContainer: {
    gap: 8,
    marginTop: 6,
  },
  itemWrapper: {
    position: 'relative',
  },
  deleteAction: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
    zIndex: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: 'Menlo',
    lineHeight: 18,
  },
});
