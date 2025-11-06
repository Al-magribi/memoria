import { spawn } from "child_process";

/**
 * Mengkompres buffer video menggunakan FFmpeg.
 * @param {Buffer} buffer - Buffer video input dari multer.
 * @param {string} outputPath - Path file tujuan (e.g., /path/to/assets/post-123.mp4).
 * @returns {Promise<void>}
 */

export const compressVideo = (buffer, outputPath) => {
  return new Promise((resolve, reject) => {
    // Tentukan command FFmpeg
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      "pipe:0", // Input dari stdin (buffer)
      "-vf",
      "scale=-2:720", // Resize video to 720p height
      "-c:v",
      "libx264", // Codec video H.264
      "-crf",
      "28", // Constant Rate Factor (kualitas) - lebih tinggi lebih kecil
      "-preset",
      "medium", // Keseimbangan kecepatan vs ukuran
      "-c:a",
      "aac", // Codec audio AAC
      "-b:a",
      "128k", // Audio bitrate
      "-movflags",
      "+faststart", // Optimasi untuk web streaming
      "-f",
      "mp4", // Format output
      outputPath, // File output
    ]);

    // Alirkan buffer (file.buffer) ke stdin-nya FFmpeg
    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();

    // Tangani jika ada error saat spawning (misal: ffmpeg tidak terinstal)
    ffmpeg.on("error", (error) => {
      console.error(`[ffmpeg error]: ${error.message}`);
      reject(new Error("FFmpeg processing failed"));
    });

    // Tangani setelah proses FFmpeg selesai
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        // Sukses
        console.log(`Video compressed successfully: ${outputPath}`);
        resolve();
      } else {
        // Gagal
        console.error(`FFmpeg process exited with code ${code}`);
        reject(new Error("FFmpeg process failed"));
      }
    });
  });
};
