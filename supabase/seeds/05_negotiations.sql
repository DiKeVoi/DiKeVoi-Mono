-- Seeds: Negotiation
-- departureTime stored as varchar (current schema pre-migration)
-- All negotiation statuses covered

insert into public."Negotiation" (id, "offererUid", "requesterUid", "rideId", status, "pickupLocation", "dropoffLocation", "departureTime", fare, note, "confirmedByOfferer", "confirmedByRequester", "lastEditedBy", "lastEditedAt", "createdAt", "updatedAt") values
  (
    'e0000005-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'd0000004-0000-0000-0000-000000000001',
    'confirmed',
    'Munich Hauptbahnhof, Gate A',
    'Nuremberg Hauptbahnhof, Main Exit',
    '2026-04-10T07:30:00',
    1850,
    'Please be there 5 minutes early.',
    true,
    true,
    'a0000001-0000-0000-0000-000000000002',
    '2026-04-08 15:00:00',
    '2026-04-08 14:00:00',
    '2026-04-08 15:00:00'
  ),
  (
    'e0000005-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'd0000004-0000-0000-0000-000000000002',
    'pending',
    'Hamburg Altona Station',
    'Berlin Hauptbahnhof, East Entrance',
    '2026-05-20T06:00:00',
    3000,
    'Can you do 30 EUR instead of 35?',
    false,
    false,
    'a0000001-0000-0000-0000-000000000004',
    '2026-05-07 11:00:00',
    '2026-05-07 10:30:00',
    '2026-05-07 11:00:00'
  ),
  (
    'e0000005-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000002',
    'd0000004-0000-0000-0000-000000000004',
    'cancelled',
    'Cologne Central Station, Platform 3',
    'Düsseldorf Airport, Terminal 1',
    '2026-03-25T05:30:00',
    1200,
    null,
    false,
    true,
    'a0000001-0000-0000-0000-000000000004',
    '2026-03-21 10:00:00',
    '2026-03-20 09:30:00',
    '2026-03-21 10:00:00'
  );
