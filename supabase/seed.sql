-- ============================================================
-- PartFlow Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- NOTE: Do NOT insert into profiles directly here.
--       Profiles are auto-created by the auth trigger.
--       Create users via Supabase Auth dashboard or the app.
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
insert into public.categories (id, name, description) values
  ('a1000000-0000-0000-0000-000000000001', 'Filters', 'Oil, air, fuel, and cabin filters'),
  ('a1000000-0000-0000-0000-000000000002', 'Brakes', 'Brake pads, rotors, calipers, and fluid'),
  ('a1000000-0000-0000-0000-000000000003', 'Engine', 'Engine components and gaskets'),
  ('a1000000-0000-0000-0000-000000000004', 'Electrical', 'Batteries, alternators, starters, and wiring'),
  ('a1000000-0000-0000-0000-000000000005', 'Cooling', 'Radiators, hoses, thermostats, and coolant'),
  ('a1000000-0000-0000-0000-000000000006', 'Suspension', 'Shocks, struts, springs, and bushings'),
  ('a1000000-0000-0000-0000-000000000007', 'Transmission', 'Transmission fluid, clutches, and gears'),
  ('a1000000-0000-0000-0000-000000000008', 'Ignition', 'Spark plugs, coils, and ignition wires'),
  ('a1000000-0000-0000-0000-000000000009', 'Exhaust', 'Mufflers, catalytic converters, and exhaust pipes'),
  ('a1000000-0000-0000-0000-000000000010', 'Fluids & Lubricants', 'Engine oil, brake fluid, coolant, and grease');

-- ============================================================
-- BRANDS
-- ============================================================
insert into public.brands (id, name) values
  ('b1000000-0000-0000-0000-000000000001', 'Bosch'),
  ('b1000000-0000-0000-0000-000000000002', 'Denso'),
  ('b1000000-0000-0000-0000-000000000003', 'Mann-Filter'),
  ('b1000000-0000-0000-0000-000000000004', 'NGK'),
  ('b1000000-0000-0000-0000-000000000005', 'ACDelco'),
  ('b1000000-0000-0000-0000-000000000006', 'Brembo'),
  ('b1000000-0000-0000-0000-000000000007', 'KYB'),
  ('b1000000-0000-0000-0000-000000000008', 'Gates'),
  ('b1000000-0000-0000-0000-000000000009', 'Mobil'),
  ('b1000000-0000-0000-0000-000000000010', 'Castrol');

-- ============================================================
-- SUPPLIERS
-- ============================================================
insert into public.suppliers (id, name, contact_person, email, phone, address) values
  ('c1000000-0000-0000-0000-000000000001', 'AutoParts Direct', 'Michael Torres', 'orders@autopartsdirect.com', '+1-555-0201', '450 Industrial Blvd, Detroit, MI'),
  ('c1000000-0000-0000-0000-000000000002', 'Global Spare Parts Co', 'Sarah Kim', 'purchasing@globalspare.com', '+1-555-0202', '88 Trade Center Dr, Chicago, IL'),
  ('c1000000-0000-0000-0000-000000000003', 'Premium Auto Supply', 'James Anderson', 'sales@premiumauto.com', '+1-555-0203', '120 Commerce Way, Houston, TX'),
  ('c1000000-0000-0000-0000-000000000004', 'EuroMotor Parts', 'Hans Weber', 'info@euromotorparts.de', '+49-30-55501', '15 Berliner Str, Berlin, Germany'),
  ('c1000000-0000-0000-0000-000000000005', 'Pacific Auto Wholesale', 'Lin Chen', 'wholesale@pacificauto.com', '+1-555-0205', '300 Harbor Blvd, Los Angeles, CA');

-- ============================================================
-- PRODUCTS
-- ============================================================
insert into public.products (id, sku, name, description, category_id, brand_id, unit_price, cost_price) values
  ('d1000000-0000-0000-0000-000000000001', 'FLT-OIL-001', 'Engine Oil Filter', 'Standard spin-on oil filter for passenger vehicles', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 15.50, 8.20),
  ('d1000000-0000-0000-0000-000000000002', 'FLT-AIR-001', 'Air Filter Cartridge', 'Panel-type air filter for 4-cylinder engines', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 22.00, 11.50),
  ('d1000000-0000-0000-0000-000000000003', 'BRK-PAD-001', 'Front Brake Pad Set', 'Semi-metallic front brake pads, set of 4', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 65.00, 35.00),
  ('d1000000-0000-0000-0000-000000000004', 'BRK-PAD-002', 'Rear Brake Pad Set', 'Ceramic rear brake pads, set of 4', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 58.00, 30.00),
  ('d1000000-0000-0000-0000-000000000005', 'BRK-ROT-001', 'Front Brake Rotor', 'Vented front disc brake rotor', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 85.00, 45.00),
  ('d1000000-0000-0000-0000-000000000006', 'COL-RAD-001', 'Radiator Hose Upper', 'Upper radiator coolant hose, universal fit', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000008', 28.50, 14.00),
  ('d1000000-0000-0000-0000-000000000007', 'COL-RAD-002', 'Radiator Hose Lower', 'Lower radiator coolant hose, universal fit', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000008', 32.00, 16.00),
  ('d1000000-0000-0000-0000-000000000008', 'ELC-BAT-001', 'Battery 12V 60Ah', 'Maintenance-free lead-acid battery', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', 95.00, 55.00),
  ('d1000000-0000-0000-0000-000000000009', 'ELC-BAT-002', 'Battery 12V 100Ah', 'Heavy-duty battery for trucks and SUVs', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', 145.00, 85.00),
  ('d1000000-0000-0000-0000-000000000010', 'ELC-ALT-001', 'Alternator 120A', 'Remanufactured alternator, 120 amp output', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 185.00, 95.00),
  ('d1000000-0000-0000-0000-000000000011', 'ELC-STR-001', 'Starter Motor', 'Remanufactured starter motor', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 165.00, 88.00),
  ('d1000000-0000-0000-0000-000000000012', 'ENG-TMB-001', 'Timing Belt Kit', 'Timing belt with tensioner and idler pulleys', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008', 125.00, 65.00),
  ('d1000000-0000-0000-0000-000000000013', 'ENG-GSK-001', 'Head Gasket Set', 'Complete cylinder head gasket set', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 210.00, 110.00),
  ('d1000000-0000-0000-0000-000000000014', 'IGN-SPK-001', 'Spark Plug Set (4pc)', 'Iridium spark plugs, set of 4', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 36.00, 18.00),
  ('d1000000-0000-0000-0000-000000000015', 'IGN-SPK-002', 'Spark Plug Set (6pc)', 'Iridium spark plugs, set of 6 for V6 engines', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 54.00, 27.00),
  ('d1000000-0000-0000-0000-000000000016', 'IGN-COL-001', 'Ignition Coil Pack', 'Direct ignition coil, single unit', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 42.00, 22.00),
  ('d1000000-0000-0000-0000-000000000017', 'SUS-SHK-001', 'Front Shock Absorber', 'Gas-charged front shock absorber, each', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', 78.00, 40.00),
  ('d1000000-0000-0000-0000-000000000018', 'SUS-SHK-002', 'Rear Shock Absorber', 'Gas-charged rear shock absorber, each', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', 72.00, 38.00),
  ('d1000000-0000-0000-0000-000000000019', 'TRN-FLD-001', 'Transmission Fluid 1L', 'Automatic transmission fluid, 1 liter', 'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000009', 18.00, 9.50),
  ('d1000000-0000-0000-0000-000000000020', 'FLD-OIL-001', 'Engine Oil 5W-30 5L', 'Full synthetic engine oil, 5 liter', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 45.00, 25.00),
  ('d1000000-0000-0000-0000-000000000021', 'FLD-OIL-002', 'Engine Oil 10W-40 5L', 'Semi-synthetic engine oil, 5 liter', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000009', 38.00, 20.00),
  ('d1000000-0000-0000-0000-000000000022', 'FLD-BRK-001', 'Brake Fluid DOT 4 1L', 'High-performance DOT 4 brake fluid', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 12.50, 6.00),
  ('d1000000-0000-0000-0000-000000000023', 'FLT-FUL-001', 'Fuel Filter', 'In-line fuel filter for fuel-injected engines', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 19.00, 9.50),
  ('d1000000-0000-0000-0000-000000000024', 'FLT-CAB-001', 'Cabin Air Filter', 'Activated carbon cabin air filter', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 24.00, 12.00),
  ('d1000000-0000-0000-0000-000000000025', 'EXH-MUF-001', 'Exhaust Muffler', 'Stainless steel exhaust muffler, universal', 'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000001', 120.00, 65.00),
  ('d1000000-0000-0000-0000-000000000026', 'COL-THS-001', 'Thermostat', 'Engine coolant thermostat with gasket', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 22.00, 11.00),
  ('d1000000-0000-0000-0000-000000000027', 'COL-WPM-001', 'Water Pump', 'Engine water pump with gasket', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000008', 75.00, 40.00),
  ('d1000000-0000-0000-0000-000000000028', 'BRK-FLD-001', 'Brake Caliper Front', 'Remanufactured front brake caliper', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 135.00, 70.00),
  ('d1000000-0000-0000-0000-000000000029', 'ENG-BLT-001', 'Serpentine Belt', 'Multi-rib serpentine drive belt', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008', 28.00, 14.00),
  ('d1000000-0000-0000-0000-000000000030', 'SUS-SPR-001', 'Coil Spring Front', 'Front suspension coil spring, each', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007', 65.00, 34.00);

-- ============================================================
-- INVENTORY
-- ============================================================
insert into public.inventory (product_id, quantity_on_hand, reorder_level, reorder_quantity, last_restocked_at) values
  ('d1000000-0000-0000-0000-000000000001', 120, 20, 100, '2026-06-15'),
  ('d1000000-0000-0000-0000-000000000002', 85, 15, 80, '2026-06-10'),
  ('d1000000-0000-0000-0000-000000000003', 40, 10, 50, '2026-06-12'),
  ('d1000000-0000-0000-0000-000000000004', 35, 10, 50, '2026-06-12'),
  ('d1000000-0000-0000-0000-000000000005', 20, 8, 30, '2026-06-01'),
  ('d1000000-0000-0000-0000-000000000006', 60, 15, 60, '2026-06-08'),
  ('d1000000-0000-0000-0000-000000000007', 55, 15, 60, '2026-06-08'),
  ('d1000000-0000-0000-0000-000000000008', 15, 5, 20, '2026-05-28'),
  ('d1000000-0000-0000-0000-000000000009', 8, 5, 15, '2026-05-20'),
  ('d1000000-0000-0000-0000-000000000010', 6, 3, 10, '2026-05-15'),
  ('d1000000-0000-0000-0000-000000000011', 5, 3, 10, '2026-05-15'),
  ('d1000000-0000-0000-0000-000000000012', 12, 5, 20, '2026-06-05'),
  ('d1000000-0000-0000-0000-000000000013', 3, 2, 8, '2026-04-20'),
  ('d1000000-0000-0000-0000-000000000014', 75, 20, 100, '2026-06-18'),
  ('d1000000-0000-0000-0000-000000000015', 45, 15, 60, '2026-06-18'),
  ('d1000000-0000-0000-0000-000000000016', 30, 10, 40, '2026-06-10'),
  ('d1000000-0000-0000-0000-000000000017', 18, 8, 30, '2026-06-02'),
  ('d1000000-0000-0000-0000-000000000018', 22, 8, 30, '2026-06-02'),
  ('d1000000-0000-0000-0000-000000000019', 90, 25, 100, '2026-06-20'),
  ('d1000000-0000-0000-0000-000000000020', 50, 15, 60, '2026-06-22'),
  ('d1000000-0000-0000-0000-000000000021', 45, 15, 60, '2026-06-22'),
  ('d1000000-0000-0000-0000-000000000022', 100, 30, 120, '2026-06-20'),
  ('d1000000-0000-0000-0000-000000000023', 65, 20, 80, '2026-06-15'),
  ('d1000000-0000-0000-0000-000000000024', 55, 15, 60, '2026-06-15'),
  ('d1000000-0000-0000-0000-000000000025', 4, 3, 10, '2026-04-10'),
  ('d1000000-0000-0000-0000-000000000026', 40, 10, 40, '2026-06-10'),
  ('d1000000-0000-0000-0000-000000000027', 10, 5, 20, '2026-05-25'),
  ('d1000000-0000-0000-0000-000000000028', 7, 3, 12, '2026-05-18'),
  ('d1000000-0000-0000-0000-000000000029', 70, 20, 80, '2026-06-14'),
  ('d1000000-0000-0000-0000-000000000030', 14, 6, 24, '2026-06-01');

-- ============================================================
-- CUSTOMERS
-- ============================================================
insert into public.customers (id, name, phone, email, address) values
  ('e1000000-0000-0000-0000-000000000001', 'EastGate Logistics', '+1-555-0101', 'parts@eastgate-logistics.com', '142 Industrial Ave, Cairo'),
  ('e1000000-0000-0000-0000-000000000002', 'Desert Auto Repair', '+1-555-0102', 'ordering@desertauto.com', '89 Service Rd, Alexandria'),
  ('e1000000-0000-0000-0000-000000000003', 'ProFleet Services', '+1-555-0103', 'purchasing@profleet.com', '204 Fleet Blvd, Giza'),
  ('e1000000-0000-0000-0000-000000000004', 'Nile Heavy Equipment', '+1-555-0104', 'supply@nileheavy.com', '56 Workshop Lane, Cairo'),
  ('e1000000-0000-0000-0000-000000000005', 'Cairo Truck Depot', '+1-555-0105', 'inventory@cairotruck.com', '301 Depot Rd, Cairo'),
  ('e1000000-0000-0000-0000-000000000006', 'Mediterranean Motors', '+1-555-0106', 'ordering@medmotors.com', '88 Port Dr, Alexandria'),
  ('e1000000-0000-0000-0000-000000000007', 'Suez Transport Co', '+1-555-0107', 'parts@suezco.com', '142 Shipping Ln, Suez'),
  ('e1000000-0000-0000-0000-000000000008', 'Gulf Industrial Supply', '+1-555-0108', 'buyers@gulfindustrial.com', '75 Trade St, Port Said'),
  ('e1000000-0000-0000-0000-000000000009', 'Oasis Automotive', '+1-555-0109', 'procurement@oasisauto.com', '33 Main St, Giza'),
  ('e1000000-0000-0000-0000-000000000010', 'Red Sea Shipping', '+1-555-0110', 'ordering@redseaship.com', '200 Harbor Rd, Hurghada'),
  ('e1000000-0000-0000-0000-000000000011', 'Delta Fleet Management', '+1-555-0111', 'fleet@deltafleet.com', '15 River Rd, Mansoura'),
  ('e1000000-0000-0000-0000-000000000012', 'Pharaoh Auto Center', '+1-555-0112', 'service@pharaohauto.com', '410 Sphinx Ave, Luxor');

-- ============================================================
-- NOTE ON ORDERS:
-- Orders reference employee_id (profiles.id), which is tied to
-- auth.users. You must create auth users FIRST, then insert
-- orders referencing those profile IDs.
--
-- After creating your admin and employee users via the app or
-- Supabase Auth dashboard, you can insert sample orders using
-- the following template. Replace the employee_id values with
-- actual profile UUIDs from your auth users.
-- ============================================================

-- Sample orders will be created through the application UI
-- after authentication is set up.
