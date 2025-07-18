-- Aplicaciones
INSERT INTO public.aplicacion (
    idaplicacion, descripcion, fechacreacion, usuariocreacion, estado
)
VALUES
(gen_random_uuid(), 'Sistema de Ventas', now(), 'admin', true),
(gen_random_uuid(), 'Gestión Académica', now(), 'admin', true),
(gen_random_uuid(), 'Control de Accesos', now(), 'admin', true);

-- Perfiles
INSERT INTO public.perfil (
    idperfil, idaplicacion, descripcion, fechacreacion, usuariocreacion, estado
)
SELECT gen_random_uuid(), a.idaplicacion, p.descripcion, now(), 'admin', true
FROM (
    VALUES
    ('Administrador'),
    ('Supervisor'),
    ('Usuario')
) AS p(descripcion)
JOIN (
    SELECT idaplicacion FROM public.aplicacion ORDER BY descripcion LIMIT 3
) AS a ON true;

-- Menús
WITH app AS (
    SELECT idaplicacion FROM public.aplicacion ORDER BY descripcion LIMIT 1
)
INSERT INTO public.menu (
    idmenu, idaplicacion, descripcion, menupadre, icono, "path", fechacreacion, usuariocreacion, estado
)
SELECT
    gen_random_uuid(), app.idaplicacion, m.descripcion, NULL, m.icono, m.path, now(), 'admin', true
FROM (
    VALUES
    ('Inicio', 'home', '/inicio'),
    ('Usuarios', 'users', '/usuarios'),
    ('Reportes', 'bar-chart', '/reportes')
) AS m(descripcion, icono, path), app;

-- PerfilMenu
INSERT INTO public.perfilmenu (
    idperfilmenu, idmenu, idperfil, idaplicacion, fechacreacion, usuariocreacion, estado
)
SELECT
    gen_random_uuid(), m.idmenu, p.idperfil, m.idaplicacion, now(), 'admin', true
FROM public.menu m
JOIN public.perfil p ON p.idaplicacion = m.idaplicacion
LIMIT 5;
