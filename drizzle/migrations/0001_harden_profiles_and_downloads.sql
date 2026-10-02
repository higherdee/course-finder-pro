REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, institution, course, department, level, referral_source, study_plan, onboarding_step, updated_at) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.record_material_download(_material_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare p text;
begin
  if auth.uid() is null then raise exception 'Sign in to download'; end if;
  update public.materials set downloads = downloads + 1
    where id = _material_id and status = 'verified' returning file_path into p;
  if p is null then raise exception 'Material not available'; end if;
  return p;
end; $$;
REVOKE ALL ON FUNCTION public.record_material_download(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_material_download(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.set_material_status(uuid, material_status, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_material_status(uuid, material_status, integer, text) TO service_role;