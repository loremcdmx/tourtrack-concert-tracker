import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../client/assets/app/ui/map/label-layout.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context);
const layout = (items, options) => JSON.parse(JSON.stringify(context.layoutMapLabels(items, options)));

function assertMembers(placements, expectedIds) {
  const members = placements.flatMap(placement => placement.members);
  assert.equal(new Set(members).size, members.length, 'every ID is represented once');
  assert.deepEqual([...members].sort(), [...expectedIds].sort());
}

function overlap(a, b, gap = 0) {
  return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x
    && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}

function assertGeometry(placements, options) {
  const { width, height, blocked = [], gap = 6 } = options;
  for (let index = 0; index < placements.length; index++) {
    const placement = placements[index];
    assert.ok(placement.x >= 8 && placement.y >= 8, 'placement respects the top/left margin');
    assert.ok(placement.x + placement.width <= width - 8 + 1e-8, 'placement respects right margin');
    assert.ok(placement.y + placement.height <= height - 8 + 1e-8, 'placement respects bottom margin');
    if (placement.compact) {
      assert.equal(placement.width, 48);
      assert.equal(placement.height, 28);
    }
    for (const rectangle of blocked) assert.equal(overlap(placement, rectangle, gap), false, 'map controls remain clear');
    for (let other = index + 1; other < placements.length; other++) {
      assert.equal(overlap(placement, placements[other], gap), false, 'labels do not collide');
    }
  }
}

test('mixed concert, artist, festival and city labels share one collision layout', () => {
  const items = [
    { id: 'concert:1', x: 300, y: 250, width: 200, height: 34, priority: 8 },
    { id: 'festival:1', x: 300, y: 250, width: 160, height: 40, priority: 10 },
    { id: 'artist:1', x: 300, y: 250, width: 130, height: 32, priority: 9 },
    { id: 'city:1', x: 310, y: 250, width: 100, height: 44, priority: 4 },
  ];
  const options = { width: 800, height: 600 };
  const placements = layout(items, options);
  assert.equal(placements[0].id, 'festival:1');
  assertMembers(placements, items.map(item => item.id));
  assertGeometry(placements, options);
});

test('500 coincident dense labels remain accessible without overlap or unstable input order', () => {
  const items = Array.from({ length: 500 }, (_, index) => ({
    id: `${index % 2 ? 'festival' : 'artist'}:${String(index).padStart(3, '0')}`,
    x: 600, y: 350, width: index % 2 ? 170 : 140, height: 34, priority: index % 7,
  }));
  const options = { width: 1_200, height: 700, gap: 6, maxOffset: 160 };
  const placements = layout(items, options);
  assert.ok(placements.length > 1 && placements.length < items.length);
  assert.ok(placements.some(placement => placement.members.length > 1));
  assertMembers(placements, items.map(item => item.id));
  assertGeometry(placements, options);
  for (const placement of placements) {
    assert.ok(Math.hypot(placement.x + placement.width / 2 - 600, placement.y + placement.height / 2 - 350) <= 160 + 1e-8);
  }
  assert.deepEqual(layout([...items].reverse(), options), placements);
});

test('edge anchors are clamped inside the viewport and outside anchors are excluded', () => {
  const items = [
    { id: 'top-left', x: 0, y: 0, width: 100, height: 40 },
    { id: 'top-right', x: 640, y: 0, width: 100, height: 40 },
    { id: 'bottom-left', x: 0, y: 480, width: 100, height: 40 },
    { id: 'bottom-right', x: 640, y: 480, width: 100, height: 40 },
    { id: 'outside-left', x: -0.1, y: 100, width: 100, height: 40 },
    { id: 'outside-bottom', x: 300, y: 480.1, width: 100, height: 40 },
  ];
  const options = { width: 640, height: 480, maxOffset: 160 };
  const placements = layout(items, options);
  assertMembers(placements, items.slice(0, 4).map(item => item.id));
  assertGeometry(placements, options);
  for (const placement of placements) {
    const anchor = items.find(item => item.id === placement.id);
    assert.ok(Math.hypot(placement.x + placement.width / 2 - anchor.x, placement.y + placement.height / 2 - anchor.y) <= 160);
  }
});

test('labels avoid sidebar, toolbar and zoom controls, even when anchors are behind them', () => {
  const options = {
    width: 1_000, height: 640, gap: 8,
    blocked: [
      { x: 0, y: 0, width: 220, height: 640 },
      { x: 220, y: 0, width: 780, height: 70 },
      { x: 920, y: 540, width: 80, height: 100 },
    ],
  };
  const items = Array.from({ length: 60 }, (_, index) => ({
    id: `control:${index}`, x: 190 + index % 5 * 140, y: 55 + index % 8 * 75,
    width: 150, height: 32, priority: index,
  }));
  const placements = layout(items, options);
  assertMembers(placements, items.map(item => item.id));
  assertGeometry(placements, options);
});

test('overflow merges by original anchor distance and shrinks the reserved rectangle in place', () => {
  const items = [
    { id: 'far', x: 100, y: 100, width: 100, height: 40, priority: 10 },
    { id: 'near', x: 500, y: 100, width: 100, height: 40, priority: 9 },
    { id: 'overflow', x: 480, y: 100, width: 1_000, height: 1_000, priority: 1 },
  ];
  const options = { width: 800, height: 300, maxOffset: 0 };
  const placements = layout(items, options);
  assertMembers(placements, items.map(item => item.id));
  const grouped = placements.find(placement => placement.id === 'near');
  assert.deepEqual(grouped.members, ['near', 'overflow']);
  assert.deepEqual([grouped.x, grouped.y, grouped.width, grouped.height], [476, 86, 48, 28]);
  assert.equal(grouped.compact, true);
  assert.equal(placements.find(placement => placement.id === 'far').width, 100);
  assertGeometry(placements, options);
});

test('a blocked first anchor remains represented if a later anchor can create a group', () => {
  const items = [
    { id: 'blocked-first', x: 0, y: 0, width: 80, height: 32, priority: 20 },
    { id: 'center', x: 200, y: 150, width: 80, height: 32, priority: 10 },
  ];
  const options = { width: 400, height: 300, maxOffset: 0 };
  const placements = layout(items, options);
  assertMembers(placements, items.map(item => item.id));
  assert.equal(placements.length, 1);
  assertGeometry(placements, options);
});

test('small full markers reserve an interactive area and frozen inputs are never mutated', () => {
  const items = Object.freeze([
    Object.freeze({ id: 'tiny', x: 120, y: 100, width: 8, height: 8, priority: 1 }),
    Object.freeze({ id: 'normal', x: 250, y: 150, width: 90, height: 30, priority: 2 }),
  ]);
  const blocked = Object.freeze([Object.freeze({ x: 0, y: 0, width: 40, height: 40 })]);
  const options = Object.freeze({ width: 400, height: 300, blocked });
  const before = JSON.stringify({ items, options });
  const placements = layout(items, options);
  assertMembers(placements, items.map(item => item.id));
  assertGeometry(placements, options);
  const tiny = placements.find(placement => placement.id === 'tiny');
  assert.deepEqual([tiny.width, tiny.height], [48, 28]);
  assert.equal(JSON.stringify({ items, options }), before);
});

test('a viewport without usable capacity and invalid viewport dimensions return no placements', () => {
  const items = [{ id: 'label', x: 40, y: 30, width: 90, height: 30 }];
  assert.deepEqual(layout(items, { width: 63, height: 43 }), []);
  assert.deepEqual(layout(items, { width: 80, height: 60, blocked: [{ x: 0, y: 0, width: 80, height: 60 }] }), []);
  assert.deepEqual(layout(items, { width: NaN, height: 300 }), []);
});
