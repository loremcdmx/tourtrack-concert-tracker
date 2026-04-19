'use strict';

function matchSetStatus(msg, cls) {
  const el = document.getElementById('match-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'match-status' + (cls ? ' ' + cls : '');
}
function matchSetProgress(done, total) {
  const bar = document.getElementById('match-progress');
  const fill = document.getElementById('match-prog-fill');
  if (bar) bar.style.display = '';
  if (fill) fill.style.width = (total ? done / total * 100 : 20) + '%';
}
function matchClearProgress() {
  const bar = document.getElementById('match-progress');
  if (bar) bar.style.display = 'none';
}

async function runMatch() {
  const raw = (document.getElementById('match-url').value || '').trim();
  const pid = spExtractId(raw);
  if (!pid) { matchSetStatus('⚠ Paste a valid Spotify playlist URL', 'err'); return; }
  if (!ARTISTS.length) { matchSetStatus('⚠ Load your playlist first (Settings → Import)', 'err'); return; }

  const btn = document.getElementById('match-btn');
  btn.disabled = true; btn.textContent = 'Loading…';
  matchSetStatus('Authenticating…');
  matchSetProgress(0, 0);

  try {
    const token = await spGetToken();
    matchSetStatus('Fetching her playlist…');

    // Wrap spFetchAllTracks to feed our progress bar
    const { playlist, tracks } = await (async () => {
      const res = await spFetch(`https://api.spotify.com/v1/playlists/${pid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
      const pl = await res.json();
      const trks = [];
      const total = pl.tracks.total;
      pl.tracks.items.forEach(i => { if (i?.track) trks.push(i.track); });
      matchSetProgress(trks.length, total);
      let next = pl.tracks.next;
      while (next) {
        const r = await spFetch(next, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) break;
        const page = await r.json();
        page.items.forEach(i => { if (i?.track) trks.push(i.track); });
        next = page.next;
        matchSetProgress(trks.length, total);
      }
      return { playlist: pl, tracks: trks };
    })();

    // Build her artist map
    matchHerMap = {};
    tracks.forEach(track => {
      if (!track || track.is_local) return;
      (track.artists || []).forEach(a => {
        const key = a.name.toLowerCase();
        if (!matchHerMap[key]) matchHerMap[key] = { name: a.name, count: 0 };
        matchHerMap[key].count++;
      });
    });

    // Find intersection with my artists
    matchShared = [];
    for (const myName of ARTISTS) {
      const key = myName.toLowerCase();
      if (matchHerMap[key]) {
        matchShared.push({
          name: myName,
          myCount:  ARTIST_PLAYS[key] || 0,
          herCount: matchHerMap[key].count,
          combined: (ARTIST_PLAYS[key] || 0) + matchHerMap[key].count,
        });
      }
    }
    matchShared.sort((a, b) => b.combined - a.combined);

    matchClearProgress();
    matchSetStatus(`✓ "${playlist.name}" · ${matchShared.length} shared artists`, 'ok');
    buildMatchPane();
    renderMatchMap();

  } catch(e) {
    matchClearProgress();
    matchSetStatus('⚠ ' + (e.message || 'Something went wrong'), 'err');
  } finally {
    btn.disabled = false; btn.textContent = '▶ Match';
  }
}

async function runMatchV2() {
  const raw = (document.getElementById('match-url').value || '').trim();
  const pid = spExtractId(raw);
  if (!pid) { matchSetStatus('Paste a valid Spotify playlist URL', 'err'); return; }
  if (!ARTISTS.length) { matchSetStatus('Load your playlist first (Settings -> Import)', 'err'); return; }

  const btn = document.getElementById('match-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Loading...';
  }
  matchSetStatus('Opening playlist...');
  matchSetProgress(0, 0);

  try {
    const { playlist, tracks } = await spFetchPlaylistImport(pid);
    matchSetProgress(tracks.length || 1, tracks.length || 1);

    matchHerMap = {};
    tracks.forEach(track => {
      if (!track || track.is_local) return;
      (track.artists || []).forEach(a => {
        const key = a.name.toLowerCase();
        if (!matchHerMap[key]) matchHerMap[key] = { name: a.name, count: 0 };
        matchHerMap[key].count++;
      });
    });

    matchShared = [];
    for (const myName of ARTISTS) {
      const key = myName.toLowerCase();
      if (matchHerMap[key]) {
        matchShared.push({
          name: myName,
          myCount: ARTIST_PLAYS[key] || 0,
          herCount: matchHerMap[key].count,
          combined: (ARTIST_PLAYS[key] || 0) + matchHerMap[key].count,
        });
      }
    }
    matchShared.sort((a, b) => b.combined - a.combined);

    matchClearProgress();
    matchSetStatus(`"${playlist.name}" · ${matchShared.length} shared artists`, 'ok');
    buildMatchPane();
    renderMatchMap();
  } catch (e) {
    matchClearProgress();
    if (e.status === 401 && SERVER_MANAGED_SPOTIFY_LOGIN) {
      setSpotifyAuthFlash('Connect Spotify to open private or collaborative playlists.', 'error');
      renderOnboardSpotifyAuth();
    }
    matchSetStatus('⚠ ' + (e.message || 'Something went wrong'), 'err');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '▶ Match';
    }
  }
}

function buildMatchPane() {
  const body = document.getElementById('match-body');
  if (!body) return;
  const today = new Date().toISOString().split('T')[0];

  if (!matchShared.length) {
    body.innerHTML = '<div style="padding:20px 14px;font-size:.6rem;color:var(--muted2);text-align:center">No shared artists found.</div>';
    return;
  }

  const frag = document.createDocumentFragment();

  // ── Shared concerts section ──
  const concertHd = document.createElement('div');
  concertHd.className = 'match-section-hd';
  const sharedWithShows = matchShared.filter(s => allTourData[s.name]);
  concertHd.innerHTML = `<span>🎸 Shared artists on tour</span><span class="match-section-cnt purple">${sharedWithShows.length}</span>`;
  frag.appendChild(concertHd);

  if (sharedWithShows.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px 14px;font-size:.6rem;color:var(--muted2)';
    empty.textContent = 'None of your shared artists have upcoming shows in the current data.';
    frag.appendChild(empty);
  } else {
    sharedWithShows.forEach(s => {
      const col = getColor(s.name);
      const evs = allTourData[s.name] || [];
      const next = evs.find(e => e.date >= today);
      const row = document.createElement('div');
      row.className = 'match-artist-row';
      row.innerHTML = `
        <div class="match-dot" style="background:${col}"></div>
        <div class="match-aname">${s.name}</div>
        <div class="match-plays">
          <span class="match-plays-me" title="Your plays">${s.myCount > 0 ? '▶ '+s.myCount : '·'}</span>
          <span class="match-plays-her" title="Her plays">♡ ${s.herCount}</span>
        </div>`;
      row.onclick = () => {
        // Switch to tours tab and focus this artist
        setTab('tours');
        focusArtist(s.name);
      };
      frag.appendChild(row);
    });
  }

  // ── Festival ranking section ──
  const festHd = document.createElement('div');
  festHd.className = 'match-section-hd';
  festHd.style.marginTop = '4px';

  // Score festivals by combined taste
  const scoredFests = matchScoreFestivals();
  const topFests = scoredFests.filter(f => f.matchScore > 0).slice(0, 30);
  festHd.innerHTML = `<span>🎪 Festivals for both of you</span><span class="match-section-cnt purple">${topFests.length}</span>`;
  frag.appendChild(festHd);

  if (!topFests.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px 14px;font-size:.6rem;color:var(--muted2)';
    empty.textContent = 'No festivals scored — scan data first.';
    frag.appendChild(empty);
  } else {
    const maxScore = topFests[0].matchScore || 1;
    topFests.forEach(f => {
      const scoreNorm = Math.round((f.matchScore / maxScore) * 100);
      const card = document.createElement('div');
      card.className = 'match-fcard';
      const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
      const myChips  = f.matchedMe.slice(0,3).map(m => `<span class="match-chip-me" title="Your list">▶ ${m}</span>`).join('');
      const herChips = f.matchedHer.slice(0,3).map(m => `<span class="match-chip-her" title="Her list">♡ ${m}</span>`).join('');
      const sharedChips = f.matchedShared.slice(0,4).map(m => `<span class="match-chip-shared">★ ${m}</span>`).join('');
      const extra = (f.matchedShared.length + f.matchedMe.length + f.matchedHer.length) > 7
        ? `<span class="match-chip-shared" style="opacity:.5">+${f.matchedShared.length + f.matchedMe.length + f.matchedHer.length - 7}</span>` : '';
      card.innerHTML = `
        <div class="match-fcard-top">
          <div class="match-fcard-ring">${scoreNorm}</div>
          <div class="match-fcard-info">
            <div class="match-fcard-name">${f.name}</div>
            <div class="match-fcard-meta">${fmtDate(f.date)} · ${loc}</div>
          </div>
          ${f.url ? `<a style="font-size:.52rem;color:var(--muted2);text-decoration:none;flex-shrink:0" href="${f.url}" target="_blank" onclick="event.stopPropagation()">Tickets</a>` : ''}
        </div>
        <div class="match-fcard-chips">${sharedChips}${myChips}${herChips}${extra}</div>
        <div class="match-fcard-bar"><div class="match-fcard-bar-fill" style="width:${scoreNorm}%"></div></div>`;
      card.onclick = e => {
        if (e.target.tagName === 'A') return;
        clearMapLayers(); renderFestMap(f.id);
      };
      frag.appendChild(card);
    });
  }

  body.innerHTML = '';
  body.appendChild(frag);
}

function matchScoreFestivals() {
  // Weight function — same tier system as scoreFestivals
  const pw = plays => {
    if (!plays || plays <= 0) return 0;
    if (plays === 1) return 2;
    if (plays <= 3)  return 5 + plays;
    if (plays <= 10) return 12 + plays * 0.5;
    return 20 + Math.log2(plays);
  };

  const mySet  = new Set(ARTISTS.map(a => a.toLowerCase()));
  const herSet = new Set(Object.keys(matchHerMap));
  const re = a => new RegExp(`(^|[^a-z])${(a||'').toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z]|$)`);

  return festivals.map(f => {
    const ll   = (f.lineup||[]).map(n => n.toLowerCase());
    const fn   = (f.name||'').toLowerCase();
    const test = name => {
      const r = re(name);
      return ll.length ? ll.some(l => r.test(l)) : r.test(fn);
    };

    const matchedShared = [], matchedMe = [], matchedHer = [];
    let score = 0;

    // My artists
    for (const myName of ARTISTS) {
      if (!test(myName)) continue;
      const key = myName.toLowerCase();
      const myW = pw(ARTIST_PLAYS[key] || 0);
      if (herSet.has(key)) {
        const herW = pw(matchHerMap[key].count);
        matchedShared.push(myName);
        score += (myW + herW) * 1.5; // shared = bonus
      } else {
        matchedMe.push(myName);
        score += myW;
      }
    }
    // Her-only artists
    for (const herKey of herSet) {
      if (mySet.has(herKey)) continue; // already handled
      const herName = matchHerMap[herKey].name;
      if (!test(herName)) continue;
      matchedHer.push(herName);
      score += pw(matchHerMap[herKey].count);
    }

    return { ...f, matchScore: score, matchedShared, matchedMe, matchedHer };
  }).sort((a, b) => b.matchScore - a.matchScore || a.date.localeCompare(b.date));
}

function renderMatchMap() {
  if (!lmap) { initMap(); }
  clearMapLayers();
  const today = new Date().toISOString().split('T')[0];
  const sharedNames = new Set(matchShared.map(s => s.name));

  // Plot only shared artist concerts
  let bounds = [];
  matchShared.forEach(s => {
    const evs = allTourData[s.name];
    if (!evs) return;
    const col = getColor(s.name);
    evs.forEach(ev => {
      if (!ev.lat || !ev.lng) return;
      const m = L.circleMarker([ev.lat, ev.lng], {
        radius: 7, color: '#e87fff', fillColor: col, fillOpacity: 0.85, weight: 2
      }).addTo(lmap);
      m.bindPopup(`<div style="font-family:'DM Mono',monospace;font-size:11px;line-height:1.6">
        <strong>${s.name}</strong><br>${fmtDate(ev.date)}<br>${ev.venue || ''}${ev.city ? ' · '+ev.city : ''}
        ${ev.url ? `<br><a href="${ev.url}" target="_blank" style="color:#e87fff">Tickets</a>` : ''}
      </div>`);
      tourMarkers.push(m);
      bounds.push([ev.lat, ev.lng]);
    });
  });

  if (bounds.length) {
    lmap.fitBounds(L.latLngBounds(bounds).pad(0.15), { maxZoom: 6 });
  }
}

// ── HONESTY PANE ────────────────────────────────────────────────
function buildHonestyPane() {
  const el = document.getElementById('honest-body');

  function item(tag, tagCls, text) {
    return `<div class="honest-item">
      <span class="honest-tag ${tagCls}">${tag}</span>
      <span class="honest-text">${text}</span>
    </div>`;
  }

  // Live diagnostics
  const totalArtists = ARTISTS.length;
  const hasData = concerts.length || festivals.length;
  const artistsWithShows = Object.keys(allTourData).length;
  const artistsNoShows = totalArtists - artistsWithShows;
  const dupeCheck = (() => {
    const raw  = concerts.length;
    const deduped = visibleConcerts().length;
    return raw - deduped;
  })();

  const scopeNote = countryMode === 'world'
    ? 'Worldwide — no country filter on API calls'
    : countryMode === 'include' && includeCountries.size > 1
      ? `⚠ Include-mode with ${includeCountries.size} countries — TM API only accepts 1 countryCode, so no server-side geo filter is active. All results fetched, filtered client-side. <strong>Slow + uses more quota.</strong>`
      : countryMode === 'include' && includeCountries.size === 1
        ? `1 country set — server-side filter active (fast)`
        : `Exclude mode — no server-side filter, client-side only`;

  el.innerHTML = `
<div class="honest-h1">✅ Fixed / shipped</div>

${item('FIXED', 'htag-fix', '<strong>attractionId fetch:</strong> Resolve each artist\'s TM <code>attractionId</code> first → query by ID, not keyword. Up to 1000 shows (5×200), no keyword noise. Keyword fallback retained for artists not in TM.')}
${item('FIXED', 'htag-fix', '<strong>Diacritic matching:</strong> "Síloé" finds "Siloe", "Arda Bogotá" finds "Arda Bogota". Two-pass: exact name → diacritic-normalized → ASCII fallback API request.')}
${item('FIXED', 'htag-fix', '<strong>Hi-Fi / substring false matches:</strong> Attraction name match now requires artist to appear at start or after a bill separator (×, &, +). "Mungos Hi Fi" no longer matches "Hi-Fi".')}
${item('FIXED', 'htag-fix', '<strong>Duplicate shows:</strong> Three-pass dedup — venue key, city+country, and city+country+date across sources. Catches TM + BIT returning same show independently.')}
${item('FIXED', 'htag-fix', '<strong>Multi-day festival date ranges:</strong> "Jun 26–28, 2026" or "Jun 30–Jul 2, 2026" displayed on all cards. endDate preserved through deduplication.')}
${item('FIXED', 'htag-fix', '<strong>Festival map labels with collision avoidance:</strong> Labels sorted by score (high priority first), each tries 6 positions; lowest-score label hides when all overlap. Recalculates on zoom so hidden labels can reappear.')}
${item('FIXED', 'htag-fix', '<strong>No USA / No CA / No UK geo filters:</strong> Applied to calendar, map markers, route lines, festival labels, and ON SCREEN panel simultaneously.')}
${item('FIXED', 'htag-fix', '<strong>Map sidebar collapsed by default:</strong> Floating tab buttons show on map edge. Clicking Tours/Fests/Match opens sidebar to the right tab.')}
${item('FIXED', 'htag-fix', '<strong>ON SCREEN panel respects all active filters:</strong> Geo, score, date, hidden artists — list matches exactly what\'s on the map.')}
${item('FIXED', 'htag-fix', '<strong>Concert card drawer:</strong> Click any concert row → bottom sheet with full concert info + artist photo (Deezer), top 8 Spotify tracks with real global popularity score (0–100), Spotify link. Uses existing Spotify Client Credentials — no extra OAuth needed.')}
${item('FIXED', 'htag-fix', '<strong>Map type ↔ sidebar tab sync:</strong> Selecting "Fests" on map switches sidebar to Festivals tab (and vice versa). No more showing concert list while fests-only map is active.')}
${item('FIXED', 'htag-fix', '<strong>Festival ticket links:</strong> When an artist\'s map marker is a festival appearance, "Tickets →" links to the festival page, not the individual concert listing.')}
${item('FIXED', 'htag-fix', '<strong>Stats bar, last-show badge, BIT cross-check, favorites, festival rescan progress bar.</strong> (Prior sessions.)')}

<div class="honest-h1">⚠ Active workarounds</div>

${item('HACK', 'htag-hack', '<strong>Festival lineup from TM attractions:</strong> TM only populates attractions[] if they explicitly linked performers. Most LatAm and smaller festivals return empty lineup → score = 0. Artist cross-reference via geo+venue+date is a best-effort workaround.')}
${item('HACK', 'htag-hack', '<strong>Concert drawer photo:</strong> Artist photo still from Deezer (no key needed). Tracks are Spotify top-tracks with real popularity score. If Spotify credentials are missing, tracks section shows a prompt.')}
${item('HACK', 'htag-hack', '<strong>Festival map popup artist list:</strong> TM often stores tour name as attraction instead of individual bands. "My artists" section may be empty for small fests where TM has no structured data.')}
${item('HACK', 'htag-hack', '<strong>Bandsintown CORS:</strong> BIT API called from browser. If CORS tightened, fallback silently returns [].')}
${item('HACK', 'htag-hack', '<strong>Multi-country speed:</strong> 30 EU countries = 30+ sequential API calls for festival discovery. ~10s in EU-include mode.')}
${item('HACK', 'htag-hack', '<strong>Artist matching is intentionally conservative:</strong> tribute / candlelight / cover-style events are filtered harder now, so a few edge-case promoter titles may still be skipped until Ticketmaster links the real attraction correctly.')}

<div class="honest-h1">📊 Live diagnostics</div>

${hasData ? `
${item('INFO', 'htag-limit', `Artists loaded: <strong>${totalArtists}</strong> · on tour: <strong>${artistsWithShows}</strong> · no shows found: <strong>${artistsNoShows}</strong>`)}
${item('INFO', 'htag-limit', `Concerts: <strong>${concerts.length}</strong> · Festivals: <strong>${festivals.length}</strong>`)}
${item('INFO', 'htag-limit', `Festival appearances in tour data: <strong>${concerts.filter(c=>c.isFest).length}</strong>`)}
${item('INFO', 'htag-limit', `BIT-sourced shows: <strong>${Object.values(allTourData).reduce((s,evs)=>s+evs.filter(e=>e._src==='bit').length,0)}</strong>`)}
${item('INFO', 'htag-limit', `Shows per artist (avg / max): <strong>${artistsWithShows ? Math.round(concerts.length / artistsWithShows) : 0} / ${Math.max(0, ...Object.values(allTourData).map(e => e.length))}</strong> — low is normal: TM only lists shows sold via TM.`)}
${dupeCheck > 0
  ? item('INFO', 'htag-limit', `<strong>${dupeCheck} probable duplicate entries</strong> hidden. ⧉ in map toolbar reveals them.`)
  : item('OK', 'htag-fix', 'No probable duplicates detected.')
}
${item('INFO', 'htag-limit', `Geo scope: ${scopeNote}`)}
` : item('INFO', 'htag-limit', 'No data loaded yet — run a scan to see live diagnostics.')}

<div class="honest-h1">🚧 Still needs engineering</div>

${item('TODO', 'htag-todo', '<strong>Festival lineup enrichment:</strong> No reliable free API. Setlist.fm (key needed) or Songkick would be better sources.')}

<div style="margin-top:16px;padding:8px 10px;background:var(--s2);border-radius:6px;border:1px solid var(--border);font-size:.58rem;color:var(--muted2);line-height:1.6">
  v${APP_VERSION} · Updated this session. All items above are observed behaviors, not theoretical edge cases.
</div>`;
}

function buildStats() {
  const el = document.getElementById('msb-stats');
  const today = new Date().toISOString().split('T')[0];
  const in30  = new Date(); in30.setDate(in30.getDate() + 30);
  const in30s = in30.toISOString().split('T')[0];
  const in90  = new Date(); in90.setDate(in90.getDate() + 90);
  const in90s = in90.toISOString().split('T')[0];

  const artistsOnTour = Object.keys(allTourData).length;
  if (!artistsOnTour) { if (el) el.style.display = 'none'; return; }
  // Show map filter bar when we have data
  const filtersEl = document.getElementById('msb-filters');
  if (filtersEl) {
    filtersEl.style.display = '';
    const maxVal = document.getElementById('mfilt-max-val');
    if (maxVal) maxVal.textContent = MAP_MAX_ARTISTS;
  }

  // Tours ending soon: last show is within 90 days, tour has ≥5 shows
  const endingSoon = Object.entries(allTourData).filter(([, evs]) => {
    if (evs.length < 5) return false;
    const last = evs[evs.length - 1].date;
    return last >= today && last <= in90s;
  });

  // Total upcoming shows
  const totalShows = Object.values(allTourData).reduce((s, evs) => s + evs.length, 0);

  // Source breakdown
  const bitShows = Object.values(allTourData).reduce((s, evs) =>
    s + evs.filter(e => e._src === 'bit').length, 0);

  const sep = '<span class="msb-stat-sep">·</span>';
  const items = [
    `<span class="msb-stat"><strong>${artistsOnTour}</strong> on tour</span>`,
    sep,
    `<span class="msb-stat"><strong>${totalShows}</strong> shows</span>`,
  ];
  if (endingSoon.length) {
    items.push(sep);
    items.push(`<span class="msb-stat" style="color:#ff8080"><strong>${endingSoon.length}</strong> tours ending <90d</span>`);
  }
  if (bitShows > 0) {
    items.push(sep);
    items.push(`<span class="msb-stat" title="Bandsintown supplemental data"><strong>${bitShows}</strong> via BIT</span>`);
  }

  el.innerHTML = items.join('');
  el.style.display = 'flex';
}
