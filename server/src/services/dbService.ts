import { supabase } from '../config/supabase.js';

/**
 * Generic DB service wrapping Supabase client.
 * All functions return { data, error } where `data` is the result (or null) and `error` is any Supabase error.
 */
export const dbService = {
  /** Find a single record by primary key or filters */
  async findOne(table: string, filters: Record<string, any>) {
    let query = supabase.from(table).select('*');
    for (const [col, val] of Object.entries(filters)) {
      query = query.eq(col, val);
    }
    const { data, error } = await query.maybeSingle();
    return { data, error };
  },

  /** Find many records with optional filters, ordering, pagination */
  async findMany(table: string, options: {
    filters?: Record<string, any>,
    orderBy?: string,
    descending?: boolean,
    limit?: number,
    offset?: number
  } = {}) {
    let query = supabase.from(table).select('*');
    const { filters, orderBy, descending, limit, offset } = options;
    if (filters) {
      for (const [col, val] of Object.entries(filters)) {
        query = query.eq(col, val);
      }
    }
    if (orderBy) query = query.order(orderBy, { ascending: !descending });
    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit ?? 100) - 1);
    const { data, error } = await query;
    return { data, error };
  },

  /** Insert a new record */
  async create(table: string, payload: Record<string, any>) {
    const { data, error } = await supabase.from(table).insert([payload]).single();
    return { data, error };
  },

  /** Update existing record(s) */
  async update(table: string, filters: Record<string, any>, payload: Record<string, any>) {
    let query = supabase.from(table);
    for (const [col, val] of Object.entries(filters)) {
      query = query.eq(col, val);
    }
    const { data, error } = await query.update(payload).select();
    return { data, error };
  },

  /** Delete record(s) */
  async delete(table: string, filters: Record<string, any>) {
    let query = supabase.from(table);
    for (const [col, val] of Object.entries(filters)) {
      query = query.eq(col, val);
    }
    const { data, error } = await query.delete().select();
    return { data, error };
  }
};
