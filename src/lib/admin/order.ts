import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Moves one row a place up (-1) or down (+1) among the rows that share its `scope` (for example the works of one series).
 * The positions that group uses are made strictly increasing first (so two rows can never share one) and then handed out in the new order.
 * Returns true when something moved.
 */
export async function moveRow(
  supabase: SupabaseClient,
  table: "works" | "series" | "record_entries",
  id: string,
  dir: -1 | 1,
  scope?: { column: string; value: string },
): Promise<boolean> {
  let query = supabase.from(table).select("id,position");
  if (scope) query = query.eq(scope.column, scope.value);
  const { data } = await query.order("position").order("id");
  const list = (data ?? []) as { id: string; position: number }[];
  const i = list.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return false;

  const slots: number[] = [];
  list.forEach((r, k) => slots.push(k === 0 ? r.position : Math.max(r.position, slots[k - 1] + 1)));
  const order = list.map((r) => r.id);
  [order[i], order[j]] = [order[j], order[i]];
  const was = new Map(list.map((r) => [r.id, r.position]));
  for (let k = 0; k < order.length; k++) {
    if (was.get(order[k]) !== slots[k]) await supabase.from(table).update({ position: slots[k] }).eq("id", order[k]);
  }
  return true;
}

/** the next free position at the end of a table */
export async function nextPosition(supabase: SupabaseClient, table: "works" | "series" | "record_entries"): Promise<number> {
  const { data } = await supabase.from(table).select("position").order("position", { ascending: false }).limit(1);
  return ((data?.[0] as { position: number } | undefined)?.position ?? 0) + 1;
}
