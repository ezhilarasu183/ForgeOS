import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI PM – Project Management",
  description: "AI-powered company productivity platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme') || 'light';
                if (t === 'dark') document.documentElement.classList.add('dark');
                else if (t === 'system') {
                  var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (m) document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased font-sans bg-notion-bg text-notion-text`}>
        {children}
      </body>
    </html>
  );
}
