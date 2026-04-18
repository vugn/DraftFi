#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};
use types::InvoiceStatus;

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(InvoiceRegistryContract, ());
    let client = InvoiceRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);

    client.initialize(&admin, &usdc);
    assert_eq!(client.admin(), admin);
    assert_eq!(client.next_id(), 1u64);
}

#[test]
fn test_mint_invoice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(InvoiceRegistryContract, ());
    let client = InvoiceRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    let invoice_id = client.mint_invoice(
        &seller,
        &String::from_str(&env, "TechCorp Inc."),
        &5_000_0000000i128, // $5,000 with 7 decimals
        &4_800_0000000i128, // $4,800 offered
        &1730000000u64,     // due date
        &98u32,             // risk score
        &String::from_str(&env, "A+"),
    );

    assert_eq!(invoice_id, 1u64);

    let invoice = client.get_invoice(&invoice_id);
    assert_eq!(invoice.seller, seller);
    assert_eq!(invoice.amount, 5_000_0000000i128);
    assert_eq!(invoice.offered_amount, 4_800_0000000i128);
    assert_eq!(invoice.risk_score, 98u32);
    assert_eq!(invoice.status, InvoiceStatus::Approved);
}

#[test]
fn test_seller_invoices() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(InvoiceRegistryContract, ());
    let client = InvoiceRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    // Mint two invoices for the same seller
    client.mint_invoice(
        &seller,
        &String::from_str(&env, "Client A"),
        &1_000_0000000i128,
        &900_0000000i128,
        &1730000000u64,
        &85u32,
        &String::from_str(&env, "A"),
    );

    client.mint_invoice(
        &seller,
        &String::from_str(&env, "Client B"),
        &2_000_0000000i128,
        &1_800_0000000i128,
        &1730000000u64,
        &72u32,
        &String::from_str(&env, "B+"),
    );

    let ids = client.get_seller_invoices(&seller);
    assert_eq!(ids.len(), 2);
    assert_eq!(ids.get(0).unwrap(), 1u64);
    assert_eq!(ids.get(1).unwrap(), 2u64);
}

#[test]
fn test_update_status() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(InvoiceRegistryContract, ());
    let client = InvoiceRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    let invoice_id = client.mint_invoice(
        &seller,
        &String::from_str(&env, "TechCorp"),
        &5_000_0000000i128,
        &4_800_0000000i128,
        &1730000000u64,
        &98u32,
        &String::from_str(&env, "A+"),
    );

    client.update_status(&invoice_id, &InvoiceStatus::Listed);
    let invoice = client.get_invoice(&invoice_id);
    assert_eq!(invoice.status, InvoiceStatus::Listed);
}

#[test]
#[should_panic(expected = "invalid amounts")]
fn test_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(InvoiceRegistryContract, ());
    let client = InvoiceRegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let usdc = Address::generate(&env);
    let seller = Address::generate(&env);

    client.initialize(&admin, &usdc);

    // offered_amount > amount should fail
    client.mint_invoice(
        &seller,
        &String::from_str(&env, "Bad Invoice"),
        &1_000_0000000i128,
        &2_000_0000000i128,  // more than face value!
        &1730000000u64,
        &50u32,
        &String::from_str(&env, "C"),
    );
}
