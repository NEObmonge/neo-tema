import type { Register, ThemeSetArgs } from 'claude-code'

import { escenaNeo } from './escena'
import { makeColors } from './make-colors.js'

const ESCENA = 'red-neo'

/**
 * El navy de los paneles: barra lateral, barra superior, menús (modelo, ajustes), caja del mensaje y mensajes enviados.
 * La app mezcla el tinte del vidrio con las superficies para pintar esas piezas, así que tinte y superficies 1 a 3
 * llevan el mismo color y todo sale parejo.
 */
// Es el mismo navy del fondo de la escena: así el velo que la app pone sobre el chat (sin GPU, 70 % del tinte
// como mínimo) es del color del fondo y no se nota.
const PANEL = '#0B1528'
/** El velo sobre el chat (tinte del vidrio). La app también lo mezcla en las barras y la caja, que se oscurecen un poco. */
const VELO = '#070E1D'

// Colores de neotecnologias.com: azul #0750FC, navy #162234 y azules pálidos.
// La escena es nocturna, así que el tema fija el modo oscuro.
const { theme, problems } = makeColors({
  label: 'Neotecnologías',
  only: 'dark',
  // El panel de archivos y el resaltado del código toman el fondo del tema de código, no de la paleta:
  // GitHub Dark (#24292E): gris oscuro neutro, sin tono verde ni violeta.
  codeTheme: { dark: 'github-dark' },
  // pro (literales en el código) no tiene color en la web: violeta para no confundirlo con el azul.
  roles: { accent: '#0750FC', danger: '#E5484D', success: '#00B870', warning: '#F4B400', pro: '#7A4DFF' },
  dark: {
    gray: {
      anchors: {
        // Sin vidrio la barra lateral toma la superficie 0: va del mismo navy para que quede igual a la caja y la barra superior.
        'surface-0': PANEL,
        'surface-1': PANEL,
        'surface-2': PANEL,
        'surface-3': PANEL,
        'text-primary': '#FFFFFF',
        'text-secondary': '#C9D5F0',
        'text-muted': '#A9B8D8',
      },
    },
  },
})

// Probado el 17-nov-2026 en la app de escritorio: la barra lateral, la superior y la caja del mensaje salen
// opacas con o sin `colors`, así que el vidrio no depende de la paleta. `glass` se deja por si la app lo aplica luego.
const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  // Paneles de vidrio navy sobre la escena.
  // Con vidrio la franja detrás de la caja del mensaje es transparente (sin vidrio la app la pinta opaca).
  // Opacidad mínima: sin GPU la app usa 70 % igual; con GPU deja ver casi toda la escena.
  // El tinte es el color del velo: un poco más oscuro que el fondo para que el chat se lea sobre una zona más honda.
  backdrop: { scene: ESCENA, glass: { blur: 24, tint: VELO, opacity: 0.15 } },
}

// Escena fija: se arma una sola vez, sin redibujar por cuadros.
let svg: string | undefined

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // El tema queda puesto para la sesión aunque al recargar no haya ventana conectada todavía:
    // la app lo dibuja al conectarse, así que no se avisa nada en la línea de estado.
    await $.theme.set(LOOK)
    $.ui.status(undefined)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== ESCENA) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    svg ??= escenaNeo(0)

    return <Svg source={svg} alt="Aurora de puntos braille de cian a violeta y el isotipo de Neotecnologías" isInteractive />
  })
}
