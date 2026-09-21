import { TransactionItem } from '@/components/native/TransactionItem';
import { Colors } from '@/constants/theme';
import { BackendService } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { useLedgerStore } from '@/store/ledgerStore';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Camera, LogOut, Plus, ReceiptText, Sparkles, TrendingUp } from 'lucide-react-native';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const {
    transactions,
    totalMonthlySpend,
    monthlyLimit,
    percentUsed,
    daysRemaining,
    userProfile,
  } = useLedgerStore();

  const isUnderBudget = monthlyLimit >= totalMonthlySpend;
  const variance = Math.abs(monthlyLimit - totalMonthlySpend);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Leave this Ledger session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await BackendService.signOut();
          } finally {
            await SafeStorage.removeItem('@ledger_guest_session');
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.logoDot} />
              <Text style={styles.brandTitle}>LEDGER</Text>
            </View>
            <Text style={styles.subGreeting}>Welcome back, {userProfile.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <LogOut size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Master Spend Card */}
        <View style={styles.heroCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>TOTAL MONTHLY SPEND</Text>
              <View style={styles.amountRow}>
                <Text style={styles.mainSpend}>${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.maxSpend}> / ${monthlyLimit.toLocaleString()}</Text>
              </View>
            </View>
            <View style={[styles.usedBadge, percentUsed >= 90 && styles.usedBadgeAlert]}>
              <Text style={[styles.usedText, percentUsed >= 90 && styles.usedTextAlert]}>{percentUsed}% USED</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentUsed}%`,
                  backgroundColor: percentUsed >= 100 ? Colors.rust : percentUsed >= 80 ? Colors.gold : Colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerMuted}>{daysRemaining} Days Remaining</Text>
            <View style={styles.statusRow}>
              <TrendingUp size={12} color={isUnderBudget ? Colors.primary : Colors.rust} />
              <Text style={[styles.footerActive, !isUnderBudget && { color: Colors.rust }]}>
                {isUnderBudget ? `On Track (+$${variance.toFixed(0)} under)` : `Exceeded cap (-$${variance.toFixed(0)})`}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Action FABs */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionPrimary}
            activeOpacity={0.8}
            onPress={() => router.push('/(modal)/scanner')}
          >
            <Camera size={18} color="#002111" />
            <Text style={styles.actionPrimaryText}>SCAN RECEIPT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionSecondary}
            activeOpacity={0.8}
            onPress={() => router.push('/(modal)/add-manual')}
          >
            <Plus size={18} color={Colors.textPrimary} />
            <Text style={styles.actionSecondaryText}>MANUAL ENTRY</Text>
          </TouchableOpacity>
        </View>

        {/* AI Verified Banner */}
        <View style={styles.aiBanner}>
          <Sparkles size={16} color={Colors.primaryLight} />
          <Text style={styles.aiBannerText}>
            Vision OCR active • Instant line-item categorization & spend intelligence
          </Text>
        </View>

        {/* Recent Transactions Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {transactions.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.viewAllText}>VIEW ALL ({transactions.length}) →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <ReceiptText size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
            <Text style={styles.emptySub}>
              Scan your physical receipts or add manual expenses to initiate institutional tracking.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/(modal)/scanner')}
            >
              <Text style={styles.emptyActionText}>SCAN FIRST RECEIPT</Text>
              <ArrowUpRight size={14} color="#002111" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.txList}>
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem
                key={tx.id}
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
            ))}
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
  content: {
    padding: 20,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  signOutButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
    fontFamily: 'Menlo',
  },
  subGreeting: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    fontFamily: 'Menlo',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  heroCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  mainSpend: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Menlo',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  maxSpend: {
    fontSize: 16,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  usedBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  usedBadgeAlert: {
    backgroundColor: Colors.rustMuted,
    borderColor: Colors.rust,
  },
  usedText: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '700',
  },
  usedTextAlert: {
    color: Colors.rust,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMuted: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerActive: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionPrimaryText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  actionSecondaryText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'Menlo',
    fontSize: 12,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  aiBannerText: {
    flex: 1,
    color: Colors.primaryLight,
    fontSize: 12,
    fontFamily: 'Menlo',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  txList: {
    gap: 4,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    gap: 12,
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: 'Menlo',
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  emptyActionText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 11,
  },
});
