# RansaTestApp
Este proyecto es una aplicación web fullstack que implementa control de acceso basado en perfiles y menús para múltiples aplicaciones. Está construida con Angular 19 (frontend), NestJS 10 con Sequelize (backend) y PostgreSQL 16+ usando Supabase como proveedor de base de datos.

**Frontend:** [https://ransatestapp-1.onrender.com](https://ransatestapp-1.onrender.com)
**Backend (API REST):** [https://ransatestapp.onrender.com](https://ransatestapp.onrender.com)

> Proyecto fullstack desarrollado en \~25 horas. Objetivo: un sistema de control de acceso (apps, menús, perfiles/roles) con autenticación segura y despliegue reproducible.

---

## 📌 TL;DR

* **Auth & DB:** Supabase (GoTrue + Postgres) para login/JWT y persistencia.
* **API:** NestJS 11 + Sequelize como capa de negocio/orquestación.
* **UI:** Angular 19 (SPA) + Angular Material.
* **Infra local:** Docker Compose (supabase-db, supabase-auth, backend, frontend).
* **CI:** GitHub Actions que valida `docker-compose up --build`.
* **Prod:** Render – Front como *Static/Web App*, Back como *Web Service*.

---

## 🧱 Arquitectura & Decisiones Técnicas

```text
         +-------------------+
         |       Usuario     |
         +---------+---------+
                   |
                   v
        +----------+-----------+
        |  Angular SPA (MUI)   |
        |   - Material UI      |
        |   - Signals/Standalone|
        +----------+-----------+
                   |
                   v
        +----------+-----------+
        |  NestJS API (REST)   |
        |  - Sequelize ORM     |
        |  - JWT guard/roles   |
        |  - Health checks     |
        +----------+-----------+
                   |
                   v
 +-----------------+-------------------+
 | Supabase Stack (Auth + Postgres)    |
 | - GoTrue (JWT)  - SQL migrations    |
 | - RLS policies  - SP/Functions      |
 +-------------------------------------+
```

### ¿Por qué un **ERD** explícito?

* El dominio incluye relaciones **muchos-a-muchos** (usuarios–perfiles, perfiles–menús, etc.).
* Un ER bien definido acelera la creación de migraciones y el seed inicial.
* Facilita políticas RLS (Row Level Security) en Supabase.

### ¿Por qué **SP/SQL + API REST** y no MVC?

* La lógica crítica (seed, sync, health checks) vive cerca de la DB para atomicidad y performance.
* La API Nest expone la lógica como servicios RESTful, limpia y escalable.
* MVC clásico no aporta en una API sin vistas del servidor; preferí una arquitectura **service/controller** con **DTOs**.

### NestJS + Sequelize como **middleware**

* NestJS aporta inyección de dependencias, guards, interceptors y organización modular.
* Sequelize es maduro con Postgres, permite tipado TS y migrations controladas.

### Angular SPA + Material

* Material UI = componentes accesibles y válidos out-of-the-box.
* Angular 19 Standalone Components y Signals simplifican la gestión de estado sin NgModules pesados.
* SPA garantiza UX fluida y rol-based rendering de menús.

### Supabase para Auth

* GoTrue emite JWT; el front inicia sesión directo contra Supabase o vía backend.
* El backend valida/propaga el token (JWT\_SECRET compartido) y enriquece el usuario con metadatos/roles.

---

## 🔒 Seguridad y Control de Acceso por Capas

**Capa Frontend (Angular):** Renderizado condicional por rol, guards de ruta y limpieza de tokens en memoria/localStorage.
**Capa API (NestJS):** Guards JWT + RoleGuard, DTOs con validación, rate limiting opcional y sanitización de inputs.
**Capa DB (Supabase/Postgres):** RLS (Row Level Security), políticas por perfil, vistas controladas y funciones seguras.
**JWT Claims:** `role` y `aud` en el payload; rotación de claves y expiraciones cortas recomendadas.

## 🌐 Networking / VPC

* Segmentar servicios en una VPC o red privada (p. ej. Render Private Services o Azure VNet).
* Exponer solo el frontend públicamente; API detrás de un WAF/Reverse Proxy.
* DB accesible únicamente vía red interna (privatelink/peering), sin puertos abiertos a Internet.
* Enrutamiento Zero-Trust entre microservicios (mTLS / Service Mesh si se escala a múltiples servicios).

## 📈 Escalabilidad & Performance

* **Horizontabilidad:** Backend stateless para autoscaling horizontal. Usar un pooler (pgBouncer) para Postgres.
* **Caching:** Redis/Upstash para menús y perfiles; CDN para estáticos del SPA.
* **Queue/Worker:** Para tareas pesadas (envíos masivos, sincronizaciones). Ej: BullMQ en Nest.
* **CDN & Edge:** Servir el SPA vía CDN; invalida caché en cada release.

## 🛡️ Resiliencia: Retries, Backoff & Circuit Breakers

* **Exponential Backoff + Jitter** al reintentar llamadas a Supabase/DB.
* **Circuit Breaker** (p. ej. `opossum` o propio interceptor Nest) para aislar fallas.
* **Health/Liveness/Readiness probes** ya implementadas; añadir métricas de latencia y errores.
* **Timeouts** claros en HTTP y queries SQL.

## 📊 Observabilidad

* **Logs estructurados** (pino/winston) + correlación de request-id.
* **Tracing distribuido** con OpenTelemetry (Nest + Angular opcional) enviando a Jaeger/Tempo.
* **Métricas** (Prometheus) y dashboards (Grafana) para qps, p95 latency, errores.
* **Alerting** (PagerDuty/Slack) sobre umbrales críticos.

## 🧪 CI/CD – GitHub Actions

### 1. **Validar Docker Compose** (`.github/workflows/validate-compose.yml`)

* Levanta todos los servicios con los secretos del repo.
* Hace `curl` al backend (`:3000`) y frontend (`:4200`).
* Falla si algún contenedor sale con estado `exited`.

### 2. (Opcional) Test de migraciones Supabase

* Ejecutar `supabase start`, `supabase db reset --no-seed`, y luego aplicar seed con `envsubst + psql` para garantizar reproducibilidad.

*(Puedes añadir jobs de deploy automático a Render o Azure Container Apps si lo deseas.)*

---

## 🔧 Entorno local

Los detalles operativos de Docker, Dockerfiles y `docker-compose` están en el repositorio y se omiten aquí para mantener el foco técnico. El entorno puede reproducirse 1:1 con las instrucciones de esa carpeta.

---

## 🧭 Roadmap / TODOs (Avanzado)

### Seguridad & Compliance

* [ ] Rotación automática de claves JWT y almacenamiento en KMS/Vault.
* [ ] Auditoría completa (quién cambió qué perfil/menú) y logs firmados.
* [ ] Implementar SSO/OAuth2/OIDC corporativo.

### Infra/Networking

* [ ] Migrar a red privada (VPC/VNet) y cerrar puertos públicos de DB.
* [ ] WAF + rate limiting global.
* [ ] Configurar CDN + cache policies para el SPA.

### Escalabilidad & Rendimiento

* [ ] Pooler de conexiones a Postgres (pgBouncer) + tuning de Sequelize.
* [ ] Cachear respuestas de menús/perfiles.
* [ ] Offload de tareas pesadas a colas y workers (BullMQ/Redis).

### Resiliencia

* [ ] Interceptors con retry/backoff exponencial y circuit breaker en Nest.
* [ ] Fallback UI/UX en el frontend cuando el backend esté degradado.

### DevEx & Calidad

* [ ] Tests unitarios y e2e automáticos (Jest + Playwright/Cypress) en CI.
* [ ] Lint/format estrictos y convención de commits (Commitlint/Conventional Commits).
* [ ] Documentación OpenAPI/Swagger publicada y sincronizada.

### Observabilidad

* [ ] OpenTelemetry + Jaeger/Tempo + Grafana.
* [ ] SLOs/SLIs definidos (latencia, error budget) y alertas automáticas.

---

## 📚 Lecciones Aprendidas

* **Tailwind + Node 22**: problemas de compatibilidad (CLI/engines). Angular Material fue más estable para el timebox.
* **Supabase + Front-only**: para el alcance, pudo bastar; el backend agrega robustez pero aumenta complejidad.
* **Docker desde el inicio** ahorra fricciones al desplegar en Render/Azure.
* **Signals en Angular 19** simplifican el estado sin NgRx.

---

## ⏱️ Cronograma (25 h aprox.)

1. **BD & ERD** – 2h
2. **Supabase (migraciones, seed, RLS)** – 3h
3. **Backend NestJS (endpoints, guards, health)** – 7h
4. **Tests manuales (Postman/Insomnia)** – 2h
5. **Frontend SPA (pantallas básicas, guards, servicios)** – 5h
6. **Integración fullstack y debugging** – 2h
7. **Deploy en Render (front/back)** – 2h
8. **Docker & GitHub Actions** – 2h

---

## 📄 Licencia

MIT – Uso libre para evaluación y aprendizaje.

---


