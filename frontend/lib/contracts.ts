/**
 * DraftFi Smart Contract Configuration
 *
 * Contains contract addresses, network config, and TypeScript type
 * definitions matching the Soroban contract data structures.
 */

// ─── Network Configuration ────────────────────────────────────────────────
export const NETWORK = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
  },
  mainnet: {
    networkPassphrase: "Public Global Stellar Network ; September 2015",
    rpcUrl: "https://soroban-rpc.stellar.org",
    horizonUrl: "https://horizon.stellar.org",
  },
} as const;

// Default to testnet
export const ACTIVE_NETWORK = NETWORK.testnet;

// ─── Contract Addresses (Testnet) ──────────────────────────────────────────
// These will be populated after deploying contracts to testnet
export const CONTRACT_IDS = {
  invoiceRegistry: process.env.NEXT_PUBLIC_INVOICE_REGISTRY_CONTRACT || "",
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || "",
  escrow: process.env.NEXT_PUBLIC_ESCROW_CONTRACT || "",
  draftfiCore: process.env.NEXT_PUBLIC_DRAFTFI_CORE_CONTRACT || "",
  usdcToken: process.env.NEXT_PUBLIC_USDC_TOKEN_CONTRACT || "",
} as const;

// ─── Invoice Status Enum (mirrors Soroban InvoiceStatus) ───────────────────
export enum InvoiceStatus {
  PendingReview = "PendingReview",
  Approved = "Approved",
  Listed = "Listed",
  Funded = "Funded",
  InEscrow = "InEscrow",
  Settled = "Settled",
  Defaulted = "Defaulted",
}

// ─── Invoice Type (mirrors Soroban Invoice struct) ─────────────────────────
export interface Invoice {
  id: number;
  seller: string;
  clientName: string;
  /** Face value in stroops (1 USDC = 10,000,000 stroops) */
  amount: bigint;
  /** Discounted price offered to LPs */
  offeredAmount: bigint;
  /** Unix timestamp of due date */
  dueDate: number;
  /** AI risk score (0-100) */
  riskScore: number;
  /** Human-readable risk grade e.g. "A+", "A", "B+" */
  riskGrade: string;
  status: InvoiceStatus;
  /** Address of the LP who funded (if any) */
  fundedBy: string;
  /** Unix timestamp of creation */
  createdAt: number;
}

// ─── Marketplace Listing Type (mirrors Soroban Listing struct) ─────────────
export interface Listing {
  invoiceId: number;
  seller: string;
  /** Price the LP pays */
  askingPrice: bigint;
  /** Face value the LP receives at maturity */
  faceValue: bigint;
  dueDate: number;
  riskGrade: string;
  isActive: boolean;
  listedAt: number;
}

// ─── Escrow Record Type (mirrors Soroban EscrowRecord struct) ──────────────
export interface EscrowRecord {
  invoiceId: number;
  lp: string;
  seller: string;
  totalAmount: bigint;
  sellerPayout: bigint;
  escrowHold: bigint;
  releaseDate: number;
  isReleased: boolean;
  isDisputed: boolean;
  createdAt: number;
}

// ─── Platform Config Type (mirrors Soroban Config struct) ──────────────────
export interface PlatformConfig {
  admin: string;
  feeBps: number;
  minRiskScore: number;
  escrowHoldBps: number;
  isPaused: boolean;
}

// ─── Utility Constants ─────────────────────────────────────────────────────
/** USDC has 7 decimal places on Stellar */
export const USDC_DECIMALS = 7;
export const USDC_MULTIPLIER = 10_000_000n;

/** Convert a human-readable USDC amount to stroops */
export function toStroops(amount: number): bigint {
  return BigInt(Math.round(amount * 10_000_000));
}

/** Convert stroops to a human-readable USDC amount */
export function fromStroops(stroops: bigint): number {
  return Number(stroops) / 10_000_000;
}

/** Format USDC amount for display */
export function formatUSDC(stroops: bigint): string {
  const amount = fromStroops(stroops);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Truncate a Stellar address for display: GABC...XY12 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
