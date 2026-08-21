import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Path, Rect, RadialGradient, Stop } from 'react-native-svg';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react-native';

interface DashboardHeroProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  formatRupiah: (val: number) => string;
}

export function DashboardHero({
  totalBalance,
  totalIncome,
  totalExpense,
  formatRupiah,
}: DashboardHeroProps) {
  return (
    <View style={styles.shadowWrapper}>
      <LinearGradient
        colors={['#004C29', '#00381e', '#090d16']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        {/* ── Soft Radial Blur Glows (Seamless Halus) ── */}
        <View style={styles.absoluteLayer} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              {/* Glow Kanan Atas */}
              <RadialGradient
                id="glow-top-right"
                cx="90%"
                cy="10%"
                rx="60%"
                ry="60%"
                fx="90%"
                fy="10%"
              >
                <Stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                <Stop offset="50%" stopColor="#10b981" stopOpacity="0.10" />
                <Stop offset="100%" stopColor="#004C29" stopOpacity="0" />
              </RadialGradient>

              {/* Glow Kiri Bawah */}
              <RadialGradient
                id="glow-bottom-left"
                cx="10%"
                cy="90%"
                rx="50%"
                ry="50%"
                fx="10%"
                fy="90%"
              >
                <Stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
                <Stop offset="60%" stopColor="#00381e" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#090d16" stopOpacity="0" />
              </RadialGradient>

              {/* Grid Pattern Kotak-Kotak Tipis */}
              <Pattern
                id="hero-grid-pattern"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <Path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.75"
                  strokeOpacity="0.07"
                />
              </Pattern>
            </Defs>

            {/* Render Glows */}
            <Rect width="100%" height="100%" fill="url(#glow-top-right)" />
            <Rect width="100%" height="100%" fill="url(#glow-bottom-left)" />

            {/* Render Grid Pattern */}
            <Rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
          </Svg>
        </View>

        {/* Card Content */}
        <View style={styles.heroCardContent}>
          {/* Badge Saldo Bersih */}
          <View style={styles.heroBadge}>
            <Sparkles size={12} color="#86efac" />
            <Text style={styles.heroBadgeText}>Saldo Bersih (Net Balance)</Text>
          </View>

          {/* Nominal Besar Saldo Bersih */}
          <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
            {formatRupiah(totalBalance)}
          </Text>

          {/* In / Out 2-Column Grid Bar */}
          <View style={styles.inOutContainer}>
            {/* Total Pemasukan */}
            <View style={styles.inOutCol}>
              <View style={styles.inOutLabelRow}>
                <View style={[styles.inOutIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.25)' }]}>
                  <TrendingUp size={13} color="#86efac" />
                </View>
                <Text style={styles.inOutLabel}>Total Pemasukan</Text>
              </View>
              <Text style={styles.inOutValGreen} numberOfLines={1} adjustsFontSizeToFit>
                {formatRupiah(totalIncome)}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.inOutDivider} />

            {/* Total Pengeluaran */}
            <View style={styles.inOutCol}>
              <View style={styles.inOutLabelRow}>
                <View style={[styles.inOutIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
                  <TrendingDown size={13} color="#fca5a5" />
                </View>
                <Text style={styles.inOutLabel}>Total Pengeluaran</Text>
              </View>
              <Text style={styles.inOutValRed} numberOfLines={1} adjustsFontSizeToFit>
                {formatRupiah(totalExpense)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginBottom: 14,
    borderRadius: 24,
    shadowColor: '#004C29',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#090d16',
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    position: 'relative',
  },
  absoluteLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroCardContent: {
    padding: 18,
    position: 'relative',
    zIndex: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  heroAmount: {
    fontSize: 27,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginVertical: 4,
  },
  inOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  inOutCol: {
    flex: 1,
  },
  inOutDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  inOutLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  inOutIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inOutLabel: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  inOutValGreen: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  inOutValRed: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
