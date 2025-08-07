-- This script creates a security-hardened function for users to delete their own accounts.

-- Enable Row-Level Security (RLS) on the profiles table if not already enabled.
-- This ensures that even with the function, data access rules are still respected.
alter table public.profiles enable row level security;

-- Create a policy that allows users to see their own profile.
-- This is a good practice to have, even if not directly used by the delete function.
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Create a policy that allows users to delete their own profile.
-- The delete operation will be initiated by the function below.
create policy "Users can delete their own profile"
  on public.profiles for delete
  using ( auth.uid() = id );

-- Create the function that will be called from the frontend (via RPC).
-- This function runs with the permissions of the user who defined it (the 'postgres' user),
-- which is necessary to delete a user from the 'auth.users' table.
-- The function is secure because it can only delete the currently authenticated user (auth.uid()).
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete the user's profile first. 
  -- RLS policy ensures a user can only delete their own profile.
  delete from public.profiles where id = auth.uid();
  
  -- By deleting the user from auth.users, Supabase's built-in triggers
  -- will cascade the delete to any remaining related data in storage, etc.
  -- This is the final and irreversible step.
  delete from auth.users where id = auth.uid();
end;
$$;
