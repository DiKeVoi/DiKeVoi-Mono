-- Seeds: Vehicle
-- 3 drivers each with one active vehicle

insert into public."Vehicle" (id, "userId", make, model, year, plate, color, seats, "isActive", "createdAt") values
  ('b0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Volkswagen', 'Golf',    2021, 'M-AB 1234', 'White',  4, true,  '2025-01-10 08:30:00'),
  ('b0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003', 'BMW',        '3 Series',2022, 'B-CD 5678', 'Black',  4, true,  '2025-02-01 11:30:00'),
  ('b0000002-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000004', 'Mercedes',   'A-Klasse',2020, 'HH-EF 910','Silver', 4, true,  '2025-02-14 14:30:00');
