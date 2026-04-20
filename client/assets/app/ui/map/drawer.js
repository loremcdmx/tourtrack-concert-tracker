'use strict';

function openConcertDrawer(ev) {
  const drawer = document.getElementById('concert-drawer');
  const backdrop = document.getElementById('cdr-backdrop');
  const concertPanel = document.getElementById('cdr-concert-panel');
  const artistPanel = document.getElementById('cdr-artist-panel');

  const col = getColor(ev.artist);
  const plays = ARTIST_PLAYS[(ev.artist||'').toLowerCase()] || 0;
  const fest = _festForConcert(ev);
  const today = new Date().toISOString().split('T')[0];
  const weekday = new Date(ev.date + 'T12:00:00').toLocaleString('en-US', { weekday:'long' });
  const loc = [ev.city, ev.state && ev.country === 'US' ? ev.state : '', ev.country ? flag(ev.country) : ''].filter(Boolean).join(' ');
  const tourShows = [...(
    allTourData[ev.artist] ||
    concerts.filter(c => _normText(c.artist) === _normText(ev.artist))
  )].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const upcomingShows = tourShows.filter(c => c.date >= today);
  const currentIdx = Math.max(0, upcomingShows.findIndex(c =>
    (c.id && ev.id && c.id === ev.id) ||
    (c.date === ev.date && _venueCore(c.venue) === _venueCore(ev.venue) && _cityCore(c.city) === _cityCore(ev.city))
  ));
  const strip = upcomingShows.slice(Math.max(0, currentIdx - 2), Math.max(0, currentIdx - 2) + 6);
  const sameDayPeers = _uniqueCI(concerts
    .filter(c =>
      c.date === ev.date &&
      _normText(c.artist) !== _normText(ev.artist) &&
      _venueCore(c.venue) === _venueCore(ev.venue) &&
      _cityCore(c.city) === _cityCore(ev.city))
    .map(c => c.artist));
  const festLineup = fest ? (fest.lineupResolved || _resolvedFestivalLineup(fest)) : [];
  const festTracked = fest ? (fest.matched || []) : [];
  const ticketUrl = fest?.url || ev.url || '';
  const tourStrip = strip.length ? `
    <div class="cdr-tour-strip">
      <div class="cdr-tour-head">Tour dates</div>
      <div class="cdr-tour-list">
        ${strip.map(stop => {
          const isCurrent = (
            (stop.id && ev.id && stop.id === ev.id) ||
            (stop.date === ev.date && _venueCore(stop.venue) === _venueCore(ev.venue) && _cityCore(stop.city) === _cityCore(ev.city))
          );
          return `
            <div class="cdr-tour-stop${isCurrent ? ' is-current' : ''}">
              <div class="cdr-tour-date">${esc2(fmtDate(stop.date))}</div>
              <div class="cdr-tour-main">${esc2(stop.city || stop.venue || 'Unknown city')}</div>
              <div class="cdr-tour-sub">${esc2(stop.venue || '')}${stop.country ? ` · ${flag(stop.country)}` : ''}</div>
            </div>`;
        }).join('')}
      </div>
    </div>` : '';
  const festCard = fest ? `
    <div class="cdr-fest-card">
      <div class="cdr-fest-head">
        <div>
          <div class="cdr-fest-name">${esc2(fest.name)}</div>
          <div class="cdr-fest-meta">${esc2(fmtDateRange(fest))}${fest.city ? ` · ${esc2(fest.city)}` : ''}${fest.country ? ` ${flag(fest.country)}` : ''}</div>
        </div>
        <div class="cdr-fest-match">${fest.score || 0}</div>
      </div>
      <div class="cdr-mini-note">
        ${festTracked.length ? `${festTracked.length} tracked artist${festTracked.length > 1 ? 's' : ''}` : 'No tracked lineup hits yet'}
        ${festLineup.length ? ` · lineup ${festLineup.length}` : ''}
      </div>
      ${(festTracked.length || festLineup.length) ? `
        <div class="cdr-badge-row" style="margin-top:8px">
          ${festTracked.slice(0, 4).map(m => `<span class="cdr-pill fest">${esc2(m.artist)}</span>`).join('')}
          ${festLineup.filter(name => !festTracked.some(m => _normText(m.artist) === _normText(name))).slice(0, 4).map(name => `<span class="cdr-pill meta">${esc2(name)}</span>`).join('')}
        </div>` : ''}
      ${fest.id ? `<div class="cdr-link-row"><a href="#" onclick="openFestDetail('${esc2(fest.id)}');return false;">Open festival</a></div>` : ''}
    </div>` : '';
  concertPanel.innerHTML = `
    <div class="cdr-label">Concert</div>
    <div class="cdr-title" style="color:${col}">${esc2(ev.artist)}</div>
    ${ev.eventName && _normText(ev.eventName) !== _normText(ev.artist) ? `<div class="cdr-mini-note">${esc2(ev.eventName)}</div>` : ''}
    <div class="cdr-badge-row">
      <span class="cdr-pill">${esc2(fmtDate(ev.date))}</span>
      <span class="cdr-pill meta">${esc2(weekday)}</span>
      ${fest ? `<span class="cdr-pill fest">Festival slot</span>` : ''}
      ${upcomingShows.length > 1 ? `<span class="cdr-pill meta">${upcomingShows.length} tour dates</span>` : ''}
    </div>
    <div class="cdr-kv-grid">
      <div class="cdr-kv">
        <div class="cdr-kv-label">Venue</div>
        <div class="cdr-kv-value">${esc2(ev.venue || 'Unknown venue')}</div>
      </div>
      <div class="cdr-kv">
        <div class="cdr-kv-label">Location</div>
        <div class="cdr-kv-value">${esc2(loc || 'Unknown location')}</div>
      </div>
      <div class="cdr-kv">
        <div class="cdr-kv-label">Source</div>
        <div class="cdr-kv-value">${esc2((ev._src || 'tm').toUpperCase())}</div>
      </div>
      <div class="cdr-kv">
        <div class="cdr-kv-label">Status</div>
        <div class="cdr-kv-value">${fest ? 'Festival appearance' : 'Headline / tour stop'}</div>
      </div>
    </div>
    <div class="cdr-link-row">
      ${ticketUrl ? `<a class="cdr-tkt-btn" href="${ticketUrl}" target="_blank">Tickets</a>` : ''}
      ${ev.url && fest && ev.url !== fest.url ? `<a href="${ev.url}" target="_blank">Artist event</a>` : ''}
    </div>
    ${sameDayPeers.length ? `<div class="cdr-mini-note">Same venue/day: ${esc2(sameDayPeers.slice(0, 5).join(', '))}${sameDayPeers.length > 5 ? ` +${sameDayPeers.length - 5}` : ''}</div>` : ''}
    ${tourStrip}
    ${festCard}
  `;

  artistPanel.innerHTML = `
    <div class="cdr-label">Artist</div>
    <div class="cdr-title" style="color:${col}">${esc2(ev.artist)}</div>
    <div class="cdr-badge-row">
      ${plays ? `<span class="cdr-pill">${plays} plays</span>` : ''}
      <span class="cdr-pill meta">${tourShows.length || 1} known shows</span>
      ${fest ? `<span class="cdr-pill fest">Festival linked</span>` : ''}
    </div>
    <div class="cdr-mini-note">${upcomingShows[0] ? `Next stop: ${esc2(fmtDate(upcomingShows[0].date))} · ${esc2(upcomingShows[0].city || upcomingShows[0].venue || '')}` : 'No more upcoming dates in current dataset'}</div>
    <a class="cdr-sp-btn" href="https://open.spotify.com/search/${encodeURIComponent(ev.artist)}" target="_blank">Open in Spotify</a>
    <div class="cdr-tracks-title" style="margin-top:16px">Top tracks</div>
    <div id="cdr-tracks-list" style="color:var(--muted);font-size:.58rem">Loading...</div>
  `;

  backdrop.style.display = '';
  drawer.classList.add('open');

  // Fetch artist photo + top tracks from Deezer
  _loadConcertDrawerData(ev.artist);
}

async function _loadConcertDrawerData(artist) {
  const tracksEl = document.getElementById('cdr-tracks-list');
  const artistPanel = document.getElementById('cdr-artist-panel');
  if (!tracksEl || !artistPanel) return;

  mountArtistPanelPhoto(artistPanel, artist);

  // ── 2. Top tracks from Spotify (client credentials, no OAuth) ─
  try {
    const token = await spGetToken();

    // Search for artist
    const sRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=5`,
      { headers: { Authorization: 'Bearer ' + token } }
    );
    const sData = await sRes.json();
    const items = sData.artists?.items || [];
    const al = artist.toLowerCase();
    const spArtist = items.find(a => a.name.toLowerCase() === al) || items[0];

    if (spArtist?.id) {
      const tRes = await fetch(
        `https://api.spotify.com/v1/artists/${spArtist.id}/top-tracks?market=US`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const tData = await tRes.json();
      const tracks = (tData.tracks || []).slice(0, 8);

      if (tracks.length) {
        tracksEl.innerHTML = '';
        tracks.forEach(t => {
          const pop = t.popularity || 0;
          const row = document.createElement('div');
          row.className = 'cdr-track';
          row.innerHTML = `
            <div class="cdr-track-play" title="Open on Spotify"
              onclick="event.preventDefault();event.stopPropagation();openExternalUrl('${t.external_urls?.spotify || '#'}');return false">▶</div>
            <div class="cdr-track-name">${t.name}</div>
            <div class="cdr-track-plays" title="Spotify popularity ${pop}/100"
              style="display:flex;align-items:center;gap:4px">
              <div style="width:28px;height:3px;border-radius:2px;background:var(--border2);overflow:hidden;flex-shrink:0">
                <div style="width:${pop}%;height:100%;background:var(--accent);border-radius:2px"></div>
              </div>
              <span>${pop}</span>
            </div>
          `;
          tracksEl.appendChild(row);
        });
      } else {
        tracksEl.textContent = 'No track data';
      }
    } else {
      tracksEl.textContent = 'Artist not found on Spotify';
    }
  } catch(e) {
    if (tracksEl) tracksEl.textContent = SERVER_MANAGED_SPOTIFY ? 'Could not load tracks' : 'Top tracks unavailable on this deployment';
  }
}

function closeConcertDrawer() {
  document.getElementById('concert-drawer')?.classList.remove('open');
  document.getElementById('cdr-backdrop').style.display = 'none';
}
