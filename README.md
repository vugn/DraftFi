# DraftFi

DraftFi is a Stellar-native invoice liquidity protocol that helps freelancers and SMB agencies turn unpaid invoices into instant USDC cash flow.

It combines AI-assisted underwriting with Soroban smart contracts to create a transparent, low-friction, community-funded financing rail for the global remote economy.

## Problem

Small teams and independent professionals often wait 30 to 90 days for invoice payments.

That delay creates a cash-flow gap that blocks growth, payroll, and delivery capacity. Traditional factoring is slow, opaque, and often inaccessible to smaller operators.

## Solution

DraftFi creates a programmable invoice financing market:

1. Seller submits invoice data.
2. Underwriting assigns risk profile.
3. Invoice is listed on-chain.
4. Liquidity provider funds the invoice in USDC.
5. Seller receives immediate payout.
6. Escrow and settlement logic enforce transparent release conditions.

## Product Highlights

- AI-assisted underwriting to speed up decisioning.
- Soroban contracts for listing, funding, escrow, and protocol controls.
- USDC-based settlement on Stellar testnet.
- Clean, simple UX for non-crypto-native users.

## Technical Architecture

### Smart Contracts

- DraftFi Core: Protocol config, fee controls, risk threshold, pause controls.
- Invoice Registry: Invoice minting, status lifecycle, seller indexing.
- Marketplace: Listing and LP funding logic.
- Escrow: Hold, release, dispute, and resolution flows.

### Frontend Stack

- Next.js application for seller and LP workflows.
- Stellar wallet integration for transaction signing.
- Contract SDK wrappers for typed contract interactions.

## Stellar Testnet Deployment

Network: Stellar Testnet  
Network Passphrase: Test SDF Network ; September 2015  
Soroban RPC: https://soroban-testnet.stellar.org  
Horizon: https://horizon-testnet.stellar.org

| Contract         | Testnet Contract ID                                      |
| ---------------- | -------------------------------------------------------- |
| Invoice Registry | CAVXMNHXEJDSLRZRV5FVSLCUQE2MSTAHVDNMM7R4JAGJEHGDGIBH7S65 |
| Marketplace      | CARGBDS37Q5ZWWIKFSEDA2AIRF5MDZWMGWFSGCKULR66X6BBLM44FDHD |
| Escrow           | CDKGNHOJTXQVRXA242YMLSRMCITAAZYG7VZ5E2C5PFADQUO7G76O7WCB |
| DraftFi Core     | CCBFEMK44JL6VMTYGQ2U4T6B5ASEOZWREYH4QNMPEFLF7DDEN7TWERT4 |
| USDC Token       | CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC |

## Demo Screenshots

All screenshots below were captured automatically from the local app.

### Auth Screen

![DraftFi Auth Screen](assets/screenshots/01-auth-screen.png)

### Seller Dashboard

![DraftFi Seller Dashboard](assets/screenshots/02-seller-dashboard.png)

### Marketplace

![DraftFi Marketplace](assets/screenshots/03-marketplace.png)

### Escrow Status

![DraftFi Escrow Status](assets/screenshots/04-escrow-status.png)

### History

![DraftFi History](assets/screenshots/05-history.png)

### Settings

![DraftFi Settings](assets/screenshots/06-settings.png)

## Business Model

- Origination fee per funded invoice.
- Spread between discounted purchase and invoice face value.
- Settlement and service fees for payment routing workflows.

## Roadmap

- Mainnet-ready deployment hardening and monitoring.
- More underwriting data connectors and score explainability.
- LP analytics and performance dashboards.
- Anchor and payment rail integrations for end-to-end settlement.

## Vision

DraftFi aims to become the default liquidity layer for invoice-backed cash flow in the Stellar ecosystem.

The long-term goal is simple: move productive financing on-chain, make capital access faster for builders, and turn community liquidity into real-world economic impact.
