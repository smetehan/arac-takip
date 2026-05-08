import './globals.css';

export const metadata = {
  title: 'Araç Takip — Ortaklı Araç Alım-Satım Yönetimi',
  description: 'Araç alım-satım işlerini ve ortak sermayelerini takip edin',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
