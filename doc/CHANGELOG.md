# absbox Skill Changelog

<<<<<<< HEAD
## v4.0.1 — 2026-10-25
- 核查：逐条把 REFERENCE/golden paths 的语法交给 `absbox` 构建器实测，并对
  本地 0.52.13 / prod 0.52.14 引擎真跑；修正与 `AbsBox/docs` 及 wrapper 不一致处
- 修复：`EnginePath` 移除不存在的 `LDN_DEV`/`LDN_PROD`；SKILL 中 golden path
  文件名 `08-fees-reserves-ledgers.md` → `08-fees-reserves.md`
- 修复：`ProjectedCashflow` 参数（需 beginBalance/beginDate）、FixedAsset
  `currentBalance` 与 `("ByTerm", …)`、Loan `("Schedule", …)`、`{"IO": None}` → `"IO"`
- 修复：Floater 利率写法（移除 `{"Floater": …}`/`InverseFloater`）；step-up 说明
  为 bond 顶层字段；账户计息改用 `"interest"` dict（`"rate"` 被忽略）
- 修复：`payIntOverInt` 需要第 4 个 limit 参数；`writeOff`/`fundWith` 的 limit 可省略
- 修复：`["period","in",…]` 用可变参数；`("always", True/False)` 取代
  `alwaysTrue/False`；DatePattern 移除 `Daily`、修正 `["-", dp, [dp...]]`
- 修复：百分比归集写法 `["CollectedInterest", [0.8,"acc01"], …]`（pct 在前、勿再嵌套）
- 修复：触发器位置移除 `EndOfPoolCollection`；`byTerm` 大小写；`issueBond` 为
  “每只债券一个元组”
- 修复：报告（`("report", …)` / `r['result']['report']`）在 0.52.x 引擎不产出，
  改为显式说明；`r['pricing']` 仅在请求定价假设时存在
- 修复：`RampUp` 不是 DealStatus；golden 02/05 的“已验证数值”按 0.52.13 重测更新；
  golden 02 的 `ByIndex` 结构；golden 07 移除 `Prepaid` 状态映射
- 措辞：枚举“必须 dict 包裹”改为按字段而定；`name`/`status` 非必需
=======
## v4.1.0 — 2026-10-12
- 新增维护流程：AbsBox ↔ Hastructure 编码契约审计（`doc/contract-audit.md`）
  - `scripts/contract_audit.py`：对比 AbsBox tag 与 Hastructure 构造函数名，
    输出疑似编码不匹配
  - 审计清单：`contents` 参数个数/顺序、record 字段名、响应行顺序
  - 记录方法学：Hastructure 用 `deriveJSON defaultOptions`
    （`TaggedObject "tag" "contents"`），`swagger.json` 对部分 sum type 有缺失，
    以 `.hs` 源码为准
- 由该审计产出 AbsBox issue #109（7 处 tag/形状不匹配）

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
>>>>>>> main

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
<<<<<<< HEAD
- 新增：EnginePath 扩展列表（NY/USE_ENV）、`runFirstLoss`、`runDates`、
  `runPoolByScenarios`、MultiResult 读取器
- 新增：8 个已验证 golden path + 索引
- 新增：5 个行为 eval
- 新增：npm/npx 安装 — `npx absbox-skill` 将 skill 复制到
  opencode / Claude Code / `~/.agents` 的 skill 目录
=======
- 新增：EnginePath 完整列表（LDN/NY/USE_ENV）、`runFirstLoss`、`runDates`、
  `runPoolByScenarios`、MultiResult 读取器
- 新增：8 个已验证 golden path + 索引
- 新增：5 个行为 eval
>>>>>>> main
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
