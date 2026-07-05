import { test } from "node:test";
import assert from "node:assert/strict";
import { loadRegistry, findPlugin } from "./registry.js";

const RESERVED_COMMANDS = new Set(["run", "explain", "doctor", "plugins"]);

test("registry has no duplicate plugin names", () => {
  const { plugins } = loadRegistry();
  const names = plugins.map((plugin) => plugin.name);
  assert.deepEqual(names, [...new Set(names)]);
});

test("registry has no duplicate preset names", () => {
  const { presets } = loadRegistry();
  const names = presets.map((preset) => preset.name);
  assert.deepEqual(names, [...new Set(names)]);
});

test("no preset shadows a reserved CLI word", () => {
  const { presets } = loadRegistry();
  for (const preset of presets) {
    assert.ok(
      !RESERVED_COMMANDS.has(preset.name),
      `preset "${preset.name}" collides with a reserved CLI command`
    );
  }
});

test("every preset resolves to a concrete command and known plugins", () => {
  const registry = loadRegistry();
  for (const preset of registry.presets) {
    assert.ok(preset.command, `preset "${preset.name}" has no resolved command`);
    assert.ok(preset.plugins.length > 0, `preset "${preset.name}" has no plugins`);

    for (const pluginName of preset.plugins) {
      const plugin = findPlugin(registry, pluginName);
      assert.ok(plugin, `preset "${preset.name}" references unknown plugin "${pluginName}"`);
    }
  }
});

test("every preset includes the base plugin", () => {
  const { presets } = loadRegistry();
  for (const preset of presets) {
    assert.ok(preset.plugins.includes("base"), `preset "${preset.name}" does not include the base plugin`);
  }
});

test("extends chains resolve without leaving the extends pointer dangling", () => {
  const { presets } = loadRegistry();
  const byName = new Map(presets.map((preset) => [preset.name, preset]));
  for (const preset of presets) {
    if (preset.extends) {
      assert.ok(byName.has(preset.extends), `preset "${preset.name}" extends unknown preset "${preset.extends}"`);
    }
  }
});

test("every plugin has a non-empty name and description", () => {
  const { plugins } = loadRegistry();
  for (const plugin of plugins) {
    assert.ok(plugin.name.length > 0);
    assert.ok(plugin.description.length > 0);
  }
});
