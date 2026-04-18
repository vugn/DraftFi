#![no_std]

mod types;

use soroban_sdk::{contract, contractimpl, token, vec, Address, Env, Vec};
use types::{DataKey, EscrowRecord};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the escrow contract.
    pub fn initialize(env: Env, admin: Address, usdc_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);

        let empty: Vec<u64> = vec![&env];
        env.storage()
            .instance()
            .set(&DataKey::ActiveEscrows, &empty);
    }

    /// Create a new escrow record when an invoice is funded.
    ///
    /// This is typically called by the Marketplace contract after transferring
    /// USDC to this contract's address.
    pub fn create_escrow(
        env: Env,
        invoice_id: u64,
        lp: Address,
        seller: Address,
        total_amount: i128,
        seller_payout: i128,
        escrow_hold: i128,
        release_date: u64,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if total_amount <= 0 || escrow_hold <= 0 {
            panic!("invalid amounts");
        }

        let record = EscrowRecord {
            invoice_id,
            lp: lp.clone(),
            seller: seller.clone(),
            total_amount,
            seller_payout,
            escrow_hold,
            release_date,
            is_released: false,
            is_disputed: false,
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(invoice_id), &record);

        // Track by LP
        let mut lp_escrows: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::LpEscrows(lp.clone()))
            .unwrap_or(vec![&env]);
        lp_escrows.push_back(invoice_id);
        env.storage()
            .persistent()
            .set(&DataKey::LpEscrows(lp), &lp_escrows);

        // Track by seller
        let mut seller_escrows: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::SellerEscrows(seller.clone()))
            .unwrap_or(vec![&env]);
        seller_escrows.push_back(invoice_id);
        env.storage()
            .persistent()
            .set(&DataKey::SellerEscrows(seller), &seller_escrows);

        // Track active escrows
        let mut active: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ActiveEscrows)
            .unwrap_or(vec![&env]);
        active.push_back(invoice_id);
        env.storage()
            .instance()
            .set(&DataKey::ActiveEscrows, &active);
    }

    /// Release escrowed funds to the LP after the invoice matures.
    ///
    /// This transfers the escrowed USDC (escrow_hold + yield) back to the LP.
    /// Can only be called by admin after the release_date has passed.
    pub fn release(env: Env, invoice_id: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(invoice_id))
            .expect("escrow not found");

        if record.is_released {
            panic!("already released");
        }
        if record.is_disputed {
            panic!("escrow is disputed");
        }

        let current_time = env.ledger().timestamp();
        if current_time < record.release_date {
            panic!("release date not reached");
        }

        // Transfer escrowed USDC back to LP
        let usdc_token: Address = env.storage().instance().get(&DataKey::UsdcToken).unwrap();
        let usdc = token::Client::new(&env, &usdc_token);

        // The escrow contract holds the funds, transfer to LP
        let contract_address = env.current_contract_address();
        usdc.transfer(&contract_address, &record.lp, &record.escrow_hold);

        record.is_released = true;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(invoice_id), &record);

        // Remove from active escrows
        let active: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::ActiveEscrows)
            .unwrap_or(vec![&env]);
        let mut new_active: Vec<u64> = vec![&env];
        for id in active.iter() {
            if id != invoice_id {
                new_active.push_back(id);
            }
        }
        env.storage()
            .instance()
            .set(&DataKey::ActiveEscrows, &new_active);
    }

    /// Flag an escrow as disputed (admin only).
    pub fn dispute(env: Env, invoice_id: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(invoice_id))
            .expect("escrow not found");

        if record.is_released {
            panic!("already released, cannot dispute");
        }

        record.is_disputed = true;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(invoice_id), &record);
    }

    /// Resolve a dispute — admin decides whether to release to LP or refund.
    pub fn resolve_dispute(env: Env, invoice_id: u64, release_to_lp: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(invoice_id))
            .expect("escrow not found");

        if !record.is_disputed {
            panic!("not disputed");
        }
        if record.is_released {
            panic!("already released");
        }

        let usdc_token: Address = env.storage().instance().get(&DataKey::UsdcToken).unwrap();
        let usdc = token::Client::new(&env, &usdc_token);
        let contract_address = env.current_contract_address();

        if release_to_lp {
            usdc.transfer(&contract_address, &record.lp, &record.escrow_hold);
        } else {
            // Refund to seller (e.g., if invoice was legitimate but LP disputed)
            usdc.transfer(&contract_address, &record.seller, &record.escrow_hold);
        }

        record.is_released = true;
        record.is_disputed = false;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(invoice_id), &record);
    }

    /// Get an escrow record by invoice ID.
    pub fn get_escrow(env: Env, invoice_id: u64) -> EscrowRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(invoice_id))
            .expect("escrow not found")
    }

    /// Get all escrow IDs for an LP.
    pub fn get_lp_escrows(env: Env, lp: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::LpEscrows(lp))
            .unwrap_or(vec![&env])
    }

    /// Get all escrow IDs for a seller.
    pub fn get_seller_escrows(env: Env, seller: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::SellerEscrows(seller))
            .unwrap_or(vec![&env])
    }

    /// Get all active (unreleased) escrow IDs.
    pub fn get_active_escrows(env: Env) -> Vec<u64> {
        env.storage()
            .instance()
            .get(&DataKey::ActiveEscrows)
            .unwrap_or(vec![&env])
    }

    /// Get the admin address.
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

#[cfg(test)]
mod test;
