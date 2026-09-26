# Bond groups are structural

## Prompt

I have senior tranches `A1` and `A2` and a junior tranche `B`. Write the `bonds`
map and a waterfall that accrues and pays interest on the senior tranches
together, then pays principal sequentially through seniority.

## Expected behavior

- Defines the group by **nesting** the bonds under a group key:

  ```python
  "bonds": {"Senior": {"A1": {...}, "A2": {...}}, "B": {...}}
  ```

- References the group name in group actions:
  `["accrueAndPayIntByGroup", "acc01", "Senior", "byName"]` and
  `["payPrinByGroup", "acc01", "Senior", "byName"]`.
- Uses lowercase order values (`"byName"`, `"byMaturity"`, `"byCurRate"`,
  `"byProrata"`).
- Does **not** add a `"bondGroup": "Senior"` field inside an individual bond.

## Assertions

- Senior bonds are nested under a shared group key
- A group action references that group key
- The group order string is lowercase
- No `"bondGroup"` key appears inside a bond definition
