/**
 * Mengubah string (misalnya judul artikel) menjadi format URL-friendly slug.
 * * Contoh:
 * "Hello World!" -> "hello-world"
 * "Tutorial Next.js & Prisma" -> "tutorial-next-js-prisma"
 * "_Ini-Percobaan-" -> "ini-percobaan"
 *
 * @param text Teks yang akan diubah menjadi slug.
 * @returns String dalam format slug.
 */
export const slugify = (text: string): string => {
  return text
    .toString() // Pastikan input adalah string
    .toLowerCase() // Ubah semua jadi huruf kecil
    .trim() // Hapus spasi di awal/akhir
    .replace(/[^a-z0-9\s-]/g, "") // Hapus semua karakter selain huruf, angka, spasi, atau strip
    .replace(/[\s_-]+/g, "-") // Ganti spasi, underscore, atau strip berlebih dengan satu strip
    .replace(/^-+|-+$/g, ""); // Hapus strip yang mungkin ada di awal atau akhir
};
