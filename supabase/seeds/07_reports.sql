-- Seeds: Report
-- Covers all report statuses; both ride-linked and user-only reports

insert into public."Report" (id, "reporterId", "reportedUserId", "rideId", reason, "imageURL", status, "createdAt") values
  (
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000004',
    'd0000004-0000-0000-0000-000000000004',
    'Driver cancelled last minute without notice, causing me to miss my flight.',
    null,
    'resolved',
    '2026-03-25 09:00:00'
  ),
  (
    'a0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000005',
    null,
    'User sent inappropriate messages during negotiation.',
    null,
    'pending',
    '2026-05-06 18:00:00'
  ),
  (
    'a0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000002',
    'd0000004-0000-0000-0000-000000000002',
    'Passenger was 20 minutes late to pickup point.',
    null,
    'resolved',
    '2026-05-07 08:00:00'
  ),
  (
    'a0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000001',
    null,
    'Suspicious profile, photo does not match description.',
    null,
    'dismissed',
    '2026-04-20 12:00:00'
  );
