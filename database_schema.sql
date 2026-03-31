-- Supabase / PostgreSQL Arispace Database Blueprint

-- 1. Crear tabla genérica 'projects' para prototipo (single-user / user genérico)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  concept_text TEXT,
  quick_notes TEXT,
  image_urls TEXT[],
  color_palettes TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Configurar una política sencilla por defecto (Recomendado para testing anon o authenticated)
-- Si vas a tener multi-usuarios reales, requiere RLS (Row Level Security) más complejo con auth.uid().
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for all users" ON public.projects
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Trigger opcional para "updated_at" dinámico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
