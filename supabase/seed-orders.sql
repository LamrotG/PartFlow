-- ============================================================
-- PartFlow Sample Orders
-- Run this AFTER creating at least one user account.
-- It will use the first profile found as the employee.
-- ============================================================

do $$
declare
  emp_id uuid;
  order_id uuid;
  cust_ids uuid[] := array[
    'e1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000004',
    'e1000000-0000-0000-0000-000000000005',
    'e1000000-0000-0000-0000-000000000006',
    'e1000000-0000-0000-0000-000000000007',
    'e1000000-0000-0000-0000-000000000008',
    'e1000000-0000-0000-0000-000000000009',
    'e1000000-0000-0000-0000-000000000010'
  ];
  prod_ids uuid[] := array[
    'd1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000005',
    'd1000000-0000-0000-0000-000000000008',
    'd1000000-0000-0000-0000-000000000010',
    'd1000000-0000-0000-0000-000000000012',
    'd1000000-0000-0000-0000-000000000014',
    'd1000000-0000-0000-0000-000000000017',
    'd1000000-0000-0000-0000-000000000020',
    'd1000000-0000-0000-0000-000000000022',
    'd1000000-0000-0000-0000-000000000025',
    'd1000000-0000-0000-0000-000000000029'
  ];
  prod_prices numeric[] := array[15.50, 22.00, 65.00, 85.00, 95.00, 185.00, 125.00, 36.00, 78.00, 45.00, 12.50, 120.00, 28.00];
  methods text[] := array['cash', 'check', 'bank_transfer', 'credit'];

  i integer;
  j integer;
  item_count integer;
  total numeric;
  paid numeric;
  p_status text;
  p_method text;
  order_date timestamptz;
  qty integer;
  prod_idx integer;

  -- arrays to accumulate items per order before inserting
  item_prod_ids uuid[];
  item_qtys integer[];
  item_prices numeric[];
begin
  select id into emp_id from public.profiles limit 1;

  if emp_id is null then
    raise notice 'No profiles found. Create a user first, then run this script.';
    return;
  end if;

  for i in 1..50 loop
    order_id := uuid_generate_v4();
    order_date := now() - (random() * 60)::integer * interval '1 day'
                       - (random() * 12)::integer * interval '1 hour';
    item_count := 1 + (random() * 3)::integer;

    -- Step 1: Build items in memory
    item_prod_ids := '{}';
    item_qtys    := '{}';
    item_prices  := '{}';
    total := 0;

    for j in 1..item_count loop
      prod_idx := 1 + (random() * (array_length(prod_ids, 1) - 1))::integer;
      qty := 1 + (random() * 4)::integer;

      item_prod_ids := array_append(item_prod_ids, prod_ids[prod_idx]);
      item_qtys     := array_append(item_qtys, qty);
      item_prices   := array_append(item_prices, prod_prices[prod_idx]);

      total := total + prod_prices[prod_idx] * qty;
    end loop;

    -- Step 2: Determine payment
    if random() < 0.55 then
      p_status := 'paid';  paid := total;
    elsif random() < 0.75 then
      p_status := 'partial';  paid := round((total * (0.3 + random() * 0.4))::numeric, 2);
    else
      p_status := 'unpaid';  paid := 0;
    end if;

    p_method := methods[1 + (random() * 3)::integer];

    -- Step 3: Insert the parent order FIRST
    insert into public.orders (id, customer_id, employee_id, total_amount, paid_amount, payment_status, payment_method, created_at)
    values (order_id, cust_ids[1 + (random() * 9)::integer], emp_id, total, paid, p_status, p_method, order_date);

    -- Step 4: Insert all order items AFTER the parent exists
    for j in 1..array_length(item_prod_ids, 1) loop
      insert into public.order_items (order_id, product_id, quantity, unit_price)
      values (order_id, item_prod_ids[j], item_qtys[j], item_prices[j]);
    end loop;
  end loop;

  raise notice 'Created 50 sample orders for employee %', emp_id;
end $$;
