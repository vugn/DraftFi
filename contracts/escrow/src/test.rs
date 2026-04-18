#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &usdc);
    assert_eq!(client.admin(), admin);
}

#[test]
fn test_create_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let lp = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    client.create_escrow(
        &1u64,           // invoice_id
        &lp,             // lp
        &seller,         // seller
        &5_000_0000000i128,  // total_amount
        &4_800_0000000i128,  // seller_payout
        &200_0000000i128,    // escrow_hold
        &1730000000u64,      // release_date
    );

    let record = client.get_escrow(&1u64);
    assert_eq!(record.invoice_id, 1u64);
    assert_eq!(record.lp, lp);
    assert_eq!(record.seller, seller);
    assert_eq!(record.escrow_hold, 200_0000000i128);
    assert_eq!(record.is_released, false);
    assert_eq!(record.is_disputed, false);
}

#[test]
fn test_lp_and_seller_escrows() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let lp = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    client.create_escrow(
        &1u64,
        &lp,
        &seller,
        &5_000_0000000i128,
        &4_800_0000000i128,
        &200_0000000i128,
        &1730000000u64,
    );

    client.create_escrow(
        &2u64,
        &lp,
        &seller,
        &12_000_0000000i128,
        &11_200_0000000i128,
        &800_0000000i128,
        &1730000000u64,
    );

    let lp_list = client.get_lp_escrows(&lp);
    assert_eq!(lp_list.len(), 2);

    let seller_list = client.get_seller_escrows(&seller);
    assert_eq!(seller_list.len(), 2);

    let active = client.get_active_escrows();
    assert_eq!(active.len(), 2);
}

#[test]
fn test_dispute() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let lp = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    client.create_escrow(
        &1u64,
        &lp,
        &seller,
        &5_000_0000000i128,
        &4_800_0000000i128,
        &200_0000000i128,
        &1730000000u64,
    );

    client.dispute(&1u64);

    let record = client.get_escrow(&1u64);
    assert_eq!(record.is_disputed, true);
}

#[test]
#[should_panic(expected = "invalid amounts")]
fn test_invalid_escrow_amounts() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let lp = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    // zero escrow hold should fail
    client.create_escrow(
        &1u64,
        &lp,
        &seller,
        &5_000_0000000i128,
        &5_000_0000000i128,
        &0i128,
        &1730000000u64,
    );
}
