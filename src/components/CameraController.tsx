import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, MathUtils, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import {
  CAMERA_MAX_RADIUS,
  CAMERA_MIN_RADIUS,
  DOLLY_FRACTION,
  MIN_DOLLY_STEP,
} from '../data/constants';
import { bodyRegistry } from '../state/simulation';

const FORWARD = new Vector3();
const RIGHT = new Vector3();
const BODY_POS = new Vector3();
const TARGET = new Vector3();
const TO_BODY = new Vector3();
const WORLD_DIR = new Vector3();
const SPIN_QUAT = new Quaternion();
const EULER = new Euler(0, 0, 0, 'YXZ');

function halfFovTan(camera: PerspectiveCamera): number {
  return Math.tan((camera.fov * Math.PI) / 360);
}

/** Distance to the nearest body surface — drives pan and vertical speed. */
function nearestSurfaceDistance(camera: PerspectiveCamera): number {
  if (bodyRegistry.size === 0) {
    return MathUtils.clamp(camera.position.length(), CAMERA_MIN_RADIUS, CAMERA_MAX_RADIUS);
  }

  let nearest = CAMERA_MAX_RADIUS;
  for (const h of bodyRegistry.values()) {
    h.orbitGroup.getWorldPosition(BODY_POS);
    const surface = camera.position.distanceTo(BODY_POS) - h.radiusUnits;
    nearest = Math.min(nearest, Math.max(surface, 0.3));
  }
  return nearest;
}

function panStep(camera: PerspectiveCamera): number {
  return nearestSurfaceDistance(camera) * halfFovTan(camera) * 0.004;
}

/** Nearest ray–sphere hit distance along the view axis; null if no body in front. */
function nearestHitDistance(camera: PerspectiveCamera): number | null {
  camera.getWorldDirection(FORWARD);
  let best: number | null = null;

  for (const h of bodyRegistry.values()) {
    h.orbitGroup.getWorldPosition(BODY_POS);
    const r = h.radiusUnits;
    TO_BODY.subVectors(camera.position, BODY_POS);
    const b = TO_BODY.dot(FORWARD);
    const disc = b * b - TO_BODY.lengthSq() + r * r;
    if (disc < 0) continue;
    const t = -b - Math.sqrt(disc);
    if (t > 0.05 && (best === null || t < best)) best = t;
  }
  return best;
}

/** Proportional dolly step along the view axis. */
function dollyStepAlongView(camera: PerspectiveCamera): number {
  const hit = nearestHitDistance(camera);
  const base = hit ?? camera.position.length();
  return Math.max(MIN_DOLLY_STEP, base * DOLLY_FRACTION);
}

/** Push camera outside any body it ended up inside after a dolly. */
function resolveBodyPenetration(camera: PerspectiveCamera) {
  for (const h of bodyRegistry.values()) {
    h.orbitGroup.getWorldPosition(BODY_POS);
    const minDist = h.radiusUnits * 1.2;
    TO_BODY.subVectors(camera.position, BODY_POS);
    const dist = TO_BODY.length();
    if (dist < minDist && dist > 1e-8) {
      TO_BODY.multiplyScalar(minDist / dist);
      camera.position.copy(BODY_POS).add(TO_BODY);
    }
  }
}

interface FocusState {
  id: string;
  localDir: Vector3;
  dist: number;
  distNow: number;
  t: number;
  from: Vector3;
}

export function CameraController({ focusedId }: { focusedId: string | null }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef({ up: false, down: false });
  const drag = useRef<{ button: number; x: number; y: number } | null>(null);
  const focus = useRef<FocusState | null>(null);

  const syncAnglesFromCamera = () => {
    EULER.setFromQuaternion(camera.quaternion, 'YXZ');
    yaw.current = EULER.y;
    pitch.current = EULER.x;
  };

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    syncAnglesFromCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return;
      drag.current = { button: e.button, x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;

      if (d.button === 2) {
        if (focus.current) {
          const dir = focus.current.localDir;
          const theta = Math.atan2(dir.x, dir.z) - dx * 0.006;
          const phi = MathUtils.clamp(
            Math.acos(MathUtils.clamp(dir.y, -1, 1)) - dy * 0.006,
            0.2,
            Math.PI - 0.2,
          );
          dir.setFromSphericalCoords(1, phi, theta);
        } else {
          yaw.current -= dx * 0.0034;
          pitch.current = MathUtils.clamp(pitch.current - dy * 0.0034, -1.55, 1.55);
        }
      } else if (d.button === 0 && !focus.current) {
        const persp = camera as PerspectiveCamera;
        const s = panStep(persp);
        RIGHT.set(1, 0, 0).applyQuaternion(camera.quaternion);
        RIGHT.y = 0;
        RIGHT.normalize();
        FORWARD.set(0, 0, -1).applyQuaternion(camera.quaternion);
        FORWARD.y = 0;
        if (FORWARD.lengthSq() < 1e-6) {
          FORWARD.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
        }
        FORWARD.normalize();
        camera.position.addScaledVector(RIGHT, -dx * s);
        camera.position.addScaledVector(FORWARD, dy * s);
      }
    };

    const endDrag = () => {
      drag.current = null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sign = Math.sign(e.deltaY);
      const f = focus.current;

      if (f) {
        const h = bodyRegistry.get(f.id);
        const minDist = h ? h.radiusUnits * 1.6 : 1;
        const maxDist = h ? Math.max(h.radiusUnits * 90, 40) : 500;
        f.dist = MathUtils.clamp(f.dist * (1 + 0.14 * sign), minDist, maxDist);
        return;
      }

      const persp = camera as PerspectiveCamera;
      const zoomIn = sign < 0;
      const step = dollyStepAlongView(persp);
      camera.getWorldDirection(FORWARD);
      camera.position.addScaledVector(FORWARD, zoomIn ? step : -step);
      resolveBodyPenetration(persp);
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        keys.current.up = true;
      } else if (e.key === 'Shift') {
        keys.current.down = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') keys.current.up = false;
      else if (e.key === 'Shift') keys.current.down = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera]);

  useEffect(() => {
    if (focusedId) {
      const h = bodyRegistry.get(focusedId);
      if (!h) return;
      h.orbitGroup.getWorldPosition(BODY_POS);
      WORLD_DIR.subVectors(camera.position, BODY_POS);
      if (WORLD_DIR.lengthSq() < 1e-8) WORLD_DIR.set(0.4, 0.25, 1);
      WORLD_DIR.normalize();
      if (WORLD_DIR.y < 0.12) {
        WORLD_DIR.y = 0.12;
        WORLD_DIR.normalize();
      }
      h.spinAnchor.getWorldQuaternion(SPIN_QUAT);
      const localDir = WORLD_DIR.clone().applyQuaternion(SPIN_QUAT.invert());
      const distNow = camera.position.distanceTo(BODY_POS);
      focus.current = {
        id: focusedId,
        localDir,
        dist: Math.max(h.radiusUnits * 4.2, h.radiusUnits + 0.9),
        distNow,
        t: 0,
        from: camera.position.clone(),
      };
    } else if (focus.current) {
      focus.current = null;
      syncAnglesFromCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId, camera]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const f = focus.current;

    if (f) {
      const h = bodyRegistry.get(f.id);
      if (!h) return;
      h.orbitGroup.getWorldPosition(BODY_POS);
      h.spinAnchor.getWorldQuaternion(SPIN_QUAT);
      f.distNow += (f.dist - f.distNow) * Math.min(1, dt * 8);
      WORLD_DIR.copy(f.localDir).applyQuaternion(SPIN_QUAT);
      TARGET.copy(WORLD_DIR).multiplyScalar(f.distNow).add(BODY_POS);
      if (f.t < 1) {
        f.t = Math.min(1, f.t + dt / 0.85);
        const k = f.t * f.t * (3 - 2 * f.t);
        camera.position.lerpVectors(f.from, TARGET, k);
      } else {
        camera.position.copy(TARGET);
      }
      camera.lookAt(BODY_POS);
      return;
    }

    camera.quaternion.setFromEuler(EULER.set(pitch.current, yaw.current, 0, 'YXZ'));

    const persp = camera as PerspectiveCamera;
    const verticalSpeed = nearestSurfaceDistance(persp) * 0.35;
    if (keys.current.up) camera.position.y += verticalSpeed * dt;
    if (keys.current.down) camera.position.y -= verticalSpeed * dt;

    const len = camera.position.length();
    if (len < CAMERA_MIN_RADIUS) camera.position.setLength(CAMERA_MIN_RADIUS);
    else if (len > CAMERA_MAX_RADIUS) camera.position.setLength(CAMERA_MAX_RADIUS);
  }, -5);

  return null;
}
