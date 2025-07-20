
 --RLS en las tablas

ALTER TABLE public.aplicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfilmenu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_perfil ENABLE ROW LEVEL SECURITY;

--Políticas de Seguridad
--'aplicacion'
DROP POLICY IF EXISTS pol_app_admin_total ON public.aplicacion;
CREATE POLICY pol_app_admin_total ON public.aplicacion FOR ALL
    USING (public.fn_es_admin()) WITH CHECK (public.fn_es_admin());

DROP POLICY IF EXISTS pol_app_lectura_asignada ON public.aplicacion;
CREATE POLICY pol_app_lectura_asignada ON public.aplicacion FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.usuario_perfil up
        JOIN public.perfil p ON up.idperfil = p.idperfil
        WHERE up.user_id = auth.uid() AND p.idaplicacion = aplicacion.idaplicacion
    ));

-- 'perfil'
DROP POLICY IF EXISTS pol_perfil_admin_total ON public.perfil;
CREATE POLICY pol_perfil_admin_total ON public.perfil FOR ALL
    USING (public.fn_es_admin()) WITH CHECK (public.fn_es_admin());

-- 'menu'
DROP POLICY IF EXISTS pol_menu_admin_total ON public.menu;
CREATE POLICY pol_menu_admin_total ON public.menu FOR ALL
    USING (public.fn_es_admin()) WITH CHECK (public.fn_es_admin());

DROP POLICY IF EXISTS pol_menu_lectura_asignada ON public.menu;
CREATE POLICY pol_menu_lectura_asignada ON public.menu FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.usuario_perfil up
        JOIN public.perfilmenu pm ON up.idperfil = pm.idperfil
        WHERE up.user_id = auth.uid() AND pm.idmenu = menu.idmenu
    ));

-- 'perfilmenu'
DROP POLICY IF EXISTS pol_perfilmenu_admin_total ON public.perfilmenu;
CREATE POLICY pol_perfilmenu_admin_total ON public.perfilmenu FOR ALL
    USING (public.fn_es_admin()) WITH CHECK (public.fn_es_admin());

-- 'usuario_perfil'
DROP POLICY IF EXISTS pol_usuarioperfil_admin_total ON public.usuario_perfil;
CREATE POLICY pol_usuarioperfil_admin_total ON public.usuario_perfil FOR ALL
    USING (public.fn_es_admin()) WITH CHECK (public.fn_es_admin());

DROP POLICY IF EXISTS pol_usuarioperfil_gestion_propia ON public.usuario_perfil;
CREATE POLICY pol_usuarioperfil_gestion_propia ON public.usuario_perfil FOR ALL
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
