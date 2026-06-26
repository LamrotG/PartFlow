-- ============================================================
-- PartFlow Database Schema
-- Run this in your Supabase SQL Editor (Settings > SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text not null,
  phone       text,
  role        text not null default 'employee' check (role in ('admin', 'employee')),
  department  text,
  is_active   boolean not null default true,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 3. BRANDS
-- ============================================================
create table public.brands (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 4. SUPPLIERS
-- ============================================================
create table public.suppliers (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  contact_person  text,
  email           text,
  phone           text,
  address         text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- 5. PRODUCTS
-- ============================================================
create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  sku           text not null unique,
  name          text not null,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  brand_id      uuid references public.brands(id) on delete set null,
  unit_price    numeric(12,2) not null check (unit_price >= 0),
  cost_price    numeric(12,2) check (cost_price >= 0),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_products_category on public.products(category_id);
create index idx_products_brand on public.products(brand_id);

-- ============================================================
-- 6. INVENTORY
-- ============================================================
create table public.inventory (
  id                uuid primary key default uuid_generate_v4(),
  product_id        uuid not null unique references public.products(id) on delete cascade,
  quantity_on_hand  integer not null default 0 check (quantity_on_hand >= 0),
  reorder_level     integer not null default 10,
  reorder_quantity  integer not null default 50,
  last_restocked_at timestamptz,
  updated_at        timestamptz not null default now()
);

create index idx_inventory_product on public.inventory(product_id);

-- ============================================================
-- 7. CUSTOMERS
-- ============================================================
create table public.customers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  phone       text,
  email       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 8. ORDERS (sales)
-- ============================================================
create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  order_number     text not null unique,
  customer_id      uuid references public.customers(id) on delete set null,
  employee_id      uuid not null references public.profiles(id),
  total_amount     numeric(12,2) not null default 0,
  paid_amount      numeric(12,2) not null default 0 check (paid_amount >= 0),
  remaining_amount numeric(12,2) generated always as (total_amount - paid_amount) stored,
  payment_status   text not null default 'unpaid' check (payment_status in ('paid', 'partial', 'unpaid')),
  payment_method   text not null default 'cash' check (payment_method in ('cash', 'check', 'bank_transfer', 'credit')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_orders_customer on public.orders(customer_id);
create index idx_orders_employee on public.orders(employee_id);
create index idx_orders_date on public.orders(created_at desc);
create index idx_orders_status on public.orders(payment_status);

-- Auto-generate order numbers
create or replace function public.generate_order_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(order_number from 5) as integer)), 0) + 1
    into next_num
    from public.orders;
  new.order_number := 'SAL-' || lpad(next_num::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_order_number
  before insert on public.orders
  for each row
  when (new.order_number is null or new.order_number = '')
  execute function public.generate_order_number();

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(12,2) not null check (unit_price >= 0),
  line_total  numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at  timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_product on public.order_items(product_id);

-- ============================================================
-- 10. PURCHASE ORDERS
-- ============================================================
create table public.purchase_orders (
  id                      uuid primary key default uuid_generate_v4(),
  po_number               text not null unique,
  supplier_id             uuid not null references public.suppliers(id),
  ordered_by              uuid not null references public.profiles(id),
  status                  text not null default 'draft' check (status in ('draft', 'submitted', 'received', 'cancelled')),
  total_amount            numeric(12,2) not null default 0,
  expected_delivery_date  date,
  received_at             timestamptz,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_po_supplier on public.purchase_orders(supplier_id);

-- Auto-generate PO numbers
create or replace function public.generate_po_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(po_number from 4) as integer)), 0) + 1
    into next_num
    from public.purchase_orders;
  new.po_number := 'PO-' || lpad(next_num::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_po_number
  before insert on public.purchase_orders
  for each row
  when (new.po_number is null or new.po_number = '')
  execute function public.generate_po_number();

-- ============================================================
-- 11. PURCHASE ORDER ITEMS
-- ============================================================
create table public.purchase_order_items (
  id                  uuid primary key default uuid_generate_v4(),
  purchase_order_id   uuid not null references public.purchase_orders(id) on delete cascade,
  product_id          uuid not null references public.products(id),
  quantity_ordered    integer not null check (quantity_ordered > 0),
  quantity_received   integer not null default 0,
  unit_cost           numeric(12,2) not null check (unit_cost >= 0),
  line_total          numeric(12,2) generated always as (quantity_ordered * unit_cost) stored,
  created_at          timestamptz not null default now()
);

create index idx_poi_po on public.purchase_order_items(purchase_order_id);

-- ============================================================
-- 12. STOCK MOVEMENTS (audit trail for inventory)
-- ============================================================
create table public.stock_movements (
  id                  uuid primary key default uuid_generate_v4(),
  product_id          uuid not null references public.products(id),
  order_id            uuid references public.orders(id) on delete set null,
  purchase_order_id   uuid references public.purchase_orders(id) on delete set null,
  type                text not null check (type in ('sale', 'purchase', 'adjustment', 'return')),
  quantity            integer not null,
  note                text,
  created_by          uuid references public.profiles(id),
  created_at          timestamptz not null default now()
);

create index idx_sm_product on public.stock_movements(product_id);
create index idx_sm_date on public.stock_movements(created_at desc);

-- ============================================================
-- 13. AUDIT LOGS
-- ============================================================
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  action      text not null check (action in ('create', 'update', 'delete')),
  table_name  text not null,
  record_id   uuid not null,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_date on public.audit_logs(created_at desc);
create index idx_audit_table on public.audit_logs(table_name);

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.categories for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.brands for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.suppliers for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.products for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.inventory for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.customers for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.orders for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.purchase_orders for each row execute function public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.audit_logs enable row level security;

-- All authenticated users can read everything
create policy "auth_read" on public.profiles for select to authenticated using (true);
create policy "auth_read" on public.categories for select to authenticated using (true);
create policy "auth_read" on public.brands for select to authenticated using (true);
create policy "auth_read" on public.suppliers for select to authenticated using (true);
create policy "auth_read" on public.products for select to authenticated using (true);
create policy "auth_read" on public.inventory for select to authenticated using (true);
create policy "auth_read" on public.customers for select to authenticated using (true);
create policy "auth_read" on public.orders for select to authenticated using (true);
create policy "auth_read" on public.order_items for select to authenticated using (true);
create policy "auth_read" on public.purchase_orders for select to authenticated using (true);
create policy "auth_read" on public.purchase_order_items for select to authenticated using (true);
create policy "auth_read" on public.stock_movements for select to authenticated using (true);
create policy "auth_read" on public.audit_logs for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Users can update their own profile
create policy "own_profile_update" on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admin full access (insert, update, delete) on all tables
create policy "admin_all" on public.profiles for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.categories for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.brands for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.suppliers for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.products for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.inventory for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.customers for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.orders for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.order_items for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.purchase_orders for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.purchase_order_items for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.stock_movements for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admin_all" on public.audit_logs for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Workers can create/update customers
create policy "worker_customers_insert" on public.customers for insert to authenticated with check (true);
create policy "worker_customers_update" on public.customers for update to authenticated using (true);

-- Workers can create orders and order items
create policy "worker_orders_insert" on public.orders for insert to authenticated
  with check (employee_id = auth.uid());
create policy "worker_order_items_insert" on public.order_items for insert to authenticated
  with check (true);

-- Workers can insert stock movements
create policy "worker_stock_insert" on public.stock_movements for insert to authenticated
  with check (true);

-- Workers can update inventory
create policy "worker_inventory_update" on public.inventory for update to authenticated
  using (true);
