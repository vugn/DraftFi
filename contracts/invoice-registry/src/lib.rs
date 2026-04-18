#![no_std]

mod types;

use soroban_sdk::{contract, contractimpl, vec, Address, Env, String, Vec};
use types::{DataKey, Invoice, InvoiceStatus};

#[contract]
pub struct InvoiceRegistryContract;

#[contractimpl]
impl InvoiceRegistryContract {
    /// Initialize the contract with an admin and USDC token address.
    pub fn initialize(env: Env, admin: Address, usdc_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        env.storage().instance().set(&DataKey::NextId, &1u64);
    }

    /// Set the marketplace contract address (only admin).
    pub fn set_marketplace(env: Env, marketplace: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Marketplace, &marketplace);
    }

    /// Mint a new invoice on-chain. Called after AI underwriting approves the invoice.
    pub fn mint_invoice(
        env: Env,
        seller: Address,
        client_name: String,
        amount: i128,
        offered_amount: i128,
        due_date: u64,
        risk_score: u32,
        risk_grade: String,
    ) -> u64 {
        seller.require_auth();

        if amount <= 0 || offered_amount <= 0 || offered_amount > amount {
            panic!("invalid amounts");
        }
        if risk_score > 100 {
            panic!("risk score must be 0-100");
        }

        let invoice_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap();

        // Use Address::from_string for a zero-address placeholder since there's no funded_by yet
        let zero_addr = seller.clone(); // placeholder — will be overwritten on funding

        let invoice = Invoice {
            id: invoice_id,
            seller: seller.clone(),
            client_name,
            amount,
            offered_amount,
            due_date,
            risk_score,
            risk_grade,
            status: InvoiceStatus::Approved,
            funded_by: zero_addr,
            created_at: env.ledger().timestamp(),
        };

        // Store the invoice
        env.storage().persistent().set(&DataKey::Invoice(invoice_id), &invoice);

        // Update seller's invoice list
        let mut seller_invoices: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::SellerInvoices(seller.clone()))
            .unwrap_or(vec![&env]);
        seller_invoices.push_back(invoice_id);
        env.storage()
            .persistent()
            .set(&DataKey::SellerInvoices(seller), &seller_invoices);

        // Increment counter
        env.storage().instance().set(&DataKey::NextId, &(invoice_id + 1));

        invoice_id
    }

    /// Get invoice details by ID.
    pub fn get_invoice(env: Env, invoice_id: u64) -> Invoice {
        env.storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found")
    }

    /// Get all invoice IDs for a given seller.
    pub fn get_seller_invoices(env: Env, seller: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::SellerInvoices(seller))
            .unwrap_or(vec![&env])
    }

    /// Update the status of an invoice. Only callable by admin.
    pub fn update_status(env: Env, invoice_id: u64, new_status: InvoiceStatus) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        invoice.status = new_status;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);
    }

    /// Set the funded_by address when an LP funds an invoice.
    pub fn set_funded_by(env: Env, invoice_id: u64, funder: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        invoice.funded_by = funder;
        invoice.status = InvoiceStatus::Funded;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);
    }

    /// Get the next invoice ID (useful for frontends).
    pub fn next_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextId).unwrap()
    }

    /// Get the admin address.
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

#[cfg(test)]
mod test;
