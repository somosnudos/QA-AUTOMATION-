# Backoffice — Bord (panel de operaciones)

## Ambientes
| Ambiente | URL | Pruebas |
|---|---|---|
| Beta | https://beta.soga.bord.co | ✅ aquí corre todo |
| Producción | https://soga.bord.co | ⛔ NUNCA destructivas |

> Nota: el dominio se llama "soga" igual que el WMS de bodega, pero es una
> app distinta. Este backoffice tiene módulos de Órdenes, Catálogo,
> Facturación, Empresas, Países, etc. El WMS de bodega (proyecto `soga` en
> este repo, repo real `wms-frontend`) se prueba contra
> `https://d2hq6whafzzidb.cloudfront.net` — no confundir los dos.

## Usuarios de prueba
Roles disponibles: usuario QA (credenciales en `.env` → QA_USER / QA_PASS)
- `QA_USER` = britney.colt+2@bord.co

## Módulos críticos
21 módulos en total (ver mapa de cobertura). Pendiente priorizar con Britney/TL
cuáles cubrir primero — candidatos propuestos: Órdenes, Catálogo, Facturación,
Servicios logísticos.

## Particularidades
- Login en `/auth/login`
- Dashboard inicial en `/dashboard/dashboard` con menciones/notificaciones

## Reporte publicado
_Pendiente de configurar_
