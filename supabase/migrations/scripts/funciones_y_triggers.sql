-- Función para auditoría (INSERT y UPDATE)
CREATE OR REPLACE FUNCTION public.fn_aud()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.fechacreacion := now();
        NEW.usuariocreacion := coalesce(auth.email(), 'system');
        NEW.fechaactualizacion := NULL;
        NEW.usuarioactualizacion := NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.fechacreacion := OLD.fechacreacion;
        NEW.usuariocreacion := OLD.usuariocreacion;
        NEW.fechaactualizacion := now();
        NEW.usuarioactualizacion := coalesce(auth.email(), 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para borrado lógico
CREATE OR REPLACE FUNCTION public.fn_borrar_logico()
RETURNS TRIGGER AS $$
DECLARE
    pk_col TEXT;
    pk_val TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME AND column_name = 'estado'
    ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME AND column_name = 'fechaactualizacion'
    ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME AND column_name = 'usuarioactualizacion'
    ) THEN
        RAISE EXCEPTION 'La tabla %.% no tiene las columnas requeridas.', TG_TABLE_SCHEMA, TG_TABLE_NAME;
    END IF;

    SELECT kcu.column_name INTO pk_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = TG_TABLE_SCHEMA AND tc.table_name = TG_TABLE_NAME;

    IF pk_col IS NULL THEN
        RAISE EXCEPTION 'No se encontró clave primaria en %.%', TG_TABLE_SCHEMA, TG_TABLE_NAME;
    END IF;

    EXECUTE format('SELECT ($1).%I::TEXT', pk_col) INTO pk_val USING OLD;

    EXECUTE format(
        'UPDATE %I.%I SET estado = false, fechaactualizacion = now(), usuarioactualizacion = %L WHERE %I = %L',
        TG_TABLE_SCHEMA, TG_TABLE_NAME,
        coalesce(auth.email(), 'system_delete'),
        pk_col, pk_val
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verificar si es admin
CREATE OR REPLACE FUNCTION public.fn_es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (SELECT raw_user_meta_data->>'role' = 'admin' FROM auth.users WHERE id = auth.uid()),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Verificar si el usuario tiene acceso a la app
CREATE OR REPLACE FUNCTION public.fn_acceso_app(id_app uuid)
RETURNS boolean AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.aplicacion WHERE idaplicacion = id_app) THEN
        RAISE EXCEPTION 'App no válida: %', id_app;
    END IF;
    RETURN EXISTS (
        SELECT 1
        FROM public.usuario_perfil up
        JOIN public.perfil p ON up.idperfil = p.idperfil
        WHERE up.user_id = auth.uid() AND p.idaplicacion = id_app
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Obtener menú del usuario según app
CREATE OR REPLACE FUNCTION public.fn_menu_usuario(app_id uuid)
RETURNS TABLE (idmenu uuid, descripcion varchar, menupadre uuid, icono varchar, "path" varchar) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.aplicacion WHERE idaplicacion = app_id) THEN
        RAISE EXCEPTION 'App no válida: %', app_id;
    END IF;

    RETURN QUERY
    SELECT DISTINCT m.idmenu, m.descripcion, m.menupadre, m.icono, m."path"
    FROM public.menu m
    JOIN public.perfilmenu pm ON m.idmenu = pm.idmenu
    JOIN public.usuario_perfil up ON pm.idperfil = up.idperfil
    WHERE up.user_id = auth.uid()
      AND m.idaplicacion = app_id
      AND m.estado = true AND pm.estado = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Permisos de ejecución RPCs
GRANT EXECUTE ON FUNCTION public.fn_acceso_app(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_menu_usuario(uuid) TO authenticated, service_role;

-- Triggers para cada tabla
-- Aplicacion
DROP TRIGGER IF EXISTS tr_aud_app ON public.aplicacion;
CREATE TRIGGER tr_aud_app BEFORE INSERT OR UPDATE ON public.aplicacion FOR EACH ROW EXECUTE FUNCTION public.fn_aud();
DROP TRIGGER IF EXISTS tr_del_app ON public.aplicacion;
CREATE TRIGGER tr_del_app BEFORE DELETE ON public.aplicacion FOR EACH ROW EXECUTE FUNCTION public.fn_borrar_logico();

-- Perfil
DROP TRIGGER IF EXISTS tr_aud_perf ON public.perfil;
CREATE TRIGGER tr_aud_perf BEFORE INSERT OR UPDATE ON public.perfil FOR EACH ROW EXECUTE FUNCTION public.fn_aud();
DROP TRIGGER IF EXISTS tr_del_perf ON public.perfil;
CREATE TRIGGER tr_del_perf BEFORE DELETE ON public.perfil FOR EACH ROW EXECUTE FUNCTION public.fn_borrar_logico();

-- Menu
DROP TRIGGER IF EXISTS tr_aud_menu ON public.menu;
CREATE TRIGGER tr_aud_menu BEFORE INSERT OR UPDATE ON public.menu FOR EACH ROW EXECUTE FUNCTION public.fn_aud();
DROP TRIGGER IF EXISTS tr_del_menu ON public.menu;
CREATE TRIGGER tr_del_menu BEFORE DELETE ON public.menu FOR EACH ROW EXECUTE FUNCTION public.fn_borrar_logico();

-- PerfilMenu
DROP TRIGGER IF EXISTS tr_aud_pfm ON public.perfilmenu;
CREATE TRIGGER tr_aud_pfm BEFORE INSERT OR UPDATE ON public.perfilmenu FOR EACH ROW EXECUTE FUNCTION public.fn_aud();
DROP TRIGGER IF EXISTS tr_del_pfm ON public.perfilmenu;
CREATE TRIGGER tr_del_pfm BEFORE DELETE ON public.perfilmenu FOR EACH ROW EXECUTE FUNCTION public.fn_borrar_logico();

-- Usuario_Perfil
DROP TRIGGER IF EXISTS tr_aud_usrpf ON public.usuario_perfil;
CREATE TRIGGER tr_aud_usrpf BEFORE INSERT OR UPDATE ON public.usuario_perfil FOR EACH ROW EXECUTE FUNCTION public.fn_aud();
DROP TRIGGER IF EXISTS tr_del_usrpf ON public.usuario_perfil;
CREATE TRIGGER tr_del_usrpf BEFORE DELETE ON public.usuario_perfil FOR EACH ROW EXECUTE FUNCTION public.fn_borrar_logico();
