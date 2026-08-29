import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, X, Sparkles, Building, Calendar, Plus, Trash2, Tag, Percent } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { LineItemRow } from '@/components/native/LineItemRow';
import { LineItem, CategoryType } from '@/types';
import { useLedgerStore } from '@/store/ledgerStore';

export default function ReviewModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addTransaction, updateTransaction, budgets } = useLedgerStore();

  let initialParsed: any = null;
  if (params.data) {
    try {
      initialParsed = JSON.parse(params.data as string);
    } catch (e) {}
  }

  const isExistingTx = Boolean(initialParsed?.id);

  const [merchant, setMerchant] = useState(initialParsed?.merchant || 'Whole Foods Market');
  const [date, setDate] = useState(
    initialParsed?.date ||
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [category, setCategory] = useState<string>(initialParsed?.category || budgets[0]?.name || 'Dining');
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialParsed?.lineItems && initialParsed.lineItems.length > 0
      ? initialParsed.lineItems
      : [
          { id: 'item-1', name: 'Itemized Entry', price: 18.5, category: 'Dining', confidence: 'high' },
        ]
  );
  const [taxStr, setTaxStr] = useState(
    initialParsed?.tax !== undefined ? initialParsed.tax.toString() : '1.50'
  );
  const [isSaving, setIsSaving] = useState(false);

  const subtotal = lineItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  const tax = parseFloat(taxStr) || 0;
  const total = subtotal + tax;

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      if (isExistingTx && initialParsed?.id) {
        await updateTransaction(initialParsed.id, {
          merchant: merchant.trim() || 'Updated Merchant',
          amount: total,
          date: date,
          category: category as CategoryType,
          tax: tax,
          lineItems: lineItems,
        });
      } else {
        await addTransaction({
          merchant: merchant.trim() || 'Scanned Merchant',
          amount: total,
          date: date,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          category: category as CategoryType,
          isAiScanned: true,
          confidence: 'high',
          tax: tax,
          lineItems: lineItems,
        });
      }
      router.back();
    } catch (e) {
      console.warn('Failed to save transaction:', e);
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `li_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: 'New Line Item',
      price: 5.0,
      category: category,
      confidence: 'high',
    };
    setLineItems([...lineItems, newItem]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.titleBox}>
          <Text style={styles.title}>{isExistingTx ? 'Edit Transaction' : 'Review & Verify'}</Text>
          <Text style={styles.subtitle}>{isExistingTx ? 'Update Entry Details' : 'Vision OCR Extracted'}</Text>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={isSaving}>
          <Check size={16} color="#002111" />
          <Text style={styles.confirmBtnText}>{isSaving ? 'SAVING...' : isExistingTx ? 'UPDATE' : 'SAVE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Verification Status */}
        <View style={styles.aiBadgeBanner}>
          <Sparkles size={16} color={Colors.primaryLight} />
          <Text style={styles.aiBadgeText}>
            Tap any item name or price to modify • {lineItems.length} Line Items
          </Text>
        </View>

        {/* Merchant & Date Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>TRANSACTION METADATA</Text>

          <View style={styles.inputRow}>
            <Building size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.textInput}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Merchant Name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Calendar size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="Transaction Date"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Line Items Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.lineItemsHeader}>
            <Text style={styles.sectionLabel}>ITEMIZED LINE ITEMS ({lineItems.length})</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={handleAddLineItem}>
              <Plus size={12} color={Colors.primaryLight} />
              <Text style={styles.addItemText}>ADD ITEM</Text>
            </TouchableOpacity>
          </View>

          {lineItems.length === 0 ? (
            <View style={styles.noItemsBox}>
              <Text style={styles.noItemsText}>No line items added yet.</Text>
            </View>
          ) : (
            lineItems.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                onDelete={() => handleDeleteItem(item.id)}
                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
              />
            ))
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Subtotal ({lineItems.length} items)</Text>
            <Text style={styles.sumVal}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.sumRow}>
            <View style={styles.taxLabelRow}>
              <Percent size={13} color={Colors.textMuted} />
              <Text style={styles.sumLabel}>Sales Tax</Text>
            </View>
            <View style={styles.taxInputBox}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.taxInput}
                value={taxStr}
                onChangeText={setTaxStr}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.sumDivider} />

          <View style={styles.sumRowTotal}>
            <Text style={styles.sumTotalLabel}>Total Amount</Text>
            <Text style={styles.sumTotalVal}>${total.toFixed(2)}</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 11,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  aiBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryMuted,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  aiBadgeText: {
    flex: 1,
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addItemBtn: {
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
  addItemText: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  noItemsBox: {
    padding: 14,
    alignItems: 'center',
  },
  noItemsText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sumLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  sumVal: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: 'Menlo',
    fontWeight: '600',
  },
  taxInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  currencyPrefix: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  taxInput: {
    fontSize: 13,
    fontFamily: 'Menlo',
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 45,
    textAlign: 'right',
    paddingVertical: 0,
  },
  sumDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  sumRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sumTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sumTotalVal: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
  },
});
