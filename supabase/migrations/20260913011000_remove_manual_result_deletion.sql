-- Manual result deletion was removed. Scheduled expiry cleanup runs as postgres.
revoke delete on public.saved_results from service_role;
