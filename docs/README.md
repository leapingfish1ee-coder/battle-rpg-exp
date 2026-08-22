# Battle RPG EXP 文档

## 文档结构

- [`architecture/pixijs-2d-architecture.md`](architecture/pixijs-2d-architecture.md)：PixiJS 2D 客户端架构基线。
- [`architecture/foundation-status.md`](architecture/foundation-status.md)：基础设施已实现能力、完成定义与刻意延后项。
- [`art-direction/aesthetic-standard.md`](art-direction/aesthetic-standard.md)：项目长期美学、画面质量、高精度渲染与后处理基线。
- [`adr/README.md`](adr/README.md)：Architecture Decision Record（ADR）索引与模板。
- [`contributing/documentation.md`](contributing/documentation.md)：文档维护、命名、评审与生命周期规范。
- [`contributing/testing.md`](contributing/testing.md)：领域测试、Pixi 组件测试、端到端测试与视觉回归测试规范。

## 文档分类

| 分类 | 用途 | 稳定性 |
|---|---|---|
| Architecture | 描述当前系统结构、边界与运行机制 | 高 |
| Art Direction | 描述长期有效的美学语言、视觉质量、材质、色彩、渲染与后处理约束 | 高 |
| ADR | 记录关键技术决策、背景、取舍与状态 | 不可覆盖历史 |
| Contributing | 描述研发、测试与文档维护约定 | 中 |
| Reference | 协议、Schema、配置、接口等机器邻近资料 | 随实现演进 |

## 维护原则

1. 架构文档描述“当前成立的系统事实”，不保存已经失效的历史争论。
2. Art Direction 文档描述“当前成立的视觉真值”，所有玩家可见实现必须以其作为美学与画面质量基线。
3. 会影响模块边界、数据所有权、运行时拓扑、协议或长期维护成本的决策必须新增 ADR。
4. ADR 一经 Accepted 不修改原始结论，后续变化通过新的 ADR 标记 Supersedes/Superseded by。
5. 文档路径和标题保持稳定，避免外部链接因重构失效。
6. 实现变化与相关文档变化应位于同一变更集。
7. 测试新增、拆分与视觉 baseline 维护必须遵循 `contributing/testing.md`。
