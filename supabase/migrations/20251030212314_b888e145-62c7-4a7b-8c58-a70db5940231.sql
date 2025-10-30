-- Landscaping Pack - All 10 prompts
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Garden Design Proposal', 'Create a comprehensive landscape design proposal for [CLIENT_NAME] at [PROPERTY_ADDRESS]. Include detailed site analysis covering soil conditions, drainage, sunlight patterns, and existing vegetation. Develop design concepts incorporating Australian native plants suitable for the local climate and water restrictions. Provide 3D visualisations or detailed sketches, plant schedules with botanical names, hardscape materials specifications, and maintenance requirements. Include project timeline, itemised costings for materials and labour, and seasonal planting recommendations.', 1
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Water-Wise Garden Plan', 'Design a drought-tolerant, water-efficient garden for [LOCATION] complying with local water restrictions. Select appropriate native and adapted plants requiring minimal irrigation. Specify efficient irrigation systems including drip systems, smart controllers, and rainwater harvesting solutions. Include mulching strategies, soil improvement recommendations, and zoning plans for different water needs. Calculate estimated water usage reduction and annual cost savings. Provide maintenance schedule optimised for water conservation.', 2
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Commercial Landscape Maintenance Contract', 'Develop a comprehensive maintenance contract for [COMMERCIAL_PROPERTY] covering all grounds keeping services. Detail frequency and scope of mowing, edging, pruning, fertilising, pest control, and irrigation management. Include seasonal tasks, plant replacement schedules, and emergency response procedures. Specify quality standards, performance metrics, and inspection protocols. Provide detailed pricing structure with options for basic, standard, and premium service levels. Include terms for additional works, price escalation clauses, and contract duration options.', 3
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Native Garden Species Selection', 'Recommend appropriate Australian native plants for [GARDEN_TYPE] in [CLIMATE_ZONE] considering local council requirements and environmental factors. Provide detailed plant profiles including mature size, growth rate, flower colour and season, water requirements, and maintenance needs. Group plants by design function (screening, feature, groundcover, accent). Include planting densities, companion planting suggestions, and wildlife attraction benefits. Address local pest and disease issues specific to each species. Provide sourcing information for local native nurseries.', 4
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Outdoor Living Space Design', 'Design a functional and aesthetically pleasing outdoor entertainment area for [PROPERTY_TYPE]. Include paving or decking specifications, outdoor kitchen/BBQ area, seating zones, lighting design, and shade solutions. Specify materials suitable for Australian climate conditions considering durability, maintenance, and heat reflection. Address privacy screening, wind protection, and integration with existing landscape. Include electrical and plumbing requirements, council approval needs, and detailed cost breakdown. Provide 3D renders or detailed plans with dimensions.', 5
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Landscape Pest and Disease Management', 'Develop an integrated pest and disease management plan for [GARDEN_TYPE] using environmentally responsible methods. Identify common pests and diseases in [REGION] and their symptoms. Recommend prevention strategies including plant selection, cultural practices, and biological controls. Provide treatment protocols prioritising organic and low-toxicity options compliant with Australian pesticide regulations. Include monitoring schedules, intervention thresholds, and record-keeping templates. Address specific issues like scale, aphids, fungal diseases, and native plant pathogens.', 6
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Lawn Renovation and Care Program', 'Create a comprehensive lawn renovation program for [LAWN_AREA] square metres of [GRASS_TYPE]. Include soil testing and amendment recommendations, drainage improvements, and renovation techniques (coring, dethatching, overseeding). Develop a 12-month maintenance calendar covering mowing heights and frequency, fertilisation schedule, pest and disease management, and irrigation requirements. Address specific Australian lawn issues including buffalo grass decline, couch invasion, and lawn beetle damage. Provide cost estimates and equipment requirements.', 7
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Retaining Wall Design Specification', 'Prepare detailed specifications for a retaining wall at [LOCATION] with [HEIGHT] height difference. Include structural engineering requirements, material options (timber, stone, concrete, brick), and drainage solutions. Address Australian Standards compliance, footing requirements, and soil stability considerations. Specify construction methodology, reinforcement needs, and council approval requirements. Include detailed costing for materials and labour, maintenance considerations, and landscaping integration. Provide cross-section drawings and construction sequence.', 8
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Garden Lighting Design Plan', 'Design a comprehensive outdoor lighting scheme for [PROPERTY_TYPE] balancing aesthetics, functionality, and energy efficiency. Include pathway lighting, feature lighting for plants and structures, security lighting, and entertainment area illumination. Specify LED fixtures suitable for Australian outdoor conditions, voltage options (mains vs low voltage), and smart control systems. Provide electrical load calculations, positioning plans, and installation requirements. Include maintenance schedules, energy consumption estimates, and compliance with Australian Standards. Calculate ROI for solar-powered options.', 9
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Sustainable Landscaping Practices Guide', 'Develop a comprehensive sustainability plan for [LANDSCAPE_PROJECT] incorporating environmental best practices. Address water conservation through rainwater harvesting, greywater systems, and efficient irrigation. Include soil health improvement using composting, mulching, and organic amendments. Specify renewable materials, recycled products, and local sourcing options. Design for biodiversity with native plantings, wildlife habitats, and pollinator gardens. Calculate carbon footprint reduction, waste minimisation strategies, and long-term environmental benefits. Include certification pathways for sustainable landscape accreditation.', 10
FROM prompt_packs WHERE name = 'Landscaping & Garden Design';