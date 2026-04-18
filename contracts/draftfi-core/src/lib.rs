#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

/// Platform configuration stored on-chain.
#[derive(Clone, Debug)]
#[contracttype]
pub struct Config {
    /// Admin address
    pub admin: Address,
    /// Platform fee in basis points (e.g., 50 = 0.5%)
    pub fee_bps: u32,
    /// Minimum acceptable AI risk score (0-100)
    pub min_risk_score: u32,
    /// Escrow hold percentage in basis points (e.g., 400 = 4%)
    pub escrow_hold_bps: u32,
    /// Whether the platform is paused
    pub is_paused: bool,
}

/// Storage keys for the DraftFi Core contract.
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Config,
}

#[contract]
pub struct DraftFiCoreContract;

#[contractimpl]
impl DraftFiCoreContract {
    /// Initialize the platform configuration.
    pub fn initialize(
        env: Env,
        admin: Address,
        fee_bps: u32,
        min_risk_score: u32,
        escrow_hold_bps: u32,
    ) {
        if env.storage().instance().has(&DataKey::Config) {
            panic!("already initialized");
        }

        if fee_bps > 1000 {
            panic!("fee too high (max 10%)");
        }
        if min_risk_score > 100 {
            panic!("invalid risk score");
        }
        if escrow_hold_bps > 5000 {
            panic!("escrow hold too high (max 50%)");
        }

        let config = Config {
            admin,
            fee_bps,
            min_risk_score,
            escrow_hold_bps,
            is_paused: false,
        };

        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Get the current platform configuration.
    pub fn get_config(env: Env) -> Config {
        env.storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized")
    }

    /// Update the platform fee (admin only).
    pub fn set_fee(env: Env, new_fee_bps: u32) {
        let mut config: Config = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        config.admin.require_auth();

        if new_fee_bps > 1000 {
            panic!("fee too high (max 10%)");
        }

        config.fee_bps = new_fee_bps;
        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Update the minimum risk score threshold (admin only).
    pub fn set_min_risk_score(env: Env, score: u32) {
        let mut config: Config = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        config.admin.require_auth();

        if score > 100 {
            panic!("invalid risk score");
        }

        config.min_risk_score = score;
        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Update the escrow hold percentage (admin only).
    pub fn set_escrow_hold(env: Env, new_bps: u32) {
        let mut config: Config = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        config.admin.require_auth();

        if new_bps > 5000 {
            panic!("escrow hold too high (max 50%)");
        }

        config.escrow_hold_bps = new_bps;
        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Pause the platform (admin only). When paused, no new invoices can be minted or funded.
    pub fn pause(env: Env) {
        let mut config: Config = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        config.admin.require_auth();
        config.is_paused = true;
        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Unpause the platform (admin only).
    pub fn unpause(env: Env) {
        let mut config: Config = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        config.admin.require_auth();
        config.is_paused = false;
        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Transfer admin rights to a new address (current admin only).
    pub fn transfer_admin(env: Env, new_admin: Address) {
        let mut config: Config = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        config.admin.require_auth();
        config.admin = new_admin;
        env.storage().instance().set(&DataKey::Config, &config);
    }
}

#[cfg(test)]
mod test;
