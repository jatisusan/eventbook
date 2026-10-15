CREATE UNIQUE INDEX "bookings_one_active_per_user_event"
ON "bookings" ("userId", "eventId")
WHERE "status" = 'CONFIRMED';
