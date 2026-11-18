// Escena WebGL del hero: polvo suspendido iluminado + (opcional) el modelo GLB de Martzian.
// Se carga de forma diferida desde Hero.astro, nunca bloquea el primer render.
import * as THREE from 'three';

interface Ctx { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera }

export async function startHero3D(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const mobile = matchMedia('(max-width: 960px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const ctx: Ctx = { renderer, scene, camera };

  const dust = makeDust(mobile ? 260 : 700);
  scene.add(dust.points);

  // Puntero → cámara (parallax 3D sutil)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = hero;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(hero);

  // Modelo opcional
  let character: Awaited<ReturnType<typeof loadCharacter>> | null = null;
  const modelUrl = canvas.dataset.model;
  if (modelUrl) {
    loadCharacter(ctx, modelUrl, mobile)
      .then((c) => { character = c; hero.classList.add('hero--model'); })
      .catch((err) => console.warn('[hero3d] No se pudo cargar el modelo, se mantiene la imagen.', err));
  }

  // Bucle: sólo corre cuando el hero es visible y la pestaña está activa
  const clock = new THREE.Clock();
  let visible = true, running = false;
  const tick = () => {
    if (!visible || document.hidden) { running = false; return; }
    running = true;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = pointer.x * 0.5;
    camera.position.y = -pointer.y * 0.3;
    camera.lookAt(0, 0, 0);
    dust.material.uniforms.uTime.value = t;
    character?.update(t, dt, pointer);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  const kick = () => { if (!running) { clock.getDelta(); requestAnimationFrame(tick); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  document.addEventListener('martzian:egg', () => { dust.material.uniforms.uAlarm.value = 1; setTimeout(() => (dust.material.uniforms.uAlarm.value = 0), 1800); });
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 2s';
  requestAnimationFrame(() => (canvas.style.opacity = '1'));
  kick();
}

function makeDust(count: number) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    seed[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAlarm: { value: 0 }, uScale: { value: devicePixelRatio > 1 ? 1.4 : 1 } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime; uniform float uScale; uniform float uAlarm;
      varying float vSeed; varying float vFade;
      void main() {
        vec3 p = position;
        float speed = 0.08 + aSeed * 0.18 + uAlarm * 0.6;
        p.y = mod(p.y + 5.0 + uTime * speed, 10.0) - 5.0;
        p.x += sin(uTime * 0.3 + aSeed * 30.0) * 0.25;
        p.z += cos(uTime * 0.2 + aSeed * 12.0) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.2 + aSeed * 2.6) * uScale * (10.0 / -mv.z);
        vSeed = aSeed;
        vFade = smoothstep(5.0, 3.5, abs(p.y)) * smoothstep(-6.0, 1.0, p.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uAlarm;
      varying float vSeed; varying float vFade;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        float flicker = 0.6 + 0.4 * sin(uTime * (1.0 + vSeed * 3.0) + vSeed * 40.0);
        vec3 cold = vec3(0.84, 0.86, 0.88);
        vec3 red = vec3(1.0, 0.22, 0.22);
        vec3 col = mix(cold, red, step(0.78, vSeed) + uAlarm * 0.8);
        gl_FragColor = vec4(col, a * vFade * flicker * 0.55);
      }`,
  });
  return { points: new THREE.Points(geo, material), material };
}

async function loadCharacter(ctx: Ctx, url: string, mobile: boolean) {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;

  // Encuadre: altura ~4.6 unidades, centrado, desplazado a la derecha como en la composición
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 4.6 / size.y;
  root.scale.setScalar(scale);
  root.position.sub(center.multiplyScalar(scale));
  const rig = new THREE.Group();
  rig.add(root);
  rig.position.set(mobile ? 0 : 1.6, mobile ? 0.9 : 0, 0);
  ctx.scene.add(rig);

  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) { m.frustumCulled = false; }
  });

  // Iluminación cinematográfica: llave fría cenital, contraluces rojos, relleno mínimo
  const key = new THREE.SpotLight(0xb8c7d6, 60, 30, Math.PI / 7, 0.6, 1.6);
  key.position.set(1.5, 7, 5); key.target = rig;
  const rimL = new THREE.PointLight(0xff3737, 40, 14, 1.8); rimL.position.set(-2.5, 1.5, -3);
  const rimR = new THREE.PointLight(0xa51f24, 30, 14, 1.8); rimR.position.set(3.5, -0.5, -2.5);
  const fill = new THREE.HemisphereLight(0x71808c, 0x16090b, 0.35);
  ctx.scene.add(key, key.target, rimL, rimR, fill);

  // Animación propia del modelo (prioriza un clip "idle")
  let mixer: THREE.AnimationMixer | null = null;
  let clip: THREE.AnimationClip | null = null;
  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(root);
    clip = gltf.animations.find((a) => /idle/i.test(a.name)) ?? gltf.animations[0];
    mixer.clipAction(clip).play();
  }
  // Hueso de la cabeza para que siga sutilmente al cursor
  let head: THREE.Object3D | null = null;
  root.traverse((o) => { if (!head && /head|cabeza/i.test(o.name)) head = o; });
  const headObj = head as THREE.Object3D | null;
  // Si el clip ya anima la cabeza, sumamos la rotación encima; si no, partimos de la pose de reposo.
  const headAnimated = !!(headObj && clip?.tracks.some((tr) => tr.name.startsWith(headObj.name + '.quaternion')));
  const headBase = headObj ? headObj.quaternion.clone() : null;
  const q = new THREE.Quaternion(), e = new THREE.Euler();

  return {
    update(t: number, dt: number, p: { x: number; y: number }) {
      mixer?.update(dt);
      // Idle procedural: respiración y oscilación suspendida (no tiene piernas: cuelga de los tubos)
      rig.position.y = (mobile ? 0.9 : 0) + Math.sin(t * 0.8) * 0.06;
      rig.rotation.z = Math.sin(t * 0.45) * 0.012;
      rig.rotation.y = p.x * 0.12 + Math.sin(t * 0.25) * 0.03;
      if (headObj && headBase) {
        e.set(p.y * 0.18, p.x * 0.3, 0);
        q.setFromEuler(e);
        if (headAnimated) headObj.quaternion.multiply(q);
        else headObj.quaternion.copy(headBase).multiply(q);
      }
    },
  };
}
