import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { X, Scale, Shield, AlertOctagon, Lock, AlertTriangle, UserCheck, Globe, CheckCircle2 } from 'lucide-react-native';

interface LegalModalProps {
  visible: boolean;
  type: 'terms' | 'privacy';
  onClose: () => void;
}

export function LegalModal({ visible, type, onClose }: LegalModalProps) {
  const isTerms = type === 'terms';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header Modal */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            {isTerms ? (
              <Scale size={20} color="#16a34a" />
            ) : (
              <Shield size={20} color="#16a34a" />
            )}
            <Text style={styles.headerTitle}>
              {isTerms ? 'Syarat & Ketentuan Layanan' : 'Kebijakan Privasi'}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color="#3f3f46" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Badge UU / Binding Agreement */}
          <View style={styles.badgeRow}>
            <View style={isTerms ? styles.blueBadge : styles.greenBadge}>
              <Text style={isTerms ? styles.blueBadgeText : styles.greenBadgeText}>
                {isTerms ? '⚖️ Perjanjian Hukum yang Mengikat' : '🛡️ Kepatuhan UU PDP No. 27/2022'}
              </Text>
            </View>
          </View>

          <Text style={styles.mainTitle}>
            {isTerms ? 'Syarat & Ketentuan Layanan' : 'Kebijakan Privasi Dwitku'}
          </Text>
          <Text style={styles.lastUpdated}>Terakhir diperbarui: 20 Agustus 2026</Text>

          {isTerms ? (
            /* =========================================================================
               KONTEN LENGKAP TERMS OF SERVICE (1:1 DENGAN WEB terms/page.tsx)
               ========================================================================= */
            <>
              {/* Callout Box Amber */}
              <View style={styles.calloutAmber}>
                <View style={styles.calloutHeaderRow}>
                  <AlertOctagon size={18} color="#b45309" />
                  <Text style={styles.calloutAmberTitle}>
                    RINGKASAN PENTING & SANGGAHAN HUKUM (DISCLAIMER):
                  </Text>
                </View>
                <Text style={styles.calloutAmberText}>
                  Dwitku adalah <Text style={styles.boldText}>perangkat lunak alat bantu pencatatan administrasi pembukuan mandiri (bookkeeping software)</Text>, <Text style={styles.boldText}>BUKAN</Text> bank, lembaga keuangan berizin, penyedia jasa pembayaran (PJP), penasihat keuangan (financial advisor), atau pengelola investasi.
                </Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • Dwitku <Text style={styles.boldText}>TIDAK MENYIMPAN</Text>, memegang, atau memindahkan uang fisik/dana riil nasabah. Seluruh saldo di aplikasi adalah angka kalkulasi pembukuan yang diinput oleh pengguna.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Segala keputusan finansial, perpajakan, audit, atau investasi yang Anda ambil sepenuhnya adalah risiko dan tanggung jawab Anda sendiri.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Penyedia layanan dibebaskan dari segala tuntutan hukum atau gugatan ganti rugi terkait selisih pencatatan, sengketa antar anggota tim, maupun kegagalan teknis di luar kendali wajar kami.
                  </Text>
                </View>
              </View>

              {/* Pasal 1 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.numberBox}><Text style={styles.numberBoxText}>1</Text></View>
                  <Text style={styles.sectionHeading}>Penerimaan & Keberlakuan Syarat Ketentuan</Text>
                </View>
                <Text style={styles.paragraph}>
                  Dengan membuat akun, mengakses, atau menggunakan aplikasi web maupun integrasi bot Telegram Dwitku (&quot;Layanan&quot;), Anda menyatakan bahwa Anda telah berusia minimal 18 tahun (atau cakap hukum menurut undang-undang yang berlaku), telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh seluruh Syarat dan Ketentuan ini.
                </Text>
                <Text style={styles.paragraph}>
                  Jika Anda tidak menyetujui salah satu bagian dari Ketentuan ini, Anda diwajibkan untuk segera menghentikan penggunaan Layanan dan menghapus akun Anda.
                </Text>
              </View>

              {/* Pasal 2 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.numberBox}><Text style={styles.numberBoxText}>2</Text></View>
                  <Text style={styles.sectionHeading}>Sanggahan Utama: Status Non-Lembaga Keuangan</Text>
                </View>
                <Text style={styles.paragraph}>
                  Pengguna secara tegas memahami dan mengakui bahwa:
                </Text>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>A. Fungsi Perangkat Lunak Administrasi</Text>
                  <Text style={styles.cardBoxText}>
                    Dwitku hanyalah antarmuka perangkat lunak untuk membantu mencatat arus kas, mengelompokkan kategori, dan menyajikan rekap laporan dari angka-angka yang dimasukkan secara sukarela oleh pengguna.
                  </Text>
                </View>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>B. Bukan Lembaga Perbankan / Bukan PJP</Text>
                  <Text style={styles.cardBoxText}>
                    Dwitku bukan bank, bukan penerbit uang elektronik, dan bukan penyelenggara transfer dana riil.
                  </Text>
                </View>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>C. Bukan Nasihat Keuangan Profesional</Text>
                  <Text style={styles.cardBoxText}>
                    Informasi atau kalkulasi yang dihasilkan oleh Dwitku tidak boleh dianggap sebagai nasihat perpajakan, audit resmi, atau rekomendasi investasi profesional.
                  </Text>
                </View>
              </View>

              {/* Pasal 3 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.numberBox}><Text style={styles.numberBoxText}>3</Text></View>
                  <Text style={styles.sectionHeading}>Tanggung Jawab Pengguna & Jaminan Larangan Akses Operator</Text>
                </View>
                <Text style={styles.paragraph}>
                  • <Text style={styles.boldText}>Larangan Akses oleh Admin/Operator:</Text> Pengembang dan staf admin Dwitku TIDAK MEMPUNYAI HAK dan TIDAK AKAN PERNAH melihat, membaca, atau memantau transaksi keuangan pribadi, saldo dompet, atau nominal pengeluaran Anda. Fungsi admin murni dibatasi untuk pemeliharaan server dan status langganan akun.
                </Text>
                <Text style={styles.paragraph}>
                  • <Text style={styles.boldText}>Integritas Input Data:</Text> Keakuratan laporan keuangan di Dwitku 100% bergantung pada kebenaran data nominal, tanggal, dompet, dan kategori yang dimasukkan oleh Anda atau anggota workspace Anda.
                </Text>
                <Text style={styles.paragraph}>
                  • <Text style={styles.boldText}>Kemandirian Keputusan:</Text> Pengguna bertanggung jawab penuh atas segala tindakan, pengeluaran, pembayaran pajak, pinjaman, investasi, atau keputusan bisnis apa pun yang diambil berdasarkan data yang tercatat di Dwitku.
                </Text>
              </View>

              {/* Pasal 4 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.numberBox}><Text style={styles.numberBoxText}>4</Text></View>
                  <Text style={styles.sectionHeading}>Batasan Tanggung Jawab & Klausul &quot;SEBAGAIMANA ADANYA&quot;</Text>
                </View>
                <View style={styles.calloutSlate}>
                  <Text style={styles.calloutSlateTitle}>KLAUSUL PEMBEBASAN TANGGUNG JAWAB:</Text>
                  <Text style={styles.calloutSlateText}>
                    Layanan Dwitku disediakan atas dasar prinsip &quot;SEBAGAIMANA ADANYA&quot; (&quot;AS-IS&quot;) dan &quot;SEBAGAIMANA TERSEDIA&quot; (&quot;AS-AVAILABLE&quot;) tanpa jaminan apa pun.
                  </Text>
                  <Text style={styles.calloutSlateText}>
                    Sepanjang diizinkan oleh hukum yang berlaku, Pengembang dan Afiliasi Dwitku TIDAK BERTANGGUNG JAWAB atas kerugian finansial langsung/tidak langsung, kehilangan keuntungan, denda pajak, kesalahan hitung akibat salah input, atau gangguan server (force majeure).
                  </Text>
                  <Text style={styles.calloutSlateText}>
                    Dalam keadaan apa pun, batas total liabilitas maksimum kami kepada Anda tidak akan melebihi jumlah biaya langganan yang Anda bayarkan dalam 1 (satu) bulan terakhir.
                  </Text>
                </View>
              </View>

              {/* Pasal 5 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.numberBox}><Text style={styles.numberBoxText}>5</Text></View>
                  <Text style={styles.sectionHeading}>Hukum yang Berlaku & Penyelesaian Sengketa</Text>
                </View>
                <Text style={styles.paragraph}>
                  Syarat dan Ketentuan ini diatur dan ditafsirkan semata-mata berdasarkan Hukum Negara Republik Indonesia. Segala perselisihan wajib diselesaikan terlebih dahulu melalui musyawarah mufakat dalam jangka waktu 30 hari kalender sebelum dilanjutkan ke Pengadilan Negeri yang berwenang.
                </Text>
              </View>

              {/* Pasal 6 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.numberBox}><Text style={styles.numberBoxText}>6</Text></View>
                  <Text style={styles.sectionHeading}>Kontak Resmi</Text>
                </View>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxText}>📧 Email: support@dwitku.my.id</Text>
                  <Text style={styles.cardBoxText}>🌐 Website: https://dwitku.my.id</Text>
                  <Text style={styles.cardBoxText}>📍 Negara: Republik Indonesia</Text>
                </View>
              </View>
            </>
          ) : (
            /* =========================================================================
               KONTEN LENGKAP PRIVACY POLICY (1:1 DENGAN WEB privacy/page.tsx)
               ========================================================================= */
            <>
              {/* 4 Quick Highlights Cards */}
              <View style={styles.highlightsGrid}>
                <View style={styles.highlightCard}>
                  <Lock size={18} color="#059669" />
                  <Text style={styles.highlightTitle}>Enkripsi & Keamanan</Text>
                  <Text style={styles.highlightDesc}>Data via HTTPS/TLS dan tersimpan di basis data cloud terisolasi.</Text>
                </View>
                <View style={styles.highlightCard}>
                  <AlertTriangle size={18} color="#d97706" />
                  <Text style={styles.highlightTitle}>Tanpa Kredensial Bank</Text>
                  <Text style={styles.highlightDesc}>Tidak pernah meminta PIN, password m-Banking, OTP, atau CVV kartu.</Text>
                </View>
                <View style={styles.highlightCard}>
                  <UserCheck size={18} color="#2563eb" />
                  <Text style={styles.highlightTitle}>Hak Milik Anda</Text>
                  <Text style={styles.highlightDesc}>Berhak penuh mengunduh ekspor Excel/PDF dan hapus akun kapan saja.</Text>
                </View>
                <View style={styles.highlightCard}>
                  <Globe size={18} color="#9333ea" />
                  <Text style={styles.highlightTitle}>Tanpa Penjualan Data</Text>
                  <Text style={styles.highlightDesc}>Kami tidak pernah menjual data keuangan Anda kepada pihak ketiga.</Text>
                </View>
              </View>

              {/* Pasal 1 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.numberBox, { backgroundColor: '#16a34a' }]}><Text style={styles.numberBoxText}>1</Text></View>
                  <Text style={styles.sectionHeading}>Pendahuluan & Komitmen Privasi</Text>
                </View>
                <Text style={styles.paragraph}>
                  Selamat datang di <Text style={styles.boldText}>Dwitku</Text> (&quot;Layanan&quot;, &quot;Platform&quot;, &quot;Kami&quot;). Kebijakan Privasi ini dirancang sebagai bentuk komitmen kami dalam menghormati dan melindungi hak-hak privasi pengguna (&quot;Pengguna&quot;, &quot;Anda&quot;) sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia, khususnya <Text style={styles.boldText}>Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)</Text>.
                </Text>
                <Text style={styles.paragraph}>
                  Dengan mendaftar, mengakses, atau menggunakan platform Dwitku, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui pengumpulan, penyimpanan, pemrosesan, dan penggunaan data Anda sebagaimana diatur dalam Kebijakan Privasi ini.
                </Text>
              </View>

              {/* Pasal 2 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.numberBox, { backgroundColor: '#16a34a' }]}><Text style={styles.numberBoxText}>2</Text></View>
                  <Text style={styles.sectionHeading}>Data yang Kami Kumpulkan</Text>
                </View>
                <Text style={styles.paragraph}>
                  Kami hanya mengumpulkan data yang secara wajar diperlukan untuk mengoperasikan fungsi platform pencatatan keuangan Dwitku:
                </Text>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>A. Data Identitas & Akun</Text>
                  <Text style={styles.cardBoxText}>
                    Nama lengkap, alamat email, foto profil (dari Google OAuth atau avatar), dan kata sandi yang telah di-hash secara aman menggunakan algoritma bcrypt/argon2.
                  </Text>
                </View>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>B. Data Pembukuan Keuangan (Diinput Manual)</Text>
                  <Text style={styles.cardBoxText}>
                    Catatan transaksi pemasukan, pengeluaran, transfer saldo antar dompet, nama label dompet (cth: &apos;BCA Utama&apos;, &apos;Kas Kecil&apos;), nama pemilik rekening, kategori, dan catatan teks.
                  </Text>
                </View>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>C. Data Integrasi Bot Telegram</Text>
                  <Text style={styles.cardBoxText}>
                    ID Obrolan Telegram (Chat ID) dan username Telegram Anda saat menghubungkan akun untuk otentikasi bot.
                  </Text>
                </View>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>D. Data Pembayaran & Langganan</Text>
                  <Text style={styles.cardBoxText}>
                    Transaksi langganan diproses langsung oleh Payment Gateway berizin (Midtrans) bersertifikasi PCI-DSS. Dwitku tidak pernah menyimpan nomor kartu kredit atau CVV Anda.
                  </Text>
                </View>
              </View>

              {/* Pasal 3 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.numberBox, { backgroundColor: '#16a34a' }]}><Text style={styles.numberBoxText}>3</Text></View>
                  <Text style={styles.sectionHeading}>Jaminan Kerahasiaan Mutlak: Larangan Akses Operator</Text>
                </View>
                <View style={styles.calloutEmerald}>
                  <View style={styles.calloutHeaderRow}>
                    <Lock size={16} color="#065f46" />
                    <Text style={styles.calloutEmeraldTitle}>KOMITMEN PERLINDUNGAN PRIVASI FINANSIAL ANDA:</Text>
                  </View>
                  <Text style={styles.calloutEmeraldText}>
                    Kami sangat memahami bahwa nominal uang, catatan pengeluaran, dan saldo dompet Anda adalah informasi yang sangat rahasia.
                  </Text>
                  <View style={styles.bulletList}>
                    <Text style={styles.bulletItemEmerald}>
                      • <Text style={styles.boldText}>Larangan Mengintip (Zero Human Inspection):</Text> Pemilik platform, pengembang, maupun staf admin Dwitku <Text style={styles.boldText}>TIDAK AKAN PERNAH</Text> membaca, memeriksa, memantau, atau menganalisis rincian transaksi, saldo dompet, maupun nama-nama pengeluaran pribadi Anda.
                    </Text>
                    <Text style={styles.bulletItemEmerald}>
                      • <Text style={styles.boldText}>Pemisahan Akses Arsitektural:</Text> Panel admin Dwitku hanya berfungsi untuk memantau performa server dan status langganan akun. <Text style={styles.boldText}>Tidak ada antarmuka di panel admin yang menampilkan daftar catatan transaksi pengguna.</Text>
                    </Text>
                    <Text style={styles.bulletItemEmerald}>
                      • <Text style={styles.boldText}>Pemrosesan Otomatis Murni:</Text> Seluruh kalkulasi saldo, grafik arus kas, dan kategori diproses secara murni oleh sistem algoritma mesin tanpa campur tangan manusia.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Pasal 4 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.numberBox, { backgroundColor: '#16a34a' }]}><Text style={styles.numberBoxText}>4</Text></View>
                  <Text style={styles.sectionHeading}>Larangan Pengumpulan Kredensial Bank</Text>
                </View>
                <View style={styles.calloutAmber}>
                  <Text style={styles.calloutAmberText}>
                    Dwitku adalah software pembukuan manual. Kami <Text style={styles.boldText}>TIDAK PERNAH</Text> meminta PIN ATM, Password m-Banking, Kode OTP SMS, atau nomor CVV kartu debit/kredit Anda. Waspadai segala pihak yang mengatasnamakan Dwitku untuk meminta kredensial perbankan Anda.
                  </Text>
                </View>
              </View>

              {/* Pasal 5 */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.numberBox, { backgroundColor: '#16a34a' }]}><Text style={styles.numberBoxText}>5</Text></View>
                  <Text style={styles.sectionHeading}>Hak-Hak Pemilik Data Pribadi (UU PDP)</Text>
                </View>
                <Text style={styles.paragraph}>
                  Sesuai UU PDP No. 27/2022, Anda memiliki hak penuh untuk:
                </Text>
                <Text style={styles.paragraph}>• Hak Akses & Portabilitas: Mengunduh ekspor seluruh data transaksi dalam format Excel/PDF.</Text>
                <Text style={styles.paragraph}>• Hak Perbaikan: Mengubah data profil, nama kategori, dan catatan transaksi kapan saja.</Text>
                <Text style={styles.paragraph}>• Hak Penghapusan (Right to Erasure): Mengajukan penghapusan akun permanen beserta seluruh rekaman data.</Text>
              </View>
            </>
          )}

          {/* Footer Tombol Tutup */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Saya Mengerti & Setuju</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    backgroundColor: '#ffffff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeRow: {
    marginBottom: 10,
  },
  blueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  blueBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  greenBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  greenBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#18181b',
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 4,
    marginBottom: 16,
  },
  calloutAmber: {
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fcd34d',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  calloutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  calloutAmberTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    flex: 1,
  },
  calloutAmberText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
  bulletList: {
    marginTop: 8,
    gap: 6,
  },
  bulletItem: {
    fontSize: 11.5,
    color: '#78350f',
    lineHeight: 17,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  numberBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBoxText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#18181b',
    flex: 1,
  },
  paragraph: {
    fontSize: 13,
    color: '#52525b',
    lineHeight: 19,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#18181b',
  },
  cardBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cardBoxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
  },
  cardBoxText: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },
  calloutSlate: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  calloutSlateTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  calloutSlateText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
  },
  highlightsGrid: {
    gap: 8,
    marginBottom: 20,
  },
  highlightCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
    marginBottom: 2,
  },
  highlightDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  calloutEmerald: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 6,
  },
  calloutEmeraldTitle: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#065f46',
    flex: 1,
  },
  calloutEmeraldText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
    marginTop: 4,
  },
  bulletItemEmerald: {
    fontSize: 11.5,
    color: '#065f46',
    lineHeight: 17,
  },
  doneBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
