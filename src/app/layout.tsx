import "../assets/scss/theme.scss";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Performance Dashboard | Real-time Data Visualization",
  description: "High-performance real-time dashboard with 10,000+ data points at 60fps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

