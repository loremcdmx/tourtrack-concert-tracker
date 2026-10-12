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
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function _isValidIsoDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00');
  return Number.isFinite(date.getTime()) && _isoDateOnly(date) === value;
}

function _dateRangeOverlaps(start, end, from, to) {
  return end >= from && (!to || start <= to) && (!to || from <= to);
}

function _dateRangeMatchesSeason(start, end, filter, today) {
  if (end < today) return false;
  const upcomingStart = start > today ? start : today;
  const firstYear = Number(upcomingStart.slice(0, 4));
  const lastYear = Number(end.slice(0, 4));
  const seasons = {
    spring: ['03-01', '05-31'],
    summer: ['06-01', '08-31'],
    autumn: ['09-01', '11-30'],
  };

  for (let year = firstYear; year <= lastYear; year += 1) {
    const yearIso = String(year).padStart(4, '0');
    if (filter === 'winter') {
      // The January/February and December windows join across New Year.
      const februaryEnd = _shiftIsoDate(`${yearIso}-03-01`, -1);
      if (_dateRangeOverlaps(upcomingStart, end, `${yearIso}-01-01`, februaryEnd)
        || _dateRangeOverlaps(upcomingStart, end, `${yearIso}-12-01`, `${yearIso}-12-31`)) return true;
    } else {
      const [from, to] = seasons[filter];
      if (_dateRangeOverlaps(upcomingStart, end, `${yearIso}-${from}`, `${yearIso}-${to}`)) return true;
    }
  }
  return false;
}

function dateRangeMatchesNamedPreset(startDate, endDate, filter, ctx = {}) {
  if (!_isValidIsoDateOnly(startDate)) return false;
  const end = _isValidIsoDateOnly(endDate) && endDate >= startDate ? endDate : startDate;
  const today = _isValidIsoDateOnly(ctx.today) ? ctx.today : _isoDateOnly(new Date());

  if (filter === 'range') {
    const from = _isValidIsoDateOnly(ctx.rangeFrom) ? ctx.rangeFrom : today;
    const to = _isValidIsoDateOnly(ctx.rangeTo) ? ctx.rangeTo : _shiftIsoDate(today, 365 * 3);
    return _dateRangeOverlaps(startDate, end, from, to);
  }
  if (['spring', 'summer', 'autumn', 'winter'].includes(filter)) {
    return _dateRangeMatchesSeason(startDate, end, filter, today);
  }
  if (['7', '14', '30', '90', '180'].includes(filter)) {
    return _dateRangeOverlaps(startDate, end, today, _shiftIsoDate(today, Number(filter)));
  }

  const anchor = new Date(today + 'T12:00:00');
  let bounds;
  if (filter === 'year') bounds = presetYearBounds(0, anchor);
  else if (filter === 'nextyear') bounds = presetYearBounds(1, anchor);
  else if (filter === 'thismonth') bounds = presetMonthBounds(0, anchor);
  else if (filter === 'nextmonth') bounds = presetMonthBounds(1, anchor);
  else if (filter === 'thisquarter') bounds = presetQuarterBounds(0, anchor);
  else if (filter === 'nextquarter') bounds = presetQuarterBounds(1, anchor);
  else if (filter === 'weekend') bounds = presetUpcomingWeekendBounds(today);

  if (bounds) {
    const from = bounds.from > today ? bounds.from : today;
    return _dateRangeOverlaps(startDate, end, from, bounds.to);
  }
  return end >= today;
}

function dateMatchesNamedPreset(dateStr, filter, ctx = {}) {
  return dateRangeMatchesNamedPreset(dateStr, dateStr, filter, ctx);
}
