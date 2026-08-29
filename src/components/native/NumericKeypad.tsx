import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { Delete } from 'lucide-react-native';

interface NumericKeypadProps {
  onPressDigit: (digit: string) => void;
  onDelete: () => void;
  onClear?: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onPressDigit,
  onDelete,
}) => {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ];

  return (
    <View style={styles.grid}>
      {rows.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((key) => {
            const isDelete = key === '⌫';
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                style={styles.key}
                onPress={() => {
                  if (isDelete) {
                    onDelete();
                  } else {
                    onPressDigit(key);
                  }
                }}
              >
                {isDelete ? (
                  <Delete size={22} color={Colors.gold} />
                ) : (
                  <Text style={styles.keyText}>
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 8,
    width: '100%',
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  key: {
    flex: 1,
    height: 54,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Menlo',
    color: Colors.textPrimary,
  },
});
