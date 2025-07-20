CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.aplicacion (
	idaplicacion uuid DEFAULT uuid_generate_v4() NOT NULL,
	descripcion varchar NULL,
	fechacreacion timestamptz NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamptz NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT aplicacion_pkey PRIMARY KEY (idaplicacion)
);

CREATE TABLE public.perfil (
	idperfil uuid DEFAULT uuid_generate_v4() NOT NULL,
	idaplicacion uuid NULL,
	descripcion varchar NULL,
	fechacreacion timestamptz NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamptz NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT perfil_pkey PRIMARY KEY (idperfil),
	CONSTRAINT perfil_idaplicacion_fkey 
		FOREIGN KEY (idaplicacion) 
		REFERENCES public.aplicacion(idaplicacion) 
		ON DELETE CASCADE
);

CREATE TABLE public.menu (
	idmenu uuid DEFAULT uuid_generate_v4() NOT NULL,
	idaplicacion uuid NULL,
	descripcion varchar NULL,
	menupadre uuid NULL,
	icono varchar NULL,
	"path" varchar NULL,
	fechacreacion timestamptz NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamptz NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT menu_pkey PRIMARY KEY (idmenu),
	CONSTRAINT menu_idaplicacion_fkey 
		FOREIGN KEY (idaplicacion) 
		REFERENCES public.aplicacion(idaplicacion) 
		ON DELETE CASCADE,
	CONSTRAINT menu_menupadre_fkey 
		FOREIGN KEY (menupadre) 
		REFERENCES public.menu(idmenu) 
		ON DELETE CASCADE
);

CREATE TABLE public.perfilmenu (
	idperfilmenu uuid DEFAULT uuid_generate_v4() NOT NULL,
	idmenu uuid NULL,
	idperfil uuid NULL,
	idaplicacion uuid NULL,
	fechacreacion timestamptz NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamptz NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT perfilmenu_pkey PRIMARY KEY (idperfilmenu),
	CONSTRAINT perfilmenu_idmenu_fkey 
		FOREIGN KEY (idmenu) 
		REFERENCES public.menu(idmenu) 
		ON DELETE CASCADE,
	CONSTRAINT perfilmenu_idperfil_fkey 
		FOREIGN KEY (idperfil) 
		REFERENCES public.perfil(idperfil) 
		ON DELETE CASCADE,
	CONSTRAINT perfilmenu_idaplicacion_fkey 
		FOREIGN KEY (idaplicacion) 
		REFERENCES public.aplicacion(idaplicacion) 
		ON DELETE CASCADE
);

-- Tabla añadida para conectar usuarios de Supabase
CREATE TABLE public.usuario_perfil (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NULL,
    idperfil uuid NULL,
    fechacreacion timestamptz NOT NULL,
    usuariocreacion varchar(100) NOT NULL,
    fechaactualizacion timestamptz NULL,
    usuarioactualizacion varchar(100) NULL,
    CONSTRAINT usuario_perfil_pkey PRIMARY KEY (id),
    CONSTRAINT usuario_perfil_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    CONSTRAINT usuario_perfil_idperfil_fkey 
        FOREIGN KEY (idperfil) 
        REFERENCES public.perfil(idperfil) 
        ON DELETE CASCADE
);
