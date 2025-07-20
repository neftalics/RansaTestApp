-- Sección 1: Creación de Usuarios
-- -------------------------------------------
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
)
SELECT
    (SELECT id FROM auth.instances LIMIT 1),
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    data.email,
    crypt(data.password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    data.raw_user_meta_data::jsonb
FROM (
    VALUES
        ('${ADMIN_EMAIL}', '${ADMIN_PASSWORD}', '{"role": "admin", "email_verified": true}'),
        ('${USER_EMAIL}',  '${USER_PASSWORD}',  '{"role": "user", "email_verified": true}')
) AS data(email, password, raw_user_meta_data)
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = data.email
);


-- Sección 2: Creación de Datos de la Aplicación
-- ---------------------------------------------
INSERT INTO public.aplicacion (
    descripcion, fechacreacion, usuariocreacion
)
SELECT
    v.descripcion,
    now(),
    'seed_script'
FROM (
    VALUES ('Sistema de Ventas'), ('Gestión Académica'), ('Control de Accesos')
) AS v(descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM public.aplicacion a WHERE a.descripcion = v.descripcion
);

INSERT INTO public.perfil (
    idaplicacion, descripcion, fechacreacion, usuariocreacion
)
SELECT
    a.idaplicacion,
    p_vals.descripcion,
    now(),
    'seed_script'
FROM
    public.aplicacion AS a
CROSS JOIN (
    VALUES ('Administrador'), ('Supervisor'), ('Usuario')
) AS p_vals(descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM public.perfil p
    WHERE
        p.idaplicacion = a.idaplicacion
        AND p.descripcion = p_vals.descripcion
);

WITH app_ventas AS (
    SELECT idaplicacion FROM public.aplicacion WHERE descripcion = 'Sistema de Ventas'
)
INSERT INTO public.menu (
    idaplicacion, descripcion, icono, "path", fechacreacion, usuariocreacion
)
SELECT
    idaplicacion,
    m.descripcion,
    m.icono,
    m.path,
    now(),
    'seed_script'
FROM
    app_ventas,
    (VALUES
        ('Inicio', 'home', '/inicio'),
        ('Usuarios', 'users', '/usuarios'),
        ('Reportes', 'bar-chart', '/reportes')
    ) AS m(descripcion, icono, path)
WHERE NOT EXISTS (
    SELECT 1 FROM public.menu mn
    WHERE
        mn.idaplicacion = app_ventas.idaplicacion
        AND mn.descripcion = m.descripcion
);

INSERT INTO public.perfilmenu (
    idmenu, idperfil, idaplicacion, fechacreacion, usuariocreacion
)
SELECT
    m.idmenu,
    p.idperfil,
    m.idaplicacion,
    now(),
    'seed_script'
FROM
    public.menu m
JOIN
    public.perfil p ON p.idaplicacion = m.idaplicacion
WHERE
    p.descripcion = 'Administrador'
    AND m.idaplicacion = (
        SELECT idaplicacion FROM public.aplicacion WHERE descripcion = 'Sistema de Ventas'
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.perfilmenu pm
        WHERE pm.idmenu = m.idmenu AND pm.idperfil = p.idperfil
    );

INSERT INTO public.usuario_perfil(
    user_id, idperfil, fechacreacion, usuariocreacion
)
SELECT
    u.id,
    p.idperfil,
    now(),
    'seed_script'
FROM
    auth.users u,
    public.perfil p
WHERE
    u.email = '${ADMIN_EMAIL}'
    AND p.descripcion = 'Administrador'
    AND p.idaplicacion = (
        SELECT idaplicacion FROM public.aplicacion WHERE descripcion = 'Sistema de Ventas'
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.usuario_perfil up
        WHERE up.user_id = u.id AND up.idperfil = p.idperfil
    );
