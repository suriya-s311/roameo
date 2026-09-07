-- ================================================================
-- ROAMEO Seed Data — Run after schema.sql in Supabase SQL Editor
-- ================================================================

-- ─── UDYAM REFERENCES (20 Demo Records) ───────────────────────
-- NOTE: This is a PROTOTYPE/DEMO Udyam verification system.
-- These are NOT real government records.
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
('UDYAM-TN-01-0000020', 'Ooty Eucalyptus Products', 'Thomas George', 'Small', 'Nilgiris', 'Tamil Nadu', '2020-04-22', 'active');

-- ─── DESTINATIONS ──────────────────────────────────────────────
INSERT INTO destinations (name, description, state, district, latitude, longitude, image_url, category, highlights) VALUES
(
    'Mahabalipuram',
    'An ancient port city and UNESCO World Heritage Site known for its stunning rock-cut temples, monolithic rathas, and the iconic Shore Temple. A treasure trove of Pallava dynasty architecture and stone sculpture.',
    'Tamil Nadu', 'Chengalpattu', 12.6269, 80.1927,
    'https://images.unsplash.com/photo-1621427169898-8b0553e5a29f?w=800',
    'heritage',
    ARRAY['UNESCO World Heritage Site', 'Shore Temple', 'Pancha Rathas', 'Stone Sculptures', 'Beach']
),
(
    'Pondicherry',
    'A charming coastal city with French colonial heritage, vibrant streets, serene beaches, and the spiritual township of Auroville. Known for its unique blend of French and Tamil cultures.',
    'Puducherry', 'Puducherry', 11.9416, 79.8083,
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    'cultural',
    ARRAY['French Quarter', 'Promenade Beach', 'Auroville', 'Sri Aurobindo Ashram', 'Cafes']
),
(
    'Madurai',
    'One of the oldest continuously inhabited cities in the world, famous for the magnificent Meenakshi Amman Temple. Known as the Temple City with rich cultural heritage and vibrant markets.',
    'Tamil Nadu', 'Madurai', 9.9252, 78.1198,
    'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=800',
    'religious',
    ARRAY['Meenakshi Temple', 'Thirumalai Nayakkar Palace', 'Gandhi Museum', 'Banana Market', 'Jasmine City']
),
(
    'Thanjavur',
    'The cultural capital of Tamil Nadu, home to the magnificent Brihadeeswarar Temple — a UNESCO World Heritage Site. Known for Thanjavur paintings, classical music, and ancient Chola dynasty architecture.',
    'Tamil Nadu', 'Thanjavur', 10.7870, 79.1378,
    'https://images.unsplash.com/photo-1628427722788-72c0f8b1adc3?w=800',
    'heritage',
    ARRAY['Brihadeeswarar Temple', 'Royal Palace', 'Thanjavur Paintings', 'Saraswathi Mahal Library', 'Chola Bronze']
),
(
    'Rameswaram',
    'A sacred island town known for the Ramanathaswamy Temple with its stunning corridors. One of the four sacred dhams in Hinduism, connected to the mainland by the Pamban Bridge.',
    'Tamil Nadu', 'Ramanathapuram', 9.2876, 79.3129,
    'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=800',
    'religious',
    ARRAY['Ramanathaswamy Temple', 'Pamban Bridge', 'Dhanushkodi', 'APJ Abdul Kalam Memorial', 'Sacred Theerthams']
);

-- ─── TOURIST SPOTS ─────────────────────────────────────────────
-- Mahabalipuram spots
INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT
    spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Shore Temple', 'Iconic 8th-century Pallava temple overlooking the Bay of Bengal. A UNESCO World Heritage monument showcasing Dravidian architecture at its finest.', 12.6166, 80.1993, 90, 40, 'historical', 'https://images.unsplash.com/photo-1621427169898-8b0553e5a29f?w=600'),
    ('Pancha Rathas', 'Five monolithic rock-cut temples carved from single granite boulders, each named after the Pandavas. Remarkable examples of Indian rock-cut architecture.', 12.6152, 80.1931, 75, 40, 'historical', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Arjuna''s Penance', 'The world''s largest open-air rock relief, measuring 27m x 9m, depicting scenes from the Mahabharata. A masterpiece of ancient Indian art.', 12.6193, 80.1941, 45, 0, 'historical', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Krishna''s Butter Ball', 'A massive natural rock balanced on a slope, defying gravity. A popular tourist attraction and an engineering marvel of nature.', 12.6191, 80.1935, 30, 0, 'nature', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Tiger Cave', 'An unfinished rock-cut temple with intricate carvings of tiger heads around its entrance. A hidden gem with beautiful coastal surroundings.', 12.5922, 80.1913, 45, 0, 'historical', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600'),
    ('Mahabalipuram Beach', 'A beautiful sandy beach perfect for relaxation, surfing, and watching the sunrise. The beach runs alongside the historic Shore Temple.', 12.6200, 80.1990, 60, 0, 'beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'),
    ('Crocodile Bank', 'One of the largest reptile zoos in the world, housing over 2,000 crocodiles and various species of reptiles. A must-visit for wildlife enthusiasts.', 12.6642, 80.1738, 90, 50, 'nature', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Mahabalipuram';

-- Pondicherry spots
INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT
    spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Promenade Beach', 'A 1.2 km long stretch along the Bay of Bengal, lined with heritage buildings, statues, and the iconic Gandhi statue. Perfect for sunset walks.', 11.9340, 79.8361, 60, 0, 'beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'),
    ('Auroville', 'An experimental universal township founded in 1968, featuring the stunning Matrimandir golden sphere. A place of human unity and sustainable living.', 12.0064, 79.8107, 180, 0, 'cultural', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'),
    ('French Quarter', 'Charming colonial streets with mustard-yellow buildings, bougainvillea, and French-style cafes. Also known as the White Town area.', 11.9338, 79.8343, 120, 0, 'cultural', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'),
    ('Sri Aurobindo Ashram', 'A spiritual community founded in 1926, offering a peaceful atmosphere for meditation and reflection. Houses the flower-covered samadhi.', 11.9352, 79.8356, 60, 0, 'religious', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'),
    ('Paradise Beach', 'A secluded beach accessible only by boat, known for its pristine sands and calm waters. A perfect escape from the city.', 11.8928, 79.8289, 120, 200, 'beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Pondicherry';

-- Madurai spots
INSERT INTO tourist_spots (name, description, destination_id, latitude, longitude, estimated_visit_duration, estimated_entry_cost, category, image_url)
SELECT
    spot.name, spot.description, d.id, spot.lat, spot.lon, spot.duration, spot.cost, spot.category, spot.image
FROM destinations d,
(VALUES
    ('Meenakshi Amman Temple', 'A magnificent Hindu temple with 14 stunning gopurams (gateway towers) adorned with thousands of colorful sculptures. One of India''s most iconic temples.', 9.9195, 78.1193, 120, 0, 'religious', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600'),
    ('Thirumalai Nayakkar Palace', 'A 17th-century royal palace showcasing Indo-Saracenic architecture with massive pillars, stucco work, and a grand courtyard.', 9.9177, 78.1224, 75, 50, 'historical', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600'),
    ('Gandhi Memorial Museum', 'A museum dedicated to Mahatma Gandhi, housed in the historic Tamukkam Palace. Contains relics, photographs, and the blood-stained cloth Gandhi wore.', 9.9148, 78.1272, 60, 10, 'cultural', 'https://images.unsplash.com/photo-1621778194530-5c0b22b8a4a9?w=600')
) AS spot(name, description, lat, lon, duration, cost, category, image)
WHERE d.name = 'Madurai';

-- ─── MOCK SHOPS ────────────────────────────────────────────────
-- Create a dummy seller for mock shops (this will be linked later when real sellers register)
-- For now, we insert shops without seller_id (it's nullable)
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
('Pallava Stone Works', 'Custom stone sculptures and replicas of Mahabalipuram monuments.', 'Kovalam Road, Mahabalipuram', 'Chengalpattu', 'Tamil Nadu', 12.6230, 80.1920, 'verified');

-- ─── MOCK PRODUCTS ─────────────────────────────────────────────
-- Products linked to shops (using subquery to get shop IDs)
INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Traditional Stone Ganesha', 'Hand-carved granite Ganesha idol by Mahabalipuram artisans. Each piece is unique.', 1250.00, 'Handicraft', 15, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram'),
    ('Pallava Dynasty Replica', 'Miniature replica of the Shore Temple carved in soapstone. Perfect souvenir.', 850.00, 'Handicraft', 20, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram'),
    ('Handcrafted Shell Necklace', 'Beautiful necklace made from naturally collected seashells and beads.', 450.00, 'Jewelry', 30, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mahabalipuram')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Mahabalipuram Handicrafts';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Seashell Wind Chime', 'Handmade wind chime crafted from local seashells. Produces soothing coastal sounds.', 350.00, 'Decor', 25, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mahabalipuram'),
    ('Coral Art Frame', 'Photo frame decorated with coral and shell patterns. Handmade coastal art.', 550.00, 'Decor', 18, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mahabalipuram')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Sea Shore Crafts';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Bronze Nataraja Statue', 'Traditional Chola-style bronze Nataraja figurine. Lost-wax casting method.', 2200.00, 'Handicraft', 8, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram'),
    ('Stone Relief Panel', 'Carved stone panel depicting scenes from Indian mythology. Wall mounting included.', 1800.00, 'Art', 5, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Mahabalipuram')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Heritage Arts Emporium';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Auroville Handmade Paper Journal', 'Eco-friendly journal made from recycled paper by Auroville artisans.', 380.00, 'Stationery', 40, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Pondicherry'),
    ('French Colonial Candle Set', 'Scented candle set inspired by Pondicherry French Quarter aromas.', 650.00, 'Decor', 22, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Pondicherry'),
    ('Pondy Pottery Vase', 'Hand-thrown terracotta vase with traditional Tamil designs.', 480.00, 'Handicraft', 15, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', 'Pondicherry')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Pondy Bazaar Crafts';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Kanchipuram Silk Saree', 'Pure silk saree with traditional Kanchipuram weave and gold zari border.', 4500.00, 'Textile', 10, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 'Madurai'),
    ('Madurai Jasmine Garland Kit', 'DIY jasmine garland making kit with fresh flowers and thread.', 250.00, 'Traditional', 50, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 'Madurai')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Meenakshi Silk Emporium';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Thanjavur Painting - Krishna', 'Traditional Thanjavur painting of Lord Krishna with gold foil and precious stones.', 3500.00, 'Art', 6, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Thanjavur'),
    ('Chola Bronze Lamp', 'Traditional bronze oil lamp inspired by Chola dynasty temple designs.', 1200.00, 'Handicraft', 12, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Thanjavur'),
    ('Thanjavur Thattu (Plate)', 'Decorative brass plate with intricate Thanjavur art work.', 1800.00, 'Handicraft', 8, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Thanjavur')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Thanjavur Art Gallery';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Sacred Rudraksha Mala', 'Authentic rudraksha prayer beads from Rameswaram. Blessed at the temple.', 900.00, 'Religious', 20, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Rameswaram'),
    ('Brass Temple Bell', 'Handcrafted brass bell for home temple. Resonant sound for prayers.', 650.00, 'Religious', 30, 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400', 'Rameswaram')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Temple Town Souvenirs';

INSERT INTO products (seller_id, shop_id, name, description, price, category, stock, image_url, location)
SELECT
    s.seller_id, s.id, p.name, p.description, p.price, p.category, p.stock, p.image, p.location
FROM shops s,
(VALUES
    ('Shell Mosaic Art Piece', 'Decorative wall art created from thousands of tiny seashells. Handmade masterpiece.', 1500.00, 'Art', 5, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Rameswaram'),
    ('Pearl Shell Earrings', 'Elegant earrings crafted from mother-of-pearl shells found on Rameswaram shores.', 380.00, 'Jewelry', 35, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Rameswaram')
) AS p(name, description, price, category, stock, image, location)
WHERE s.name = 'Coastal Shell Art';
