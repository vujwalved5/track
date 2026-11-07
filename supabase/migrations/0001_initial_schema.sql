-- ============================================================
-- Migration 0001: Initial schema for Memorable Moments
-- ============================================================

-- ── books ────────────────────────────────────────────────────
create table if not exists books (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  year       int  not null,
  unique (user_id, year)
);

alter table books enable row level security;

create policy "books: owner read"
  on books for select
  using (user_id = auth.uid());

create policy "books: owner insert"
  on books for insert
  with check (user_id = auth.uid());

create policy "books: owner update"
  on books for update
  using (user_id = auth.uid());

create policy "books: owner delete"
  on books for delete
  using (user_id = auth.uid());

-- ── months ───────────────────────────────────────────────────
create table if not exists months (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  book_id          uuid not null references books (id) on delete cascade,
  month            int  not null check (month between 1 and 12),
  setup_done       boolean not null default false,
  paper_left       text not null default 'dotted'
                     check (paper_left in ('dotted','squared','lined','blank')),
  paper_right      text not null default 'dotted'
                     check (paper_right in ('dotted','squared','lined','blank')),
  next_month_note  text,
  setup_config     jsonb not null default '{}',
  unique (book_id, month)
);

alter table months enable row level security;

create policy "months: owner read"
  on months for select
  using (
    exists (
      select 1 from books
      where books.id = months.book_id
        and books.user_id = auth.uid()
    )
  );

create policy "months: owner insert"
  on months for insert
  with check (
    exists (
      select 1 from books
      where books.id = months.book_id
        and books.user_id = auth.uid()
    )
  );

create policy "months: owner update"
  on months for update
  using (
    exists (
      select 1 from books
      where books.id = months.book_id
        and books.user_id = auth.uid()
    )
  );

create policy "months: owner delete"
  on months for delete
  using (
    exists (
      select 1 from books
      where books.id = months.book_id
        and books.user_id = auth.uid()
    )
  );

-- ── widgets ──────────────────────────────────────────────────
create table if not exists widgets (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  month_id   uuid not null references months (id) on delete cascade,
  page       text not null check (page in ('left','right')),
  type       text not null,
  x          int  not null,
  y          int  not null,
  w          int  not null,
  h          int  not null,
  config     jsonb not null default '{}',
  z          int  not null default 0
);

alter table widgets enable row level security;

create policy "widgets: owner read"
  on widgets for select
  using (
    exists (
      select 1 from months
      join books on books.id = months.book_id
      where months.id = widgets.month_id
        and books.user_id = auth.uid()
    )
  );

create policy "widgets: owner insert"
  on widgets for insert
  with check (
    exists (
      select 1 from months
      join books on books.id = months.book_id
      where months.id = widgets.month_id
        and books.user_id = auth.uid()
    )
  );

create policy "widgets: owner update"
  on widgets for update
  using (
    exists (
      select 1 from months
      join books on books.id = months.book_id
      where months.id = widgets.month_id
        and books.user_id = auth.uid()
    )
  );

create policy "widgets: owner delete"
  on widgets for delete
  using (
    exists (
      select 1 from months
      join books on books.id = months.book_id
      where months.id = widgets.month_id
        and books.user_id = auth.uid()
    )
  );

-- ── entries ──────────────────────────────────────────────────
create table if not exists entries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  widget_id  uuid not null references widgets (id) on delete cascade,
  day        int  not null check (day between 1 and 31),
  value      jsonb not null,
  unique (widget_id, day)
);

alter table entries enable row level security;

create policy "entries: owner read"
  on entries for select
  using (
    exists (
      select 1 from widgets
      join months on months.id = widgets.month_id
      join books  on books.id  = months.book_id
      where widgets.id = entries.widget_id
        and books.user_id = auth.uid()
    )
  );

create policy "entries: owner insert"
  on entries for insert
  with check (
    exists (
      select 1 from widgets
      join months on months.id = widgets.month_id
      join books  on books.id  = months.book_id
      where widgets.id = entries.widget_id
        and books.user_id = auth.uid()
    )
  );

create policy "entries: owner update"
  on entries for update
  using (
    exists (
      select 1 from widgets
      join months on months.id = widgets.month_id
      join books  on books.id  = months.book_id
      where widgets.id = entries.widget_id
        and books.user_id = auth.uid()
    )
  );

create policy "entries: owner delete"
  on entries for delete
  using (
    exists (
      select 1 from widgets
      join months on months.id = widgets.month_id
      join books  on books.id  = months.book_id
      where widgets.id = entries.widget_id
        and books.user_id = auth.uid()
    )
  );
