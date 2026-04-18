use soroban_sdk::{contracttype, Address};

/// Record of funds locked in escrow for a funded invoice.
#[derive(Clone, Debug)]
#[contracttype]
pub struct EscrowRecord {
    /// The invoice ID this escrow belongs to
    pub invoice_id: u64,
    /// The LP who funded the invoice
    pub lp: Address,
    /// The seller of the invoice
    pub seller: Address,
    /// Total amount funded by the LP
    pub total_amount: i128,
    /// Amount already paid out to the seller (instant payout)
    pub seller_payout: i128,
    /// Amount held in escrow until maturity
    pub escrow_hold: i128,
    /// Unix timestamp when escrowed funds can be released
    pub release_date: u64,
    /// Whether the escrow has been released to the LP
    pub is_released: bool,
    /// Whether this escrow is disputed
    pub is_disputed: bool,
    /// Timestamp when the escrow was created
    pub created_at: u64,
}

/// Storage keys for the Escrow contract.
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// USDC token contract address
    UsdcToken,
    /// Escrow record by invoice ID
    Escrow(u64),
    /// All escrow IDs for an LP
    LpEscrows(Address),
    /// All escrow IDs for a seller
    SellerEscrows(Address),
    /// All active escrow IDs
    ActiveEscrows,
}
