-- ===========================================================================
-- 0009 · Storage buckets and policies (Part 7)
-- Only staff and above may write to public buckets, enforced here (not just UI).
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products', 'products', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('product-videos', 'product-videos', true, 104857600, array['video/mp4','video/webm']),
  ('content', 'content', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('stories', 'stories', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('founder', 'founder', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('submissions', 'submissions', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Public read on the public buckets.
create policy "public read public buckets" on storage.objects for select
  using (bucket_id in ('products','product-videos','content','stories','founder'));

-- Only staff may write/update/delete in public buckets.
create policy "staff write public buckets" on storage.objects for insert
  with check (bucket_id in ('products','product-videos','content','stories','founder') and is_staff());
create policy "staff update public buckets" on storage.objects for update
  using (bucket_id in ('products','product-videos','content','stories','founder') and is_staff());
create policy "staff delete public buckets" on storage.objects for delete
  using (bucket_id in ('products','product-videos','content','stories','founder') and is_admin());

-- Submissions bucket: anyone may upload (public forms), only staff may read.
create policy "anyone upload submissions" on storage.objects for insert
  with check (bucket_id = 'submissions');
create policy "staff read submissions" on storage.objects for select
  using (bucket_id = 'submissions' and is_staff());
