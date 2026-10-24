# absbox Skill Changelog

## v4.1.0 — 2026-10-25
Consistency audit fixes (cross-checked wrapper source `absbox` 0.52.9 against
engine `Hastructure` 0.52.13):
- 修复:EnginePath 列表去掉不存在的 `LDN_DEV`/`LDN_PROD`——0.52.x 只有
  `LOCAL`/`PROD`/`DEV`(absbox.org,中国服务器)/`NY_DEV`/`NY_PROD`(spv.run,
  纽约服务器)/`USE_ENV`
- 修复:版本检查规则——connect 检查只比较 **minor 段**(major/patch 忽略),
  `0.52.9` 客户端可连 `0.52.13` 服务端;不再宣称 MAJOR.MINOR 必须一致
- 修复:`("cumPoolCollection", ...)` 参数顺序 — 池选择器在前(`None` 或池名
  列表),如 `("cumPoolCollection", None, "CollectedInterest")`;
  `("cumPoolDefaultedRate",)` 无额外参数;`("schedulePoolValuation", pm, pools)`
  估价法在前
- 修复:`("alwaysTrue",)`/`("alwaysFalse",)` → `("always", True)` /
  `("always", False)`
- 修复:`["Weekday", N]` 0 = Sunday(engine day-of-week 语义)
- 修复:Loan 自定义摊还为 `("Schedule", rows[, datePattern])`,裸 `"Schedule"`
  字符串无效;按期限假设为小写 `{"byTerm": [[vec1],[vec2]]}`
- 修复:`FixedAsset` 当前信息字典键为 `currentBalance`(非 `balance`)
- 修复:`ProjectedCashflow` 四元形式 `["ProjectedCashflow", begBal, begDate,
  [date,Principal,Interest][..], date-pattern]`;`ProjectedByFactor` 固定比率/浮动比率
  份额之和必须为 100%,浮动行需 `("interest", ..)` 中假设
- 修复:`"IO"` 只能用裸字符串(不能 `{"IO": None}`);bond rate 的
  `{"Floater": {...}}` dict 形式无效,实际为 `{"floater": [rate, idx, spread,
  reset]}`;删除不存在的 `{"InverseFloater": ...}`
- 修复:账户计息:`rate` 字段不存在,用 `"interest"` 字典
  (`{"period","rate","lastSettleDate"}` 或 investment 形式);reserve
  `("target", formula, rate)` 形式书写更正
- 修复:fee 的 `"feeStart"` 是必需键(0.45.x 起强制);可选项为
  `feeDueDate`/`feeDue`/`feeArrears`/`feeLastPaidDate`(**没有** `"feeEnd"`)
- 修复:run 假设:`("call", ..)` 用 legacy 选项(`poolBalance`/`bondBalance`/
  `poolFactor`/`bondFactor`/`afterDate`/`if`/`any`/`and`——**没有** `CleanUp`);
  `("inspect", ..)` 内容为 `(date-pattern, formula(s))` 行列表;
  `("issueBond", ..)` 写出实际元组形态;`refinance` 必须给出显式 rateType
- 修复:`buyAsset` 参数顺序(liqMethod, account, limit?, poolId?);
  `mkOrder` 补充 `byStartDate`/`("reverse", ..)`/自定义名单
- 修复:Deal-end 状态:`RampUp` 不可用(被 wrapper 拒绝),`Called`
  无 DSL 拼法;频段列表去掉 `Daily`(资产周期只有 Weekly~Annually)
- 修复:trigger points 列表去掉 `EndOfPoolCollection`(它是 waterfall 键不是
  trigger point);`newTrigger` effect 加注释——engine 未实现
- 新增:REFERENCE §18 Deal Library(`LIBRARY` 类、login/query/get/run、
  pickle 传输安全提示)
- 新增:REFERENCE §19 高级 deal 键形态:`liqFacility`、`rateSwap`、`rateCap`、
  `stats`(0.52.9 只真实处理 `BondPaidPeriod`/`PoolCollectedPeriod`)、
  pool 的 `extendBy`/`issuanceStat`、`dates.cust`
- 新增:结果回读键 `liqProvider`/`rateSwap`/`rateCap`/`triggers`/
  `agg_accounts`/`_deal`;`rtn=["AssetLevelFlow"]` 说明

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
