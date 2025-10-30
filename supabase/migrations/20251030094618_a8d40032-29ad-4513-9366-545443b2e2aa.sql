-- Packs 12-13: E-commerce and Blockchain
-- Pack 12: E-commerce Development (10 prompts)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'E-commerce Platform Architecture', 'Design scalable e-commerce architecture. Include: 1) Microservices for product, cart, order, payment, 2) Database schema for products, inventory, orders, 3) Search and filtering implementation, 4) Caching strategy for performance, 5) CDN for assets and images, 6) Session management for cart, 7) API design for headless commerce, 8) Multi-tenancy for marketplace. Provide architecture diagrams and schemas using Australian spelling.', 1
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Product Catalogue & Inventory Management', 'Design product and inventory system. Include: 1) Product data model with variants and options, 2) Category and attribute management, 3) SKU generation and tracking, 4) Inventory tracking and reservations, 5) Stock level monitoring and alerts, 6) Warehouse management, 7) Product search with Elasticsearch, 8) Bulk import/export functionality. Provide data models and API designs using Australian spelling.', 2
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Shopping Cart & Checkout Flow', 'Implement cart and checkout system. Include: 1) Cart persistence (logged in and guest), 2) Cart operations (add, update, remove), 3) Checkout steps optimisation, 4) Address validation and autocomplete, 5) Shipping options calculation, 6) Discount and coupon application, 7) Tax calculation, 8) Guest checkout vs account creation. Provide implementation with state management using Australian spelling.', 3
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Payment Gateway Integration', 'Integrate payment processing. Include: 1) Stripe, PayPal, or Square integration, 2) Payment flow (redirect, embedded, hosted), 3) Multiple payment methods support, 4) Payment security (PCI compliance), 5) 3D Secure authentication, 6) Webhook handling for payment events, 7) Refund and chargeback processing, 8) Payment reconciliation. Provide secure integration examples using Australian spelling.', 4
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Order Management System', 'Design order processing system. Include: 1) Order lifecycle states and transitions, 2) Order fulfilment workflow, 3) Shipping integration and tracking, 4) Return and refund processing, 5) Order notifications (email, SMS), 6) Invoice generation, 7) Order history and tracking for customers, 8) Admin order management. Provide order processing workflows using Australian spelling.', 5
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Customer Account & Authentication', 'Implement customer account system. Include: 1) Registration and login flows, 2) Social authentication integration, 3) Profile management, 4) Order history and tracking, 5) Wishlist and saved items, 6) Address book management, 7) Password reset and email verification, 8) Account deletion (GDPR). Provide authentication implementation using Australian spelling.', 6
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Product Recommendations & Personalization', 'Implement recommendation engine. Include: 1) Collaborative filtering algorithms, 2) Content-based recommendations, 3) Trending and popular products, 4) Personalized homepage, 5) Recently viewed products, 6) Cross-sell and upsell strategies, 7) A/B testing for recommendations, 8) Analytics integration. Provide recommendation implementation using Australian spelling.', 7
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'SEO & Marketing Optimisation', 'Optimise e-commerce for SEO and marketing. Include: 1) Product page SEO (title, meta, schema), 2) URL structure optimisation, 3) Sitemap generation, 4) Open Graph tags for social sharing, 5) Google Shopping feed, 6) Email marketing integration, 7) Abandoned cart recovery, 8) Analytics and conversion tracking. Provide SEO implementation examples using Australian spelling.', 8
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'Multi-language & Multi-currency', 'Implement internationalisation. Include: 1) Language detection and switching, 2) Translation management, 3) Currency conversion and display, 4) Localised pricing, 5) Geolocation for defaults, 6) Date and number formatting, 7) RTL language support, 8) Region-specific payment methods. Provide i18n implementation using Australian spelling.', 9
FROM prompt_packs WHERE name = 'E-commerce Development'
UNION ALL
SELECT id, 'E-commerce Analytics & Reporting', 'Implement analytics and reporting. Include: 1) Sales and revenue reporting, 2) Product performance analytics, 3) Customer behaviour tracking, 4) Conversion funnel analysis, 5) Cart abandonment tracking, 6) Inventory reports, 7) Customer lifetime value, 8) Custom dashboard creation. Provide analytics implementation and dashboard examples using Australian spelling.', 10
FROM prompt_packs WHERE name = 'E-commerce Development';

-- Pack 13: Blockchain & Web3 (10 prompts)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Smart Contract Development', 'Develop secure smart contracts. Include: 1) Solidity contract structure, 2) State variable and function design, 3) Access control and modifiers, 4) Event emission for logging, 5) Gas optimisation techniques, 6) Reentrancy prevention, 7) Upgradeable contract patterns, 8) Testing with Hardhat or Truffle. Provide contract examples with security best practises using Australian spelling.', 1
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'DApp Frontend Development', 'Build decentralised application frontend. Include: 1) Web3.js or Ethers.js integration, 2) Wallet connection (MetaMask, WalletConnect), 3) Contract interaction patterns, 4) Transaction handling and confirmation, 5) Event listening and updates, 6) IPFS integration for assets, 7) Error handling for blockchain, 8) Multi-chain support. Provide React DApp examples using Australian spelling.', 2
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'NFT Marketplace Development', 'Build NFT marketplace. Include: 1) ERC-721/ERC-1155 implementation, 2) Minting functionality, 3) Marketplace contract for listings, 4) Bidding and auction mechanisms, 5) Royalty implementation, 6) Metadata storage on IPFS, 7) Frontend for browsing and trading, 8) Wallet integration. Provide NFT marketplace contracts and UI using Australian spelling.', 3
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'DeFi Protocol Development', 'Develop DeFi protocol. Include: 1) Token economics design, 2) Liquidity pool implementation, 3) Automated market maker (AMM) logic, 4) Staking and yield farming, 5) Governance mechanisms, 6) Oracle integration for prices, 7) Flash loan protection, 8) Audit considerations. Provide DeFi contract examples using Australian spelling.', 4
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'Blockchain Security & Auditing', 'Audit smart contracts for security. Include: 1) Common vulnerabilities (reentrancy, overflow, front-running), 2) Static analysis with Slither, 3) Formal verification approaches, 4) Manual code review checklist, 5) Test coverage requirements, 6) Gas optimisation, 7) Upgradability risks, 8) Post-deployment monitoring. Provide audit checklist and tools usage using Australian spelling.', 5
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'Token Standards Implementation', 'Implement token standards. Include: 1) ERC-20 for fungible tokens, 2) ERC-721 for NFTs, 3) ERC-1155 for multi-token, 4) Token minting and burning, 5) Allowance and approval mechanisms, 6) Metadata standards, 7) Token vesting and locks, 8) Supply cap mechanisms. Provide token contract implementations using Australian spelling.', 6
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'IPFS & Decentralised Storage', 'Implement decentralised storage. Include: 1) IPFS node setup and usage, 2) File upload and pinning strategies, 3) Content addressing and CID, 4) Metadata storage for NFTs, 5) Pinning services (Pinata, Infura), 6) Gateway usage, 7) Content retrieval patterns, 8) Storage cost optimisation. Provide IPFS integration examples using Australian spelling.', 7
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'Multi-chain & Cross-chain Development', 'Build multi-chain applications. Include: 1) Chain detection and switching, 2) Contract deployment across chains, 3) Bridge integration for assets, 4) Chain-specific optimisations, 5) Unified wallet experience, 6) Gas token handling, 7) Cross-chain messaging, 8) Layer 2 integration. Provide multi-chain implementation using Australian spelling.', 8
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'DAO Governance Implementation', 'Build DAO governance system. Include: 1) Governance token distribution, 2) Proposal creation and voting, 3) Voting mechanisms (token-weighted, quadratic), 4) Timelock for execution, 5) Treasury management, 6) Delegation patterns, 7) Quorum requirements, 8) On-chain vs off-chain voting. Provide DAO contract examples using Australian spelling.', 9
FROM prompt_packs WHERE name = 'Blockchain & Web3'
UNION ALL
SELECT id, 'Blockchain Analytics & Monitoring', 'Implement blockchain monitoring. Include: 1) Transaction monitoring and indexing, 2) Event log parsing, 3) The Graph protocol usage, 4) On-chain analytics, 5) Wallet tracking, 6) Gas price monitoring, 7) Contract interaction analytics, 8) Alert systems for events. Provide monitoring setup and analytics queries using Australian spelling.', 10
FROM prompt_packs WHERE name = 'Blockchain & Web3';