import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  Utensils,
  ShoppingBag,
  Car,
  Laptop,
  HeartPulse,
  Plane,
  Zap,
  Coffee,
  Film,
  Fuel,
  Briefcase,
  Tag,
  Package,
  Wallet,
  CreditCard,
  Shield,
  Receipt,
  Sparkles,
  Building,
  GraduationCap,
  Home,
  Music,
  Tv,
  Gift,
  CircleDollarSign,
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export const ICON_OPTIONS = [
  { key: 'utensils', label: 'Dining', icon: Utensils },
  { key: 'coffee', label: 'Coffee & Cafe', icon: Coffee },
  { key: 'shopping-bag', label: 'Shopping', icon: ShoppingBag },
  { key: 'car', label: 'Transport', icon: Car },
  { key: 'fuel', label: 'Gas & Fuel', icon: Fuel },
  { key: 'laptop', label: 'Electronics & Tech', icon: Laptop },
  { key: 'heart-pulse', label: 'Health & Medical', icon: HeartPulse },
  { key: 'plane', label: 'Travel & Flights', icon: Plane },
  { key: 'zap', label: 'Utilities & Bills', icon: Zap },
  { key: 'film', label: 'Entertainment', icon: Film },
  { key: 'music', label: 'Music & Audio', icon: Music },
  { key: 'tv', label: 'Subscriptions', icon: Tv },
  { key: 'briefcase', label: 'Work & Capital', icon: Briefcase },
  { key: 'building', label: 'Housing & Rent', icon: Building },
  { key: 'graduation-cap', label: 'Education', icon: GraduationCap },
  { key: 'gift', label: 'Gifts & Perks', icon: Gift },
  { key: 'package', label: 'Logistics', icon: Package },
  { key: 'wallet', label: 'Treasury', icon: Wallet },
  { key: 'credit-card', label: 'Cards & Fees', icon: CreditCard },
  { key: 'circle-dollar-sign', label: 'Investments', icon: CircleDollarSign },
  { key: 'shield', label: 'Insurance', icon: Shield },
  { key: 'receipt', label: 'General Receipt', icon: Receipt },
  { key: 'sparkles', label: 'Custom', icon: Sparkles },
];

interface CategoryIconProps {
  name?: string;
  categoryName?: string;
  size?: number;
  color?: string;
  containerSize?: number;
  style?: ViewStyle;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  categoryName,
  size = 18,
  color = Colors.primaryLight,
  containerSize = 38,
  style,
}) => {
  // Determine icon component from name key or category fallback
  const normalizedKey = (name || '').toLowerCase().trim();
  const normalizedCat = (categoryName || '').toLowerCase().trim();

  let IconComponent = Utensils;

  const found = ICON_OPTIONS.find((opt) => opt.key === normalizedKey);
  if (found) {
    IconComponent = found.icon;
  } else {
    // Semantic match based on category name
    if (normalizedCat.includes('dining') || normalizedCat.includes('food') || normalizedCat.includes('restaurant')) {
      IconComponent = Utensils;
    } else if (normalizedCat.includes('coffee') || normalizedCat.includes('cafe')) {
      IconComponent = Coffee;
    } else if (normalizedCat.includes('groc') || normalizedCat.includes('market')) {
      IconComponent = ShoppingBag;
    } else if (normalizedCat.includes('shop') || normalizedCat.includes('cloth') || normalizedCat.includes('retail')) {
      IconComponent = Tag;
    } else if (normalizedCat.includes('trans') || normalizedCat.includes('car') || normalizedCat.includes('uber') || normalizedCat.includes('ride')) {
      IconComponent = Car;
    } else if (normalizedCat.includes('gas') || normalizedCat.includes('fuel')) {
      IconComponent = Fuel;
    } else if (normalizedCat.includes('elect') || normalizedCat.includes('tech') || normalizedCat.includes('device')) {
      IconComponent = Laptop;
    } else if (normalizedCat.includes('health') || normalizedCat.includes('med') || normalizedCat.includes('pharm')) {
      IconComponent = HeartPulse;
    } else if (normalizedCat.includes('travel') || normalizedCat.includes('flight') || normalizedCat.includes('hotel')) {
      IconComponent = Plane;
    } else if (normalizedCat.includes('util') || normalizedCat.includes('bill') || normalizedCat.includes('power')) {
      IconComponent = Zap;
    } else if (normalizedCat.includes('entertain') || normalizedCat.includes('movie') || normalizedCat.includes('cinema')) {
      IconComponent = Film;
    } else if (normalizedCat.includes('subscrip') || normalizedCat.includes('tv') || normalizedCat.includes('stream')) {
      IconComponent = Tv;
    } else if (normalizedCat.includes('edu') || normalizedCat.includes('school')) {
      IconComponent = GraduationCap;
    } else if (normalizedCat.includes('work') || normalizedCat.includes('biz')) {
      IconComponent = Briefcase;
    } else {
      IconComponent = Sparkles;
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 3,
        },
        style,
      ]}
    >
      <IconComponent size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
