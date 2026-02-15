import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  extractNumericPrefix,
  loadAllModules
} from "../lib/modules/content-loader";

const createdDirs: string[] = [];

afterEach(() => {
  while (createdDirs.length > 0) {
    const dir = createdDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("extractNumericPrefix", () => {
  it("extracts prefix for 0, 06 and 21", () => {
    expect(extractNumericPrefix("0_S1 VIVRE AVEC ChatGPT.md")).toBe(0);
    expect(extractNumericPrefix("06_S1 VIVRE AVEC ChatGPT.md")).toBe(6);
    expect(extractNumericPrefix("21_S1 Un cadeau.md")).toBe(21);
  });
});

describe("loadAllModules", () => {
  it("throws a clear error for invalid frontmatter", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "module-test-"));
    createdDirs.push(tmpDir);

    fs.writeFileSync(
      path.join(tmpDir, "06_invalid.md"),
      `---
module_id: "06_invalid"
title: "Module invalide"
estimated_minutes: 10
quiz: []
---
Contenu`
    );

    expect(() => loadAllModules(tmpDir)).toThrow(/Invalid frontmatter/);
  });
});
