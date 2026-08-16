import type {
  EnemyRuntime,
  ProjectileImpactRuntime,
  ProjectileRuntime,
} from './RuntimeTypes';

const EPSILON = 1e-12;
const IMPACT_DURATION_SECONDS = 0.14;
const CHASER_IMPULSE_SPEED = 155;
const MIN_DAMAGE_ENERGY_FACTOR = 0.35;

const segmentCircleHit = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  centerX: number,
  centerY: number,
  radius: number,
): number | undefined => {
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared <= EPSILON) {
    return Math.hypot(centerX - startX, centerY - startY) <= radius ? 0 : undefined;
  }

  const projection = Math.min(
    Math.max(
      ((centerX - startX) * segmentX + (centerY - startY) * segmentY) / lengthSquared,
      0,
    ),
    1,
  );
  const closestX = startX + segmentX * projection;
  const closestY = startY + segmentY * projection;
  return Math.hypot(centerX - closestX, centerY - closestY) <= radius ? projection : undefined;
};

export const projectileKineticEnergy = (projectile: ProjectileRuntime, speed: number): number =>
  0.5 * Math.max(projectile.massScale, 0) * speed * speed;

export const projectileEnergyRatio = (projectile: ProjectileRuntime, speed: number): number => {
  const initialEnergy = projectileKineticEnergy(projectile, projectile.initialSpeed);
  if (initialEnergy <= EPSILON) return 0;
  return Math.min(Math.max(projectileKineticEnergy(projectile, speed) / initialEnergy, 0), 1);
};

export class ProjectileSystem {
  public step(
    projectiles: ProjectileRuntime[],
    enemies: EnemyRuntime[],
    impacts: ProjectileImpactRuntime[],
    deltaSeconds: number,
    allocateImpactId: () => number,
  ): ProjectileRuntime[] {
    const delta = Math.max(deltaSeconds, 0);
    const survivors: ProjectileRuntime[] = [];

    for (const projectile of projectiles) {
      const startX = projectile.position.x;
      const startY = projectile.position.y;
      const startSpeed = Math.hypot(projectile.velocity.x, projectile.velocity.y);
      const drag = Math.max(projectile.dragPerSecond, 0);
      const dragFactor = Math.exp(-drag * delta);
      const displacementSeconds = drag > EPSILON ? (1 - dragFactor) / drag : delta;
      const endX = startX + projectile.velocity.x * displacementSeconds;
      const endY = startY + projectile.velocity.y * displacementSeconds;
      let hitEnemy: EnemyRuntime | undefined;
      let hitT = Number.POSITIVE_INFINITY;

      for (const enemy of enemies) {
        if (enemy.health <= 0) continue;
        const candidateT = segmentCircleHit(
          startX,
          startY,
          endX,
          endY,
          enemy.position.x,
          enemy.position.y,
          enemy.radius + projectile.radius,
        );

        if (candidateT !== undefined && candidateT < hitT) {
          hitEnemy = enemy;
          hitT = candidateT;
        }
      }

      if (hitEnemy) {
        projectile.position.x = startX + (endX - startX) * hitT;
        projectile.position.y = startY + (endY - startY) * hitT;

        const hitSpeed = startSpeed * Math.exp(-drag * delta * hitT);
        const energyRatio = projectileEnergyRatio(projectile, hitSpeed);
        const momentumRatio = projectile.initialSpeed > EPSILON ? hitSpeed / projectile.initialSpeed : 0;
        const directionScale = hitSpeed > EPSILON ? 1 / hitSpeed : 0;
        const directionX = projectile.velocity.x * directionScale;
        const directionY = projectile.velocity.y * directionScale;
        const damageScale = MIN_DAMAGE_ENERGY_FACTOR + (1 - MIN_DAMAGE_ENERGY_FACTOR) * energyRatio;
        hitEnemy.health -= projectile.basePower * damageScale;

        if (hitEnemy.behavior === 'chaser') {
          const impulse = CHASER_IMPULSE_SPEED * projectile.massScale * momentumRatio;
          hitEnemy.impulseVelocity.x += directionX * impulse;
          hitEnemy.impulseVelocity.y += directionY * impulse;
        }

        impacts.push({
          id: allocateImpactId(),
          position: { x: projectile.position.x, y: projectile.position.y },
          direction: { x: directionX, y: directionY },
          energyRatio,
          durationSeconds: IMPACT_DURATION_SECONDS,
          remainingSeconds: IMPACT_DURATION_SECONDS,
        });
        continue;
      }

      projectile.position.x = endX;
      projectile.position.y = endY;
      projectile.velocity.x *= dragFactor;
      projectile.velocity.y *= dragFactor;
      projectile.remainingSeconds -= delta;

      if (projectile.remainingSeconds > 0) {
        survivors.push(projectile);
      }
    }

    return survivors;
  }
}
