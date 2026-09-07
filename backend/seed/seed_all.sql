-- ================================================================
-- ROAMEO — Complete Seed Data (run this in Supabase SQL Editor)
-- This inserts ALL the demo data in one go
-- ================================================================

-- ─── UDYAM REFERENCES ─────────────────────────────────────────
INSERT INTO udyam_references (udyam_number, business_name, owner_name, business_type, district, state, date_of_registration, status) VALUES
('UDYAM-TN-01-0000001', 'Mahabalipuram Stone Arts', 'Rajesh Kumar', 'Micro', 'Chengalpattu', 'Tamil Nadu', '2020-03-15', 'active'),
('UDYAM-TN-01-0000002', 'Sea Shore Handicrafts', 'Lakshmi Devi', 'Micro', 'Chengalpattu', 'Tamil Nadu', '2019-07-22', 'active'),
('UDYAM-TN-01-0000003', 'Heritage Arts & Crafts', 'Suresh Babu', 'Small', 'Chengalpattu', 'Tamil Nadu', '2021-01-10', 'active'),
('UDYAM-TN-01-0000004', 'Pondicherry Artisans', 'Marie Claire', 'Micro', 'Puducherry', 'Puducherry', '2020-11-05', 'active'),
('UDYAM-TN-01-0000005', 'Thanjavur Paintings Co', 'Meenakshi Sundaram', 'Small', 'Thanjavur', 'Tamil Nadu', '2018-06-18', 'active'),
('UDYAM-TN-01-0000006', 'Madurai Silk House', 'Muthu Lakshmi', 'Medium', 'Madurai', 'Tamil Nadu', '2017-09-30', 'active'),
('UDYAM-TN-01-0000007', 'Kanchipuram Weavers', 'Senthil Kumar', 'Small', 'Kanchipuram', 'Tamil Nadu', '2019-04-12', 'active'),
('UDYAM-TN-01-0000008', 'Rameswaram Shell Crafts', 'Abdul Rahman', 'Micro', 'Ramanathapuram', 'Tamil Nadu', '2021-08-25', 'active'),
('UDYAM-TN-01-0000009', 'Chettinad Pottery Works', 'Arunachalam', 'Small', 'Sivaganga', 'Tamil Nadu', '2020-02-14', 'active'),
('UDYAM-TN-01-0000010', 'Kumbakonam Bronze Arts', 'Gopalakrishnan', 'Micro', 'Thanjavur', 'Tamil Nadu', '2019-12-01', 'active'),
('UDYAM-TN-01-0000011', 'Nilgiri Tea Exports', 'David Samuel', 'Small', 'Nilgiris', 'Tamil Nadu', '2018-03-20', 'active'),
('UDYAM-TN-01-0000012', 'Chennai Leather Goods', 'Farhan Ali', 'Medium', 'Chennai', 'Tamil Nadu', '2017-11-15', 'active'),
('UDYAM-TN-01-0000013', 'Coimbatore Handicrafts', 'Priya Ramesh', 'Micro', 'Coimbatore', 'Tamil Nadu', '2021-05-08', 'active'),
('UDYAM-TN-01-0000014', 'Trichy Temple Crafts', 'Venkatesh Iyer', 'Small', 'Tiruchirappalli', 'Tamil Nadu', '2020-07-19', 'active'),
('UDYAM-TN-01-0000015', 'Salem Steel Artworks', 'Karthikeyan', 'Micro', 'Salem', 'Tamil Nadu', '2019-10-03', 'active'),
('UDYAM-TN-01-0000016', 'Tirunelveli Palm Crafts', 'Mariammal', 'Micro', 'Tirunelveli', 'Tamil Nadu', '2021-02-28', 'active'),
('UDYAM-TN-01-0000017', 'Nagapattinam Boat Crafts', 'Selvam', 'Small', 'Nagapattinam', 'Tamil Nadu', '2020-09-11', 'active'),
('UDYAM-TN-01-0000018', 'Vellore Leather Works', 'Hussain Khan', 'Medium', 'Vellore', 'Tamil Nadu', '2018-08-07', 'active'),
('UDYAM-TN-01-0000019', 'Kodaikanal Handlooms', 'Jayanthi', 'Micro', 'Dindigul', 'Tamil Nadu', '2019-06-14', 'active'),
('UDYAM-TN-01-0000020', 'Ooty Eucalyptus Products', 'Thomas George', 'Small', 'Nilgiris', 'Tamil Nadu', '2020-04-22', 'active')
ON CONFLICT DO NOTHING;

-- ─── DESTINATIONS ──────────────────────────────────────────────
INSERT INTO destinations (name, description, state, district, latitude, longitude, image_url, category, highlights) VALUES
(
    'Mahabalipuram',
    'An ancient port city and UNESCO World Heritage Site known for its stunning rock-cut temples, monolithic rathas, and the iconic Shore Temple.',
    'Tamil Nadu', 'Chengalpattu', 12.6269, 80.1927,
    'https://images.unsplash.com/photo-1621427169898-8b0553e5a29f?w=800',
    'heritage',
    ARRAY['UNESCO World Heritage Site', 'Shore Temple', 'Pancha Rathas', 'Stone Sculptures', 'Beach']
),
(
    'Pondicherry',
    'A charming coastal city with French colonial heritage, vibrant streets, serene beaches, and the spiritual township of Auroville.',
    'Puducherry', 'Puducherry', 11.9416, 79.8083,
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    'cultural',
    ARRAY['French Quarter', 'Promenade Beach', 'Auroville', 'Sri Aurobindo Ashram', 'Cafes']
),
(
    'Madurai',
    'One of the oldest continuously inhabited cities in the world, famous for the magnificent Meenakshi Amman Temple.',
    'Tamil Nadu', 'Madurai', 9.9252, 78.1198,
    'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=800',
    'religious',
    ARRAY['Meenakshi Temple', 'Thirumalai Nayakkar Palace', 'Gandhi Museum', 'Banana Market', 'Jasmine City']
),
(
    'Thanjavur',
    'The cultural capital of Tamil Nadu, home to the magnificent Brihadeeswarar Temple — a UNESCO World Heritage Site.',
    'Tamil Nadu', 'Thanjavur', 10.7870, 79.1378,
    'https://images.unsplash.com/photo-1628427722788-72c0f8b1adc3?w=800',
    'heritage',
    ARRAY['Brihadeeswarar Temple', 'Royal Palace', 'Thanjavur Paintings', 'Saraswathi Mahal Library', 'Chola Bronze']
),
(
    'Rameswaram',
    'A sacred island town known for the Ramanathaswamy Temple with its stunning corridors. One of the four sacred dhams in Hinduism.',
    'Tamil Nadu', 'Ramanathapuram', 9.2876, 79.3129,
    'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=800',
    'religious',
    ARRAY['Ramanathaswamy Temple', 'Pamban Bridge', 'Dhanushkodi', 'APJ Abdul Kalam Memorial', 'Sacred Theerthams']
)
ON CONFLICT DO NOTHING;

-- ─── TOURIST SPOTS ─────────────────────────────────────────────
INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Shore Temple', 'Iconic 8th-century Pallava temple overlooking the Bay of Bengal.', 12.6166, 80.1993, 90, 40, 'historical', 'https://images.unsplash.com/photo-1621427169898-8b0553e5a29f?w=600'),
    ('Pancha Rathas', 'Five monolithic rock-cut temples carved from single granite boulders.', 12.6152, 80.1931, 75, 40, 'historical', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Arjuna''s Penance', 'The world''s largest open-air rock relief depicting scenes from the Mahabharata.', 12.6193, 80.1941, 45, 0, 'historical', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Krishna''s Butter Ball', 'A massive natural rock balanced on a slope defying gravity.', 12.6191, 80.1935, 30, 0, 'nature', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Mahabalipuram Beach', 'Beautiful sandy beach alongside the historic Shore Temple.', 12.6200, 80.1990, 60, 0, 'beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Mahabalipuram';

INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Promenade Beach', 'A 1.2 km stretch along the Bay of Bengal, perfect for sunset walks.', 11.9340, 79.8361, 60, 0, 'beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'),
    ('Auroville', 'Experimental universal township featuring the stunning Matrimandir golden sphere.', 12.0064, 79.8107, 180, 0, 'cultural', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'),
    ('French Quarter', 'Charming colonial streets with yellow buildings and French-style cafes.', 11.9338, 79.8343, 120, 0, 'cultural', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'),
    ('Paradise Beach', 'Secluded beach accessible only by boat with pristine sands.', 11.8928, 79.8289, 120, 200, 'beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Pondicherry';

INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Meenakshi Amman Temple', 'Magnificent Hindu temple with 14 stunning gopurams adorned with thousands of colorful sculptures.', 9.9195, 78.1193, 120, 0, 'religious', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600'),
    ('Thirumalai Nayakkar Palace', '17th-century royal palace with massive pillars and grand courtyard.', 9.9177, 78.1224, 75, 50, 'historical', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600'),
    ('Gandhi Memorial Museum', 'Museum in Tamukkam Palace with relics and photographs of Mahatma Gandhi.', 9.9148, 78.1272, 60, 10, 'cultural', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Madurai';

-- ─── TOURIST SPOTS: THANJAVUR ──────────────────────────────────
INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Brihadeeswarar Temple', 'A UNESCO World Heritage Site and one of the greatest examples of Chola architecture. The massive vimana tower rises to 66 meters.', 10.7828, 79.1318, 120, 0, 'religious', 'https://images.unsplash.com/photo-1628427722788-72c0f8b1adc3?w=600'),
    ('Royal Palace', 'Historic palace of the Nayak and Maratha rulers, housing the Saraswathi Mahal Library and Art Gallery.', 10.7852, 79.1316, 90, 50, 'historical', 'https://images.unsplash.com/photo-1628427722788-72c0f8b1adc3?w=600'),
    ('Saraswathi Mahal Library', 'One of the oldest libraries in Asia, containing rare palm-leaf manuscripts and ancient texts dating back centuries.', 10.7855, 79.1320, 60, 20, 'cultural', 'https://images.unsplash.com/photo-1628427722788-72c0f8b1adc3?w=600'),
    ('Thanjavur Art Gallery', 'Gallery showcasing stunning Chola bronze statues, stone sculptures, and traditional Thanjavur paintings.', 10.7848, 79.1312, 75, 30, 'cultural', 'https://images.unsplash.com/photo-1628427722788-72c0f8b1adc3?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Thanjavur';

-- ─── TOURIST SPOTS: RAMESWARAM ────────────────────────────────
INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Ramanathaswamy Temple', 'One of the most sacred Hindu temples with the longest corridor of any temple in India. Famous for its 22 sacred wells.', 9.2881, 79.3174, 120, 0, 'religious', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600'),
    ('Pamban Bridge', 'India''s first sea bridge connecting Rameswaram island to the mainland. An engineering marvel offering breathtaking ocean views.', 9.2802, 79.2117, 45, 0, 'nature', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'),
    ('Dhanushkodi', 'The ghost town at the southeastern tip of the island, destroyed by a cyclone in 1964. Hauntingly beautiful with pristine beaches.', 9.1720, 79.4270, 120, 0, 'nature', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'),
    ('APJ Abdul Kalam Memorial', 'A memorial dedicated to India''s beloved Missile Man and former President, built at his burial site.', 9.2770, 79.3050, 60, 0, 'cultural', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Rameswaram';

-- ─── SHOPS ─────────────────────────────────────────────────────
INSERT INTO shops (name, description, address, district, state, latitude, longitude, verification_status) VALUES
('Mahabalipuram Handicrafts', 'Traditional stone carvings and sculptures made by local artisans using centuries-old techniques.', 'East Raja Street, Mahabalipuram', 'Chengalpattu', 'Tamil Nadu', 12.6195, 80.1935, 'verified'),
('Sea Shore Crafts', 'Authentic handicrafts, shell art, and coastal-themed souvenirs from local artisans.', 'Shore Temple Road, Mahabalipuram', 'Chengalpattu', 'Tamil Nadu', 12.6175, 80.1960, 'verified'),
('Heritage Arts Emporium', 'Curated collection of traditional Pallava-style stone sculptures and bronze figurines.', 'Othavadai Street, Mahabalipuram', 'Chengalpattu', 'Tamil Nadu', 12.6210, 80.1945, 'verified'),
('Pondy Bazaar Crafts', 'Handmade pottery, incense, and artisanal products from Pondicherry artisans.', 'Nehru Street, Pondicherry', 'Puducherry', 'Puducherry', 11.9355, 79.8315, 'verified'),
('Auroville Boutique', 'Sustainable fashion, handmade paper products, and eco-friendly goods from Auroville community.', 'Auroville Main Road', 'Puducherry', 'Puducherry', 12.0050, 79.8100, 'verified'),
('Meenakshi Silk Emporium', 'Premium Madurai silk sarees and traditional South Indian textiles.', 'Town Hall Road, Madurai', 'Madurai', 'Tamil Nadu', 9.9200, 78.1200, 'verified'),
('Thanjavur Art Gallery', 'Original Thanjavur paintings, Chola bronzes, and traditional South Indian art pieces.', 'South Main Street, Thanjavur', 'Thanjavur', 'Tamil Nadu', 10.7850, 79.1370, 'verified'),
('Temple Town Souvenirs', 'Religious artifacts, brass lamps, and temple-themed souvenirs.', 'Car Street, Rameswaram', 'Ramanathapuram', 'Tamil Nadu', 9.2880, 79.3135, 'verified'),
('Coastal Shell Art', 'Unique shell jewelry, decorative items, and marine-themed art from Rameswaram.', 'Beach Road, Rameswaram', 'Ramanathapuram', 'Tamil Nadu', 9.2870, 79.3140, 'verified'),
('Pallava Stone Works', 'Custom stone sculptures and replicas of Mahabalipuram monuments.', 'Kovalam Road, Mahabalipuram', 'Chengalpattu', 'Tamil Nadu', 12.6230, 80.1920, 'verified')
ON CONFLICT DO NOTHING;

-- ─── PRODUCTS ──────────────────────────────────────────────────
-- Allow products without a seller for demo data
ALTER TABLE products ALTER COLUMN seller_id DROP NOT NULL;

INSERT INTO products (name, description, price, category, stock, image_url, location, shop_id) VALUES
-- Mahabalipuram Handicrafts
('Traditional Stone Ganesha', 'Hand-carved granite Ganesha idol by Mahabalipuram artisans. Each piece is unique.', 1250.00, 'Handicraft', 15, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Mahabalipuram Handicrafts' LIMIT 1)),
('Pallava Dynasty Replica', 'Miniature replica of the Shore Temple carved in soapstone. Perfect souvenir.', 850.00, 'Handicraft', 20, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Mahabalipuram Handicrafts' LIMIT 1)),
-- Sea Shore Crafts
('Handcrafted Shell Necklace', 'Beautiful necklace made from naturally collected seashells and beads.', 450.00, 'Jewelry', 30, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Sea Shore Crafts' LIMIT 1)),
('Seashell Wind Chime', 'Handmade wind chime crafted from local seashells. Produces soothing coastal sounds.', 350.00, 'Decor', 25, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Sea Shore Crafts' LIMIT 1)),
('Coral Art Frame', 'Photo frame decorated with coral and shell patterns. Handmade coastal art.', 550.00, 'Decor', 18, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Sea Shore Crafts' LIMIT 1)),
-- Heritage Arts Emporium
('Bronze Nataraja Statue', 'Traditional Chola-style bronze Nataraja figurine. Lost-wax casting method.', 2200.00, 'Handicraft', 8, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Heritage Arts Emporium' LIMIT 1)),
('Stone Relief Panel', 'Carved stone panel depicting scenes from Indian mythology. Wall mounting included.', 1800.00, 'Art', 5, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram', (SELECT id FROM shops WHERE name = 'Heritage Arts Emporium' LIMIT 1)),
-- Pondy Bazaar Crafts
('Auroville Handmade Paper Journal', 'Eco-friendly journal made from recycled paper by Auroville artisans.', 380.00, 'Stationery', 40, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Pondicherry', (SELECT id FROM shops WHERE name = 'Pondy Bazaar Crafts' LIMIT 1)),
('French Colonial Candle Set', 'Scented candle set inspired by Pondicherry French Quarter aromas.', 650.00, 'Decor', 22, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Pondicherry', (SELECT id FROM shops WHERE name = 'Pondy Bazaar Crafts' LIMIT 1)),
('Pondy Pottery Vase', 'Hand-thrown terracotta vase with traditional Tamil designs.', 480.00, 'Handicraft', 15, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Pondicherry', (SELECT id FROM shops WHERE name = 'Pondy Bazaar Crafts' LIMIT 1)),
-- Meenakshi Silk Emporium
('Kanchipuram Silk Saree', 'Pure silk saree with traditional Kanchipuram weave and gold zari border.', 4500.00, 'Textile', 10, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 'Madurai', (SELECT id FROM shops WHERE name = 'Meenakshi Silk Emporium' LIMIT 1)),
('Madurai Jasmine Garland Kit', 'DIY jasmine garland making kit with fresh flowers and thread.', 250.00, 'Traditional', 50, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 'Madurai', (SELECT id FROM shops WHERE name = 'Meenakshi Silk Emporium' LIMIT 1)),
-- Thanjavur Art Gallery
('Thanjavur Painting - Krishna', 'Traditional Thanjavur painting of Lord Krishna with gold foil and precious stones.', 3500.00, 'Art', 6, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Thanjavur', (SELECT id FROM shops WHERE name = 'Thanjavur Art Gallery' LIMIT 1)),
('Chola Bronze Lamp', 'Traditional bronze oil lamp inspired by Chola dynasty temple designs.', 1200.00, 'Handicraft', 12, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Thanjavur', (SELECT id FROM shops WHERE name = 'Thanjavur Art Gallery' LIMIT 1)),
('Thanjavur Thattu (Plate)', 'Decorative brass plate with intricate Thanjavur art work.', 1800.00, 'Handicraft', 8, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Thanjavur', (SELECT id FROM shops WHERE name = 'Thanjavur Art Gallery' LIMIT 1)),
-- Temple Town Souvenirs
('Sacred Rudraksha Mala', 'Authentic rudraksha prayer beads from Rameswaram. Blessed at the temple.', 900.00, 'Religious', 20, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Rameswaram', (SELECT id FROM shops WHERE name = 'Temple Town Souvenirs' LIMIT 1)),
('Brass Temple Bell', 'Handcrafted brass bell for home temple. Resonant sound for prayers.', 650.00, 'Religious', 30, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Rameswaram', (SELECT id FROM shops WHERE name = 'Temple Town Souvenirs' LIMIT 1)),
-- Coastal Shell Art
('Shell Mosaic Art Piece', 'Decorative wall art created from thousands of tiny seashells. Handmade masterpiece.', 1500.00, 'Art', 5, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Rameswaram', (SELECT id FROM shops WHERE name = 'Coastal Shell Art' LIMIT 1)),
('Pearl Shell Earrings', 'Elegant earrings crafted from mother-of-pearl shells found on Rameswaram shores.', 380.00, 'Jewelry', 35, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Rameswaram', (SELECT id FROM shops WHERE name = 'Coastal Shell Art' LIMIT 1));
