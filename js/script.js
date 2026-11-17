// Naskah game "Kasus Bram Buldog".
// Setiap beat: { id, s: pembicara, t: teks, do?: [aksi], cam?: preset kamera }
// id dipakai sebagai nama file suara: assets/audio/voice/<id>.mp3

export const CAST = {
  bram:    { name: 'Bram Buldog',         voice: 'X9arQBKLLiX64lZBfxKz' }, // Tyo Utama - Confident
  wendi:   { name: 'Mas Wendi',           voice: 'iXU0mLW4S1QJu3df6t39' }, // Riandi - Casual
  hakim:   { name: 'Hakim von Timbangen', voice: 'THv4P0RGwO160U4WGB6c' }, // Akbar - Legal authority
  panitera:{ name: 'Panitera Tok',        voice: 'BSiuHWDgVlCBuGpext0k' }, // Suara Pria - NPC
  rudi:    { name: 'Bang Rudi',           voice: 'KTbU2eAjrfZ2uFl5FIUD' }, // Kimsang - Warm, Expressive
  maria:   { name: 'Bu Maria',            voice: 'tCKeP99grYL9wZRg6sQ9' }, // Riri Rida
  kevin:   { name: 'Mas Kevin',           voice: 'TTzQnYDPvALqh73GZCIL' }, // Dicky - Energetic
  siti:    { name: 'Mbak Siti',           voice: 'jvRLduBU3hNjm6JTgOBn' }, // Gendhis - Calm & Friendly
  bayu:    { name: 'Mas Bayu',            voice: 'Ij5fL53dSDi2wO4weHqc' }, // Abay - Upbeat
  lestari: { name: 'Bu Lestari',          voice: 'o5s6XRBkPSTD4syv6mZg' }, // Arunika
  fajar:   { name: 'Mas Fajar',           voice: 'xlBOShi2835jfBgaEld4' }, // Rafiq - Upbeat
  ratna:   { name: 'Bu Ratna',            voice: 'WwYTGZjDYP0WzvTp4vRz' }, // Lani Eleonora
  nanda:   { name: 'Dik Nanda',           voice: 'qXOoUJU1h7AiwSe4ltRA' }, // Zulfa - Upbeat
  yosef:   { name: 'Pak Yosef',           voice: 'hGKBtk3J6UEQtxLtsVRC' }, // Macazzart Makassar
  tutor:   { name: 'Tutor AI',            voice: 'Q3XXAZw7SBnf6HYtNc0s' }, // Selma Sita
};

// say: teks yang dibacakan suara bila berbeda dari teks di layar
export const PROLOG = [
  { gest: 'jazz', id: 'p_01', s: 'wendi', t: 'Pak Bram Buldog! Akhirnya datang juga. Saya kira Bapak nyasar ke pet shop sebelah.' },
  { gest: 'hip', id: 'p_02', s: 'bram',  t: 'Saya Bram Buldog, pengacara terkenal. Sekali gigit, tidak lepas. Kasus apa yang perlu saya gigit hari ini?' },
  { id: 'p_03', s: 'wendi', t: 'Sidang kenaikan grading PTP Kemenkeu. Sore ini, pukul empat, di Mahkamah Grading.', say: 'Sidang kenaikan grading pe-te-pe Kemenkeu. Sore ini, pukul empat, di Mahkamah Grading.', do: ['handMap'] },
  { gest: 'raise', id: 'p_04', s: 'bram',  t: 'Jabatan fungsional baru, minta naik grading. Apa alasan penolakan naik grading sebelumnya?' },
  { gest: 'scratch', id: 'p_05', s: 'wendi', t: 'Menurut Biro SDM, risiko pekerjaan kami tidak lebih tinggi dari Pranata Keuangan dan Pranata APBN. Jadi grading kami disamakan dengan mereka. Padahal risiko saya tiap hari besar, Pak: lupa jalan pulang karena lembur. Hehe.',
    say: 'Menurut Biro es de em, risiko pekerjaan kami tidak lebih tinggi dari Pranata Keuangan dan Pranata a pe be en. Jadi grading kami disamakan dengan mereka. Padahal risiko saya tiap hari besar, Pak: lupa jalan pulang karena lembur. Hehe.' },
  { gest: 'agree', id: 'p_06', s: 'bram',  t: 'Dan siapa hakimnya?' },
  { id: 'p_07', s: 'wendi', t: 'Yang Mulia... Hakim von Timbangen.', after: ['thunder'] },
  { gest: 'raise', id: 'p_08', s: 'bram',  t: '...Hakim yang mimbarnya setinggi tiga lantai itu?' },
  { gest: 'scheme', id: 'p_09', s: 'wendi', t: 'Yang itu. Beliau terkenal membenci dua hal: orang flexing, dan orang PHP. Oh, satu lagi: dia juga benci pengacara yang telat.',
    say: 'Yang itu. Beliau terkenal membenci dua hal: orang flexing, dan orang pe ha pe. Oh, satu lagi: dia juga benci pengacara yang telat.' },
  { gest: 'hip', id: 'p_10', s: 'bram',  t: 'Maka saya butuh bukti yang mendukung PTP layak naik grading. Di mana saya bisa mendapatkannya?', say: 'Maka saya butuh bukti yang mendukung pe-te-pe layak naik grading. Di mana saya bisa mendapatkannya?' },
  { gest: 'raise', id: 'p_11', s: 'wendi', t: 'Di Pusdiklat. Ada lima lantai. Di setiap lantai ada rekan PTP yang siap memberi bukti. Tapi tas Bapak hanya muat lima berkas. Satu berkas per lantai.',
    say: 'Di Pusdiklat. Ada lima lantai. Di setiap lantai ada rekan pe-te-pe yang siap memberi bukti. Tapi tas Bapak hanya muat lima berkas. Satu berkas per lantai.' },
  { id: 'p_12', s: 'bram',  t: 'Lima gigitan. Cukup.', do: ['liftBag'] },
  { gest: 'agree', id: 'p_13', s: 'wendi', t: 'Pilih baik-baik, Pak. Masa depan grading kami ada di dalam tas itu. Masa depan cicilan kami juga, Pak.' },
  { gest: 'raise', id: 'p_14', s: 'bram',  t: 'Dan Anda semua yang akan membantu saya memilih.', cam: 'bramCloseFront' },
  { id: 'p_15', s: 'bram',  t: 'Lima lantai, demi lima bukti yang mengangkat derajat PTP. Ayo kita mulai.', say: 'Lima lantai, demi lima bukti yang mengangkat derajat pe-te-pe. Ayo kita mulai.' },
];

export const ROUND2_FAIL = [
  { gest: 'jazz', id: 'r2f_01', s: 'wendi', t: 'Pak Bram! Mahkamah membuka sidang banding satu jam lagi! Saya lari dari parkiran, jadi jangan sia-siakan betis saya, Pak.' },
  { gest: 'hip', id: 'r2f_02', s: 'bram',  t: 'Oke. Butuh lima bukti lagi. Kali ini kita gigit lebih cermat.' },
];
export const ROUND2_WIN = [
  { id: 'r2w_01', s: 'wendi', t: 'Pak Bram! Pihak Biro SDM mengajukan banding! Putusan kita harus dipertahankan!', say: 'Pak Bram! Pihak Biro es de em mengajukan banding! Putusan kita harus dipertahankan!' },
  { id: 'r2w_02', s: 'bram',  t: 'Menang sekali itu keberuntungan. Menang dua kali itu bukti. Ayo.' },
];
export const ROUND3_FAIL = [
  { gest: 'scratch', id: 'r3f_01', s: 'wendi', t: 'Pak Bram! Kita ajukan kasasi! Ini kesempatan terakhir. Keripik saya juga tinggal satu bungkus, Pak.' },
  { id: 'r3f_02', s: 'bram',  t: 'Kesempatan terakhir, gigitan terakhir. Kita kumpulkan lima bukti, dan kali ini harus pas.' },
];
export const ROUND3_WIN = [
  { id: 'r3w_01', s: 'wendi', t: 'Pak Bram! Biro SDM mengajukan kasasi! Mereka belum menyerah!', say: 'Pak Bram! Biro es de em mengajukan kasasi! Mereka belum menyerah!' },
  { id: 'r3w_02', s: 'bram',  t: 'Bagus. Saya juga belum. Lima bukti lagi, Mas Wendi.' },
];

// Kalimat Bram saat berkas masuk tas (diacak)
export const BITE = [
  { id: 'bite_1', s: 'bram', t: 'Sekali gigit, tidak lepas!' },
  { id: 'bite_2', s: 'bram', t: 'Masuk tas. Lantai berikutnya!' },
  { id: 'bite_3', s: 'bram', t: 'Berkas yang bagus. Terima kasih, rekan!' },
];

export const FLOORS = [
  {
    n: 1, set: 'lobby', title: 'Lantai 1 — Lobi dan Galeri Piala', karyaBy: 'rudi', arsitekBy: 'maria',
    beats: [
      { id: 'f1_01', s: 'bram',  t: 'Lantai satu. Siapa yang punya bukti untuk saya?' },
      { id: 'f1_02', s: 'rudi',  t: 'Saya, Pak! Selamat datang di Galeri Piala PTP!', say: 'Saya, Pak! Selamat datang di Galeri Piala pe-te-pe!', do: ['holoK'] },
      { id: 'f1_03', s: 'rudi',  t: 'Puluhan piala dalam beberapa tahun! Juara inovasi pembelajaran, juara lomba model pembelajaran, juara video! Bawa ini saja, Pak. Hakim mana yang tidak silau?' },
      { id: 'f1_04', s: 'maria', t: 'Silau itu masalahnya, Bang. Pak Bram, bukti saya mungkin tidak berkilau, tapi berbobot.', do: ['hideHoloK'] },
      { id: 'f1_05', s: 'maria', t: 'Program Pelatihan RKA sudah ditetapkan, dan unitnya minta kelas lima hari. Kami analisis dulu peserta, tugas, dan konteks kerjanya.', say: 'Program Pelatihan er ka a sudah ditetapkan, dan unitnya minta kelas lima hari. Kami analisis dulu peserta, tugas, dan konteks kerjanya.', do: ['holoA'] },
      { id: 'f1_06', s: 'maria', t: 'Hasilnya: konsep lewat microlearning, praktik di simulasi aplikasi, dan kelas tatap muka cukup dua hari.', do: ['holoA2'] },
      { id: 'f1_07', s: 'rudi',  t: 'Lho, kok kelas klasikalnya malah dipotong? Peserta itu pengennya berlama-lama di Pusdiklat, Bu!' },
      { id: 'f1_08', s: 'maria', t: 'Pekerjaan kita memutuskan bentuk belajar yang paling pas untuk program itu, Bang. Kalau rancangan ini salah, program yang sudah disetujui gagal mencapai tujuannya dan anggarannya ikut terbuang.' },
      { id: 'f1_09', s: 'bram',  t: 'Prestasi... atau analisis.', do: ['weigh'] },
    ],
    karya:   { title: 'Galeri Piala PTP', text: 'Puluhan prestasi PTP dalam berbagai lomba dalam beberapa tahun terakhir.',
               court: { id: 'c1k', t: 'Yang Mulia, PTP memenangkan puluhan lomba inovasi pembelajaran!', say: 'Yang Mulia, pe-te-pe memenangkan puluhan lomba inovasi pembelajaran!' } },
    arsitek: { title: 'Rancangan Bentuk Pembelajaran', text: 'PTP menganalisis peserta, tugas, dan konteks kerja untuk memutuskan bentuk pembelajaran yang paling tepat bagi program yang sudah ditetapkan.',
               court: { id: 'c1a', t: 'Yang Mulia, PTP memutuskan bentuk pembelajaran sebuah program, dan menanggung akibatnya bila rancangan itu keliru!', say: 'Yang Mulia, pe-te-pe memutuskan bentuk pembelajaran sebuah program, dan menanggung akibatnya bila rancangan itu keliru!' } },
  },
  {
    n: 2, set: 'studio', title: 'Lantai 2 — Studio Produksi', karyaBy: 'kevin', arsitekBy: 'siti',
    beats: [
      { id: 'f2_01', s: 'kevin', t: 'Pak Bram! Pas banget. Duduk, duduk. Action!', do: ['holoK'] },
      { id: 'f2_02', s: 'kevin', t: 'Video pembelajaran sinematik dibuat dengan AI. Tiga hari produksi, kualitas bioskop. Ditonton ribuan pegawai!', say: 'Video pembelajaran sinematik dibuat dengan eyai. Tiga hari produksi, kualitas bioskop. Ditonton ribuan pegawai!' },
      { id: 'f2_03', s: 'bram',  t: 'Saya... tersentuh.' },
      { id: 'f2_04', s: 'siti',  t: 'Bagus sekali, Kevin. Tapi siapa yang memutuskan video itu perlu dibuat?', do: ['hideHoloK'] },
      { id: 'f2_05', s: 'kevin', t: 'Ya... unitnya yang minta.' },
      { id: 'f2_06', s: 'siti',  t: 'Itu bedanya, Pak Bram. Ini Peta Kebutuhan Belajar Kemenkeu. Kami memetakan kesenjangan kompetensi di semua unit, lalu menentukan program mana yang dibuat, digabung, atau dihentikan.', do: ['holoA'] },
      { id: 'f2_07', s: 'siti',  t: 'Titik merah ini kesenjangan yang belum tersentuh pelatihan apa pun. Yang abu-abu ini program lama yang kami usulkan berhenti.', do: ['holoA2'] },
      { id: 'f2_08', s: 'kevin', t: 'Dihentikan? Berani juga.' },
      { id: 'f2_09', s: 'siti',  t: 'Kalau peta ini keliru, anggaran pelatihan seluruh Kemenkeu salah sasaran. Itu taruhannya.' },
      { id: 'f2_10', s: 'bram',  t: 'Video sinematik AI... atau peta kebutuhan pembelajaran.', say: 'Video sinematik, eyai... atau peta kebutuhan pembelajaran.', do: ['weigh'] },
    ],
    karya:   { title: 'Video Cinematic AI', text: 'Video pembelajaran kualitas bioskop yang dibuat dengan AI dan ditonton ribuan pegawai.',
               court: { id: 'c2k', t: 'Yang Mulia, PTP membuat video pembelajaran sinematik dengan AI!', say: 'Yang Mulia, pe te pe membuat video pembelajaran sinematik dengan eyai!' } },
    arsitek: { title: 'Peta Kebutuhan Belajar Kemenkeu', text: 'PTP memetakan kesenjangan kompetensi lintas unit dan menentukan program mana yang dibuat atau dihentikan.',
               court: { id: 'c2a', t: 'Yang Mulia, PTP menentukan arah program pelatihan seluruh Kemenkeu berdasarkan peta kebutuhan!', say: 'Yang Mulia, pe-te-pe menentukan arah program pelatihan seluruh Kemenkeu berdasarkan peta kebutuhan!' } },
  },
  {
    n: 3, set: 'rooftop', title: 'Lantai 3 — Perpustakaan dan Ruang Game', karyaBy: 'bayu', arsitekBy: 'lestari',
    beats: [
      { id: 'f3_01', s: 'bayu',    t: 'Pak Bram, santai dulu. Coba ini.', do: ['vrOn'] },
      { id: 'f3_02', s: 'bram',    t: 'Saya... saya jadi kotak-kotak!', do: ['holoK'] },
      { id: 'f3_03', s: 'bayu',    t: 'Game edukasi, Pak. Peserta belajar aturan anggaran sambil bertualang. Yang menyelesaikan kursusnya jauh lebih banyak daripada e-learning biasa.' },
      { id: 'f3_04', s: 'lestari', t: 'Mas Bayu, game-mu bagus. Satu pertanyaan saja: setelah tamat, pemainnya jadi bisa apa?', do: ['bookThud'] },
      { id: 'f3_05', s: 'bayu',    t: '... Jadi... ya jadi have fun, Bu.', say: 'Hmm... Jadi... ya jadi have fun, Bu.', do: ['hideHoloK', 'vrOff'] },
      { id: 'f3_06', s: 'lestari', t: 'Nah, itu masalahnya. Seru belum tentu belajar. Pak Bram, ini Standar Desain Pembelajaran Kemenkeu. Setiap e-learning dari unit mana pun harus punya tujuan belajar yang jelas, bisa diakses semua pegawai termasuk penyandang disabilitas, berjalan di semua LMS, dan lolos reviu mutu.',
        say: 'Nah, itu masalahnya. Seru belum tentu belajar. Pak Bram, ini Standar Desain Pembelajaran Kemenkeu. Setiap e-learning dari unit mana pun harus punya tujuan belajar yang jelas, bisa diakses semua pegawai termasuk penyandang disabilitas, berjalan di semua el em es, dan lolos reviu mutu.', do: ['holoA'] },
      { id: 'f3_07', s: 'lestari', t: 'PTP yang menyusun standarnya, dan PTP yang mereviu. Kalau standar ini longgar, ribuan konten di Kemenkeu berjalan sendiri-sendiri dan tidak bisa dipakai bersama.', say: 'Pe te pe yang menyusun standarnya, dan pe-te-pe yang mereviu. Kalau standar ini longgar, ribuan konten di Kemenkeu berjalan sendiri-sendiri dan tidak bisa dipakai bersama.', do: ['holoA2'] },
      { id: 'f3_08', s: 'bayu',    t: 'Berarti game saya harus ikut standar Ibu?' },
      { id: 'f3_09', s: 'lestari', t: 'Justru standar ini yang membuat game-mu bukan cuma seru, tapi benar-benar mengajarkan sesuatu, dan bisa dipakai di seluruh Kemenkeu, Nak.' },
      { id: 'f3_10', s: 'bram',    t: 'Game edukasi... atau standar desain pembelajaran.', do: ['weigh'] },
    ],
    karya:   { title: 'Game Edukasi Petualangan', text: 'Game edukasi yang membuat peserta belajar aturan anggaran sambil bermain, dengan tingkat penyelesaian tinggi.',
               court: { id: 'c3k', t: 'Yang Mulia, PTP membuat game edukasi yang membuat pegawai betah belajar!', say: 'Yang Mulia, pe-te-pe membuat game edukasi yang membuat pegawai betah belajar!' } },
    arsitek: { title: 'Standar Desain Pembelajaran Kemenkeu', text: 'PTP menyusun dan mereviu standar mutu yang wajib dipenuhi e-learning dari semua unit.',
               court: { id: 'c3a', t: 'Yang Mulia, PTP menyusun standar mutu pembelajaran yang wajib diikuti semua unit!', say: 'Yang Mulia, pe-te-pe menyusun standar mutu pembelajaran yang wajib diikuti semua unit!' } },
  },
  {
    n: 4, set: 'ailab', title: 'Lantai 4 — Lab AI', karyaBy: 'fajar', arsitekBy: 'ratna',
    beats: [
      { id: 'f4_01', s: 'fajar', t: 'Pak Bram, tanyakan apa saja ke tutor AI kami!', say: 'Pak Bram, tanyakan apa saja ke tutor eyai kami!', do: ['holoK'] },
      { id: 'f4_02', s: 'bram',  t: 'Ehm... apa beda belanja barang dan belanja modal?' },
      { id: 'f4_03', s: 'tutor', t: 'Pertanyaan bagus! Belanja barang untuk kebutuhan operasional yang habis pakai, sedangkan belanja modal untuk aset yang manfaatnya lebih dari satu tahun.' },
      { id: 'f4_04', s: 'fajar', t: 'Pelatihan berbasis generative AI! Setiap peserta punya tutor pribadi dua puluh empat jam. Ratusan peserta sekaligus!', say: 'Pelatihan berbasis generative eyai! Setiap peserta punya tutor pribadi dua puluh empat jam. Ratusan peserta sekaligus!' },
      { id: 'f4_05', s: 'bram',  t: 'Seperti punya asisten pribadi.' },
      { id: 'f4_06', s: 'tutor', t: 'Dan tahukah Anda? Pagu anggaran boleh dilampaui asal niatnya baik!', do: ['glitch'] },
      { id: 'f4_07', s: 'fajar', t: 'Eh, eh! Itu halusinasi! Halusinasi!' },
      { id: 'f4_08', s: 'ratna', t: 'Nak Fajar. Tutormu memang hebat, Ibu juga pakai. Tapi ini Ibu bikin Pedoman Tata Kelola AI Pembelajaran. Berlaku untuk semua unit.', say: 'Nak Fajar. Tutormu memang hebat, Ibu juga pakai. Tapi ini Ibu bikin Pedoman Tata Kelola eyai Pembelajaran. Berlaku untuk semua unit.', do: ['hideHoloK', 'holoA'] },
      { id: 'f4_09', s: 'ratna', t: 'Sumber jawaban AI harus terkurasi. Data pegawai tidak boleh bocor. Ada pemeriksaan kesalahan sebelum dipakai di kelas. Dan jelas siapa yang bertanggung jawab kalau AI keliru.', say: 'Sumber jawaban eyai harus terkurasi. Data pegawai tidak boleh bocor. Ada pemeriksaan kesalahan sebelum dipakai di kelas. Dan jelas siapa yang bertanggung jawab kalau eyai keliru.', do: ['holoA2'] },
      { id: 'f4_10', s: 'fajar', t: 'Siapa, Bu?' },
      { id: 'f4_11', s: 'ratna', t: 'Kita. Kalau aturan ini lemah, satu chatbot yang keliru bisa mengajari ribuan pegawai hal yang salah.' },
      { id: 'f4_12', s: 'bram',  t: 'Tutor pintar... atau pagar pengaman.', do: ['weigh'] },
    ],
    karya:   { title: 'Tutor AI 24 Jam', text: 'Pelatihan berbasis generative AI dengan tutor pribadi untuk ratusan peserta sekaligus.',
               court: { id: 'c4k', t: 'Yang Mulia, PTP menghadirkan tutor AI pribadi untuk ratusan peserta!', say: 'Yang Mulia, pe te pe menghadirkan tutor eyai pribadi untuk ratusan peserta!' } },
    arsitek: { title: 'Pedoman Tata Kelola AI Pembelajaran', text: 'PTP menyusun aturan penggunaan AI dalam pembelajaran yang berlaku untuk semua unit.',
               court: { id: 'c4a', t: 'Yang Mulia, PTP menyusun dan bertanggung jawab atas tata kelola AI pembelajaran di semua unit!', say: 'Yang Mulia, pe te pe menyusun dan bertanggung jawab atas tata kelola eyai pembelajaran di semua unit!' } },
  },
  {
    n: 5, set: 'warehouse', title: 'Lantai 5 — Gudang Modul dan Ruang Evaluasi', karyaBy: 'nanda', arsitekBy: 'yosef',
    beats: [
      { id: 'f5_01', s: 'nanda', t: 'Awas, Pak! Maaf, maaf! Ini modul cetak tahun-tahun lalu. Semua sedang kami ubah jadi e-learning!', do: ['holoK'] },
      { id: 'f5_02', s: 'nanda', t: 'Ratusan modul sudah jadi digital, Pak! Bisa diakses dari HP, ada video pendek, ada kuisnya! Pegawai di daerah terpencil pun bisa belajar.', say: 'Ratusan modul sudah jadi digital, Pak! Bisa diakses dari ha pe, ada video pendek, ada kuisnya! Pegawai di daerah terpencil pun bisa belajar.' },
      { id: 'f5_03', s: 'bram',  t: 'Ratusan modul? Kamu kerjakan ini sendirian?' },
      { id: 'f5_04', s: 'nanda', t: 'Bareng tim, dong, Pak. Tapi lemburnya sendiri-sendiri. Hehe.' },
      { id: 'f5_05', s: 'yosef', t: 'Kerja keras yang luar biasa, Nanda. Boleh saya tunjukkan sesuatu ke Pak Bram?', do: ['hideHoloK'] },
      { id: 'f5_06', s: 'yosef', t: 'Ini evaluasi dampak. Kami tidak berhenti di nilai ujian atau kepuasan peserta. Kami ukur apakah cara kerja pegawai berubah setelah pelatihan, dan apakah kinerja unitnya membaik.', do: ['holoA'] },
      { id: 'f5_07', s: 'yosef', t: 'Yang ini naik. Yang ini datar. Pelatihannya ramai peminat, nilainya bagus, tapi tidak mengubah apa-apa di kantor. Rekomendasi kami: hentikan dan rancang ulang.', do: ['holoA2'] },
      { id: 'f5_08', s: 'nanda', t: 'Jangan-jangan modul saya ada yang datar juga, Pak?' },
      { id: 'f5_09', s: 'yosef', t: 'Itulah yang harus kita tahu, Nak. Kalau evaluasi ini keliru, pelatihan yang baik dihentikan dan yang sia-sia terus dibiayai.' },
      { id: 'f5_10', s: 'bram',  t: 'Lima belas menit lagi. Ini bukti terakhir. Ratusan konversi... atau hasil evaluasi level 4.', say: 'Lima belas menit lagi. Ini bukti terakhir. Ratusan konversi... atau hasil evaluasi level empat.', do: ['weigh'] },
    ],
    karya:   { title: 'Konversi Ratusan Modul Jadi Digital', text: 'Konversi besar-besaran modul cetak menjadi e-learning yang bisa diakses dari mana saja.',
               court: { id: 'c5k', t: 'Yang Mulia, PTP mengubah ratusan modul cetak menjadi e-learning!', say: 'Yang Mulia, pe-te-pe mengubah ratusan modul cetak menjadi e-learning!' } },
    arsitek: { title: 'Hasil Evaluasi Level 4', text: 'PTP mengukur perubahan kerja dan kinerja unit setelah pelatihan, lalu merekomendasikan program mana yang dihentikan.',
               court: { id: 'c5a', t: 'Yang Mulia, PTP mengukur dampak pelatihan pada kinerja dan berani merekomendasikan penghentian program!', say: 'Yang Mulia, pe-te-pe mengukur dampak pelatihan pada kinerja dan berani merekomendasikan penghentian program!' } },
  },
];

export const TO_COURT = [
  { id: 'tc_01', s: 'bram', t: 'Bram Buldog... kuasa hukum PTP... hadir, Yang Mulia.', say: 'Bram Buldog... kuasa hukum pe-te-pe... hadir, Yang Mulia.' },
];

export const COURT_OPEN = [
  { id: 'co_01', s: 'panitera', t: 'Sidang permohonan kenaikan grading Jabatan Fungsional Pengembang Teknologi Pembelajaran Kementerian Keuangan... DIBUKA!', do: ['gavel'] },
  { id: 'co_02', s: 'hakim', t: 'Kuasa hukum PTP. Pengadilan ini telah menerima pertimbangan bahwa risiko pekerjaan PTP tidak lebih tinggi dari Pranata Keuangan dan Pranata APBN. Karena itu grading PTP ditetapkan seperti saat ini, yaitu grading dua belas untuk PTP Pertama.', say: 'Kuasa hukum, pe-te-pe. Pengadilan ini telah menerima pertimbangan, bahwa risiko pekerjaan pe-te-pe, tidak lebih tinggi dari Pranata Keuangan dan Pranata a-pe-be-en. Karena itu, grading pe-te-pe ditetapkan seperti saat ini, yaitu grading dua belas, untuk pe-te-pe Pertama.' },
  { id: 'co_03', s: 'hakim', t: 'Apa yang Saudara bawa untuk mengubah pertimbangan ini?', do: ['hakimLean'] },
  { id: 'co_04', s: 'bram',  t: 'Lima berkas, Yang Mulia. Lima bukti dari kami.', do: ['liftBag'] },
];

export const REACT = {
  karya: [
    { id: 'rk_1', s: 'hakim', t: 'Hm. Indah sekali.' },
    { id: 'rk_2', s: 'hakim', t: 'Oke... Tapi saya sudah melihat banyak yang seperti ini.' },
    { id: 'rk_3', s: 'hakim', t: 'Bagus. Lanjutkan.' },
  ],
  arsitek: [
    { id: 'ra_1', s: 'hakim', t: 'Hm. Itu berat.' },
    { id: 'ra_2', s: 'hakim', t: 'Dan siapa yang menanggung bila keputusan itu keliru? Kalian? Menarik.' },
    { id: 'ra_3', s: 'hakim', t: 'Catat itu, Panitera.' },
  ],
};

export const SPOKES = [
  { id: 'sp_01', s: 'hakim', t: 'Sebelum pengadilan memutus, Juru Bicara PTP dipersilakan menyampaikan pembelaan penutup.', say: 'Sebelum pengadilan memutus, Juru Bicara pe-te-pe dipersilakan menyampaikan pembelaan penutup.' },
  { id: 'sp_02', s: 'hakim', t: 'Pengadilan mencatat pembelaan Saudara.' },
];

export const DELIB = [
  { id: 'dl_01', s: 'hakim', t: 'Pengadilan... telah menimbang.', do: ['rise'], after: ['thunder'] },
];

export const VERDICTS = {
  A: {
    label: 'DITOLAK — Level Produksi',
    beats: [
      { id: 'vA_01', s: 'hakim', t: 'Karya PTP sangat mengesankan. Tapi dampak pekerjaan PTP baru mencakup level produksi pelatihan saja. Risikonya tidak besar. Masih banyak jabatan fungsional lain yang risikonya lebih besar dari PTP, tapi grading-nya sama dengan PTP.' },
      { id: 'vA_02', s: 'hakim', t: 'Pengadilan ini tidak menaikkan grading karena karya yang indah. Pengadilan menaikkan grading karena beban yang dipikul. Tunjukkan keputusan apa yang PTP pegang, dan apa akibatnya bila keputusan itu keliru.' },
      { id: 'vA_03', s: 'hakim', t: 'Permohonan... DITOLAK!', do: ['gavel', 'sad'] },
      { id: 'vA_04', s: 'bram',  t: 'Kita membawa terlalu banyak kilau, dan terlalu sedikit beban.' },
    ],
    hint: 'Hakim butuh bukti beban: keputusan tingkat sistem yang dipegang PTP.',
  },
  B: {
    label: 'DITUNDA',
    beats: [
      { id: 'vB_01', s: 'hakim', t: 'Berkas Saudara mulai menunjukkan arah yang benar. Ada bukti bahwa PTP memang mengambil keputusan-keputusan strategis, dan ada karya yang membuktikan kemampuannya.', say: 'Berkas Saudara mulai menunjukkan arah yang benar. Ada bukti bahwa pe-te-pe memang mengambil keputusan-keputusan strategis, dan ada karya yang membuktikan kemampuannya.' },
      { id: 'vB_02', s: 'hakim', t: 'Tapi bebannya belum cukup terlihat. Bukti bahwa PTP memegang keputusan tingkat sistem masih kalah banyak dibanding pameran karya.' },
      { id: 'vB_03', s: 'hakim', t: 'Sidang... DITUNDA! Lengkapi berkas, ajukan kembali.', do: ['gavel'] },
      { id: 'vB_04', s: 'wendi', t: 'Ditunda? Bukan ditolak? Berarti masih ada harapan, kayak gebetan yang bilang, nanti dulu, ya.' },
      { id: 'vB_05', s: 'bram',  t: 'Sedikit lagi. Kita hanya perlu menggigit lebih dalam.' },
    ],
    hint: 'Arahnya benar, tapi bukti keputusan tingkat sistem masih kurang banyak.',
  },
  C: {
    label: 'DIKABULKAN — Kenaikan Grading',
    beats: [
      { id: 'vC_01', s: 'hakim', t: 'Berkas ini menunjukkan PTP memang telah mengambil keputusan di tingkat yang sistemik dan strategis. Bila keputusan PTP tersebut keliru, seluruh Kemenkeu bisa ikut menanggung. Itulah risiko.', say: 'Berkas ini menunjukkan pe-te-pe memang telah mengambil keputusan di tingkat yang sistemik dan strategis. Bila keputusan pe-te-pe tersebut keliru, seluruh Kemenkeu bisa ikut menanggung. Itulah risiko.' },
      { id: 'vC_02', s: 'hakim', t: 'Dan karya-karya nyata PTP membuktikan bahwa keputusan itu bukan sekadar rencana. PTP mampu mewujudkannya.' },
      { id: 'vC_03', s: 'hakim', t: 'Permohonan kenaikan grading PTP... DIKABULKAN!', say: 'Permohonan kenaikan grading pe-te-pe... dikabulkan!', do: ['gavel', 'celebrate'] },
      { id: 'vC_04', s: 'hakim', t: 'Adapun untuk menyamai Widyaiswara, itu perjalanan yang lebih panjang. Widyaiswara memikul beban itu selama puluhan tahun. PTP baru lahir tahun 2019. Teruslah memikul, dan kembalilah dengan bukti.', do: ['calm'] },
      { id: 'vC_05', s: 'bram',  t: 'Sekali gigit... tidak lepas!', do: ['liftBag'] },
    ],
    hint: '',
  },
  D: {
    label: 'DITOLAK — Arsitek di Atas Kertas',
    beats: [
      { id: 'vD_01', s: 'hakim', t: 'Berkas Saudara penuh rancangan besar: peta, jalur, tata kelola, standar. Tapi hampir semuanya masih berupa konsep dan rencana.', do: ['blueprint'] },
      { id: 'vD_02', s: 'hakim', t: 'Pengadilan ini tidak menaikkan grading berdasarkan janji. Arsitek dinilai dari bangunan yang benar-benar berdiri, dan saya tidak melihat satu pun hasil nyata yang membuktikan PTP mampu mewujudkan rancangan ini.' },
      { id: 'vD_03', s: 'hakim', t: 'Lagi pula, kalau semua ini pekerjaan PTP... siapa yang selama ini membuat media pembelajarannya?' },
      { id: 'vD_04', s: 'hakim', t: 'Permohonan... DITOLAK!', do: ['gavel', 'sad'] },
      { id: 'vD_05', s: 'wendi', t: 'Tapi... bukankah ini yang selama ini diminta dari kami?' },
      { id: 'vD_06', s: 'bram',  t: 'Rupanya hakim juga ingin melihat bangunannya berdiri, bukan cuma gambar arsitekturnya.' },
    ],
    hint: 'Bukti keputusan saja tidak cukup; hakim juga butuh karya nyata yang membuktikan PTP mampu mewujudkannya.',
  },
};

export function verdictFor(arsitekCount) {
  if (arsitekCount <= 1) return 'A';
  if (arsitekCount === 2) return 'B';
  if (arsitekCount <= 4) return 'C';
  return 'D';
}

// Semua baris yang perlu disuarakan
export function allLines() {
  const out = [];
  const push = (arr) => arr.forEach(b => out.push(b));
  push(PROLOG); push(ROUND2_FAIL); push(ROUND2_WIN); push(ROUND3_FAIL); push(ROUND3_WIN); push(BITE);
  FLOORS.forEach(f => { push(f.beats); out.push({ ...f.karya.court, s: 'bram' }); out.push({ ...f.arsitek.court, s: 'bram' }); });
  push(TO_COURT); push(COURT_OPEN); push(REACT.karya); push(REACT.arsitek); push(SPOKES); push(DELIB);
  Object.values(VERDICTS).forEach(v => push(v.beats));
  return out;
}
