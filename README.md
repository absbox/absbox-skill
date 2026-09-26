# absbox Skill

A skill for modeling and projecting structured finance deals (ABS, MBS, CLO,
SRT) with the [absbox](https://absbox-doc.readthedocs.io/en/latest/) Python
library and the Hastructure engine.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Router + quick start (load this) |
| `REFERENCE.md` | Exhaustive lookup tables: formulas, actions, constants, API |
| `golden-paths/` | Verified end-to-end recipes |
| `evals/` | Behavior tests for the skill |
| `doc/CHANGELOG.md` | Release history |

## Setup

```bash
pip install absbox          # Python 3.10+
docker pull yellowbean/hastructure   # optional local engine
```

```python
from absbox import API, EnginePath

api = API(EnginePath.PROD)                              # version check on
api = API(EnginePath.DEV, lang='english', check=False)  # skip version check
```

The client and engine must share the same **MAJOR.MINOR** version; the patch may
differ. `check=True` (the default) enforces this.

## Minimal deal

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "SIMPLE_ABS",
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
        "A": {"balance": 8000, "rate": 0.05, "originBalance": 8000,
              "originRate": 0.05, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.05}, "bondType": {"Sequential": None}},
        "EQ": {"balance": 2000, "rate": 0.0, "originBalance": 2000,
               "originRate": 0.0, "startDate": "2021-06-15",
               "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {"Amortizing": [
        ["accrueAndPayInt", "acc01", ["A"]],
        ["payPrin", "acc01", ["A"]],
        ["payPrinResidual", "acc01", ["EQ"]]]},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')
r = api.run(deal,
            poolAssump=("Pool",
                ("Mortgage", {"CDR": 0.02}, {"CPR": 0.05}, {"Rate": 0.6, "Lag": 12}, None),
                None, None),
            read=True)

print(r['result']['logs'])     # check warnings first
print(r['bonds']['A'])
print(r['pool']['flow'])
```

## Next steps

- New to absbox: read `golden-paths/01-minimal-abs.md`, then run it.
- Building a specific structure: match it in `golden-paths/README.md`.
- Need exact syntax: look it up in `REFERENCE.md`.
- Extending the skill: add a golden path and an eval.

## Key resources

- Docs: https://absbox-doc.readthedocs.io/en/latest/
- API: https://absbox-doc.readthedocs.io/en/latest/api.html
- Notebooks: https://absbox-doc.readthedocs.io/en/latest/nbsample/index.html
- Engine: https://github.com/yellowbean/Hastructure
