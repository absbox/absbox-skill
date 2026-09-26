# absbox Skill Changelog

## v4.0.1 — 2026-09-27
- 对齐仓库 AbsBox 0.52.3（用客户端解析器 mkDeal/mkDs/mkAsset/mkBondRate/mkFee/
  mkNonPerfAssumps 实测）
- 移除 0.52.3 中不存在的 `EnginePath.LDN_DEV`/`LDN_PROD`；标注 `PickApiFrom`
  当前不可用（向 `API` 传入 dict）
- 修正 `ProjectedCashflow`（5 参）、`FixedAsset` 当前余额键 `currentBalance`、
  `capacity`（`("ByTerm", ...)`）、账户计息键 `"interest"`（非 `"rate"`）、
  `["Offset", ...]`、`{"byTerm": ...}`
- 修正公式：`("always", True/False)`、`("cumPoolDefaultedRateTill", N)`、
  池归集公式的 poolNames 前置参数
- 修正动作/假设：`calcBondPrin` 参数、clean-up call
  `("call", {"poolBalance": 200})`、`("inspect", (dp, formula))`、`feeStart` 必填
- 修正 0.52.3 不支持的写法：Z-bond、`{"Floater": {...}}`、`InverseFloater`、
  `feeEnd`；trigger points 去掉客户端未映射的 `EndOfPoolCollection`
- 修正 `golden-paths/08-fees-reserves-ledgers.md` 文件名引用（实为
  `08-fees-reserves.md`）

## v4.0.0 — 2026-09-26
- 验证：在 `absbox` 0.52.3 / Hastructure 0.52.x 上实际运行所有 golden path
  （DEV: 0.52.4，PROD: 0.52.5）
- 重构：SKILL.md 精简为路由 + 快速开始（1185 → ~280 行），细节移入
  REFERENCE.md、golden-paths/、evals/
- 修复：SKILL 与 REFERENCE 之间的语法冲突（calcFee/calcInt 参数、recurFee、
  numFee、targetBalanceFee、byTable、recurFee）
- 修复：bond group 是嵌套结构（`"bonds": {"Senior": {"A1": ...}}`），
  而非 bond 内的 `bondGroup` 字段
- 修复：group action 排序值为小写（`"byName"`/`"byMaturity"`/`"byCurRate"`/
  `"byProrata"`）
- 修复：`writeOff`/`fundWith` 需要显式 limit；`liqRepay` 用 4 参数形式
- 修复：`read` 默认值为 True（pitfall 表述修正）；版本检查为 MAJOR.MINOR
- 修复：`runPool` 需要 pool 内 `cutoffDate`，返回 `{poolName: {"flow": ...}}`
- 修复：`from absbox.local.analytics import irr` 不存在；IRR 通过
  `("pricing", {"IRR": ...})` 与 `r['pricing']['summary']`
- 新增：EnginePath 完整列表（LDN/NY/USE_ENV）、`runFirstLoss`、`runDates`、
  `runPoolByScenarios`、MultiResult 读取器
- 新增：8 个已验证 golden path + 索引
- 新增：5 个行为 eval
- 新增：TLS/响应截断、stated 过短导致 deal 立即结束、trigger 不应在
  PreClosing 触发等 pitfall

## v3.0.0 — 2026-08-28
- 来源：absbox-doc.readthedocs.io 全站文档
- 重构：按功能模块重组 SKILL.md（22 章）
- 新增：Waterfall Actions 分类参考、Root Finder 语法、调试工作流、
  Deal Library API、真实数据加载、v0.52.3+ dict 语法
- 增强：REFERENCE.md 独立为查找表，Pool Assumptions 覆盖各资产类型

## v2.0.0 — 2026-08-15
- 初版由 sdd-skill-creator 生成
