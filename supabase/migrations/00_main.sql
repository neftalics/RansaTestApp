-- =================================================================
-- Orquestador de la inicializacion de la base de datos.
-- Este archivo se ejecuta primero debido a su prefijo '00'.
-- =================================================================

\echo '[INICIO] Ejecutando scripts de inicialización...'
\echo '-------------------------------------------------'

\echo 'PASO 1/4: Creando estructura de tablas (entidades.sql)...'
\i /docker-entrypoint-initdb.d/scripts/entidades.sql
\echo '... PASO 1/4 COMPLETADO.'
\echo ''

\echo 'PASO 2/4: Creando funciones y triggers de auditoría (funciones_y_triggers.sql)...'
\i /docker-entrypoint-initdb.d/scripts/funciones_y_triggers.sql
\echo '... PASO 2/4 COMPLETADO.'
\echo ''

\echo 'PASO 3/4: Poblando la base de datos con datos iniciales (seed.sql)...'
\i /docker-entrypoint-initdb.d/scripts/seed.sql
\echo '... PASO 3/4 COMPLETADO.'
\echo ''

\echo 'PASO 4/4: Aplicando políticas de seguridad a nivel de fila (seguridad_rls.sql)...'
\i /docker-entrypoint-initdb.d/scripts/seguridad_rls.sql
\echo '... PASO 4/4 COMPLETADO.'
\echo ''

\echo '-------------------------------------------------'
\echo '[FIN]
