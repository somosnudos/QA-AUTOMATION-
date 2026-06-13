# Spec: login — Autenticación de usuario

## Flujo observado
Dos pasos:
1. El usuario ingresa su correo y hace clic en "Continuar"
2. Aparece el campo contraseña y hace clic en "Iniciar sesión"
3. Si las credenciales son correctas, redirige al dashboard (`/nodi/dashboard`)

## Criterios de aceptación

| # | Criterio | Tipo |
|---|---|---|
| CA-1 | Login exitoso con credenciales válidas redirige al dashboard | happy path |
| CA-2 | Correo inválido (formato incorrecto) deshabilita el botón "Continuar" — no avanza al paso 2 | negativo |
| CA-3 | Correo válido pero sin cuenta registrada muestra error en paso 1 | negativo |
| CA-4 | Contraseña incorrecta muestra error en paso 2 | negativo |
| CA-5 | El campo contraseña no es visible hasta ingresar el correo y hacer clic en "Continuar" | flujo |
| CA-6 | El campo contraseña tiene type="password" (no expone la contraseña en texto plano) | seguridad |
| CA-7 | Tras login exitoso el dashboard muestra menú de navegación, datos del usuario, widgets de KPIs y acciones rápidas | post-login |

## Elementos del dashboard a validar (CA-7)
### Menú lateral (navegación)
- Home, Empleados, Inventario, Órdenes, Servicios logísticos, Cotizaciones, Facturación

### Datos del usuario
- Nombre parcial: "Britney Colt"
- Rol: "Usuario"
- Plan: "PRODUCTO Y TECH" y "Platinum"

### Widget de herramientas (los números son dinámicos y NO se validan)
- "Herramientas almacenadas" — texto visible del card
- "Nuevas" y "Usadas" — etiquetas de categoría visibles en el card
- Nota: "Total de Herramientas almacenadas" es solo el título del tooltip (oculto por CSS), no se valida

### Acciones rápidas
- Botones: "Offboarding", "Onboarding", "Mover entre ubicaciones"

### Sección tracking
- Título: "Tracking de órdenes y servicios"
- Tab "Todos" (único en la página — los otros tabs "Órdenes" y "Servicios" son ambiguos con el sidebar)
- Botones de filtro: "Por confirmar", "Requieren atención"

## Casos fuera de scope
- Recuperación de contraseña (link "¿Olvidaste tu contraseña?")
- Registro de nuevo usuario

## Notas técnicas
- El correo se ingresa en `input[placeholder="correo@empresa.com"]`
- La contraseña se ingresa en `input[type="password"]`
- Hay un banner "Entendido" que puede aparecer al cargar — descartarlo antes de interactuar
- `autocomplete="off"` en ambos campos
- URL de login: https://dash.bord.co/login
- URL post-login esperada: https://dash.bord.co/nodi/dashboard
