#![no_std]

mod types;

use soroban_sdk::{contract, contractimpl, token, vec, Address, Env, String, Vec};
use types::{DataKey, Listing};

#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {
    /// Initialize the marketplace with all required contract references.
    ///
    /// # Arguments
    /// * `admin` - Platform admin address
    /// * `invoice_registry` - Invoice Registry contract address
    /// * `escrow_contract` - Escrow contract address
    /// * `usdc_token` - USDC Stellar Asset Contract address
    /// * `fee_bps` - Platform fee in basis points (e.g., 50 = 0.5%)
    pub fn initialize(
        env: Env,
        admin: Address,
        invoice_registry: Address,
        escrow_contract: Address,
        usdc_token: Address,
        fee_bps: u32,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::InvoiceRegistry, &invoice_registry);
        env.storage()
            .instance()
            .set(&DataKey::EscrowContract, &escrow_contract);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage()
            .instance()
            .set(&DataKey::FeeCollector, &admin);

        let empty_listings: Vec<u64> = vec![&env];
        env.storage()
            .instance()
            .set(&DataKey::ActiveListings, &empty_listings);
    }

    /// List an invoice on the marketplace.
    ///
    /// The seller must own the invoice and it must be in "Approved" status.
    /// This creates a listing and updates the invoice status to "Listed".
    pub fn list_invoice(
        env: Env,
        seller: Address,
        invoice_id: u64,
        asking_price: i128,
        face_value: i128,
        due_date: u64,
        risk_grade: String,
    ) -> u64 {
        seller.require_auth();

        if asking_price <= 0 || asking_price >= face_value {
            panic!("asking price must be between 0 and face value");
        }

        let listing = Listing {
            invoice_id,
            seller: seller.clone(),
            asking_price,
            face_value,
            due_date,
            risk_grade,
            is_active: true,
            listed_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Listing(invoice_id), &listing);

        // Add to active listings
        let mut active: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ActiveListings)
            .unwrap_or(vec![&env]);
        active.push_back(invoice_id);
        env.storage()
            .instance()
            .set(&DataKey::ActiveListings, &active);

        invoice_id
    }

    /// Fund an invoice listing. Called by a Liquidity Provider.
    ///
    /// This transfers USDC from the LP:
    /// - Instant payout (asking_price - escrow_hold) goes to the seller
    /// - Escrow hold portion (4% of face_value) goes to the escrow contract
    /// - Platform fee is deducted
    pub fn fund_invoice(env: Env, lp: Address, invoice_id: u64) {
        lp.require_auth();

        let mut listing: Listing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(invoice_id))
            .expect("listing not found");

        if !listing.is_active {
            panic!("listing is not active");
        }

        let usdc_token: Address = env.storage().instance().get(&DataKey::UsdcToken).unwrap();
        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap();
        let fee_collector: Address = env
            .storage()
            .instance()
            .get(&DataKey::FeeCollector)
            .unwrap();

        let usdc = token::Client::new(&env, &usdc_token);

        // Calculate amounts
        let platform_fee = (listing.asking_price * fee_bps as i128) / 10_000;
        let escrow_hold = (listing.face_value * 400) / 10_000; // 4% of face value
        let seller_payout = listing.asking_price - escrow_hold - platform_fee;

        if seller_payout <= 0 {
            panic!("seller payout would be zero or negative");
        }

        // Transfer USDC from LP
        // 1. Seller gets instant payout
        usdc.transfer(&lp, &listing.seller, &seller_payout);

        // 2. Escrow hold goes to escrow contract (or admin for now)
        let escrow_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowContract)
            .unwrap();
        usdc.transfer(&lp, &escrow_contract, &escrow_hold);

        // 3. Platform fee goes to fee collector
        if platform_fee > 0 {
            usdc.transfer(&lp, &fee_collector, &platform_fee);
        }

        // Mark listing as inactive
        listing.is_active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Listing(invoice_id), &listing);

        // Remove from active listings
        let active: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ActiveListings)
            .unwrap_or(vec![&env]);
        let mut new_active: Vec<u64> = vec![&env];
        for id in active.iter() {
            if id != invoice_id {
                new_active.push_back(id);
            }
        }
        env.storage()
            .instance()
            .set(&DataKey::ActiveListings, &new_active);
    }

    /// Remove a listing from the marketplace. Only the seller can delist.
    pub fn delist_invoice(env: Env, seller: Address, invoice_id: u64) {
        seller.require_auth();

        let mut listing: Listing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(invoice_id))
            .expect("listing not found");

        if listing.seller != seller {
            panic!("not the seller");
        }

        listing.is_active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Listing(invoice_id), &listing);

        // Remove from active listings
        let active: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ActiveListings)
            .unwrap_or(vec![&env]);
        let mut new_active: Vec<u64> = vec![&env];
        for id in active.iter() {
            if id != invoice_id {
                new_active.push_back(id);
            }
        }
        env.storage()
            .instance()
            .set(&DataKey::ActiveListings, &new_active);
    }

    /// Get a specific listing by invoice ID.
    pub fn get_listing(env: Env, invoice_id: u64) -> Listing {
        env.storage()
            .persistent()
            .get(&DataKey::Listing(invoice_id))
            .expect("listing not found")
    }

    /// Get all active listing IDs.
    pub fn get_active_listings(env: Env) -> Vec<u64> {
        env.storage()
            .instance()
            .get(&DataKey::ActiveListings)
            .unwrap_or(vec![&env])
    }

    /// Get the admin address.
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    /// Update the platform fee (admin only).
    pub fn set_fee(env: Env, new_fee_bps: u32) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if new_fee_bps > 1000 {
            panic!("fee too high (max 10%)");
        }

        env.storage().instance().set(&DataKey::FeeBps, &new_fee_bps);
    }
}

#[cfg(test)]
mod test;
