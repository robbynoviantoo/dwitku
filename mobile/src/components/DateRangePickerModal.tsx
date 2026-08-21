import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react-native';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface DateRangePickerModalProps {
  visible: boolean;
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAYS_SHORT = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

export function DateRangePickerModal({
  visible,
  value,
  onChange,
  onClose,
}: DateRangePickerModalProps) {
  const initialDate = value.startDate
    ? new Date(value.startDate + 'T00:00:00')
    : new Date();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectingStart, setSelectingStart] = useState<string | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatLocalDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleQuickSelect = (
    type: 'thisMonth' | 'lastMonth' | 'thisYear' | 'allTime' | 'thisWeek'
  ) => {
    const now = new Date();
    if (type === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onChange({
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
      });
    } else if (type === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      onChange({
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
      });
    } else if (type === 'thisYear') {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      onChange({
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
      });
    } else if (type === 'thisWeek') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      const end = new Date(now.setDate(diff + 6));
      onChange({
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
      });
    } else if (type === 'allTime') {
      onChange({ startDate: '', endDate: '' });
    }
    setSelectingStart(null);
    onClose();
  };

  const handleDateClick = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const clickedDate = `${viewYear}-${mm}-${dd}`;

    if (!selectingStart) {
      setSelectingStart(clickedDate);
    } else {
      if (clickedDate < selectingStart) {
        onChange({ startDate: clickedDate, endDate: selectingStart });
      } else {
        onChange({ startDate: selectingStart, endDate: clickedDate });
      }
      setSelectingStart(null);
      onClose();
    }
  };

  const isDateSelected = (dayDate: string) => {
    if (selectingStart) {
      return dayDate === selectingStart;
    }
    return dayDate === value.startDate || dayDate === value.endDate;
  };

  const isDateInRange = (dayDate: string) => {
    const start = selectingStart || value.startDate;
    const end = selectingStart ? null : value.endDate;
    if (!start || !end) return false;
    return dayDate >= start && dayDate <= end;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerCard}>
          {/* Quick Select Buttons Grid (1:1 with Web) */}
          <View style={styles.quickGrid}>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => handleQuickSelect('thisMonth')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => handleQuickSelect('lastMonth')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>Last Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => handleQuickSelect('thisYear')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>This Year</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickRow}>
              <TouchableOpacity
                style={[styles.quickBtn, { flex: 1 }]}
                onPress={() => handleQuickSelect('thisWeek')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>This Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBtn, { flex: 1.5, flexDirection: 'row', gap: 4 }]}
                onPress={() => handleQuickSelect('allTime')}
                activeOpacity={0.7}
              >
                <RotateCcw size={12} color="#475569" />
                <Text style={styles.quickBtnText}>All Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Month Header Navigation */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
              <ChevronLeft size={18} color="#334155" />
            </TouchableOpacity>
            <Text style={styles.monthNavTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
              <ChevronRight size={18} color="#334155" />
            </TouchableOpacity>
          </View>

          {/* Days Header */}
          <View style={styles.daysHeaderRow}>
            {DAYS_SHORT.map((d, i) => (
              <Text key={i} style={styles.dayHeaderText}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar Day Grid */}
          <View style={styles.calendarGrid}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={idx} style={styles.dayCellEmpty} />;
              }

              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const dateStr = `${viewYear}-${mm}-${dd}`;

              const selected = isDateSelected(dateStr);
              const inRange = isDateInRange(dateStr);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    inRange && styles.dayCellInRange,
                    selected && styles.dayCellSelected,
                  ]}
                  onPress={() => handleDateClick(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      inRange && styles.dayTextInRange,
                      selected && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Helper Hint Footer */}
          <View style={styles.hintFooter}>
            <Text style={styles.hintText}>
              {selectingStart
                ? 'Klik tanggal kedua untuk menyelesaikan rentang'
                : 'Click start and end date to select date range'}
            </Text>
          </View>

          {/* Close Action */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickGrid: {
    gap: 6,
    marginBottom: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 8,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  monthNavTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 38,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayCellInRange: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderRadius: 0,
  },
  dayCellSelected: {
    backgroundColor: '#004C29',
    borderRadius: 10,
  },
  dayText: {
    fontSize: 12.5,
    color: '#1e293b',
    fontWeight: '500',
  },
  dayTextInRange: {
    color: '#004C29',
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  hintFooter: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 10.5,
    color: '#94a3b8',
  },
  closeBtn: {
    alignItems: 'center',
    paddingTop: 12,
  },
  closeBtnText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#64748b',
  },
});
