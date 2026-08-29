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
import { X, Check, Plus, Trash2, Sliders, Sparkles, DollarSign } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useLedgerStore } from '@/store/ledgerStore';
import { CategoryIcon, ICON_OPTIONS } from '@/components/native/CategoryIcon';
import { BudgetCategory } from '@/types';

export default function BudgetManagerModal() {
  const router = useRouter();
  const {
    budgets,
    monthlyLimit,
    updateMonthlyLimit,
    addCategory,
    deleteCategory,
    updateCategory,
  } = useLedgerStore();

  const [globalLimitStr, setGlobalLimitStr] = useState(monthlyLimit.toString());
  const [activeTab, setActiveTab] = useState<'manage' | 'create'>('manage');

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');

  // Edit Existing Category Modal / inline State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editBudgetVal, setEditBudgetVal] = useState('');

  const handleSaveGlobalLimit = async () => {
    const val = parseFloat(globalLimitStr);
    if (!val || val <= 0) {
      Alert.alert('Invalid Cap', 'Please enter a valid monthly budget limit.');
      return;
    }
    await updateMonthlyLimit(val);
    Alert.alert('Limit Updated', `Monthly spending limit set to $${val.toLocaleString()}.`);
  };

  const handleCreateCategory = async () => {
    const trimmedName = newCatName.trim();
    const budgetVal = parseFloat(newCatBudget);

    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a category name.');
      return;
    }
    if (!budgetVal || budgetVal <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid monthly allocation.');
      return;
    }

    await addCategory({
      name: trimmedName,
      budget: budgetVal,
      icon: selectedIcon,
      colorType: 'emerald',
    });

    setNewCatName('');
    setNewCatBudget('');
    setSelectedIcon('sparkles');
    setActiveTab('manage');
  };

  const handleDeleteCategory = (cat: BudgetCategory) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to remove "${cat.name}" cap?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(cat.id);
          },
        },
      ]
    );
  };

  const handleSaveEditBudget = async (id: string) => {
    const val = parseFloat(editBudgetVal);
    if (val && val > 0) {
      await updateCategory(id, { budget: val });
    }
    setEditingCatId(null);
    setEditBudgetVal('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.title}>Budget & Category Protocol</Text>

        <View style={{ width: 36 }} />
      </View>

      {/* Segmented Mode Switcher */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'manage' && styles.tabBtnActive]}
          onPress={() => setActiveTab('manage')}
        >
          <Sliders size={15} color={activeTab === 'manage' ? Colors.primaryLight : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>
            MANAGE CAPS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'create' && styles.tabBtnActive]}
          onPress={() => setActiveTab('create')}
        >
          <Plus size={15} color={activeTab === 'create' ? Colors.primaryLight : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            ADD NEW CATEGORY
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'manage' ? (
          <>
            {/* Global Monthly Limit Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>TOTAL INSTITUTIONAL LIMIT</Text>
              <Text style={styles.sectionDesc}>
                Sets the master monthly spending boundary across all sub-accounts.
              </Text>

              <View style={styles.inputRow}>
                <DollarSign size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  value={globalLimitStr}
                  onChangeText={setGlobalLimitStr}
                  keyboardType="numeric"
                  placeholder="e.g. 6500"
                  placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity style={styles.inlineSaveBtn} onPress={handleSaveGlobalLimit}>
                  <Check size={14} color="#002111" />
                  <Text style={styles.inlineSaveText}>APPLY</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Existing Categories List */}
            <View style={styles.categoriesHeader}>
              <Text style={styles.sectionTitle}>Category Caps ({budgets.length})</Text>
            </View>

            {budgets.map((cat) => {
              const isEditing = editingCatId === cat.id;

              return (
                <View key={cat.id} style={styles.catCard}>
                  <View style={styles.catInfoRow}>
                    <CategoryIcon name={cat.icon} categoryName={cat.name} size={18} containerSize={42} />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.catName}>{cat.name}</Text>
                      {isEditing ? (
                        <View style={styles.editRow}>
                          <TextInput
                            style={styles.editInput}
                            value={editBudgetVal}
                            onChangeText={setEditBudgetVal}
                            keyboardType="numeric"
                            placeholder={cat.budget.toString()}
                            placeholderTextColor={Colors.textMuted}
                            autoFocus
                          />
                          <TouchableOpacity
                            style={styles.confirmEditBtn}
                            onPress={() => handleSaveEditBudget(cat.id)}
                          >
                            <Check size={14} color="#002111" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text style={styles.catBudgetText}>
                          ${cat.budget.toLocaleString()} Monthly Limit
                        </Text>
                      )}
                    </View>

                    <View style={styles.catActions}>
                      {!isEditing && (
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => {
                            setEditingCatId(cat.id);
                            setEditBudgetVal(cat.budget.toString());
                          }}
                        >
                          <Text style={styles.editBtnText}>EDIT CAP</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteCategory(cat)}
                      >
                        <Trash2 size={16} color={Colors.rust} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          /* Create New Category View */
          <View style={styles.createWrapper}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>CATEGORY DETAILS</Text>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Category Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Cloud Infrastructure, Marketing"
                  placeholderTextColor={Colors.textMuted}
                  value={newCatName}
                  onChangeText={setNewCatName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Monthly Spending Limit ($)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 750"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={newCatBudget}
                  onChangeText={setNewCatBudget}
                />
              </View>
            </View>

            {/* Icon Picker Palette */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>SELECT VECTOR ICON</Text>
              <Text style={styles.sectionDesc}>Choose a professional Lucide icon for this category:</Text>

              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((opt) => {
                  const isSelected = selectedIcon === opt.key;
                  const IconComp = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.iconChip, isSelected && styles.iconChipSelected]}
                      onPress={() => setSelectedIcon(opt.key)}
                      activeOpacity={0.7}
                    >
                      <IconComp size={18} color={isSelected ? '#002111' : Colors.textPrimary} />
                      <Text style={[styles.iconLabel, isSelected && styles.iconLabelSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={handleCreateCategory}>
              <Sparkles size={18} color="#002111" />
              <Text style={styles.createBtnText}>SAVE & ACTIVATE CATEGORY</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabBtnActive: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 16,
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
  sectionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
    height: 48,
    marginTop: 4,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Menlo',
    fontWeight: '700',
  },
  inlineSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inlineSaveText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 11,
  },
  categoriesHeader: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  catInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  catBudgetText: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  editInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    color: Colors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    fontFamily: 'Menlo',
    width: 90,
  },
  confirmEditBtn: {
    backgroundColor: Colors.primary,
    padding: 6,
    borderRadius: 6,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  editBtnText: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
  createWrapper: {
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Menlo',
  },
  formInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  iconLabel: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  iconLabelSelected: {
    color: '#002111',
    fontWeight: '700',
  },
  createBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  createBtnText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
