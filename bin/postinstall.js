#!/usr/bin/env node
"use strict";

// Runs after `npm install -g absbox-skill` to register the skill with any
// already-detected agents. Deliberately does nothing for local installs or for
// npx cache installs (which run the bin explicitly), and never fails the
// install.

const { execFileSync } = require("child_process");
const path = require("path");

if (process.env.npm_config_global !== "true") process.exit(0);
if (process.env.ABSKILL_SKIP || process.env.ABSKILL_SKIP_POSTINSTALL) process.exit(0);

try {
  execFileSync(process.execPath, [path.join(__dirname, "install.js"), "--auto", "--quiet"], {
    stdio: "inherit",
  });
} catch {
  // Never break `npm install` because skill registration failed.
}

process.exit(0);
