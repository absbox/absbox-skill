"""Offline smoke test for the absbox skill.

Builds the canonical deal map and asks the client to serialise the request with
``debug=True`` (no network call). Run it after editing the skill to catch
deal-map construction errors early:

    python scripts/smoke.py

Set ABSBOX_ENGINE=dev to also send the request to the DEV engine. Requires the
``absbox`` package (`pip install absbox`).
"""

import os
import sys
import json


def build_deal():
    from absbox import mkDeal

    return mkDeal({
        "name": "SMOKE",
        "dates": {
            "cutoff": "2021-03-01", "closing": "2021-06-15",
            "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
            "poolFreq": "MonthEnd", "stated": "2030-01-01",
        },
        "pool": {"assets": [
            ["Mortgage",
             {"originBalance": 12000, "originRate": ["fix", 0.045],
              "originTerm": 120, "freq": "Monthly", "type": "Level",
              "originDate": "2021-02-01"},
             {"currentBalance": 10000, "currentRate": 0.075,
              "remainTerm": 80, "status": "Current"}]
        ]},
        "accounts": {"acc01": {"balance": 0}},
        "bonds": {
            "A": {"balance": 8000, "rate": 0.05, "originBalance": 8000,
                  "originRate": 0.05, "startDate": "2021-06-15",
                  "rateType": {"Fixed": 0.05}, "bondType": {"Sequential": None}},
            "EQ": {"balance": 2000, "rate": 0.0, "originBalance": 2000,
                   "originRate": 0.0, "startDate": "2021-06-15",
                   "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}},
        },
        "waterfall": {"Amortizing": [
            ["accrueAndPayInt", "acc01", ["A"]],
            ["payPrin", "acc01", ["A"]],
            ["payPrinResidual", "acc01", ["EQ"]],
        ]},
        "collect": [
            ["CollectedInterest", "acc01"],
            ["CollectedPrincipal", "acc01"],
            ["CollectedPrepayment", "acc01"],
        ],
        "status": ("PreClosing", "Amortizing"),
    })


POOL_ASSUMP = ("Pool",
    ("Mortgage", {"CDR": 0.01}, {"CPR": 0.05}, {"Rate": 0.7, "Lag": 18}, None),
    None, None)


def main():
    try:
        from absbox import API, EnginePath
    except ImportError:
        print("SKIP: absbox not installed (`pip install absbox`)")
        return 0

    deal = build_deal()
    api = API(EnginePath.DEV, lang='english', check=False)

    request = api.run(deal, poolAssump=POOL_ASSUMP, debug=True)
    body = json.loads(request)
    assert isinstance(body, dict) and body.get("tag"), "request serialisation failed"
    assert "aterfall" in request.lower(), "waterfall missing from request"
    print(f"OK: deal map serialises ({len(request)} bytes of request JSON)")

    if os.environ.get("ABSBOX_ENGINE", "").lower() == "dev":
        r = api.run(deal, poolAssump=POOL_ASSUMP, read=True)
        logs = r['result']['logs']
        print(f"OK: DEV run complete, {len(logs)} log rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
