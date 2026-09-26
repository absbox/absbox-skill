# Golden paths

Verified end-to-end recipes. Each was run against the public `DEV` engine
(`absbox` 0.52.x / Hastructure 0.52.x). Read the matching path before writing a
multi-step script — it carries the argument shapes and gotchas that are easy to
get wrong from the tables alone.

| Path | Goal |
|------|------|
| [01-minimal-abs](01-minimal-abs.md) | Smallest complete mortgage ABS: build, run, read |
| [02-assumptions-and-scenarios](02-assumptions-and-scenarios.md) | Pool assumptions, multi-scenario sensitivity |
| [03-triggers](03-triggers.md) | Performance trigger that switches deal status |
| [04-clo-waterfall](04-clo-waterfall.md) | CLO-style sequential tranches + OC/EOD trigger |
| [05-root-finder](05-root-finder.md) | Structuring to a target IRR with `runRootFinder` |
| [06-revolving](06-revolving.md) | Revolving pool that buys new assets |
| [07-loan-tape](07-loan-tape.md) | Map a real loan tape (pandas) into a pool |
| [08-fees-reserves](08-fees-reserves.md) | Fees, reserve targets, sweeps, inspection |

Keep test deals small: large responses can be truncated by proxies before they
reach the client.
