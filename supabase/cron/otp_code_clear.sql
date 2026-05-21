SELECT cron.schedule('otp_code_clear','*/15 * * * *', $$
  DELETE FROM public."OtpCode"
  WHERE "expiresAt" < NOW() OR used = TRUE;
$$);