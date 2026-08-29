import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X,
  Check,
  CreditCard,
  Calendar,
  FileText,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Percent,
  Plus,
  Trash2,
  ListOrdered,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { NumericKeypad } from '@/components/native/NumericKeypad';
import { CategoryIcon } from '@/components/native/CategoryIcon';
import { useLedgerStore } from '@/store/ledgerStore';
import { CategoryType, LineItem } from '@/types';

const PAYMENT_METHODS = ['Corporate Amex', 'Visa Black', 'ACH / Wire', 'Cash / Petty', 'Reimbursement'];

const QUICK_MERCHANTS: Record<string, string[]> = {
  Dining: ['Blue Bottle', 'Starbucks', 'Sweetgreen', 'Chipotle', 'Client Dinner', 'Executive Lunch'],
  Groceries: ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Costco', 'Erewhon'],
  Transport: ['Uber', 'Lyft', 'Chevron', 'Shell', 'Parking', 'Delta Airlines'],
  Electronics: ['Apple Store', 'Best Buy', 'AWS Cloud', 'OpenAI', 'Microsoft'],
  Shopping: ['Amazon', 'Target', 'Nordstrom', 'Office Supplies'],
  Health: ['CVS Pharmacy', 'Walgreens', 'Equinox', 'Doctor Visit'],
  Travel: ['Marriott Hotel', 'Hilton', 'Airbnb', 'United Airlines'],
  Utilities: ['PG&E', 'Verizon', 'AT&T', 'Internet Service'],
};

interface ManualLineItem {
  id: string;
  name: string;
  price: string;
}

export default function ManualAddModalScreen() {
  const router = useRouter();
  const { budgets, addTransaction } = useLedgerStore();

  const [amountStr, setAmountStr] = useState('0.00');
  const [merchant, setMerchant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(budgets[0]?.name || 'Dining');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Amex');
  const [dateStr, setDateStr] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [taxStr, setTaxStr] = useState('');
  const [note, setNote] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLineItems, setShowLineItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Line items state
  const [lineItems, setLineItems] = useState<ManualLineItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Keypad logic
  const handleDigit = (digit: string) => {
    if (amountStr === '0.00' || amountStr === '0') {
      if (digit === '.') setAmountStr('0.');
      else setAmountStr(digit);
    } else {
      if (digit === '.' && amountStr.includes('.')) return;
      if (amountStr.includes('.') && amountStr.split('.')[1].length >= 2) return;
      setAmountStr(amountStr + digit);
    }
  };

  const handleDelete = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0.00');
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  const handleQuickAdd = (addVal: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + addVal).toFixed(2));
  };

  const handleClear = () => {
    setAmountStr('0.00');
  };

  // Line item management
  const handleAddLineItem = () => {
    const trimmed = newItemName.trim();
    const priceVal = parseFloat(newItemPrice);

    if (!trimmed) {
      Alert.alert('Missing Name', 'Please enter item description.');
      return;
    }
    if (isNaN(priceVal) || priceVal <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price for this item.');
      return;
    }

    const updated = [
      ...lineItems,
      {
        id: `li_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        name: trimmed,
        price: priceVal.toFixed(2),
      },
    ];
    setLineItems(updated);
    setNewItemName('');
    setNewItemPrice('');

    // Auto-calculate sum of line items to update total amount
    const sum = updated.reduce((acc, it) => acc + (parseFloat(it.price) || 0), 0);
    const taxVal = parseFloat(taxStr) || 0;
    setAmountStr((sum + taxVal).toFixed(2));
  };

  const handleDeleteLineItem = (id: string) => {
    const updated = lineItems.filter((it) => it.id !== id);
    setLineItems(updated);

    if (updated.length > 0) {
      const sum = updated.reduce((acc, it) => acc + (parseFloat(it.price) || 0), 0);
      const taxVal = parseFloat(taxStr) || 0;
      setAmountStr((sum + taxVal).toFixed(2));
    }
  };

  const handleAttachPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Attach photo error:', e);
    }
  };

  const handleSnapPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Snap photo error:', e);
    }
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amountStr);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an expense amount greater than $0.00.');
      return;
    }

    const merchantName = merchant.trim() || `${selectedCategory} Expense`;
    const numTax = parseFloat(taxStr) || 0;

    // Build structured line items
    const finalLineItems: LineItem[] =
      lineItems.length > 0
        ? lineItems.map((li) => ({
            id: li.id,
            name: li.name,
            price: parseFloat(li.price) || 0,
            category: selectedCategory,
            confidence: 'high',
          }))
        : [
            {
              id: `manual-li-${Date.now()}`,
              name: merchantName,
              price: numAmount - numTax,
              category: selectedCategory,
              confidence: 'high',
            },
          ];

    setIsSaving(true);
    try {
      await addTransaction({
        merchant: merchantName,
        amount: numAmount,
        date: dateStr,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        category: selectedCategory as CategoryType,
        isAiScanned: false,
        confidence: 'high',
        tax: numTax,
        paymentMethod: paymentMethod,
        note: note.trim() || undefined,
        receiptImage: receiptImage || undefined,
        lineItems: finalLineItems,
      });
      router.back();
    } catch (e) {
      console.warn('Failed to save manual transaction:', e);
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  const activeSuggestions = QUICK_MERCHANTS[selectedCategory] || ['General Expense', 'Vendor Payment', 'Service Fee'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.title}>Manual Expense Entry</Text>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Check size={16} color="#002111" />
          <Text style={styles.saveBtnText}>{isSaving ? 'SAVING...' : 'RECORD'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Amount Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>EXPENSE AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amountText}>{amountStr}</Text>
          </View>

          {/* Quick Increment Pills */}
          <View style={styles.quickAddRow}>
            {[5, 10, 25, 50, 100].map((inc) => (
              <TouchableOpacity
                key={inc}
                style={styles.quickPill}
                onPress={() => handleQuickAdd(inc)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickPillText}>+${inc}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.clearPill} onPress={handleClear}>
              <Text style={styles.clearPillText}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selector with Vector Icons */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>EXPENSE CATEGORY</Text>
            <Text style={styles.selectedCatHint}>{selectedCategory}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {budgets.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(cat.name)}
                  activeOpacity={0.7}
                >
                  <CategoryIcon
                    name={cat.icon}
                    categoryName={cat.name}
                    size={16}
                    containerSize={28}
                    color={isSelected ? '#002111' : Colors.textPrimary}
                    style={[styles.chipIconContainer, isSelected && styles.chipIconSelected]}
                  />
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Payee / Merchant Input + Quick Suggestions */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardLabel}>PAYEE / MERCHANT</Text>
          <View style={styles.merchantInputBox}>
            <TextInput
              style={styles.merchantInput}
              placeholder="e.g. Blue Bottle, Uber, Apple, AWS..."
              placeholderTextColor={Colors.textMuted}
              value={merchant}
              onChangeText={setMerchant}
            />
            {merchant.length > 0 && (
              <TouchableOpacity onPress={() => setMerchant('')}>
                <X size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Merchant Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionScroll}
          >
            {activeSuggestions.map((sug) => (
              <TouchableOpacity
                key={sug}
                style={styles.sugChip}
                onPress={() => setMerchant(sug)}
                activeOpacity={0.7}
              >
                <Text style={styles.sugChipText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Itemized Line Items Breakdown Section */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.lineItemToggleHeader}
            onPress={() => setShowLineItems(!showLineItems)}
            activeOpacity={0.7}
          >
            <View style={styles.lineItemTitleRow}>
              <ListOrdered size={16} color={Colors.primaryLight} />
              <Text style={styles.sectionTitleText}>Itemized Line Items</Text>
              {lineItems.length > 0 && (
                <View style={styles.itemsCountBadge}>
                  <Text style={styles.itemsCountText}>{lineItems.length} items</Text>
                </View>
              )}
            </View>

            {showLineItems ? (
              <ChevronUp size={18} color={Colors.textMuted} />
            ) : (
              <ChevronDown size={18} color={Colors.textMuted} />
            )}
          </TouchableOpacity>

          {showLineItems && (
            <View style={styles.lineItemsContainer}>
              <Text style={styles.lineItemDesc}>
                Add specific products or services included in this expense:
              </Text>

              {/* Added Line Items List */}
              {lineItems.map((item, idx) => (
                <View key={item.id} style={styles.lineItemRow}>
                  <View style={styles.lineItemIndexBadge}>
                    <Text style={styles.lineItemIndexText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.lineItemNameText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.lineItemPriceText}>${parseFloat(item.price).toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.deleteLineItemBtn}
                    onPress={() => handleDeleteLineItem(item.id)}
                  >
                    <Trash2 size={15} color={Colors.rust} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add New Line Item Form */}
              <View style={styles.addItemForm}>
                <TextInput
                  style={styles.addItemNameInput}
                  placeholder="Item name (e.g. Oat Milk Latte)"
                  placeholderTextColor={Colors.textMuted}
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={styles.addItemPriceInput}
                  placeholder="$0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                />
                <TouchableOpacity
                  style={styles.addItemSubmitBtn}
                  onPress={handleAddLineItem}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color="#002111" />
                  <Text style={styles.addItemSubmitText}>ADD</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Advanced Institutional Details Accordion */}
        <TouchableOpacity
          style={styles.accordionToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
          activeOpacity={0.8}
        >
          <View style={styles.accordionLeft}>
            <FileText size={16} color={Colors.primaryLight} />
            <Text style={styles.accordionTitle}>
              {showAdvanced ? 'Hide Extended Details' : 'Add Tax, Payment Method, Photo & Memo'}
            </Text>
          </View>
          {showAdvanced ? (
            <ChevronUp size={18} color={Colors.textMuted} />
          ) : (
            <ChevronDown size={18} color={Colors.textMuted} />
          )}
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedWrapper}>
            {/* Payment Method */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardLabel}>PAYMENT METHOD</Text>
              <View style={styles.paymentMethodsGrid}>
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm;
                  return (
                    <TouchableOpacity
                      key={pm}
                      style={[styles.pmChip, isSelected && styles.pmChipSelected]}
                      onPress={() => setPaymentMethod(pm)}
                    >
                      <CreditCard size={13} color={isSelected ? '#002111' : Colors.textMuted} />
                      <Text style={[styles.pmText, isSelected && styles.pmTextSelected]}>{pm}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date & Tax */}
            <View style={styles.splitRow}>
              <View style={[styles.sectionCard, { flex: 1 }]}>
                <Text style={styles.cardLabel}>DATE</Text>
                <View style={styles.smallInputBox}>
                  <Calendar size={14} color={Colors.textMuted} />
                  <TextInput
                    style={styles.smallInput}
                    value={dateStr}
                    onChangeText={setDateStr}
                  />
                </View>
              </View>

              <View style={[styles.sectionCard, { flex: 1 }]}>
                <Text style={styles.cardLabel}>SALES TAX ($)</Text>
                <View style={styles.smallInputBox}>
                  <Percent size={14} color={Colors.textMuted} />
                  <TextInput
                    style={styles.smallInput}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={taxStr}
                    onChangeText={setTaxStr}
                  />
                </View>
              </View>
            </View>

            {/* Memo & Notes */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardLabel}>MEMO / INSTITUTIONAL NOTE</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g. Partner lunch, Q3 Client travel approval code..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={2}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Receipt Photo Attachment */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardLabel}>ATTACH RECEIPT (OPTIONAL)</Text>
              {receiptImage ? (
                <View style={styles.receiptPreviewBox}>
                  <Image source={{ uri: receiptImage }} style={styles.receiptThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.receiptThumbText}>Receipt Photo Attached</Text>
                    <TouchableOpacity onPress={() => setReceiptImage(null)}>
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.photoActionsRow}>
                  <TouchableOpacity style={styles.photoBtn} onPress={handleSnapPhoto}>
                    <Camera size={16} color={Colors.primaryLight} />
                    <Text style={styles.photoBtnText}>Snap Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.photoBtn} onPress={handleAttachPhoto}>
                    <ImageIcon size={16} color={Colors.textPrimary} />
                    <Text style={styles.photoBtnText}>Choose Library</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Financial Numeric Keypad */}
        <View style={styles.keypadWrapper}>
          <NumericKeypad onPressDigit={handleDigit} onDelete={handleDelete} onClear={handleClear} />
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
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: {
    padding: 18,
    gap: 14,
  },
  amountCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  amountLabel: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    marginRight: 2,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Menlo',
    letterSpacing: -1,
  },
  quickAddRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 4,
  },
  quickPill: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickPillText: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '600',
  },
  clearPill: {
    backgroundColor: Colors.rustMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.rust,
  },
  clearPillText: {
    color: Colors.rust,
    fontFamily: 'Menlo',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  selectedCatHint: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipIconContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  chipIconSelected: {
    backgroundColor: 'transparent',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryChipTextSelected: {
    color: '#002111',
    fontWeight: '700',
  },
  merchantInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 48,
  },
  merchantInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  sugChip: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sugChipText: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  lineItemToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemsCountBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemsCountText: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  lineItemsContainer: {
    gap: 8,
    marginTop: 4,
  },
  lineItemDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  lineItemIndexBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineItemIndexText: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  lineItemNameText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  lineItemPriceText: {
    fontSize: 13,
    fontFamily: 'Menlo',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deleteLineItemBtn: {
    padding: 4,
  },
  addItemForm: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  addItemNameInput: {
    flex: 2,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  addItemPriceInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Menlo',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  addItemSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addItemSubmitText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 11,
  },
  accordionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  advancedWrapper: {
    gap: 12,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pmChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pmChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pmText: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  pmTextSelected: {
    color: '#002111',
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 42,
    gap: 6,
  },
  smallInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Menlo',
  },
  noteInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    color: Colors.textPrimary,
    fontSize: 13,
    minHeight: 50,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  photoBtnText: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  receiptPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 10,
  },
  receiptThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  receiptThumbText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  removePhotoText: {
    fontSize: 11,
    color: Colors.rust,
    fontFamily: 'Menlo',
    marginTop: 2,
  },
  keypadWrapper: {
    marginTop: 4,
  },
});
