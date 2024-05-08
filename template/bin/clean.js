const fs = require("node:fs/promises");
const path = require("node:path");

const nodeModules = [
  path.join(__dirname, "..", "node_modules"),
  path.join(__dirname, "..", "client", "node_modules"),
  path.join(__dirname, "..", "server", "node_modules"),
];

nodeModules.forEach((path) => {
  fs.rm(path, { recursive: true, force: true });
});

const packageLock = path.join(__dirname, "..", "package-lock.json");

fs.rm(packageLock, { force: true });
