# Battle RPG EXP 文档

## 文档结构

- [`architecture/pixijs-2d-architecture.md`](architecture/pixijs-2d-architecture.md)：PixiJS 2D 客户端架构基线。
- [`architecture/foundation-status.md`](architecture/foundation-status.md)：基础设施已实现能力、完成定义与刻意延后项。
- [`adr/README.md`](adr/README.md)：Architecture Decision Record（ADR）索引与模板。
- [`contributing/documentation.md`](contributing/documentation.md)：文档维护、命名、评审与生命周期规范。

## 文档分类

| 分类 | 用途 | 稳定性 |
|---|---|---|
| Architecture | 描述当前系统结构、边界与运行机制 | 高 |
| ADR | 记录关键技术决策、背景、取舍与状态 | 不可覆盖历史 |
| Contributing | 描述研发与文档维护约定 | 中 |
| Reference | 协议、Schema、配置、接口等机器邻近资料 | 随实现演进 |

## 维护原则

1. 架构文档描述“当前成立的系统事实”，不保存已经失效的历史争论。
2. 会影响模块边界、数据所有权、运行时拓扑、协议或长期维护成本的决策必须新增 ADR。
3. ADR 一经 Accepted 不修改原始结论，后续变化通过新的 ADR 标记 Supersedes/Superseded by。
4. 文档路径和标题保持稳定，避免外部链接因重构失效。
5. 实现变化与相关文档变化应位于同一变更集。
