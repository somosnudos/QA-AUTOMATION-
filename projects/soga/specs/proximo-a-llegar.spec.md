# Spec: proximo-a-llegar — Módulo de entrada, Tab Próximo a llegar

> Jira: BORD-4445 — TECH. WMS en Codigo | Módulo de entrada - Tab Próximo a llegar
> Estado en Jira: PRUEBAS PRODUCTO/UX

## Descripción funcional

El tab **Próximo a llegar** muestra todas las herramientas que están en tránsito hacia la bodega.
Es un módulo **solo informativo** — no se puede accionar nada desde esta vista.

El programador de bodega usa este tab para:
1. Buscar el equipo que llegó por serial, modelo, orden o SL
2. Identificar el registro correcto
3. Usar el link a SOGA para ir al detalle y cambiar el estado a "Almacenado"

## URL

- Beta: `https://d2hq6whafzzidb.cloudfront.net/incoming`

## Tipos de entrada y en qué tab aparecen

| Tipo de entrada | Tab |
|---|---|
| Offboarding | Servicios (SLs) |
| Diagnóstico | Servicios (SLs) |
| Garantía | Servicios (SLs) |
| Buy & Hold | Órdenes |
| Parada en Bodega | Órdenes |
| Compra de Stock Propio | Órdenes |

## Criterios de aceptación

| # | Criterio | Tipo |
|---|---|---|
| CA-1 | Al cargar la página, el tab "Todos" está seleccionado por defecto | estructura |
| CA-2 | Los tres tabs están presentes: Todos, Servicios, Órdenes | estructura |
| CA-3 | El buscador está presente en el header | estructura |
| CA-4 | Los filtros disponibles para usuario no-admin son: Cliente, Tipo de entrada, Proveedor | filtros |
| CA-5 | El filtro País NO es visible para usuario no-admin | filtros / permisos |
| CA-6 | Al hacer clic en tab "Servicios" ese tab queda activo | navegación |
| CA-7 | Al hacer clic en tab "Órdenes" ese tab queda activo | navegación |
| CA-8 | Al hacer clic en "Todos" vuelve a mostrar todos los registros | navegación |
| CA-9 | Una búsqueda sin resultados muestra el estado vacío con mensaje e ícono de lupa | buscador |
| CA-10 | El link a la orden/SL abre SOGA en una nueva pestaña | links |
| CA-11 | El link de tracking abre en una nueva pestaña | links |
| CA-12 | Los contadores de los tabs reflejan la cantidad de registros visibles | métricas |
| CA-13 | No hay ningún botón de acción (cambio de estado) disponible desde esta vista | permisos |

## Información visible por ítem (usuario no-admin)

- ID de orden o SL
- Cliente
- Serial
- Modelo
- Tipo de entrada
- ETA a bodega
- Proveedor
- Nº de orden de proveedor
- Link a SOGA (abre en nueva pestaña)
- Link de tracking (abre en nueva pestaña)
- **NO** muestra Bodega (campo solo visible para admin)

## Ordenamiento por defecto
- ETA a bodega ascendente (más próximo primero)

## Estado vacío
- Mensaje: "No hay resultados para tu búsqueda, intenta probando con otros criterios de búsqueda"
- Ícono de lupa

## Notas técnicas
- Login de SOGA: un paso — correo + contraseña (sin dos pasos)
- Usuario no-admin: solo ve datos de su país
- No hay filtro País para no-admin
- No hay campo Bodega en las cards para no-admin
