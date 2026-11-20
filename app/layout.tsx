import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fraunces, Geist, Geist_Mono, Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "./globals.css";

const shekel = localFont({
  src: "../fonts/shekel.woff2",
  variable: "--font-shekel-file",
  display: "swap",
  adjustFontFallback: false,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const hebrewSerif = Frank_Ruhl_Libre({
  variable: "--font-hebrew-serif",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const hebrewSans = Heebo({
  variable: "--font-hebrew-sans",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const themeScript = `
try {
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var applyTheme = function () {
    document.documentElement.classList.toggle("dark", media.matches);
  };
  applyTheme();
  media.addEventListener("change", applyTheme);
  if (localStorage.getItem("parts.lang.v1") === "he") {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.documentElement.classList.add("locale-he");
  }
} catch (e) {}
`;

export const metadata: Metadata = {
  title: "Parts",
  description: "Répartis chaque revenu entre tes enveloppes.",
  applicationName: "Parts",
  appleWebApp: {
    capable: true,
    title: "Parts",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F3EC" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1916" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${hebrewSerif.variable} ${hebrewSans.variable} ${shekel.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
