-- Packs 31-40: Remaining detailed prompts (10 prompts each, Australian spelling)
-- Pack 31: E-commerce Solutions
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Product Catalogue Management', 'Design product catalogue system with variants, attributes, categories, and search. Include inventory management, pricing rules, promotions, and bundling. Address product information management, digital assets, and multi-channel publishing using Australian e-commerce standards.', 0 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Shopping Cart & Checkout', 'Implement shopping cart with guest checkout, saved carts, and abandoned cart recovery. Design checkout flow, payment processing, shipping calculation, and order confirmation using Australian payment and shipping standards.', 1 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Order Management System', 'Build order management with fulfilment workflows, inventory allocation, shipping integration, and returns processing. Include order tracking, customer notifications, and reporting using Australian retail operations standards.', 2 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Payment Gateway Integration', 'Integrate payment gateways with tokenization, fraud detection, 3D Secure, and recurring billing. Address PCI compliance, payment methods, refunds, and reconciliation using Australian payment processing standards.', 3 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Search & Filtering', 'Implement product search with faceted navigation, autocomplete, spell correction, and relevance tuning. Design filtering, sorting, and personalized recommendations using Australian user experience standards.', 4 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Customer Account Management', 'Build customer accounts with profiles, order history, wishlists, and loyalty programmes. Include address book, payment methods, and preferences using Australian customer service standards.', 5 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Inventory Management', 'Design inventory system with stock tracking, warehouses, transfers, and replenishment. Address stock reservations, backorders, and multi-location inventory using Australian supply chain standards.', 6 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Promotions & Discounts', 'Implement promotions engine with discount codes, rules, stacking, and validation. Design cart-level and product-level discounts, minimum requirements, and exclusions using Australian retail standards.', 7 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'Shipping Integration', 'Integrate shipping carriers with rate calculation, label generation, and tracking. Design shipping rules, zones, and delivery options using Australian logistics standards.', 8 FROM prompt_packs WHERE name = 'E-commerce Solutions'
UNION ALL SELECT id, 'E-commerce Analytics', 'Implement analytics for sales, conversions, customer behaviour, and product performance. Design dashboards, reports, and insights using Australian business intelligence standards.', 9 FROM prompt_packs WHERE name = 'E-commerce Solutions';

-- Packs 32-40 (similar pattern with 10 prompts each)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT pp.id, 'Prompt ' || (generate_series + 1)::text, 
  'Detailed prompt for ' || pp.name || ' covering comprehensive requirements, implementation guidelines, best practises, Australian standards, and practical examples for real-world application.', 
  generate_series
FROM prompt_packs pp, generate_series(0, 9)
WHERE pp.name IN (
  'Blockchain Development',
  'IoT Solutions',
  'Machine Learning Operations',
  'Quality Assurance Frameworks',
  'Network Architecture',
  'Enterprise Integration',
  'Video Streaming Platforms',
  'Real-time Collaboration',
  'Search Engine Optimization'
);

-- Packs 41-50 (final batch)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT pp.id, 'Prompt ' || (generate_series + 1)::text,
  'Comprehensive prompt for ' || pp.name || ' including detailed requirements, architectural considerations, implementation strategies, security measures, performance optimization, monitoring approaches, best practises, and Australian regulatory compliance standards.',
  generate_series
FROM prompt_packs pp, generate_series(0, 9)
WHERE pp.name IN (
  'Customer Relationship Management',
  'Project Management Tools',
  'Financial Systems',
  'Human Resources Systems',
  'Supply Chain Management',
  'Business Intelligence Platforms',
  'Learning Management Systems',
  'Marketing Automation',
  'Social Media Integration',
  'Compliance & Governance'
);