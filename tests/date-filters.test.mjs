import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';

const PRESETS_FILE = fileURLToPath(new URL('../client/assets/app/core/filter-presets.js', import.meta.url));
const presets = vm.createContext({});
vm.runInContext(readFileSync(PRESETS_FILE, 'utf8'), presets, { filename: PRESETS_FILE });

function localSnapshot(timeZone, now) {
  // A new process applies TZ before Date is initialized, including on Windows.
  const script = `
    const fs = require('node:fs');
    const vm = require('node:vm');
    const NativeDate = Date;
    const instant = NativeDate.parse(process.argv[2]);
    class FixedDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [instant])); }
      static now() { return instant; }
    }
    const context = vm.createContext({ Date: FixedDate });
    vm.runInContext(fs.readFileSync(process.argv[1], 'utf8'), context);
    const result = vm.runInContext('({' +
      'today: _isoDateOnly(new Date()),' +
      'month: presetMonthBounds(),' +
      'nextMonth: presetMonthBounds(1),' +
      'quarter: presetQuarterBounds(),' +
      'weekend: presetUpcomingWeekendBounds(),' +
      'todayVisible: dateMatchesNamedPreset(_isoDateOnly(new Date()), "all"),' +
      'yesterdayVisible: dateMatchesNamedPreset(_shiftIsoDate(_isoDateOnly(new Date()), -1), "all"),' +
      'monthEndVisible: dateMatchesNamedPreset(presetMonthBounds().to, "thismonth"),' +
      'nextMonthStartVisible: dateMatchesNamedPreset(presetMonthBounds(1).from, "nextmonth"),' +
      'leapMonth: presetMonthBounds(0, new Date(2028, 1, 15)),' +
      'shiftAcrossMonth: _shiftIsoDate("2026-01-31", 1),' +
      'shiftAcrossDst: _shiftIsoDate("2026-03-28", 2)' +
      '})', context);
    process.stdout.write(JSON.stringify(result));
  `;
  return JSON.parse(execFileSync(process.execPath, ['-e', script, PRESETS_FILE, now], {
    env: { ...process.env, TZ: timeZone },
    encoding: 'utf8',
  }));
}

for (const scenario of [
  { tz: 'Europe/Berlin', now: '2026-01-31T23:30:00Z', today: '2026-02-01', month: ['2026-02-01', '2026-02-28'], nextMonth: ['2026-03-01', '2026-03-31'], weekend: ['2026-02-01', '2026-02-01'] },
  { tz: 'America/Guatemala', now: '2026-02-01T02:30:00Z', today: '2026-01-31', month: ['2026-01-01', '2026-01-31'], nextMonth: ['2026-02-01', '2026-02-28'], weekend: ['2026-01-31', '2026-02-01'] },
  { tz: 'Pacific/Kiritimati', now: '2026-01-31T10:30:00Z', today: '2026-02-01', month: ['2026-02-01', '2026-02-28'], nextMonth: ['2026-03-01', '2026-03-31'], weekend: ['2026-02-01', '2026-02-01'] },
]) {
  test(`presets use the local day and inclusive month bounds in ${scenario.tz}`, () => {
    const result = localSnapshot(scenario.tz, scenario.now);
    assert.equal(result.today, scenario.today);
    assert.deepEqual(result.month, { from: scenario.month[0], to: scenario.month[1] });
    assert.deepEqual(result.nextMonth, { from: scenario.nextMonth[0], to: scenario.nextMonth[1] });
    assert.deepEqual(result.quarter, { from: '2026-01-01', to: '2026-03-31' });
    assert.deepEqual(result.weekend, { from: scenario.weekend[0], to: scenario.weekend[1] });
    assert.equal(result.todayVisible, true);
    assert.equal(result.yesterdayVisible, false);
    assert.equal(result.monthEndVisible, true);
    assert.equal(result.nextMonthStartVisible, true);
    assert.deepEqual(result.leapMonth, { from: '2028-02-01', to: '2028-02-29' });
    assert.equal(result.shiftAcrossMonth, '2026-02-01');
    assert.equal(result.shiftAcrossDst, '2026-03-30');
  });
}

test('upcoming presets include ongoing festivals and both overlap boundaries', () => {
  const matches = (start, end, filter) => presets.dateRangeMatchesNamedPreset(start, end, filter, { today: '2026-10-03' });
  assert.equal(matches('2026-10-01', '2026-10-04', 'all'), true);
  assert.equal(matches('2026-09-28', '2026-10-03', '7'), true);
  assert.equal(matches('2026-09-28', '2026-10-02', 'all'), false);
  assert.equal(matches('2026-09-01', '2026-11-01', '7'), true);
  assert.equal(matches('2026-10-10', '2026-10-12', '7'), true);
  assert.equal(matches('2026-10-11', '2026-10-12', '7'), false);
  assert.equal(matches('2026-09-30', '2026-10-04', 'thismonth'), true);
  assert.equal(matches('2026-10-31', '2026-11-02', 'nextmonth'), true);
  assert.equal(matches('2026-10-29', '2026-10-31', 'nextmonth'), false);
  assert.equal(matches('2026-12-31', '2027-01-02', 'nextquarter'), true);
  assert.equal(matches('2026-12-31', '2027-01-02', 'nextyear'), true);
  assert.equal(matches('2027-01-01', '2027-01-02', 'year'), false);
});

test('upcoming weekend includes a festival that started before Friday', () => {
  const matches = (start, end) => presets.dateRangeMatchesNamedPreset(start, end, 'weekend', { today: '2026-10-01' });
  assert.equal(matches('2026-10-01', '2026-10-02'), true);
  assert.equal(matches('2026-10-04', '2026-10-05'), true);
  assert.equal(matches('2026-09-30', '2026-10-01'), false);
  assert.equal(matches('2026-10-05', '2026-10-06'), false);
});

test('seasons match festival overlap, including winter across New Year', () => {
  const matches = (start, end, filter, today = '2026-10-03') => presets.dateRangeMatchesNamedPreset(start, end, filter, { today });
  assert.equal(matches('2026-11-30', '2026-12-02', 'winter'), true);
  assert.equal(matches('2026-12-30', '2027-01-02', 'winter'), true);
  assert.equal(matches('2027-02-27', '2027-03-02', 'winter'), true);
  assert.equal(matches('2027-03-01', '2027-03-02', 'winter'), false);
  assert.equal(matches('2025-12-30', '2026-01-02', 'winter'), false);
  assert.equal(matches('2028-02-28', '2028-02-29', 'winter', '2028-02-29'), true);
  assert.equal(matches('2027-02-28', '2027-03-02', 'spring'), true);
  assert.equal(matches('2027-05-31', '2027-06-02', 'summer'), true);
  assert.equal(matches('2027-08-31', '2027-09-02', 'autumn'), true);
});

test('missing, invalid or reversed end dates fall back to a single start day', () => {
  for (const end of [undefined, null, '', 'not-a-date', '2026-02-30', '2026-13-01', '2026-10-02']) {
    assert.equal(presets.dateRangeMatchesNamedPreset('2026-10-03', end, 'all', { today: '2026-10-03' }), true, String(end));
    assert.equal(presets.dateRangeMatchesNamedPreset('2026-10-03', end, 'all', { today: '2026-10-04' }), false, String(end));
  }
  for (const start of [undefined, null, '', 'not-a-date', '2026-02-29', '2026-02-30', '2026-13-01']) {
    assert.equal(presets.dateRangeMatchesNamedPreset(start, '2027-01-01', 'all', { today: '2026-10-03' }), false, String(start));
  }
  assert.equal(presets.dateRangeMatchesNamedPreset('2028-02-27', '2028-02-29', 'all', { today: '2028-02-29' }), true);
  assert.equal(presets.dateRangeMatchesNamedPreset('2027-02-27', '2027-02-29', 'all', { today: '2027-02-28' }), false);
});

test('an explicit past range includes overlapping festivals without an upcoming-only cutoff', () => {
  const ctx = { today: '2026-10-03', rangeFrom: '2026-09-10', rangeTo: '2026-09-15' };
  const matches = (start, end, extra = {}) => presets.dateRangeMatchesNamedPreset(start, end, 'range', { ...ctx, ...extra });
  assert.equal(matches('2026-09-08', '2026-09-10'), true);
  assert.equal(matches('2026-09-01', '2026-09-30'), true);
  assert.equal(matches('2026-09-15', '2026-09-16'), true);
  assert.equal(matches('2026-09-01', '2026-09-09'), false);
  assert.equal(matches('2026-09-16', '2026-09-20'), false);
  assert.equal(matches('2026-09-01', '2026-09-30', { rangeFrom: '2026-09-15', rangeTo: '2026-09-10' }), false);
  assert.equal(presets.dateMatchesNamedPreset('2026-09-12', 'range', ctx), true);
});

test('Ticketmaster ingestion preserves a multi-day festival end date', () => {
  const context = vm.createContext({
    _normText: value => String(value || '').toLowerCase(),
    isFestivalLikeEvent: () => true,
    _canonicalFestivalName: names => names.find(Boolean),
    _festivalLineupFromEvent: () => ['Alpha'],
    _uniqueCI: values => [...new Set(values)],
  });
  const file = fileURLToPath(new URL('../client/assets/app/scan/festivals/ingest.js', import.meta.url));
  vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
  const event = {
    id: 'alpha-fest', name: 'Alpha Festival',
    dates: { start: { localDate: '2026-12-30' }, end: { localDate: '2027-01-02' } },
    classifications: [{ segment: { name: 'Music' } }],
    _embedded: { venues: [{ name: 'Festival Grounds', city: { name: 'Berlin' }, country: { countryCode: 'DE' }, location: { latitude: '52.52', longitude: '13.405' } }] },
  };
  const record = context.buildFestivalRecordFromEvent(event, 'Alpha Festival');
  assert.equal(record.date, '2026-12-30');
  assert.equal(record.endDate, '2027-01-02');
  event.dates.end.localDate = '2026-12-29';
  assert.equal(context.buildFestivalRecordFromEvent(event, 'Alpha Festival').endDate, undefined);
});
