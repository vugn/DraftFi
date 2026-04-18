#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let registry = Address::generate(&env);
    let escrow = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &registry, &escrow, &usdc, &50u32);
    assert_eq!(client.admin(), admin);
}

#[test]
fn test_list_invoice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let registry = Address::generate(&env);
    let escrow = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &registry, &escrow, &usdc, &50u32);

    let invoice_id = client.list_invoice(
        &seller,
        &1u64,
        &4_800_0000000i128,
        &5_000_0000000i128,
        &1730000000u64,
        &String::from_str(&env, "A+"),
    );

    assert_eq!(invoice_id, 1u64);

    let listing = client.get_listing(&invoice_id);
    assert_eq!(listing.seller, seller);
    assert_eq!(listing.asking_price, 4_800_0000000i128);
    assert_eq!(listing.is_active, true);
}

#[test]
fn test_active_listings() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let registry = Address::generate(&env);
    let escrow = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &registry, &escrow, &usdc, &50u32);

    client.list_invoice(
        &seller,
        &1u64,
        &4_800_0000000i128,
        &5_000_0000000i128,
        &1730000000u64,
        &String::from_str(&env, "A+"),
    );

    client.list_invoice(
        &seller,
        &2u64,
        &11_200_0000000i128,
        &12_000_0000000i128,
        &1730000000u64,
        &String::from_str(&env, "A"),
    );

    let active = client.get_active_listings();
    assert_eq!(active.len(), 2);
}

#[test]
fn test_delist_invoice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let registry = Address::generate(&env);
    let escrow = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &registry, &escrow, &usdc, &50u32);

    client.list_invoice(
        &seller,
        &1u64,
        &4_800_0000000i128,
        &5_000_0000000i128,
        &1730000000u64,
        &String::from_str(&env, "A+"),
    );

    client.delist_invoice(&seller, &1u64);

    let listing = client.get_listing(&1u64);
    assert_eq!(listing.is_active, false);

    let active = client.get_active_listings();
    assert_eq!(active.len(), 0);
}

#[test]
#[should_panic(expected = "asking price must be between 0 and face value")]
fn test_invalid_listing_price() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MarketplaceContract, ());
    let client = MarketplaceContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let registry = Address::generate(&env);
    let escrow = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &registry, &escrow, &usdc, &50u32);

    // asking_price >= face_value should fail
    client.list_invoice(
        &seller,
        &1u64,
        &5_000_0000000i128,
        &5_000_0000000i128,
        &1730000000u64,
        &String::from_str(&env, "A"),
    );
}
