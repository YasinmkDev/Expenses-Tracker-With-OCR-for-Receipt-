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
          backgroundColor: '#0E1321',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        },
        headerTintColor: '#54E9A1',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: -0.5,
        },
        tabBarStyle: {
          backgroundColor: '#161B2A',
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2ECC87',
        tabBarInactiveTintColor: '#869489',
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          fontSize: 10,
          textTransform: 'uppercase',
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
