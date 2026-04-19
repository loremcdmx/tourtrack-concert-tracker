'use strict';

async function fetchFestivalsData() {
  const today = new Date().toISOString().split('T')[0];
  const geoTargets = buildFestivalGeoTargets();

  const batches = [];
  for (let i = 0; i < geoTargets.length; i += 5) {
    batches.push(geoTargets.slice(i, i + 5));
  }

  let pagesDone = 0;
  for (const batch of batches) {
    if (scanAborted) break;
    for (const geo of batch) {
      if (scanAborted) break;
      for (let page = 0; page < 3; page++) {
        if (scanAborted) break;
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc${geo}&startDateTime=${today}T00:00:00Z`;
        try {
          const response = await apiFetch(url);
          if (!response.ok) break;
          const data = await response.json();
          const events = data?._embedded?.events || [];
          if (!events.length) break;
          ingestFestEvents(events, null);
          pagesDone++;
          setProgress(`Festivals: user-geo sweep ${pagesDone} pages · ${festivals.length} found`, 87);
        } catch (error) {
          break;
        }
        await sleep(150);
      }
    }
  }

  const alwaysSweep = buildAlwaysSweepFestivalCountries();
  for (const countryCode of alwaysSweep) {
    if (scanAborted) break;
    for (let page = 0; page < 2; page++) {
      if (scanAborted) break;
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc&countryCode=${countryCode}&startDateTime=${today}T00:00:00Z`;
      try {
        const response = await apiFetch(url);
        if (!response.ok) break;
        const data = await response.json();
        const events = data?._embedded?.events || [];
        if (!events.length) break;
        ingestFestEvents(events, null);
        pagesDone++;
        setProgress(`Festivals: global sweep ${countryCode} · ${festivals.length} found`, 89);
      } catch (error) {
        break;
      }
      await sleep(150);
    }
  }

  for (let i = 0; i < KNOWN_FESTIVALS.length; i++) {
    if (scanAborted) break;
    const name = KNOWN_FESTIVALS[i];
    if (i % 10 === 0) {
      setProgress(`Festivals: named lookup ${i + 1}/${KNOWN_FESTIVALS.length} · ${festivals.length} found`, 91);
    }
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}&size=50&sort=date,asc&startDateTime=${today}T00:00:00Z`;
      const response = await apiFetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      ingestFestEvents(data?._embedded?.events || [], name);
    } catch (error) {}
    await sleep(80);
  }

  festivals = deduplicateFestivals(festivals);
  scoreFestivals();
  dblog('info', `Festivals: ${festivals.length} after dedup (geo: ${festivalGeoTargetCount(geoTargets)}, always-sweep: ${alwaysSweep.join(',')}, named: ${KNOWN_FESTIVALS.length})`);
}
