-- Seeds: RidePost
-- Mix of offer/request posts, recurring and one-off, various gender preferences

insert into public."RidePost" (id, "userId", type, "originLocation", "destinationLocation", "departureTime", "isRecurring", "preferredGender", description, "createdAt") values
  (
    'c0000003-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'offer',
    'Munich Hauptbahnhof, Munich',
    'Nuremberg Hauptbahnhof, Nuremberg',
    '2026-05-15 07:30:00',
    false,
    null,
    'Comfortable ride, music optional. Space for one bag.',
    '2026-05-07 09:00:00'
  ),
  (
    'c0000003-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000002',
    'request',
    'Schwabing, Munich',
    'TU Munich, Munich',
    '2026-05-13 08:00:00',
    true,
    'female',
    'Daily commute to uni, prefer female driver.',
    '2026-05-07 10:15:00'
  ),
  (
    'c0000003-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000003',
    'offer',
    'Hamburg Altona, Hamburg',
    'Berlin Hauptbahnhof, Berlin',
    '2026-05-20 06:00:00',
    false,
    null,
    'Long-distance trip. Fuel split 3 ways. Pet-friendly.',
    '2026-05-07 11:00:00'
  ),
  (
    'c0000003-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000004',
    'request',
    'Cologne Central Station, Cologne',
    'Düsseldorf Airport, Düsseldorf',
    '2026-05-14 05:30:00',
    false,
    null,
    'Early flight, need punctual driver.',
    '2026-05-07 12:00:00'
  ),
  (
    'c0000003-0000-0000-0000-000000000005',
    'a0000001-0000-0000-0000-000000000001',
    'offer',
    'Munich Pasing, Munich',
    'Augsburg Hauptbahnhof, Augsburg',
    '2026-05-13 07:45:00',
    true,
    null,
    'Daily commute offer, every weekday morning.',
    '2026-05-07 13:00:00'
  );
