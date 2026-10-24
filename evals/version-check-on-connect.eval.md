# Connect with the version check on

## Prompt

Connect to the production engine and run a deal. Also: what do I need to know
about client/engine version compatibility?

## Expected behavior

- Connects with the default (or explicitly `check=True`) —
  `API(EnginePath.PROD)`. It does **not** blanket-pass `check=False` and then
  warn about version mismatch in the same answer.
- States the rule correctly: the client's connect check compares only the
  **minor (tenth)** version segment; the major and patch segments are ignored
  (e.g. client 0.52.9 accepts server 0.52.13).
- Mentions how to observe versions: the connect banner
  (`local lib:x.y.z, server:x.y.z`) or `api.server_info` / `api.version`.
- If `check=False` is mentioned, it is framed as disabling a real safety check,
  not as the normal way to connect.

## Assertions

- The connection example does not pass `check=False` by default
- The minor-segment-only rule is stated (not "patch must match" / not
  "MAJOR.MINOR must match")
- At least one way to read the connected versions is given
- No self-contradiction between the connection call and the compatibility advice
