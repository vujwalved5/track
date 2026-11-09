-- ============================================================
-- Migration 0003: Optimize RLS policies and add missing indexes
-- ============================================================
-- 1. Wrap auth.uid() in (select auth.uid()) so Postgres evaluates
--    the authentication function once per query rather than per row.
-- 2. Add foreign key indexes to prevent sequential scans during RLS
--    joins (books -> months -> widgets -> entries).
--    - idx_widgets_month_id: already existed (migration 0002)
--    - idx_books_user_id: new
--    - idx_months_book_id: new
--    - idx_entries_widget_id: new
-- ============================================================

-- ── 1. Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books (user_id);
CREATE INDEX IF NOT EXISTS idx_months_book_id ON public.months (book_id);
CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);
CREATE INDEX IF NOT EXISTS idx_entries_widget_id ON public.entries (widget_id);

-- ── 2. books policies ───────────────────────────────────────
ALTER POLICY "books: owner read"
  ON public.books
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY "books: owner insert"
  ON public.books
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER POLICY "books: owner update"
  ON public.books
  USING (user_id = (SELECT auth.uid()));

ALTER POLICY "books: owner delete"
  ON public.books
  USING (user_id = (SELECT auth.uid()));

-- ── 3. months policies ──────────────────────────────────────
ALTER POLICY "months: owner read"
  ON public.months
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = months.book_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "months: owner insert"
  ON public.months
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = months.book_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "months: owner update"
  ON public.months
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = months.book_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "months: owner delete"
  ON public.months
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = months.book_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

-- ── 4. widgets policies ─────────────────────────────────────
ALTER POLICY "widgets: owner read"
  ON public.widgets
  USING (
    EXISTS (
      SELECT 1 FROM public.months
      JOIN public.books ON books.id = months.book_id
      WHERE months.id = widgets.month_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "widgets: owner insert"
  ON public.widgets
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.months
      JOIN public.books ON books.id = months.book_id
      WHERE months.id = widgets.month_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "widgets: owner update"
  ON public.widgets
  USING (
    EXISTS (
      SELECT 1 FROM public.months
      JOIN public.books ON books.id = months.book_id
      WHERE months.id = widgets.month_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "widgets: owner delete"
  ON public.widgets
  USING (
    EXISTS (
      SELECT 1 FROM public.months
      JOIN public.books ON books.id = months.book_id
      WHERE months.id = widgets.month_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

-- ── 5. entries policies ─────────────────────────────────────
ALTER POLICY "entries: owner read"
  ON public.entries
  USING (
    EXISTS (
      SELECT 1 FROM public.widgets
      JOIN public.months ON months.id = widgets.month_id
      JOIN public.books  ON books.id  = months.book_id
      WHERE widgets.id = entries.widget_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "entries: owner insert"
  ON public.entries
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.widgets
      JOIN public.months ON months.id = widgets.month_id
      JOIN public.books  ON books.id  = months.book_id
      WHERE widgets.id = entries.widget_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "entries: owner update"
  ON public.entries
  USING (
    EXISTS (
      SELECT 1 FROM public.widgets
      JOIN public.months ON months.id = widgets.month_id
      JOIN public.books  ON books.id  = months.book_id
      WHERE widgets.id = entries.widget_id
        AND books.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "entries: owner delete"
  ON public.entries
  USING (
    EXISTS (
      SELECT 1 FROM public.widgets
      JOIN public.months ON months.id = widgets.month_id
      JOIN public.books  ON books.id  = months.book_id
      WHERE widgets.id = entries.widget_id
        AND books.user_id = (SELECT auth.uid())
    )
  );
