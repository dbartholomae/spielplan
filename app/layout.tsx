import Footer from "../components/Footer";
import "./globals.css";

export const metadata = {
  title: "Spielplan",
  description: "GameNight Scheduler",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
