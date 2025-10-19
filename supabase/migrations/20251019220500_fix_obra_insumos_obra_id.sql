-- Convert obra_insumos.obra_id to UUID and add FK, if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'obra_insumos'
      AND column_name = 'obra_id'
      AND data_type = 'text'
  ) THEN
    BEGIN
      ALTER TABLE public.obra_insumos
        ALTER COLUMN obra_id TYPE uuid USING NULLIF(obra_id, '')::uuid;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not convert obra_insumos.obra_id to uuid automatically';
    END;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'obra_insumos' AND column_name = 'obra_id'
  ) THEN
    BEGIN
      ALTER TABLE public.obra_insumos
        DROP CONSTRAINT IF EXISTS obra_insumos_obra_id_fkey,
        ADD CONSTRAINT obra_insumos_obra_id_fkey
          FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END
$$;

