# 项目测试规范

## 目标

本项目采用 PixiJS 单 Canvas 架构，测试必须同时覆盖领域状态正确性、Pixi 组件交互契约、完整游戏流程以及最终像素输出，并持续防止应用 UI 回退为 Canvas 外 DOM。

## 测试层级

### 1. 领域与纯逻辑测试

- 使用 Vitest，运行于 Node 环境。
- 文件放在 `tests/domain/**/*.test.ts`，未来其他纯逻辑模块可建立同级目录。
- 覆盖状态初始化、状态转换、边界值、循环选择、确认行为、不可变更新和异常输入。
- 不在这一层创建 `Pixi.Application`、WebGL 上下文或依赖字体栅格化结果。
- 状态转换优先使用表驱动测试，避免为同类分支重复搭建测试代码。

### 2. Pixi 组件测试

- 使用 Playwright 在真实 Chromium + PixiJS 环境中运行。
- 文件放在 `tests/components/**/*.spec.ts`。
- 组件必须通过专用 Pixi testbed/harness 挂载到唯一 Canvas 中，不得为了测试引入应用 DOM UI。
- 可测试组件应拥有稳定的公开契约，例如 `update(state)`、`layout(width, height)`、`destroy()` 与必要 callback；测试禁止依赖 private 字段或 child index。
- 组件测试验证输入映射、pointer 交互、选择状态、回调参数、布局边界、长文本、极端数值和多成员数据等行为。
- `TownSceneView` 继续拆分时，`TownMenuView`、`PartyStatusView`、`ObjectivePanelView`、`TownHeaderView`、`TownBackdropView` 等组件都应获得独立测试。

### 3. 端到端测试

- 使用 Playwright，文件放在 `tests/e2e/**/*.spec.ts`。
- 验证从真实入口启动后的游戏状态、页面/场景切换、键盘与鼠标流程以及跨组件集成行为。
- Canvas `data-*` 属性作为语义观察口，用于确认逻辑状态；像素截图不得替代语义断言。
- 每个浏览器测试都必须维持 Pixi-only 契约：`#app` 下恰好一个 Canvas，且不存在应用 DOM UI。

### 4. 视觉回归测试

- 使用 Playwright `expect(locator).toHaveScreenshot()`，文件放在 `tests/visual/**/*.visual.spec.ts`。
- 截图目标优先为 Pixi Canvas 或明确的 Pixi 组件 testbed，而不是整个浏览器页面。
- 在截图前先使用语义断言确认目标状态已经到达，再进行像素比较。
- 首批城镇黄金图应覆盖五个设施选中状态、设施确认消息、标准布局与 compact 布局。
- 视觉矩阵至少覆盖 `1280×720`、`900×620`、`768×1024`、`390×844` 四种 viewport。
- 动画、天气、日期、队伍、随机数和时间输入必须冻结；动画验证使用确定性关键帧，例如 `t=0`、`t=2`、`t=5`，禁止依赖实时连续帧。
- 黄金图只在固定 CI 平台、固定 Playwright Chromium 与固定字体环境生成和评审，禁止跨操作系统混用 baseline。
- 初始像素差异阈值应保持严格，允许的差异必须有明确依据；不得通过扩大阈值掩盖真实回归。
- baseline 更新必须由显式视觉更新命令完成，并与对应 UI 代码变更位于同一 PR，评审时必须检查 expected、actual、diff。

## Fixture 与确定性

- 测试 fixture 必须使用固定的城镇、日期、天气、金币、队伍、任务和菜单状态。
- 视觉 fixture 必须固定动画时间和随机源。
- 中文/CJK UI 必须包含短文本、正常文本、超长文本、英文数字混排和换行场景。
- 测试数据应集中复用，禁止在多个测试文件中复制完整游戏状态对象。

## 目录约定

```text
tests/
  domain/       # Vitest 领域与纯逻辑测试
  components/   # Playwright Pixi 独立组件行为测试
  visual/       # Playwright 视觉回归测试与黄金图
  e2e/          # Playwright 完整游戏流程测试
```

目录可在首次出现对应测试时创建；不存在真实测试时不得提交空目录或伪造黄金图。

## 命令与质量门槛

当前可执行命令：

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:browser
npm run check
npm run test:all
```

- `npm run test`：当前 Vitest 测试集合。
- `npm run test:browser`：当前全部 Playwright 浏览器测试。
- `npm run check`：类型检查、Lint、Vitest 与生产构建。
- `npm run test:all`：完整执行 `check` 后再执行全部浏览器测试。
- 当 `tests/components` 和 `tests/visual` 首次落地时，必须增加稳定的 `test:component`、`test:visual`、`test:visual:update` 脚本，并纳入 CI。

## CI 规则

- PR 与 push 必须执行非浏览器验证和真实 Chromium 浏览器验证。
- 类型检查、Lint、Vitest、生产构建和 Playwright 浏览器测试均为合并门槛。
- 视觉测试落地后必须成为独立且强制的 CI job，并在失败时上传 Playwright report、actual、expected 与 diff 产物。
- CI 失败时不得通过删除断言、降低覆盖面、扩大视觉阈值或重录无关 baseline 解决。

## Pixi-only 测试约束

- 所有用户可见页面、菜单、HUD、对话框、控件与装饰必须由 PixiJS 渲染。
- 测试 harness 也必须保持单 `Pixi.Application`、单 Canvas，不得使用外部 DOM 模拟真实应用 UI。
- 任何引入 `#app > :not(canvas)` 的应用实现都属于架构回归，浏览器测试必须能够检测并拒绝。

## 视觉基准评审规则

视觉 baseline 变更必须满足以下条件：UI/艺术方向确实发生预期变化；语义状态测试先通过；评审者查看像素差异；变化范围与代码改动一致；不存在字体、时间、随机源或平台漂移造成的噪声。
