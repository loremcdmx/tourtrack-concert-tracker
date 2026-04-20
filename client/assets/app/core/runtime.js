'use strict';
const APP_VERSION = '2.23.0001'; // x.y.zzzz — x=major feature, y=builds, z=changes in build

// ═══════════════════════════════════════════════════════════════
const SERVER_CONFIG = window.__SERVER_CONFIG__ || {};
const INTERNAL_PROXY_TEMPLATE = SERVER_CONFIG.internalProxyTemplate || '';
const SERVER_TM_PLACEHOLDER = SERVER_CONFIG.ticketmasterPlaceholder || '__SERVER__';
const SERVER_MANAGED_TICKETMASTER = !!SERVER_CONFIG.ticketmasterManaged;
const SERVER_MANAGED_SPOTIFY = !!SERVER_CONFIG.spotifyManaged;
const SERVER_MANAGED_SPOTIFY_LOGIN = !!SERVER_CONFIG.spotifyLoginManaged;
const LOCAL_SETUP_ALLOWED = !!SERVER_CONFIG.localSetupAllowed;
const SPOTIFY_REDIRECT_URI_HINT = SERVER_CONFIG.spotifyRedirectUri || `${window.location.origin}/api/auth/spotify/callback`;
const INTERNAL_PROXY_HOSTS = new Set([
  'app.ticketmaster.com',
  'ticketmaster.com',
  'www.ticketmaster.com',
  'rest.bandsintown.com',
  'api.deezer.com',
  'api.spotify.com',
  'accounts.spotify.com',
]);
const nativeFetch = window.fetch.bind(window);

function buildInternalProxyUrl(rawUrl) {
  return INTERNAL_PROXY_TEMPLATE
    ? INTERNAL_PROXY_TEMPLATE.replace('{url}', encodeURIComponent(rawUrl))
    : rawUrl;
}

function shouldUseInternalProxy(rawUrl) {
  if (!INTERNAL_PROXY_TEMPLATE) return false;
  try {
    const resolved = new URL(rawUrl, window.location.href);
    if (resolved.origin === window.location.origin) return false;
    return INTERNAL_PROXY_HOSTS.has(resolved.hostname);
  } catch(e) {
    return false;
  }
}

window.fetch = function(input, init = {}) {
  const rawUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : '';
  if (!rawUrl || !shouldUseInternalProxy(rawUrl)) {
    return nativeFetch(input, init);
  }
  const nextInit = { ...init, credentials: 'same-origin' };
  delete nextInit.mode;
  return nativeFetch(buildInternalProxyUrl(rawUrl), nextInit);
};

// DATA
// ═══════════════════════════════════════════════════════════════
const COUNTRY_MAP = {
  GB:{n:'UK',f:'🇬🇧',r:'eu'}, DE:{n:'Germany',f:'🇩🇪',r:'eu'}, FR:{n:'France',f:'🇫🇷',r:'eu'},
  NL:{n:'Netherlands',f:'🇳🇱',r:'eu'}, BE:{n:'Belgium',f:'🇧🇪',r:'eu'}, ES:{n:'Spain',f:'🇪🇸',r:'eu'},
  IT:{n:'Italy',f:'🇮🇹',r:'eu'}, SE:{n:'Sweden',f:'🇸🇪',r:'eu'}, DK:{n:'Denmark',f:'🇩🇰',r:'eu'},
  NO:{n:'Norway',f:'🇳🇴',r:'eu'}, FI:{n:'Finland',f:'🇫🇮',r:'eu'}, PL:{n:'Poland',f:'🇵🇱',r:'eu'},
  CZ:{n:'Czechia',f:'🇨🇿',r:'eu'}, AT:{n:'Austria',f:'🇦🇹',r:'eu'}, CH:{n:'Switzerland',f:'🇨🇭',r:'eu'},
  PT:{n:'Portugal',f:'🇵🇹',r:'eu'}, IE:{n:'Ireland',f:'🇮🇪',r:'eu'}, HU:{n:'Hungary',f:'🇭🇺',r:'eu'},
  RO:{n:'Romania',f:'🇷🇴',r:'eu'}, GR:{n:'Greece',f:'🇬🇷',r:'eu'}, HR:{n:'Croatia',f:'🇭🇷',r:'eu'},
  SK:{n:'Slovakia',f:'🇸🇰',r:'eu'}, BG:{n:'Bulgaria',f:'🇧🇬',r:'eu'}, RS:{n:'Serbia',f:'🇷🇸',r:'eu'},
  LT:{n:'Lithuania',f:'🇱🇹',r:'eu'}, LV:{n:'Latvia',f:'🇱🇻',r:'eu'}, EE:{n:'Estonia',f:'🇪🇪',r:'eu'},
  IS:{n:'Iceland',f:'🇮🇸',r:'eu'}, LU:{n:'Luxembourg',f:'🇱🇺',r:'eu'}, UA:{n:'Ukraine',f:'🇺🇦',r:'eu'},
  TR:{n:'Turkey',f:'🇹🇷',r:'eu'},
  US:{n:'USA',f:'🇺🇸',r:'na'}, CA:{n:'Canada',f:'🇨🇦',r:'na'}, MX:{n:'Mexico',f:'🇲🇽',r:'na'},
  BR:{n:'Brazil',f:'🇧🇷',r:'sa'}, AR:{n:'Argentina',f:'🇦🇷',r:'sa'}, CL:{n:'Chile',f:'🇨🇱',r:'sa'},
  CO:{n:'Colombia',f:'🇨🇴',r:'sa'}, PE:{n:'Peru',f:'🇵🇪',r:'sa'}, UY:{n:'Uruguay',f:'🇺🇾',r:'sa'},
  JP:{n:'Japan',f:'🇯🇵',r:'as'}, KR:{n:'S. Korea',f:'🇰🇷',r:'as'}, CN:{n:'China',f:'🇨🇳',r:'as'},
  IN:{n:'India',f:'🇮🇳',r:'as'}, SG:{n:'Singapore',f:'🇸🇬',r:'as'}, TH:{n:'Thailand',f:'🇹🇭',r:'as'},
  PH:{n:'Philippines',f:'🇵🇭',r:'as'}, ID:{n:'Indonesia',f:'🇮🇩',r:'as'}, MY:{n:'Malaysia',f:'🇲🇾',r:'as'},
  TW:{n:'Taiwan',f:'🇹🇼',r:'as'}, HK:{n:'Hong Kong',f:'🇭🇰',r:'as'},
  AU:{n:'Australia',f:'🇦🇺',r:'oc'}, NZ:{n:'New Zealand',f:'🇳🇿',r:'oc'},
  AE:{n:'UAE',f:'🇦🇪',r:'me'}, IL:{n:'Israel',f:'🇮🇱',r:'me'}, SA:{n:'Saudi Arabia',f:'🇸🇦',r:'me'},
  QA:{n:'Qatar',f:'🇶🇦',r:'me'},
  ZA:{n:'S. Africa',f:'🇿🇦',r:'af'}, NG:{n:'Nigeria',f:'🇳🇬',r:'af'}, KE:{n:'Kenya',f:'🇰🇪',r:'af'},
  EG:{n:'Egypt',f:'🇪🇬',r:'af'}, MA:{n:'Morocco',f:'🇲🇦',r:'af'},
};

const REGIONS = [
  {id:'eu',lbl:'Europe',e:'🇪🇺'}, {id:'na',lbl:'N. America',e:'🌎'},
  {id:'sa',lbl:'S. America',e:'🌎'}, {id:'as',lbl:'Asia',e:'🌏'},
  {id:'oc',lbl:'Oceania',e:'🌏'}, {id:'me',lbl:'Middle East',e:'🌍'},
  {id:'af',lbl:'Africa',e:'🌍'},
];

const ARTIST_COLORS = [
  '#c8ff5f','#ff5f5f','#5fc8ff','#ffaa3c','#c85fff',
  '#5fffb8','#ff5faa','#5fd4ff','#ffdd5f','#5fff80',
  '#ff885f','#5faeff','#ff5fd4','#88ff5f','#ff5f88',
];

const KNOWN_FESTIVALS = [
  // UK & Ireland
  'Glastonbury Festival','Reading Festival','Leeds Festival','Download Festival',
  'Latitude Festival','Isle of Wight Festival','Green Man Festival','End of the Road',
  'TRNSMT','Electric Picnic','Body & Soul','All Points East','Field Day','Boardmasters',
  'Kendal Calling','2000trees Festival','Truck Festival','Victorious Festival',
  'Standon Calling','Boomtown Fair','Houghton Festival','Wilderness Festival',
  'Bluedot Festival','Community Festival','Cross the Tracks',
  // Europe
  'Primavera Sound','Primavera Sound Barcelona','Primavera Sound Madrid','Primavera Sound Porto',
  'Rock Werchter','Roskilde Festival','Pinkpop','Pukkelpop',
  'Hurricane Festival','Southside Festival','Rock am Ring','Rock im Park','Melt Festival',
  'Sziget Festival','Hellfest','Rock en Seine','Les Vieilles Charrues','NOS Alive',
  'Paredes de Coura','Super Bock Super Rock','Way Out West','Mad Cool Festival',
  'FIB Benicassim','Bilbao BBK Live','Flow Festival','Tuska Open Air','Montreux Jazz Festival',
  'Colours of Ostrava','Best Kept Secret','DGTL Amsterdam','Lowlands Festival',
  'Down the Rabbit Hole','Untold Festival','Copenhell','Reeperbahn Festival',
  'Lido Sounds','Frequency Festival','Oya Festival','Tons of Rock','Bergenfest',
  'Pohoda Festival','OFF Festival','Opener Festival','Sonar Festival','Sonar Barcelona',
  // North America
  'Lollapalooza','Coachella','Bonnaroo','Outside Lands','Governors Ball',
  'Pitchfork Music Festival','Riot Fest','Austin City Limits','Electric Forest',
  'Firefly Festival','Osheaga','Shaky Knees','Forecastle Festival',
  'Desert Daze','Voodoo Fest','Hangout Music Festival','Electric Zoo',
  'Bottlerock Napa','Made in America','Camp Flog Gnaw','Life is Beautiful',
  'Boston Calling','Innings Festival','Broccoli City Festival','Summerfest',
  'When We Were Young','Rolling Loud','Rolling Loud Miami','Rolling Loud Los Angeles',
  'Vans Warped Tour','Electric Daisy Carnival','Ultra Music Festival',
  // Mexico — use exact TM names
  'Corona Capital','Tecate Pal Norte','Pal Norte','Pa\'l Norte',
  'Vive Latino','Tecate Vive Latino','Tecate Emblema','Tecate Sonoro','Tecate Comuna',
  'Bahidora','Bahidorá','Festival Nrmal','Coordenada','Machaca Fest','AXE Ceremonia','Ceremonia','Arre',
  'BPM Festival','BPM Festival Mexico','Hipnosis Festival',
  // LatAm
  'Lollapalooza Argentina','Lollapalooza Brasil','Lollapalooza Chile','Lollapalooza Colombia',
  'Cosquin Rock','Rock al Parque','Estéreo Picnic','Stereo Picnic',
  'Creamfields Brasil','Creamfields Chile','Tomorrowland Brasil',
  'Time Warp Colombia','Afropunk Johannesburg','Afropunk Brooklyn',
  // Asia & Oceania
  'Fuji Rock Festival','Summer Sonic','Splendour in the Grass','Laneway Festival',
  'Beyond the Valley','Clockenflap','Neon Lights','Head in the Clouds',
  // Global
  'Tomorrowland','Creamfields','Afropunk',
];

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
let API_KEY = '', ARTISTS = []; // plain string names — used throughout
let TM_KEYS = [];      // { key, label, exhausted }[] — auto-rotated on quota exhaustion
let _activeKeyIdx = 0; // index of currently active key in TM_KEYS
let ARTIST_PLAYS = {};          // name.toLowerCase() → play count (parsed from "Artist 14" format)

let countryMode = 'include';          // 'world' | 'include' | 'exclude'
let includeCountries = new Set();
let excludeCountries = new Set();
let calGeoFilter = new Set();         // Set of region IDs currently shown in calendar (empty = all)
let calGeoExpanded = null;            // which region is expanded to show country chips
let dateFilter = 'all', showShows = true, showFests = true;
let geoPreset = 'all';
let calView = 'all';           // 'all' | 'mx'
let mxSort  = 'date';          // 'date' | 'rank' (Mexico tab sort)
let concerts = [], festivals = [], hiddenArtists = {};
let snoozeTarget = '';
let scanAborted = false, cacheTimestamp = 0;

// Map state
let lmap = null;
let tourMarkers = [], festMarkers = [], routeLines = [];
let showMapTours = true, showMapFests = true;
// Map-specific filters (independent of calendar filters)
let mapTypeFilter  = 'both'; // 'both' | 'tours' | 'fests'
let mapScoreFilter = 0;      // 0–4, same scale as calScoreFilter / SCORE_ARTIST_MIN
let mapDateMode    = 'all';  // 'all' | 'week' | 'month' | 'range'
let mapDateFrom    = '';     // ISO date, range start
let mapDateTo      = '';     // ISO date, range end
let focusedArtist = null, focusedFest = null;
let sidebarTab = 'tours', festSort = 'score', artistSort = 'list';
let artistPreset = 'all';
let showUnrankedFests = true; // show/hide zero-score festivals in the fests panel
let artistColors = {}, colorIdx = 0;

// Match state
let matchHerMap = {};      // name.toLowerCase() → { name, count }  (her playlist)
let matchShared = [];      // [{ name, myCount, herCount, combined }] sorted by combined desc
let allTourData = {};

// Favorites + play-count filter
let favoriteArtists = new Set();  // lowercase artist names
// calPlaysFilter removed — use calScoreFilter + scoreOkArtist/scoreOkFest instead

// Fetch errors — persists across scan for error tab
let fetchErrors = {};  // artist → { attempts, lastErr, resolved }
window._scanActive = false; // true while a scan is in progress — prevents showOnboard() during scan

// ═══════════════════════════════════════════════════════════════
// PROFILES
// ─────────────────────────────────────────────────────────────
// A "profile" is a named set of { artists[], plays{} } that drives
// all scoring — which concerts float to the top, how festivals
// are ranked, what the map emphasises.
//
// The "Main" profile is special: its artists/plays fields are null,
// meaning it always reads from the canonical tt_artists / tt_plays
// keys that the rest of the app writes to.  This means existing
// data is never touched — Main is just a transparent view of
// whatever is currently stored.
//
// Every other profile stores its own artists/plays snapshot.
// When you switch to it, ARTISTS and ARTIST_PLAYS are replaced in
// memory, scores are recomputed, and all views re-render.  When
// you switch away (or when persistSettings() fires), the active
// non-Main profile snapshot is kept in sync.
//
// concerts[] and festivals[] — the tour database — are NEVER
// touched by profile switching.  They come from the TM API scans
// and belong to no single profile.
// ═══════════════════════════════════════════════════════════════
