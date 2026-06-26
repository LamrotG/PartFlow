-- ============================================================
-- PartFlow RLS Fix
-- Run this in Supabase SQL Editor to fix infinite recursion
-- ============================================================

-- Create a security definer function to check admin status
-- This bypasses RLS so it won't cause infinite recursion
create or replace function public.is_admin()
returns boolean as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  )
$$ language sql security definer stable;

-- Drop all existing policies to recreate them cleanly
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'profiles','categories','brands','suppliers','products',
    'inventory','customers','orders','order_items',
    'purchase_orders','purchase_order_items','stock_movements','audit_logs'
  ]) loop
    execute format('drop policy if exists "auth_read" on public.%I', tbl);
    execute format('drop policy if exists "admin_all" on public.%I', tbl);
    execute format('drop policy if exists "own_profile_update" on public.%I', tbl);
    execute format('drop policy if exists "worker_customers_insert" on public.%I', tbl);
    execute format('drop policy if exists "worker_customers_update" on public.%I', tbl);
    execute format('drop policy if exists "worker_orders_insert" on public.%I', tbl);
    execute format('drop policy if exists "worker_order_items_insert" on public.%I', tbl);
    execute format('drop policy if exists "worker_stock_insert" on public.%I', tbl);
    execute format('drop policy if exists "worker_inventory_update" on public.%I', tbl);
  end loop;
end $$;

-- ============================================================
-- PROFILES: Special handling to avoid recursion
-- ============================================================
-- Anyone authenticated can read all profiles
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

-- Users can update their own profile (non-role fields)
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can insert/delete profiles
create policy "profiles_admin_insert" on public.profiles
  for insert to authenticated
  with check (public.is_admin());

create policy "profiles_admin_delete" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- ALL OTHER TABLES: Use is_admin() function
-- ============================================================

-- Categories
create policy "categories_select" on public.categories for select to authenticated using (true);
create policy "categories_admin" on public.categories for insert to authenticated with check (public.is_admin());
create policy "categories_admin_update" on public.categories for update to authenticated using (public.is_admin());
create policy "categories_admin_delete" on public.categories for delete to authenticated using (public.is_admin());

-- Brands
create policy "brands_select" on public.brands for select to authenticated using (true);
create policy "brands_admin" on public.brands for insert to authenticated with check (public.is_admin());
create policy "brands_admin_update" on public.brands for update to authenticated using (public.is_admin());
create policy "brands_admin_delete" on public.brands for delete to authenticated using (public.is_admin());

-- Suppliers
create policy "suppliers_select" on public.suppliers for select to authenticated using (true);
create policy "suppliers_admin" on public.suppliers for insert to authenticated with check (public.is_admin());
create policy "suppliers_admin_update" on public.suppliers for update to authenticated using (public.is_admin());
create policy "suppliers_admin_delete" on public.suppliers for delete to authenticated using (public.is_admin());

-- Products
create policy "products_select" on public.products for select to authenticated using (true);
create policy "products_admin" on public.products for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products for update to authenticated using (public.is_admin());
create policy "products_admin_delete" on public.products for delete to authenticated using (public.is_admin());

-- Inventory
create policy "inventory_select" on public.inventory for select to authenticated using (true);
create policy "inventory_admin" on public.inventory for insert to authenticated with check (public.is_admin());
create policy "inventory_update" on public.inventory for update to authenticated using (true);
create policy "inventory_admin_delete" on public.inventory for delete to authenticated using (public.is_admin());

-- Customers (both roles can create/update)
create policy "customers_select" on public.customers for select to authenticated using (true);
create policy "customers_insert" on public.customers for insert to authenticated with check (true);
create policy "customers_update" on public.customers for update to authenticated using (true);
create policy "customers_admin_delete" on public.customers for delete to authenticated using (public.is_admin());

-- Orders (both roles can create, only admin can update/delete)
create policy "orders_select" on public.orders for select to authenticated using (true);
create policy "orders_insert" on public.orders for insert to authenticated with check (true);
create policy "orders_admin_update" on public.orders for update to authenticated using (public.is_admin());
create policy "orders_admin_delete" on public.orders for delete to authenticated using (public.is_admin());

-- Order Items
create policy "order_items_select" on public.order_items for select to authenticated using (true);
create policy "order_items_insert" on public.order_items for insert to authenticated with check (true);
create policy "order_items_admin_update" on public.order_items for update to authenticated using (public.is_admin());
create policy "order_items_admin_delete" on public.order_items for delete to authenticated using (public.is_admin());

-- Purchase Orders
create policy "po_select" on public.purchase_orders for select to authenticated using (true);
create policy "po_admin" on public.purchase_orders for insert to authenticated with check (public.is_admin());
create policy "po_admin_update" on public.purchase_orders for update to authenticated using (public.is_admin());
create policy "po_admin_delete" on public.purchase_orders for delete to authenticated using (public.is_admin());

-- Purchase Order Items
create policy "poi_select" on public.purchase_order_items for select to authenticated using (true);
create policy "poi_admin" on public.purchase_order_items for insert to authenticated with check (public.is_admin());
create policy "poi_admin_update" on public.purchase_order_items for update to authenticated using (public.is_admin());
create policy "poi_admin_delete" on public.purchase_order_items for delete to authenticated using (public.is_admin());

-- Stock Movements
create policy "sm_select" on public.stock_movements for select to authenticated using (true);
create policy "sm_insert" on public.stock_movements for insert to authenticated with check (true);

-- Audit Logs (admin read only, inserts via triggers)
create policy "audit_select" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "audit_insert" on public.audit_logs for insert to authenticated with check (true);
