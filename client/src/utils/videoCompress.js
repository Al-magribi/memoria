// src/utils/videoCompressor.js

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// Kita akan menggunakan satu instance FFmpeg (singleton)
const ffmpeg = new FFmpeg();
let ffmpegLoaded = false;

// Tambahkan listener log untuk debugging (opsional tapi membantu)
ffmpeg.on("log", ({ message }) => {
  console.log(message);
});

/**
 * Memuat core FFmpeg. Ini hanya perlu dijalankan sekali.
 * Ini mengunduh file WASM yang ukurannya ~30MB, jadi ini butuh waktu.
 */
export const loadFFmpeg = async () => {
  if (ffmpegLoaded) {
    return;
  }
  try {
    await ffmpeg.load();
    ffmpegLoaded = true;
  } catch (error) {
    console.error("Gagal memuat FFmpeg:", error);
  }
};

/**
 * Mengkompres file video.
 * @param {File} file - File video asli dari input.
 * @param {function} progressCallback - Fungsi callback untuk update progress (0-100).
 * @returns {Promise<File>} - File video yang sudah dikompres.
 */
export const videoCompress = async (file, progressCallback) => {
  if (!ffmpegLoaded) {
    // Fallback jika belum dimuat, idealnya panggil loadFFmpeg() saat komponen mount.
    console.warn("FFmpeg belum dimuat. Memuat sekarang...");
    await loadFFmpeg();
  }

  const inputFilename = `input_${file.name}`;
  const outputFilename = `output_${Date.now()}.mp4`;

  let progressListener = null;

  try {
    // 1. Daftarkan listener progress
    progressListener = ({ progress }) => {
      if (progressCallback) {
        // progress adalah 0-1
        progressCallback(Math.round(progress * 100));
      }
    };
    ffmpeg.on("progress", progressListener);

    // 2. Tulis file ke virtual file system FFmpeg
    await ffmpeg.writeFile(inputFilename, await fetchFile(file));

    // 3. Jalankan perintah kompresi FFmpeg
    // Penjelasan command:
    // -i [input]: File input
    // -vcodec libx264: Gunakan codec H.264
    // -crf 28: Constant Rate Factor (kualitas). 23 default. Lebih tinggi = kompresi lebih kuat, kualitas lebih rendah. 28 adalah kompromi yang baik.
    // -preset fast: Keseimbangan antara kecepatan kompresi dan ukuran file. Penting untuk browser.
    // -movflags +faststart: Mengoptimalkan video untuk streaming web.
    await ffmpeg.exec([
      "-i",
      inputFilename,
      "-vcodec",
      "libx264",
      "-crf",
      "28",
      "-preset",
      "fast",
      "-movflags",
      "+faststart",
      outputFilename,
    ]);

    // 4. Baca file hasil kompresi dari virtual FS
    const data = await ffmpeg.readFile(outputFilename);

    // 5. Konversi data (Uint8Array) kembali menjadi File object
    const compressedFile = new File(
      [data.buffer],
      `compressed_${file.name.split(".")[0]}.mp4`,
      {
        type: "video/mp4", // Paksa tipe-nya
      }
    );

    // Keamanan: Jika file terkompresi lebih besar, kembalikan yang asli
    if (compressedFile.size > file.size) {
      console.warn(
        "Kompresi menghasilkan file yang lebih besar. Mengembalikan file asli."
      );
      return file;
    }

    return compressedFile;
  } catch (error) {
    console.error("Terjadi error saat kompresi video:", error);
    return file; // Kembalikan file asli jika terjadi error
  } finally {
    // 6. Bersihkan virtual file system
    try {
      if (progressListener) {
        ffmpeg.off("progress", progressListener); // Hapus listener
      }
      await ffmpeg.deleteFile(inputFilename);
      await ffmpeg.deleteFile(outputFilename);
    } catch (e) {
      console.warn("Gagal membersihkan file virtual:", e);
    }
  }
};
