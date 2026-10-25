import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * « Impossible Architecture » — scène d'ouverture, 100 % procédurale.
 * Un monolithe facetté flotte au centre d'un gimbal d'anneaux d'argent,
 * dans une colonnade circulaire qui se perd dans le brouillard.
 * La lumière révèle progressivement la géométrie ; le défilement fait
 * entrer la caméra dans l'anneau (transition vers la section suivante).
 *
 * Module impératif chargé à la demande (import dynamique) : aucune
 * dépendance React, une seule boucle de rendu, nettoyage complet.
 */

export type Quality = "high" | "low";

export interface SceneOptions {
  quality: Quality;
  /** Mouvement réduit : état final directement, aucune animation continue. */
  reduced: boolean;
  onFirstFrame?: () => void;
}

export interface SceneHandle {
  setScroll(progress: number): void;
  setPointer(x: number, y: number): void;
  setActive(active: boolean): void;
  resize(): void;
  dispose(): void;
}

const INTRO_MS = 3200;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function createMonolithScene(canvas: HTMLCanvasElement, options: SceneOptions): SceneHandle {
  const { quality, reduced } = options;
  const high = quality === "high";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: high,
    alpha: true,
    powerPreference: "high-performance",
  });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.25);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.045);

  // Environnement studio procédural : reflets métalliques sans fichier externe.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = reduced ? 0.85 : 0;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);

  const world = new THREE.Group();
  scene.add(world);

  // ── Matériaux ────────────────────────────────────────────────
  const silver = new THREE.MeshStandardMaterial({ color: 0xc6c6cc, metalness: 1, roughness: 0.22 });
  const blackMetal = new THREE.MeshStandardMaterial({
    color: 0x0c0c0e,
    metalness: 1,
    roughness: 0.16,
    flatShading: true,
  });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x1a1a1d, metalness: 0.9, roughness: 0.42 });
  const volt = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: 0xd8ff3d,
    emissiveIntensity: 1.6,
    metalness: 0.2,
    roughness: 0.5,
  });

  // ── Monolithe facetté ───────────────────────────────────────
  const monolithGeometry = new THREE.OctahedronGeometry(1, 0);
  const monolith = new THREE.Mesh(monolithGeometry, blackMetal);
  monolith.scale.set(0.95, 1.85, 0.95);
  world.add(monolith);

  // Arêtes argent du monolithe : la lumière « dessine » la géométrie.
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(monolithGeometry),
    new THREE.LineBasicMaterial({ color: 0xc6c6cc, transparent: true, opacity: 0 }),
  );
  edges.scale.copy(monolith.scale).multiplyScalar(1.002);
  world.add(edges);

  // ── Gimbal d'anneaux ─────────────────────────────────────────
  const ringSpecs = [
    { radius: 2.15, tube: 0.05, tilt: [Math.PI / 2, 0, 0], speed: [0.0, 0.0, 0.18] },
    { radius: 2.75, tube: 0.022, tilt: [Math.PI / 2.6, 0.4, 0], speed: [0.09, 0.0, -0.06] },
    { radius: 3.45, tube: 0.07, tilt: [0.2, Math.PI / 2, 0], speed: [0.0, 0.07, 0.03] },
    { radius: 4.3, tube: 0.016, tilt: [Math.PI / 2.1, -0.25, 0.3], speed: [-0.04, 0.0, 0.05] },
  ];
  const rings = ringSpecs.map((spec, index) => {
    const geometry = new THREE.TorusGeometry(spec.radius, spec.tube, high ? 24 : 12, high ? 220 : 120);
    const mesh = new THREE.Mesh(geometry, index === 3 ? graphite : silver);
    mesh.rotation.set(spec.tilt[0], spec.tilt[1], spec.tilt[2]);
    const pivot = new THREE.Group();
    pivot.add(mesh);
    world.add(pivot);
    return { pivot, mesh, spec };
  });

  // Fil électrique : un unique arc d'accent, très fin, sur l'anneau principal.
  const accentArc = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.012, 8, 120, Math.PI * 0.42), volt);
  rings[0].mesh.add(accentArc);
  accentArc.position.z = 0.055;

  // ── Colonnade circulaire (instanciée : un seul appel de dessin) ─
  const columnCount = high ? 64 : 28;
  const column = new THREE.BoxGeometry(0.22, 1, 0.9);
  const colonnade = new THREE.InstancedMesh(column, graphite, columnCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < columnCount; i++) {
    const angle = (i / columnCount) * Math.PI * 2;
    const radius = 17;
    // Hauteurs en motif régulier (pas d'aléatoire : composition stable).
    const height = 6 + Math.abs(Math.sin(i * 1.7)) * 12;
    dummy.position.set(Math.cos(angle) * radius, -3.2 + height / 2, Math.sin(angle) * radius);
    dummy.rotation.set(0, -angle, 0);
    dummy.scale.set(1, height, 1);
    dummy.updateMatrix();
    colonnade.setMatrixAt(i, dummy.matrix);
  }
  scene.add(colonnade);

  // ── Sol miroir sombre ────────────────────────────────────────
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(24, high ? 64 : 32),
    new THREE.MeshStandardMaterial({ color: 0x08080a, metalness: 0.85, roughness: 0.38 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.2;
  scene.add(floor);

  // ── Poussière en suspension ──────────────────────────────────
  const dustCount = high ? 700 : 240;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    // Distribution déterministe (suite de Halton) : pas de scintillement entre rechargements.
    const u = halton(i + 1, 2);
    const v = halton(i + 1, 3);
    const w = halton(i + 1, 5);
    const r = 1.5 + u * 8;
    const theta = v * Math.PI * 2;
    dustPositions[i * 3] = Math.cos(theta) * r;
    dustPositions[i * 3 + 1] = -3 + w * 9;
    dustPositions[i * 3 + 2] = Math.sin(theta) * r;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xc6c6cc,
      size: high ? 0.028 : 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(dust);

  // ── Lumières ────────────────────────────────────────────────
  const key = new THREE.DirectionalLight(0xffffff, 0);
  key.position.set(-6, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xdfe7ff, 0, 30, 1.6);
  rim.position.set(4, 3, -6);
  scene.add(rim);
  const under = new THREE.PointLight(0xd8ff3d, 0, 12, 2);
  under.position.set(0, -2.6, 1.5);
  scene.add(under);

  // ── État ─────────────────────────────────────────────────────
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scroll = 0;
  let scrollEased = 0;
  let active = true;
  let frame = 0;
  let disposed = false;
  let firstFrame = false;
  let compact = false;
  const start = performance.now();
  let last = start;
  let slowFrames = 0;
  let sampled = 0;

  function layout() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    compact = width < 768;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = compact ? 42 : 32;
    camera.updateProjectionMatrix();
    // Desktop : la structure s'installe à droite du titre. Mobile : centrée, plus haute.
    world.position.set(compact ? 0 : 3, compact ? 1.1 : 0.15, 0);
  }

  function render(now: number) {
    const elapsed = now - start;
    const intro = reduced ? 1 : Math.min(elapsed / INTRO_MS, 1);
    const reveal = easeOutExpo(intro);
    const time = reduced ? 0 : elapsed / 1000;

    // Lumière qui révèle la géométrie.
    scene.environmentIntensity = 0.85 * reveal;
    key.intensity = 2.4 * reveal;
    rim.intensity = 40 * easeInOutCubic(Math.min(intro * 1.4, 1));
    under.intensity = 6 * reveal;
    (edges.material as THREE.LineBasicMaterial).opacity = 0.55 * easeInOutCubic(Math.max(0, intro * 1.6 - 0.6));
    (dust.material as THREE.PointsMaterial).opacity = 0.55 * reveal;

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    scrollEased += (scroll - scrollEased) * (reduced ? 1 : 0.09);
    const s = easeInOutCubic(scrollEased);

    // Anneaux : mise en place pendant l'ouverture, puis rotation lente et continue.
    rings.forEach(({ pivot, spec }, index) => {
      const settle = 1 - reveal;
      pivot.rotation.x = spec.speed[0] * time + settle * (0.6 + index * 0.3);
      pivot.rotation.y = spec.speed[1] * time + settle * (index % 2 ? -0.8 : 0.8);
      pivot.rotation.z = spec.speed[2] * time;
      pivot.scale.setScalar(lerp(0.82, 1, reveal) * (1 + s * (0.35 + index * 0.18)));
    });
    monolith.rotation.y = time * 0.12 + (1 - reveal) * 1.2;
    monolith.position.y = Math.sin(time * 0.6) * 0.08 + s * 0.6;
    edges.rotation.copy(monolith.rotation);
    edges.position.copy(monolith.position);
    colonnade.rotation.y = time * 0.01;
    dust.rotation.y = time * 0.02;

    // Caméra : travelling d'ouverture, parallaxe du pointeur, plongée dans l'anneau au défilement.
    const baseZ = compact ? 13 : 10;
    camera.position.set(
      world.position.x * s + pointer.x * 0.6,
      0.4 + pointer.y * -0.35 + s * 0.5,
      lerp(baseZ + 4, baseZ, reveal) - s * (baseZ - 2.6),
    );
    camera.lookAt(world.position.x * (0.3 + s * 0.7), world.position.y * 0.6 + s * 0.4, 0);

    renderer.render(scene, camera);

    if (!firstFrame) {
      firstFrame = true;
      options.onFirstFrame?.();
    }
  }

  function loop(now: number) {
    if (disposed || !active) {
      frame = 0;
      return;
    }
    // Qualité adaptative : si l'appareil peine, on réduit la définition.
    const delta = now - last;
    last = now;
    if (sampled < 120) {
      sampled++;
      if (delta > 26) slowFrames++;
      if (sampled === 120 && slowFrames > 50 && pixelRatio > 1) {
        pixelRatio = 1;
        renderer.setPixelRatio(pixelRatio);
        layout();
      }
    }
    render(now);
    frame = requestAnimationFrame(loop);
  }

  layout();
  if (reduced) {
    render(performance.now());
  } else {
    frame = requestAnimationFrame(loop);
  }

  return {
    setScroll(progress) {
      scroll = progress;
      if (reduced && !disposed) render(performance.now());
    },
    setPointer(x, y) {
      if (reduced) return;
      pointer.tx = x;
      pointer.ty = y;
    },
    setActive(value) {
      if (active === value) return;
      active = value;
      if (active && !reduced && !frame && !disposed) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    },
    resize() {
      layout();
      if (reduced || !active) render(performance.now());
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose();
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

function halton(index: number, base: number) {
  let result = 0;
  let fraction = 1 / base;
  let i = index;
  while (i > 0) {
    result += (i % base) * fraction;
    i = Math.floor(i / base);
    fraction /= base;
  }
  return result;
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const weakMemory = (nav.deviceMemory ?? 8) <= 4;
  return coarse || weakCpu || weakMemory || nav.connection?.saveData ? "low" : "high";
}
