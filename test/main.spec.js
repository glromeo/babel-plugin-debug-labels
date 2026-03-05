// test/plugin.test.js
const {normalize, transform} = require("./helper");

test("sets debugLabel from variable name (atom)", async () => {
  expect(normalize(
    await transform(`const clock = atom(new Date());`)
  )).toBe(normalize(`
    const clock = atom(/* @__PURE__ */ new Date());
    clock.debugLabel = "clock";
  `));
});

test("sets debugLabel from module name (atom)", async () => {
  expect(normalize(
    await transform(`export default atom(new Date());`, "test-module.js")
  )).toBe(normalize(`
    const test_module = atom(/* @__PURE__ */ new Date());
    test_module.debugLabel = "test-module";
    export default test_module;
  `));
});

test("sets debugLabel from variable name (signal)", async () => {
  expect(normalize(
    await transform(`const count = signal(0);`)
  )).toBe(normalize(`
    const count = signal(0);
    count.debugLabel = "count";
  `));
});

test("sets debugLabel from module name (signal)", async () => {
  expect(normalize(
    await transform(`export default signal(0);`, "my-signal.js")
  )).toBe(normalize(`
    const my_signal = signal(0);
    my_signal.debugLabel = "my-signal";
    export default my_signal;
  `));
});
