# Architecture Decision Records

ADR 用于记录会长期影响模块边界、数据所有权、运行时拓扑、协议、部署、安全性或维护成本的架构决策。

## 状态

- Proposed：已提出但尚未接受。
- Accepted：当前有效。
- Rejected：评审后拒绝。
- Deprecated：仍存在但不建议继续使用。
- Superseded：已被后续 ADR 取代。

## 命名

```text
NNNN-short-kebab-case-title.md
```

示例：

```text
0001-use-pixijs-as-rendering-boundary.md
0002-use-fixed-step-simulation.md
```

## 模板

```markdown
# ADR-NNNN: 决策标题

Status: Proposed
Date: YYYY-MM-DD

## Context

描述触发该决策的工程事实、约束和问题。

## Decision

描述最终采用的方案，并明确系统边界或不可违反的约束。

## Alternatives

列出主要候选方案及未采用原因。

## Consequences

描述正向收益、负向成本、迁移影响和后续约束。

## References

列出相关架构文档、Issue、PR、协议或外部标准。
```

## 规则

1. Accepted ADR 不改写历史结论；新结论通过新的 ADR 取代旧 ADR。
2. 单纯实现细节、局部重构、命名调整和无长期约束的库升级通常不需要 ADR。
3. ADR 必须描述取舍而不是只记录结果。
4. 被取代 ADR 应在状态中注明 `Superseded by ADR-NNNN`，新 ADR 应注明 `Supersedes ADR-NNNN`。
5. 影响 `docs/architecture/` 中当前系统事实的 ADR 落地后，应同步更新对应架构文档。