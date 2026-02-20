import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Waste Management Admin Portal Login",
  description: "Admin portal for waste management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>
          {`.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }`}
        </style>
      </Head>
      <body
        className={`${inter.variable} antialiased font-display`}
      >
        {children}
      </body>
    </html>
  );
}
