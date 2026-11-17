# neo-tema

Tema para la pestaña Code de la app de escritorio de Claude, con los colores de Neotecnologías.

- **Fondo «Aurora braille»:** sobre navy `#0B1528`, una veta de puntos braille baja por el borde derecho en los azules de la marca, de celeste pálido a `#0750FC` y azul hondo. Cada columna de puntos termina a su propia altura y se desvanece.
- **Isotipo:** el de Neotecnologías, dibujado en puntos abajo a la derecha, junto a la caja del mensaje.
- **Colores de la interfaz:** acento `#0750FC`, texto blanco y grises azulados, y la barra lateral, la barra superior, los menús y los mensajes en el mismo navy.
- **Modo oscuro:** el tema lo fija, porque la escena es nocturna.

## Instalar

En la línea de mensajes de una sesión de Claude Code:

```
/plugin install neo-tema --marketplace NEObmonge/neo-tema
```

Respondé `y` para agregar el marketplace y elegí el alcance (`user` para todas tus sesiones).

Desde una terminal:

```
claude plugin install neo-tema --marketplace NEObmonge/neo-tema
```

El tema se aplica en las sesiones que abras después de instalarlo.

## Requisitos y límites

- La app de escritorio de Claude, con Claude Code 2.1.324 o posterior. La terminal y los editores no dibujan temas.
- **Equipos sin GPU** (por ejemplo, máquinas virtuales con el «Microsoft Basic Render Driver»): la app pinta las barras opacas y deja un velo de al menos 70 % sobre el chat. El tema usa como tinte del vidrio un navy cercano al del fondo para que ese velo no se note.

## Archivos

| Archivo | Qué hace |
|---|---|
| `hooks/register.tsx` | Arma la paleta y fija el tema al iniciar la sesión; dibuja la escena en el fondo. |
| `hooks/escena.ts` | La escena en SVG: la veta de puntos, el halo azul y el isotipo. |
| `hooks/make-colors.js` / `.d.ts` | El ayudante de Claude Code que convierte unos pocos colores en la paleta completa. Se copia tal cual. |

Para cambiar colores: `VETA`, `LOGO` y `AURA` en `escena.ts`; `PANEL`, `VELO` y los `roles` en `register.tsx`.
