-- ─────────────────────────────────────────────────────────────────────────────
-- Bodega Bühlot — Phase F2: Schichtplaner v2 — Swap enhancements
--
-- Extends shift_swaps table to support:
--   1. Two distinct flows: "exchange" (1:1 swap) and "takeover" (one-way)
--   2. Target user tracking (who receives the swap request)
--   3. Magic-link token for email-based 1-click accept/reject
--   4. Auto-expiry (72h) for pending swaps
--   5. finalize_swap() SQL function for atomic assignment updates
--
-- Idempotent. Safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Extend shift_swap_status enum ─────────────────────────────────────────
do $$ begin
  alter type shift_swap_status add value if not exists 'accepted_by_target';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type shift_swap_status add value if not exists 'finalized';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type shift_swap_status add value if not exists 'expired';
exception when duplicate_object then null; end $$;

-- ── 2. Create shift_swap_kind enum ───────────────────────────────────────────
do $$ begin
  create type shift_swap_kind as enum ('exchange', 'takeover');
exception when duplicate_object then null; end $$;

-- ── 3. Extend shift_swaps table ──────────────────────────────────────────────
alter table shift_swaps
  add column if not exists kind shift_swap_kind not null default 'exchange',
  add column if not exists target_assignment_id uuid references shift_assignments(id) on delete cascade,
  add column if not exists target_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  add column if not exists accept_token_hash text,
  add column if not exists accepted_by_target_at timestamptz,
  add column if not exists finalized_at timestamptz,
  add column if not exists expires_at timestamptz not null default (now() + interval '72 hours');

-- Remove default on target_user_id after initial migration
alter table shift_swaps alter column target_user_id drop default;

-- ── 4. Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_swaps_target on shift_swaps (target_user_id, status);
create index if not exists idx_swaps_expires on shift_swaps (expires_at) where status = 'pending';

-- ── 5. RLS for target_user ───────────────────────────────────────────────────
-- Target user can read swaps addressed to them
drop policy if exists swaps_target_read on shift_swaps;
create policy swaps_target_read on shift_swaps
  for select using (
    target_user_id = auth.uid()
    or requester_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  );

-- Target user can update only their own pending swaps (accept/reject)
drop policy if exists swaps_target_respond on shift_swaps;
create policy swaps_target_respond on shift_swaps
  for update using (
    target_user_id = auth.uid() and status = 'pending'
  );

-- ── 6. finalize_swap() SQL function ──────────────────────────────────────────
create or replace function finalize_swap(swap_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_swap record;
  v_requester_assignment_id uuid;
  v_target_assignment_id uuid;
  v_requester_user_id uuid;
  v_target_user_id uuid;
begin
  -- Lock the swap row
  select * into v_swap
  from shift_swaps
  where id = swap_id
  for update;

  if not found then
    raise exception 'Swap % not found', swap_id;
  end if;

  if v_swap.status != 'accepted_by_target' then
    raise exception 'Swap % status is %, expected accepted_by_target', swap_id, v_swap.status;
  end if;

  -- Get assignment IDs
  v_requester_assignment_id := v_swap.assignment_id;
  v_target_assignment_id := v_swap.target_assignment_id;
  v_requester_user_id := v_swap.requester_id;
  v_target_user_id := v_swap.target_user_id;

  if v_swap.kind = 'exchange' then
    -- Swap user_id values atomically
    if v_target_assignment_id is null then
      raise exception 'Exchange swap % missing target_assignment_id', swap_id;
    end if;

    update shift_assignments
    set user_id = case
      when id = v_requester_assignment_id then v_target_user_id
      when id = v_target_assignment_id then v_requester_user_id
      else user_id
    end
    where id in (v_requester_assignment_id, v_target_assignment_id);

  elsif v_swap.kind = 'takeover' then
    -- Target takes over requester's shift
    update shift_assignments
    set user_id = v_target_user_id
    where id = v_requester_assignment_id;

  else
    raise exception 'Unknown swap kind: %', v_swap.kind;
  end if;

  -- Mark swap as finalized
  update shift_swaps
  set status = 'finalized', finalized_at = now()
  where id = swap_id;
end;
$$;

-- Grant execute to authenticated users (called via service role in practice)
grant execute on function finalize_swap(uuid) to authenticated;
