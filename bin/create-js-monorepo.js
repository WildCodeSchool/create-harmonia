#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import * as p from "@clack/prompts";
import { bold, cyan, grey } from "kleur/colors";
import Mustache from "mustache";
import { execSync } from "node:child_process";

const { version } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8")
);

console.log(`
${grey(`create-js-monorepo version ${version}`)}
`);

if (process.argv[2] == null) {
  throw new Error(
    "Please provide a project name, e.g. npm create @wildcodeschool/js-monorepo@latest my-project"
  );
}

let [org, name] = process.argv[2].split("/");

if (name == null) {
  name = org;
  org = null;
}

if (org == null) {
  org = await p.text({
    message: "What is your organization's name?",
    placeholder: "  (hit Enter to use an empty string)",
  });

  if (p.isCancel(org)) process.exit(1);

  if (org == null) {
    org = /** @type {string} */ ("{{ org }}");
  }
}

p.intro("Welcome to JS Monorepo!");

if (name === ".") {
  const dir = await p.text({
    message: "Where should we create your project?",
    placeholder: "  (hit Enter to use the current directory)",
  });

  if (p.isCancel(dir)) process.exit(1);

  if (dir) {
    name = /** @type {string} */ (dir);
  }
}

if (fs.existsSync(name)) {
  if (fs.readdirSync(name).length > 0) {
    const force = await p.confirm({
      message: "Directory not empty. Continue?",
      initialValue: false,
    });

    // bail if `force` is `false` or the user cancelled with Ctrl-C
    if (force !== true) {
      process.exit(1);
    }
  }
}

const destDir = path.resolve(process.cwd(), name);

const sCp = p.spinner();

sCp.start("Copying files");

fs.cpSync(new URL("../template", import.meta.url), destDir, {
  recursive: true,
});

sCp.stop("Copied files");

const sMustache = p.spinner();

sMustache.start("Tweaking things");

const data = { name, org, year: new Date().getFullYear() };

fs.writeFileSync(
  `${destDir}/package.json`,
  Mustache.render(
    fs.readFileSync(`${destDir}/package.template.json`, "utf8"),
    data
  )
);
fs.rmSync(`${destDir}/package.template.json`);

fs.writeFileSync(
  `${destDir}/package-lock.json`,
  Mustache.render(
    fs.readFileSync(`${destDir}/package-lock.template.json`, "utf8"),
    data
  )
);
fs.rmSync(`${destDir}/package-lock.template.json`);

fs.writeFileSync(
  `${destDir}/LICENSE.md`,
  Mustache.render(
    fs.readFileSync(`${destDir}/LICENSE.template.md`, "utf8"),
    data
  )
);
fs.rmSync(`${destDir}/LICENSE.template.md`);

fs.writeFileSync(
  `${destDir}/README.md`,
  Mustache.render(
    fs.readFileSync(`${destDir}/README.template.md`, "utf8"),
    data
  )
);
fs.rmSync(`${destDir}/README.template.md`);

fs.renameSync(`${destDir}/gitignore`, `${destDir}/.gitignore`);
fs.renameSync(`${destDir}/client/gitignore`, `${destDir}/client/.gitignore`);
fs.renameSync(`${destDir}/server/gitignore`, `${destDir}/server/.gitignore`);

fs.chmodSync(`${destDir}/.husky/commit-msg`, 0o775);
fs.chmodSync(`${destDir}/.husky/pre-commit`, 0o775);

sMustache.stop("Tweaked things");

const sGit = p.spinner();

sGit.start("Starting git");

execSync(
  `cd ${destDir} && git init && git add -A && git commit -m "Initial commit" -n`
);

sGit.stop("Started git");

p.outro("Your project is ready!");

console.log("\nNext steps:");
let i = 1;

const relative = path.relative(process.cwd(), name);

if (relative !== "") {
  console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`);
}

console.log(`  ${i++}: ${bold(cyan(`npm install`))}`);
console.log(
  `  ${i++}: ${bold(
    cyan(`cp client/.env.sample client/.env && nano client/.env`)
  )}`
);
console.log(
  `  ${i++}: ${bold(
    cyan(`cp server/.env.sample server/.env && nano server/.env`)
  )}`
);
console.log(`  ${i++}: ${bold(cyan(`npm run dev`))}`);

console.log(`\nUse ${bold(cyan("Ctrl-C"))} to halt the server.`);
console.log(
  `\nStuck? Visit us at ${cyan("https://documentation-harmonia.vercel.app/")}`
);
