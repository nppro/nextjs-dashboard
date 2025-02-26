import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";

// antialiased class - which smooths out the font rendering
// https://tailwindcss.com/docs/font-smoothing

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
