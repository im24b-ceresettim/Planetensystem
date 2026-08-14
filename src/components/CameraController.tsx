import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { CAMERA_MAX_RADIUS, CAMERA_MIN_RADIUS } from '../data/constants';
import { bodyRegistry } from '../state/simulation';

const FORWARD = new Vector3();
const RIGHT = new Vector3();
const BODY_POS = new Vector3();
const TARGET = new Vector3();
const EULER = new Euler(0, 0, 0, 'YXZ');

function panScalePerPixel(camera: PerspectiveCamera, canvasHeight: number): number {
  const dist = MathUtils.clamp(camera.position.length(), CAMERA_MIN_RADIUS, CAMERA_MAX_RADIUS);
  const fovRad = (camera.fov * Math.PI) / 180;
  return (dist * 2 * Math.tan(fovRad / 2)) / canvasHeight;
}

interface FocusState {
  id: string;
  /** World-space unit vector pointing from the body towards the camera. */
  dir: Vector3;
  /** Desired camera distance from the body centre. */
  dist: number;
  /** Smoothed actual distance (eases towards `dist`). */
  distNow: number;
  /** Fly-in transition progress, 0..1. */
  t: number;
  from: Vector3;
}

export function CameraController({ selectedId }: { selectedId: string | null }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef({ up: false, down: false });
  const drag = useRef<{ button: number; x: number; y: number } | null>(null);
  const wheelImpulse = useRef(0);
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

  // ------------------------------------------------------- input listeners
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
          // Orbit the attachment point around the focused body.
          const dir = focus.current.dir;
          const theta = Math.atan2(dir.x, dir.z) - dx * 0.006;
          const phi = MathUtils.clamp(
            Math.acos(MathUtils.clamp(dir.y, -1, 1)) + dy * 0.006,
            0.2,
            Math.PI - 0.2,
          );
          dir.setFromSphericalCoords(1, phi, theta);
        } else {
          yaw.current -= dx * 0.0034;
          pitch.current = MathUtils.clamp(pitch.current - dy * 0.0034, -1.55, 1.55);
        }
      } else if (d.button === 0 && !focus.current) {
        // Horizontal pan: grab space and drag it along the XZ plane.
        const s = panScalePerPixel(camera as PerspectiveCamera, el.clientHeight);
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
      } else {
        wheelImpulse.current += -sign * MathUtils.clamp(camera.position.length() * 0.13, 0.5, 420);
      }
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

  // ------------------------------------------------- focus enter / leave
  useEffect(() => {
    if (selectedId) {
      const h = bodyRegistry.get(selectedId);
      if (!h) return;
      h.orbitGroup.getWorldPosition(BODY_POS);
      const dir = camera.position.clone().sub(BODY_POS);
      if (dir.lengthSq() < 1e-8) dir.set(0.4, 0.25, 1);
      dir.normalize();
      if (dir.y < 0.12) {
        // Approach slightly from above for a nicer framing.
        dir.y = 0.12;
        dir.normalize();
      }
      focus.current = {
        id: selectedId,
        dir,
        dist: Math.max(h.radiusUnits * 4.2, h.radiusUnits + 0.9),
        distNow: camera.position.distanceTo(BODY_POS),
        t: 0,
        from: camera.position.clone(),
      };
    } else if (focus.current) {
      focus.current = null;
      // Continue free flight seamlessly from the current orientation.
      syncAnglesFromCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, camera]);

  // ------------------------------------------------------------ per frame
  // Priority -5: runs after SolarSystem (-10) moved the bodies.
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const f = focus.current;

    if (f) {
      const h = bodyRegistry.get(f.id);
      if (!h) return;
      h.orbitGroup.getWorldPosition(BODY_POS);
      f.distNow += (f.dist - f.distNow) * Math.min(1, dt * 8);
      TARGET.copy(f.dir).multiplyScalar(f.distNow).add(BODY_POS);
      if (f.t < 1) {
        f.t = Math.min(1, f.t + dt / 0.85);
        const k = f.t * f.t * (3 - 2 * f.t); // smoothstep ease
        camera.position.lerpVectors(f.from, TARGET, k);
      } else {
        camera.position.copy(TARGET);
      }
      camera.lookAt(BODY_POS);
      return;
    }

    camera.quaternion.setFromEuler(EULER.set(pitch.current, yaw.current, 0, 'YXZ'));

    const dist = camera.position.length();
    const moveSpeed = MathUtils.clamp(dist * 0.35, 3, 700);
    if (keys.current.up) camera.position.y += moveSpeed * dt;
    if (keys.current.down) camera.position.y -= moveSpeed * dt;

    if (Math.abs(wheelImpulse.current) > 0.001) {
      const step = wheelImpulse.current * Math.min(1, dt * 9);
      camera.getWorldDirection(FORWARD);
      camera.position.addScaledVector(FORWARD, step);
      wheelImpulse.current -= step;
    }

    const len = camera.position.length();
    if (len < CAMERA_MIN_RADIUS) camera.position.setLength(CAMERA_MIN_RADIUS);
    else if (len > CAMERA_MAX_RADIUS) camera.position.setLength(CAMERA_MAX_RADIUS);
  }, -5);

  return null;
}
