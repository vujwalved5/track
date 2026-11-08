-- Migration: 0002_add_widgets_month_id_index.sql
-- Adds missing secondary index on widgets(month_id) for fast relational lookups and RLS evaluation

CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);
