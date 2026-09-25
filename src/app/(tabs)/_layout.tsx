import { Colors } from '@/constants/theme';
import { supabase } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { Redirect, Tabs } from 'expo-router';
import { Home, LineChart, Receipt, Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

export default function TabLayout() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      const guest = await SafeStorage.getItem('@ledger_guest_session');
      const session = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (active) setAuthorized(Boolean(session.data.session || guest === 'true'));
    }
    checkAccess();
    return () => { active = false; };
  }, []);

  if (authorized === false) return <Redirect href="/(auth)/login" />;
  if (authorized === null) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: Colors.mint,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: -0.5,
        },
        tabBarStyle: {
          backgroundColor: Colors.surfaceCard,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 2,
          height: Platform.OS === 'ios' ? 92 : 72,
          paddingBottom: Platform.OS === 'ios' ? 30 : 14,
          paddingTop: 10,
          shadowColor: Colors.primaryLight,
          shadowOpacity: 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -6 },
          elevation: 10,
        },
tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <LineChart size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
