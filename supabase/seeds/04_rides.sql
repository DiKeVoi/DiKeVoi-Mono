-- Seeds: Ride
-- Confirmed matches between offer and request users, all ride statuses covered

insert into public."Ride" (id, "offerUserId", "requestUserId", "originLocation", "destinationLocation", "departureTime", status, "negotiatedCost", "returnTime", "isRecurring", "createdAt") values
  (
    'd0000004-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'Munich Hauptbahnhof, Munich',
    'Nuremberg Hauptbahnhof, Nuremberg',
    '2026-04-10 07:30:00',
    'completed',
    18.50,
    null,
    false,
    '2026-04-08 14:00:00'
  ),
  (
    'd0000004-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'Hamburg Altona, Hamburg',
    'Berlin Hauptbahnhof, Berlin',
    '2026-05-20 06:00:00',
    'confirmed',
    35.00,
    null,
    false,
    '2026-05-07 10:00:00'
  ),
  (
    'd0000004-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000005',
    'Munich Pasing, Munich',
    'Augsburg Hauptbahnhof, Augsburg',
    '2026-05-13 07:45:00',
    'pending',
    null,
    null,
    true,
    '2026-05-07 13:30:00'
  ),
  (
    'd0000004-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000002',
    'Cologne Central Station, Cologne',
    'Düsseldorf Airport, Düsseldorf',
    '2026-03-25 05:30:00',
    'cancelled',
    12.00,
    null,
    false,
    '2026-03-20 09:00:00'
  );
