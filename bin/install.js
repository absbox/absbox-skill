#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const PKG_ROOT = path.join(__dirname, "..");
const PKG = readPkg();

const COLORS = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  dim: (s) => (COLORS ? `\x1b[2m${s}\x1b[0m` : s),
  bold: (s) => (COLORS ? `\x1b[1m${s}\x1b[0m` : s),
  green: (s) => (COLORS ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s) => (COLORS ? `\x1b[33m${s}\x1b[0m` : s),
  red: (s) => (COLORS ? `\x1b[31m${s}\x1b[0m` : s),
};

function readPkg() {
  try {
    return JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"));
  } catch {
    return { name: "absbox-skill", version: "0.0.0" };
  }
}

function skillName() {
  try {
    const raw = fs.readFileSync(path.join(PKG_ROOT, "SKILL.md"), "utf8");
    const m = raw.match(/^---\s*[\s\S]*?^name:\s*(\S+)/m);
    if (m) return m[1].replace(/["']/g, "");
  } catch {}
  return "absbox";
}

function home(...parts) {
  return path.join(os.homedir(), ...parts);
}

function globalOpencodeDir() {
  const base = process.env.XDG_CONFIG_HOME || home(".config");
  return path.join(base, "opencode", "skills");
}

function cwd(...parts) {
  return path.join(process.cwd(), ...parts);
}

const DESTINATIONS = [
  { id: "opencode", scope: "global", label: "opencode (global)", base: globalOpencodeDir, marker: () => fs.existsSync(path.join(process.env.XDG_CONFIG_HOME || home(".config"), "opencode")) },
  { id: "opencode", scope: "local", label: "opencode (project)", base: () => cwd(".opencode", "skills"), marker: () => fs.existsSync(cwd(".opencode")) },
  { id: "claude", scope: "global", label: "Claude (global)", base: () => home(".claude", "skills"), marker: () => fs.existsSync(home(".claude")) },
  { id: "claude", scope: "local", label: "Claude (project)", base: () => cwd(".claude", "skills"), marker: () => fs.existsSync(cwd(".claude")) },
  { id: "agents", scope: "global", label: "agents (global)", base: () => home(".agents", "skills"), marker: () => fs.existsSync(home(".agents")) },
  { id: "agents", scope: "local", label: "agents (project)", base: () => cwd(".agents", "skills"), marker: () => fs.existsSync(cwd(".agents")) },
];

function parseArgs(argv) {
  const opts = {
    scope: null, // "global" | "local" | null
    targets: new Set(), // agent ids
    dir: null,
    force: false,
    uninstall: false,
    auto: false,
    list: false,
    help: false,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fail(`Missing value for ${arg}`);
      return v;
    };
    if (arg === "-g" || arg === "--global") opts.scope = "global";
    else if (arg === "-l" || arg === "--local") opts.scope = "local";
    else if (arg === "-f" || arg === "--force") opts.force = true;
    else if (arg === "--uninstall" || arg === "--remove") opts.uninstall = true;
    else if (arg === "--auto") opts.auto = true;
    else if (arg === "--list") opts.list = true;
    else if (arg === "-q" || arg === "--quiet") opts.quiet = true;
    else if (arg === "-h" || arg === "--help") opts.help = true;
    else if (arg === "-t" || arg === "--target") {
      for (const t of next().split(",")) if (t.trim()) opts.targets.add(t.trim());
    } else if (arg.startsWith("--target=")) {
      for (const t of arg.slice("--target=".length).split(",")) if (t.trim()) opts.targets.add(t.trim());
    } else if (arg === "--dir") opts.dir = next();
    else if (arg.startsWith("--dir=")) opts.dir = arg.slice("--dir=".length);
    else if (!arg.startsWith("-")) for (const t of arg.split(",")) if (t.trim()) opts.targets.add(t.trim());
    else fail(`Unknown option: ${arg}`);
  }
  return opts;
}

function usage() {
  console.log(`${c.bold(PKG.name)} ${c.dim("v" + PKG.version)}
Install the absbox agent skill into one or more agent skill directories.

${c.bold("Usage")}
  npx ${PKG.name} [options]

${c.bold("Options")}
  -g, --global            Install into global skill dirs  (~/.config/opencode, ~/.claude, ~/.agents)
  -l, --local             Install into project skill dirs (./.opencode, ./.claude, ./.agents)
  -t, --target <list>     Limit to agents: opencode,claude,agents (default: all)
      --dir <path>        Install into an explicit base directory (skill folder created inside)
  -f, --force             Overwrite an existing skill folder without prompting
      --uninstall         Remove the skill from the selected destinations
      --list              Show all destinations and whether they are detected
      --auto              Install only where an agent is already detected (used by postinstall)
  -q, --quiet             Reduce output
  -h, --help              Show this help

${c.bold("Examples")}
  npx ${PKG.name}                        # global install to every detected agent
  npx ${PKG.name} --target claude        # Claude only
  npx ${PKG.name} --local                # into this project's ./.opencode, ./.claude, ./.agents
  npx ${PKG.name} --dir ~/my/skills      # explicit directory
  npx ${PKG.name} --uninstall            # remove from global installs
`);
}

function fail(msg) {
  console.error(c.red("error: ") + msg);
  process.exit(1);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

// Only the skill payload is copied into the agent directory — not the npm
// installer, package.json, or VCS metadata.
const PAYLOAD = ["SKILL.md", "REFERENCE.md", "README.md", "golden-paths", "evals", "scripts", "doc"];

function copyPayload(dest) {
  fs.mkdirSync(dest, { recursive: true });
  let copied = 0;
  for (const entry of PAYLOAD) {
    const s = path.join(PKG_ROOT, entry);
    if (!fs.existsSync(s)) continue;
    const d = path.join(dest, entry);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
    copied++;
  }
  if (!copied) fail(`No skill files found in ${PKG_ROOT}`);
}

function rmDir(dir) {
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}

function installTo(baseDir, name, opts) {
  const dest = path.join(baseDir, name);
  const existed = fs.existsSync(dest);
  if (existed && opts.force) fs.rmSync(dest, { recursive: true, force: true });
  copyPayload(dest);
  return { dest, action: existed ? "updated" : "installed" };
}

function selectDestinations(opts) {
  let dests = DESTINATIONS.slice();

  if (opts.targets.size) {
    const unknown = [...opts.targets].filter((t) => !["opencode", "claude", "agents"].includes(t));
    if (unknown.length) fail(`Unknown target(s): ${unknown.join(", ")} (use opencode, claude, agents)`);
    dests = dests.filter((d) => opts.targets.has(d.id));
  }

  if (opts.auto) {
    // Only touch destinations where the agent already exists; if none, use opencode global.
    const detected = dests.filter((d) => d.marker());
    const scoped = (detected.length ? detected : dests).filter((d) => d.scope === "global");
    if (scoped.length) return scoped;
    return dests.filter((d) => d.id === "opencode" && d.scope === "global");
  }

  if (opts.scope) dests = dests.filter((d) => d.scope === opts.scope);
  return dests;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    usage();
    return 0;
  }

  const name = skillName();

  if (opts.list) {
    console.log(`${c.bold(PKG.name)} ${c.dim("v" + PKG.version)} ${c.dim("(skill: " + name + ")")}`);
    for (const d of DESTINATIONS) {
      const base = d.base();
      const detected = d.marker() ? c.green("detected") : c.dim("not found");
      console.log(`  ${d.scope.padEnd(6)} ${d.id.padEnd(9)} ${detected}  ${c.dim(base)}`);
    }
    return 0;
  }

  if (opts.dir) {
    const base = opts.dir.startsWith("~") ? path.join(os.homedir(), opts.dir.slice(1)) : path.resolve(opts.dir);
    const dest = path.join(base, name);
    if (opts.uninstall) {
      const removed = rmDir(dest);
      if (!opts.quiet) console.log(removed ? c.green("removed ") + dest : c.dim("skip (absent) ") + dest);
      return 0;
    }
    fs.mkdirSync(base, { recursive: true });
    const r = installTo(base, name, { ...opts, force: true });
    if (!opts.quiet) console.log(c.green(`${r.action} `) + r.dest);
    return 0;
  }

  const dests = selectDestinations(opts);
  if (!dests.length) fail("No destinations selected. Use --global, --local, --target, or --dir.");

  let count = 0;
  for (const d of dests) {
    const base = d.base();
    const dest = path.join(base, name);
    if (opts.uninstall) {
      const removed = rmDir(dest);
      if (!opts.quiet) console.log((removed ? c.green("removed ") : c.dim("skip (absent) ")) + `${d.label}: ${dest}`);
      if (removed) count++;
      continue;
    }
    fs.mkdirSync(base, { recursive: true });
    const r = installTo(base, name, opts);
    if (!opts.quiet) console.log(c.green(`${r.action} `) + `${d.label}: ${r.dest}`);
    count++;
  }

  if (!opts.quiet) {
    const verb = opts.uninstall ? "Removed from" : "Installed to";
    console.log(c.bold(`${verb} ${count} location(s). Restart your agent to load the skill.`));
  }
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  if (process.env.ABSKILL_DEBUG) console.error(err);
  if (process.argv.includes("--auto")) process.exit(0);
  console.error(c.red("error: ") + (err && err.message ? err.message : String(err)));
  process.exit(1);
}
