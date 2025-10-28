-- Expand channels to include sms and whatsapp
ALTER TABLE sequence_queue
  DROP CONSTRAINT IF EXISTS sequence_queue_channel_check;

ALTER TABLE sequence_queue
  ADD CONSTRAINT sequence_queue_channel_check
  CHECK (channel IN ('email','sms','whatsapp'));

