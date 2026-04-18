#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &50u32, &60u32, &400u32);

    let config = client.get_config();
    assert_eq!(config.admin, admin);
    assert_eq!(config.fee_bps, 50u32);
    assert_eq!(config.min_risk_score, 60u32);
    assert_eq!(config.escrow_hold_bps, 400u32);
    assert_eq!(config.is_paused, false);
}

#[test]
fn test_set_fee() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &50u32, &60u32, &400u32);

    client.set_fee(&100u32);
    let config = client.get_config();
    assert_eq!(config.fee_bps, 100u32);
}

#[test]
fn test_set_min_risk_score() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &50u32, &60u32, &400u32);

    client.set_min_risk_score(&75u32);
    let config = client.get_config();
    assert_eq!(config.min_risk_score, 75u32);
}

#[test]
fn test_pause_unpause() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &50u32, &60u32, &400u32);

    client.pause();
    let config = client.get_config();
    assert_eq!(config.is_paused, true);

    client.unpause();
    let config = client.get_config();
    assert_eq!(config.is_paused, false);
}

#[test]
fn test_transfer_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let new_admin = Address::generate(&env);

    client.initialize(&admin, &50u32, &60u32, &400u32);
    client.transfer_admin(&new_admin);

    let config = client.get_config();
    assert_eq!(config.admin, new_admin);
}

#[test]
#[should_panic(expected = "fee too high")]
fn test_fee_too_high() {
    let env = Env::default();
    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &1500u32, &60u32, &400u32); // 15% fee should panic
}

#[test]
fn test_set_escrow_hold() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DraftFiCoreContract, ());
    let client = DraftFiCoreContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &50u32, &60u32, &400u32);

    client.set_escrow_hold(&500u32);
    let config = client.get_config();
    assert_eq!(config.escrow_hold_bps, 500u32);
}
