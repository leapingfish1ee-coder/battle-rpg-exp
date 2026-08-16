# 基础设施实现状态

Status: Active  
Scope: Initial browser client foundation

## 已建立

- TypeScript strict 编译基线与 Vite 开发/构建入口。
- PixiJS v8 WebGL renderer 封装，PixiJS 类型限制在 rendering 层。
- `domain → simulation → presentation → rendering` 单向运行链路。
- 60 Hz fixed-step Simulation、accumulator、最大 catch-up 限制与 snapshot interpolation。
- 浏览器输入到语义 `PlayerCommand` 的映射。
- 确定性 RNG 与纯 Simulation 单元测试路径。
- 基于速度、加速度、减速度和二维输入归一化的向量移动系统。
- 世界坐标玩家状态、Presentation 插值与 Rendering-only `Camera2D` 跟踪边界。
- 稳定 Pixi root layers：background、world root、world/effects/foreground、hud、debug；camera 只变换 world root。
- 程序化、世界坐标锚定的水泥地表渲染示例，用于验证 camera/world-space 关系。
- Asset、Network、Audio、Telemetry 的端口接口，具体实现按实际功能引入。
- ESLint 架构守卫，禁止 domain/simulation 依赖 PixiJS、rendering、network、platform 与关键浏览器全局。
- Vitest 单元测试、Playwright 浏览器启动/输入/镜头烟测与 GitHub Actions CI。
- DisposableScope 作为 Scene/Service 生命周期资源释放基础设施。

## 当前刻意延后

以下能力在出现真实需求或 profiling 证据前不实现：

- 完整 ECS storage/query framework；
- Scene manager 与复杂 Scene lifecycle orchestration；
- Asset Manifest/Bundle 的具体 PixiJS adapter；
- Tile map chunk streaming 与空间索引；
- View Pool、particle system 与 advanced culling；
- Web Worker/SharedArrayBuffer；
- WebSocket/binary multiplayer protocol；
- DeviceProfile 与动态 render scale；
- production telemetry backend；
- audio engine 与 persistence implementation。

## 基础设施完成定义

当前阶段的 foundation 被视为成立，当且仅当：

1. `npm run typecheck` 通过；
2. `npm run lint` 通过；
3. `npm run test` 通过；
4. `npm run build` 通过；
5. Playwright Chromium smoke test 能观察到 PixiJS canvas，并验证语义移动输入和 camera 跟踪；
6. domain/simulation 不产生 PixiJS 或浏览器 API 依赖。

后续新增核心边界或改变默认技术决策时，应新增 ADR，而不是直接让实现偏离架构基线。
