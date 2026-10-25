# absbox Skill Changelog

## v4.0.7 — 2026-10-26
- 流程：明确变更优先级（严格，左高右低）：
  `Hastructure` → `AbsBox` → `AbsBox/docs` → `absbox-skill`
  左侧为准、不得为迁就右侧而修改；冲突时改右侧（低优先级）一侧

## v4.0.6 — 2026-10-26
- 对齐 absbox/docs（Dec26）：REFERENCE 按手册补齐/修正语法
- 修正：Weekday `0=Sunday`；`("call", {"poolBalance":200})`（非 CleanUp）；
  ByPoolId 键为池名；DatePattern 复合形式（All/Exclude/Starts/Ends）与 `-` 列表
- 补齐：公式（poolFactor/totalFunded/irrOfBond/bondFactor/…）、条件（date/period
  between/in、<=/>=、periodCurve）、费率 tuple/0.52.3 sugar、债券组 tuple 形式、
  账户 `fixReserve`、默认资产假设、集合 dict 语法、waterfall 标准键与 bookBy
  三种形式、run 假设（stop 按 pattern、call 字典键、callWhen 形式、issueBond 多计划）、
  结果键（agg_accounts/triggers/liqProvider/rateSwap/rateCap/inspect/bonds）
- 恢复此前 merge 丢失的 §8 Accounts；修正 §2.4 表格列数
- Periods 增加 BiWeekly；状态增加 Called（与手册一致）
- 版本 4.0.6

## v4.0.5 — 2026-10-26
- 文档：FixedAsset 的 `("ByTerm", …)` 容量键为整数期数（非日期），与引擎 Dec26 对齐

## v4.0.4 — 2026-10-26
- 同步 AbsBox B1–B10 修复：`lastFeePaid` 已改为引擎 `LastFeePaid`（移除“待修复”标注）

## v4.0.3 — 2026-10-26
- 文档：`ProjectedByFactor` 的浮动部分按引擎 Dec26 改为 4 元组
  `(share, current rate, spread, index)`；份额需与固定部分合计 1.0；列表必填（`[]` 可，`null` 不可）
- 文档：`lastFeePaid` 语义对齐引擎 `LastFeePaid`（计算日当天的已付费用），并标注 wrapper 目前
  仍映射为累计 `FeePaidAmt`（待 AbsBox 修复）
- 文档：`PickApiFrom` 在 0.52.x 已可用，恢复为推荐用法（移除“已损坏”旧说明）

## v4.0.2 — 2026-10-25
- 工作流：新增 Repositories & branch alignment — Hastructure（引擎，Servant/Aeson
  REST）→ AbsBox（Python wrapper + docs）→ absbox-skill（本 skill）
- 规则：Hastructure 每个分支在 AbsBox / absbox-skill 有同名分支；当前引擎分支
  `Dec26`，三个仓库需同分支工作；版本仅需 MAJOR.MINOR 一致
- Step 0 增加“先对齐三仓库分支”的检查

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
- 新增：EnginePath 扩展列表（NY/USE_ENV）、`runFirstLoss`、`runDates`、
  `runPoolByScenarios`、MultiResult 读取器
- 新增：8 个已验证 golden path + 索引
- 新增：5 个行为 eval
- 新增：npm/npx 安装 — `npx absbox-skill` 将 skill 复制到
  opencode / Claude Code / `~/.agents` 的 skill 目录
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
