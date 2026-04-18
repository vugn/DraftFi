import type {Metadata} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'DraftFi — Invoice Factoring on Stellar',
  description: 'Convert unpaid B2B invoices into instant liquidity using Soroban smart contracts on the Stellar network. AI-powered underwriting, trustless escrow, and USDC settlements.',
  keywords: ['DraftFi', 'invoice factoring', 'Stellar', 'Soroban', 'DeFi', 'USDC', 'smart contracts'],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
