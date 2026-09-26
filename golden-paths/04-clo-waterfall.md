# 04 — CLO-style waterfall

Goal: a sequential CLO-style structure — management fee, sequential interest and
principal across rated tranches, a reserve account, a residual equity tranche,
and a default trigger that flips to accelerated principal. Verified against
`DEV` on absbox 0.52.3 / Hastructure 0.52.4.

```python
from absbox import API, EnginePath, mkDeal

def bond(balance, rate):
    return {"balance": balance, "rate": rate, "originBalance": balance,
            "originRate": rate, "startDate": "2021-06-15",
            "rateType": {"Fixed": rate}, "bondType": {"Sequential": None}}

deal = mkDeal({
    "name": "CLO",
    "dates": {"cutoff": "2021-03-01", "closing": "2021-06-15",
              "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
              "poolFreq": "MonthEnd", "stated": "2030-01-01"},
    "pool": {"assets": [
        ["Loan",
         {"originBalance": 6000, "originRate": ["fix", 0.08], "originTerm": 60,
          "freq": "Quarterly", "type": "i_p", "originDate": "2021-02-01"},
         {"currentBalance": 5000, "currentRate": 0.08,
          "remainTerm": 48, "status": "Current"}]]},
    "accounts": {
        "acc01": {"balance": 0},
        "reserve": {"balance": 0,
                    "type": ("target", ("*", ("poolBalance",), 0.02))}},
    "fees": {
        "mgmtFee": {"type": {"annualPctFee": [("poolBalance",), 0.005]},
                    "feeStart": "2021-06-15"}},
    "bonds": {
        "A": bond(5000, 0.045),
        "B": bond(2000, 0.055),
        "E": {"balance": 4000, "rate": 0.0, "originBalance": 4000,
              "originRate": 0.0, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {
        "Amortizing": [
            ["calcAndPayFee", "acc01", ["mgmtFee"]],
            ["accrueAndPayIntBySeq", "acc01", ["A", "B"]],
            ["payPrinBySeq", "acc01", ["A", "B"]],
            ["transfer", "acc01", "reserve", {"reserve": "gap"}],
            ["payPrinResidual", "acc01", ["E"]]],
        "Accelerated": [
            ["accrueAndPayIntBySeq", "acc01", ["A", "B"]],
            ["payPrinBySeq", "acc01", ["A", "B", "E"]]]},
    "triggers": {
        "AfterCollect": {
            "ocTest": {
                "condition": [("cumPoolDefaultedRate",), ">", 0.03],
                "effects": ("newStatus", "Accelerated"),
                "status": False, "curable": True}}},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"], ["CollectedRecoveries", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')
r = api.run(deal,
            poolAssump=("Pool",
                ("Loan", {"CDR": 0.08}, {"CPR": 0.05}, {"Rate": 0.5, "Lag": 9}, None),
                None, None),
            read=True)

print(r['result']['status'])       # Amortizing -> Accelerated -> end
print(r['bonds']['A'][['balance', 'interest']].tail())
print(r['result']['logs'])
```

Verified: status transitions `Amortizing` → `Accelerated` → end.

## Variants

- **Bond groups** (shorter wateralls): nest the tranches and use group actions.

  ```python
  "bonds": {"Senior": {"A": bond(5000, 0.045), "B": bond(2000, 0.055)},
            "EQ": {"E": {...}}}
  # waterfall:
  ["accrueAndPayIntByGroup", "acc01", "Senior", "byName"],
  ["payPrinByGroup", "acc01", "Senior", "byName"],
  ```
  Group order values are lowercase: `"byName"`, `"byMaturity"`, `"byCurRate"`,
  `"byProrata"`.

- **OC test by ratio**: `[("ratio", ("poolBalance",), ("bondBalance","A","B")), "<", 1.1]`.
  Guard it so it cannot fire during `PreClosing` (see path 03).

## Gotchas

- `payPrinBySeq` pays each listed bond to zero in order; the residual tranche
  must come last.
- The reserve transfer uses `{"reserve": "gap"}` against the **target**
  account's target formula.
- Use `calcAndPayFee` (not `payFee`) when the fee must be computed in the same
  period.
