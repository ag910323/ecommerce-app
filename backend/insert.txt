

INSERT INTO roles (
    active, created_at, tenant_id, updated_at, version, name
) VALUES
(b'1', NOW(), 1, NOW(), 0, 'CUSTOMER'),
(b'1', NOW(), 1, NOW(), 0, 'ADMIN'),
(b'1', NOW(), 1, NOW(), 0, 'SELLER');



INSERT INTO category (id, active, created_at, tenant_id, updated_at, version, description, name, status, parent_id) VALUES
(1,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Clothing, footwear, and accessories for men, women, and kids','Fashion','ACTIVE',NULL),
(2,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Mobiles, laptops, gadgets, and accessories','Electronics','ACTIVE',NULL),
(3,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Furniture, decor, and kitchenware','Home & Kitchen','ACTIVE',NULL),
(4,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Skincare, cosmetics, personal care, and wellness','Beauty & Health','ACTIVE',NULL),
(5,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Gym equipment, sportswear, and outdoor gear','Sports & Outdoors','ACTIVE',NULL),
(6,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Baby care, kids toys, and learning items','Toys & Baby','ACTIVE',NULL),
(7,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Food, beverages, and household essentials','Groceries','ACTIVE',NULL),
(8,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Books, study materials, and office supplies','Books & Stationery','ACTIVE',NULL),

(9,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Shirts, t-shirts, jeans, trousers, etc.','Men''s Clothing','ACTIVE',1),
(10,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Dresses, tops, sarees, kurtis, etc.','Women''s Clothing','ACTIVE',1),
(11,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Shoes, sandals, sneakers, heels','Footwear','ACTIVE',1),
(12,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Watches, wallets, belts, jewelry','Accessories','ACTIVE',1),
(13,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Clothing and accessories for children','Kids Wear','ACTIVE',1),

(14,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Casual shirts for everyday wear','Casual Shirts','ACTIVE',9),
(15,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Formal shirts for work and events','Formal Shirts','ACTIVE',9),
(16,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Jeans and denim wear','Jeans','ACTIVE',9),
(17,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Trousers and chinos','Trousers','ACTIVE',9),
(18,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'T-shirts and polos','T-Shirts & Polos','ACTIVE',9),

(19,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Slim fit jeans for men','Slim Fit Jeans','ACTIVE',17),
(20,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Regular fit jeans for men','Regular Fit Jeans','ACTIVE',17),
(21,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Distressed and ripped denim styles','Ripped Jeans','ACTIVE',17),
(22,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Elegant sarees and ethnic wear','Sarees','ACTIVE',10),
(23,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Western dresses and gowns','Dresses','ACTIVE',10),
(24,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Stylish tops and tunics','Tops & Tunics','ACTIVE',10),
(25,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Comfortable kurtis and kurtas','Kurtis & Kurtas','ACTIVE',10);

INSERT INTO category (id, active, created_at, tenant_id, updated_at, version, description, name, status, parent_id) VALUES
(26,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Leggings, jeans, skirts, and shorts','Bottom Wear','ACTIVE',10),
(27,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Traditional Indian sarees','Silk Sarees','ACTIVE',22),
(28,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Casual lightweight sarees','Cotton Sarees','ACTIVE',22),
(29,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Trendy modern sarees','Designer Sarees','ACTIVE',22),

(30,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Sports and casual shoes','Sneakers','ACTIVE',11),
(31,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Formal shoes for men','Formal Shoes','ACTIVE',11),
(32,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Heels and wedges for women','Heels & Wedges','ACTIVE',11),
(33,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Sandals and slippers','Sandals & Slippers','ACTIVE',11),

(34,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Running and training shoes','Running Shoes','ACTIVE',30),
(35,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Everyday lifestyle sneakers','Casual Sneakers','ACTIVE',30),
(36,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'High-performance branded sneakers','Premium Sneakers','ACTIVE',30),

(37,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Fashionable wrist watches','Watches','ACTIVE',12),
(38,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Leather and metal belts','Belts','ACTIVE',12),
(39,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Wallets and purses','Wallets','ACTIVE',12),
(40,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Necklaces, rings, and earrings','Jewelry','ACTIVE',12),

(41,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Classic analog watches','Analog Watches','ACTIVE',37),
(42,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Smartwatches with health tracking','Smartwatches','ACTIVE',37),
(43,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Digital watches for casual use','Digital Watches','ACTIVE',37),

(44,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Baby boy clothing','Boys Clothing','ACTIVE',13),
(45,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Baby girl clothing','Girls Clothing','ACTIVE',13),
(46,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'School and casual shoes for kids','Kids Footwear','ACTIVE',13),

(47,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Boys T-shirts and shirts','Boys Tops','ACTIVE',44),
(48,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Boys jeans and shorts','Boys Bottoms','ACTIVE',44),
(49,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Girls frocks and dresses','Frocks & Dresses','ACTIVE',45),
(50,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Girls tops, skirts, and leggings','Tops & Bottoms','ACTIVE',45),

(51,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Smartphones, tablets, and accessories','Mobiles & Tablets','ACTIVE',2),
(52,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Laptops, desktops, and computer accessories','Computers & Laptops','ACTIVE',2),
(53,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Televisions, home theaters, and entertainment','TV & Entertainment','ACTIVE',2),
(54,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Audio devices like headphones and speakers','Audio & Headphones','ACTIVE',2),
(55,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Cameras, DSLRs, and accessories','Cameras & Photography','ACTIVE',2),

(56,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Android and iOS smartphones','Smartphones','ACTIVE',51),
(57,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Basic and feature phones','Feature Phones','ACTIVE',51),
(58,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'iPads and Android tablets','Tablets','ACTIVE',51),
(59,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Mobile chargers, cases, and cables','Mobile Accessories','ACTIVE',51),
(60,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Apple iPhones','iPhones','ACTIVE',56);

INSERT INTO category (id, active, created_at, tenant_id, updated_at, version, description, name, status, parent_id) VALUES
(61,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Android phones from top brands','Android Phones','ACTIVE',56),
(62,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Refurbished and budget devices','Refurbished Phones','ACTIVE',56),

(63,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Personal and business laptops','Laptops','ACTIVE',52),
(64,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Desktops and monitors','Desktops & Monitors','ACTIVE',52),
(65,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Computer accessories and peripherals','Computer Accessories','ACTIVE',52),

(66,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Gaming laptops with GPUs','Gaming Laptops','ACTIVE',63),
(67,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Work and study laptops','Business Laptops','ACTIVE',63),
(68,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'MacBooks and premium ultrabooks','Premium Laptops','ACTIVE',63),

(69,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Home furniture and decor','Furniture','ACTIVE',3),
(70,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Cookware, storage, and utensils','Kitchenware','ACTIVE',3),
(71,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Home improvement tools and lighting','Home Improvement','ACTIVE',3),
(72,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Cleaning and organization products','Cleaning Supplies','ACTIVE',3),

(73,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Beds, mattresses, and bedroom furniture','Bedroom Furniture','ACTIVE',69),
(74,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Sofas, recliners, and tables','Living Room Furniture','ACTIVE',69),
(75,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Study desks and chairs','Office Furniture','ACTIVE',69),

(76,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Sofas and sectionals','Sofas','ACTIVE',74),
(77,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Coffee tables and TV units','Tables & Units','ACTIVE',74),
(78,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Accent chairs and recliners','Chairs & Recliners','ACTIVE',74),

(79,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Cooking pots, pans, and tools','Cookware','ACTIVE',70),
(80,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Storage containers and lunch boxes','Storage & Containers','ACTIVE',70),
(81,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Dinner sets and cutlery','Dining & Serveware','ACTIVE',70),

(82,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Skincare, bodycare, and cosmetics','Beauty','ACTIVE',4),
(83,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Hair care and styling products','Hair Care','ACTIVE',4),
(84,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Health and personal hygiene','Health & Wellness','ACTIVE',4),

(85,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Lipsticks, eyeliners, foundations','Makeup','ACTIVE',82),
(86,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Cleansers, moisturizers, and serums','Skincare','ACTIVE',82),
(87,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Perfumes and body mists','Fragrances','ACTIVE',82),

(88,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Lipsticks and lip gloss','Lip Makeup','ACTIVE',85),
(89,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Eyeliners, mascara, and eyeshadow','Eye Makeup','ACTIVE',85),
(90,b'1','2025-10-06 20:51:40',1,'2025-10-06 20:51:40',0,'Foundations, primers, and compacts','Face Makeup','ACTIVE',85),

(91,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Clothing and footwear for sports','Sportswear','ACTIVE',5),
(92,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Exercise and fitness equipment','Fitness Equipment','ACTIVE',5),
(93,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Outdoor and adventure gear','Outdoor Gear','ACTIVE',5),
(94,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Sports accessories and gear','Sports Accessories','ACTIVE',5),

(95,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'T-shirts, shorts, tracksuits','Men’s Sportswear','ACTIVE',91),
(96,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Leggings, tops, and sports bras','Women’s Sportswear','ACTIVE',91),
(97,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Shoes for various sports','Sports Footwear','ACTIVE',91),

(98,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Weights, dumbbells, benches','Home Gym Equipment','ACTIVE',92),
(99,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Treadmills, exercise bikes','Cardio Equipment','ACTIVE',92),
(100,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Resistance bands and yoga mats','Workout Accessories','ACTIVE',92);



INSERT INTO category (id, active, created_at, tenant_id, updated_at, version, description, name, status, parent_id) VALUES
(101,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Toys for kids of all ages','Toys','ACTIVE',6),
(102,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Baby care and hygiene products','Baby Care','ACTIVE',6),
(103,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Learning and development items','Learning & Education','ACTIVE',6),

(104,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Cars, trucks, and vehicles','Remote Control Toys','ACTIVE',101),
(105,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Puzzles, board games, etc.','Educational Toys','ACTIVE',101),
(106,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Soft and plush toys','Soft Toys','ACTIVE',101),

(107,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Diapers, wipes, baby creams','Diapering','ACTIVE',102),
(108,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Feeding bottles and utensils','Feeding Essentials','ACTIVE',102),
(109,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Baby skincare and bath products','Bath & Hygiene','ACTIVE',102),

(110,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Food and drinks for daily needs','Food & Beverages','ACTIVE',7),
(111,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Personal and home essentials','Household Supplies','ACTIVE',7),
(112,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Packaged and gourmet items','Packaged Foods','ACTIVE',7),

(113,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Fruits, vegetables, and pulses','Staples','ACTIVE',110),
(114,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Snacks, chips, biscuits','Snacks','ACTIVE',110),
(115,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Juices, soft drinks, coffee','Beverages','ACTIVE',110),

(116,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Laundry, cleaners, and tissues','Cleaning Essentials','ACTIVE',111),
(117,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Detergents and disinfectants','Home Cleaning','ACTIVE',111),
(118,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Pet food and care','Pet Supplies','ACTIVE',111),

(119,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Printed books and e-books','Books','ACTIVE',8),
(120,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Office and school stationery','Stationery','ACTIVE',8),
(121,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Learning guides and courses','Educational Materials','ACTIVE',8),

(122,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Novels, thrillers, literature','Fiction','ACTIVE',119),
(123,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Science, history, and technology','Non-Fiction','ACTIVE',119),
(124,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Kids storybooks and comics','Children’s Books','ACTIVE',119),

(125,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Pens, pencils, and markers','Writing Instruments','ACTIVE',120),
(126,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Notebooks, files, and folders','Paper Products','ACTIVE',120),
(127,b'1','2025-10-06 21:07:11',1,'2025-10-06 21:07:11',0,'Art and craft supplies','Art Supplies','ACTIVE',120);




INSERT INTO brand 
(id, active, created_at, tenant_id, updated_at, version, description, logo, name, partnership_badge, partnership_level, partnership_priority)
VALUES
(1,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Global sportswear and footwear brand known for athletic and lifestyle apparel.','https://logo.clearbit.com/nike.com','Nike',NULL,'NONE',0),
(2,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Popular sportswear and lifestyle brand with shoes, clothing, and accessories.','https://logo.clearbit.com/adidas.com','Adidas',NULL,'NONE',0),
(3,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Iconic denim and fashion brand famous for jeans and casual wear.','https://logo.clearbit.com/levi.com','Levi''s',NULL,'NONE',0),
(4,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Modern and trendy clothing brand offering fast fashion for men and women.','https://logo.clearbit.com/zara.com','Zara',NULL,'NONE',0),
(5,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Affordable fast-fashion brand offering stylish apparel for all.','https://logo.clearbit.com/hm.com','H&M',NULL,'NONE',0),
(6,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Sportswear and casual fashion brand known for sneakers and activewear.','https://logo.clearbit.com/puma.com','Puma',NULL,'NONE',0),
(7,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Global eyewear brand known for premium sunglasses and optical frames.','https://logo.clearbit.com/ray-ban.com','Ray-Ban',NULL,'NONE',0),
(8,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Premium technology brand offering iPhones, MacBooks, iPads, and accessories.','https://logo.clearbit.com/apple.com','Apple',NULL,'NONE',0),
(9,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Leading electronics brand producing smartphones, TVs, and appliances.','https://logo.clearbit.com/samsung.com','Samsung',NULL,'NONE',0),
(10,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Renowned for high-quality TVs, PlayStation, and audio equipment.','https://logo.clearbit.com/sony.com','Sony',NULL,'NONE',0),
(11,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Global leader in laptops, PCs, and computer accessories.','https://logo.clearbit.com/dell.com','Dell',NULL,'NONE',0),
(12,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Trusted brand for computers, printers, and business hardware.','https://logo.clearbit.com/hp.com','HP',NULL,'NONE',0),
(13,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Top manufacturer of laptops, tablets, and PCs.','https://logo.clearbit.com/lenovo.com','Lenovo',NULL,'NONE',0),
(14,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Electronics brand known for gaming laptops and computer components.','https://logo.clearbit.com/asus.com','Asus',NULL,'NONE',0),
(15,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Leading camera and imaging brand offering DSLRs and accessories.','https://logo.clearbit.com/canon.com','Canon',NULL,'NONE',0),
(16,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Indian electronics brand popular for audio products like earphones and speakers.','https://logo.clearbit.com/boat-lifestyle.com','Boat',NULL,'NONE',0),
(17,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Premium smartphone and accessories brand known for performance and design.','https://logo.clearbit.com/oneplus.com','OnePlus',NULL,'NONE',0),
(18,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Swedish home furniture and decor brand offering modern designs.','https://logo.clearbit.com/ikea.com','IKEA',NULL,'NONE',0),
(19,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Global brand offering home appliances, lighting, and kitchen devices.','https://logo.clearbit.com/philips.com','Philips',NULL,'NONE',0),
(20,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Indian kitchenware brand known for cookware and pressure cookers.','https://logo.clearbit.com/prestigesmartcity.com','Prestige',NULL,'NONE',0),
(21,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Popular kitchen appliance brand offering mixers and cookware.','https://logo.clearbit.com/butterflyindia.com','Butterfly',NULL,'NONE',0),
(22,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Appliances and home improvement brand with a focus on quality.','https://logo.clearbit.com/bosch.com','Bosch',NULL,'NONE',0),
(23,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Home appliances brand offering refrigerators, washers, and microwaves.','https://logo.clearbit.com/whirlpool.com','Whirlpool',NULL,'NONE',0),
(24,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Brand known for fans, lighting, and home electrical equipment.','https://logo.clearbit.com/havells.com','Havells',NULL,'NONE',0),
(25,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'World leader in cosmetics, skincare, and beauty products.','https://logo.clearbit.com/loreal.com','L''Oréal',NULL,'NONE',0),
(26,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Popular makeup brand offering affordable beauty products.','https://logo.clearbit.com/maybelline.com','Maybelline',NULL,'NONE',0),
(27,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Indian beauty brand offering makeup and skincare products.','https://logo.clearbit.com/lakme-lever.com','Lakmé',NULL,'NONE',0),
(28,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Personal care brand with soaps, shampoos, and moisturizers.','https://logo.clearbit.com/dove.com','Dove',NULL,'NONE',0),
(29,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Global skincare brand with lotions and creams.','https://logo.clearbit.com/nivea.com','Nivea',NULL,'NONE',0),
(30,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Natural skincare and wellness brand based in India.','https://logo.clearbit.com/mamaearth.in','Mamaearth',NULL,'NONE',0),

(31,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Leading sports brand offering affordable gear and apparel.','https://logo.clearbit.com/decathlon.com','Decathlon',NULL,'NONE',0),
(32,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Performance wear and fitness gear brand.','https://logo.clearbit.com/underarmour.com','Under Armour',NULL,'NONE',0),
(33,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Global brand for badminton, tennis, and sports equipment.','https://logo.clearbit.com/yonex.com','Yonex',NULL,'NONE',0),
(34,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Athletic footwear and sportswear brand.','https://logo.clearbit.com/reebok.com','Reebok',NULL,'NONE',0),
(35,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Wearable tech brand for fitness tracking and smartwatches.','https://logo.clearbit.com/fitbit.com','Fitbit',NULL,'NONE',0),
(36,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Leading baby and toddler toys and learning products brand.','https://logo.clearbit.com/fisher-price.com','Fisher-Price',NULL,'NONE',0),
(37,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'World-famous building blocks and creative toys brand.','https://logo.clearbit.com/lego.com','Lego',NULL,'NONE',0),
(38,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Popular toy car brand from Mattel.','https://logo.clearbit.com/hotwheels.com','Hot Wheels',NULL,'NONE',0),
(39,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Baby care brand offering strollers, toys, and accessories.','https://logo.clearbit.com/chicco.com','Chicco',NULL,'NONE',0),
(40,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Trusted baby care brand for diapers and hygiene.','https://logo.clearbit.com/pampers.com','Pampers',NULL,'NONE',0),
(41,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Indian baby care brand for feeding and hygiene products.','https://logo.clearbit.com/meemee.in','Mee Mee',NULL,'NONE',0),
(42,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Food and beverage company offering cereals, milk, and chocolates.','https://logo.clearbit.com/nestle.com','Nestlé',NULL,'NONE',0),
(43,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Indian brand known for biscuits, dairy, and snacks.','https://logo.clearbit.com/britannia.co.in','Britannia',NULL,'NONE',0),
(44,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Popular Indian tea and beverage brand.','https://logo.clearbit.com/tatatea.com','Tata Tea',NULL,'NONE',0),
(45,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Indian dairy cooperative famous for milk, butter, and cheese.','https://logo.clearbit.com/amul.com','Amul',NULL,'NONE',0),
(46,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Brand offering edible oils, atta, and food staples.','https://logo.clearbit.com/fortunefoods.com','Fortune',NULL,'NONE',0),
(47,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Instant noodles and sauces brand under Nestlé.','https://logo.clearbit.com/maggi.com','Maggi',NULL,'NONE',0),
(48,b'1','2025-10-09 18:06:24.000000',1,'2025-10-09 18:06:24.000000',0,'Beverage and snacks brand offering Pepsi, Lays, and more.','https://logo.clearbit.com/pepsico.com','PepsiCo',NULL,'NONE',0),
(49,b'1','2025-10-09 18:08:07.000000',1,'2025-10-09 18:08:07.000000',0,'Global publisher offering books across all genres.','https://logo.clearbit.com/penguinrandomhouse.com','Penguin Random House',NULL,'NONE',0),
(50,b'1','2025-10-09 18:08:07.000000',1,'2025-10-09 18:08:07.000000',0,'Leading publisher of fiction, non-fiction, and educational books.','https://logo.clearbit.com/harpercollins.com','HarperCollins',NULL,'NONE',0),
(51,b'1','2025-10-09 18:08:07.000000',1,'2025-10-09 18:08:07.000000',0,'Publisher of children''s books and educational materials.','https://logo.clearbit.com/scholastic.com','Scholastic',NULL,'NONE',0),
(52,b'1','2025-10-09 18:08:07.000000',1,'2025-10-09 18:08:07.000000',0,'Indian stationery brand known for notebooks and supplies.','https://logo.clearbit.com/classmate.in','Classmate',NULL,'NONE',0),
(53,b'1','2025-10-09 18:08:07.000000',1,'2025-10-09 18:08:07.000000',0,'Stationery and art supplies brand popular in India.','https://logo.clearbit.com/camlin.com','Camlin',NULL,'NONE',0),
(54,b'1','2025-10-09 18:08:07.000000',1,'2025-10-09 18:08:07.000000',0,'Premium stationery and art supplies brand.','https://logo.clearbit.com/faber-castell.com','Faber-Castell',NULL,'NONE',0),
(55,b'1','2025-10-10 21:54:41.560083',1,'2025-10-10 21:54:41.560083',0,'ALl types of watches and repairing','https://example.com/assets/brands/shanti-watch-logo.png','Shanti Watch',NULL,'NONE',0),
(56,b'1','2025-10-10 22:16:36.159499',1,'2025-10-10 22:16:36.159499',0,'exclusive partner ','','New brand ', 'Premium & Trusted Partner','EXCLUSIVE',98),
(57,b'1','2026-03-29 15:12:14.630425',1,'2026-03-29 15:12:14.630425',1,'Brand created for product: Smart Watch',NULL,'Smart',NULL,'NONE',0),
(58,b'1','2026-03-29 15:24:52.322367',1,'2026-03-29 15:24:52.322367',1,'Brand created for product: Smart Watch',NULL,'Smart New',NULL,'NONE',0),
(60,b'1','2026-03-29 15:38:37.051260',1,'2026-03-29 15:38:37.051260',1,'Brand created for product: Smart ',NULL,'Smart brand',NULL,'NONE',0),
(61,b'1','2026-03-29 15:44:19.038397',1,'2026-03-29 15:44:19.039400',1,'Brand created for product: Smart new watch',NULL,'SmartNew',NULL,'NONE',0),
(62,b'1','2026-03-29 16:13:19.981806',1,'2026-03-29 16:13:19.981806',1,'Brand created for product: Smart watch',NULL,'SmartNNEWW',NULL,'NONE',0),
(63,b'1','2026-03-29 23:32:30.199817',1,'2026-03-29 23:32:30.199817',1,'Auto-created brand',NULL,'New branddd',NULL,'NONE',0),
(64,b'1','2026-03-30 20:28:05.411217',1,'2026-03-30 20:28:05.411217',1,'Auto-created brand',NULL,'Airtel Xstream',NULL,'NONE',0),
(65,b'1','2026-03-30 22:42:53.135135',1,'2026-03-30 22:42:53.135135',1,'Auto-created brand',NULL,'Noise',NULL,'NONE',0);