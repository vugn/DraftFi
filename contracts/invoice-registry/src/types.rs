use soroban_sdk::{contracttype, Address, String};

/// Represents the lifecycle status of an invoice on the DraftFi platform.
#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub enum InvoiceStatus {
    /// Uploaded, awaiting AI risk scoring
    PendingReview,
    /// AI scored and approved, ready to list on marketplace
    Approved,
    /// Listed on the LP marketplace for funding
    Listed,
    /// An LP has funded this invoice
    Funded,
    /// Funds are locked in the escrow contract
    InEscrow,
    /// Invoice matured and funds have been released
    Settled,
    /// Invoice was not paid by due date
    Defaulted,
}

/// On-chain representation of a B2B invoice.
#[derive(Clone, Debug)]
#[contracttype]
pub struct Invoice {
    /// Unique auto-incrementing invoice ID
    pub id: u64,
    /// Stellar address of the invoice seller
    pub seller: Address,
    /// Name of the client who owes the invoice
    pub client_name: String,
    /// Face value of the invoice in USDC (7 decimals)
    pub amount: i128,
    /// Discounted price offered to LPs
    pub offered_amount: i128,
    /// Unix timestamp of the invoice due date
    pub due_date: u64,
    /// AI-calculated risk score (0-100)
    pub risk_score: u32,
    /// Human-readable risk grade (e.g., "A+", "A", "B+")
    pub risk_grade: String,
    /// Current lifecycle status
    pub status: InvoiceStatus,
    /// Stellar address of the LP who funded this invoice (if any)
    pub funded_by: Address,
    /// Unix timestamp of when the invoice was minted on-chain
    pub created_at: u64,
}

/// Storage keys for the invoice registry contract.
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// USDC token contract address
    UsdcToken,
    /// Marketplace contract address (authorized to update status)
    Marketplace,
    /// Next invoice ID counter
    NextId,
    /// Invoice record by ID
    Invoice(u64),
    /// List of invoice IDs owned by a seller
    SellerInvoices(Address),
}
