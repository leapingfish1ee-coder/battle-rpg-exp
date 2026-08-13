# PixiJS 2D 客户端架构基线

Status: Active  
Scope: Browser 2D RPG client  
Renderer: PixiJS v8

## 1. 架构目标

PixiJS 只承担 GPU 渲染、Scene Graph、纹理、文本和有限交互能力，游戏规则、状态、网络协议和业务逻辑不得依赖 PixiJS 类型。

## 2. 分层

```text
platform
  ↓
application
  ↓
game-domain
  ↓
simulation
  ↓
presentation
  ↓
rendering

infrastructure ──> application/domain ports
```

依赖规则：

- `domain/` 与 `simulation/` 禁止 import `pixi.js`、DOM、WebSocket 和具体存储实现。
- `presentation/` 是 Simulation 与 PixiJS 之间唯一状态映射边界。
- `rendering/` 只处理表现，不计算伤害、碰撞规则、经济或权威状态。
- `infrastructure/` 通过接口提供网络、缓存、Telemetry、配置和第三方 SDK 能力。

## 3. 推荐源码结构

```text
src/
  app/
  platform/
  domain/
    player/
    combat/
    skill/
    inventory/
    map/
  simulation/
    world/
    components/
    systems/
    scheduler/
    clock/
    rng/
    snapshot/
  presentation/
  rendering/
    pixi-app/
    camera/
    layers/
    views/
    animation/
    effects/
    particles/
    text/
    debug/
  assets/
  input/
  network/
  audio/
  ui/
  telemetry/
  workers/
  shared/
```

## 4. 主数据流

```text
Browser Input
  → InputState
  → Semantic Command
  → Fixed-step Simulation
  → Game State
  → Presentation Snapshot
  → PixiJS Scene Graph
  → Renderer
```

数据流保持单向，Sprite、Container、Texture 等表现对象不得反向成为领域状态来源。

## 5. 游戏循环

- Simulation 使用固定时间步长，推荐 60 Hz；计算量明显受限时可降至 30 Hz。
- Renderer 使用 `requestAnimationFrame` 独立运行。
- Render FPS、Simulation tick rate 与 Network snapshot rate 相互独立。
- Renderer 使用前后两个 simulation snapshot 做 interpolation，不使用可变 delta 推进核心规则。
- PixiJS Ticker 只作为表现层帧调度器，不让大量业务对象各自注册 callback。

伪代码：

```ts
let accumulator = 0;
let previous = performance.now();
const fixedDt = 1 / 60;

function frame(now: number) {
  const frameDt = Math.min((now - previous) / 1000, 0.25);
  previous = now;
  accumulator += frameDt;

  input.capture();

  while (accumulator >= fixedDt) {
    simulation.step(fixedDt, input.commands());
    snapshots.commit(simulation.state());
    accumulator -= fixedDt;
  }

  const alpha = accumulator / fixedDt;
  presentation.update(snapshots.previous, snapshots.current, alpha);
  renderer.render(presentation.state);

  requestAnimationFrame(frame);
}
```

## 6. Domain 与 Simulation

- Domain 使用普通 TypeScript 数据结构定义 Entity ID、角色属性、技能、Buff、库存、关卡和规则。
- 高频同类动态实体采用轻量 ECS，Entity 为整数 ID，Component 只存数据，System 批量处理。
- 玩家、怪物、弹丸、掉落物、地图动态对象适合 ECS；菜单、剧情流程和少量复杂控制器可以保留普通对象或状态机。
- Simulation 只读取 `SimulationClock`，确定性逻辑使用显式 seed 的 RNG。
- 可重放测试以固定输入、固定 seed、固定 tick 数比较最终 State Hash。

## 7. Presentation

Presentation 将逻辑状态转换为视觉状态，主要职责包括：

- world position → interpolated render position；
- semantic animation state → spritesheet animation；
- domain event → particle、floating text、camera shake、audio cue；
- entity visibility → view creation/culling；
- gameplay selection → outline/highlight；
- Simulation ID → Pixi View ID 映射。

Presentation 不改变 Simulation 真值。

## 8. PixiJS Rendering

Stage 建议保持少量稳定根层：

```text
stage
  backgroundLayer
  worldLayer
  effectLayer
  foregroundLayer
  hudLayer
  debugLayer
```

- Camera 只修改 `worldLayer` 的视觉变换，Simulation 永远使用世界坐标。
- 显式区分 screen、viewport、world、local 四套坐标空间。
- DisplayObject 的父子关系只表达渲染组织，不表达领域所有权。
- 角色名字、选中框和跨层特效优先使用 Render Layer，而不是频繁重挂 Container。

## 9. Entity View

`EntityViewSystem` 根据 Entity ID 管理 PixiJS View：

```text
Entity 1042
  ↕ mapping
CharacterView
  Container
    Shadow Sprite
    Body AnimatedSprite
    Weapon Sprite
    Status Effect Container
```

View 生命周期与 Entity 生命周期解耦，高 churn View 使用 Pool 重用；回收时必须清理事件监听、parent、texture、filter、alpha、scale、animation 和自定义状态。

## 10. 输入

- Pointer、Keyboard、Touch 和 Gamepad 首先归一化为 `InputState`。
- Input Mapper 将物理输入转换为 Move、Attack、Interact、Select 等语义 Command。
- Simulation 不知道鼠标键、触点或具体键码。
- 高密度单位选择使用空间索引 hit-test，而不是让所有 DisplayObject 进入 PixiJS interaction 扫描。

## 11. 地图

- Tile Map 按 Chunk 组织，Chunk 是加载、culling、缓存和销毁的基本单位。
- 地图逻辑数据、碰撞数据和视觉数据分离。
- Camera 周围只维护有限 Chunk 环形工作集。
- 大世界使用 spatial hash、uniform grid 或 quadtree 管理可见实体、碰撞候选和选择候选。

## 12. 资源系统

所有资源通过 `AssetService` 和 manifest 获取，业务代码禁止硬编码任意 CDN URL。

Bundle 建议：

```text
boot
common
lobby
level-*
character-*
optional-*
```

原则：

- 当前场景达到可玩状态后后台加载高概率下一 Bundle。
- 小 Sprite 合并为 Texture Atlas/Spritesheet。
- 大型纹理密集场景评估 KTX2/Basis。
- 资源按 Scene/Bundle 建立 ownership 并在 dispose 时释放。
- 文件使用 content hash 和 immutable CDN cache。

## 13. Scene 生命周期

Scene 不是 PixiJS Container 的别名，而是生命周期边界：

```text
prepare → load → enter → active → suspend → exit → dispose
```

每个 Scene 拥有自己的 Simulation Context、Presentation Context、Render Root、Asset Scope、Input Scope 与 Disposable Scope。

## 14. Worker

默认主线程保留 PixiJS Renderer；当 AI、寻路、地图解析、程序生成或 Simulation 明确成为 CPU 瓶颈时，再迁入 Worker。

Worker 与主线程通过 command/snapshot 通信，禁止直接跨线程共享复杂对象图；只有经过 profiling 证明必要时再采用 SharedArrayBuffer。

## 15. 网络

联网模式下状态至少拆分为：

```text
confirmedState
predictedState
presentationState
```

- Client 发送 Input/Command，不发送最终伤害、掉落或位置裁决。
- Server snapshot 更新 confirmed state。
- Client 对未确认输入进行 replay/reconciliation 得到 predicted state。
- 其他实体通过 interpolation/extrapolation 平滑表现。
- 协议只传 DTO、Command、Event、Snapshot，禁止传 PixiJS 对象和完整 class graph。
- 高频状态采用二进制协议并尽量做 delta/quantization。

## 16. UI

- 世界 HUD、血条、浮字等可使用 PixiJS。
- 登录、账号、支付、复杂表单和高无障碍要求界面优先使用 DOM UI。
- 应用级状态库只管理账号、页面和低频 UI，不承载 Position、Velocity、Projectile 等逐 tick 状态。

## 17. 性能策略

60 FPS 单帧总预算约 16.67 ms，必须分别监控 Simulation、Presentation、Pixi update、GPU render 与浏览器余量。

基础指标：

- FPS 与 p50/p95/p99 frame time；
- simulation tick cost；
- entity/visible entity count；
- draw calls；
- long tasks；
- asset load latency；
- RTT、jitter、disconnect reason；
- 纹理和 JS heap 代理指标。

优化优先级：

1. application-level culling；
2. atlas 与批处理；
3. 高频对象池；
4. Chunk 工作集控制；
5. 降低 render resolution/DPR；
6. 降低粒子和后处理；
7. profiling 后再引入 Worker/共享内存。

## 18. 质量等级

启动阶段建立 `DeviceProfile`，至少区分 low/medium/high，并控制：

- renderer resolution；
- DPR 上限；
- 粒子数量；
- 特效质量；
- 动画采样率；
- 资源分辨率；
- 同屏装饰数量。

Renderer resolution 不机械等于 `devicePixelRatio`。

## 19. 测试

- Domain/Simulation 在 Node/headless 环境执行纯单元测试。
- Presentation 使用 state mapping 测试。
- Renderer 只做有限视觉回归。
- Playwright 覆盖启动、输入、Scene transition、浏览器兼容性和关键流程。
- Simulation 必须具备 deterministic replay 测试路径。

## 20. 静态架构约束

通过 ESLint `no-restricted-imports` 等规则强制以下约束：

```text
domain      !-> pixi.js / rendering / network / DOM
simulation  !-> pixi.js / rendering / network / DOM
presentation -> domain + simulation contracts
rendering   -> presentation + pixi.js
network     -> protocol DTO only
```

架构边界由工具验证，不依赖代码评审人员记忆。

## 21. 发布与版本

分别维护：

- Client Build Version；
- Asset Manifest Version；
- Protocol Version；
- Save Schema Version。

HTML 与版本 manifest 使用短缓存或 revalidate，带 hash 的 JS、atlas、图片、字体和音频使用 immutable 长缓存。

## 22. 默认技术决策

当前推荐基线为：

```text
TypeScript
+ Vite
+ PixiJS v8 WebGL/WebGL2 renderer
+ fixed-step Simulation
+ lightweight ECS for hot-path entities
+ Presentation Adapter
+ Asset Manifest/Bundle
+ Chunked map
+ View Pool
+ application-level culling
+ WebSocket/binary protocol when multiplayer is introduced
+ Worker only after profiling
```

任何修改上述核心边界的变化都必须新增 ADR。