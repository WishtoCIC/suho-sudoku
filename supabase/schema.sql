-- 수호의 스도쿠 놀이터: 이어하기(기기 간 동기화) 저장소
-- Supabase SQL Editor 에 붙여 넣고 Run 하면 됩니다. 여러 번 실행해도 안전해요.

create table if not exists public.sudoku_progress (
  sync_code  text primary key check (sync_code ~ '^SUHO-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 테이블 직접 접근은 막고(정책 없음 = anon 접근 불가), 아래 두 함수로만 읽고 씀
alter table public.sudoku_progress enable row level security;
revoke all on public.sudoku_progress from anon, authenticated;

create or replace function public.sudoku_load(p_code text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.sudoku_progress where sync_code = p_code;
$$;

create or replace function public.sudoku_save(p_code text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_code !~ '^SUHO-[A-Z0-9]{4}-[A-Z0-9]{4}$' then
    raise exception 'invalid code';
  end if;
  if octet_length(p_data::text) > 300000 then
    raise exception 'data too large';
  end if;
  insert into public.sudoku_progress (sync_code, data, updated_at)
  values (p_code, p_data, now())
  on conflict (sync_code) do update set data = excluded.data, updated_at = now();
end;
$$;

revoke all on function public.sudoku_load(text) from public;
revoke all on function public.sudoku_save(text, jsonb) from public;
grant execute on function public.sudoku_load(text) to anon, authenticated;
grant execute on function public.sudoku_save(text, jsonb) to anon, authenticated;
