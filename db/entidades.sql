CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.aplicacion (
	idaplicacion uuid DEFAULT uuid_generate_v4() NOT NULL,
	descripcion varchar NULL,
	fechacreacion timestamp NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamp NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT aplicacion_pkey PRIMARY KEY (idaplicacion)
);

CREATE TABLE public.perfil (
	idperfil uuid DEFAULT uuid_generate_v4() NOT NULL,
	idaplicacion uuid NULL,
	descripcion varchar NULL,
	fechacreacion timestamp NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamp NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT perfil_pkey PRIMARY KEY (idperfil),
	CONSTRAINT perfil_idaplicacion_fkey FOREIGN KEY (idaplicacion) REFERENCES public.aplicacion(idaplicacion)
);

CREATE TABLE public.menu (
	idmenu uuid DEFAULT uuid_generate_v4() NOT NULL,
	idaplicacion uuid NULL,
	descripcion varchar NULL,
	menupadre uuid NULL,
	icono varchar NULL,
	"path" varchar NULL,
	fechacreacion timestamp NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamp NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT menu_pkey PRIMARY KEY (idmenu),
	CONSTRAINT menu_idaplicacion_fkey FOREIGN KEY (idaplicacion) REFERENCES public.aplicacion(idaplicacion)
);

CREATE TABLE public.perfilmenu (
	idperfilmenu uuid DEFAULT uuid_generate_v4() NOT NULL,
	idmenu uuid NULL,
	idperfil uuid NULL,
	idaplicacion uuid NULL,
	fechacreacion timestamp NOT NULL,
	usuariocreacion varchar(100) NOT NULL,
	fechaactualizacion timestamp NULL,
	usuarioactualizacion varchar(100) NULL,
	estado bool DEFAULT true NOT NULL,
	CONSTRAINT perfilmenu_pkey PRIMARY KEY (idperfilmenu),
	CONSTRAINT perfilmenu_idaplicacion_fkey FOREIGN KEY (idaplicacion) REFERENCES public.aplicacion(idaplicacion),
	CONSTRAINT perfilmenu_idmenu_fkey FOREIGN KEY (idmenu) REFERENCES public.menu(idmenu),
	CONSTRAINT perfilmenu_idperfil_fkey FOREIGN KEY (idperfil) REFERENCES public.perfil(idperfil)
);
