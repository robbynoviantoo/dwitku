import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react-native';

interface FinancialCalendarProps {
  workspaceId: string;
  showAmount: boolean;
  formatRupiah: (val: number) => string;
}

export function FinancialCalendar({
  workspaceId,
  showAmount,
  formatRupiah,
}: FinancialCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{
    dateStr: string;
    dayNum: number;
    income: number;
    expense: number;
    net: number;
    items: any[];
  } | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  // Query Data Kalender Bulanan Lengkap (Semua Transaksi Termasuk yang Tanpa Dompet)
  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['mobile-calendar', workspaceId, currentYear, currentMonth + 1],
    queryFn: () =>
      apiRequest(
        `/reports/calendar?workspaceId=${workspaceId}&year=${currentYear}&month=${currentMonth + 1}`
      ),
    enabled: !!workspaceId,
  });

  const daysMap: Record<string, { income: number; expense: number; net: number; items: any[] }> =
    calendarData?.days || {};

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Hitung jumlah hari di bulan ini
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0: Min, 1: Sen
  let firstDayIndex = firstDayOfWeek - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const formatCompact = (num: number) => {
    if (!showAmount) return '•••';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'k';
    return num.toString();
  };

  return (
    <View style={styles.card}>
      {/* Header Kalender */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <CalendarIcon size={16} color="#004C29" />
          </View>
          <Text style={styles.cardTitle}>Financial Calendar</Text>
        </View>

        {/* Navigation & Month */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.todayBtn} onPress={handleToday} activeOpacity={0.7}>
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>

          <View style={styles.monthSelector}>
            <TouchableOpacity style={styles.chevronBtn} onPress={handlePrevMonth} activeOpacity={0.7}>
              <ChevronLeft size={14} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity style={styles.chevronBtn} onPress={handleNextMonth} activeOpacity={0.7}>
              <ChevronRight size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Day Name Header (MON - SUN) */}
      <View style={styles.gridHeader}>
        {dayNames.map((name, index) => (
          <View key={index} style={styles.headerCell}>
            <Text style={styles.headerCellText}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Grid Tanggal */}
      <View style={styles.gridBody}>
        {/* Cell Kosong Awal Bulan */}
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.emptyCell} />
        ))}

        {/* Cell Tanggal 1..totalDays */}
        {Array.from({ length: totalDays }).map((_, index) => {
          const dayNum = index + 1;
          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
            dayNum
          ).padStart(2, '0')}`;
          const dayData = daysMap[dateKey];
          const isToday = dateKey === todayStr;
          const hasTx = !!dayData && (dayData.income > 0 || dayData.expense > 0);
          const net = dayData ? dayData.net : 0;

          return (
            <TouchableOpacity
              key={dateKey}
              style={[
                styles.dayCell,
                isToday && styles.dayCellToday,
                hasTx && net > 0 && styles.dayCellSurplus,
                hasTx && net < 0 && styles.dayCellDeficit,
              ]}
              onPress={() => {
                if (dayData) {
                  setSelectedDay({
                    dateStr: dateKey,
                    dayNum,
                    income: dayData.income,
                    expense: dayData.expense,
                    net: dayData.net,
                    items: dayData.items,
                  });
                }
              }}
              activeOpacity={dayData ? 0.7 : 1}
            >
              <View style={styles.dayTopRow}>
                <Text style={[styles.dayNumberText, isToday && styles.todayNumberText]}>
                  {dayNum}
                </Text>
                {hasTx && (
                  <View style={styles.dotContainer}>
                    {dayData.income > 0 && <View style={[styles.flowDot, { backgroundColor: '#004C29' }]} />}
                    {dayData.expense > 0 && <View style={[styles.flowDot, { backgroundColor: '#dc2626' }]} />}
                  </View>
                )}
              </View>

              {hasTx ? (
                <View
                  style={[
                    styles.flowPill,
                    net > 0 ? styles.flowPillGreen : net < 0 ? styles.flowPillRed : styles.flowPillGray,
                  ]}
                >
                  <Text
                    style={[
                      styles.flowPillText,
                      net > 0 ? styles.flowPillTextGreen : net < 0 ? styles.flowPillTextRed : styles.flowPillTextGray,
                    ]}
                    numberOfLines={1}
                  >
                    {net > 0 ? '+' : net < 0 ? '-' : ''}
                    {formatCompact(Math.abs(net))}
                  </Text>
                </View>
              ) : (
                <View style={styles.flowPillPlaceholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal Popup Rincian Transaksi Tanggal Terpilih */}
      <Modal visible={!!selectedDay} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header Modal Rincian */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalDateTitle}>
                  Rincian {selectedDay?.dayNum} {monthNames[currentMonth]} {currentYear}
                </Text>
                <Text style={styles.modalTxCount}>
                  {selectedDay?.items.length || 0} Transaksi dicatat
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedDay(null)}
                activeOpacity={0.7}
              >
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Rekap Saldo Harian */}
            <View style={styles.modalSummaryRow}>
              <View style={styles.modalSummaryBox}>
                <View style={styles.flexRow}>
                  <TrendingUp size={12} color="#004C29" />
                  <Text style={styles.modalSummaryLabel}>Pemasukan</Text>
                </View>
                <Text style={styles.modalSummaryGreen}>
                  {formatRupiah(selectedDay?.income || 0)}
                </Text>
              </View>

              <View style={styles.modalSummaryBox}>
                <View style={styles.flexRow}>
                  <TrendingDown size={12} color="#dc2626" />
                  <Text style={styles.modalSummaryLabel}>Pengeluaran</Text>
                </View>
                <Text style={styles.modalSummaryRed}>
                  {formatRupiah(selectedDay?.expense || 0)}
                </Text>
              </View>
            </View>

            {/* List Transaksi Tanggal Tersebut */}
            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {selectedDay?.items.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const isTransfer = tx.type === 'TRANSFER';
                const amt = Number(tx.amount);

                return (
                  <View key={tx.id} style={styles.modalTxItem}>
                    <View
                      style={[
                        styles.modalTxIconBox,
                        isTransfer
                          ? { backgroundColor: '#eff6ff' }
                          : isIncome
                          ? { backgroundColor: '#f0fdf4' }
                          : { backgroundColor: '#fef2f2' },
                      ]}
                    >
                      {isTransfer ? (
                        <ArrowRightLeft size={16} color="#2563eb" />
                      ) : tx.category?.emoji ? (
                        <Text style={{ fontSize: 16 }}>{tx.category.emoji}</Text>
                      ) : isIncome ? (
                        <ArrowDownLeft size={16} color="#004C29" />
                      ) : (
                        <ArrowUpRight size={16} color="#dc2626" />
                      )}
                    </View>

                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.modalTxName} numberOfLines={1}>
                        {isTransfer
                          ? tx.note || `Transfer: ${tx.wallet?.name} ➔ ${tx.toWallet?.name}`
                          : tx.note || tx.category?.name || 'Transaksi'}
                      </Text>
                      <Text style={styles.modalTxDesc} numberOfLines={1}>
                        {tx.wallet?.name ? `Via ${tx.wallet.name}` : ''}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.modalTxAmt,
                        isTransfer
                          ? { color: '#2563eb' }
                          : isIncome
                          ? { color: '#004C29' }
                          : { color: '#dc2626' },
                      ]}
                    >
                      {isTransfer ? '' : isIncome ? '+' : '-'}
                      {formatRupiah(amt)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setSelectedDay(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#e6f3ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  todayBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 7,
  },
  todayBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2.5,
  },
  chevronBtn: {
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 4,
  },
  gridHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerCellText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.2,
  },
  gridBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: '14.28%',
    aspectRatio: 1.1,
  },
  dayCell: {
    width: '13.4%',
    marginHorizontal: '0.44%',
    aspectRatio: 1.05,
    padding: 3.5,
    borderRadius: 8,
    justifyContent: 'space-between',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  dayCellToday: {
    borderColor: '#004C29',
    borderWidth: 1.5,
    backgroundColor: '#e6f3ec',
  },
  dayCellSurplus: {
    borderColor: '#b2dec6',
    backgroundColor: '#e6f3ec',
  },
  dayCellDeficit: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  todayNumberText: {
    color: '#004C29',
    fontWeight: '900',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  flowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  flowPill: {
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    alignItems: 'center',
  },
  flowPillPlaceholder: {
    height: 12,
  },
  flowPillGreen: {
    backgroundColor: '#e6f3ec',
  },
  flowPillRed: {
    backgroundColor: '#fee2e2',
  },
  flowPillGray: {
    backgroundColor: '#f1f5f9',
  },
  flowPillText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  flowPillTextGreen: {
    color: '#004C29',
  },
  flowPillTextRed: {
    color: '#b91c1c',
  },
  flowPillTextGray: {
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalTxCount: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modalSummaryBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalSummaryLabel: {
    fontSize: 10.5,
    color: '#64748b',
  },
  modalSummaryGreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#004C29',
    marginTop: 2,
  },
  modalSummaryRed: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 2,
  },
  modalTxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTxIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTxName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalTxDesc: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 1,
  },
  modalTxAmt: {
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  modalDoneBtn: {
    backgroundColor: '#004C29',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalDoneText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: 'bold',
  },
});
