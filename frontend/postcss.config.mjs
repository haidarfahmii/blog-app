const config = {
  plugins: {
    "@tailwindcss/postcss": {
      darkMode: ["class"], // Penting untuk toggle dark mode manual
      content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      theme: {
        extend: {
          // Konfigurasi warna shadcn akan ada di sini otomatis
        },
      },
      plugins: [
        require("tailwindcss-animate"),
        require("daisyui"), // DaisyUI plugin
      ],
      // Config daisyUI agar menggunakan variable CSS shadcn/modern theme
      daisyui: {
        themes: ["light", "dark"], // atau custom themes
      },
    },
  },
};

export default config;
