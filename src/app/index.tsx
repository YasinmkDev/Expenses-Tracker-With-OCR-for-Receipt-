import { Colors } from '@/constants/theme';
import { supabase } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function resolveEntry() {
      const guest = await SafeStorage.getItem('@ledger_guest_session');
      const session = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (active) setDestination(session.data.session || guest === 'true' ? '/(tabs)' : '/(auth)/login');
    }
    resolveEntry();
    return () => { active = false; };
  }, []);

  if (!destination) {
    return <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={Colors.primary} /></View>;
  }
  return <Redirect href={destination as '/(tabs)' | '/(auth)/login'} />;
}
