import { Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { LineItem } from '../../types';

interface LineItemRowProps {
  item: LineItem;
  onDelete?: () => void;
  onUpdate?: (updatedItem: Partial<LineItem>) => void;
}

export const LineItemRow: React.FC<LineItemRowProps> = ({ item, onDelete, onUpdate }) => {
  const [name, setName] = useState(item.name);
  const [priceStr, setPriceStr] = useState(item.price.toString());

  const handleNameChange = (val: string) => {
    setName(val);
    if (onUpdate) {
      onUpdate({ name: val });
    }
  };

  const handlePriceChange = (val: string) => {
    setPriceStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && onUpdate) {
      onUpdate({ price: num });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainInfo}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={handleNameChange}
          multiline
          numberOfLines={2}
          scrollEnabled={false}
          textAlignVertical="top"
          placeholder="Item description"
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.category}>{item.category || 'General'}</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.priceInputBox}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={priceStr}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.delBtn} activeOpacity={0.7}>
            <Trash2 size={15} color={Colors.rust} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
    gap: 8,
  },
  mainInfo: {
    flex: 1,
    gap: 2,
  },
  nameInput: {
    width: '100%',
    minHeight: 40,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 2,
  },
  category: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  currencyPrefix: {
    fontSize: 13,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  priceInput: {
    fontSize: 13,
    fontFamily: 'Menlo',
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 50,
    textAlign: 'right',
    paddingVertical: 0,
  },
  delBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceCard,
  },
});
