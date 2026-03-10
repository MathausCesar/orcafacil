-- Add missing UPDATE policy
create policy "Users can update items of own quotes." on quote_items
  for update using (
    exists ( select 1 from quotes where id = quote_items.quote_id and user_id = auth.uid() )
  );

-- Add missing DELETE policy
create policy "Users can delete items of own quotes." on quote_items
  for delete using (
    exists ( select 1 from quotes where id = quote_items.quote_id and user_id = auth.uid() )
  );
