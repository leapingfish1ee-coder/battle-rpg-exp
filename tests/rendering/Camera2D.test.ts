import { describe, expect, it } from 'vitest';
import { Camera2D } from '../../src/rendering/camera/Camera2D';

describe('Camera2D', () => {
  it('snaps to the first target and then follows smoothly', () => {
    const camera = new Camera2D();
    camera.update(100, 50, 1 / 60);
    expect(camera.position()).toEqual({ x: 100, y: 50 });

    camera.update(200, 50, 1 / 60);
    const followed = camera.position();
    expect(followed.x).toBeGreaterThan(100);
    expect(followed.x).toBeLessThan(200);
    expect(followed.y).toBe(50);
  });

  it('converges on a stationary target', () => {
    const camera = new Camera2D();
    camera.update(0, 0, 1 / 60);

    for (let frame = 0; frame < 120; frame += 1) {
      camera.update(240, -120, 1 / 60);
    }

    expect(camera.position().x).toBeCloseTo(240, 3);
    expect(camera.position().y).toBeCloseTo(-120, 3);
  });

  it('maps the camera center to the viewport center', () => {
    const camera = new Camera2D();
    camera.update(320, 180, 1 / 60);

    expect(camera.worldToScreen(320, 180, 800, 600)).toEqual({ x: 400, y: 300 });
    expect(camera.worldToScreen(420, 130, 800, 600)).toEqual({ x: 500, y: 250 });
  });
});
