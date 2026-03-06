// test/plugin.test.js
const {normalize, transformWithESBuild, transformWithBabel} = require("./helper");

test("sets debugLabel from variable name (atom)", async () => {
  expect(normalize(
      await transformWithESBuild(`const clock = atom(new Date());`)
  )).toBe(normalize(`
    const clock = atom(/* @__PURE__ */ new Date());
    clock.debugLabel = "clock";
  `));
});

test("sets debugLabel from module name (atom)", async () => {
  expect(normalize(
      await transformWithESBuild(`export default atom(new Date());`, "test-module.js")
  )).toBe(normalize(`
    const test_module = atom(/* @__PURE__ */ new Date());
    test_module.debugLabel = "test-module";
    export default test_module;
  `));
});

test("sets debugLabel from variable name (signal)", async () => {
  expect(normalize(
      await transformWithESBuild(`const count = signal(0);`)
  )).toBe(normalize(`
    const count = signal(0);
    count.debugLabel = "count";
  `));
});

test("sets debugLabel from module name (signal)", async () => {
  expect(normalize(
      await transformWithESBuild(`export default signal(0);`, "my-signal.js")
  )).toBe(normalize(`
    const my_signal = signal(0);
    my_signal.debugLabel = "my-signal";
    export default my_signal;
  `));
});

test("uses directory name when filename is index", async () => {
  expect(normalize(
      await transformWithESBuild(`export default signal(0);`, "my-module/index.js")
  )).toBe(normalize(`
    const my_module = signal(0);
    my_module.debugLabel = "my-module";
    export default my_module;
  `));
});

test("sets debugLabel from variable name (computed)", async () => {
  expect(normalize(
      await transformWithESBuild(`const derived = computed(() => 0);`)
  )).toBe(normalize(`
    const derived = computed(() => 0);
    derived.debugLabel = "derived";
  `));
});

test("sets debugLabel from variable name (effect)", async () => {
  expect(normalize(
      await transformWithESBuild(`const dispose = effect(() => 0);`)
  )).toBe(normalize(`
    const dispose = effect(() => 0);
    dispose.debugLabel = "dispose";
  `));
});

test("sets debugLabel with member expression callee", async () => {
  expect(normalize(
      await transformWithESBuild(`const count = jotai.signal(0);`)
  )).toBe(normalize(`
    const count = jotai.signal(0);
    count.debugLabel = "count";
  `));
});

test("uses 'unknown' as display name when filename is not available", () => {
  expect(normalize(
      transformWithBabel(`export default atom(0);`)
  )).toBe(normalize(`
    const unknown = atom(0);
    unknown.debugLabel = "unknown";
    export default unknown;
  `));
});

test("uses 'unknown' when index.js is at the filesystem root", () => {
  expect(normalize(
      transformWithBabel(`export default atom(0);`, "/index.js")
  )).toBe(normalize(`
    const unknown = atom(0);
    unknown.debugLabel = "unknown";
    export default unknown;
  `));
});

test("does not set debugLabel for unrecognized call expressions", async () => {
  expect(normalize(
      await transformWithESBuild(`const a = foo();`)
  )).toBe(normalize(`const a = foo();`));
});

test("does not set debugLabel for destructured declarations", async () => {
  expect(normalize(
      await transformWithESBuild(`const [a] = signal();`)
  )).toBe(normalize(`const [a] = signal();`));
});
