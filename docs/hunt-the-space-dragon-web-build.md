# Hunt the SPACE DRAGON — build web lista para montar

Instrucciones para quien levante esta demo en un servidor.

Este build **ya esta exportado y verificado**. No hay que compilar ni
abrir Godot: son archivos estaticos listos para servir.

---

## Que es esto

Un juego de plataformas 2D hecho en **Godot 4.6.2**, exportado a
WebAssembly. Corre entero en el navegador, sin backend, sin base de
datos y sin ninguna llamada de red.

| | |
|---|---|
| Resolucion interna | 256 × 224 px (NES), escalado entero |
| Renderer | OpenGL Compatibility (WebGL2) |
| Hilos | **desactivados** a proposito — ver abajo |
| Peso en disco | 38 MB |
| **Descarga real (gzip)** | **~10,3 MB** |

---

## Los archivos

Los **9** tienen que ir juntos, en el mismo directorio, con estos
nombres exactos. El `index.html` los busca por nombre relativo.

```
index.html                         <- la pagina
index.js                           <- el cargador
index.wasm                         <- el motor (36 MB)
index.pck                          <- el juego (1,7 MB)
index.png                          <- splash de carga
index.icon.png                     <- favicon
index.apple-touch-icon.png         <- icono iOS
index.audio.worklet.js             <- audio
index.audio.position.worklet.js    <- audio posicional
```

No hace falta nada mas: ni `node_modules`, ni build step, ni variables
de entorno.

---

## Como montarlo

Copiar los 9 archivos a la carpeta publica y servirlos como estaticos.
Entrar por `index.html`.

### Lo unico que importa: la compresion

El `.wasm` pesa 36 MB sin comprimir y **9,1 MB con gzip**. Si el
servidor no comprime, el jugador se baja los 36 MB enteros.

Hay que asegurarse de que gzip (o brotli) este activo **para
`application/wasm`**, que es el tipo que algunos servidores dejan afuera
de la lista por defecto.

- **nginx:** sumar `application/wasm` a `gzip_types`
- **Apache:** sumar `application/wasm` a `AddOutputFilterByType DEFLATE`
- **Netlify, Vercel, Cloudflare Pages, GitHub Pages:** ya lo hacen solo

Tambien conviene que el `.wasm` se sirva con
`Content-Type: application/wasm`. Casi todos los servidores modernos ya
lo hacen; si no, el navegador lo carga igual pero mas lento.

### Cabeceras de aislamiento: NO hacen falta

Godot web puede pedir las cabeceras `Cross-Origin-Opener-Policy` y
`Cross-Origin-Embedder-Policy`, que muchos hostings no dejan configurar.

**Este build no las necesita.** Se exporto con los hilos desactivados
justamente para eso. Si la plataforma las ofrece, activarlas no rompe
nada; si no las ofrece, tampoco importa.

> Nota: el `index.html` incluye un
> `"ensureCrossOriginIsolationHeaders": true` en su configuracion. Es el
> valor por defecto de Godot y **no exige nada del servidor**: solo
> intenta usar esas cabeceras si ya estan. El build corre sin ellas.

### Subcarpeta o raiz

Las dos andan. Todas las rutas internas son relativas, asi que funciona
igual en `https://sitio.com/` que en `https://sitio.com/juegos/dragon/`.

---

## Como comprobar que quedo bien

1. **Carga.** Aparece una barra de progreso y despues una pantalla negra
   con **"PULSA UN BOTON"**.
2. **Primer boton.** Apretar `Z`, `X` o la barra espaciadora. Tiene que
   **empezar a sonar la musica** y el texto de la introduccion empieza a
   subir.
   > Esto es lo mas importante que hay que verificar. Los navegadores no
   > dejan sonar audio hasta que el usuario toca algo, y el juego esta
   > hecho para respetar eso. **Si no suena despues del primer boton,
   > hay un problema real.**
3. **Saltear.** Otro boton pasa al titulo.
4. **Menu.** Arriba/abajo cambia entre JUGAR y PRUEBA DE AUDIO, y hace
   un ruidito al moverse. `X` confirma.
5. **Jugar.** Moverse con las flechas, saltar con espacio, atacar con
   `X`.

### Controles

| Accion | Tecla |
|---|---|
| Moverse | flechas o `A`/`D` |
| Saltar | espacio o `Z` |
| Atacar | `X` |
| Sub-arma | `C` |
| Cambiar bolsillo | `Q` / `E` |
| Pausa | `Esc` |

Tambien anda con gamepad.

---

## Lo que NO va a funcionar, y es esperado

| | |
|---|---|
| **Celulares y tablets** | El juego carga y corre, pero **no tiene controles tactiles**: sin teclado no se puede jugar. No es un bug. |
| **Audio antes del primer boton** | Es el comportamiento correcto; lo impone el navegador. |
| **Navegadores muy viejos** | Necesita WebGL2 y WebAssembly. Cualquier Chrome, Firefox, Edge o Safari de los ultimos años sirve. |

---

## Si algo falla

| Sintoma | Causa probable |
|---|---|
| Pantalla negra, la barra no avanza | Falta algun archivo, o el `.wasm` se sirve con el tipo equivocado. Mirar la consola del navegador (F12). |
| Carga pero no suena nada | Verificar que se apreto un boton primero. Si se apreto y sigue mudo, revisar que `index.audio.worklet.js` este presente y se sirva. |
| Tarda muchisimo en cargar | Casi seguro que el servidor no esta comprimiendo el `.wasm`. Ver la seccion de compresion. |
| Error de `SharedArrayBuffer` | No deberia pasar: este build no usa hilos. Si aparece, se subio otro build por error. |

La consola del navegador (F12 → Console) dice casi siempre que falta.

---

## Para actualizar la demo mas adelante

Se reemplazan los 9 archivos por los nuevos. No hay estado guardado del
lado del servidor ni migraciones que correr.

Conviene avisar a quien lo pruebe que haga una recarga forzada
(`Ctrl+Shift+R`), porque el `.wasm` queda en cache del navegador.
