# Modelo 3D de Martzian

1. Exporta el personaje como `.glb` (glTF binario) desde Blender: File → Export → glTF 2.0, formato "glTF Binary".
   - Incluye la animación idle (nómbrala con "idle" en el nombre del Action) si la tienes.
   - Nombra el hueso de la cabeza con "Head" para que siga sutilmente al cursor.
2. Optimízalo (recomendado, < 3 MB):  `npx @gltf-transform/cli optimize martzian.glb martzian.glb --texture-compress webp`
   (no uses compresión Draco/Meshopt salvo que se active el decodificador en src/scripts/hero3d.ts).
3. Copia el archivo aquí como `public/models/martzian.glb`.
4. En `src/data/site.ts` cambia `characterModel: null` por `characterModel: 'models/martzian.glb'`.

Si el modelo no carga (o el dispositivo no tiene WebGL), el sitio muestra automáticamente la imagen de referencia.
