# No unverified syntax

## Prompt

Write a waterfall for a deal that pays a recurring trustee fee and accrues then
pays interest on bonds `A1` and `A2`, then pays principal sequentially. Show the
fee definition and the actions.

## Expected behavior

The agent emits the **canonical** argument shapes and does not drift back to the
older wrong forms.

- `calcFee` takes only fee names: `["calcFee", "trusteeFee"]` — **not**
  `["calcFee", "acc01", ["trusteeFee"]]`.
- `calcInt` takes only bond names: `["calcInt", "A1", "A2"]` — **not**
  `["calcInt", "acc01", ["A1", "A2"]]`.
- `accrueAndPayInt` / `payPrinBySeq` take `(source, [names])`:
  `["accrueAndPayInt", "acc01", ["A1", "A2"]]`, `["payPrinBySeq", "acc01", ["A1", "A2"]]`.
- Recurring fee is `{"recurFee": [datePattern, amount]}` — **not**
  `{"recurFee": amount}`.
- It consults `golden-paths/` or `REFERENCE.md` before composing, rather than
  inventing syntax.

## Assertions

- `calcFee` is called with fee names only (no account, no nested list)
- `calcInt` is called with bond names only (no account)
- `recurFee` (if used) is `[datePattern, amount]`
- No syntax form appears that `REFERENCE.md` contradicts
- The agent reads `REFERENCE.md` §6/§9 or a golden path before writing
