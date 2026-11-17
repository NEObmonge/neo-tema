// Escena "Aurora braille": sobre papel navy, una veta diagonal de puntos braille baja por el borde derecho en
// degradado cian → azul → violeta. Los puntos titilan y el tono de toda la veta se mece despacio entre cian y
// violeta. Al pie, el isotipo de Neotecnologías en puntos. El centro, donde va el texto, queda limpio.
// Solo arma texto: sin DOM ni importaciones, la misma salida en cada carga.

const W = 1600
const H = 1000
/** Distancia entre puntos: un carácter braille son 2x4 puntos, con una columna y una fila de aire. */
const PASO = 8

const PAPEL = '#0B1528'
// Los azules de neotecnologias.com: celeste pálido arriba → #0750FC → azul hondo abajo.
const VETA = ['#CDDCFE', '#8FAEFF', '#4D7CFF', '#0750FC', '#0E3A9F']
const LOGO = ['#EEF3FF', '#AEC6FF']
const AURA = '#14307A'

/** Dónde corre la veta y dónde va el isotipo (unidades del viewBox). */
const VETA_X = 1260
/** Hasta dónde puede llegar una columna de la veta: cada una termina antes, a su propia altura. */
const VETA_FIN = 830
// A la derecha de la caja del mensaje, que termina cerca de x=1375.
const ISO_X = 1385
const ISO_Y = 840
const ISO_ANCHO = 200

/** El isotipo muestreado a 76x38 desde el logo oficial: el tono de cada celda de 0 a 9. */
const ISOTIPO = [
  '0000000000000000000000000146888630000000000000000000000000013678999876410000',
  '0000000000000000000000004888899997200000000000000000000003799999999999997410',
  '0000000000000000000000068888899999930000000000000000000179999999999999999983',
  '0000000000000000000000688888889999994000000000000000004999999999999999999994',
  '0000000000000000000016788885223799999400000000000000179999999642212347999970',
  '0000000000000000000057778610000049999940000000000001799999730000000018999810',
  '0000000000000000000377776000000004999994000000000007999983000000000079999200',
  '0000000000000000001677761000000000499999500000000058899810000000000499995000',
  '0000000000000000005777720000000000039999950000000378888100000000001999980000',
  '0000000000000000026777500000000000004999994000000677871000000000006999930000',
  '0000000000000000166676100000000000000399999400000567710000000000049999600000',
  '0000000000000000566661000000000000000039999950000145200000000000199998000000',
  '0000000000000003666630000000000000000003999996000000000000000001899992000000',
  '0000000000000016678853100000000000000000399999600000000000000005999950000000',
  '0000000000000058999998851000000000000000039999950000000000000029999700000000',
  '0000000000000378999999888400000000000000003999995000000000000079999200000000',
  '0000000000001678899999988872000000000000000299999600000000000489994000000000',
  '0000000000006777774458998888200000000000000028999971000000002788870000000000',
  '0000000000057777400000389888820000000000000001899998200000016778810000000000',
  '0000000000388774000000017988882000000000000000189999940000166677300000000000',
  '0000000001888871000000000799888200000000000000028999998656887665000000000000',
  '0000000006988830000000000069988830000000000000001799999999988760000000000000',
  '0000000039998500000000000005998883000000000000000049999999999720000000000000',
  '0000000189998100000000000000599888300000000000000001589999997300000000000000',
  '0000000799993000000000000000059988830000000000000000002587765000000000000000',
  '0000004999960000000000000000005998883000000000000000000466662000000000000000',
  '0000029999700000000000036510000499888300000000000000003766640000000000000000',
  '0000079999200000000000377750000049998830000000000000017776500000000000000000',
  '0000599994000000000002777750000004999884000000000000067776100000000000000000',
  '0001999980000000000028887720000000599988400000000000477773000000000000000000',
  '0007999920000000000388888400000000049998840000000001777760000000000000000000',
  '0059999400000000015999885000000000004999884000000017777710000000000000000000',
  '0399996000000001589999950000000000000499988500000278777300000000000000000000',
  '1899997543334579999999500000000000000039999874346888874000000000000000000000',
  '6999999999999999999972000000000000000003999988888888840000000000000000000000',
  '3899999999999999999500000000000000000000289998888888400000000000000000000000',
  '0036999999999999852000000000000000000000017999888873000000000000000000000000',
  '0000024677887642000000000000000000000000000256765300000000000000000000000000',
] as const

const ISO_C = ISOTIPO[0]?.length ?? 0
const ISO_F = ISOTIPO.length

function suave(a: number, b: number, v: number): number {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Pseudoazar determinista. */
function hash(semilla: number): number {
  const v = Math.sin(semilla * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

function r1(v: number): number {
  return Math.round(v * 10) / 10
}

/** Tono del isotipo (0..1) en coordenadas normalizadas, con interpolación bilineal. */
function tonoIso(u: number, v: number): number {
  if (u < 0 || v < 0 || u >= 1 || v >= 1) return 0
  const x = u * (ISO_C - 1)
  const y = v * (ISO_F - 1)
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const t = (c: number, f: number) => Number(ISOTIPO[Math.min(ISO_F - 1, f)]?.[Math.min(ISO_C - 1, c)] ?? 0) / 9
  return (t(x0, y0) * (1 - fx) + t(x0 + 1, y0) * fx) * (1 - fy) + (t(x0, y0 + 1) * (1 - fx) + t(x0 + 1, y0 + 1) * fx) * fy
}

/** Mezcla en una paleta según t de 0 a 1. */
function paleta(colores: readonly string[], t: number): string {
  const n = colores.length - 1
  const c = Math.min(1, Math.max(0, t)) * n
  const i = Math.min(n - 1, Math.floor(c))
  const f = c - i
  const a = parseInt((colores[i] ?? '#000000').slice(1), 16)
  const b = parseInt((colores[i + 1] ?? '#000000').slice(1), 16)
  const canal = (s: number) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f)
  return `#${((canal(16) << 16) | (canal(8) << 8) | canal(0)).toString(16).padStart(6, '0')}`
}

type Punto = { x: number; y: number; r: number; color: number; semilla: number }

/** Los brillos posibles de un punto que titila. */
const BRILLOS = [0.4, 0.65, 1] as const

/**
 * Agrupa los puntos por tono (12 de la paleta) y brillo. Cada grupo es un solo trazo: un segmento de largo cero por
 * punto con punta redonda, que se ve como un círculo. Así la escena tiene unas decenas de elementos en vez de cientos
 * de círculos, y la app la dibuja más rápido al cambiar de chat.
 * `desvio` corre todos los tonos por la paleta; `titila` da a cada punto un brillo propio del cuadro.
 */
function dibujar(puntos: readonly Punto[], colores: readonly string[], cuadro: number, desvio: number, titila: boolean, brilloFijo = 1): string {
  const grupos = new Map<string, string>()
  let r = 2
  for (const p of puntos) {
    r = p.r
    const k = Math.round(Math.min(1, Math.max(0, p.color + desvio)) * 11)
    const b = titila ? BRILLOS[Math.floor(hash(p.semilla * 3.1 + cuadro * 7.3) * BRILLOS.length)] ?? 1 : brilloFijo
    const clave = `${k}|${b}`
    grupos.set(clave, `${grupos.get(clave) ?? ''}M${p.x} ${p.y}h0`)
  }
  return [...grupos]
    .map(([clave, d]) => {
      const [k, b] = clave.split('|').map(Number)
      return `<path d="${d}" fill="none" stroke="${paleta(colores, (k ?? 0) / 11)}" stroke-width="${r * 2}" stroke-linecap="round" opacity="${b}"/>`
    })
    .join('')
}

/** La veta: baja en diagonal por el borde derecho, ondulando apenas. Cada punto titila a su ritmo. */
function veta(): Punto[] {
  const puntos: Punto[] = []
  let n = 0
  for (let y = 0; y < VETA_FIN; y += PASO) {
    for (let x = VETA_X; x < W; x += PASO) {
      // El aire entre caracteres braille.
      if (Math.floor((x - VETA_X) / PASO) % 3 === 2 || Math.floor(y / PASO) % 5 === 4) continue
      const centro = 1400 + y * 0.13 + 30 * Math.sin(y / 120)
      // Cada columna empieza y termina a su propia altura y se desvanece: así la veta no deja una línea horizontal.
      const col = Math.floor(x / PASO)
      const fin = 640 + hash(col * 5.7) * 150
      const ini = -20 + hash(col * 2.9) * 90
      const borde = suave(ini, ini + 90, y) * (1 - suave(fin - 160, fin, y))
      const t = borde * (1 - suave(20, 170, Math.abs(x - centro)))
      n++
      if (hash(n * 1.7) < t * 0.8) {
        puntos.push({ x, y, r: 2, color: y / VETA_FIN, semilla: n })
      }
    }
  }
  return puntos
}

/** El isotipo en puntos densos, sin el aire braille, para que se lea. */
function isotipo(): Punto[] {
  const alto = (ISO_ANCHO * ISO_F) / ISO_C
  const paso = PASO / 1.4
  const puntos: Punto[] = []
  for (let y = ISO_Y; y < ISO_Y + alto; y += paso) {
    for (let x = ISO_X; x < ISO_X + ISO_ANCHO; x += paso) {
      if (tonoIso((x - ISO_X) / ISO_ANCHO, (y - ISO_Y) / alto) > 0.35) {
        const u = (x - ISO_X) / ISO_ANCHO
        const v = (y - ISO_Y) / alto
        puntos.push({ x: r1(x), y: r1(y), r: 2.1, color: u * 0.6 + v * 0.4, semilla: 0 })
      }
    }
  }
  return puntos
}

/**
 * Cuántos cuadros tiene la animación. La app apaga las animaciones CSS en máquinas sin GPU, así que el mod
 * redibuja la escena con otro cuadro cada tanto: cada punto cambia de brillo y los tonos de la veta se mecen
 * entre cian y violeta a lo largo del ciclo.
 */
export const CUADROS = 12

const VETA_PUNTOS = veta()
const ISO_PUNTOS = isotipo()

export function escenaNeo(cuadro = 0): string {
  const fase = (2 * Math.PI * (cuadro % CUADROS)) / CUADROS
  const desvio = 0.18 * Math.sin(fase)
  const luz = r1(0.85 + 0.15 * Math.sin(fase + 1))
  const brilloLogo = r1(0.85 + 0.15 * Math.sin(fase * 2))

  // Luces de color detrás de los paneles de la app (barra lateral, barra superior y caja del mensaje):
  // el vidrio esmerilado las difumina, y así el panel se lee como vidrio y no como un bloque liso.
  const defs = `<radialGradient id="aura" cx=".88" cy=".35" r=".55"><stop offset="0" stop-color="${AURA}" stop-opacity=".9"/><stop offset="1" stop-color="${PAPEL}" stop-opacity="0"/></radialGradient>
<radialGradient id="lado" cx=".02" cy=".9" r=".45"><stop offset="0" stop-color="#6A45E0" stop-opacity=".6"/><stop offset=".5" stop-color="#2A3FA8" stop-opacity=".3"/><stop offset="1" stop-color="${PAPEL}" stop-opacity="0"/></radialGradient>
<radialGradient id="lado2" cx=".04" cy=".12" r=".35"><stop offset="0" stop-color="#1F8FD8" stop-opacity=".45"/><stop offset="1" stop-color="${PAPEL}" stop-opacity="0"/></radialGradient>
<linearGradient id="techo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7BFF" stop-opacity=".32"/><stop offset=".09" stop-color="#2F7BFF" stop-opacity="0"/></linearGradient>
<radialGradient id="pie" cx=".52" cy="1.04" r=".32"><stop offset="0" stop-color="#0750FC" stop-opacity=".55"/><stop offset=".6" stop-color="#3B2FA0" stop-opacity=".18"/><stop offset="1" stop-color="${PAPEL}" stop-opacity="0"/></radialGradient>`

  const luces = `<g opacity="${luz}"><rect width="${W}" height="${H}" fill="url(#lado)"/><rect width="${W}" height="${H}" fill="url(#lado2)"/></g><rect width="${W}" height="${H}" fill="url(#techo)"/><rect width="${W}" height="${H}" fill="url(#pie)" opacity="${luz}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>
<rect width="${W}" height="${H}" fill="${PAPEL}"/><rect width="${W}" height="${H}" fill="url(#aura)"/>${luces}
${dibujar(VETA_PUNTOS, VETA, cuadro, desvio, true)}${dibujar(ISO_PUNTOS, LOGO, cuadro, 0, false, brilloLogo)}
</svg>`
}
