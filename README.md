# Kasus Bram Buldog (rev1)
**Menjadi Pengacara PTP Kemenkeu di Sidang Kenaikan Grading**

Game 3D (three.js) untuk acara daring PTP Kemenkeu. Peserta membantu pengacara Bram Buldog
mengumpulkan 5 berkas bukti di 5 lantai gedung Pusdiklat, lalu membawanya ke sidang
kenaikan grading di hadapan Hakim von Timbangen.

## Cara main
1. Buka halaman game, tunggu model 3D selesai dimuat, isi nama peserta (satu nama per baris), lalu tekan **Play**. Minimal 5 nama.
2. Di setiap lantai, tekan **SPIN** untuk mengundi peserta, tanyakan pilihannya, lalu klik kartu bukti yang dipilih.
3. Setelah 5 lantai, sidang dimulai dan hakim membacakan putusan.
4. Di layar rekap, **Ungkap Aturan** menampilkan aturan komposisi kapan saja. Pada putaran terakhir (nama habis), aturan tampil otomatis.
5. Tekan **Main Lagi** untuk putaran berikutnya. Dengan 15 peserta, tiga putaran menghabiskan daftar nama tepat sekali.

Kendali: klik/spasi = lanjut dialog · **P** atau ⏸ = jeda · ⏭ = lewati adegan · 🔊 = suara · ⛶ = layar penuh.

## Catatan untuk host
- Buka game beberapa menit sebelum acara supaya semua model (sekitar 35 MB) sudah termuat.
- Di Zoom, centang **Share sound** (Bagikan suara) saat share screen supaya peserta mendengar suara tokoh.
- Kalau laptop terasa berat, tambahkan `?lq` di akhir alamat (grafis lebih ringan).
- Daftar nama tersimpan di browser, jadi tidak hilang kalau halaman dimuat ulang.

## Aset
- Tokoh: Meshy 7.1 (text-to-3D, rigging, animasi). File di `assets/models`.
- Suara: ElevenLabs `eleven_v4` dengan suara penutur asli bahasa Indonesia dari Voice Library.
- Game tidak memanggil API apa pun saat dimainkan; semua aset tersimpan di repo.
- `tools/` berisi skrip pembuat suara (butuh `ELEVEN_API_KEY` di environment; key tidak disimpan di repo).

Semua tokoh dan instansi dalam game ini fiktif.
