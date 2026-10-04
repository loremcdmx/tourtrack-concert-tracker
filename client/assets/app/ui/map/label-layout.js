'use strict';

function layoutMapLabels(items, { width, height, blocked = [], gap = 6, maxOffset = 160 } = {}) {
  const viewportWidth = Number(width);
  const viewportHeight = Number(height);
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight)) return [];
  const margin = 8;
  const compactWidth = 48;
  const compactHeight = 28;
  if (viewportWidth < compactWidth + margin * 2 || viewportHeight < compactHeight + margin * 2) return [];
  const separation = Number.isFinite(Number(gap)) ? Math.max(0, Number(gap)) : 6;
  const limit = Number.isFinite(Number(maxOffset)) ? Math.max(0, Number(maxOffset)) : 160;
  const cellSize = 64;
  const cells = new Map();
  const placements = [];
  const pending = [];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const distanceSquared = (x, y, anchor) => (x - anchor.x) ** 2 + (y - anchor.y) ** 2;
  const compareIds = (a, b) => {
    const left = `${typeof a}:${String(a)}`;
    const right = `${typeof b}:${String(b)}`;
    return left < right ? -1 : left > right ? 1 : 0;
  };

  function visitCells(rectangle, padding, visit) {
    const minX = Math.floor((rectangle.x - padding) / cellSize);
    const maxX = Math.floor((rectangle.x + rectangle.width + padding) / cellSize);
    const minY = Math.floor((rectangle.y - padding) / cellSize);
    const maxY = Math.floor((rectangle.y + rectangle.height + padding) / cellSize);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) visit(`${x}:${y}`);
    }
  }

  function insert(rectangle) {
    visitCells(rectangle, 0, key => {
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(rectangle);
    });
  }

  function nearby(rectangle, padding = separation) {
    const found = new Set();
    visitCells(rectangle, padding, key => {
      for (const other of cells.get(key) || []) found.add(other);
    });
    return [...found];
  }

  function collides(rectangle) {
    return nearby(rectangle).some(other =>
      rectangle.x < other.x + other.width + separation
      && rectangle.x + rectangle.width + separation > other.x
      && rectangle.y < other.y + other.height + separation
      && rectangle.y + rectangle.height + separation > other.y
    );
  }

  for (const control of Array.isArray(blocked) ? blocked : []) {
    const x = Number(control?.x);
    const y = Number(control?.y);
    const controlWidth = Number(control?.width);
    const controlHeight = Number(control?.height);
    if (![x, y, controlWidth, controlHeight].every(Number.isFinite) || controlWidth <= 0 || controlHeight <= 0) continue;
    // Only the visible part matters; clipping also bounds the hash for oversized controls.
    const left = Math.max(0, x);
    const top = Math.max(0, y);
    const right = Math.min(viewportWidth, x + controlWidth);
    const bottom = Math.min(viewportHeight, y + controlHeight);
    if (right > left && bottom > top) insert({ x: left, y: top, width: right - left, height: bottom - top });
  }

  const ordered = (Array.isArray(items) ? items : [])
    .filter(item => Number.isFinite(item?.x) && Number.isFinite(item?.y)
      && item.x >= 0 && item.x <= viewportWidth && item.y >= 0 && item.y <= viewportHeight)
    .map(item => ({
      id: item.id, x: item.x, y: item.y,
      // A full label reserves enough space to be compacted inside its own rectangle later.
      width: Math.max(compactWidth, Number(item.width) || compactWidth),
      height: Math.max(compactHeight, Number(item.height) || compactHeight),
      priority: Number.isFinite(Number(item.priority)) ? Number(item.priority) : 0,
    }))
    .sort((a, b) => b.priority - a.priority || compareIds(a.id, b.id));

  function tryPlace(item, labelWidth, labelHeight, compact) {
    if (!Number.isFinite(labelWidth) || !Number.isFinite(labelHeight)
      || labelWidth > viewportWidth - margin * 2 || labelHeight > viewportHeight - margin * 2) return null;
    const minX = margin + labelWidth / 2;
    const maxX = viewportWidth - margin - labelWidth / 2;
    const minY = margin + labelHeight / 2;
    const maxY = viewportHeight - margin - labelHeight / 2;
    const baseX = clamp(item.x, minX, maxX);
    const baseY = clamp(item.y, minY, maxY);
    const candidates = new Map();
    const addCandidate = (x, y) => {
      const centerX = clamp(x, minX, maxX);
      const centerY = clamp(y, minY, maxY);
      const distance = distanceSquared(centerX, centerY, item);
      if (distance > limit * limit + 1e-8) return;
      candidates.set(`${centerX}:${centerY}`, { x: centerX, y: centerY, distance });
    };
    const stepX = labelWidth + separation;
    const stepY = labelHeight + separation;
    // At most 17 by 17 grid candidates, including vertical and horizontal stacks.
    const columns = Math.min(8, Math.ceil(limit / stepX));
    const rows = Math.min(8, Math.ceil(limit / stepY));
    for (let column = -columns; column <= columns; column++) {
      for (let row = -rows; row <= rows; row++) addCandidate(baseX + column * stepX, baseY + row * stepY);
    }

    // Edge candidates avoid missing a narrow gap beside a visible map control or label.
    const search = {
      x: Math.max(0, item.x - limit - labelWidth / 2),
      y: Math.max(0, item.y - limit - labelHeight / 2),
      width: 0, height: 0,
    };
    search.width = Math.min(viewportWidth, item.x + limit + labelWidth / 2) - search.x;
    search.height = Math.min(viewportHeight, item.y + limit + labelHeight / 2) - search.y;
    const obstacles = nearby(search).sort((a, b) => {
      const aDistance = distanceSquared(clamp(item.x, a.x, a.x + a.width), clamp(item.y, a.y, a.y + a.height), item);
      const bDistance = distanceSquared(clamp(item.x, b.x, b.x + b.width), clamp(item.y, b.y, b.y + b.height), item);
      return aDistance - bDistance || a.x - b.x || a.y - b.y || a.width - b.width || a.height - b.height;
    }).slice(0, 32);
    for (const obstacle of obstacles) {
      addCandidate(obstacle.x - separation - labelWidth / 2, baseY);
      addCandidate(obstacle.x + obstacle.width + separation + labelWidth / 2, baseY);
      addCandidate(baseX, obstacle.y - separation - labelHeight / 2);
      addCandidate(baseX, obstacle.y + obstacle.height + separation + labelHeight / 2);
    }

    const ranked = [...candidates.values()].sort((a, b) => a.distance - b.distance || a.y - b.y || a.x - b.x);
    for (const center of ranked) {
      const rectangle = {
        id: item.id,
        x: center.x - labelWidth / 2, y: center.y - labelHeight / 2,
        width: labelWidth, height: labelHeight,
        members: [item.id], compact,
        anchorX: item.x, anchorY: item.y,
      };
      if (!collides(rectangle)) return rectangle;
    }
    return null;
  }

  function mergeIntoNearest(item) {
    let nearest = placements[0];
    let bestDistance = Infinity;
    for (const placement of placements) {
      const distance = (placement.anchorX - item.x) ** 2 + (placement.anchorY - item.y) ** 2;
      if (distance < bestDistance) { nearest = placement; bestDistance = distance; }
    }
    if (!nearest) return false;
    nearest.members.push(item.id);
    if (!nearest.compact) {
      nearest.x += (nearest.width - compactWidth) / 2;
      nearest.y += (nearest.height - compactHeight) / 2;
      nearest.width = compactWidth;
      nearest.height = compactHeight;
      nearest.compact = true;
      // The compact rectangle is inside the old one. Existing hash cells remain
      // a conservative index, so no removal/reinsertion or new collision is needed.
    }
    return true;
  }

  for (const item of ordered) {
    const full = tryPlace(item, item.width, item.height, false);
    const placement = full || tryPlace(item, compactWidth, compactHeight, true);
    if (placement) {
      placements.push(placement);
      insert(placement);
    } else if (!mergeIntoNearest(item)) {
      // Another anchor may have free space even if this first anchor is blocked.
      pending.push(item);
    }
  }
  // maxOffset bounds new placements; overflow members use the nearest-anchor group.
  for (const item of pending) mergeIntoNearest(item);
  return placements.map(({ id, x, y, width: labelWidth, height: labelHeight, members, compact }) => ({
    id, x, y, width: labelWidth, height: labelHeight, members: [...members], compact,
  }));
}
