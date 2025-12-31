-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- HABITS
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table habits enable row level security;

create policy "Users can view own habits."
  on habits for select
  using ( auth.uid() = user_id );

create policy "Users can insert own habits."
  on habits for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own habits."
  on habits for update
  using ( auth.uid() = user_id );

create policy "Users can delete own habits."
  on habits for delete
  using ( auth.uid() = user_id );

-- HABIT LOGS
create table habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users not null, -- Denormalized for easier RLS and joins
  date date not null,
  completed boolean default true,
  
  unique(habit_id, date)
);

alter table habit_logs enable row level security;

create policy "Users can view own logs."
  on habit_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own logs."
  on habit_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own logs."
  on habit_logs for update
  using ( auth.uid() = user_id );

create policy "Users can delete own logs."
  on habit_logs for delete
  using ( auth.uid() = user_id );

-- DAILY SUMMARIES VIEW (Leaderboard)
-- Aggregates scores for each user/date.
create or replace view daily_summaries as
select 
  h.user_id,
  p.username,
  p.avatar_url,
  l.date,
  count(distinct l.habit_id) as completed_count,
  (select count(*) from habits where user_id = h.user_id) as total_habits,
  case 
    when (select count(*) from habits where user_id = h.user_id) = 0 then 0
    else round(
      (count(distinct l.habit_id)::decimal / (select count(*) from habits where user_id = h.user_id)) * 100
    ) 
  end as score
from habit_logs l
join habits h on l.habit_id = h.id
left join profiles p on h.user_id = p.id
where l.completed = true
group by h.user_id, p.username, p.avatar_url, l.date;

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
