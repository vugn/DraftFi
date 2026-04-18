use soroban_sdk::{contracttype, Address};

/// A listing on the DraftFi marketplace.
#[derive(Clone, Debug)]
#[contracttype]
pub struct Listing {
    /// The invoice ID from the Invoice Registry
    pub invoice_id: u64,
    /// The seller who listed the invoice
    pub seller: Address,
    /// The asking price in USDC (what the LP pays)
    pub asking_price: i128,
    /// The face value of the invoice (what the LP receives at maturity)
    pub face_value: i128,
    /// Due date (unix timestamp) — copied from invoice for easy access
    pub due_date: u64,
    /// Risk grade (copied from invoice)
    pub risk_grade: soroban_sdk::String,
    /// Whether this listing is active
    pub is_active: bool,
    /// Timestamp when the listing was created
    pub listed_at: u64,
}

/// Storage keys for the Marketplace contract.
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// Invoice Registry contract address
    InvoiceRegistry,
    /// Escrow contract address
    EscrowContract,
    /// USDC token contract address
    UsdcToken,
    /// Platform fee in basis points (e.g., 50 = 0.5%)
    FeeBps,
    /// Fee collector address
    FeeCollector,
    /// Listing by invoice ID
    Listing(u64),
    /// All active listing IDs
    ActiveListings,
}
