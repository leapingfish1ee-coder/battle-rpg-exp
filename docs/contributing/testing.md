# 项目测试规范

## 目标

本项目采用 PixiJS 单 Canvas 架构，测试必须同时覆盖领域状态正确性、Pixi 组件交互契约、完整游戏流程以及最终像素输出，并持续防止应用 UI 回退为 Canvas 外 DOM；所有玩家可见画面还必须符合 [`../art-direction/aesthetic-standard.md`](../art-direction/aesthetic-standard.md) 定义的日式西幻、典雅庄重、高精度渲染与克制后处理基线。

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
- 所有可重复触发的交互都必须验证稳定性：相同输入连续执行至少 5 次后，状态、布局尺寸、缩放、位置和视觉输出不得出现非设计要求的累计漂移。
- pointer 与键盘能够触发同一语义动作时，两条路径都必须覆盖，不得只验证其中一种输入方式。
- `TownSceneView` 继续拆分时，`TownMenuView`、`PartyStatusView`、`ObjectivePanelView`、`TownHeaderView`、`TownBackdropView` 等组件都应获得独立测试。

### 3. 端到端测试

- 使用 Playwright，文件放在 `tests/e2e/**/*.spec.ts`。
- 验证从真实入口启动后的游戏状态、页面/场景切换、键盘与鼠标流程以及跨组件集成行为。
- Canvas `data-*` 属性作为语义观察口，用于确认逻辑状态；像素截图不得替代语义断言。
- 对幂等操作必须加入重复交互序列，不能仅验证第一次操作成功；例如重复点击当前已选中的菜单项后，语义状态和画面都应保持不变。
- 对循环选择、开关、展开/收起、hover/press/release 等状态机，至少覆盖一个完整循环后回到初始状态，并验证不存在累计 scale、position、alpha、bounds 或滤镜参数漂移。
- 每个浏览器测试都必须维持 Pixi-only 契约：`#app` 下恰好一个 Canvas，且不存在应用 DOM UI。

### 4. 视觉回归测试

- 使用 Playwright `expect(locator).toHaveScreenshot()`，文件放在 `tests/visual/**/*.visual.spec.ts`。
- 截图目标优先为 Pixi Canvas 或明确的 Pixi 组件 testbed，而不是整个浏览器页面。
- 在截图前先使用语义断言确认目标状态已经到达，再进行像素比较。
- 除固定黄金图外，必须允许使用“变形关系视觉断言”：对于理论上视觉幂等的重复交互，在冻结时间与随机源后比较交互前后截图，要求像素输出保持一致。
- 首批城镇黄金图应覆盖五个设施选中状态、设施确认消息、标准布局与 compact 布局。
- 视觉矩阵至少覆盖 `1280×720`、`900×620`、`768×1024`、`390×844` 四种 viewport。
- 动画、天气、日期、队伍、随机数和时间输入必须冻结；动画验证使用确定性关键帧，例如 `t=0`、`t=2`、`t=5`，禁止依赖实时连续帧。
- 黄金图只在固定 CI 平台、固定 Playwright Chromium 与固定字体环境生成和评审，禁止跨操作系统混用 baseline。
- 初始像素差异阈值应保持严格，允许的差异必须有明确依据；不得通过扩大阈值掩盖真实回归。
- baseline 更新必须由显式视觉更新命令完成，并与对应 UI 代码变更位于同一 PR，评审时必须检查 expected、actual、diff。
- 新增或修改全屏 color grade、bloom、vignette、grain、atmosphere 或 RenderTexture pass 时，视觉测试必须至少保留一个固定场景的处理前/处理后可核验结果，防止后处理逐步漂移成过曝、压黑、失焦或噪声化。
- High、Medium、Low 质量档首次落地后，每个关键场景至少保留 High 与 Low 两个基准，验证降级只牺牲非关键效果而不损伤文字、交互状态和主体轮廓。

## 美学一致性与画面质量验收

- 所有玩家可见改动必须以 `docs/art-direction/aesthetic-standard.md` 为视觉真值，功能测试通过不代表美学验收通过。
- 视觉评审至少检查主焦点、色彩层级、材质区分、UI 装饰密度、文字可读性、光源逻辑、Bloom 强度、暗部细节和高光保留。
- 禁止用“大量金色、高饱和、强 Bloom、重 vignette、持续色差、全屏模糊或噪点”替代典雅庄重的设计目标；一旦出现这些效果必须有明确叙事用途和可关闭或可降级策略。
- 关键视觉变更的 PR 应提供固定 viewport 的 before/after 证据；引入明显 GPU 成本的效果还必须记录至少一种性能依据，例如 frame time、draw calls、RenderTexture 数量或 profiling 截图。
- 对渲染 scale、filter 参数、质量等级、后处理开关等可配置项，应优先测试集中配置契约，禁止让相同语义散落为多个互相漂移的局部常量。
- 新增 UI 状态必须确认 hover/selected/pressed 前后尺寸稳定，颜色和描边可以变化，但不得通过累计 scale、bounds 或 filter padding 产生非设计性几何增长。

## 交互稳定性与绘制幂等性

- Pixi 组件的布局输入必须来自稳定的布局模型或显式尺寸，禁止把带 stroke、filter、shadow、scale 或其他视觉效果后的渲染 bounds 直接作为下一次绘制的布局输入。
- `update(state)`、重复选中当前项、重复确认无状态变化动作等幂等调用，在输入不变时必须产生稳定输出。
- 对可能改变 bounds 的选中描边、滤镜、阴影、文本样式和缩放效果，测试必须至少执行“初始 → 交互 N 次 → 回到同一语义状态”的序列，并比较关键几何或像素结果。
- 仅验证 `data-*`、回调参数或领域状态不足以证明 Pixi UI 正确；任何能够改变布局或绘制结果的交互至少需要一个几何或视觉层断言。
- 新增动画时必须区分“时间驱动变化”和“状态驱动变化”，稳定性测试冻结时间后只允许状态设计明确要求的像素变化。

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

## 缺陷逃逸与回归规则

- 任何进入 `main` 后由人工或线上发现的 UI 缺陷都视为测试逃逸，修复 PR 必须先说明现有测试为何没有覆盖该失效模式。
- 每个逃逸缺陷都必须新增一个能在修复前稳定失败、修复后稳定通过的自动化回归测试，优先放在距离根因最近且能够真实观察故障的测试层。
- 如果缺陷属于现有规范未覆盖的失效模式，修复 PR 必须同步迭代本规范，使同类问题成为后续功能的强制测试要求。
- 回归测试不得只复制缺陷实现细节；应验证用户可观察结果或稳定的组件契约，例如重复交互后的像素一致性、几何稳定性或状态机闭环。
- 对“第一次正确、重复操作后逐步失真”的缺陷，单步 smoke test 不构成有效覆盖，必须执行重复序列并验证无累计误差。

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

视觉 baseline 变更必须同时满足以下条件：UI/艺术方向确实发生预期变化；变化符合 `docs/art-direction/aesthetic-standard.md`；语义状态测试先通过；评审者查看像素差异；变化范围与代码改动一致；不存在字体、时间、随机源、质量档或平台漂移造成的噪声。
