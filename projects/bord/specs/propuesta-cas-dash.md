# Propuesta de criterios de aceptación — dash (mono-crm)

> **Estado: PROPUESTA para validación de Britney.** Derivada de la UI real de
> beta.dash.bord.co (sondeo del 2026-07-16, usuario admin Britney Jimenez).
> Los CAs marcados con ⚠ requieren decisión de negocio antes de automatizarse.
> Una vez validada, cada módulo se convierte en `e2e/specs/<módulo>.spec.md`
> dentro de mono-crm y se construyen sus tests.

## Convenciones de la propuesta

- Solo criterios **verificables por E2E desktop** con usuario admin.
- Los contadores y datos son dinámicos: se valida formato/estructura, no valores.
- Acciones que crean/modifican datos reales (crear empleado, pagar factura,
  solicitar cotización) se proponen como **validación de apertura de flujo**
  (el formulario/modal abre correctamente), no como ejecución completa — hasta
  definir datos de prueba desechables con el equipo.

---

## 1 · Login (`/login`) — ya cubierto, se formaliza

| # | Criterio propuesto |
|---|---|
| CA-1 | Al cargar, se muestra el input de correo y no el de contraseña |
| CA-2 | Continuar deshabilitado con correo de formato inválido |
| CA-3 | Continuar habilitado con formato de correo válido |
| CA-4 | Con correo válido, aparece el paso de contraseña |
| CA-5 | Con credenciales válidas redirige al dashboard |
| CA-6 | Modal de seguridad (lockout) se puede descartar y reintentar el login |

## 2 · Home / Dashboard (`/nodi/dashboard`)

| # | Criterio propuesto |
|---|---|
| CA-1 | El menú lateral muestra: Home, Empleados, Inventario, Órdenes, Servicios logísticos, Cotizaciones, Facturación |
| CA-2 | Se muestran el nombre del usuario autenticado y su rol |
| CA-3 | KPIs visibles: Herramientas almacenadas, Órdenes en curso, Servicios en curso |
| CA-4 | Accesos rápidos visibles: Offboarding, Onboarding, Mover entre ubicaciones |
| CA-5 | Sección de tracking con filtros "Por confirmar" y "Requieren atención" (con contador) |
| CA-6 | El toast de bienvenida aparece tras el login |

## 3 · Empleados (`/nodi/employees`)

| # | Criterio propuesto |
|---|---|
| CA-1 | El título muestra "Empleados" con el contador total |
| CA-2 | Buscador presente ("Busca por nombre") y filtra el listado en tiempo real |
| CA-3 | Botones "Crear empleado" y "Cargar múltiples empleados" visibles |
| CA-4 | El listado muestra por empleado: nombre, ubicación, ciudad, área y herramientas asignadas |
| CA-5 | Panel de Filtros disponible |
| CA-6 | Búsqueda sin resultados muestra estado vacío |
| CA-7 ⚠ | "Crear empleado" abre el formulario de alta (sin completar el alta) |

## 4 · Inventario (`/nodi/tools`)

| # | Criterio propuesto |
|---|---|
| CA-1 | El título muestra "Inventario" con el contador total de herramientas |
| CA-2 | Vistas "Disponibles (n)" y "No disponibles (n)" presentes; Disponibles activa por defecto |
| CA-3 | Buscador presente (nombre, serial o PO) |
| CA-4 | Filtros disponibles: Categoría, Estado, País, Ubicación, Etiquetas + Ordenar por |
| CA-5 | Botones CSV, Cargar inventario y BuyBack visibles |
| CA-6 | Accesos Onboarding y Offboarding visibles |
| CA-7 | Cada herramienta del listado muestra specs (pantalla, procesador, almacenamiento) y serial |
| CA-8 | Búsqueda sin resultados muestra estado vacío |
| CA-9 ⚠ | Exportar CSV descarga un archivo (validar solo que la descarga inicia) |

## 5 · Órdenes (`/nodi/orders`)

| # | Criterio propuesto |
|---|---|
| CA-1 | El título muestra "Órdenes" con el contador total |
| CA-2 | Buscador presente (número de orden, PO, creador o serial) |
| CA-3 | Filtros disponibles: Estado, País, Destino, Método de pago, Estado de pago, Etiquetas |
| CA-4 | Cada orden muestra: número (Orden N°…), fecha, destinos, método de pago, total y creador |
| CA-5 | Cada orden muestra su estado actual (ej. "Tránsito al destino") |
| CA-6 | Búsqueda sin resultados muestra estado vacío |
| CA-7 ⚠ | Clic en una orden abre su detalle |

## 6 · Servicios logísticos (`/nodi/logistics-services`)

| # | Criterio propuesto |
|---|---|
| CA-1 | El título muestra "Servicios logísticos" con el contador total |
| CA-2 | Accesos rápidos: Offboarding, Onboarding, Mover entre ubicaciones |
| CA-3 | Buscador presente (número de servicio, PO, creador o serial) |
| CA-4 | Filtros disponibles: Estado, Origen, Destino, Tipo, Método de pago, Estado de pago, Etiquetas |
| CA-5 | Sección "Acciones pendientes" visible |
| CA-6 | Cada servicio muestra: número (SL Nº…), fecha, origen/destino y estado |
| CA-7 | Búsqueda sin resultados muestra estado vacío |
| CA-8 ⚠ | Clic en un acceso rápido (ej. Onboarding) abre el flujo de solicitud (sin completarlo) |

## 7 · Cotizaciones (`/nodi/quotes`)

| # | Criterio propuesto |
|---|---|
| CA-1 | Se muestra "Mis cotizaciones" con el CTA "Solicitar cotización" |
| CA-2 | Estados con contador visibles: Cotización solicitada, Cotización recibida, Compradas, Vencidas, Canceladas |
| CA-3 | Buscador presente (número de cotización o referencia interna) |
| CA-4 | Filtro País y control Ordenar disponibles |
| CA-5 | Cada cotización del listado tiene el botón "Consultar" |
| CA-6 | Búsqueda sin resultados muestra estado vacío |
| CA-7 ⚠ | "Solicitar cotización" abre el formulario de solicitud (sin enviarla) |

## 8 · Facturación (`/nodi/billing/storage`)

| # | Criterio propuesto |
|---|---|
| CA-1 | Secciones visibles: Almacenamiento, Servicios logísticos, Órdenes (Almacenamiento activa por defecto) |
| CA-2 | Se muestra la explicación del ciclo de facturación mensual |
| CA-3 | Botones "Exportar detalle" y "Pagar factura" visibles |
| CA-4 | Cambiar a la sección Servicios logísticos muestra su contenido |
| CA-5 | Cambiar a la sección Órdenes muestra su contenido |
| CA-6 ⚠ | "Exportar detalle" inicia una descarga |
| CA-7 ⚠ | "Pagar factura" abre el flujo de pago (SIN ejecutar ningún pago — solo validar apertura) |

---

## Preguntas abiertas para Britney

1. Los CAs ⚠ ¿los incluimos ya (solo apertura de flujo) o los dejamos para una
   segunda fase con datos de prueba dedicados?
2. ¿Hay un usuario NO-admin de dash para validar permisos por rol (como en soga)?
   El sondeo se hizo con admin.
3. ¿Algún módulo tiene reglas de negocio críticas que no se vean en la UI y
   deban probarse (límites, validaciones, estados especiales)?
4. Orden de construcción propuesto: Dashboard → Inventario → Órdenes →
   Servicios logísticos → Empleados → Cotizaciones → Facturación. ¿Cambiarías algo?
