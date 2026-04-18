/**
 * Stellar SDK Wrapper for DraftFi
 *
 * Provides all blockchain interaction functions including wallet connection,
 * contract calls, and balance queries.
 */

import * as StellarSdk from "@stellar/stellar-sdk";
import { requestAccess, signTransaction, isConnected } from "@stellar/freighter-api";
import {
  ACTIVE_NETWORK,
  CONTRACT_IDS,
  type Invoice,
  type Listing,
  type EscrowRecord,
  InvoiceStatus,
  fromStroops,
  toStroops,
} from "./contracts";

// ─── RPC Client ────────────────────────────────────────────────────────────
const server = new StellarSdk.rpc.Server(ACTIVE_NETWORK.rpcUrl);

// ─── Wallet Connection ─────────────────────────────────────────────────────

/**
 * Check if the Freighter wallet extension is installed and connected.
 */
export async function checkWalletConnection(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Connect to the Freighter wallet and get the public key.
 * @returns The connected Stellar public key
 */
export async function connectWallet(): Promise<string> {
  try {
    const accessResult = await requestAccess();
    if (accessResult.error) {
      throw new Error(accessResult.error);
    }
    return accessResult.address;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw new Error("Failed to connect Freighter wallet. Is the extension installed?");
  }
}

// ─── Balance Queries ───────────────────────────────────────────────────────

/**
 * Get the XLM balance for a Stellar address.
 */
export async function getXLMBalance(publicKey: string): Promise<string> {
  try {
    const horizonServer = new StellarSdk.Horizon.Server(ACTIVE_NETWORK.horizonUrl);
    const account = await horizonServer.loadAccount(publicKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xlmBalance = account.balances.find((b: any) => b.asset_type === "native");
    return xlmBalance ? xlmBalance.balance : "0";
  } catch {
    return "0";
  }
}

/**
 * Get the USDC balance for a Stellar address.
 * Checks both classic trustline and SAC (Soroban Asset Contract) balance.
 */
export async function getUSDCBalance(publicKey: string): Promise<number> {
  try {
    const horizonServer = new StellarSdk.Horizon.Server(ACTIVE_NETWORK.horizonUrl);
    const account = await horizonServer.loadAccount(publicKey);

    // Look for USDC trustline (classic asset)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usdcBalance = account.balances.find((b: any) =>
      b.asset_type !== "native" && b.asset_type !== "liquidity_pool_shares" && b.asset_code === "USDC"
    );

    if (usdcBalance) {
      return parseFloat(usdcBalance.balance);
    }

    return 0;
  } catch {
    return 0;
  }
}

// ─── Contract Interaction Helpers ──────────────────────────────────────────

/**
 * Build and submit a Soroban contract invocation transaction.
 */
async function invokeContract(
  publicKey: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.rpc.Api.GetTransactionResponse> {
  const account = await server.getAccount(publicKey);
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: ACTIVE_NETWORK.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate first to get resource estimates
  const simulated = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  // Assemble with resource estimates
  const prepared = StellarSdk.rpc.assembleTransaction(tx, simulated).build();

  // Sign with Freighter
  const signResult = await signTransaction(prepared.toXDR(), {
    networkPassphrase: ACTIVE_NETWORK.networkPassphrase,
  });

  if (signResult.error) {
    const errorMsg = typeof signResult.error === 'string' 
      ? signResult.error 
      : JSON.stringify(signResult.error);
    throw new Error(`Signing failed: ${errorMsg}`);
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    ACTIVE_NETWORK.networkPassphrase
  );

  const sendResult = await server.sendTransaction(signedTx);

  if (sendResult.status === "ERROR") {
    throw new Error("Transaction submission failed");
  }

  // Poll for result
  let result = await server.getTransaction(sendResult.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    result = await server.getTransaction(sendResult.hash);
  }

  return result;
}

/**
 * Read-only contract call (no transaction, no signing).
 */
async function queryContract(
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.xdr.ScVal | undefined> {
  // Create a temporary source account for simulation
  const tempKeypair = StellarSdk.Keypair.random();
  const tempAccount = new StellarSdk.Account(tempKeypair.publicKey(), "0");
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(tempAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: ACTIVE_NETWORK.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Query failed: ${simulated.error}`);
  }

  if (StellarSdk.rpc.Api.isSimulationSuccess(simulated) && simulated.result) {
    return simulated.result.retval;
  }

  return undefined;
}

// ─── Invoice Registry Contract Calls ───────────────────────────────────────

/**
 * Mint a new invoice on-chain after AI underwriting.
 */
export async function mintInvoice(
  publicKey: string,
  clientName: string,
  amount: number,
  offeredAmount: number,
  dueDate: number,
  riskScore: number,
  riskGrade: string
): Promise<string> {
  const result = await invokeContract(
    publicKey,
    CONTRACT_IDS.invoiceRegistry,
    "mint_invoice",
    [
      StellarSdk.nativeToScVal(publicKey, { type: "address" }),
      StellarSdk.nativeToScVal(clientName, { type: "string" }),
      StellarSdk.nativeToScVal(toStroops(amount), { type: "i128" }),
      StellarSdk.nativeToScVal(toStroops(offeredAmount), { type: "i128" }),
      StellarSdk.nativeToScVal(dueDate, { type: "u64" }),
      StellarSdk.nativeToScVal(riskScore, { type: "u32" }),
      StellarSdk.nativeToScVal(riskGrade, { type: "string" }),
    ]
  );

  return result.status === "SUCCESS" ? "success" : "failed";
}

/**
 * Get all invoice IDs for the connected seller.
 */
export async function getSellerInvoiceIds(sellerAddress: string): Promise<number[]> {
  try {
    const result = await queryContract(
      CONTRACT_IDS.invoiceRegistry,
      "get_seller_invoices",
      [StellarSdk.nativeToScVal(sellerAddress, { type: "address" })]
    );

    if (!result) return [];

    const ids = StellarSdk.scValToNative(result);
    return Array.isArray(ids) ? ids.map(Number) : [];
  } catch {
    return [];
  }
}

/**
 * Get invoice details by ID.
 */
export async function getInvoice(invoiceId: number): Promise<Invoice | null> {
  try {
    const result = await queryContract(
      CONTRACT_IDS.invoiceRegistry,
      "get_invoice",
      [StellarSdk.nativeToScVal(invoiceId, { type: "u64" })]
    );

    if (!result) return null;

    const raw = StellarSdk.scValToNative(result);
    return {
      id: Number(raw.id),
      seller: raw.seller,
      clientName: raw.client_name,
      amount: BigInt(raw.amount),
      offeredAmount: BigInt(raw.offered_amount),
      dueDate: Number(raw.due_date),
      riskScore: Number(raw.risk_score),
      riskGrade: raw.risk_grade,
      status: raw.status as InvoiceStatus,
      fundedBy: raw.funded_by,
      createdAt: Number(raw.created_at),
    };
  } catch {
    return null;
  }
}

// ─── Marketplace Contract Calls ────────────────────────────────────────────

/**
 * List an invoice on the marketplace.
 */
export async function listInvoice(
  publicKey: string,
  invoiceId: number,
  askingPrice: number,
  faceValue: number,
  dueDate: number,
  riskGrade: string
): Promise<string> {
  const result = await invokeContract(
    publicKey,
    CONTRACT_IDS.marketplace,
    "list_invoice",
    [
      StellarSdk.nativeToScVal(publicKey, { type: "address" }),
      StellarSdk.nativeToScVal(invoiceId, { type: "u64" }),
      StellarSdk.nativeToScVal(toStroops(askingPrice), { type: "i128" }),
      StellarSdk.nativeToScVal(toStroops(faceValue), { type: "i128" }),
      StellarSdk.nativeToScVal(dueDate, { type: "u64" }),
      StellarSdk.nativeToScVal(riskGrade, { type: "string" }),
    ]
  );

  return result.status === "SUCCESS" ? "success" : "failed";
}

/**
 * Fund an invoice as a Liquidity Provider.
 */
export async function fundInvoice(
  publicKey: string,
  invoiceId: number
): Promise<string> {
  const result = await invokeContract(
    publicKey,
    CONTRACT_IDS.marketplace,
    "fund_invoice",
    [
      StellarSdk.nativeToScVal(publicKey, { type: "address" }),
      StellarSdk.nativeToScVal(invoiceId, { type: "u64" }),
    ]
  );

  return result.status === "SUCCESS" ? "success" : "failed";
}

/**
 * Get all active marketplace listings.
 */
export async function getActiveListings(): Promise<Listing[]> {
  try {
    // First get active listing IDs
    const idsResult = await queryContract(
      CONTRACT_IDS.marketplace,
      "get_active_listings",
      []
    );

    if (!idsResult) return [];

    const ids = StellarSdk.scValToNative(idsResult);
    if (!Array.isArray(ids) || ids.length === 0) return [];

    // Fetch each listing
    const listings: Listing[] = [];
    for (const id of ids) {
      const listingResult = await queryContract(
        CONTRACT_IDS.marketplace,
        "get_listing",
        [StellarSdk.nativeToScVal(Number(id), { type: "u64" })]
      );

      if (listingResult) {
        const raw = StellarSdk.scValToNative(listingResult);
        listings.push({
          invoiceId: Number(raw.invoice_id),
          seller: raw.seller,
          askingPrice: BigInt(raw.asking_price),
          faceValue: BigInt(raw.face_value),
          dueDate: Number(raw.due_date),
          riskGrade: raw.risk_grade,
          isActive: raw.is_active,
          listedAt: Number(raw.listed_at),
        });
      }
    }

    return listings;
  } catch {
    return [];
  }
}

// ─── Escrow Contract Calls ─────────────────────────────────────────────────

/**
 * Get all escrow records for a given user (as LP or seller).
 */
export async function getUserEscrows(
  publicKey: string,
  role: "lp" | "seller"
): Promise<EscrowRecord[]> {
  try {
    const method = role === "lp" ? "get_lp_escrows" : "get_seller_escrows";
    const idsResult = await queryContract(
      CONTRACT_IDS.escrow,
      method,
      [StellarSdk.nativeToScVal(publicKey, { type: "address" })]
    );

    if (!idsResult) return [];

    const ids = StellarSdk.scValToNative(idsResult);
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const records: EscrowRecord[] = [];
    for (const id of ids) {
      const recordResult = await queryContract(
        CONTRACT_IDS.escrow,
        "get_escrow",
        [StellarSdk.nativeToScVal(Number(id), { type: "u64" })]
      );

      if (recordResult) {
        const raw = StellarSdk.scValToNative(recordResult);
        records.push({
          invoiceId: Number(raw.invoice_id),
          lp: raw.lp,
          seller: raw.seller,
          totalAmount: BigInt(raw.total_amount),
          sellerPayout: BigInt(raw.seller_payout),
          escrowHold: BigInt(raw.escrow_hold),
          releaseDate: Number(raw.release_date),
          isReleased: raw.is_released,
          isDisputed: raw.is_disputed,
          createdAt: Number(raw.created_at),
        });
      }
    }

    return records;
  } catch {
    return [];
  }
}
