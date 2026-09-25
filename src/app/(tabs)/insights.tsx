import { CategoryIcon } from '@/components/native/CategoryIcon';
import { Colors } from '@/constants/theme';
import { useLedgerStore } from '@/store/ledgerStore';
import {
    BarChart3,
    Check,
    ChevronDown,
    ChevronUp,
    Flame,
    Sparkles,
    TrendingUp
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SEGMENT_COLORS = [
  Colors.primary,
  Colors.rust,
  Colors.primaryLight,
  '#7D70D8',
  '#68CBEA',
  '#F2B84B',
  '#FF8BCB',
  Colors.textMuted,
];

export default function InsightsScreen() {
  const [timeframe, setTimeframe] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { transactions, computedBudgets, monthlyLimit } =
    useLedgerStore();

  // 1. Use calendar periods so the selector changes the actual reporting window.
  const periodRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (timeframe === 'Week') {
      const daysFromMonday = (now.getDay() + 6) % 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
    } else if (timeframe === 'Month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return { start: start.getTime(), end: now.getTime() };
  }, [timeframe]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const createdAt = transaction.createdAt || 0;
      return createdAt >= periodRange.start && createdAt <= periodRange.end;
    });
  }, [transactions, periodRange]);

  const totalPeriodSpend = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions]);
  const periodDays = Math.max(1, Math.ceil((periodRange.end - periodRange.start) / (24 * 60 * 60 * 1000)) + 1);
  const periodAverageSpend = totalPeriodSpend / periodDays;

  // 2. Bucket the selected period into daily, monthly, or yearly points.
  const periodChartData = useMemo(() => {
    const now = new Date();
    const result: { label: string; date: string; spend: number; txCount: number }[] = [];
    const bucketCount = timeframe === 'Week' ? 7 : timeframe === 'Month' ? Math.ceil(now.getDate() / 7) : 12;

    for (let index = 0; index < bucketCount; index += 1) {
      let bucketStart: Date;
      let bucketEnd: Date;
      if (timeframe === 'Year') {
        bucketStart = new Date(now.getFullYear(), index, 1);
        bucketEnd = new Date(now.getFullYear(), index + 1, 1);
      } else if (timeframe === 'Month') {
        bucketStart = new Date(now.getFullYear(), now.getMonth(), index * 7 + 1);
        bucketEnd = new Date(now.getFullYear(), now.getMonth(), index * 7 + 8);
      } else {
        const dayOffset = timeframe === 'Week'
          ? index - ((now.getDay() + 6) % 7)
          : index;
        bucketStart = new Date(now.getFullYear(), now.getMonth(), timeframe === 'Week' ? now.getDate() + dayOffset : dayOffset + 1);
        bucketEnd = new Date(bucketStart.getFullYear(), bucketStart.getMonth(), bucketStart.getDate() + 1);
      }
      const bucketStartTime = bucketStart.getTime();
      const bucketEndTime = bucketEnd.getTime();
      const bucketTransactions = filteredTransactions.filter((transaction) => {
        const createdAt = transaction.createdAt || 0;
        return createdAt >= bucketStartTime && createdAt < bucketEndTime;
      });
      const bucketSpend = bucketTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      result.push({
        label: timeframe === 'Year'
          ? bucketStart.toLocaleDateString('en-US', { month: 'short' })
          : timeframe === 'Month'
          ? `W${index + 1}`
          : bucketStart.toLocaleDateString('en-US', { weekday: 'short' }),
        date: timeframe === 'Year'
          ? bucketStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : timeframe === 'Month'
          ? `${bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(Math.min(bucketEnd.getTime() - 1, new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spend: Math.round(bucketSpend * 100) / 100,
        txCount: bucketTransactions.length,
      });
    }

    const maxSpend = Math.max(...result.map((r) => r.spend), 1);
    return { data: result, maxSpend };
  }, [filteredTransactions, timeframe]);

  // 3. Category Allocation Weights & Ranking
  const enrichedCategories = useMemo(() => {
    const periodCategorySpend = filteredTransactions.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + (transaction.amount || 0);
      return totals;
    }, {});
    return computedBudgets.map((cat, idx) => {
      const periodSpent = periodCategorySpend[cat.name] || 0;
      const pctOfCap = Math.min(100, Math.round((cat.spent / (cat.budget || 1)) * 100));
      const shareOfTotal =
        totalPeriodSpend > 0 ? Math.round((periodSpent / totalPeriodSpend) * 100) : 0;
      const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];

      let velocityStatus: 'critical' | 'warning' | 'optimal' = 'optimal';
      if (pctOfCap >= 100) velocityStatus = 'critical';
      else if (pctOfCap >= 75) velocityStatus = 'warning';

      return {
        ...cat,
        spent: Math.round(periodSpent * 100) / 100,
        pctOfCap,
        shareOfTotal,
        color,
        velocityStatus,
      };
    }).sort((a, b) => b.spent - a.spent);
  }, [computedBudgets, filteredTransactions, totalPeriodSpend]);

  // Active highlighted category for the detail lens
  const activeCategory = useMemo(() => {
    if (selectedCategoryId) {
      const found = enrichedCategories.find((c) => c.id === selectedCategoryId);
      if (found) return found;
    }
    return enrichedCategories[0] || null;
  }, [selectedCategoryId, enrichedCategories]);

  // Projected End-of-Month Run
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthlyTotal = Math.round(periodAverageSpend * daysInMonth);
  const projectedSurplus = monthlyLimit - projectedMonthlyTotal;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AI Insights</Text>
            <Text style={styles.subtitle}>Algorithmic Spend Intelligence</Text>
          </View>
        </View>

        {/* Timeframe Switcher */}
        <View style={styles.segmentedControl}>
          {(['Week', 'Month', 'Year'] as const).map((tf) => {
            const isSelected = timeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                onPress={() => {
                  setTimeframe(tf);
                  setSelectedBarIdx(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>{tf}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Spend Velocity Histogram Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartHeaderLeft}>
              <BarChart3 size={18} color={Colors.primaryLight} />
              <View>
                <Text style={styles.chartTitle}>Spend Distribution Histogram</Text>
                <Text style={styles.chartSubtitle}>
                  {selectedBarIdx !== null
                    ? `${periodChartData.data[selectedBarIdx].date}: $${periodChartData.data[selectedBarIdx].spend.toFixed(2)} (${periodChartData.data[selectedBarIdx].txCount} txs)`
                    : `${timeframe} Volume: $${totalPeriodSpend.toFixed(2)}`}
                </Text>
              </View>
            </View>

            <View style={styles.chartBadge}>
              <Sparkles size={12} color={Colors.primaryLight} />
              <Text style={styles.chartBadgeText}>LIVE METRICS</Text>
            </View>
          </View>

          {/* Bar Chart Visualization */}
          <View style={styles.barsContainer}>
            {periodChartData.data.map((item, idx) => {
              const heightPct = Math.max(8, Math.min(100, Math.round((item.spend / periodChartData.maxSpend) * 100)));
              const isSelected = selectedBarIdx === idx;
              const isMax = item.spend === periodChartData.maxSpend && item.spend > 0;

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.barColumn}
                  onPress={() => setSelectedBarIdx(selectedBarIdx === idx ? null : idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: isSelected
                            ? Colors.primaryLight
                            : isMax
                            ? Colors.primary
                            : Colors.surfaceHighlight,
                          borderColor: isSelected ? Colors.primaryLight : 'transparent',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, (isSelected || isMax) && styles.barLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Chart Summary Footer */}
          <View style={styles.chartFooter}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>{timeframe === 'Year' ? 'MONTHLY AVERAGE' : timeframe === 'Month' ? 'WEEKLY AVERAGE' : 'DAILY AVERAGE'}</Text>
              <Text style={styles.chartStatValue}>${(totalPeriodSpend / periodChartData.data.length).toFixed(2)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>PEAK VOLUME</Text>
              <Text style={styles.chartStatValue}>${periodChartData.maxSpend.toFixed(2)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>RECORDED ENTRIES</Text>
              <Text style={styles.chartStatValue}>{filteredTransactions.length}</Text>
            </View>
          </View>
        </View>

        {/* Forecast Runway & Burn Rate Matrix */}
        <View style={styles.matrixRow}>
          <View style={styles.matrixCard}>
            <View style={styles.matrixIconRow}>
              <Flame size={18} color={Colors.primaryLight} />
              <Text style={styles.matrixBadge}>CURRENT PACE</Text>
            </View>
            <Text style={styles.matrixLabel}>DAILY BURN RATE</Text>
            <Text style={styles.matrixValue}>${periodAverageSpend.toFixed(2)}/day</Text>
            <Text style={styles.matrixSub}>Based on the selected {timeframe.toLowerCase()} period</Text>
          </View>

          <View style={styles.matrixCard}>
            <View style={styles.matrixIconRow}>
              <TrendingUp size={18} color={projectedSurplus >= 0 ? Colors.primary : Colors.rust} />
              <Text
                style={[
                  styles.matrixBadge,
                  projectedSurplus < 0 && { color: Colors.rust, borderColor: Colors.rust },
                ]}
              >
                {projectedSurplus >= 0 ? 'ON TARGET' : 'OVER CAP'}
              </Text>
            </View>
            <Text style={styles.matrixLabel}>END-OF-MONTH FORECAST</Text>
            <Text style={styles.matrixValue}>${projectedMonthlyTotal.toLocaleString()}</Text>
            <Text style={styles.matrixSub}>
              {projectedSurplus >= 0
                ? `+$${projectedSurplus.toLocaleString()} buffer remaining`
                : `-$${Math.abs(projectedSurplus).toLocaleString()} projected deficit`}
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Velocity & Weight Matrix</Text>
          <Text style={styles.sectionSub}>Interactive Portfolio Allocation</Text>
        </View>

        {/* Proportional Multi-Segment Allocation Ribbon Bar */}
        <View style={styles.ribbonCard}>
          <View style={styles.ribbonHeader}>
            <Text style={styles.ribbonTitle}>PORTFOLIO OUTFLOW PROPORTION</Text>
            <Text style={styles.ribbonSpend}>${totalPeriodSpend.toLocaleString()} Total</Text>
          </View>

          {/* Continuous Multi-Color Ribbon */}
          <View style={styles.ribbonTrack}>
            {enrichedCategories.map((cat) => {
              const flexVal = Math.max(1, cat.shareOfTotal || (cat.spent > 0 ? 5 : 0));
              if (cat.spent <= 0 && totalPeriodSpend > 0) return null;
              const isSelected = activeCategory?.id === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.ribbonSegment,
                    {
                      flex: flexVal,
                      backgroundColor: cat.color,
                      opacity: isSelected ? 1 : 0.75,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setIsDropdownOpen(false);
                  }}
                  activeOpacity={0.8}
                />
              );
            })}
          </View>
        </View>

        {/* Deep-Dive Intelligence Lens Card with Dedicated Dropdown Selector */}
        {activeCategory && (
          <View style={[styles.lensCard, { borderColor: activeCategory.color }]}>
            {/* Focus Card Header */}
            <View style={styles.lensTopRow}>
              <Text style={styles.lensTopLabel}>CATEGORY AUDIT & FOCUS</Text>
              <View
                style={[
                  styles.velocityBadge,
                  activeCategory.velocityStatus === 'critical'
                    ? styles.badgeCritical
                    : activeCategory.velocityStatus === 'warning'
                    ? styles.badgeWarning
                    : styles.badgeOptimal,
                ]}
              >
                <Text
                  style={[
                    styles.velocityBadgeText,
                    activeCategory.velocityStatus === 'critical'
                      ? styles.textCritical
                      : activeCategory.velocityStatus === 'warning'
                      ? styles.textWarning
                      : styles.textOptimal,
                  ]}
                >
                  {activeCategory.velocityStatus === 'critical'
                    ? 'OVER CAP'
                    : activeCategory.velocityStatus === 'warning'
                    ? 'HIGH BURN'
                    : 'ON TRACK'}
                </Text>
              </View>
            </View>

            {/* Dedicated Dropdown Select Box (Closed by Default) */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.dropdownSelectBox,
                  isDropdownOpen && styles.dropdownSelectBoxOpen,
                ]}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownSelectedLeft}>
                  <CategoryIcon
                    name={activeCategory.icon}
                    categoryName={activeCategory.name}
                    color={activeCategory.color}
                    size={16}
                    containerSize={32}
                  />
                  <View>
                    <Text style={styles.dropdownSelectedName}>{activeCategory.name}</Text>
                    <Text style={styles.dropdownSelectedMeta}>
                      ${activeCategory.spent.toFixed(0)} spent • {activeCategory.shareOfTotal}% portfolio share
                    </Text>
                  </View>
                </View>

                {isDropdownOpen ? (
                  <ChevronUp size={18} color={Colors.primaryLight} />
                ) : (
                  <ChevronDown size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>

              {/* Expandable Dropdown List */}
              {isDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  <Text style={styles.dropdownMenuHeader}>CHOOSE CATEGORY TO AUDIT</Text>
                  <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {enrichedCategories.map((cat) => {
                      const isSelected = activeCategory.id === cat.id;

                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            setSelectedCategoryId(cat.id);
                            setIsDropdownOpen(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownItemLeft}>
                            <CategoryIcon
                              name={cat.icon}
                              categoryName={cat.name}
                              color={cat.color}
                              size={14}
                              containerSize={28}
                            />
                            <Text style={[styles.dropdownItemName, isSelected && styles.dropdownItemNameActive]}>
                              {cat.name}
                            </Text>
                          </View>

                          <View style={styles.dropdownItemRight}>
                            <Text style={styles.dropdownItemSpend}>${cat.spent.toFixed(0)}</Text>
                            <Text style={styles.dropdownItemShare}>({cat.shareOfTotal}%)</Text>
                            {isSelected && <Check size={14} color={Colors.primaryLight} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Metrics Row */}
            <View style={styles.lensMetricsRow}>
              <View style={styles.lensMetric}>
                <Text style={styles.lensMetricLabel}>CONSUMED</Text>
                <Text style={[styles.lensMetricVal, { color: activeCategory.color }]}>
                  ${activeCategory.spent.toFixed(2)}
                </Text>
              </View>
              <View style={styles.lensMetric}>
                <Text style={styles.lensMetricLabel}>ALLOCATED CAP</Text>
                <Text style={styles.lensMetricVal}>${activeCategory.budget.toLocaleString()}</Text>
              </View>
              <View style={styles.lensMetric}>
                <Text style={styles.lensMetricLabel}>CAPACITY USED</Text>
                <Text style={styles.lensMetricVal}>{activeCategory.pctOfCap}%</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.lensProgressBar}>
              <View
                style={[
                  styles.lensProgressFill,
                  {
                    width: `${activeCategory.pctOfCap}%`,
                    backgroundColor: activeCategory.color,
                  },
                ]}
              />
            </View>
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
    padding: 18,
    gap: 16,
  },
  header: {
    paddingVertical: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chartSubtitle: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    marginTop: 2,
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartBadgeText: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 9,
    fontWeight: '700',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: 22,
    height: 100,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  barLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  chartStat: {
    alignItems: 'center',
    flex: 1,
  },
  chartStatLabel: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  chartStatValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Menlo',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderLight,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 12,
  },
  matrixCard: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  matrixIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matrixBadge: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  matrixLabel: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  matrixValue: {
    fontSize: 20,
    fontFamily: 'Menlo',
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  matrixSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Menlo',
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    marginTop: 2,
  },
  ribbonCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  ribbonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ribbonTitle: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  ribbonSpend: {
    fontSize: 12,
    fontFamily: 'Menlo',
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  ribbonTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
    gap: 2,
  },
  ribbonSegment: {
    height: '100%',
    borderRadius: 2,
  },
  lensCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  lensTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lensTopLabel: {
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 1,
    fontWeight: '700',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 20,
  },
  dropdownSelectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dropdownSelectBoxOpen: {
    borderColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownSelectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownSelectedName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dropdownSelectedMeta: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    marginTop: 2,
  },
  velocityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCritical: {
    backgroundColor: Colors.rustMuted,
    borderWidth: 1,
    borderColor: Colors.rust,
  },
  badgeWarning: {
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  badgeOptimal: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  velocityBadgeText: {
    fontSize: 9,
    fontFamily: 'Menlo',
    fontWeight: '700',
  },
  textCritical: { color: Colors.rust },
  textWarning: { color: Colors.gold },
  textOptimal: { color: Colors.primaryLight },
  dropdownMenu: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: 4,
  },
  dropdownMenuHeader: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(46, 204, 135, 0.12)',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownItemName: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  dropdownItemNameActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  dropdownItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownItemSpend: {
    fontSize: 12,
    fontFamily: 'Menlo',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dropdownItemShare: {
    fontSize: 11,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
  },
  lensMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
  },
  lensMetric: {
    alignItems: 'center',
    flex: 1,
  },
  lensMetricLabel: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  lensMetricVal: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Menlo',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  lensProgressBar: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  lensProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
