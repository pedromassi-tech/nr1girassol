create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  cover_image text,
  category text,
  published_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.blog_posts enable row level security;

create policy "Permitir leitura pública de posts"
  on public.blog_posts for select
  using (true);

create policy "Permitir inserção para admins"
  on public.blog_posts for insert
  with check (true); -- In a real scenario, we would check auth.role() or a specific admin flag

create policy "Permitir atualização para admins"
  on public.blog_posts for update
  using (true);

create policy "Permitir deleção para admins"
  on public.blog_posts for delete
  using (true);
