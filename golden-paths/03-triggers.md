# 03 — Performance triggers

Goal: switch deal status when a performance test breaches. Verified against
`DEV` on absbox 0.52.3 / Hastructure 0.52.4.

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "TrigDeal",
    "dates": {"cutoff": "2021-03-01", "closing": "2021-06-15",
              "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
              "poolFreq": "MonthEnd", "stated": "2030-01-01"},
    "pool": {"assets": [
        ["Mortgage",
         {"originBalance": 12000, "originRate": ["fix", 0.045], "originTerm": 120,
          "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
         {"currentBalance": 10000, "currentRate": 0.075,
          "remainTerm": 80, "status": "Current"}]]},
    "accounts": {"acc01": {"balance": 0}},
    "bonds": {
        "A": {"balance": 9000, "rate": 0.05, "originBalance": 9000,
              "originRate": 0.05, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.05}, "bondType": {"Sequential": None}},
        "B": {"balance": 1000, "rate": 0.0, "originBalance": 1000,
              "originRate": 0.0, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {
        "Amortizing": [
            ["accrueAndPayInt", "acc01", ["A"]],
            ["payPrin", "acc01", ["A"]],
            ["payPrinResidual", "acc01", ["B"]]],
        "Accelerated": [
            ["accrueAndPayInt", "acc01", ["A"]],
            ["payPrinBySeq", "acc01", ["A", "B"]]]},
    "triggers": {
        "AfterCollect": {
            "cumLoss": {
                "condition": [("cumPoolDefaultedRate",), ">", 0.03],
                "effects": ("newStatus", "Accelerated"),
                "status": False,
                "curable": True}}},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"], ["CollectedRecoveries", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')
r = api.run(deal,
            poolAssump=("Pool",
                ("Mortgage", {"CDR": 0.06}, {"CPR": 0.03}, {"Rate": 0.5, "Lag": 12}, None),
                None, None),
            read=True)

print(r['result']['status'])        # From -> To transitions
print(r['result']['waterfall'])     # which waterfall ran each period
```

Verified: the status column walks `Amortizing` → `Accelerated` → final end
state when the cumulative default rate breaches 3%.

## Trigger points

`BeforeCollect`, `AfterCollect`, `BeforeDistribution`, `AfterDistribution`,
`InDistribution`. (`EndOfPoolCollection` is not mapped by the 0.52.3 client.)

## Effects

| Effect | Syntax |
|--------|--------|
| Switch status | `("newStatus", "Accelerated")` |
| Run actions | `("actions", action1, action2)` |
| Accrue fees | `["accrueFees", "fee1"]` |
| Set reserve | `["newReserveBalance", "acc1", {"fixReserve": 1000}]` |
| Multiple | `["Effects", effect1, effect2]` |

## Gotchas

- A status-changing trigger **must not fire while the deal is still
  `PreClosing`** or the engine errors with
  `DealClosed action is not in PreClosing status ...`. Use a condition that is
  false at closing (e.g. a cumulative default rate) or guard it by date/status.
- `"curable": True` re-evaluates each period and cures when the test passes;
  `False` is permanent once tripped.
- Triggers only change behavior if a matching key exists in `"waterfall"` (here
  `"Accelerated"`).
