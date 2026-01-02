-- Create exec_sql function for executing raw SQL via RPC
-- This function allows DDL operations through Supabase API

CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Execute the SQL query
  EXECUTE sql_query;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'SQL executed successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.exec_sql(text) IS
'Executes raw SQL queries. SECURITY DEFINER - runs with creator privileges. Use with caution.';
