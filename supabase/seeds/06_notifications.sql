-- Seeds: Notification
-- Covers read/unread states across multiple users

insert into public."Notification" (id, "userId", title, body, "isRead", "createdAt") values
  (
    'a0000006-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'Ride Confirmed',
    'Your ride to Nuremberg on Apr 10 has been confirmed.',
    true,
    '2026-04-08 15:05:00'
  ),
  (
    'a0000006-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000001',
    'New Ride Request',
    'Anna Schmidt wants to join your Munich → Nuremberg trip.',
    true,
    '2026-04-08 14:05:00'
  ),
  (
    'a0000006-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'Negotiation Update',
    'Lena Weber responded to your fare offer.',
    false,
    '2026-05-07 11:05:00'
  ),
  (
    'a0000006-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000003',
    'New Ride Request',
    'Tom Fischer wants to join your Hamburg → Berlin trip.',
    false,
    '2026-05-07 10:35:00'
  ),
  (
    'a0000006-0000-0000-0000-000000000005',
    'a0000001-0000-0000-0000-000000000002',
    'Ride Cancelled',
    'Your Cologne → Düsseldorf ride on Mar 25 was cancelled.',
    true,
    '2026-03-21 10:05:00'
  ),
  (
    'a0000006-0000-0000-0000-000000000006',
    'a0000001-0000-0000-0000-000000000005',
    'Welcome to DiKeVoi',
    'Your account is pending verification. Check your email.',
    false,
    '2026-03-05 16:50:00'
  );
