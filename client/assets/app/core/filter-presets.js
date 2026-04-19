'use strict';

function presetRegionCodes(regionId) {
  return Object.entries(COUNTRY_MAP)
    .filter(([, value]) => value.r === regionId)
    .map(([code]) => code);
}

function _presetSet(codes) {
  return new Set((codes || []).filter(Boolean));
}

function getDisplayGeoPresetCodes(preset) {
  if (preset === 'eu') return _presetSet(presetRegionCodes('eu'));
  if (preset === 'na') return _presetSet(presetRegionCodes('na'));
  if (preset === 'americas') return _presetSet([...presetRegionCodes('na'), ...presetRegionCodes('sa')]);
  if (preset === 'latam') return _presetSet([...presetRegionCodes('sa'), 'MX']);
  if (preset === 'mx') return _presetSet(['MX']);
  if (preset === 'apac') return _presetSet([...presetRegionCodes('as'), ...presetRegionCodes('oc')]);
  if (preset === 'ukie') return _presetSet(['GB', 'IE']);
  if (preset === 'dach') return _presetSet(['DE', 'AT', 'CH']);
  if (preset === 'iberia') return _presetSet(['ES', 'PT']);
  if (preset === 'nordics') return _presetSet(['SE', 'NO', 'DK', 'FI', 'IS']);
  return null;
}

function applyScopePresetValues(set, preset) {
  const target = set || new Set();
  target.clear();

  if (preset === 'all') {
    Object.keys(COUNTRY_MAP).forEach(code => target.add(code));
    return target;
  }
  if (preset === 'eu+na') {
    [...presetRegionCodes('eu'), ...presetRegionCodes('na')].forEach(code => target.add(code));
    return target;
  }

  const codes = getDisplayGeoPresetCodes(preset);
  if (codes) codes.forEach(code => target.add(code));
  return target;
}

function _isoDateOnly(date) {
  return date.toISOString().split('T')[0];
}

function _shiftIsoDate(baseIso, days) {
  const date = baseIso ? new Date(baseIso + 'T12:00:00') : new Date();
  date.setDate(date.getDate() + days);
  return _isoDateOnly(date);
}

function presetMonthBounds(offsetMonths = 0, anchorDate = new Date()) {
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + offsetMonths, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { from: _isoDateOnly(start), to: _isoDateOnly(end) };
}

function presetQuarterBounds(offsetQuarters = 0, anchorDate = new Date()) {
  const startMonth = Math.floor(anchorDate.getMonth() / 3) * 3 + offsetQuarters * 3;
  const start = new Date(anchorDate.getFullYear(), startMonth, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
  return { from: _isoDateOnly(start), to: _isoDateOnly(end) };
}

function presetYearBounds(offsetYears = 0, anchorDate = new Date()) {
  const year = anchorDate.getFullYear() + offsetYears;
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function presetUpcomingWeekendBounds(todayIso) {
  const today = new Date((todayIso || _isoDateOnly(new Date())) + 'T12:00:00');
  const dow = today.getDay();
  const start = new Date(today);
  const end = new Date(today);

  if (dow >= 1 && dow <= 4) {
    start.setDate(today.getDate() + (5 - dow));
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 2);
  } else if (dow === 5) {
    end.setDate(today.getDate() + 2);
  } else if (dow === 6) {
    end.setDate(today.getDate() + 1);
  }

  return { from: _isoDateOnly(start), to: _isoDateOnly(end) };
}

function dateMatchesNamedPreset(dateStr, filter, ctx = {}) {
  const today = ctx.today || _isoDateOnly(new Date());
  if (!dateStr) return false;
  if (filter === 'all') return dateStr >= today;
  if (filter === '7') return dateStr >= today && dateStr <= _shiftIsoDate(today, 7);
  if (filter === '14') return dateStr >= today && dateStr <= _shiftIsoDate(today, 14);
  if (filter === '30') return dateStr >= today && dateStr <= _shiftIsoDate(today, 30);
  if (filter === '90') return dateStr >= today && dateStr <= _shiftIsoDate(today, 90);
  if (filter === '180') return dateStr >= today && dateStr <= _shiftIsoDate(today, 180);
  if (filter === 'year') {
    const { from, to } = presetYearBounds(0, new Date(today + 'T12:00:00'));
    return dateStr >= (today > from ? today : from) && dateStr <= to;
  }
  if (filter === 'nextyear') {
    const { from, to } = presetYearBounds(1, new Date(today + 'T12:00:00'));
    return dateStr >= from && dateStr <= to;
  }
  if (filter === 'thismonth') {
    const { from, to } = presetMonthBounds(0, new Date(today + 'T12:00:00'));
    return dateStr >= (today > from ? today : from) && dateStr <= to;
  }
  if (filter === 'nextmonth') {
    const { from, to } = presetMonthBounds(1, new Date(today + 'T12:00:00'));
    return dateStr >= from && dateStr <= to;
  }
  if (filter === 'thisquarter') {
    const { from, to } = presetQuarterBounds(0, new Date(today + 'T12:00:00'));
    return dateStr >= (today > from ? today : from) && dateStr <= to;
  }
  if (filter === 'nextquarter') {
    const { from, to } = presetQuarterBounds(1, new Date(today + 'T12:00:00'));
    return dateStr >= from && dateStr <= to;
  }
  if (filter === 'weekend') {
    const { from, to } = presetUpcomingWeekendBounds(today);
    return dateStr >= from && dateStr <= to;
  }
  if (filter === 'spring') {
    const month = parseInt(dateStr.slice(5, 7), 10);
    return month >= 3 && month <= 5;
  }
  if (filter === 'summer') {
    const month = parseInt(dateStr.slice(5, 7), 10);
    return month >= 6 && month <= 8;
  }
  if (filter === 'autumn') {
    const month = parseInt(dateStr.slice(5, 7), 10);
    return month >= 9 && month <= 11;
  }
  if (filter === 'winter') {
    const month = parseInt(dateStr.slice(5, 7), 10);
    return month === 12 || month <= 2;
  }
  if (filter === 'range') {
    const from = ctx.rangeFrom || today;
    const to = ctx.rangeTo || _shiftIsoDate(today, 365 * 3);
    return dateStr >= from && dateStr <= to;
  }
  return dateStr >= today;
}
