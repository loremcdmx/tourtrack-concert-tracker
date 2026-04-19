'use strict';
const APP_VERSION = '2.23.0001'; // x.y.zzzz ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â x=major feature, y=builds, z=changes in build

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
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
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
const COUNTRY_MAP = {
  GB:{n:'UK',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¬ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â§',r:'eu'}, DE:{n:'Germany',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â©ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'eu'}, FR:{n:'France',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â«ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'eu'},
  NL:{n:'Netherlands',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â³ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±',r:'eu'}, BE:{n:'Belgium',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â§ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'eu'}, ES:{n:'Spain',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂªÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸',r:'eu'},
  IT:{n:'Italy',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹',r:'eu'}, SE:{n:'Sweden',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'eu'}, DK:{n:'Denmark',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â©ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â°',r:'eu'},
  NO:{n:'Norway',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â³ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â´',r:'eu'}, FI:{n:'Finland',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â«ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®',r:'eu'}, PL:{n:'Poland',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂµÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±',r:'eu'},
  CZ:{n:'Czechia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¨ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¿',r:'eu'}, AT:{n:'Austria',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹',r:'eu'}, CH:{n:'Switzerland',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¨ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â­',r:'eu'},
  PT:{n:'Portugal',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂµÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹',r:'eu'}, IE:{n:'Ireland',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'eu'}, HU:{n:'Hungary',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â­ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âº',r:'eu'},
  RO:{n:'Romania',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â´',r:'eu'}, GR:{n:'Greece',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¬ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'eu'}, HR:{n:'Croatia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â­ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'eu'},
  SK:{n:'Slovakia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â°',r:'eu'}, BG:{n:'Bulgaria',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â§ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¬',r:'eu'}, RS:{n:'Serbia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸',r:'eu'},
  LT:{n:'Lithuania',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹',r:'eu'}, LV:{n:'Latvia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â»',r:'eu'}, EE:{n:'Estonia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂªÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'eu'},
  IS:{n:'Iceland',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸',r:'eu'}, LU:{n:'Luxembourg',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âº',r:'eu'}, UA:{n:'Ukraine',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂºÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦',r:'eu'},
  TR:{n:'Turkey',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'eu'},
  US:{n:'USA',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂºÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸',r:'na'}, CA:{n:'Canada',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¨ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦',r:'na'}, MX:{n:'Mexico',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â²ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â½',r:'na'},
  BR:{n:'Brazil',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â§ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'sa'}, AR:{n:'Argentina',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'sa'}, CL:{n:'Chile',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¨ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±',r:'sa'},
  CO:{n:'Colombia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¨ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â´',r:'sa'}, PE:{n:'Peru',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂµÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'sa'}, UY:{n:'Uruguay',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂºÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¾',r:'sa'},
  JP:{n:'Japan',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¯ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âµ',r:'as'}, KR:{n:'S. Korea',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â°ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â·',r:'as'}, CN:{n:'China',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¨ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â³',r:'as'},
  IN:{n:'India',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â³',r:'as'}, SG:{n:'Singapore',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¬',r:'as'}, TH:{n:'Thailand',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â­',r:'as'},
  PH:{n:'Philippines',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂµÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â­',r:'as'}, ID:{n:'Indonesia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â©',r:'as'}, MY:{n:'Malaysia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â²ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¾',r:'as'},
  TW:{n:'Taiwan',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¹ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¼',r:'as'}, HK:{n:'Hong Kong',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â­ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â°',r:'as'},
  AU:{n:'Australia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âº',r:'oc'}, NZ:{n:'New Zealand',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â³ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¿',r:'oc'},
  AE:{n:'UAE',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'me'}, IL:{n:'Israel',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â®ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â±',r:'me'}, SA:{n:'Saudi Arabia',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¸ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦',r:'me'},
  QA:{n:'Qatar',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¶ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦',r:'me'},
  ZA:{n:'S. Africa',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¿ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦',r:'af'}, NG:{n:'Nigeria',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â³ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¬',r:'af'}, KE:{n:'Kenya',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â°ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âª',r:'af'},
  EG:{n:'Egypt',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂªÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¬',r:'af'}, MA:{n:'Morocco',f:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â²ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â¦',r:'af'},
};

const REGIONS = [
  {id:'eu',lbl:'Europe',e:'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚ÂªÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Âº'}, {id:'na',lbl:'N. America',e:'ÃƒÂ°Ã…Â¸Ã…â€™Ã…Â½'},
  {id:'sa',lbl:'S. America',e:'ÃƒÂ°Ã…Â¸Ã…â€™Ã…Â½'}, {id:'as',lbl:'Asia',e:'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â'},
  {id:'oc',lbl:'Oceania',e:'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â'}, {id:'me',lbl:'Middle East',e:'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â'},
  {id:'af',lbl:'Africa',e:'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â'},
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
  // Mexico ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use exact TM names
  'Corona Capital','Tecate Pal Norte','Pal Norte','Pa\'l Norte',
  'Vive Latino','Tecate Vive Latino',
  'Bahidora','BahidorÃƒÆ’Ã‚Â¡','Festival Nrmal','Coordenada','Machaca Fest',
  'BPM Festival','BPM Festival Mexico','Hipnosis Festival',
  // LatAm
  'Lollapalooza Argentina','Lollapalooza Brasil','Lollapalooza Chile','Lollapalooza Colombia',
  'Cosquin Rock','Rock al Parque','EstÃƒÆ’Ã‚Â©reo Picnic','Stereo Picnic',
  'Creamfields Brasil','Creamfields Chile','Tomorrowland Brasil',
  'Time Warp Colombia','Afropunk Johannesburg','Afropunk Brooklyn',
  // Asia & Oceania
  'Fuji Rock Festival','Summer Sonic','Splendour in the Grass','Laneway Festival',
  'Beyond the Valley','Clockenflap','Neon Lights','Head in the Clouds',
  // Global
  'Tomorrowland','Creamfields','Afropunk',
];

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// STATE
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
let API_KEY = '', ARTISTS = []; // plain string names ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â used throughout
let TM_KEYS = [];      // { key, label, exhausted }[] ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â auto-rotated on quota exhaustion
let _activeKeyIdx = 0; // index of currently active key in TM_KEYS
let ARTIST_PLAYS = {};          // name.toLowerCase() ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ play count (parsed from "Artist 14" format)

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
let mapScoreFilter = 0;      // 0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“4, same scale as calScoreFilter / SCORE_ARTIST_MIN
let mapDateMode    = 'all';  // 'all' | 'week' | 'month' | 'range'
let mapDateFrom    = '';     // ISO date, range start
let mapDateTo      = '';     // ISO date, range end
let focusedArtist = null, focusedFest = null;
let sidebarTab = 'tours', festSort = 'score', artistSort = 'list';
let artistPreset = 'all';
let showUnrankedFests = true; // show/hide zero-score festivals in the fests panel
let artistColors = {}, colorIdx = 0;

// Match state
let matchHerMap = {};      // name.toLowerCase() ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ { name, count }  (her playlist)
let matchShared = [];      // [{ name, myCount, herCount, combined }] sorted by combined desc
let allTourData = {};

// Favorites + play-count filter
let favoriteArtists = new Set();  // lowercase artist names
// calPlaysFilter removed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use calScoreFilter + scoreOkArtist/scoreOkFest instead

// Fetch errors ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â persists across scan for error tab
let fetchErrors = {};  // artist ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ { attempts, lastErr, resolved }
window._scanActive = false; // true while a scan is in progress ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â prevents showOnboard() during scan

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// PROFILES
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// A "profile" is a named set of { artists[], plays{} } that drives
// all scoring ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â which concerts float to the top, how festivals
// are ranked, what the map emphasises.
//
// The "Main" profile is special: its artists/plays fields are null,
// meaning it always reads from the canonical tt_artists / tt_plays
// keys that the rest of the app writes to.  This means existing
// data is never touched ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Main is just a transparent view of
// whatever is currently stored.
//
// Every other profile stores its own artists/plays snapshot.
// When you switch to it, ARTISTS and ARTIST_PLAYS are replaced in
// memory, scores are recomputed, and all views re-render.  When
// you switch away (or when persistSettings() fires), the active
// non-Main profile snapshot is kept in sync.
//
// concerts[] and festivals[] ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â the tour database ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â are NEVER
// touched by profile switching.  They come from the TM API scans
// and belong to no single profile.
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

const PROF_MAIN = 'Main';
let activeProf = PROF_MAIN;

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Storage helpers ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function profAll() {
  try {
    const raw = localStorage.getItem('tt_profiles');
    const all = raw ? JSON.parse(raw) : {};
    // Always guarantee Main exists with null data (reads from tt_artists / tt_plays)
    if (!all[PROF_MAIN]) all[PROF_MAIN] = { artists: null, plays: null };
    return all;
  } catch(e) { return { [PROF_MAIN]: { artists: null, plays: null } }; }
}

function profSaveAll(all) {
  try { localStorage.setItem('tt_profiles', JSON.stringify(all)); } catch(e) {}
}

// Snapshot the current in-memory ARTISTS/ARTIST_PLAYS into a
// non-Main profile slot so it survives page refreshes.
function profPersistCurrent() {
  if (activeProf === PROF_MAIN) return; // Main is always read from tt_artists/tt_plays
  const all = profAll();
  if (!all[activeProf]) return;
  all[activeProf].artists = ARTISTS.slice();
  all[activeProf].plays   = Object.assign({}, ARTIST_PLAYS);
  profSaveAll(all);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ UI ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Rebuild the <select> to reflect the current profile list and
// update the delete-button's disabled state.
function profRenderSelect() {
  const sel   = document.getElementById('prof-select');
  const delBtn = document.getElementById('prof-del-btn');
  if (!sel) return;

  const all = profAll();
  sel.innerHTML = Object.keys(all).map(name => {
    const isActive = name === activeProf;
    return `<option value="${esc2(name)}" ${isActive ? 'selected' : ''}>${esc2(name)}</option>`;
  }).join('');

  if (delBtn) delBtn.disabled = (activeProf === PROF_MAIN);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Switch ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// THIS is the single place that writes activeProf.
// All other functions (create, delete) call _profApply() directly
// so they never hit the "already active" early-return guard.
function profSwitch(name) {
  // Called from the <select> onChange ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â skip if already on this profile.
  if (name === activeProf) return;
  profPersistCurrent();   // snapshot the profile we're leaving
  _profApply(name);
}

// Internal: load a profile into memory and re-render everything.
// No guard ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â safe to call even when name === activeProf.
function _profApply(name) {
  const all  = profAll();
  const prof = all[name];
  if (!prof) return; // unknown profile ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â do nothing

  activeProf = name;
  try { localStorage.setItem('tt_active_profile', name); } catch(e) {}

  // Load artists/plays.  Main always reads from the canonical
  // tt_artists/tt_plays keys; every other profile uses its snapshot.
  if (prof.artists === null) {
    ARTISTS      = JSON.parse(localStorage.getItem('tt_artists') || '[]');
    ARTIST_PLAYS = JSON.parse(localStorage.getItem('tt_plays')   || '{}');
  } else {
    ARTISTS      = (prof.artists || []).slice();
    ARTIST_PLAYS = Object.assign({}, prof.plays || {});
  }

  // Keep the artists textarea in Settings in sync if it's open.
  const ta = document.getElementById('artists-ta');
  if (ta) {
    ta.value = ARTISTS.map(n => {
      const p = ARTIST_PLAYS[n.toLowerCase()] || 0;
      return p ? `${n} ${p}` : n;
    }).join('\n');
  }
  updateArtistCount && updateArtistCount();
  profRenderSelect(); // always refresh the dropdown + delete-btn state

  if (!ARTISTS.length) {
    // Empty profile ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rescore festivals to zero (they still hold scores
    // from whatever profile was active before), then show the import prompt.
    if (festivals.length) scoreFestivals();
    profShowEmpty();
    return;
  }

  // Profile has data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â close the onboard overlay if it's still open
  // (e.g. user came back from an empty profile), recompute scores, re-render.
  profHideEmpty();   // safe to call even if overlay was already hidden
  if (festivals.length) scoreFestivals();
  buildCalChips();
  renderCalendar();
  renderMap();
  if (typeof buildSidebar === 'function') buildSidebar();
  // Show switch confirmation toast
  _showProfToast(name, ARTISTS.length);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Empty-state overlay ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Called by _profApply when the active profile has no artists.
// At this point ARTISTS=[] and festivals are already rescored to 0,
// and the views have already been re-rendered (showing empty lists).
// This function only handles the onboard overlay UI.
function profShowEmpty() {
  const title = document.getElementById('onboard-main-title');
  const sub   = document.getElementById('onboard-sub-text');
  if (title) title.innerHTML =
    `Import playlist<br>for <span style="color:var(--accent)">${esc2(activeProf)}</span>`;
  if (sub) sub.textContent =
    'Paste a Spotify playlist URL to populate this profile. ' +
    'The concerts & festivals database is already loaded ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ' +
    'your new playlist will be scored against it instantly.';
  showOnboard();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Profile toast ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
let _profToastTimer = null;
function _showProfToast(name, artists) {
  const el = document.getElementById('prof-toast');
  if (!el) return;
  const count = artists ? ` &middot; <span style="color:var(--muted)">${artists} artists</span>` : '';
  el.innerHTML = `&#x2713; <span class="prof-toast-name">${esc2(name)}</span>${count}`;
  el.classList.add('show');
  clearTimeout(_profToastTimer);
  _profToastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function profReload() {
  // Force-reapply the current active profile (useful if switch didn't apply)
  _profApply(activeProf);
  _showProfToast(activeProf + ' reloaded', ARTISTS.length);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Playlist mosaic avatar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Draws a 2x2 grid of colored squares for each top artist
const MOSAIC_PALETTE = ['#c8ff5f','#ff5f5f','#5fc8ff','#ffaa3c','#c85fff',
  '#5fffb8','#ff5faa','#5fd4ff','#ffdd5f','#ff885f','#5faeff','#88ff5f'];

function _drawPlaylistMosaic(canvas, topArtists) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 68, H = 68, gap = 1;
  const cw = (W - gap) / 2, ch = (H - gap) / 2;
  // For known artists use their color; others use palette by hash
  const colors = topArtists.slice(0, 4).map((name, idx) => {
    const col = getColor ? getColor(name) : null;
    return col || MOSAIC_PALETTE[idx % MOSAIC_PALETTE.length];
  });
  // Fill any missing slots
  while (colors.length < 4) colors.push('#1e1e2a');
  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, 0, W, H);
  const pos = [[0,0],[cw+gap,0],[0,ch+gap],[cw+gap,ch+gap]];
  colors.forEach((col, i) => {
    ctx.fillStyle = col + '55'; // semi-transparent base
    ctx.fillRect(pos[i][0], pos[i][1], cw, ch);
    // Lighter inner highlight
    ctx.fillStyle = col + 'aa';
    ctx.fillRect(pos[i][0]+2, pos[i][1]+2, cw-4, ch-4);
    // Text: first letter of artist
    if (topArtists[i]) {
      ctx.fillStyle = col;
      ctx.font = `bold ${Math.round(ch * 0.42)}px Syne, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(topArtists[i][0].toUpperCase(), pos[i][0] + cw/2, pos[i][1] + ch/2);
    }
  });
}

// Called after onboarding renders to paint the pinned card mosaic
function _paintPinnedMosaic() {
  const canvas = document.getElementById('ql-pinned-mosaic');
  if (!canvas) return;
  _drawPlaylistMosaic(canvas, PINNED_PLAYLIST.topArtists);
}

// Reset onboard text and close the overlay after a successful import.
function profHideEmpty() {
  const title = document.getElementById('onboard-main-title');
  const sub   = document.getElementById('onboard-sub-text');
  if (title) title.innerHTML = DEFAULT_ONBOARD_TITLE;
  if (sub)   sub.textContent = DEFAULT_ONBOARD_SUB;
  hideOnboard();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Create ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function profOpenDialog() {
  document.getElementById('prof-dialog-bg').classList.add('open');
  const inp = document.getElementById('prof-name-inp');
  inp.value = '';
  inp.classList.remove('err');
  setTimeout(() => inp.focus(), 60);
}

function profCloseDialog() {
  document.getElementById('prof-dialog-bg').classList.remove('open');
}

function profConfirm() {
  const inp  = document.getElementById('prof-name-inp');
  const name = (inp.value || '').trim();
  if (!name) { inp.classList.add('err'); inp.focus(); return; }

  const all = profAll();
  if (all[name]) {
    inp.classList.add('err');
    inp.title = 'A profile with that name already exists';
    setTimeout(() => { inp.classList.remove('err'); inp.title = ''; }, 1600);
    return;
  }

  // New profile is empty ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â the user will import their own playlist.
  all[name] = { artists: [], plays: {} };
  profSaveAll(all);
  profCloseDialog();

  // Use _profApply directly so we never hit the activeProf === name guard.
  profPersistCurrent(); // snapshot the profile we're leaving first
  _profApply(name);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Delete ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function profDelete() {
  if (activeProf === PROF_MAIN) return;
  if (!confirm(`Delete profile "${activeProf}"?\n\nThe concerts & festivals database is NOT affected.`)) return;

  const all = profAll();
  delete all[activeProf];
  profSaveAll(all);

  // Use _profApply directly ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â activeProf is still the deleted name,
  // so profSwitch's guard would fire if we targeted PROF_MAIN.
  _profApply(PROF_MAIN);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Boot ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function profInit() {
  const saved = localStorage.getItem('tt_active_profile') || PROF_MAIN;
  const all   = profAll();
  // If the saved name doesn't exist any more, fall back to Main.
  activeProf = all[saved] ? saved : PROF_MAIN;

  // For non-Main profiles with data, replace what restore() loaded so
  // the rest of the boot sequence scores against the right taste.
  if (activeProf !== PROF_MAIN) {
    const prof = all[activeProf];
    if (prof && prof.artists && prof.artists.length) {
      ARTISTS      = prof.artists.slice();
      ARTIST_PLAYS = Object.assign({}, prof.plays || {});
    }
  }

  profRenderSelect();
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// INDEXEDDB ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â per-artist and festival cache
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
const DB = (() => {
  let _db = null;

  function open() {
    if (_db) return Promise.resolve();
    return new Promise((res, rej) => {
      const req = indexedDB.open('tourtrack_v1', 2); // v2 adds attractions store
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('artists'))     db.createObjectStore('artists');
        if (!db.objectStoreNames.contains('meta'))        db.createObjectStore('meta');
        if (!db.objectStoreNames.contains('attractions')) db.createObjectStore('attractions'); // attractionId cache
      };
      req.onsuccess = e => { _db = e.target.result; res(); };
      req.onerror   = () => rej(req.error);
    });
  }

  function tx(store, mode, fn) {
    return open().then(() => new Promise((res, rej) => {
      const t = _db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    }));
  }

  return {
    get:     (store, key)      => tx(store, 'readonly',  s => s.get(key)),
    put:     (store, key, val) => tx(store, 'readwrite', s => s.put(val, key)),
    delete:  (store, key)      => tx(store, 'readwrite', s => s.delete(key)),
    keys:    (store)           => tx(store, 'readonly',  s => s.getAllKeys()),
    getAll:  (store)           => tx(store, 'readonly',  s => s.getAll()),
    clear:   (store)           => tx(store, 'readwrite', s => s.clear()),
  };
})();

// Fingerprint of the active country filter ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cache miss when this changes
function countryHash() {
  if (countryMode === 'world') return 'world';
  const set = countryMode === 'include' ? includeCountries : excludeCountries;
  return countryMode + ':' + [...set].sort().join(',');
}

const TTL_ARTIST = 3 * 24 * 3600e3;  // 3-day per-artist cache for smart scan
const TTL_FEST   = 48 * 3600e3;  // 48h festival cache
const FEST_VER   = 3;             // bump to invalidate all festival caches (changed fetch logic)

async function clearArtistCache() {
  try {
    await DB.clear('artists');
    await DB.delete('meta', 'festivals');
    softNotice('Cache cleared - next scan will re-fetch everything.', 'ok');
  } catch(e) {
    softNotice('Could not clear cache: ' + e.message, 'error');
  }
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// STORAGE ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â localStorage for settings + display data
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
function persistSettings() {
  try {
    localStorage.setItem('tt_key',     API_KEY);
    localStorage.setItem('tt_keys_pool', JSON.stringify(TM_KEYS.map(k => ({ key: k.key, label: k.label }))));
    localStorage.setItem('tt_cmode',   countryMode);
    localStorage.setItem('tt_inc',     JSON.stringify([...includeCountries]));
    localStorage.setItem('tt_exc',     JSON.stringify([...excludeCountries]));
    localStorage.setItem('tt_hidden',  JSON.stringify(hiddenArtists));
    localStorage.setItem('tt_cachets', String(cacheTimestamp));
    localStorage.setItem('tt_favs',    JSON.stringify([...favoriteArtists]));
    localStorage.setItem('tt_geo_preset', geoPreset);
    localStorage.setItem('tt_artist_preset', artistPreset);

    if (activeProf === PROF_MAIN) {
      // Only write the canonical artist keys when Main is active.
      // These keys ARE the Main profile's data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no other profile
      // should ever overwrite them.
      localStorage.setItem('tt_artists', JSON.stringify(ARTISTS));
      localStorage.setItem('tt_plays',   JSON.stringify(ARTIST_PLAYS));
      // Also keep a dedicated Main backup so restore() can always
      // distinguish "true Main data" from "last non-Main data".
      localStorage.setItem('tt_main_artists', JSON.stringify(ARTISTS));
      localStorage.setItem('tt_main_plays',   JSON.stringify(ARTIST_PLAYS));
    }
    // Non-Main profiles never touch tt_artists / tt_plays ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â their data
    // lives exclusively in the tt_profiles[name] snapshot (updated below).
  } catch(e) {}

  // For non-Main profiles, keep the profile snapshot in sync.
  profPersistCurrent();
}

function persistData() {
  persistSettings();
  try {
    localStorage.setItem('tt_concerts',  JSON.stringify(concerts));
    localStorage.setItem('tt_festivals', JSON.stringify(festivals));
  } catch(e) {}
}

function restore() {
  try {
    const storedPool = (JSON.parse(localStorage.getItem('tt_keys_pool') || 'null') || [])
      .filter(k => k && k.key && (SERVER_MANAGED_TICKETMASTER || k.key !== SERVER_TM_PLACEHOLDER));
    if (SERVER_MANAGED_TICKETMASTER) {
      TM_KEYS = [{ key: SERVER_TM_PLACEHOLDER, label: 'Server managed', exhausted: false }];
      API_KEY = SERVER_TM_PLACEHOLDER;
    } else if (storedPool && storedPool.length) {
      TM_KEYS = storedPool.map(k => ({ key: k.key, label: k.label, exhausted: false }));
      API_KEY = localStorage.getItem('tt_key') || TM_KEYS[0]?.key || '';
    } else {
      API_KEY = localStorage.getItem('tt_key') || '';
      TM_KEYS = API_KEY ? [{ key: API_KEY, label: 'Key 1', exhausted: false }] : [];
    }
    if (!SERVER_MANAGED_TICKETMASTER && API_KEY === SERVER_TM_PLACEHOLDER) {
      API_KEY = '';
      TM_KEYS = [];
    }
    if (!API_KEY && !SERVER_MANAGED_TICKETMASTER) API_KEY = localStorage.getItem('tt3_key') || '';
    if (!TM_KEYS.length && API_KEY) TM_KEYS = [{ key: API_KEY, label: 'Key 1', exhausted: false }];
    _activeKeyIdx = Math.max(TM_KEYS.findIndex(k => k.key === API_KEY), 0);
    // Prefer tt_main_artists/tt_main_plays ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â written ONLY when Main is active.
    // tt_artists may be stale with a non-Main profile's data from before this fix.
    const _mainArtRaw  = localStorage.getItem('tt_main_artists');
    const _mainPlayRaw = localStorage.getItem('tt_main_plays');
    if (_mainArtRaw) {
      ARTISTS      = JSON.parse(_mainArtRaw);
      ARTIST_PLAYS = _mainPlayRaw ? JSON.parse(_mainPlayRaw) : {};
    } else {
      // No backup yet (first run after update) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fall back to tt_artists
      ARTISTS      = JSON.parse(localStorage.getItem('tt_artists') || '[]');
      ARTIST_PLAYS = JSON.parse(localStorage.getItem('tt_plays')   || '{}');
    }
    countryMode      = localStorage.getItem('tt_cmode') || 'world'; // default: worldwide
    includeCountries = new Set(JSON.parse(localStorage.getItem('tt_inc') || '["GB","DE","FR","NL","BE","ES","IT","SE","DK","NO","FI","PL","CZ","AT","CH","PT","IE","HU","RO","GR","HR","SK","BG","RS","LT","LV","EE","IS","LU","UA","TR"]'));
    excludeCountries = new Set(JSON.parse(localStorage.getItem('tt_exc') || '[]'));
    hiddenArtists    = JSON.parse(localStorage.getItem('tt_hidden') || '{}');
    concerts         = JSON.parse(localStorage.getItem('tt_concerts') || '[]');
    festivals        = JSON.parse(localStorage.getItem('tt_festivals') || '[]');
    cacheTimestamp   = parseInt(localStorage.getItem('tt_cachets') || '0', 10);
    geoPreset        = localStorage.getItem('tt_geo_preset') || 'all';
    artistPreset     = localStorage.getItem('tt_artist_preset') || 'all';
    // Migrate from old keys
    if (!ARTISTS.length)    ARTISTS   = JSON.parse(localStorage.getItem('tt3_artists') || '[]');
    if (!concerts.length)   concerts  = JSON.parse(localStorage.getItem('tt3_concerts') || '[]');
    if (!festivals.length)  festivals = JSON.parse(localStorage.getItem('tt3_festivals') || '[]');
    if (!cacheTimestamp)    cacheTimestamp = parseInt(localStorage.getItem('tt3_cachets') || '0', 10);
    // Migrate old exclude-mode default (US,JP,AU excluded) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ include EU by default
    const oldExc = localStorage.getItem('tt3_exc') || localStorage.getItem('tt_exc_legacy');
    if (!hiddenArtists || typeof hiddenArtists !== 'object') hiddenArtists = {};
    if (!ARTIST_PLAYS  || typeof ARTIST_PLAYS  !== 'object') ARTIST_PLAYS  = {};
    favoriteArtists = new Set(JSON.parse(localStorage.getItem('tt_favs') || '[]'));
    // Re-apply dedup to cached data (catches duplicates from old scans)
    if (concerts.length) concerts = deduplicateConcerts(concerts);
  } catch(e) { hiddenArtists = {}; ARTIST_PLAYS = {}; favoriteArtists = new Set(); geoPreset = 'all'; artistPreset = 'all'; }
}

function cacheAge() {
  if (!cacheTimestamp) return null;
  const m = Math.round((Date.now() - cacheTimestamp) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h/24)}d ago`;
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// SAVE / LOAD / NEW GAME
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
const SAVE_VER = 1;

function buildSavePayload(label) {
  // Grab playlist info from history if available
  const hist = getOnboardHistory();
  const pl = hist[0] || {};
  return {
    _tt: true, _ver: SAVE_VER,
    label: label || 'Save',
    savedAt: Date.now(),
    artists: ARTISTS,
    plays: ARTIST_PLAYS,
    concerts, festivals,
    cacheTimestamp,
    countryMode,
    includeCountries: [...includeCountries],
    excludeCountries: [...excludeCountries],
    geoPreset,
    hiddenArtists,
    favoriteArtists: [...favoriteArtists],
    artistPreset,
    // Playlist metadata for future load-without-rescan
    playlistName: pl.name || '',
    playlistUrl:  pl.url  || '',
    coverUrl:     pl.coverUrl || '',
    topArtists:   pl.topArtists || ARTISTS.slice(0, 4),
    trackCount:   pl.trackCount || ARTISTS.length,
  };
}

function saveGame() {
  if (!concerts.length && !festivals.length) {
    softNotice('Nothing to save - run a scan first.');
    return;
  }
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  const artistCount = ARTISTS.length;
  const label = `${artistCount} artists Ãƒâ€šÃ‚Â· ${concerts.length} shows Ãƒâ€šÃ‚Â· ${festivals.length} festivals ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${dateStr} ${timeStr}`;

  const payload = buildSavePayload(label);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const filename = `concerttracker_${now.toISOString().slice(0,10)}_${now.getHours()}h${String(now.getMinutes()).padStart(2,'0')}.tt`;
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Remember save in localStorage (metadata only, not full data)
  const saves = getSaveIndex();
  saves.unshift({ label, savedAt: Date.now(), filename });
  localStorage.setItem('tt_saves', JSON.stringify(saves.slice(0, 10)));
  renderSaveSlots();
  setStatus(`Saved ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${filename}`, true);
}

function getSaveIndex() {
  try { return JSON.parse(localStorage.getItem('tt_saves') || '[]'); } catch(e) { return []; }
}

function loadGameFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data._tt) throw new Error('Not a ConcertTracker save file');
      applyLoadedState(data, file.name);
    } catch(err) {
      softNotice('Load failed: ' + err.message, 'error');
    }
    // Reset file input so same file can be loaded again
    document.getElementById('sl-file-input').value = '';
  };
  reader.readAsText(file);
}

function applyLoadedState(data, filename) {
  ARTISTS          = data.artists      || [];
  ARTIST_PLAYS     = data.plays        || {};
  concerts         = data.concerts     || [];
  festivals        = data.festivals    || [];
  cacheTimestamp   = data.cacheTimestamp || 0;
  countryMode      = data.countryMode  || 'world';
  includeCountries = new Set(data.includeCountries || []);
  excludeCountries = new Set(data.excludeCountries || []);
  geoPreset        = data.geoPreset || 'all';
  hiddenArtists    = data.hiddenArtists || {};
  favoriteArtists  = new Set(data.favoriteArtists || []);
  artistPreset     = data.artistPreset || 'all';

  // Re-apply dedup (may have been saved before 2-pass dedup)
  if (concerts.length) concerts = deduplicateConcerts(concerts);

  persistData();

  const age = data.savedAt ? new Date(data.savedAt).toLocaleString('en-GB',{
    day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
  }) : '?';
  const msg = `Loaded ${filename} Ãƒâ€šÃ‚Â· ${concerts.length} shows Ãƒâ€šÃ‚Â· ${festivals.length} festivals Ãƒâ€šÃ‚Â· saved ${age}`;
  setStatus(msg, true);
  dblog('info', `LOAD: ${msg}`);

  closeSaveLoad();
  hideOnboard();

  // Track that this data came from a save (not a scan) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â mark in history
  if (data.playlistUrl || data.playlistName) {
    addToOnboardHistory(
      data.playlistName || filename,
      data.playlistUrl  || '',
      data.trackCount   || ARTISTS.length,
      ARTISTS.length,
      data.coverUrl     || '',
      (data.topArtists  || ARTISTS.slice(0, 4)),
      { fromSave: true, saveFile: filename }
    );
  }

  // Re-render everything
  buildCalChips();
  renderCalendar();
  renderMap();

  // If settings open, refresh them
  if (!document.getElementById('settings-bg').classList.contains('off')) {
    openSettings();
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Reset map + lists, keep artists ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rescan from scratch ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function resetForNewScan() {
  const ok = confirm(
    'Reset all concert & festival data?\n\n' +
    'Your artist list will be kept. The map, calendar and all results will be cleared.\n' +
    'A new scan will start immediately after reset.\n\n' +
    'Consider saving first (ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾ Save current state).'
  );
  if (!ok) return;

  // Clear scan results but keep artists + settings
  concerts = []; festivals = [];
  cacheTimestamp = 0;
  fetchErrors = {};
  focusedArtist = null; focusedFest = null;
  allTourData = {};

  // Clear per-artist IDB cache so everything refetches fresh
  DB.clear('artists').catch(() => {});
  DB.delete('meta', 'festivals').catch(() => {});

  // Persist cleared state
  try {
    localStorage.setItem('tt_concerts',  '[]');
    localStorage.setItem('tt_festivals', '[]');
    localStorage.setItem('tt_cachets',   '0');
  } catch(e) {}

  // Reset map view
  if (lmap) { clearMapLayers(); lmap.flyTo([30, 10], 2, { duration: 0.8 }); }
  buildCalChips(); renderCalendar();
  closeSaveLoad();
  setStatus('Data reset ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â starting fresh scanÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', false);
  dblog('info', 'RESET: concerts/festivals cleared, starting fresh scan');

  // Start a new full scan
  setTimeout(() => fetchAll(false), 300);
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// MERGE RESCAN
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
//
// Difference from the other scan modes:
//
//   fetchAll(false)        Smart scan. Respects per-artist IDB TTL (3 days).
//                          Artists scanned recently are served from cache.
//                          Shows accumulate; stale entries trimmed at scan start.
//
//   fetchAll(true)         Force rescan. Ignores IDB cache, hits TM for everyone.
//                          CLEARS concerts[] before starting ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ blank UI during scan.
//
//   resetForNewScan()      Like force rescan but also wipes IDB entirely and resets
//                          cacheTimestamp, fetchErrors, etc.
//
//   mergeRescan()   ÃƒÂ¢Ã¢â‚¬Â Ã‚ÂTHIS  Invalidates every IDB TTL (sets ts=0) so every artist
//                          misses the TTL check and gets a fresh TM query, BUT:
//                          Ãƒâ€šÃ‚Â· concerts[] is NEVER cleared ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â existing shows stay visible
//                          Ãƒâ€šÃ‚Â· per-artist: incoming fresh shows are MERGED with the old
//                            ones for that artist (union, not replace)
//                          Ãƒâ€šÃ‚Â· shows that disappeared from TM but were in the database
//                            are KEPT (you asked for additive-only)
//                          Ãƒâ€šÃ‚Â· deduplication runs at the end to remove true duplicates
//
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// Implementation strategy:
//
// 1. Invalidate IDB TTLs by rewriting ts=0 on all 'artists' store entries.
//    This forces every processArtist call to fall through the cache check and
//    make a live TM request, identical to force-refresh behaviour ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â except we
//    do NOT clear concerts[] beforehand.
//
// 2. Set window._mergeMode = true before calling fetchAll(false).
//    Three places inside fetchAll check this flag:
//
//    A) The stale-splice block (concerts.splice(0, _staleCount)) MUST be
//       skipped in merge mode, otherwise the existing concerts we want to
//       keep get deleted before any fresh data arrives.
//
//    B) The concerts.push(ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦finalShows) call in processArtist is replaced
//       by a merge push: for each artist, build a dedup-key Set from
//       incoming freshShows, then also push any baseline shows for that
//       artist whose key isn't already covered.
//
//    C) Pass-2 retry push also gets the same merge treatment.
//
// 3. finalizeScan runs deduplicateConcerts over the full merged array
//    (it already does this) and clears window._mergeMode.
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

// Helper: canonical dedup key matching deduplicateConcerts() format
function _concertKey(c) {
  return `${_normText(c.artist)}|${c.date}|${_venueCore(c.venue) || _cityCore(c.city) || _normalizedUrlKey(c.url) || _normText(c.eventName)}`;
}

async function mergeRescan() {
  if (!API_KEY || !ARTISTS.length) { openSettings(); return; }

  if (!confirm(
    `Merge Rescan ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â refetch all ${ARTISTS.length} artists but keep current shows?\n\n` +
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Every artist cache is expired ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ all get fresh TM queries\n' +
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Existing concerts are preserved throughout the scan\n' +
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ New shows found are added to the database (merge, not replace)\n' +
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ No shows are deleted ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â only new ones added\n' +
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Duplicates removed automatically at the end\n\n' +
    'This will use Ticketmaster API quota. Continue?'
  )) return;

  dblog('info', `MERGE RESCAN start ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${concerts.length} shows in DB, ${ARTISTS.length} artists to re-fetch`);

  // Step 1: expire every per-artist IDB entry by setting ts=0.
  // The TTL check is:  (now - cached.ts) < TTL_ARTIST
  // Setting ts=0 makes (now - 0) always exceed TTL_ARTIST (3 days in ms),
  // so processArtist falls through to a live TM fetch for every single artist.
  // We keep the .shows[] in each entry intact ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â processArtist uses them as
  // the "existingShows" diff base in force-refresh mode, but in smart mode
  // (which we use here) they're just ignored after the TTL miss. That's fine;
  // the merge logic below handles combining old + new shows independently.
  try {
    const allIdbKeys = await DB.keys('artists');
    await Promise.all(allIdbKeys.map(async k => {
      try {
        const entry = await DB.get('artists', k);
        if (entry) await DB.put('artists', k, { ...entry, ts: 0 });
      } catch(e) {}
    }));
    dblog('info', `IDB: expired ${allIdbKeys.length} artist cache entries (ts=0)`);
  } catch(e) {
    dblog('warn', `IDB invalidation failed: ${e.message} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â will scan anyway`);
  }

  // Step 2: set the merge mode flag.
  // fetchAll checks this flag at three injection points (see below).
  window._mergeMode = true;

  // Step 3: snapshot dedup keys of ALL current concerts.
  // When processArtist returns fresh shows for artist X, we want to add
  // any existing shows for X that are NOT in the fresh result set.
  // Building the key set once here avoids O(nÃƒâ€šÃ‚Â²) lookups during the scan.
  window._mergeBaseKeys = new Set(concerts.map(_concertKey));

  // Group baseline concerts by artist (lowercase) for fast lookup during merge.
  window._mergeBaseByArtist = {};
  for (const c of concerts) {
    const k = (c.artist||'').toLowerCase();
    (window._mergeBaseByArtist[k] = window._mergeBaseByArtist[k] || []).push(c);
  }

  dblog('info', `Merge baseline: ${window._mergeBaseKeys.size} dedup keys across ${Object.keys(window._mergeBaseByArtist).length} artists`);

  // Step 4: run smart scan (false = respect IDB cache).
  // Since we zeroed all ts values in step 1, every artist will miss the TTL
  // check and trigger a live TM fetch. The three injection points in fetchAll
  // handle the merge behaviour.
  fetchAll(false);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Purge concerts that have already happened ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function purgePastConcerts() {
  const today = new Date().toISOString().split('T')[0];
  const before = concerts.length;
  const pastCount = concerts.filter(c => c.date < today).length;

  if (!pastCount) {
    softNotice('No past concerts to remove - everything is upcoming.');
    return;
  }

  const ok = confirm(
    `Remove ${pastCount} past concert${pastCount !== 1 ? 's' : ''} (before ${today})?\n\n` +
    `${before - pastCount} upcoming concerts will remain.`
  );
  if (!ok) return;

  concerts = concerts.filter(c => c.date >= today);

  // Persist
  try { localStorage.setItem('tt_concerts', JSON.stringify(concerts)); } catch(e) {}
  cacheTimestamp = Date.now();

  buildCalChips(); renderCalendar(); renderMap();
  renderSaveSlots(); // refresh save button state
  setStatus(`ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã¢â‚¬Ëœ Removed ${pastCount} past concerts Ãƒâ€šÃ‚Â· ${concerts.length} upcoming remain`, true);
  dblog('info', `PURGE: removed ${pastCount} past concerts (before ${today}), ${concerts.length} remain`);
}

function quickReset() {
  const ok = confirm('Reset everything?\n\nThis clears all concerts, festivals, artists and scan data. Cannot be undone.');
  if (!ok) return;

  // Preserve API key
  const keyToKeep = API_KEY;
  localStorage.clear();
  if (keyToKeep) localStorage.setItem('tt_key', keyToKeep);

  // Clear IDB
  DB.clear('artists').catch(() => {});
  DB.clear('attractions').catch(() => {});
  DB.delete('meta', 'festivals').catch(() => {});

  // Reset all state
  ARTISTS = []; ARTIST_PLAYS = {};
  concerts = []; festivals = [];
  cacheTimestamp = 0; fetchErrors = {};
  hiddenArtists = {}; favoriteArtists = new Set();
  artistColors = {}; colorIdx = 0;
  allTourData = {}; focusedArtist = null; focusedFest = null;
  matchHerMap = {}; matchShared = [];

  // Reset map
  if (lmap) { clearMapLayers(); lmap.flyTo([30, 10], 2, { duration: 0.5 }); }
  buildCalChips(); renderCalendar();
  buildSidebar && buildSidebar();

  // Back to onboarding
  const ob = document.getElementById('onboard');
  if (ob) {
    ob.classList.remove('hidden');
    const st = document.getElementById('onboard-status-text');
    if (st) st.textContent = '';
  }
  renderOnboardHistory && renderOnboardHistory();
  setStatus('Reset ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ready for a fresh scan', false);
  dblog('info', 'RESET: all state cleared');
}

function newGame() {
  const ok = confirm(
    'Start a new game?\n\n' +
    'This will clear ALL data: concerts, festivals, playlist, favorites.\n' +
    'Your current data will NOT be saved automatically.\n\n' +
    'Consider saving first (ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾ Save current state).'
  );
  if (!ok) return;

  // Clear localStorage (preserve API key)
  const keyToKeep = API_KEY;
  localStorage.clear();
  localStorage.setItem('tt_key', keyToKeep);

  // Clear IDB caches
  DB.clear('artists').catch(() => {});
  DB.delete('meta', 'festivals').catch(() => {});

  // Reset all state
  ARTISTS = []; ARTIST_PLAYS = {};
  concerts = []; festivals = [];
  cacheTimestamp = 0;
  hiddenArtists = {}; favoriteArtists = new Set();
  artistColors = {}; colorIdx = 0;
  allTourData = {};
  focusedArtist = null; focusedFest = null;
  matchHerMap = {}; matchShared = [];

  closeSaveLoad();

  // Clear map
  if (lmap) { clearMapLayers(); lmap.flyTo([30, 10], 2, { duration: 0.5 }); }
  buildCalChips(); renderCalendar();
  buildSidebar && buildSidebar();

  // Show onboarding
  const ob = document.getElementById('onboard');
  if (ob) { ob.classList.remove('hidden'); document.getElementById('onboard-status-text') && (document.getElementById('onboard-status-text').textContent = ''); }
  renderOnboardHistory && renderOnboardHistory();
  setStatus('New game ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ready for a fresh scan', false);
  dblog('info', 'NEW GAME: all state cleared');
}

function openSaveLoad() {
  renderSaveSlots();
  document.getElementById('sl-panel').classList.add('open');
}
function closeSaveLoad() {
  document.getElementById('sl-panel').classList.remove('open');
}

function renderSaveSlots() {
  const list = document.getElementById('sl-slots-list');
  const saves = getSaveIndex();
  const hasCurrent = concerts.length > 0 || festivals.length > 0;

  // Disable save button if nothing loaded
  const saveBtn = document.getElementById('sl-save-btn');
  if (saveBtn) saveBtn.disabled = !hasCurrent;

  if (!saves.length) {
    list.innerHTML = `<div style="font-size:.58rem;color:var(--muted2);padding:10px 0;text-align:center">
      No saves yet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â save your current scan to create a slot
    </div>`;
    return;
  }

  list.innerHTML = '';
  saves.forEach((s, i) => {
    const d = s.savedAt ? new Date(s.savedAt) : null;
    const dateStr = d ? d.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'}) : '';
    const timeStr = d ? d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '';

    const slot = document.createElement('div');
    slot.className = 'sl-slot';
    slot.innerHTML = `
      <div class="sl-slot-icon">ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¾</div>
      <div class="sl-slot-info">
        <div class="sl-slot-name">${s.label || s.filename || 'Save'}</div>
        <div class="sl-slot-meta">${dateStr}${dateStr&&timeStr?' Ãƒâ€šÃ‚Â· ':''}${timeStr}${s.filename?' Ãƒâ€šÃ‚Â· '+s.filename:''}</div>
      </div>
      <div class="sl-slot-actions">
        <button class="sl-btn" onclick="triggerFileLoad()">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Å¡ Load fileÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</button>
        <button class="sl-btn danger" onclick="deleteSave(${i})">ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¢</button>
      </div>`;
    list.appendChild(slot);
  });

  // Always show a "load from file" row even if saves exist
  const loadRow = document.createElement('div');
  loadRow.style.cssText = 'padding:6px 0;text-align:center';
  loadRow.innerHTML = `<button class="sl-btn" onclick="triggerFileLoad()" style="width:100%">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Å¡ Load a .tt save fileÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</button>`;
  list.appendChild(loadRow);
}

function deleteSave(idx) {
  const saves = getSaveIndex();
  saves.splice(idx, 1);
  localStorage.setItem('tt_saves', JSON.stringify(saves));
  renderSaveSlots();
}

function triggerFileLoad() {
  document.getElementById('sl-file-input').click();
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// SPOTIFY IMPORT
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
let spTokenCache = null; // { token, exp }

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// UNIFIED PROXY SYSTEM  (Spotify + Ticketmaster)
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// mode: 'none' | 'auto' | 'corsproxy' | 'allorigins' | 'custom'
// 'auto' = try direct, auto-fallback to corsproxy.io on CORS/net error

const PROXY_BUILDERS = {
  corsproxy:  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  allorigins: url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  custom:     (url, tpl) => tpl ? tpl.replace('{url}', encodeURIComponent(url)) : url,
};

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Spotify proxy ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
let spProxyMode    = 'none';
let spCustomProxy  = '';
let spProxyWorking = null; // 'direct' | 'corsproxy' | 'allorigins' | 'custom'

function buildProxiedUrl(url, mode, customTpl) {
  if (mode === 'none' || mode === 'auto') return url;
  const fn = PROXY_BUILDERS[mode];
  return fn ? fn(url, customTpl) : url;
}

function hasSpotifyUserTokenInFlight(options = {}) {
  try {
    const headers = new Headers(options.headers || {});
    return headers.has('Authorization') && spTokenCache?.source === 'user';
  } catch {
    return false;
  }
}

function isSameOriginSpotifyProxy(mode) {
  if (mode === 'none' || mode === 'auto') return true;
  if (mode !== 'custom') return false;
  try {
    const sample = buildProxiedUrl('https://api.spotify.com/v1/me', mode, spCustomProxy || INTERNAL_PROXY_TEMPLATE);
    const resolved = new URL(sample, window.location.origin);
    return resolved.origin === window.location.origin;
  } catch {
    return false;
  }
}

// Spotify fetch with proxy support + auto-fallback + hard timeout on direct calls
const SP_FETCH_TIMEOUT = 8000; // ms ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â if direct hangs, try proxy instead

async function spFetch(url, options = {}) {
  if (hasSpotifyUserTokenInFlight(options) && !isSameOriginSpotifyProxy(spProxyMode)) {
    throw new Error('Spotify account login is active. External Spotify proxies are disabled for privacy. Switch Spotify proxy to Direct/Internal and try again.');
  }

  // Direct fetch with a hard timeout so we never hang forever on a blocked connection
  const direct = () => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), SP_FETCH_TIMEOUT);
    // Merge any existing signal with our timeout signal
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid));
  };
  const viaProxy = mode => fetch(buildProxiedUrl(url, mode, spCustomProxy), options);

  if (spProxyMode === 'corsproxy')  return viaProxy('corsproxy');
  if (spProxyMode === 'allorigins') return viaProxy('allorigins');
  if (spProxyMode === 'custom')     return viaProxy('custom');

  // 'none' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â direct with timeout, surface a helpful error if it hangs/fails
  if (spProxyMode === 'none') {
    try {
      return await direct();
    } catch(e) {
      if (e.name === 'AbortError') {
        onboardLog?.('ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ Timed out after 8s ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â IP likely blocked', 'err');
        throw new Error('Spotify ÃƒÂÃ‚Â½ÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â²ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â» ÃƒÂÃ‚Â·ÃƒÂÃ‚Â° 8Ãƒâ€˜Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°Ãƒâ€˜Ã‹â€  IP ÃƒÂÃ‚Â·ÃƒÂÃ‚Â°ÃƒÂÃ‚Â±ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¾ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¸Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°ÃƒÂÃ‚Â½. ÃƒÂÃ¢â‚¬â„¢ ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹ÃƒÂÃ‚ÂºÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Â¦ Advanced ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Spotify proxy ÃƒÂÃ‚Â²ÃƒÂÃ‚ÂºÃƒÂÃ‚Â»Ãƒâ€˜Ã…Â½Ãƒâ€˜Ã¢â‚¬Â¡ÃƒÂÃ‚Â¸Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Âµ ÃƒÂ¢Ã…Â¡Ã‚Â¡ Auto-fallback.');
      }
      onboardLog?.('ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ ' + e.message, 'err');
      throw e;
    }
  }

  // 'auto' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â try direct (with timeout), then corsproxy.io, then allorigins.win
  if (hasSpotifyUserTokenInFlight(options)) {
    return direct();
  }

  if (spProxyWorking === 'direct')     return direct();
  if (spProxyWorking === 'corsproxy')  return viaProxy('corsproxy');
  if (spProxyWorking === 'allorigins') return viaProxy('allorigins');

  try {
    const r = await direct();
    if (r.ok || r.status === 400 || r.status === 401 || r.status === 403) {
      spProxyWorking = 'direct'; return r;
    }
    throw new Error('non-ok: ' + r.status);
  } catch(e) {
    const reason = e.name === 'AbortError' ? 'timed out (8s)' : e.message;
    console.warn(`Spotify direct blocked/hung (${reason}) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â trying corsproxy.io`);
    try {
      const r2 = await viaProxy('corsproxy');
      spProxyWorking = 'corsproxy';
      setTmProxyStatus('sp', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Via corsproxy.io (direct blocked)`, 'warn');
      return r2;
    } catch(e2) {
      try {
        const r3 = await viaProxy('allorigins');
        spProxyWorking = 'allorigins';
        setTmProxyStatus('sp', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Via allorigins.win`, 'warn');
        return r3;
      } catch(e3) {
        setTmProxyStatus('sp', `ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ All proxy routes failed`, 'err');
        throw new Error('Spotify ÃƒÂÃ‚Â½ÃƒÂÃ‚ÂµÃƒÂÃ‚Â´ÃƒÂÃ‚Â¾Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã†â€™ÃƒÂÃ‚Â¿ÃƒÂÃ‚ÂµÃƒÂÃ‚Â½ Ãƒâ€˜Ã¢â‚¬Â¡ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚ÂµÃƒÂÃ‚Â· ÃƒÂÃ‚Â²Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¿Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚ÂºÃƒâ€˜Ã‚ÂÃƒÂÃ‚Â¸. ÃƒÂÃ…Â¸Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬Ãƒâ€˜Ã…â€™Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â½Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â½ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡ ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸ ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Âµ Custom proxy.');
      }
    }
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Ticketmaster proxy ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
let tmProxyMode    = 'none';   // default: direct connection ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â change in Settings > Proxy if your IP is blocked
let tmCustomProxy  = '';
let tmProxyWorking = null; // 'direct' | 'corsproxy' | 'allorigins' | 'custom'

// Called from apiFetch ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â wraps a TM URL with proxy if needed
// Returns the fetch Promise (with AbortSignal passed through in options)
async function tmFetch(url, options = {}) {
  const direct    = () => fetch(url, options);
  const viaProxy  = mode => fetch(buildProxiedUrl(url, mode, tmCustomProxy), options);

  if (tmProxyMode === 'none')       return direct();
  if (tmProxyMode === 'corsproxy')  return viaProxy('corsproxy');
  if (tmProxyMode === 'allorigins') return viaProxy('allorigins');
  if (tmProxyMode === 'custom')     return viaProxy('custom');

  // 'auto' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cache the working route within this scan
  if (tmProxyWorking === 'direct')     return direct();
  if (tmProxyWorking === 'corsproxy')  return viaProxy('corsproxy');
  if (tmProxyWorking === 'allorigins') return viaProxy('allorigins');

  try {
    const r = await direct();
    // Any real HTTP response = TM is reachable directly
    if (r.status !== 0) { tmProxyWorking = 'direct'; return r; }
    throw new Error('status 0');
  } catch(e) {
    // Network/CORS error ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fall through to proxies
    dblog('warn', `TM direct blocked (${e.message}) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â trying corsproxy.io`);
    try {
      const r2 = await viaProxy('corsproxy');
      tmProxyWorking = 'corsproxy';
      setTmProxyStatus('tm', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Via corsproxy.io (direct blocked)`, 'warn');
      dblog('ok', `TM: auto-fallback to corsproxy.io succeeded`);
      return r2;
    } catch(e2) {
      // Try allorigins as second fallback
      dblog('warn', `TM corsproxy failed (${e2.message}) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â trying allorigins.win`);
      try {
        const r3 = await viaProxy('allorigins');
        tmProxyWorking = 'allorigins';
        setTmProxyStatus('tm', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Via allorigins.win (direct+corsproxy blocked)`, 'warn');
        dblog('ok', `TM: auto-fallback to allorigins.win succeeded`);
        return r3;
      } catch(e3) {
        setTmProxyStatus('tm', `ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ All proxy attempts failed`, 'err');
        throw e3;
      }
    }
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Proxy UI helpers ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function setTmProxyStatus(which, msg, type) {
  const id = which === 'tm' ? 'tm-proxy-status' : 'proxy-status';
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = '';
  el.className = 'proxy-status' + (type ? ' ' + type : '');
  el.textContent = msg;
}

const SP_PROXY_HINTS = {
  none:       'Direct connection to Spotify ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â default.',
  auto:       'Tries direct first, falls back to corsproxy.io automatically if your IP is blocked.',
  corsproxy:  'Spotify requests routed through corsproxy.io (free, public).',
  allorigins: 'Spotify requests routed through allorigins.win (free, public).',
  custom:     'Custom proxy ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use <code>{url}</code> as placeholder, e.g. <code>https://proxy.mine.com/?u={url}</code>',
};
const TM_PROXY_HINTS = {
  none:       'Direct Ticketmaster calls ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â default. Enable if you see "Failed to fetch" in Debug Log.',
  auto:       'ÃƒÂ¢Ã…Â¡Ã‚Â¡ Recommended fix for "Failed to fetch". Tries direct, auto-falls back to corsproxy.io ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ allorigins.win.',
  corsproxy:  'TM requests via corsproxy.io. Use if direct is blocked.',
  allorigins: 'TM requests via allorigins.win. Use as alternative to corsproxy.',
  custom:     'Custom proxy ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use <code>{url}</code> as placeholder.',
};
if (INTERNAL_PROXY_TEMPLATE) {
  SP_PROXY_HINTS.custom = 'App server proxy - same-origin route for shared and deployed builds.';
  TM_PROXY_HINTS.none = 'Direct browser calls. Prefer the app server proxy for shared users and deployed builds.';
  TM_PROXY_HINTS.custom = 'App server proxy - recommended default for external users.';
}

function setSpProxy(mode) {
  spProxyMode = mode; spProxyWorking = null;
  localStorage.setItem('sp_proxy', mode);
  document.querySelectorAll('#proxy-opts .proxy-opt').forEach(b =>
    b.classList.toggle('on', b.dataset.p === mode));
  const el = document.getElementById('proxy-custom-row');
  if (el) el.style.display = mode === 'custom' ? '' : 'none';
  const st = document.getElementById('proxy-status');
  if (st) st.style.display = 'none';
  const h = document.getElementById('proxy-hint');
  if (h) h.innerHTML = SP_PROXY_HINTS[mode] || '';
}

function setTmProxy(mode) {
  tmProxyMode = mode; tmProxyWorking = null;
  localStorage.setItem('tm_proxy', mode);
  document.querySelectorAll('#tm-proxy-opts .proxy-opt').forEach(b =>
    b.classList.toggle('on', b.dataset.p === mode));
  const el = document.getElementById('tm-proxy-custom-row');
  if (el) el.style.display = mode === 'custom' ? '' : 'none';
  const st = document.getElementById('tm-proxy-status');
  if (st) st.style.display = 'none';
  const h = document.getElementById('tm-proxy-hint');
  if (h) h.innerHTML = TM_PROXY_HINTS[mode] || '';
}

function setProxyStatus(msg, type) { setTmProxyStatus('sp', msg, type); }

async function testSpProxy() {
  const custom = (document.getElementById('proxy-custom-url')?.value || '').trim();
  if (spProxyMode === 'custom') spCustomProxy = custom;
  setTmProxyStatus('sp', 'TestingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', '');
  try {
    const r = await spFetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    setTmProxyStatus('sp', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Spotify reachable (HTTP ${r.status})`, r.status < 500 ? 'ok' : 'warn');
  } catch(e) {
    setTmProxyStatus('sp', `ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ Failed: ${e.message}`, 'err');
  }
}

async function testTmProxy() {
  const custom = (document.getElementById('tm-proxy-custom-url')?.value || '').trim();
  if (tmProxyMode === 'custom') tmCustomProxy = custom;
  setTmProxyStatus('tm', 'TestingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', '');
  try {
    // Small test fetch ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 1 result, no key needed for OPTIONS, but we need the key
    const testUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${SERVER_MANAGED_TICKETMASTER ? SERVER_TM_PLACEHOLDER : API_KEY}&size=1&classificationName=music`;
    const r = await tmFetch(testUrl);
    if (r.ok || r.status === 401) {
      setTmProxyStatus('tm', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Ticketmaster reachable (HTTP ${r.status})`, 'ok');
    } else {
      setTmProxyStatus('tm', `ÃƒÂ¢Ã…Â¡Ã‚Â  Got HTTP ${r.status}`, 'warn');
    }
  } catch(e) {
    setTmProxyStatus('tm', `ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ Failed: ${e.message}`, 'err');
  }
}

function restoreProxySettings() {
  const defaultProxyMode = INTERNAL_PROXY_TEMPLATE ? 'custom' : 'none';
  spProxyMode    = localStorage.getItem('sp_proxy')         || defaultProxyMode;
  spCustomProxy  = localStorage.getItem('sp_proxy_custom')  || INTERNAL_PROXY_TEMPLATE || '';
  tmProxyMode    = localStorage.getItem('tm_proxy')         || defaultProxyMode;
  tmCustomProxy  = localStorage.getItem('tm_proxy_custom')  || INTERNAL_PROXY_TEMPLATE || '';
  if (spProxyMode === 'custom' && !spCustomProxy && INTERNAL_PROXY_TEMPLATE) spCustomProxy = INTERNAL_PROXY_TEMPLATE;
  if (tmProxyMode === 'custom' && !tmCustomProxy && INTERNAL_PROXY_TEMPLATE) tmCustomProxy = INTERNAL_PROXY_TEMPLATE;
}

function syncProxyUI() {
  setSpProxy(spProxyMode);
  setTmProxy(tmProxyMode);

  const spInput = document.getElementById('proxy-custom-url');
  if (spInput && spCustomProxy) spInput.value = spCustomProxy;
  if (spInput && !spInput._bound) {
    spInput._bound = true;
    spInput.addEventListener('input', () => { spCustomProxy = spInput.value.trim(); localStorage.setItem('sp_proxy_custom', spCustomProxy); });
  }
  const tmInput = document.getElementById('tm-proxy-custom-url');
  if (tmInput && tmCustomProxy) tmInput.value = tmCustomProxy;
  if (tmInput && !tmInput._bound) {
    tmInput._bound = true;
    tmInput.addEventListener('input', () => { tmCustomProxy = tmInput.value.trim(); localStorage.setItem('tm_proxy_custom', tmCustomProxy); });
  }
}

function spSetError(msg) {
  const el = document.getElementById('hero-status-text');
  if (el) { el.style.color = msg ? '#ff7070' : ''; el.textContent = msg ? 'ÃƒÂ¢Ã…Â¡Ã‚Â  ' + msg : ''; }
}
function spSetResult(msg) {
  const el = document.getElementById('hero-status-text');
  if (el) { el.style.color = msg ? 'var(--accent)' : ''; el.textContent = msg || ''; }
}
function spSetProgress(done, total) {
  const prog = document.getElementById('hero-progress');
  const fill = document.getElementById('hero-prog-fill');
  const lbl  = document.getElementById('hero-status-text');
  if (prog) prog.style.display = '';
  if (fill) fill.style.width = (total ? done/total*100 : 15) + '%';
  if (lbl)  { lbl.style.color = ''; lbl.textContent = total ? `Fetched ${done} / ${total} tracksÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦` : 'AuthenticatingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦'; }
}
function spClearProgress() {
  const prog = document.getElementById('hero-progress');
  if (prog) prog.style.display = 'none';
}

async function spGetToken() {
  if (spTokenCache && Date.now() < spTokenCache.exp) return spTokenCache.token;
  if (!SERVER_MANAGED_SPOTIFY) {
    throw new Error('Spotify is not configured for this deployment yet.');
  }
  const serverRes = await fetch('/api/spotify/token', {
    method: 'POST',
    credentials: 'same-origin',
  });
  const data = await serverRes.json().catch(() => ({}));
  if (!serverRes.ok) {
    throw new Error(data.error || data.message || `Spotify auth failed (${serverRes.status}).`);
  }
  const expiresIn = Math.max(60, Number(data.expires_in) || 3600);
  spTokenCache = {
    token: data.access_token,
    exp: Date.now() + Math.max(30, expiresIn - 60) * 1000,
    source: data.source || 'app',
  };
  return spTokenCache.token;
}

function spExtractId(raw) {
  raw = (raw || '').trim();
  const m = raw.match(/playlist\/([a-zA-Z0-9]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9]{22}$/.test(raw)) return raw;
  return null;
}

async function spFetchAllTracks(token, pid) {
  const res = await spFetch(`https://api.spotify.com/v1/playlists/${pid}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `Spotify HTTP ${res.status}`);
  }
  const playlist = await res.json();
  const tracks = [];
  const total = playlist.tracks.total;
  const pages = Math.ceil(total / 100);
  playlist.tracks.items.forEach(i => { if (i?.track) tracks.push(i.track); });

  // Use hooked progress fn if available (set by runSpotifyImport), otherwise spSetProgress
  const reportProgress = window._spProgHook || spSetProgress;
  reportProgress(tracks.length, total);
  onboardLog?.(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Playlist loaded ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${total} tracks, ~${Math.ceil(total/100)} pages to fetch`, 'ok');

  let next = playlist.tracks.next;
  let page = 1;
  while (next) {
    const r = await spFetch(next, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) break;
    const data = await r.json();
    data.items.forEach(i => { if (i?.track) tracks.push(i.track); });
    next = data.next;
    page++;
    reportProgress(tracks.length, total);
    // Log every 10 pages so the minilog isn't spammed
    if (page % 10 === 0) {
      const pct = Math.round(tracks.length / total * 100);
      onboardLog?.(`page ${page}/${pages} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${tracks.length}/${total} tracks (${pct}%)`, 'ok');
    }
  }
  return { playlist, tracks };
}

async function spFetchPlaylistImport(pid) {
  const res = await fetch(`/api/spotify/playlists/${encodeURIComponent(pid)}/import`, {
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || data.message || `Spotify playlist import failed (${res.status}).`);
    error.status = res.status;
    error.detail = data.detail;
    throw error;
  }
  return data;
}

function spBuildArtistMap(tracks) {
  // artist.id ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ { name, count }
  const map = {};
  tracks.forEach(track => {
    if (!track || track.is_local) return;
    (track.artists || []).forEach(a => {
      if (!map[a.id]) map[a.id] = { name: a.name, count: 0 };
      map[a.id].count++;
    });
  });
  return map;
}


// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// IMPORT FESTIVALS ONLY
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
async function importFestivalsOnly() {
  const btn = document.getElementById('fest-import-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'ÃƒÂ¢Ã‚ÂÃ‚Â³ ImportingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦'; }
  scanAborted = false;

  try {
    setStatus('Importing festivalsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', false);
    await fetchFestivalsData();

    // Persist festivals
    try { localStorage.setItem('tt_festivals', JSON.stringify(festivals)); } catch(e) {}
    DB.put('meta', 'festivals', { data: festivals, ts: Date.now() }).catch(() => {});

    buildFestPanel();
    renderMap();
    setStatus(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ ${festivals.length} festivals imported`, true);
    dblog('info', `Festival-only import done: ${festivals.length} festivals`);
  } catch(e) {
    setStatus('Festival import failed: ' + e.message, false);
    dblog('error', 'Festival import error: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'ÃƒÂ¢Ã‚Â¬Ã¢â‚¬Â¡ Import festivals'; }
  }
}

async function rescanFestsOnly() {
  if (!ARTISTS.length) { setStatus('No artists loaded ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â import a playlist first', false); return; }
  const btn     = document.getElementById('fest-rescan-btn');
  const stopBtn = document.getElementById('stop-btn');
  const loadbar = document.getElementById('loadbar');
  const hdProg  = document.getElementById('hd-progress');
  if (btn) { btn.disabled = true; btn.textContent = 'Fests...'; }
  scanAborted = false;

  // Show scan UI (loadbar + hd-progress + stop btn)
  if (loadbar) { loadbar.style.display = 'block'; document.getElementById('loadbar-fill').style.width = '0%'; }
  if (hdProg)  { hdProg.style.display = ''; hdProg.textContent = ''; }
  if (stopBtn) stopBtn.style.display = '';
  document.getElementById('pulse').className = 'pulse';

  try {
    // Wipe stale festival data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â start fresh with current geo filters + artist set
    await DB.delete('meta', 'festivals').catch(() => {});
    festivals = [];
    buildFestPanel(); renderMap(); // clear stale from UI immediately

    setStatus('Fetching festivals...', false);
    setProgress('Festivals: starting...', 2);

    // fetchFestivalsData calls setProgress internally throughout
    await fetchFestivalsData();

    // Post-process: dedup + score against current artist set
    festivals = deduplicateFestivals(festivals);
    if (ARTISTS.length) scoreFestivals();

    // Save fresh data to IDB
    DB.put('meta', 'festivals', { data: festivals, ts: Date.now() }).catch(() => {});

    setProgress('', 100);
    buildCalChips(); renderCalendar();
    buildFestPanel(); renderMap();

    setStatus(festivals.length + ' festivals ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â re-scanned', true);
    dblog('info', 'Fest-only rescan done: ' + festivals.length + ' festivals');
  } catch(e) {
    setStatus('Festival rescan failed: ' + e.message, false);
    dblog('error', 'Fest rescan error: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '\uD83C\uDFAA Fests'; }
    if (stopBtn) stopBtn.style.display = 'none';
    if (loadbar) setTimeout(() => { loadbar.style.display = 'none'; }, 800);
    if (hdProg)  setTimeout(() => { hdProg.style.display = 'none'; hdProg.textContent = ''; }, 800);
    document.getElementById('pulse').className = 'pulse live';
  }
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// GO-THRU FESTIVALS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â swipe-style review mode
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
let _gf = {
  queue: [],   // sorted festivals to go through
  idx: 0,
  saved: new Set(),  // festival ids user saved
};

function openGoThru() {
  const today = new Date().toISOString().split('T')[0];
  const upFests = festivals.filter(f => f.date >= today && geoDisplayOk(f.country || '') && dateMatchesPreset(f.date));

  if (!upFests.length) {
    softNotice('No festivals match the current date / location filters.');
    return;
  }

  // Sort: matched (score>0) first by score desc, then unmatched by date
  _gf.queue = [
    ...upFests.filter(f => (f.score||0) > 0).sort((a,b) => (b.score-a.score) || a.date.localeCompare(b.date)),
    ...upFests.filter(f => !(f.score||0) > 0).sort((a,b) => a.date.localeCompare(b.date)),
  ];
  _gf.idx = 0;
  _gf.saved = new Set();

  document.getElementById('gf-overlay').classList.add('open');
  gfRender();

  // Keyboard nav
  document.addEventListener('keydown', _gfKeyHandler);
}

function closeGoThru() {
  document.getElementById('gf-overlay').classList.remove('open');
  document.removeEventListener('keydown', _gfKeyHandler);

  // If user saved anything, show summary
  if (_gf.saved.size > 0) {
    const names = _gf.queue.filter(f => _gf.saved.has(f.id)).map(f => f.name);
    dblog('info', `Go-Thru: saved ${_gf.saved.size} festivals ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${names.join(', ')}`);
    setStatus(`ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª ${_gf.saved.size} festival${_gf.saved.size>1?'s':''} saved to list`, true);
    // Scroll festival pane to show saved ones highlighted
    buildFestPanel();
  }
}

function _gfKeyHandler(e) {
  if (e.key === 'Escape') { closeGoThru(); return; }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { gfNext(); return; }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { gfPrev(); return; }
  if (e.key === 's' || e.key === 'S') { gfToggleSave(); return; }
  if (e.key === 'Enter') { gfToggleSave(); return; }
}

function gfRender() {
  const f = _gf.queue[_gf.idx];
  const total = _gf.queue.length;
  if (!f) { gfShowDone(); return; }

  // Progress
  document.getElementById('gf-progress-fill').style.width = `${(_gf.idx / total) * 100}%`;
  document.getElementById('gf-counter').textContent = `${_gf.idx + 1} / ${total}`;

  const score = f.score || 0;
  const matched = f.matched || [];
  const isSaved = _gf.saved.has(f.id);
  const perfect = score >= 80 && matched.length >= 2;
  const ringCls = perfect ? 'p' : score > 0 ? 's' : '';
  const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
  const hasPlays = matched.some(m => m.plays > 0);

  const topMatched = matched.slice(0, 8);
  const extraCount = matched.length - topMatched.length;

  const matchedChips = topMatched.map((m, i) =>
    `<span class="gf-chip${i < 2 ? ' top' : ''}">${esc2(m.artist)}${hasPlays && m.plays ? `<span class="gf-chip-plays">${m.plays}</span>` : ''}</span>`
  ).join('');
  const extraChip = extraCount > 0 ? `<span class="gf-chip-other">+${extraCount} more</span>` : '';

  // Lineup artists not in our list
  const lineup = (f.lineup || []).filter(l => !matched.some(m => m.artist.toLowerCase() === l.toLowerCase()));
  const lineupChips = lineup.slice(0, 12).map(l => `<span class="gf-chip-other">${esc2(l)}</span>`).join('');
  const lineupExtra = lineup.length > 12 ? `<span class="gf-chip-other">+${lineup.length - 12}</span>` : '';

  document.getElementById('gf-body').innerHTML = `
    <div class="gf-score-row">
      <div class="gf-ring ${ringCls}">${score > 0 ? score : 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div>
      <div>
        <div class="gf-name">${esc2(f.name)}</div>
        <div class="gf-meta">${fmtDate(f.date)} Ãƒâ€šÃ‚Â· ${loc}</div>
      </div>
    </div>
    ${score > 0 ? `<div class="gf-bar-wrap"><div class="gf-bar-fill${perfect?' p':''}" style="width:${score}%"></div></div>` : ''}
    ${matched.length ? `
      <div class="gf-section">Your artists (${matched.length})</div>
      <div class="gf-chips">${matchedChips}${extraChip}</div>
    ` : `<div class="gf-none" style="margin-bottom:8px">None of your tracked artists on lineup</div>`}
    ${lineup.length ? `
      <div class="gf-section">Full lineup</div>
      <div class="gf-chips">${lineupChips}${lineupExtra}</div>
    ` : ''}
  `;

  // Update action bar
  const starBtn = document.getElementById('gf-star-btn');
  starBtn.className = 'gf-btn-star' + (isSaved ? ' saved' : '');
  starBtn.textContent = isSaved ? 'ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦ Saved' : 'ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â  Save';

  const actions = document.getElementById('gf-actions');
  const existing = actions.querySelector('.gf-btn-tkt');
  if (existing) existing.remove();
  if (f.url) {
    const tktBtn = document.createElement('a');
    tktBtn.className = 'gf-btn-tkt';
    tktBtn.href = f.url; tktBtn.target = '_blank';
    tktBtn.textContent = 'Tickets';
    actions.insertBefore(tktBtn, starBtn);
  }
}

function gfNext() {
  if (_gf.idx < _gf.queue.length - 1) {
    _gf.idx++;
    gfRender();
  } else {
    gfShowDone();
  }
}

function gfPrev() {
  if (_gf.idx > 0) {
    _gf.idx--;
    gfRender();
  }
}

function gfToggleSave() {
  const f = _gf.queue[_gf.idx];
  if (!f) return;
  if (_gf.saved.has(f.id)) {
    _gf.saved.delete(f.id);
  } else {
    _gf.saved.add(f.id);
  }
  gfRender();
}

function gfShowDone() {
  const saved = _gf.queue.filter(f => _gf.saved.has(f.id));
  document.getElementById('gf-progress-fill').style.width = '100%';
  document.getElementById('gf-counter').textContent = `Done Ãƒâ€šÃ‚Â· ${saved.length} saved`;

  document.getElementById('gf-body').innerHTML = `
    <div style="text-align:center;padding:24px 0 12px">
      <div style="font-size:2rem;margin-bottom:10px">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª</div>
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;margin-bottom:6px">All done!</div>
      <div style="font-size:.62rem;color:var(--muted);margin-bottom:20px">Reviewed ${_gf.queue.length} festival${_gf.queue.length!==1?'s':''}</div>
      ${saved.length ? `
        <div style="font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);margin-bottom:8px">Saved festivals (${saved.length})</div>
        ${saved.map(f => {
          const score = f.score || 0;
          const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);text-align:left">
            <div class="gf-ring ${score>=80?'p':score>0?'s':''}" style="width:32px;height:32px;font-size:.5rem">${score||'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div>
            <div>
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:.75rem">${esc2(f.name)}</div>
              <div style="font-size:.56rem;color:var(--muted)">${fmtDate(f.date)} Ãƒâ€šÃ‚Â· ${loc}</div>
            </div>
          </div>`;
        }).join('')}
      ` : `<div style="font-size:.62rem;color:var(--muted2)">Nothing saved ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â that's fine too</div>`}
    </div>
  `;

  document.getElementById('gf-actions').innerHTML = `
    <button class="gf-btn-skip" onclick="closeGoThru()">Close</button>
    ${_gf.idx > 0 ? `<button class="gf-btn-skip" onclick="gfPrev()">ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Back</button>` : ''}
  `;
}

let pickerBuilt = false;

function openSettings() {
  document.getElementById('api-input').value = SERVER_MANAGED_TICKETMASTER ? SERVER_TM_PLACEHOLDER : API_KEY;
  refreshKeyPoolUI();
  const tmKeyHint = document.getElementById('tm-key-hint');
  if (tmKeyHint) {
    tmKeyHint.innerHTML = SERVER_MANAGED_TICKETMASTER
      ? 'Ticketmaster keys live on the server for this deployment. The browser never stores or exposes them.'
      : 'Keys rotate when quota is hit (5,000 req/day). <span style="color:var(--green)">&#x25cf;</span> Active &#xb7; <span style="color:var(--red)">&#x25cf;</span> Exhausted (resets midnight UTC)';
  }
  const spNote = document.getElementById('sp-cred-note');
  if (spNote) {
    spNote.textContent = SERVER_MANAGED_SPOTIFY
      ? '- managed by server for this deployment'
      : '- set server env vars to enable Spotify';
  }
  const spIdInput = document.getElementById('sp-client-id');
  const spSecretInput = document.getElementById('sp-client-secret');
  if (spIdInput && spSecretInput) {
    spIdInput.value = '';
    spSecretInput.value = '';
    spIdInput.placeholder = SERVER_MANAGED_SPOTIFY ? 'Managed by server' : 'Server env required';
    spSecretInput.placeholder = SERVER_MANAGED_SPOTIFY ? 'Managed by server' : 'Server env required';
    spIdInput.disabled = true;
    spSecretInput.disabled = true;
  }
  spSetError(''); spSetResult(''); spClearProgress();
  syncProxyUI();
  document.getElementById('artists-ta').value = ARTISTS.map(name => {
    const p = ARTIST_PLAYS[name.toLowerCase()] || 0;
    return p > 0 ? `${name} ${p}` : name;
  }).join('\n');
  updateArtistCount();
  if (!pickerBuilt) { buildScopePicker(); }
  else { setScopeMode(countryMode); document.querySelectorAll('.rcard').forEach(syncRCard); refreshScopeSummary(); }

  const cb = document.getElementById('use-cached-btn');
  if (concerts.length || festivals.length) {
    cb.textContent = `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ Use cached (${cacheAge()})`;
    cb.style.display = '';
  } else {
    cb.style.display = 'none';
  }

  const badge = document.getElementById('artist-count-badge');
  if (badge) badge.textContent = ARTISTS.length ? `${ARTISTS.length} artists` : '';

  // Show/hide Database tab
  const dbTab = document.getElementById('stab-database');
  if (dbTab) dbTab.style.display = ARTISTS.length > 1 ? '' : 'none';

  // Render settings import history
  renderSettingsHistory();

  // Default to import tab when opening
  setSettingsTab(ARTISTS.length > 1 && (concerts.length || festivals.length) ? 'database' : 'import');

  document.getElementById('settings-bg').classList.remove('off');
}

let settingsTab = 'import';
function setSettingsTab(tab) {
  settingsTab = tab;
  ['import','database','advanced'].forEach(t => {
    document.getElementById(`stab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`stab-pane-${t}`)?.classList.toggle('active', t === tab);
  });
  if (tab === 'database') buildDatabaseTab();
}

function buildDatabaseTab() {
  const el = document.getElementById('db-tab-content');
  if (!el) return;

  const hist = getOnboardHistory();
  const pl = hist[0]; // most recent
  const artistsOnTour = Object.keys(allTourData).length;
  const today = new Date().toISOString().split('T')[0];
  const in90 = new Date(Date.now() + 90*86400000).toISOString().split('T')[0];
  const endingSoon = Object.entries(allTourData).filter(([,evs]) =>
    evs.length >= 5 && evs[evs.length-1].date >= today && evs[evs.length-1].date <= in90).length;
  const topFests = festivals.filter(f => f.score > 0).slice(0,5);

  const coverHtml = pl?.coverUrl
    ? `<img class="db-cover" src="${pl.coverUrl}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
    + `<div class="db-cover-ph" style="display:none">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â§</div>`
    : `<div class="db-cover-ph">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â§</div>`;

  const topChips = ARTISTS.slice(0,20).map((a,i) =>
    `<span class="db-artist-chip ${i<5?'top':''}">${esc2(a)}</span>`).join('');

  const festRows = topFests.map(f => {
    const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
    return `<div class="db-fest-row">
      <span class="db-fest-score">${f.score}</span>
      <span class="db-fest-name">${esc2(f.name)}</span>
      <span class="db-fest-date">${fmtDate(f.date)} ${loc}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="db-hero">
      ${coverHtml}
      <div class="db-hero-info">
        <div class="db-pl-name">${esc2(pl?.name || 'Your library')}</div>
        <div class="db-pl-meta">Last scanned ${cacheAge()} Ãƒâ€šÃ‚Â· ${pl?.trackCount || '?'} tracks</div>
      </div>

    </div>
    <div class="db-stats-grid">
      <div class="db-stat"><div class="db-stat-n">${ARTISTS.length}</div><div class="db-stat-l">Artists</div></div>
      <div class="db-stat"><div class="db-stat-n">${artistsOnTour}</div><div class="db-stat-l">On tour</div></div>
      <div class="db-stat"><div class="db-stat-n">${concerts.length}</div><div class="db-stat-l">Shows found</div></div>
      <div class="db-stat"><div class="db-stat-n">${festivals.length}</div><div class="db-stat-l">Festivals</div></div>
      <div class="db-stat"><div class="db-stat-n">${endingSoon}</div><div class="db-stat-l">Ending &lt;90d</div></div>
      <div class="db-stat"><div class="db-stat-n">${topFests.length ? topFests[0].score : 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div><div class="db-stat-l">Top fest score</div></div>
    </div>
    ${ARTISTS.length ? `
    <div class="db-section">
      <div class="db-section-title">Top artists in your library</div>
      <div class="db-artists-grid">${topChips}</div>
    </div>` : ''}
    ${topFests.length ? `
    <div class="db-section">
      <div class="db-section-title">Top festivals for you</div>
      <div class="db-fests-row">${festRows}</div>
    </div>` : ''}
    <div class="db-cache-info">
      Cache age: ${cacheAge() || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'} Ãƒâ€šÃ‚Â· ${concerts.length} shows Ãƒâ€šÃ‚Â· ${festivals.length} festivals
      <br>API quota estimate: ~${Math.ceil(ARTISTS.length * 1.5)} req/scan (TM free tier: 5000/day)
    </div>`;
}

function renderSettingsHistory() {
  const list = getOnboardHistory();
  const wrap = document.getElementById('settings-history-wrap');
  const hist = document.getElementById('settings-history');
  if (!wrap || !hist) return;
  if (!list.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  hist.innerHTML = '';
  list.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'onboard-pl';
    const ago = tsAgo(p.ts);
    const chips = (p.topArtists || []).slice(0,4).map(a =>
      `<span class="onboard-pl-chip">${esc2(a)}</span>`).join('');
    const coverHtml = p.coverUrl
      ? `<img class="onboard-pl-cover" src="${p.coverUrl}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><div class="onboard-pl-cover-ph" style="display:none">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â§</div>`
      : `<div class="onboard-pl-cover-ph">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â§</div>`;
    el.innerHTML = `
      ${coverHtml}
      <div class="onboard-pl-body">
        <div class="onboard-pl-name">${esc2(p.name)}</div>
        <div class="onboard-pl-meta">${p.artistCount} artists Ãƒâ€šÃ‚Â· ${p.trackCount} tracks Ãƒâ€šÃ‚Â· ${ago}</div>
        <div class="onboard-pl-chips">${chips}</div>
      </div>
      <button class="onboard-pl-del" title="Remove from history" onclick="removeOnboardHistory(event,${i})">ÃƒÆ’Ã¢â‚¬â€</button>`;
    el.onclick = e => {
      if (e.target.classList.contains('onboard-pl-del')) return;
      document.getElementById('sp-playlist-url').value = p.url;
      spotifyImport();
    };
    hist.appendChild(el);
  });
}

function closeSettings() { document.getElementById('settings-bg').classList.add('off'); }
function settingsBgClick(e) { if (e.target.id === 'settings-bg') closeSettings(); }
function useCached() { closeSettings(); buildCalChips(); renderCalendar(); renderMap(); }

function openApiTest() {
  const key = SERVER_MANAGED_TICKETMASTER
    ? SERVER_TM_PLACEHOLDER
    : (document.getElementById('api-input').value.trim() || API_KEY);
  if (!key) { softNotice('Add a Ticketmaster API key first.', 'warn', { focusId: 'api-input' }); return; }
  const testUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${key}&size=1&classificationName=music`;
  window.open(buildInternalProxyUrl(testUrl), '_blank');
}

function saveAndFetch(forceRefresh = false) {
  const k = document.getElementById('api-input').value.trim();
  if (SERVER_MANAGED_TICKETMASTER) API_KEY = SERVER_TM_PLACEHOLDER;
  else if (k) API_KEY = k;
  if (!API_KEY) { softNotice('Add a Ticketmaster API key to start the scan.', 'warn', { focusId: 'api-input' }); return; }
  const parsed = parseArtistLines(document.getElementById('artists-ta').value);
  if (!parsed.length) { softNotice('Add at least one artist.', 'warn', { focusId: 'artists-ta' }); return; }
  applyParsedArtists(parsed);
  persistSettings();
  closeSettings();
  fetchAll(forceRefresh);
}

// Parse textarea lines into {name, plays} pairs.
// Format: "Artist Name 14" or "Artist Name" (plays=0 if no number)
function parseArtistLines(text) {
  return text.trim().split('\n').map(line => {
    line = line.trim();
    if (!line) return null;
    const m = line.match(/^(.*?)\s+(\d+)\s*$/);
    if (m) return { name: m[1].trim(), plays: parseInt(m[2], 10) };
    return { name: line, plays: 0 };
  }).filter(Boolean);
}

// Rebuild ARTISTS (string[]) and ARTIST_PLAYS from parsed data
function applyParsedArtists(parsed) {
  ARTISTS = parsed.map(p => p.name);
  ARTIST_PLAYS = Object.fromEntries(parsed.map(p => [p.name.toLowerCase(), p.plays]));
}

function updateArtistCount() {
  const parsed = parseArtistLines(document.getElementById('artists-ta').value);
  const totalPlays = parsed.reduce((s, p) => s + p.plays, 0);
  const withPlays = parsed.filter(p => p.plays > 0).length;
  let msg = `${parsed.length} artist${parsed.length !== 1 ? 's' : ''}`;
  if (withPlays > 0) msg += ` Ãƒâ€šÃ‚Â· ${withPlays} weighted`;
  document.getElementById('artist-count').textContent = msg;
}
document.getElementById('artists-ta').addEventListener('input', updateArtistCount);

function clearArtists() {
  if (!confirm('Clear artist list?')) return;
  document.getElementById('artists-ta').value = '';
  updateArtistCount();
}

function trimArtistsByTracks(minCount) {
  const ta = document.getElementById('artists-ta');
  const parsed = parseArtistLines(ta.value);
  const before = parsed.length;

  // Artists with plays=0 have no track count info ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â keep them (can't filter)
  const hasAnyPlays = parsed.some(p => p.plays > 0);
  if (!hasAnyPlays) {
    const hint = document.getElementById('artist-trim-hint');
    if (hint) { hint.textContent = 'No track counts ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â re-import from Spotify first'; hint.classList.add('visible'); setTimeout(() => hint.classList.remove('visible'), 3000); }
    return;
  }

  // Keep artists that either: have plays >= minCount, OR have no play info (plays=0 = unknown)
  const kept = parsed.filter(p => p.plays === 0 || p.plays >= minCount);
  const removed = before - kept.length;

  if (removed === 0) {
    const hint = document.getElementById('artist-trim-hint');
    if (hint) { hint.textContent = 'Nothing to remove'; hint.classList.add('visible'); setTimeout(() => hint.classList.remove('visible'), 2500); }
    return;
  }

  if (!confirm(`Remove ${removed} artist${removed !== 1 ? 's' : ''} with fewer than ${minCount} tracks? (${kept.length} will remain)`)) return;

  ta.value = kept.map(p => p.plays > 0 ? `${p.name} ${p.plays}` : p.name).join('\n');
  updateArtistCount();

  const hint = document.getElementById('artist-trim-hint');
  if (hint) { hint.textContent = `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Removed ${removed} artists`; hint.classList.add('visible'); setTimeout(() => hint.classList.remove('visible'), 3000); }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SEARCH SCOPE PICKER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function regionCodes(rid) {
  return Object.entries(COUNTRY_MAP).filter(([,v]) => v.r === rid).map(([k]) => k);
}

function activeSet() {
  return countryMode === 'exclude' ? excludeCountries : includeCountries;
}

function setScopeMode(mode) {
  countryMode = mode;
  // Sync button highlights
  document.getElementById('scm-world').className   = 'sset-scope-btn' + (mode === 'world'   ? ' on-world'   : '');
  document.getElementById('scm-include').className = 'sset-scope-btn' + (mode === 'include' ? ' on-include' : '');
  document.getElementById('scm-exclude').className = 'sset-scope-btn' + (mode === 'exclude' ? ' on-exclude' : '');
  // Show/hide region panel
  { const _sr = document.getElementById('scope-regions'); if (_sr) _sr.style.display = mode === 'world' ? 'none' : 'block'; }
  // Recolor all rcard borders and cc chips
  document.querySelectorAll('.rcard').forEach(syncRCard);
  document.querySelectorAll('.cc').forEach(syncCCStyle);
  refreshScopeSummary();
}

function buildScopePicker() {
  setScopeMode(countryMode); // sync buttons

  const list = document.getElementById('rcard-list');
  list.innerHTML = '';

  REGIONS.forEach(r => {
    const codes = regionCodes(r.id);
    const card = document.createElement('div');
    card.className = 'rcard';
    card.dataset.rid = r.id;

    // Header
    const hd = document.createElement('div');
    hd.className = 'rcard-hd';
    hd.innerHTML = `
      <span class="rcard-emoji">${r.e}</span>
      <span class="rcard-name">${r.lbl}</span>
      <span class="rcard-badge" id="rbadge-${r.id}"></span>
      <div class="rcard-btns">
        <button class="rcard-btn a" title="Select all">All</button>
        <button class="rcard-btn n" title="Clear all">None</button>
      </div>
      <span class="rcard-chevron" id="rchev-${r.id}">ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¾</span>`;

    const body = document.createElement('div');
    body.className = 'rcard-body';
    body.id = `rbody-${r.id}`;

    // Auto-expand EU by default
    if (r.id === 'eu') { hd.querySelector('.rcard-chevron').classList.add('open'); body.classList.add('open'); }

    const grid = document.createElement('div');
    grid.className = 'cc-grid';
    grid.dataset.region = r.id;
    codes.forEach(code => {
      const m = COUNTRY_MAP[code]; if (!m) return;
      const cc = document.createElement('button');
      cc.className = 'cc'; cc.dataset.code = code;
      cc.innerHTML = `<span class="cf">${m.f}</span>${m.n}`;
      cc.onclick = e => { e.stopPropagation(); toggleCC(cc, code); };
      syncCCStyle(cc);
      grid.appendChild(cc);
    });
    body.appendChild(grid);

    // Header click = toggle expand
    hd.onclick = () => {
      const isOpen = body.classList.toggle('open');
      hd.querySelector('.rcard-chevron').classList.toggle('open', isOpen);
    };
    // "All" / "None" buttons
    hd.querySelector('.rcard-btn.a').onclick = e => { e.stopPropagation(); selectRegion(r.id, true); };
    hd.querySelector('.rcard-btn.n').onclick = e => { e.stopPropagation(); selectRegion(r.id, false); };

    card.appendChild(hd);
    card.appendChild(body);
    list.appendChild(card);
    syncRCard(card);
  });

  refreshScopeSummary();
  pickerBuilt = true;
}

function syncRCard(card) {
  const rid = card.dataset?.rid; if (!rid) return;
  const codes = regionCodes(rid);
  const set = activeSet();
  const selCount = codes.filter(c => set.has(c)).length;
  const badge = document.getElementById(`rbadge-${rid}`);
  if (badge) {
    const hasSel = selCount > 0;
    badge.textContent = hasSel ? `${selCount}/${codes.length}` : '';
    badge.className = 'rcard-badge' + (hasSel && countryMode === 'include' ? ' sel' : hasSel && countryMode === 'exclude' ? ' sel-exc' : '');
  }
  card.className = 'rcard' + (selCount > 0 ? ` has-sel ${countryMode === 'exclude' ? 'exc-mode' : 'inc-mode'}` : '');
}

function syncCCStyle(chip) {
  const code = chip.dataset.code;
  const set = activeSet();
  const active = set.has(code);
  chip.classList.toggle('inc', active && countryMode === 'include');
  chip.classList.toggle('exc', active && countryMode === 'exclude');
}

function toggleCC(chip, code) {
  const set = activeSet();
  if (set.has(code)) set.delete(code); else set.add(code);
  syncCCStyle(chip);
  const card = chip.closest('.rcard');
  if (card) syncRCard(card);
  refreshScopeSummary();
}

function selectRegion(rid, sel) {
  const codes = regionCodes(rid);
  const set = activeSet();
  codes.forEach(c => sel ? set.add(c) : set.delete(c));
  document.querySelectorAll(`.cc-grid[data-region="${rid}"] .cc`).forEach(syncCCStyle);
  const card = document.querySelector(`.rcard[data-rid="${rid}"]`);
  if (card) syncRCard(card);
  refreshScopeSummary();
}

function scopePreset(preset) {
  const EU = regionCodes('eu');
  const ALL = Object.keys(COUNTRY_MAP);
  const set = activeSet();
  set.clear();
  if (preset === 'eu')    EU.forEach(c => set.add(c));
  if (preset === 'eu+na') [...EU, ...regionCodes('na')].forEach(c => set.add(c));
  if (preset === 'all')   ALL.forEach(c => set.add(c));
  // 'none' = already cleared
  document.querySelectorAll('.cc').forEach(syncCCStyle);
  document.querySelectorAll('.rcard').forEach(syncRCard);
  refreshScopeSummary();
}

function refreshScopeSummary() {
  const el = document.getElementById('scope-summary');
  if (!el) return;
  if (countryMode === 'world') { el.textContent = 'Ãƒâ€šÃ‚Â· worldwide'; return; }
  const set = activeSet();
  if (!set.size) {
    el.textContent = countryMode === 'include' ? 'Ãƒâ€šÃ‚Â· nothing selected (worldwide)' : 'Ãƒâ€šÃ‚Â· nothing excluded (worldwide)';
    return;
  }
  // Summarize by region
  const byRegion = {};
  for (const code of set) {
    const r = COUNTRY_MAP[code]?.r || '?';
    byRegion[r] = (byRegion[r] || 0) + 1;
  }
  const parts = Object.entries(byRegion).map(([r, n]) => {
    const total = regionCodes(r).length;
    const reg = REGIONS.find(x => x.id === r);
    return n === total ? `${reg?.e || r} all` : `${reg?.e || r} ${n}`;
  });
  el.textContent = `Ãƒâ€šÃ‚Â· ${countryMode === 'exclude' ? 'excluding: ' : ''}${parts.join(', ')}`;
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// FETCH
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
const sleep = ms => new Promise(r => setTimeout(r, ms));

// AbortController properly cancels TCP sockets ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â unlike XHR.timeout or Promise.race
async function apiFetch(url, ms = 5000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  const short = url.replace(/apikey=[^&]+/, 'apikey=ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦').slice(0, 100);
  const t0 = Date.now();
  try {
    // Route through tmFetch so TM proxy (none/auto/corsproxy/allorigins/custom) is respected.
    // Note: when using a proxy the AbortSignal targets the proxy request, which is correct.
    const r = await tmFetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    const ms2 = Date.now() - t0;
    const proxyNote = tmProxyWorking && tmProxyWorking !== 'direct' ? ` [via ${tmProxyWorking}]` : '';
    if (r.status === 200) {
      window._tmReqCount = (window._tmReqCount || 0) + 1;
      window._onTmOk?.();
      dblog('ok', `HTTP 200 (${ms2}ms)${proxyNote} [TM req #${window._tmReqCount}]`, short);
    }
    else if (r.status === 429) {
      // CRITICAL DISTINCTION: burst throttle vs daily quota exhaustion.
      //
      // A burst-rate-limit 429 takes 100-400ms because TM's server actually
      // processes the request before deciding to reject it. Waiting 5-10 seconds
      // and retrying is the correct response.
      //
      // A daily-quota-exhaustion 429 takes < 15ms because TM's gateway instantly
      // rejects the request at the network edge without routing it anywhere. The
      // key is at its hard daily limit ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â retrying in 5 seconds is pointless and
      // just wastes more of the quota you don't have. You need to wait until
      // midnight UTC when the counters reset.
      const isHardQuota = r.headers.get('x-tourtrack-tm-state') === 'all-keys-exhausted' || ms2 < 15;
      if (isHardQuota) {
        window._onTmHardQuota?.();
      } else {
        window._onTm429?.();
      }
      dblog('rate', `HTTP 429 ${isHardQuota ? 'ÃƒÂ¢Ã¢â‚¬ÂºÃ¢â‚¬Â QUOTA EXHAUSTED' : 'rate-limited'} (${ms2}ms)`, short);
    }
    else                       dblog('warn', `HTTP ${r.status} (${ms2}ms)`, short);
    return r;
  } catch(e) {
    clearTimeout(tid);
    const ms2 = Date.now() - t0;
    if (e.name === 'AbortError') {
      dblog('timeout', `Timeout after ${ms2}ms ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TM did not respond`, short);
      throw new Error('timeout');
    }
    // NET error ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â just log, don't rotate proxy (TM bans by API key, not IP ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rotating doesn't help)
    const diagnosis = diagnoseNetworkError(e, url);
    dblog('net', `Network error after ${ms2}ms: ${diagnosis}`, short);
    // Rethrow as 'net' so processArtist can detect it separately from API errors
    const err = new Error('net:' + (e.message || 'Failed to fetch'));
    err.isNet = true;
    throw err;
  }
}

function countryAllowed(cc) {
  if (countryMode === 'world') return true;
  if (!cc) return true;
  return countryMode === 'include'
    ? (includeCountries.size === 0 || includeCountries.has(cc))
    : !excludeCountries.has(cc);
}

function apiCountryParam() {
  // TM Discovery API only supports a SINGLE countryCode value ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â comma-separated silently breaks.
  // For include-mode with exactly 1 country: pass it for server-side filtering.
  // For multiple countries or exclude mode: no param ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fetch globally, filter client-side via countryAllowed().
  if (countryMode === 'include' && includeCountries.size === 1) {
    return '&countryCode=' + [...includeCountries][0];
  }
  return '';
}


// Strip diacritics: Siloe -> siloe, Bogota -> bogota
function _normDia(s) { return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function shiftIsoDate(iso, days) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function _normText(s) {
  return _normDia(s)
    .replace(/&/g, ' and ')
    .replace(/['ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _splitBillParts(s) {
  return _normText(s)
    .split(/\s*(?:,|\/|\+| x | with | feat\.?| ft\.?| and )\s*/i)
    .map(v => v.trim())
    .filter(Boolean);
}
function _uniqueCI(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const label = String(item || '').trim();
    const key = _normText(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}
function _tokenOverlap(a, b) {
  const aa = new Set(_normText(a).split(' ').filter(w => w.length > 1));
  const bb = new Set(_normText(b).split(' ').filter(w => w.length > 1));
  if (!aa.size || !bb.size) return 0;
  let hits = 0;
  aa.forEach(w => { if (bb.has(w)) hits++; });
  return hits / Math.max(aa.size, bb.size);
}
function _wordBoundaryRe(s) {
  const esc = String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9])' + esc + '([^a-z0-9]|$)', 'i');
}
function _hasBoundaryMatch(needle, haystack) {
  if (!needle || !haystack) return false;
  return _wordBoundaryRe(needle).test(haystack);
}
function _artistAliases(name) {
  const base = _normText(name);
  const aliases = new Set(base ? [base] : []);
  if (base.startsWith('the ')) aliases.add(base.slice(4));
  return [...aliases].filter(Boolean);
}

const FALSE_EVENT_CONTEXT_RE = /\b(experience|tribute|legacy|celebration|salute|story|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|after[- ]party|party|club night|dance night|dance party|brunch|burlesque|drag brunch|performed by|featuring the music of|music of|songs of|sounds of|inspired by|tribute to|vs\.?|meets|battle of|versus|plays the music of|best of)\b/i;
const FALSE_ATTRACTION_CONTEXT_RE = /\b(tribute|experience|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|party|night|brunch|burlesque|drag)\b/i;
const POSITIVE_EVENT_CONTEXT_RE = /\b(live|tour|concert|headline|headlining|special|acoustic|solo|residency|showcase|session|world tour|north american tour|european tour)\b/i;
const FEST_EVENT_RE = /\bfest(?:ival)?\b|open\s+air\b|weekender\b|lollapalooza|coachella|primavera\b|rock\s+(?:en|am|im|al)\b|pal\s+norte|vive\s+latino|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|rock\s+werchter|outside\s+lands|governors\s+ball|bonnaroo|austin\s+city|fuji\s+rock|summer\s+sonic|rolling\s+loud/i;
const FEST_VENUE_HINT_RE = /\b(park|grounds|field|fields|festival|open air|camping|weekender)\b/i;
const TICKET_TIER_RE = /\b(vip|ga|general admission|weekend pass|day pass|single[- ]day|early bird|platinum|premium|package|parking|camping|hotel|shuttle|upgrade|fast lane|bundle|combo|presale|admission|entry|ticket(?:s)?|3 day|2 day|three day|two day|domingo|sabado|viernes|sunday|saturday|friday|abono(?:s)?|boleto(?:s)?|pase(?:s)?|ascendente|full pass)\b/gi;
const TICKET_TIER_TEST_RE = /\b(vip|ga|general admission|weekend pass|day pass|single[- ]day|early bird|platinum|premium|package|parking|camping|hotel|shuttle|upgrade|fast lane|bundle|combo|presale|admission|entry|ticket(?:s)?|3 day|2 day|three day|two day|domingo|sabado|viernes|sunday|saturday|friday|abono(?:s)?|boleto(?:s)?|pase(?:s)?|ascendente|full pass)\b/i;

const _EV_QUALIFIER = new Set([
  'live','tour','concert','feat','ft','with','at','in','the','a','an','and',
  'of','vol','part','edition','anniversary','special','acoustic','solo',
  'residency','headline','showcase','session','world','north','american',
  'european','farewell','finale','2023','2024','2025','2026','2027','2028'
]);

function _trimTicketWords(s) {
  return _normText(s).replace(TICKET_TIER_RE, ' ').replace(/\s+/g, ' ').trim();
}
function _venueCore(s) {
  return _trimTicketWords(s)
    .replace(/\b(official|tickets?|stage|hall|club|room)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _cityCore(s) {
  return _normText(s)
    .replace(/\b(city|metropolitan area)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _normalizedUrlKey(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.toLowerCase();
  } catch {
    return String(url || '').split('?')[0].toLowerCase();
  }
}
function _festivalBaseName(name) {
  return _trimTicketWords(name)
    .replace(/\b(20\d{2}|festival|music|weekender|weekend|day\s*\d+|day one|day two|day three|north|south|east|west|official|presented by)\b/g, ' ')
    .replace(/\b(friday|saturday|sunday|jueves|viernes|sabado|domingo)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _isFestivalSelfReference(candidate, festName) {
  const cand = _festivalBaseName(candidate);
  const fest = _festivalBaseName(festName);
  if (!cand || !fest) return false;
  if (cand === fest) return true;
  if (cand.length >= 4 && (fest.includes(cand) || cand.includes(fest))) return true;
  return _tokenOverlap(cand, fest) >= 0.75;
}
function _festivalLineupFromEvent(ev, displayName) {
  const festName = displayName || ev?.name || '';
  const raw = (ev?._embedded?.attractions || []).map(a => a.name).filter(Boolean);
  return _uniqueCI(raw
    .map(name => _trimTicketWords(name))
    .filter(name => {
      if (!name || name.length < 2) return false;
      if (FALSE_ATTRACTION_CONTEXT_RE.test(_normText(name))) return false;
      if (TICKET_TIER_TEST_RE.test(name)) return false;
      return !_isFestivalSelfReference(name, festName);
    }));
}
function isFestivalLikeEvent(ev) {
  const name = _normText(ev?.name || '');
  const venue = _normText(ev?._embedded?.venues?.[0]?.name || '');
  const lineup = _festivalLineupFromEvent(ev, ev?.name || '');
  const rawAttractions = ev?._embedded?.attractions || [];
  if (FEST_EVENT_RE.test(name)) return true;
  if (lineup.length >= 4 || rawAttractions.length >= 6) return true;
  if (lineup.length >= 2 && FEST_VENUE_HINT_RE.test(venue)) return true;
  return false;
}

function _isCleanEvNameMatch(alias, evName) {
  if (!_hasBoundaryMatch(alias, evName)) return false;
  const esc = String(alias || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(esc + '(.*)$', 'i').exec(evName);
  const after = m ? m[1].trim() : '';
  if (!after) return true;
  const fc = after[0];
  if (/[-:,.(\[!?/]/.test(fc)) return true;
  if (/[0-9]/.test(fc)) {
    const num = parseInt(after, 10);
    return num >= 2020 && num <= 2035;
  }
  if (!/^[a-z]/i.test(fc)) return true;
  const w = after.split(/[\s\-:,.!?()[\]\/]+/)[0].toLowerCase();
  return _EV_QUALIFIER.has(w);
}
function _attractionMatchesArtist(artist, attractionName) {
  const target = _normText(attractionName);
  if (!target) return false;
  const parts = _splitBillParts(attractionName);
  return _artistAliases(artist).some(alias => {
    if (!alias) return false;
    if (target === alias) return true;
    if (parts.some(part => {
      if (part === alias) return true;
      if (!_hasBoundaryMatch(alias, part)) return false;
      const remainder = part.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
      if (remainder && FALSE_ATTRACTION_CONTEXT_RE.test(remainder)) return false;
      return _tokenOverlap(alias, part) >= 0.7;
    })) return true;
    if (_hasBoundaryMatch(alias, target)) {
      const remainder = target.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
      if (remainder && FALSE_ATTRACTION_CONTEXT_RE.test(remainder)) return false;
      if (_tokenOverlap(alias, target) >= 0.7) return true;
    }
    return false;
  });
}
function _eventNameLooksLikeArtistShow(artist, evName) {
  const norm = _normText(evName);
  if (!norm) return false;
  return _artistAliases(artist).some(alias => {
    if (!_isCleanEvNameMatch(alias, norm)) return false;
    const stripped = norm.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
    if (stripped && FALSE_EVENT_CONTEXT_RE.test(stripped)) return false;
    if (!stripped) return true;
    if (POSITIVE_EVENT_CONTEXT_RE.test(stripped)) return true;
    const words = stripped.split(/\s+/).filter(Boolean);
    return words.length <= 2 && words.every(w => _EV_QUALIFIER.has(w) || /^\d{4}$/.test(w));
  });
}

function artistMatch(artist, ev, ambig) {
  const attractions = ev._embedded?.attractions || [];
  if (attractions.some(a => _attractionMatchesArtist(artist, a.name))) return true;
  if (ambig || attractions.length) return false;
  return _eventNameLooksLikeArtistShow(artist, ev.name || '');
}

function _festivalConcertBridge(f, c) {
  if (!f || !c || !f.date || !c.date || !c.artist) return false;
  const from = shiftIsoDate(f.date, -1);
  const to = f.endDate || f.date;
  if (c.date < from || c.date > to) return false;

  const festVenue = _venueCore(f.venue || '');
  const showVenue = _venueCore(c.venue || '');
  const festCity = _cityCore(f.city || '');
  const showCity = _cityCore(c.city || '');
  const sameCountry = !(f.country && c.country) || f.country === c.country;

  if (f.lat != null && f.lng != null && c.lat != null && c.lng != null) {
    const dist = geoDist(f.lat, f.lng, c.lat, c.lng);
    if (dist <= 6) return true;
    if (dist <= 12 && festVenue && showVenue && _tokenOverlap(festVenue, showVenue) >= 0.45) return true;
  }
  if (festVenue && showVenue && (festVenue === showVenue || _tokenOverlap(festVenue, showVenue) >= 0.72)) {
    return sameCountry;
  }
  if (festCity && showCity && festCity === showCity && sameCountry && c.isFest) return true;
  return false;
}
function _festivalLinkedConcerts(f, sourceList = concerts) {
  return (sourceList || []).filter(c => _festivalConcertBridge(f, c));
}
function _resolvedFestivalLineup(f) {
  return _uniqueCI([...(f.lineup || []), ..._festivalLinkedConcerts(f).map(c => c.artist)]);
}
function _lineupArtistHit(artist, lineup) {
  return (lineup || []).some(name => _attractionMatchesArtist(artist, name));
}
function shouldGroupAsVenueFestival(group) {
  const artists = _uniqueCI((group || []).map(c => c.artist));
  if (artists.length < 3) return false;
  const withCoords = (group || []).filter(c => c.lat != null && c.lng != null);
  if (withCoords.length >= 2) {
    const anchor = withCoords[0];
    if (withCoords.some(c => geoDist(anchor.lat, anchor.lng, c.lat, c.lng) > 8)) return false;
  }
  const venue = _venueCore(group?.[0]?.venue || '');
  const city = _cityCore(group?.[0]?.city || '');
  const venueName = _normText(group?.[0]?.venue || '');
  const festSignals = (group || []).some(c => c.isFest) || FEST_VENUE_HINT_RE.test(venueName) || artists.length >= 4;
  return !!(venue || city) && festSignals;
}

function stopScan() {
  scanAborted = true;
  window._scanActive = false;
  document.getElementById('stop-btn').style.display = 'none';
  setStatus('Stopped ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â showing partial results', false);
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// BIT PRE-FLIGHT SCAN
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// The key insight here is that Bandsintown is CORS-friendly, has no enforced
// rate limit for reasonable usage, and requires no API key. Instead of calling
// it only as a last-resort fallback after TM fails, we use it as an upfront
// oracle: run all artists in parallel BEFORE the TM scan, collect their shows
// directly, and use the results to decide who even needs a TM query at all.
//
// An artist that BIT says has 0 upcoming events almost certainly isn't touring.
// Combined with totalUpcoming===0 from TM's attraction data, this lets us skip
// the TM event fetch for those artists entirely, dramatically reducing quota use.
//
// Returns: Map<artistName, shows[]>  (empty array = confirmed not touring on BIT)
const TTL_BIT_PREFLIGHT = 12 * 3600e3; // 12h ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â tour status changes slowly

async function bitPreFlightScan(artists) {
  if (window._bitBlocked) {
    dblog('warn', 'BIT pre-flight: skipped (BIT is blocked this session)');
    return new Map();
  }

  const results = new Map(); // artist ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ shows[]
  const toCheck = [];

  // Load IDB cache first ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â avoids re-checking artists we already know about
  for (const artist of artists) {
    const cacheKey = 'bit_pf_' + artist.toLowerCase().trim();
    try {
      const cached = await DB.get('meta', cacheKey);
      if (cached && (Date.now() - cached.ts) < TTL_BIT_PREFLIGHT) {
        results.set(artist, cached.shows || []);
        continue;
      }
    } catch(e) {}
    toCheck.push(artist);
  }

  if (!toCheck.length) {
    const touring = [...results.values()].filter(s => s.length > 0).length;
    dblog('info', `BIT pre-flight: all ${artists.length} cached ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${touring} touring`);
    return results;
  }

  dblog('info', `BIT pre-flight: ${toCheck.length} to check (${results.size} cached) Ãƒâ€šÃ‚Â· concurrency=8`);
  setProgress(`BIT pre-flight: 0/${toCheck.length} checkedÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, 5);

  const today = new Date().toISOString().split('T')[0];
  let checked = 0;
  let idx = 0;

  // Worker coroutine ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â each of the 8 runs independently until the queue is empty
  async function worker() {
    while (idx < toCheck.length && !scanAborted) {
      const artist = toCheck[idx++];
      const shows = await fetchBIT(artist, today).catch(() => []);
      results.set(artist, shows);

      // Persist to IDB so subsequent smart scans don't re-check
      const cacheKey = 'bit_pf_' + artist.toLowerCase().trim();
      DB.put('meta', cacheKey, { ts: Date.now(), shows }).catch(() => {});

      checked++;
      if (checked % 10 === 0 || checked === toCheck.length) {
        const touring = [...results.values()].filter(s => s.length > 0).length;
        setProgress(`BIT pre-flight: ${checked}/${toCheck.length} Ãƒâ€šÃ‚Â· ${touring} on tour`, Math.round(checked / toCheck.length * 18));
      }
    }
  }

  // 8 parallel workers ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â BIT handles this fine, no shared rate limiter needed
  await Promise.all(Array.from({ length: 8 }, worker));

  const touring = [...results.values()].filter(s => s.length > 0).length;
  const notTouring = results.size - touring;
  dblog('info', `BIT pre-flight done: ${touring} touring Ãƒâ€šÃ‚Â· ${notTouring} dormant Ãƒâ€šÃ‚Â· ${results.size} total`);
  return results;
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// INVERTED GEO SWEEP
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// The normal approach asks "what concerts does Artist X have?" for each artist,
// one by one. This inverted approach asks instead "what concerts are happening in
// Mexico (or wherever)?" and then matches those events against the artist list.
//
// Why this is much better for focused geographic searches:
//   Normal:  200 artists ÃƒÆ’Ã¢â‚¬â€ 2 TM requests = 400 requests
//   Inverted: ~10ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“20 pages of all MX events = 10ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“20 requests ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 95% fewer
//
// Activates automatically when countryMode='include' with ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤5 countries and none
// of them are large markets that would require hundreds of pages to sweep.
//
// Returns: Map<artistName, shows[]>

// Markets too large to sweep efficiently (10k+ events / year each)
const GEO_SWEEP_LARGE_MARKETS = new Set(['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'BR']);
const GEO_SWEEP_MAX_PAGES = 30; // safety cap: 30 pages ÃƒÆ’Ã¢â‚¬â€ 200 events = 6000 events max per country

function shouldUseGeoSweep() {
  if (countryMode !== 'include') return false;
  if (includeCountries.size === 0 || includeCountries.size > 5) return false;
  // Skip if any of the selected countries is a large market
  for (const cc of includeCountries) {
    if (GEO_SWEEP_LARGE_MARKETS.has(cc)) return false;
  }
  return true;
}

async function geoSweepScan(today) {
  // Build a fast lookup: lowercase name ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ original name (for case-insensitive matching)
  const artistIndex = new Map(ARTISTS.map(a => [a.toLowerCase(), a]));
  const found = new Map(); // artist ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ shows[]

  dblog('info', `Geo sweep: scanning ${[...includeCountries].join(',')} for all music events, then matching ${ARTISTS.length} artists`);

  for (const cc of includeCountries) {
    if (scanAborted) break;
    let page = 0;
    let totalPages = null;

    while (page < GEO_SWEEP_MAX_PAGES && !scanAborted) {
      await (window._rateLimitedWait?.());
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&classificationName=music&countryCode=${cc}&size=200&page=${page}&sort=date,asc&startDateTime=${today}T00:00:00Z`;

      let evs = [];
      try {
        const r = await apiFetch(url);
        if (r.status === 429) { window._onTm429?.(); await sleep(6000); continue; }
        if (!r.ok) break;
        const d = await r.json();
        evs = d?._embedded?.events || [];

        // On first page, figure out how many total pages exist for logging
        if (page === 0 && d?.page) {
          totalPages = Math.ceil(d.page.totalElements / 200);
          dblog('info', `Geo sweep ${cc}: ${d.page.totalElements} total music events (${totalPages} pages)`);
        }
      } catch(e) {
        dblog('warn', `Geo sweep ${cc} p${page}: ${e.message}`);
        break;
      }

      // Match each event's performers against our artist list
      for (const ev of evs) {
        const date = ev.dates?.start?.localDate;
        if (!date || date < today) continue;

        const v = ev._embedded?.venues?.[0];
        const lat = parseFloat(v?.location?.latitude);
        const lng = parseFloat(v?.location?.longitude);
        const attractions = ev._embedded?.attractions || [];
        for (const attr of attractions) {
          const attrLower = (attr.name || '').toLowerCase();
          if (!artistIndex.has(attrLower)) continue; // not one of our artists

          const artist = artistIndex.get(attrLower);
          const show = {
            id: ev.id, artist, date,
            venue: v?.name || '', city: v?.city?.name || '',
            country: cc, state: v?.state?.stateCode || '',
            lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
            url: ev.url, eventName: ev.name || '', _src: 'tm_geo', isFest: isFestivalLikeEvent(ev),
          };
          if (!found.has(artist)) found.set(artist, []);
          // Avoid duplicate events (same ID, same artist)
          const existing = found.get(artist);
          if (!existing.some(s => s.id === ev.id)) existing.push(show);
        }
      }

      const pageLabel = totalPages ? `${page + 1}/${totalPages}` : `${page + 1}`;
      setProgress(`Geo sweep ${cc} p${pageLabel}: ${found.size} artists found so far`, 20 + Math.round(page / GEO_SWEEP_MAX_PAGES * 30));

      if (evs.length < 200) break; // reached last page
      page++;
    }

    const cc_shows = [...found.values()].flat().filter(s => s.country === cc).length;
    dblog('ok', `Geo sweep ${cc} done: ${cc_shows} shows, ${page + 1} pages scanned`);
  }

  const totalFound = [...found.values()].flat().length;
  dblog('info', `Geo sweep complete: ${totalFound} shows across ${found.size} artists`);
  return found;
}

async function fetchAll(forceRefresh = false) {
  if (!API_KEY || !ARTISTS.length) { openSettings(); return; }
  scanAborted = false;

  document.getElementById('loadbar').style.display = 'block';
  document.getElementById('hd-progress').style.display = '';
  document.getElementById('stop-btn').style.display = '';
  /* refresh-btn removed */
  document.getElementById('pulse').className = 'pulse';

  if (!dbgVisible) toggleDbg();
  const mode = forceRefresh ? 'FORCE-INCREMENTAL (diffs new shows vs cache)' : 'SMART (per-artist 24h cache)';
  dblog('info', `Scan started ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${mode} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â key: ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦${API_KEY.slice(-6)}, artists: ${ARTISTS.length}`);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Keep stale data visible while the new scan runs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // Instead of wiping concerts[] immediately (which triggers showOnboard() on
  // the first render when new data hasn't arrived yet), we hold onto the old
  // arrays. New results are pushed into the same arrays progressively, so the
  // calendar/map always has something to show. _staleCount marks how many of
  // the entries are "old" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â we can strip them at the end once fresh data is in.
  const _staleCount = concerts.length;
  const _staleFestCount = festivals.length;
  if (forceRefresh) {
    concerts = []; festivals = [];
  }
  // _scanActive tells renderCalendar/renderMxCalendar not to call showOnboard()
  // even if concerts[] happens to be empty (e.g. between clearing stale and
  // receiving first fresh results).
  window._scanActive = true;
  if (forceRefresh) fetchErrors = {};

  const total = ARTISTS.length;
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const cHash = countryHash();

  // Shared counters ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â safe to mutate in JS single-threaded event loop
  const C = { cached: 0, fresh: 0, error: 0, done: 0, skipped: 0, geoSweep: 0, bit: 0 };
  let baseSleep = 750;
  let consecErrors = 0;

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Global rate limiter + proxy rotation on 429 ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const MIN_GAP_MS = 750;  // 80 req/min baseline
  let lastRequestAt = 0;
  let consecutive429 = 0;
  const PROXY_ROTATION = ['auto', 'corsproxy', 'allorigins', 'none'];

  async function rateLimitedWait() {
    const now = Date.now();
    const gap = now - lastRequestAt;
    if (gap < MIN_GAP_MS) await sleep(MIN_GAP_MS - gap);
    lastRequestAt = Date.now();
  }
  window._rateLimitedWait = rateLimitedWait;

  window._onTm429 = () => {
    consecutive429++;
    const pause = Math.min(5000 * Math.pow(2, Math.floor((consecutive429 - 1) / 3)), 60000);
    dblog('warn', `429 ÃƒÆ’Ã¢â‚¬â€${consecutive429} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cooling down ${Math.round(pause/1000)}s`);
    lastRequestAt = Date.now() + pause;
    baseSleep = Math.min(baseSleep * 1.3, 3000);
  };

  // Hard quota exhaustion detection.
  // A hard-quota 429 returns in <15ms (gateway rejects at edge without routing).
  // A burst-rate-limit 429 takes 100-400ms. We distinguish by response latency.
  //
  // Key rotation strategy: on the SECOND instant 429 we mark the current key
  // exhausted and try the next key in TM_KEYS[]. Scan continues uninterrupted.
  // Only if ALL keys are exhausted do we stop and show the quota modal.
  window._onTmHardQuota = () => {
    // A hard-quota 429 arrives in <15ms ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TM's gateway edge-rejects without routing.
    // This is unmistakable: corsproxy normal responses are 250-800ms (see log).
    // No need to wait for a second confirmation. Rotate immediately on first hit.
    if (scanAborted) return;
    if (SERVER_MANAGED_TICKETMASTER) {
      scanAborted = true;
      window._scanActive = false;
      window._hardQuotaHit = true;
      document.getElementById('stop-btn').style.display = 'none';
      const nowUTC = new Date();
      const midnightUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() + 1));
      const hoursUntilReset = Math.ceil((midnightUTC - nowUTC) / 3600000);
      const resetStr = hoursUntilReset <= 1 ? 'in < 1 hour' : `in ~${hoursUntilReset} hours`;
      dblog('error', `Ticketmaster server quota exhausted - aborting. Resets midnight UTC (${resetStr}).`);
      setStatus(`Ticketmaster server quota exhausted - ${concerts.length} shows found`, false);
      showQuotaModal(resetStr, concerts.length + festivals.length);
      return;
    }

    dblog('warn', `ÃƒÂ¢Ã¢â‚¬ÂºÃ¢â‚¬Â Hard quota on key ..${API_KEY.slice(-6)} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rotating now`);

    // Mark current key exhausted so it is skipped for the rest of the session
    if (TM_KEYS[_activeKeyIdx]) TM_KEYS[_activeKeyIdx].exhausted = true;

    const nextIdx = TM_KEYS.findIndex((k, i) => i !== _activeKeyIdx && !k.exhausted);

    if (nextIdx >= 0) {
      // Switch to next key ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no interruption to the scan
      _activeKeyIdx = nextIdx;
      API_KEY = TM_KEYS[nextIdx].key;
      window._hardQuotaHit = false;
      window._tmReqCount = 0;
      localStorage.setItem('tt_key', API_KEY);
      const lbl = TM_KEYS[nextIdx].label || ('Key ' + (nextIdx + 1));
      dblog('info', `ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ Rotated to ${lbl} (..${API_KEY.slice(-6)}) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â scan continues`);
      setStatus(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ Key rotated ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${lbl} Ãƒâ€šÃ‚Â· continuing scanÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, true);
      const apiInput = document.getElementById('api-input');
      if (apiInput) apiInput.value = API_KEY;
      refreshKeyPoolUI();
      // Brief pause so the new key doesn't get hit before the rotation is fully applied
      lastRequestAt = Date.now() + 1500;
    } else {
      // All keys exhausted ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â stop
      scanAborted = true;
      window._scanActive = false;
      window._hardQuotaHit = true;
      document.getElementById('stop-btn').style.display = 'none';
      const nowUTC = new Date();
      const midnightUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() + 1));
      const hoursUntilReset = Math.ceil((midnightUTC - nowUTC) / 3600000);
      const resetStr = hoursUntilReset <= 1 ? 'in < 1 hour' : `in ~${hoursUntilReset} hours`;
      dblog('error', `ÃƒÂ¢Ã¢â‚¬ÂºÃ¢â‚¬Â All ${TM_KEYS.length} keys exhausted ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â aborting. Resets midnight UTC (${resetStr}).`);
      setStatus(`ÃƒÂ¢Ã¢â‚¬ÂºÃ¢â‚¬Â All keys exhausted Ãƒâ€šÃ‚Â· ${concerts.length} shows found Ãƒâ€šÃ‚Â· resets midnight UTC`, false);
      showQuotaModal(resetStr, concerts.length + festivals.length);
    }
  };

  window._onTmOk = () => {
    if (consecutive429 > 0) {
      consecutive429 = Math.max(0, consecutive429 - 1);
      baseSleep = Math.max(750, baseSleep * 0.95);
    }
  };

  window._onTmNet = null;
  window._onTmOk = () => {
    if (consecutive429 > 0) {
      consecutive429 = Math.max(0, consecutive429 - 1);
      baseSleep = Math.max(750, baseSleep * 0.95);
    }
  };
  netErrStreak = 0; netErrTotal = 0; circuitOpen = false;
  dbgBannerDismissed = false;
  window._tmReqCount = 0;
  window._hardQuotaHit = false; // reset hard-quota flag so new scan starts clean
  // Reset ETA rolling window ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â stale timestamps from a previous scan would skew the estimate
  updateProgress._times = [];
  // Reset map auto-fit so the new data gets a fresh fitBounds on first render
  _mapFirstFit = false;
  document.getElementById('dbg-banner')?.classList.remove('visible');

  try { await DB.get('artists', '__ping__'); } catch(e) {}

  async function waitIfCircuit() {
    if (!circuitOpen) return;
    dblog('warn', `ÃƒÂ¢Ã‚ÂÃ‚Â¸ Circuit open ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â pausing dispatch until network recovers (or Stop is pressed)`);
    setProgress('ÃƒÂ¢Ã‚ÂÃ‚Â¸ Network errors ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â paused. Check Debug Log or press Diagnose.', null);
    while (circuitOpen && !scanAborted) {
      await sleep(500);
    }
    if (!scanAborted) dblog('info', 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Resuming scanÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦');
  }

  // ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
  // PHASE 0: BIT PRE-FLIGHT
  // Run all artists through Bandsintown in parallel before touching TM.
  // This is cheap (free API, no rate limit, CORS-friendly) and gives us:
  //   1. Immediate show data for artists who appear on BIT
  //   2. A "dormant" signal for artists with 0 BIT events, which we can
  //      combine with TM's upcomingEvents._total to skip TM entirely
  // Skip in force-refresh mode since the user explicitly wants fresh TM data.
  // ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
  let bitResults = new Map(); // artist ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ shows[]
  if (!forceRefresh && !scanAborted) {
    setProgress('Phase 0: BIT pre-flightÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', 2);
    bitResults = await bitPreFlightScan(ARTISTS);
    // Add BIT shows immediately so the UI can show partial results quickly
    for (const [artist, shows] of bitResults) {
      if (shows.length) {
        concerts.push(...shows.filter(s => s.date >= today));
        C.bit++;
      }
    }
    if (!scanAborted) { buildCalChips(); renderCalendar(); renderMap(); }
  }

  // ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
  // PHASE 0.5: INVERTED GEO SWEEP
  // For geographically focused users (ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤5 non-large-market countries),
  // sweep ALL music events in those countries rather than querying per-artist.
  // This turns N_artists requests into N_pages requests ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â typically 10ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“20ÃƒÆ’Ã¢â‚¬â€ fewer.
  // Artists found in the sweep are marked as covered; their per-artist TM
  // queries are skipped. Artists NOT found in the sweep still need TM queries
  // (the artist might have events that TM didn't return in the geo sweep, e.g.
  // multi-country artists whose MX date isn't the right start window).
  // ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
  const geoSweepCovered = new Set(); // artists whose shows came from geo sweep
  if (!scanAborted && shouldUseGeoSweep()) {
    setProgress(`Phase 0.5: Geo sweep (${[...includeCountries].join(',')})ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, 18);
    try {
      const geoShows = await geoSweepScan(today);
      for (const [artist, shows] of geoShows) {
        const upcoming = shows.filter(s => s.date >= today);
        if (upcoming.length) {
          // Replace any BIT shows for this artist with the richer TM geo shows
          concerts = concerts.filter(s => !(s.artist === artist && s._src === 'bit'));
          concerts.push(...upcoming);
          C.geoSweep++;
        }
        geoSweepCovered.add(artist); // mark as covered regardless of result count
      }
      if (!scanAborted) { buildCalChips(); renderCalendar(); renderMap(); }
    } catch(e) {
      dblog('warn', `Geo sweep failed: ${e.message} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â falling back to per-artist TM scan`);
    }
  }

  // ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
  // PHASE 1: PER-ARTIST TM SCAN (only for artists not already covered)
  // ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

  // Determine which artists still need a TM query.
  // An artist can be skipped if:
  //   (a) Geo sweep already confirmed their shows in the target region, OR
  //   (b) BIT says 0 events AND their TM attraction cache says 0 upcoming
  //       (two independent sources agreeing they're not touring = high confidence)
  // Artists with uncertain status (BIT blocked, new artists not in cache) still
  // go through TM to ensure nothing is missed.
  function shouldSkipTM(artist) {
    if (geoSweepCovered.has(artist)) return true; // geo sweep covered this one

    // If BIT confirms they're not touring AND we have a TM totalUpcoming hint,
    // we can skip. We'll check totalUpcoming inside processArtist via the
    // attraction info cache, so here we just check BIT as a pre-filter.
    // We don't skip solely on BIT (some artists aren't on BIT but are on TM).
    return false;
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Per-artist task ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  async function processArtist(artist) {
    // Phase 1a: skip artists already handled by geo sweep
    if (shouldSkipTM(artist)) {
      C.skipped++; C.done++;
      if (C.done % 5 === 0) updateProgress(C, total);
      return;
    }

    if (scanAborted) return;
    await waitIfCircuit();
    if (scanAborted) return;

    const idbKey = artist.toLowerCase().trim();

    // Smart scan: cache hit ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ no network at all
    if (!forceRefresh) {
      try {
        const cached = await DB.get('artists', idbKey);
        if (cached && (now - cached.ts) < TTL_ARTIST && cached.cHash === cHash) {
          concerts.push(...cached.shows.filter(s => s.date >= today));
          C.cached++; C.done++;
          if (C.done % 5 === 0) updateProgress(C, total);
          return;
        }
      } catch(e) {}
    }

    // Force rescan: load old cached shows for incremental diff (only new shows fetched)
    let existingShows = null;
    if (forceRefresh) {
      try {
        const old = await DB.get('artists', idbKey);
        if (old?.shows?.length) existingShows = old.shows;
      } catch(e) {}
    }

    updateProgress(C, total);

    const MAX_TRIES = 3;
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      if (scanAborted) return;
      await waitIfCircuit();
      if (scanAborted) return;
      await rateLimitedWait();  // global 4 req/s throttle
      if (scanAborted) return;  // quota abort may have fired during the wait
      try {
        const shows = await fetchConcerts(artist, today, existingShows);
        const finalShows = shows.length ? shows : await fetchBIT(artist, today);
        const upcomingFresh = finalShows.filter(s => s.date >= today);

        if (window._mergeMode) {
          // MERGE MODE: push fresh shows first, then re-add any baseline shows for
          // this artist whose dedup key is NOT covered by the fresh result set.
          // This means: if TM now shows 5 concerts and we had 3, we end up with
          // at least 5 (the 2 new ones are added). If TM shows 3 and we had 5,
          // we still end up with 5 (the 2 that disappeared from TM are kept).
          concerts.push(...upcomingFresh);
          const freshKeys = new Set(upcomingFresh.map(_concertKey));
          const artistBaseline = window._mergeBaseByArtist[(artist||'').toLowerCase()] || [];
          for (const old of artistBaseline) {
            if (old.date >= today && !freshKeys.has(_concertKey(old))) {
              concerts.push(old); // was in DB but not in fresh TM result ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ keep it
            }
          }
          // Update the baseline key set so subsequent artists don't re-add these
          for (const s of upcomingFresh) window._mergeBaseKeys.add(_concertKey(s));
        } else {
          concerts.push(...upcomingFresh);
        }
        DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
        C.fresh++; C.done++;
        consecErrors = Math.max(0, consecErrors - 1);
        // Recover baseSleep after success
        baseSleep = Math.max(130, baseSleep * 0.96);
        if (fetchErrors[artist]) { delete fetchErrors[artist]; updateErrorTab(); }
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Progressive render: update calendar+map every time new shows found ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        // This makes results appear as they stream in rather than all at once.
        // We throttle to once per 3 fresh artists (or whenever new shows land)
        // to avoid layout thrash while still feeling live.
        if (finalShows.length > 0 || C.fresh % 3 === 0) {
          buildCalChips(); renderCalendar(); renderMap();
        }
        return;
      } catch(e) {
        const is429  = e.message === '429';
        const isNet  = e.isNet || e.message?.startsWith('net:');
        const isTimeout = e.message === 'timeout';

        // If the hard-quota flag was set during this attempt, stop retrying this
        // artist immediately ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â every further attempt is guaranteed to fail the same way.
        if (window._hardQuotaHit || scanAborted) {
          C.error++; C.done++;
          updateErrorTab();
          return;
        }

        if (attempt < MAX_TRIES) {
          const wait = isNet    ? Math.min(baseSleep * 4 * attempt, 8000)
                     : is429   ? Math.min(3000 * Math.pow(2, attempt - 1), 20000)
                     : baseSleep * attempt;
          const reason = isNet ? 'network error' : is429 ? '429 rate limit' : e.message;
          dblog('warn', `"${artist}": ${reason} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â attempt ${attempt}/${MAX_TRIES}, retry in ${Math.round(wait)}ms`);
          if (is429) window._onTm429?.();
          if (isNet) baseSleep = Math.min(baseSleep * 1.6, 900);
          await sleep(wait);
          if (scanAborted) return; // quota abort may have fired during the sleep
        } else {
          // Final attempt failed
          const lastErr = is429 ? '429' : isNet ? 'net' : isTimeout ? 'timeout' : e.message;
          dblog('error', `"${artist}": FAILED after ${MAX_TRIES} tries ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${lastErr}`);
          fetchErrors[artist] = { attempts: (fetchErrors[artist]?.attempts || 0) + MAX_TRIES, lastErr, resolved: false, pass: 'Pass1' };
          C.error++; C.done++; consecErrors++;

          // Hard backoff on consecutive errors
          if (consecErrors >= 6) {
            const pause = Math.min(consecErrors * 2000, 20000);
            dblog('warn', `${consecErrors} consecutive errors ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â pausing ${pause/1000}s before next artist`);
            baseSleep = Math.min(baseSleep * 2, 900);
            await sleep(pause);
            consecErrors = 0;
          }
          updateErrorTab();
        }
      }
    }
  }

  // Smart scan: clear stale entries now that we're about to accumulate fresh ones.
  // This runs only once, right before the per-artist TM pass begins ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â by this point
  // BIT pre-flight and geo sweep have already populated concerts[] with fresh data,
  // so the user always sees something rather than a blank state.
  //
  // MERGE MODE EXCEPTION: in merge mode we deliberately keep the stale entries.
  // They are the preserved baseline the user asked to retain. Fresh results will
  // be merged IN (added on top) by injection point B below. The full dedup at
  // finalizeScan will clean up any true duplicates.
  if (!forceRefresh && !window._mergeMode && _staleCount > 0) {
    // Remove the old stale entries (they were at the front of the array).
    // Fresh results from BIT/geo sweep are already appended after them.
    concerts.splice(0, _staleCount);
    festivals.splice(0, _staleFestCount);
    buildCalChips(); renderCalendar(); renderMap();
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PASS 1: concurrent batch dispatch ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // CONCURRENCY=1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TM limit is 100 req/min, no benefit to parallelism
  const CONCURRENCY = 1;
  const t0 = Date.now();

  await new Promise(resolve => {
    let idx = 0;
    let running = 0;

    function dispatch() {
      while (running < CONCURRENCY && idx < total && !scanAborted) {
        const artist = ARTISTS[idx++];
        running++;
        processArtist(artist).then(() => {
          running--;
          if (idx < total && !scanAborted) dispatch();
          else if (running === 0) resolve();
        });
      }
      if ((running === 0 && idx >= total) || scanAborted) resolve();
    }

    dispatch();
  });

  const t1 = Date.now();
  dblog('info', `Pass 1: ${((t1-t0)/1000).toFixed(1)}s ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ÃƒÂ¢Ã¢â‚¬Â Ã‚Â©${C.cached} cache Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Â Ã‚Â»${C.fresh} fresh Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã…â€œÃ¢â‚¬â€${C.error} failed Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã‚ÂÃ‚Â­${C.skipped} geo-skipped Ãƒâ€šÃ‚Â· TM reqs: ${window._tmReqCount || 0}`);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PASS 2: quick retry of failed artists (no cooldown) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const failedArtists = Object.keys(fetchErrors).filter(a => !fetchErrors[a]?.resolved);
  if (failedArtists.length && !scanAborted) {
    // Skip retry entirely if too many failures ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â likely a key ban, not worth waiting
    if (failedArtists.length > 20) {
      dblog('warn', `Pass 2 skipped ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${failedArtists.length} failures is too many (likely key ban), not retrying`);
    } else {
      dblog('info', `Pass 2: quick retry of ${failedArtists.length} failed artist${failedArtists.length !== 1 ? 's' : ''}`);
      setProgress(`ÃƒÂ¢Ã¢â‚¬Â Ã‚Âº Quick retry: ${failedArtists.length} artistsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, 84);

      for (let fi = 0; fi < failedArtists.length; fi++) {
        if (scanAborted) break;
        await rateLimitedWait();
        const artist = failedArtists[fi];
        const idbKey = artist.toLowerCase().trim();
        setProgress(`ÃƒÂ¢Ã¢â‚¬Â Ã‚Âº Retry [${fi+1}/${failedArtists.length}]: ${artist}`, 84 + (fi / failedArtists.length) * 10);
        try {
          const shows = await fetchConcerts(artist, today, null);
          const finalShows = shows.length ? shows : await fetchBIT(artist, today);
          const upcomingFresh = finalShows.filter(s => s.date >= today);
          if (window._mergeMode) {
            concerts.push(...upcomingFresh);
            const freshKeys = new Set(upcomingFresh.map(_concertKey));
            const artistBaseline = window._mergeBaseByArtist[(artist||'').toLowerCase()] || [];
            for (const old of artistBaseline) {
              if (old.date >= today && !freshKeys.has(_concertKey(old))) concerts.push(old);
            }
          } else {
            concerts.push(...upcomingFresh);
          }
          DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
          C.fresh++;
          delete fetchErrors[artist];
        } catch(e) {
          // Failed again ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â just leave it in the error tab, don't retry further
          if (fetchErrors[artist]) { fetchErrors[artist].attempts++; fetchErrors[artist].lastErr = e.message; fetchErrors[artist].pass = 'Pass2'; }
          dblog('warn', `Pass2: "${artist}" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${e.message}`);
        }
        updateErrorTab();
      }

      const stillFailed = Object.keys(fetchErrors).filter(a => !fetchErrors[a]?.resolved);
      const recovered = failedArtists.length - stillFailed.length;
      dblog('info', `Pass 2 done: ${recovered} recovered Ãƒâ€šÃ‚Â· ${stillFailed.length} persistent`);
    }
  }

  dblog('info', `All done in ${((Date.now()-t0)/1000).toFixed(1)}s: ÃƒÂ¢Ã¢â‚¬Â Ã‚Â©${C.cached} Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Â Ã‚Â»${C.fresh} Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã…â€œÃ¢â‚¬â€${Object.keys(fetchErrors).length} errors Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã‚ÂÃ‚Â­${C.skipped} skipped Ãƒâ€šÃ‚Â· ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ${C.bit} BIT Ãƒâ€šÃ‚Â· ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã‚Âº${C.geoSweep} geo-sweep`);
  window._rateLimitedWait = null;  // cleanup
  updateErrorTab();

  if (!scanAborted) {
    setProgress(`Checking festivalsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, 88);
    let festFromCache = false;
    if (!forceRefresh) {
      try {
        const fc = await DB.get('meta', 'festivals');
        if (fc && (now - fc.ts) < TTL_FEST && fc.cHash === cHash && fc.ver === FEST_VER) {
          festivals = deduplicateFestivals(fc.data);
          festFromCache = true;
          dblog('info', `Festivals: from cache (${festivals.length}), age ${Math.round((now-fc.ts)/3600e3)}h`);
        } else if (fc && fc.ver !== FEST_VER) {
          dblog('info', `Festivals: cache v mismatch (v${fc.ver||0}ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢v${FEST_VER}), re-fetching`);
        }
      } catch(e) {}
    }
    if (!festFromCache) {
      setProgress(`Fetching festivalsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, 90);
      try {
        await fetchFestivalsData();
        DB.put('meta', 'festivals', { ts: now, cHash, data: festivals, ver: FEST_VER }).catch(() => {});
      } catch(e) { dblog('error', `Festival fetch: ${e.message}`); }
    }
  }

  concerts = deduplicateConcerts(concerts);
  dblog('info', `Done: ${concerts.length} concerts, ${festivals.length} festivals`);
  finalizeScan(scanAborted, C.cached, C.fresh);
}

function updateProgress(C, total) {
  const errNote  = C.error    ? ` Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã…â€œÃ¢â‚¬â€${C.error}`    : '';
  const skipNote = C.skipped  ? ` Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã‚ÂÃ‚Â­${C.skipped} skipped` : '';
  const bitNote  = C.bit      ? ` Ãƒâ€šÃ‚Â· ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ${C.bit} BIT`  : '';
  const geoNote  = C.geoSweep ? ` Ãƒâ€šÃ‚Â· ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã‚Âº${C.geoSweep} geo` : '';

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Self-correcting ETA using a 60-second rolling window ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // Every call to updateProgress records a completion event in a ring buffer.
  // ETA = pending / (completions_in_last_60s / 60s)
  // This adapts automatically to cache hits (fast), rate-limit cooldowns (slow),
  // BIT skips (fast), and proxy overhead (slow).
  const now = Date.now();
  if (!updateProgress._times) updateProgress._times = [];
  updateProgress._times.push(now);
  // Trim events older than 60 seconds
  const cutoff = now - 60000;
  while (updateProgress._times.length && updateProgress._times[0] < cutoff)
    updateProgress._times.shift();

  let etaNote = '';
  const tmPending = total - C.done;
  if (tmPending > 5) {
    const windowEvents = updateProgress._times.length;
    if (windowEvents >= 3) {
      // Actual rate: events completed in the observation window
      const windowMs = now - updateProgress._times[0];
      const ratePerMs = windowEvents / Math.max(windowMs, 1000); // artists/ms
      const etaSec = Math.ceil(tmPending / (ratePerMs * 1000));
      if (etaSec < 3600) {
        // Format as Xm Ys when over 90s, otherwise just Xs
        etaNote = etaSec >= 90
          ? ` Ãƒâ€šÃ‚Â· ~${Math.floor(etaSec/60)}m ${etaSec%60}s left`
          : ` Ãƒâ€šÃ‚Â· ~${etaSec}s left`;
      }
    } else {
      // Not enough data yet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fall back to a conservative static estimate
      // (0.9s/artist is more honest than 0.75 before we have real numbers)
      const etaSec = Math.ceil(tmPending * 0.9);
      etaNote = etaSec < 3600
        ? ` Ãƒâ€šÃ‚Â· ~${Math.floor(etaSec/60)}m left`
        : '';
    }
  }
  setProgress(`[${C.done}/${total}] ÃƒÂ¢Ã¢â‚¬Â Ã‚Â©${C.cached} cached Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Â Ã‚Â»${C.fresh} fresh${errNote}${skipNote}${bitNote}${geoNote}${etaNote}`, (C.done / total) * 80);
}
function finalizeScan(aborted, nCached = 0, nFresh = 0) {
  window._scanActive = false;  // allow showOnboard() again once scan is truly done

  // Merge mode cleanup: run a full dedup over the combined baseline+fresh array,
  // then clear the merge-mode flags so normal scans behave normally again.
  const wasMerge = !!window._mergeMode;
  if (wasMerge) {
    const before = concerts.length;
    concerts = deduplicateConcerts(concerts);
    const removed = before - concerts.length;
    dblog('info', `MERGE RESCAN complete ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${before} total shows after merge, ${removed} duplicates removed, ${concerts.length} final`);
    window._mergeMode = false;
    window._mergeBaseKeys = null;
    window._mergeBaseByArtist = null;
  }
  cacheTimestamp = Date.now();
  persistData();
  setProgress('', 100);
  const errCount = Object.keys(fetchErrors).length;
  const errNote = errCount ? ` Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã…â€œÃ¢â‚¬â€${errCount} errors` : '';
  const cacheNote = nCached > 0 ? ` Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Â Ã‚Â©${nCached} cached Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Â Ã‚Â»${nFresh} fresh` : '';
  setStatus(
    (aborted ? 'ÃƒÂ¢Ã…Â¡Ã‚Â  Partial ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ' : '') +
    `${new Date(cacheTimestamp).toLocaleTimeString()} Ãƒâ€šÃ‚Â· ${concerts.length} shows Ãƒâ€šÃ‚Â· ${festivals.length} festivals${cacheNote}${errNote}`,
    !aborted
  );
  setTimeout(() => {
    document.getElementById('loadbar').style.display = 'none';
    document.getElementById('hd-progress').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'none';
    /* refresh-btn removed */
  }, 1200);
  updateErrorTab();
  buildCalChips(); renderCalendar(); renderMap();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ ERROR TAB ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function updateErrorTab() {
  const errors = Object.entries(fetchErrors).filter(([, v]) => !v.resolved);
  const tabBtn = document.getElementById('tab-errors');
  const errList = document.getElementById('err-list');
  const subEl = document.getElementById('err-pane-sub');

  if (!tabBtn) return;

  if (!errors.length) {
    tabBtn.style.display = 'none';
    if (errList) errList.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">No errors ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â°</div>';
    return;
  }

  // Show tab with count badge
  tabBtn.style.display = '';
  tabBtn.textContent = `ÃƒÂ¢Ã…Â¡Ã‚Â¡ Errors Ãƒâ€šÃ‚Â· ${errors.length}`;

  if (subEl) subEl.textContent = `${errors.length} artist${errors.length > 1 ? 's' : ''} failed after all retries`;

  if (!errList) return;
  const frag = document.createDocumentFragment();
  errors.forEach(([artist, info]) => {
    const row = document.createElement('div');
    row.className = 'err-row';
    row.id = `err-row-${CSS.escape(artist)}`;

    const errLabel = info.lastErr === '429'
      ? '429 rate limited'
      : info.lastErr === 'timeout'
        ? 'ÃƒÂ¢Ã‚ÂÃ‚Â± timeout'
        : `HTTP ${info.lastErr}`;

    row.innerHTML = `
      <div class="err-artist">
        <div class="err-artist-name">${artist}</div>
        <div class="err-reason">${errLabel} Ãƒâ€šÃ‚Â· ${info.attempts} attempts Ãƒâ€šÃ‚Â· ${info.pass || ''}</div>
      </div>
      <span class="err-count">${info.attempts}ÃƒÆ’Ã¢â‚¬â€</span>
      <button class="err-retry-btn" onclick="retrySingleArtist('${artist.replace(/'/g, "\\'")}')">ÃƒÂ¢Ã¢â‚¬Â Ã‚Âº Retry</button>`;
    frag.appendChild(row);
  });
  errList.innerHTML = '';
  errList.appendChild(frag);
}

async function retrySingleArtist(artist) {
  if (!API_KEY) return;
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();
  const cHash = countryHash();
  const idbKey = artist.toLowerCase().trim();

  // Update UI
  const row = document.getElementById(`err-row-${CSS.escape(artist)}`);
  if (row) {
    row.style.opacity = '.4';
    const btn = row.querySelector('.err-retry-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦'; }
  }
  setStatus(`Retrying ${artist}ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, false);

  try {
    const shows = await fetchConcerts(artist, today);
    let finalShows = shows;
    if (!shows.length) finalShows = await fetchBIT(artist, today);
    const upcoming = finalShows.filter(s => s.date >= today);
    concerts.push(...upcoming);
    concerts = deduplicateConcerts(concerts);
    DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
    delete fetchErrors[artist];
    dblog('ok', `Manual retry: "${artist}" succeeded ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${upcoming.length} shows`);
    setStatus(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ ${artist}: ${upcoming.length} shows`, true);
    persistData();
    buildCalChips(); renderCalendar(); renderMap();
  } catch(e) {
    if (fetchErrors[artist]) {
      fetchErrors[artist].attempts++;
      fetchErrors[artist].lastErr = e.message;
    }
    dblog('error', `Manual retry: "${artist}" still failing ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${e.message}`);
    setStatus(`ÃƒÂ¢Ã…Â¡Ã‚Â  ${artist}: ${e.message}`, false);
    if (row) row.style.opacity = '1';
  }
  updateErrorTab();
}

async function retryAllErrors() {
  const toRetry = Object.keys(fetchErrors).filter(a => !fetchErrors[a].resolved);
  for (const artist of toRetry) {
    await retrySingleArtist(artist);
    await sleep(500);
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ QUOTA MODAL ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function refreshKeyPoolUI() {
  const container = document.getElementById('key-pool-list');
  if (!container) return;
  container.innerHTML = '';
  if (SERVER_MANAGED_TICKETMASTER) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;border:1px solid var(--accent);background:rgba(200,255,95,.08);margin-bottom:6px;font-family:"DM Mono",monospace;font-size:.68rem;';
    row.innerHTML = '<div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:var(--accent);"></div>' +
      '<span style="flex:1;color:var(--text)">Server-managed Ticketmaster pool</span>' +
      '<span style="font-size:.52rem;padding:2px 7px;border-radius:100px;border:1px solid var(--accent);color:var(--accent);background:rgba(200,255,95,.08)">SERVER</span>';
    container.appendChild(row);

    const note = document.createElement('div');
    note.style.cssText = 'font-size:.58rem;color:var(--muted2);line-height:1.45;';
    note.textContent = 'Shared deployments keep Ticketmaster keys on the backend. End users scan without seeing or storing those keys in the browser.';
    container.appendChild(note);
    return;
  }
  TM_KEYS.forEach((k, i) => {
    const isActive = i === _activeKeyIdx;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--s2);margin-bottom:4px;font-family:"DM Mono",monospace;font-size:.68rem;';
    if (isActive) row.style.borderColor = 'var(--accent)';

    const dot = document.createElement('div');
    dot.style.cssText = 'width:7px;height:7px;border-radius:50%;flex-shrink:0;background:' +
      (k.exhausted ? '#ff4444' : isActive ? 'var(--accent)' : '#555') + ';';

    const label = document.createElement('span');
    label.style.cssText = 'flex:1;color:' + (isActive ? 'var(--accent)' : k.exhausted ? '#888' : 'var(--text)') + ';';
    label.textContent = (k.label || ('Key ' + (i+1))) + ' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ..' + k.key.slice(-8);

    const badge = document.createElement('span');
    const badgeStyle = isActive
      ? 'color:var(--accent);border-color:var(--accent);background:rgba(200,255,95,.08)'
      : k.exhausted
        ? 'color:#ff6b6b;border-color:#ff4444;background:rgba(255,68,68,.08)'
        : 'color:#888;border-color:#444;background:transparent';
    badge.style.cssText = 'font-size:.52rem;padding:2px 7px;border-radius:100px;border:1px solid;' + badgeStyle;
    badge.textContent = isActive ? 'ACTIVE' : k.exhausted ? 'EXHAUSTED' : 'READY';

    const del = document.createElement('button');
    del.style.cssText = 'background:none;border:none;color:#555;cursor:pointer;font-size:.8rem;padding:0 2px;line-height:1;';
    del.textContent = 'x';
    del.title = 'Remove this key';
    del.onclick = () => {
      if (TM_KEYS.length <= 1) { softNotice('Keep at least one API key in the pool.'); return; }
      TM_KEYS.splice(i, 1);
      if (_activeKeyIdx >= TM_KEYS.length) _activeKeyIdx = 0;
      API_KEY = TM_KEYS[_activeKeyIdx].key;
      localStorage.setItem('tt_key', API_KEY);
      persistSettings();
      refreshKeyPoolUI();
    };

    row.appendChild(dot); row.appendChild(label); row.appendChild(badge); row.appendChild(del);
    container.appendChild(row);
  });

  const addRow = document.createElement('div');
  addRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
  addRow.innerHTML = '<input id="new-pool-key" type="password" placeholder="Paste new Consumer Key..."' +
    ' style="flex:1;font-family:\'DM Mono\',monospace;font-size:.72rem;background:var(--s2);' +
    'border:1.5px solid var(--border2);border-radius:6px;padding:7px 10px;color:var(--text);outline:none;"' +
    ' autocomplete="off" spellcheck="false">' +
    '<button onclick="addKeyToPool()" style="font-family:\'DM Mono\',monospace;font-size:.7rem;font-weight:700;' +
    'padding:7px 14px;border-radius:6px;border:none;background:var(--accent);color:var(--bg);cursor:pointer;">+ Add</button>';
  container.appendChild(addRow);
}

function addKeyToPool() {
  const input = document.getElementById('new-pool-key');
  const key = input ? input.value.trim() : '';
  if (!key) return;
  if (TM_KEYS.some(k => k.key === key)) { softNotice('This Ticketmaster key is already in the pool.', 'warn', { focusId: 'new-pool-key' }); return; }
  TM_KEYS.push({ key, label: 'Key ' + (TM_KEYS.length + 1), exhausted: false });
  input.value = '';
  persistSettings();
  refreshKeyPoolUI();
  dblog('info', 'Key pool: added key ..' + key.slice(-6) + ' (pool now has ' + TM_KEYS.length + ' keys)');
}

function showQuotaModal(resetStr, totalFound) {
  const el = document.getElementById('quota-reset-str');
  const cnt = document.getElementById('quota-found-count');
  const title = document.getElementById('quota-title');
  const subtitle = document.getElementById('quota-subtitle');
  const newKeyBlock = document.getElementById('quota-new-key-block');
  const getLink = document.getElementById('quota-get-link');
  if (title) title.textContent = SERVER_MANAGED_TICKETMASTER ? 'Ticketmaster Server Quota Exhausted' : 'API Key Quota Exhausted';
  if (subtitle) {
    subtitle.innerHTML = SERVER_MANAGED_TICKETMASTER
      ? 'The shared Ticketmaster key pool for this deployment is exhausted. Browsing still works, but new scans need to wait until <strong>midnight UTC</strong> or until the server gets more quota.'
      : 'Ticketmaster is rejecting every request instantly (&lt;15ms), which means the daily hard quota for this API key has been reached. Waiting and retrying will not help - the counter resets at <strong>midnight UTC</strong>.';
  }
  if (newKeyBlock) newKeyBlock.style.display = SERVER_MANAGED_TICKETMASTER ? 'none' : '';
  if (getLink) getLink.style.display = SERVER_MANAGED_TICKETMASTER ? 'none' : '';
  if (el) el.textContent = resetStr || 'at midnight UTC';
  if (cnt) cnt.textContent = totalFound || (concerts.length + festivals.length);
  document.getElementById('quota-bg').classList.add('open');
}

function closeQuotaModal() {
  document.getElementById('quota-bg').classList.remove('open');
  buildCalChips(); renderCalendar(); renderMap();
}

function quotaApplyNewKey() {
  if (SERVER_MANAGED_TICKETMASTER) {
    softNotice('Ticketmaster keys are managed by the server for this deployment.');
    return;
  }
  const input = document.getElementById('quota-key-input');
  const key = input ? input.value.trim() : '';
  if (!key) return;

  const existing = TM_KEYS.findIndex(k => k.key === key);
  if (existing >= 0) {
    TM_KEYS[existing].exhausted = false;
    _activeKeyIdx = existing;
  } else {
    TM_KEYS.push({ key, label: 'Key ' + (TM_KEYS.length + 1), exhausted: false });
    _activeKeyIdx = TM_KEYS.length - 1;
  }
  API_KEY = key;
  localStorage.setItem('tt_key', key);
  const apiInput = document.getElementById('api-input');
  if (apiInput) apiInput.value = key;
  window._hardQuotaHit = false;
  window._tmReqCount = 0;
  persistSettings();
  refreshKeyPoolUI();
  closeQuotaModal();
  dblog('info', 'Key pool: activated ..' + key.slice(-6) + ' (pool now has ' + TM_KEYS.length + ' keys) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â restarting scan');
  saveAndFetch(false);
}

function setProgress(msg, pct) {
  document.getElementById('loadbar-fill').style.width = pct + '%';
  document.getElementById('hd-progress').textContent = msg;
  if (!scanAborted && msg) document.getElementById('hd-msg').textContent = msg;
}

function setStatus(msg, live) {
  document.getElementById('hd-msg').textContent = msg;
  document.getElementById('pulse').className = 'pulse' + (live ? ' live' : '');
}

function softNotice(msg, tone = 'warn', opts = {}) {
  const text = String(msg || '').trim();
  if (!text) return;

  const color = tone === 'error'
    ? '#ff7070'
    : tone === 'ok'
      ? 'var(--accent)'
      : '';

  setStatus(text, tone === 'ok');

  const hero = document.getElementById('hero-status-text');
  if (hero) {
    hero.textContent = (tone === 'error' ? 'Warning: ' : '') + text;
    hero.style.color = color;
  }

  const onboard = document.getElementById('onboard');
  if (onboard && !onboard.classList.contains('hidden')) {
    onboardSetStatus((tone === 'error' ? 'Warning: ' : '') + text, color);
  }

  if (typeof dblog === 'function') {
    dblog(
      tone === 'error' ? 'error' : tone === 'ok' ? 'ok' : 'warn',
      text,
    );
  }

  if (opts.focusId) {
    document.getElementById(opts.focusId)?.focus();
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ DISAMBIGUATION GUARD ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Short/ambiguous artist names (ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤3 chars or single common word) must only
// match via TM attractions (confirmed performer slot), never via event name.
// This prevents "Yes" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ "Yes, concert", "Air" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ "Air Guitar Night" etc.
const AMBIG_OVERRIDE = new Set(['yes','air','mos','run','now','war','rem']);
function artistIsAmbiguous(name) {
  const n = (name || '').trim().toLowerCase();
  if (n.length <= 2) return true;
  if (!n.includes(' ') && n.length <= 3) return true;
  if (AMBIG_OVERRIDE.has(n)) return true;
  return false;
}

// Cache TTL for attractionIds ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â they almost never change
const TTL_ATTRACTION    = 30 * 24 * 3600e3; // 30 days ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â IDs never change, cache aggressively
const TTL_UPCOMING      = 24 * 3600e3;       // 24h ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â re-check event count daily
const TTL_UPCOMING_ZERO = 48 * 3600e3;       // 48h ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â if 0 today, unlikely to tour overnight

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ In-memory L1 cache for attraction info ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// IDB writes are async and fire-and-forget. Without this, a retry that fires
// within ~50ms of the original request will miss the IDB cache and make a
// second network call for the same artist. L1 is synchronous ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â zero latency.
const _attractionL1 = new Map(); // key ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ { id, totalUpcoming, ts }

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ resolveAttractionInfo ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Returns { id, totalUpcoming } for an artist.
//
// TWO-LEVEL CACHE STRATEGY:
//   L1 (in-memory Map): synchronous, lives for the duration of the browser session.
//      Prevents duplicate TM requests when the retry loop calls this function
//      multiple times for the same artist before the IDB write has committed.
//   L2 (IndexedDB): persists across sessions. Separate TTLs for the ID (30 days ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â
//      attraction IDs are permanent identifiers that never change) vs the upcoming
//      count (24h for active artists, 48h for confirmed-dormant artists with 0 events).
//
// WHY SEPARATE TTLs: Before this change, a single 7-day TTL bundled the ID and
// event count together. When the entry expired, you re-fetched the ID even though
// it hadn't changed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â wasting a TM request on data you already knew. Now:
//   - ID re-fetch: only if > 30 days old (almost never happens in practice)
//   - Count re-fetch: every 24-48h, because tour announcements happen daily
async function resolveAttractionInfo(artist) {
  const key = artist.toLowerCase().trim();

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ L1 check (in-memory) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const l1 = _attractionL1.get(key);
  if (l1) return { id: l1.id, totalUpcoming: l1.totalUpcoming };

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ L2 check (IDB) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const now = Date.now();
  try {
    const cached = await DB.get('attractions', key);
    if (cached) {
      const idFresh      = (now - cached.ts) < TTL_ATTRACTION;
      const countTTL     = (cached.totalUpcoming === 0) ? TTL_UPCOMING_ZERO : TTL_UPCOMING;
      const countFresh   = cached.tsCounted && (now - cached.tsCounted) < countTTL;

      if (idFresh && countFresh) {
        // Both ID and count are fresh ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â return from cache, no network call
        const result = { id: cached.id, totalUpcoming: cached.totalUpcoming ?? null };
        _attractionL1.set(key, result);
        return result;
      }

      if (idFresh && !countFresh) {
        // ID is still good, only need to re-check the event count.
        // We can do this with a targeted request using the known attractionId,
        // which is faster and cheaper than a keyword search.
        if (cached.id) {
          try {
            await (window._rateLimitedWait?.());
            const countUrl = `https://app.ticketmaster.com/discovery/v2/attractions/${cached.id}.json?apikey=${API_KEY}`;
            const cr = await apiFetch(countUrl, 5000);
            if (cr.ok) {
              const cd = await cr.json();
              const ue = cd.upcomingEvents;
              const totalUpcoming = ue ? (ue._total ?? null) : 0;
              const updated = { ...cached, totalUpcoming, tsCounted: now };
              DB.put('attractions', key, updated).catch(() => {});
              const result = { id: cached.id, totalUpcoming };
              _attractionL1.set(key, result);
              dblog('ok', `${artist}: count refresh ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${totalUpcoming ?? '?'} upcoming (id cached)`);
              return result;
            }
          } catch(e) {
            // Count refresh failed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fall through to return stale count rather than erroring
            dblog('warn', `${artist}: count refresh failed (${e.message}) ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â using stale count`);
          }
          // Return stale data rather than making a full re-fetch on network error
          const stale = { id: cached.id, totalUpcoming: cached.totalUpcoming ?? null };
          _attractionL1.set(key, stale);
          return stale;
        }
      }
    }
  } catch(e) {}

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Full network fetch (cache miss or ID expired) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const ambig = artistIsAmbiguous(artist);
  let id = null, totalUpcoming = null;

  // Normalize diacritics for comparison and fallback search
  // e.g. "SÃƒÆ’Ã‚Â­loÃƒÆ’Ã‚Â©" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ "Siloe", "Arda BogotÃƒÆ’Ã‚Â¡" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ "Arda Bogota"
  const _stripDia = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const artistNorm = _stripDia(artist);
  const artistAscii = artist.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, '');

  const _findBest = (items) => {
    const al = artist.toLowerCase();
    // 1. Exact original name match
    const exact = items.find(a => (a.name||'').toLowerCase() === al);
    if (exact) return exact;
    // 2. Diacritic-normalized match (SÃƒÆ’Ã‚Â­loÃƒÆ’Ã‚Â© == Siloe, BogotÃƒÆ’Ã‚Â¡ == Bogota)
    const normMatch = items.find(a => _stripDia(a.name) === artistNorm);
    if (normMatch) return normMatch;
    // 3. Fallback: first result for unambiguous artists
    return (!ambig && items[0]) || null;
  };

  try {
    await (window._rateLimitedWait?.());
    const aUrl = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artist)}&classificationName=music&size=5`;
    const aRes = await apiFetch(aUrl, 6000);
    if (aRes.ok) {
      const aData = await aRes.json();
      const items = aData?._embedded?.attractions || [];
      let best = _findBest(items);

      // If no match with original name AND artist has diacritics, retry with ASCII version
      if (!best && artistAscii !== artist && artistAscii.trim()) {
        await (window._rateLimitedWait?.());
        const aUrl2 = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artistAscii)}&classificationName=music&size=5`;
        const aRes2 = await apiFetch(aUrl2, 6000);
        if (aRes2.ok) {
          const aData2 = await aRes2.json();
          const items2 = aData2?._embedded?.attractions || [];
          best = _findBest(items2);
          if (best) dblog('info', `${artist}: found via ASCII fallback "${artistAscii}" ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${best.name}`);
        }
      }

      if (best) {
        id = best.id;
        const ue = best.upcomingEvents;
        totalUpcoming = ue ? (ue._total ?? null) : null;
      } else {
        totalUpcoming = 0; // Not found on TM ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no events possible
      }
    } else if (aRes.status === 429) {
      // Rate-limited on the attraction lookup itself ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â propagate as a thrown error
      // so processArtist's retry logic handles it, rather than silently returning null
      throw new Error('429');
    }
  } catch(e) {
    if (e.message === '429') throw e; // let caller handle 429
    dblog('warn', `${artist}: attraction lookup failed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${e.message}`);
  }

  const record = { id, ts: now, tsCounted: now, name: artist, totalUpcoming };
  DB.put('attractions', key, record).catch(() => {});
  const result = { id, totalUpcoming };
  _attractionL1.set(key, result); // populate L1 so retries within same session are free
  return result;
}

// Backward-compatible shim ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â callers that only need the ID (retrySingleArtist, etc.)
async function resolveAttractionId(artist) {
  const info = await resolveAttractionInfo(artist);
  return info.id;
}

// Returns an array of concert objects.
// - If existingShows provided (incremental mode): fetches page 0 only, diffs by event ID,
//   returns merged set (existing + any new events found).
// - Otherwise: full paginated fetch.
async function fetchConcerts(artist, today, existingShows = null) {
  today = today || new Date().toISOString().split('T')[0];
  const ambig = artistIsAmbiguous(artist);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Step 1: attraction info (id + upcoming count from TM) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // resolveAttractionInfo costs exactly 1 TM request on first run; subsequent
  // calls are free (7-day IDB cache). The returned totalUpcoming lets us bail out
  // before ever hitting the events endpoint for artists who aren't touring.
  const { id: attractionId, totalUpcoming } = await resolveAttractionInfo(artist);

  if (attractionId) {
    dblog('ok', `${artist}: attractionId=${attractionId} Ãƒâ€šÃ‚Â· TM upcoming=${totalUpcoming ?? '?'}`);
  }

  // Early exit: TM explicitly says 0 upcoming events ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ don't burn a request.
  // We skip this check in incremental mode (existingShows provided) because the
  // artist might have had events when last scanned, so we trust the cache diff.
  if (totalUpcoming === 0 && !existingShows) {
    dblog('info', `${artist}: TM reports 0 upcoming ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ skip event fetch (saves 1 req)`);
    return [];
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Step 2: fetch events ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const TM_MAX = 200;
  const MAX_PAGE = attractionId ? 5 : 2; // full pages for known attraction, limit for keyword
  const shows = [];

  // In incremental mode: build a set of already-known event IDs so we can diff
  const knownIds = existingShows ? new Set(existingShows.map(s => s.id)) : null;

  for (let page = 0; page < MAX_PAGE; page++) {
    if (scanAborted) break;
    await (window._rateLimitedWait?.());  // rate-limit every individual TM request

    const url = attractionId
      ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&attractionId=${attractionId}&size=${TM_MAX}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`
      : `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artist)}&classificationName=music&size=${TM_MAX}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`;

    const r = await apiFetch(url);
    if (r.status === 429) throw new Error('429');
    if (r.status === 413) {
      // 413 = URL too long or bad chars ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â try ASCII-normalized name
      if (!attractionId) {
        const ascii = artist.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, '');
        if (ascii !== artist) {
          dblog('warn', `"${artist}": 413 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â retrying with ASCII name "${ascii}"`);
          const urlAscii = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(ascii)}&classificationName=music&size=${TM_MAX}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`;
          const r2 = await apiFetch(urlAscii);
          if (r2.ok) {
            const d2 = await r2.json();
            const evs2 = d2?._embedded?.events || [];
            for (const ev of evs2) {
              if (!attractionId && !artistMatch(artist, ev, ambig)) continue;
              const date = ev.dates?.start?.localDate; if (!date) continue;
              const v = ev._embedded?.venues?.[0];
              const lat = parseFloat(v?.location?.latitude);
              const lng = parseFloat(v?.location?.longitude);
              const cc = v?.country?.countryCode || '';
              if (!countryAllowed(cc)) continue;
              shows.push({
                id: ev.id, artist, date,
                venue: v?.name || '', city: v?.city?.name || '',
                country: cc, state: v?.state?.stateCode || '',
                lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
                url: ev.url, eventName: ev.name || '', _src: 'tm',
                isFest: isFestivalLikeEvent(ev),
              });
            }
            break;
          }
        }
      }
      break; // skip this page on 413, don't retry as-is
    }
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    const evs = d?._embedded?.events || [];

    for (const ev of evs) {
      if (!attractionId && !artistMatch(artist, ev, ambig)) continue;
      const date = ev.dates?.start?.localDate; if (!date) continue;
      const v = ev._embedded?.venues?.[0];
      const lat = parseFloat(v?.location?.latitude);
      const lng = parseFloat(v?.location?.longitude);
      const cc = v?.country?.countryCode || '';
      if (!countryAllowed(cc)) continue;

      shows.push({
        id: ev.id, artist, date,
        venue: v?.name || '', city: v?.city?.name || '',
        country: cc, state: v?.state?.stateCode || '',
        lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
        url: ev.url, eventName: ev.name || '', _src: 'tm',
        isFest: isFestivalLikeEvent(ev),
      });
    }

    if (evs.length < TM_MAX) break; // last page ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no need to fetch more

    // In incremental mode: if page 0 has no new IDs, we're done (no new shows announced)
    if (knownIds && page === 0) {
      const hasNew = shows.some(s => !knownIds.has(s.id));
      if (!hasNew) {
        dblog('info', `${artist}: page 0 matches cache ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no new shows`);
        break;
      }
    }

    if (page < MAX_PAGE - 1) await sleep(80); // tight sleep between pages ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â we already paid ~300ms per fetch
  }

  // Incremental: merge new shows with existing, avoiding duplicates
  if (existingShows && knownIds) {
    const newShows = shows.filter(s => !knownIds.has(s.id));
    if (newShows.length) dblog('ok', `${artist}: +${newShows.length} NEW shows found`);
    return [...existingShows, ...newShows];
  }

  if (shows.length) dblog('ok', `${artist}: +${shows.length} shows via ${attractionId ? 'attractionId' : 'keyword'}`);
  return shows;
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ bitFetch ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Bandsintown's API sets correct CORS headers ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no proxy needed.
// Using raw fetch() keeps BIT calls completely separate from the TM
// rate-limit pipeline so they can run in parallel without burning quota.
async function bitFetch(url, ms = 5000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    return r;
  } catch(e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') throw new Error('timeout');
    const err = new Error('net:' + (e.message || 'Failed to fetch'));
    err.isNet = true;
    throw err;
  }
}

// Bandsintown fallback ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â called ONLY for artists with 0 TM results
// API is free, no key required, CORS-friendly from browser
async function fetchBIT(artist, today) {
  // Circuit breaker ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â skip if BIT is globally unreachable this session
  if (window._bitBlocked) return [];
  try {
    const name = encodeURIComponent(artist);
    const url = `https://rest.bandsintown.com/artists/${name}/events?app_id=tourtrack&date=upcoming`;
    const r = await bitFetch(url, 4000); // BIT-specific fetch ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no TM proxy, no rate limit
    if (r.status === 403 || r.status === 401 || r.status === 503) {
      window._bitBlocked = true;
      dblog('warn', `BIT API: HTTP ${r.status} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â disabling Bandsintown for this session`);
      return [];
    }
    if (!r.ok) return [];
    const data = await r.json();
    if (!Array.isArray(data)) return [];
    const shows = [];
    for (const ev of data) {
      const date = ev.datetime?.split('T')[0]; if (!date || date < today) continue;
      const v = ev.venue || {};
      const lat = parseFloat(v.latitude), lng = parseFloat(v.longitude);
      const cc = (v.country || '').slice(0,2).toUpperCase() || '';
      if (!countryAllowed(cc)) continue;
      shows.push({
        id: 'bit_' + ev.id, artist, date,
        venue: v.name || '', city: v.city || '',
        country: cc, state: v.region || '',
        lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
        url: ev.url || '', eventName: ev.title || ev.description || '', _src: 'bit',
      });
    }
    if (shows.length) dblog('ok', `${artist}: +${shows.length} shows (Bandsintown fallback)`);
    return shows;
  } catch(e) {
    // Network-level block ("Failed to fetch") ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â BIT is unreachable, stop trying
    const isNetBlock = e.message?.includes('Failed to fetch') ||
                       e.message?.includes('NetworkError') ||
                       e.message?.includes('net::') ||
                       e.name === 'TypeError';
    if (isNetBlock) {
      window._bitBlocked = true;
      dblog('warn', 'BIT API: network blocked ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â disabling Bandsintown for this session');
    }
    return [];
  }
}


async function fetchFestivalsData() {
  const today = new Date().toISOString().split('T')[0];

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Pass 1: User geo-aware sweep (covers whatever countries the user has selected) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const geoTargets = (() => {
    if (countryMode === 'world') return ['']; // worldwide ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no country param
    if (countryMode === 'include' && includeCountries.size > 0) {
      return [...includeCountries].map(cc => `&countryCode=${cc}`);
    }
    return [''];  // exclude mode: fetch globally, calendar geo-filter handles display
  })();

  const batches = [];
  for (let i = 0; i < geoTargets.length; i += 5) batches.push(geoTargets.slice(i, i + 5));

  let pagesDone = 0;
  for (const batch of batches) {
    if (scanAborted) break;
    for (const geo of batch) {
      if (scanAborted) break;
      for (let page = 0; page < 3; page++) {
        if (scanAborted) break;
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc${geo}&startDateTime=${today}T00:00:00Z`;
        try {
          const r = await apiFetch(url); if (!r.ok) break;
          const d = await r.json();
          const evs = d?._embedded?.events || [];
          if (!evs.length) break;
          ingestFestEvents(evs, null);
          pagesDone++;
          setProgress(`Festivals: user-geo sweep ${pagesDone} pages Ãƒâ€šÃ‚Â· ${festivals.length} found`, 87);
        } catch(e) { break; }
        await sleep(150);
      }
    }
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Pass 1b: Hardcoded western hemisphere + key global markets sweep ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // ALWAYS runs regardless of user geo settings ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â these regions have major festivals
  // that users want even when their concert filter is EU-only.
  const ALWAYS_SWEEP = ['US','MX','AR','BR','CL','CO','CA','AU','JP'].filter(
    cc => !includeCountries.has(cc) && countryMode !== 'world' // skip if already covered
  );
  for (const cc of ALWAYS_SWEEP) {
    if (scanAborted) break;
    for (let page = 0; page < 2; page++) {
      if (scanAborted) break;
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc&countryCode=${cc}&startDateTime=${today}T00:00:00Z`;
      try {
        const r = await apiFetch(url); if (!r.ok) break;
        const d = await r.json();
        const evs = d?._embedded?.events || [];
        if (!evs.length) break;
        ingestFestEvents(evs, null);
        pagesDone++;
        setProgress(`Festivals: global sweep ${cc} Ãƒâ€šÃ‚Â· ${festivals.length} found`, 89);
      } catch(e) { break; }
      await sleep(150);
    }
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Pass 2: KNOWN_FESTIVALS by exact name ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â worldwide, no geo filter ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // size=50 so we get the actual festival event not just parking/addon tickets
  for (let i = 0; i < KNOWN_FESTIVALS.length; i++) {
    if (scanAborted) break;
    const name = KNOWN_FESTIVALS[i];
    if (i % 10 === 0) setProgress(`Festivals: named lookup ${i+1}/${KNOWN_FESTIVALS.length} Ãƒâ€šÃ‚Â· ${festivals.length} found`, 91);
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}&size=50&sort=date,asc&startDateTime=${today}T00:00:00Z`;
      const r = await apiFetch(url); if (!r.ok) continue;
      const d = await r.json();
      ingestFestEvents(d?._embedded?.events || [], name);
    } catch(e) {}
    await sleep(80);
  }

  festivals = deduplicateFestivals(festivals);
  scoreFestivals();
  dblog('info', `Festivals: ${festivals.length} after dedup (geo: ${geo_targets_count(geoTargets)}, always-sweep: ${ALWAYS_SWEEP.join(',')}, named: ${KNOWN_FESTIVALS.length})`);
}

function geo_targets_count(arr) { return arr.filter(s=>s).length || 'worldwide'; }


function ingestFestEvents(evs, hint) {
  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Music classification check ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // TM events carry segment/genre classification. We want Music only.
  // If classification data exists and segment is NOT Music ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ skip.
  const isMusicEvent = (ev) => {
    const cls = ev.classifications?.[0];
    if (!cls) return true; // no classification data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â allow (better safe than sorry)
    const seg = (cls.segment?.name || '').toLowerCase();
    if (seg && seg !== 'music') return false; // definitely not music
    return true;
  };

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Blocklist: non-music events whose names contain "festival" ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // These slip through because "festival" is in the name, but they're
  // sports, food, film, theatre, comedy, fishing, etc.
  const NON_MUSIC_RE = /\b(seafood|food|beer|wine|chili|bbq|barbeque|barbecue|taco|burger|whiskey|whisky|vodka|rum|sake|craft\s*beer|oktoberfest|brew\s*fest|film\s*fest|film\s*festival|movie\s*fest|cinema\s*fest|comedy\s*fest|comedy\s*festival|stand[- ]?up\s*fest|theatre\s*fest|theater\s*fest|play\s*fest|improv\s*fest|art\s*fest(?!ival.*music)|arts\s*fest(?!.*music)|ballet\s*fest|dance\s*fest(?!.*music)|fishing\s*fest|fly\s*fish|hunting\s*fest|car\s*fest|auto\s*fest|motor\s*fest|boat\s*fest|air\s*show|balloon\s*fest|kite\s*fest|chess\s*fest|comic\s*(?:con|fest)|gaming\s*fest|esport|sports?\s*fest|soccer|hockey|baseball|basketball|football|rugby|tennis|golf\s*(?:open|classic|tournament)|yoga\s*fest|cannabis\s*fest|weed\s*fest|420\s*fest|psychedelic\s*(?:conference|summit)|haunted|halloween\s*(?:horror|haunt)|renaissance\s*faire|medieval\s*fest|pirate\s*fest|cowboy\s*fest|rodeo\s*fest|parade|marathon\s*(?:event|race)|triathlon|5k\s*(?:run|race)|dog\s*show|cat\s*show|flower\s*show|garden\s*fest|harvest\s*fest(?!.*music)|pumpkin\s*fest|strawberry\s*fest|cherry\s*fest|peach\s*fest|apple\s*fest|garlic\s*fest|lobster\s*fest|oyster\s*fest|shrimp\s*fest|pizza\s*fest|ice\s*cream\s*fest|chocolate\s*fest|vs\s+\w|\w+\s+vs\b)\b/i;

  // Names that generically say "festival" but are definitely not music concerts
  const GENERIC_NON_MUSIC = /\b(indoor\s+(?:ski|swim|sport)|aquatic|swimming|rowing|cycling\s+tour|horse\s+(?:show|race)|polo|lacrosse|wrestling|boxing\s+(?:event|show|card)|mma\s+(?:event|card)|ufc|bellator|cage|fight\s+(?:night|card)|concert\s+series\s+(?:ticket|pass))\b/i;

  // Broad patterns ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â but now gated by music classification check above
  const FEST_NAME_RE = /\bfest(ival)?\b|open\s+air\b|music\s+week\b|corona\s+capital|vans\s+warped|pa['''`]?l\s+norte|pal\s+norte|lollapalooza|coachella|primavera\b|vive\s+latino|tecate\b|estÃƒÆ’Ã‚Â©reo\s+picnic|stereo\s+picnic|rock\s+(en|am|im|al|in\s+the)\b|rock\s+al\s+parque|afropunk|creamfields|tomorrowland|ultra\s+(music|miami|europe)|electric\s+daisy|day\s+\d\b|weekend\s+\d\b|day\s+one\b|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|nos\s+primavera|rock\s+werchter|flow\s+festival|way\s+out\s+west|parklife|latitude\b|wireless\b|field\s+day|all\s+points\s+east|burning\s+man|outside\s+lands|governors\s+ball|bonnaroo|acl\b|austin\s+city|splendour|fuji\s+rock|summer\s+sonic|bahidora|nrmal|bpm\s+festival|coordenada|cosquin\s+rock|rolling\s+loud|head\s+in\s+the\s+clouds|warped\s+tour/i;

  // Hint words ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â significant words from the festival name we searched for
  const hintWords = hint
    ? hint.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !/^(festival|music|arts|the|and|de|la|el)$/i.test(w))
    : [];

  for (const ev of evs) {
    const date = ev.dates?.start?.localDate; if (!date) continue;
    const v = ev._embedded?.venues?.[0];
    const lat = parseFloat(v?.location?.latitude), lng = parseFloat(v?.location?.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    const cc = v?.country?.countryCode || '';
    const nameL = (ev.name || '').toLowerCase();

    if (!isMusicEvent(ev)) continue;
    if (NON_MUSIC_RE.test(nameL) || GENERIC_NON_MUSIC.test(nameL)) continue;

    const isFestName = FEST_NAME_RE.test(nameL) || isFestivalLikeEvent(ev);
    const hintMatch = hintWords.length > 0 &&
      hintWords.filter(w => nameL.includes(w)).length >= Math.ceil(hintWords.length * 0.5);
    if (!isFestName && !hintMatch) continue;

    const displayName = (hint && hintMatch && hint.length <= (ev.name || '').length) ? hint : (ev.name || hint || 'Festival');
    const lineup = _festivalLineupFromEvent(ev, displayName);

    const imgs = ev.images || [];
    const img16x9 = imgs.find(i => i.ratio === '16_9' && i.width >= 640) ||
                    imgs.find(i => i.ratio === '16_9') ||
                    imgs.sort((a,b) => (b.width||0)-(a.width||0))[0];
    const imageUrl = img16x9?.url || '';

    festivals.push({
      id: ev.id,
      name: displayName,
      rawName: ev.name || displayName,
      date,
      venue: v?.name || '',
      city: v?.city?.name || '',
      country: cc,
      lat, lng,
      url: ev.url,
      lineup,
      imageUrl,
      sourceHints: _uniqueCI([hint, ev.name].filter(Boolean)),
    });
  }
}

function deduplicateFestivals(list) {
  const sorted = (list || [])
    .filter(f => f && f.date)
    .map(f => ({ ...f, lineup: _uniqueCI(f.lineup || []) }))
    .sort((a, b) =>
      (a.date || '').localeCompare(b.date || '') ||
      festCore(a.name || a.rawName || '').localeCompare(festCore(b.name || b.rawName || '')));

  const merged = [];
  for (const f of sorted) {
    const dup = merged.find(m =>
      (f.id && m.id && f.id === m.id) || _sameFestival(m, f));
    if (!dup) merged.push({ ...f });
    else Object.assign(dup, _mergeFestivalPair(dup, f));
  }
  return merged.map(f => {
    if (f.endDate && f.endDate < f.date) f.endDate = f.date;
    if (f.endDate === f.date) delete f.endDate;
    f.lineup = _uniqueCI(f.lineup || []);
    f.sourceHints = _uniqueCI(f.sourceHints || []);
    return f;
  });
}

function festCore(name) {
  return _festivalBaseName(name);
}

function geoDist(lat1, lng1, lat2, lng2) {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function _festivalNameScore(name) {
  const raw = _normText(name);
  const base = festCore(name);
  return (base ? 20 - Math.min(base.length, 20) : 0)
    + (FEST_EVENT_RE.test(raw) ? 6 : 0)
    - (TICKET_TIER_TEST_RE.test(name || '') ? 18 : 0)
    - (/\b(ticket|parking|camping|hotel|upgrade|bundle)\b/i.test(raw) ? 14 : 0);
}
function _sameFestival(a, b) {
  const coreA = festCore(a.name || a.rawName || '');
  const coreB = festCore(b.name || b.rawName || '');
  if (!coreA || !coreB) return false;
  if (coreA !== coreB && _tokenOverlap(coreA, coreB) < 0.65) return false;

  const diffDays = Math.abs((new Date((a.date || '') + 'T12:00:00') - new Date((b.date || '') + 'T12:00:00')) / 86400000);
  if (diffDays > 7) return false;

  const venueA = _venueCore(a.venue || '');
  const venueB = _venueCore(b.venue || '');
  const cityA = _cityCore(a.city || '');
  const cityB = _cityCore(b.city || '');
  const sameCountry = !(a.country && b.country) || a.country === b.country;

  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null && geoDist(a.lat, a.lng, b.lat, b.lng) <= 12) return true;
  if (venueA && venueB && (venueA === venueB || _tokenOverlap(venueA, venueB) >= 0.72)) return sameCountry;
  if (cityA && cityB && cityA === cityB && sameCountry) return true;
  return false;
}
function _mergeFestivalPair(a, b) {
  const primary = _festivalNameScore(b.name || '') > _festivalNameScore(a.name || '') ? b : a;
  const secondary = primary === a ? b : a;
  const startDate = [a.date, b.date].filter(Boolean).sort()[0] || a.date || b.date;
  const endDate = [a.endDate || a.date, b.endDate || b.date].filter(Boolean).sort().slice(-1)[0] || startDate;
  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    name: primary.name || secondary.name,
    rawName: primary.rawName || secondary.rawName || primary.name || secondary.name,
    date: startDate,
    endDate: endDate !== startDate ? endDate : undefined,
    venue: (_venueCore(primary.venue).length >= _venueCore(secondary.venue).length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
    city: primary.city || secondary.city || '',
    country: primary.country || secondary.country || '',
    lat: primary.lat != null ? primary.lat : secondary.lat,
    lng: primary.lng != null ? primary.lng : secondary.lng,
    url: primary.url || secondary.url || '',
    imageUrl: primary.imageUrl || secondary.imageUrl || '',
    lineup: _uniqueCI([...(a.lineup || []), ...(b.lineup || [])]),
    sourceHints: _uniqueCI([...(a.sourceHints || []), ...(b.sourceHints || []), a.rawName, b.rawName].filter(Boolean)),
  };
}

function scoreFestivals() {
  // Non-linear play weight ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â four clear tiers with smooth intra-tier variation:
  //   0 plays   ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢  0     (not tracked)
  //   1         ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢  2     (in playlist once, casual)
  //   2ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“3       ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢  7ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“8   (ÃƒÂÃ‚Â½ÃƒÂÃ‚ÂµÃƒÂÃ‚Â¿ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â‚¬Â¦ÃƒÂÃ‚Â¾ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â you know them)
  //   4ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“10      ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢  14ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“17 (ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸Ãƒâ€˜Ã¢â‚¬Â¡ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¾ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â real fan)
  //   11+       ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢  23+   (Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã†â€™ÃƒÂÃ‚Â¿ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â in heavy rotation)
  // Clear jumps between tiers, log smoothing within 11+ to avoid RadioheadÃƒÆ’Ã¢â‚¬â€142 crushing everything
  const playWeight = plays => {
    if (!plays || plays <= 0) return 0;
    if (plays === 1) return 2;
    if (plays <= 3)  return 5 + plays;                    // 2ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢7, 3ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢8
    if (plays <= 10) return 12 + plays * 0.5;             // 4ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢14, 10ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢17
    return 20 + Math.log2(plays);                         // 11ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢23.5, 20ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢24.3, 50ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢25.6, 142ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢27.1
  };

  const playsTotal = Object.values(ARTIST_PLAYS).reduce((s, v) => s + v, 0);
  const hasPlays = playsTotal > 0;

  const artistWeight = name => {
    const key = (name || '').toLowerCase();
    if (hasPlays) return playWeight(ARTIST_PLAYS[key] || 0);
    // Fallback: position-based weight (earlier in list = heavier)
    const idx = ARTISTS.findIndex(a => a.toLowerCase() === key);
    return idx >= 0 ? (ARTISTS.length - idx) : 0;
  };

  // First pass: compute raw scores
  for (const f of festivals) {
    const ll = _resolvedFestivalLineup(f);
    f.lineupResolved = ll;
    f.linkedShows = _festivalLinkedConcerts(f).length;
    const matched = [];
    let rawScore = 0;
    ARTISTS.forEach(artist => {
      if (!artist) return;
      const hit = _lineupArtistHit(artist, ll) || (!ll.length && _lineupArtistHit(artist, [f.name || '']));
      if (hit) {
        const w = artistWeight(artist);
        matched.push({ artist, plays: ARTIST_PLAYS[artist.toLowerCase()] || 0, weight: w });
        rawScore += w;
      }
    });
    if (matched.length >= 2) rawScore += matched.length * 1.5;
    // Sort matched by weight desc (most-played first)
    f.matched = matched.sort((a, b) => b.weight - a.weight);
    f._rawScore = rawScore;
  }

  // Second pass: normalise scores to 0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“100
  const maxRaw = Math.max(...festivals.map(f => f._rawScore || 0), 1);
  for (const f of festivals) {
    f.score = Math.round((f._rawScore / maxRaw) * 100);
    delete f._rawScore;
  }

  festivals.sort((a, b) => (b.score - a.score) || a.date.localeCompare(b.date));
}

function deduplicateConcerts(list) {
  return _deduplicateConcerts(list, false);
}

function _concertScore(c) {
  return (c.url ? 6 : 0)
    + (c.lat != null && c.lng != null ? 4 : 0)
    + (_venueCore(c.venue || '').length ? 3 : 0)
    + (_cityCore(c.city || '').length ? 2 : 0)
    + (_normalizedUrlKey(c.url).length ? 1 : 0)
    + ((c.eventName || '').length > (c.artist || '').length ? 1 : 0)
    + (c.isFest ? 1 : 0);
}
function _sameConcert(a, b, aggressive) {
  if (_normText(a.artist) !== _normText(b.artist) || a.date !== b.date) return false;

  const urlA = _normalizedUrlKey(a.url);
  const urlB = _normalizedUrlKey(b.url);
  if (urlA && urlB && urlA === urlB) return true;
  if (a.id && b.id && a.id === b.id) return true;

  const venueA = _venueCore(a.venue || '');
  const venueB = _venueCore(b.venue || '');
  const cityA = _cityCore(a.city || '');
  const cityB = _cityCore(b.city || '');
  const sameCountry = !(a.country && b.country) || a.country === b.country;

  if (venueA && venueB && venueA === venueB && (!cityA || !cityB || cityA === cityB) && sameCountry) return true;
  if (venueA && venueB && sameCountry && (!cityA || !cityB || cityA === cityB) &&
      _tokenOverlap(venueA, venueB) >= (aggressive ? 0.58 : 0.72)) return true;

  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
    const dist = geoDist(a.lat, a.lng, b.lat, b.lng);
    if (dist <= (aggressive ? 8 : 3)) {
      if (!cityA || !cityB || cityA === cityB) return true;
      if (venueA && venueB && _tokenOverlap(venueA, venueB) >= 0.45) return true;
    }
  }

  if (aggressive && cityA && cityB && cityA === cityB && sameCountry) {
    const eventOverlap = _tokenOverlap(a.eventName || a.venue, b.eventName || b.venue);
    if ((!venueA || !venueB || _tokenOverlap(venueA, venueB) >= 0.45) && eventOverlap >= 0.35) return true;
  }
  return false;
}
function _mergeConcertPair(a, b) {
  const primary = _concertScore(b) > _concertScore(a) ? b : a;
  const secondary = primary === a ? b : a;
  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    artist: primary.artist || secondary.artist,
    date: primary.date || secondary.date,
    venue: (_venueCore(primary.venue).length >= _venueCore(secondary.venue).length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
    city: primary.city || secondary.city || '',
    country: primary.country || secondary.country || '',
    state: primary.state || secondary.state || '',
    lat: primary.lat != null ? primary.lat : secondary.lat,
    lng: primary.lng != null ? primary.lng : secondary.lng,
    url: primary.url || secondary.url || '',
    eventName: primary.eventName || secondary.eventName || '',
    isFest: !!(primary.isFest || secondary.isFest),
    _src: _uniqueCI([primary._src, secondary._src].filter(Boolean)).join('+'),
  };
}
function _deduplicateConcerts(list, aggressive) {
  const buckets = new Map();
  for (const c of list || []) {
    if (!c || !c.artist || !c.date) continue;
    const key = `${_normText(c.artist)}|${c.date}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ ...c });
  }

  const out = [];
  for (const group of buckets.values()) {
    group.sort((a, b) => _concertScore(b) - _concertScore(a));
    const merged = [];
    for (const c of group) {
      const dup = merged.find(m => _sameConcert(m, c, aggressive));
      if (!dup) merged.push(c);
      else Object.assign(dup, _mergeConcertPair(dup, c));
    }
    out.push(...merged);
  }
  return out.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') ||
    (a.artist || '').localeCompare(b.artist || '') ||
    (a.city || '').localeCompare(b.city || ''));
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ visibleConcerts() ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Central render-time filter for the concerts array.
// When showPossibleDupes is false (default), applies an aggressive third
// dedup pass on top of the two passes already baked into the array:
//   Key: artist|date|venue.slice(0,12)
// Any two entries sharing this key are treated as dupes ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â keep the one
// with a ticket URL, otherwise keep the first seen.
// This catches cases like "Ziggo Dome Hall A" vs "Ziggo Dome Club" that
// slip through the city-level second pass because the sub-venue names differ.
function visibleConcerts() {
  if (showPossibleDupes) return concerts;
  return _deduplicateConcerts(concerts, true);
}

function togglePossibleDupes() {
  showPossibleDupes = !showPossibleDupes;
  const btn = document.getElementById('dupes-toggle');
  if (btn) {
    btn.style.color         = showPossibleDupes ? 'var(--accent)' : '';
    btn.style.borderColor   = showPossibleDupes ? 'var(--accent)' : '';
    btn.style.background    = showPossibleDupes ? 'rgba(200,255,95,.08)' : '';
    btn.title = showPossibleDupes
      ? 'Showing possible duplicate entries ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â click to hide them again'
      : 'Possible duplicate entries hidden ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â click to show';
  }
  buildCalChips(); renderCalendar(); renderMap();
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// CALENDAR
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
function flag(code) { return COUNTRY_MAP[code]?.f || code; }
function fmtDate(d) { return d ? new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''; }
function fmtDateRange(f) {
  if (!f.endDate || f.endDate === f.date) return fmtDate(f.date);
  const s = new Date(f.date+'T12:00:00'), e = new Date(f.endDate+'T12:00:00');
  const sm = s.toLocaleDateString('en-US',{month:'short'}), em = e.toLocaleDateString('en-US',{month:'short'});
  const sd = s.getDate(), ed = e.getDate(), ey = e.getFullYear();
  if (sm === em) return sm+' '+sd+'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“'+ed+', '+ey;  // Jun 26ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“28, 2026
  return sm+' '+sd+'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“'+em+' '+ed+', '+ey;          // Jun 30ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Jul 2, 2026
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ CALENDAR GEO FILTER (region-based) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function buildCalChips() {
  // Count events per country
  const ccCount = new Map();
  const _vc = visibleConcerts();
  for (const e of _vc)  if (e.country) ccCount.set(e.country, (ccCount.get(e.country)||0)+1);
  for (const f of festivals) if (f.country) ccCount.set(f.country, (ccCount.get(f.country)||0)+1);

  // Count per region
  const regCount = new Map();
  for (const [cc, n] of ccCount) {
    const r = COUNTRY_MAP[cc]?.r;
    if (r) regCount.set(r, (regCount.get(r)||0)+n);
  }

  const wrap = document.getElementById('cal-geo-chips');
  if (!wrap) return; // element removed from toolbar - geo filtering handled by geo-quick-row
  wrap.innerHTML = '';
  if (!ccCount.size) { wrap.innerHTML = '<span style="font-size:.6rem;color:var(--muted2)">No data</span>'; return; }

  // "All" chip
  const allChip = document.createElement('button');
  allChip.className = 'geo-chip' + (calGeoFilter.size === 0 ? ' on' : '');
  allChip.dataset.geo = '__all__';
  const totalEv = [...ccCount.values()].reduce((a,b)=>a+b,0);
  allChip.innerHTML = `All <span class="geo-cnt">${totalEv}</span>`;
  allChip.onclick = () => { calGeoFilter.clear(); calGeoExpanded = null; buildCalChips(); renderCalendar(); };
  wrap.appendChild(allChip);

  // Region chips ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â only show regions that have events
  REGIONS.forEach(r => {
    const cnt = regCount.get(r.id);
    if (!cnt) return;
    const on = calGeoFilter.has(r.id);
    const chip = document.createElement('button');
    chip.className = 'geo-chip' + (on ? ' on' : '');
    chip.dataset.geo = r.id;
    chip.innerHTML = `${r.e} ${r.lbl} <span class="geo-cnt">${cnt}</span>`;
    chip.onclick = () => {
      if (calGeoFilter.has(r.id)) { calGeoFilter.delete(r.id); calGeoExpanded = null; }
      else { calGeoFilter.add(r.id); calGeoExpanded = r.id; }
      buildCalChips(); renderCalendar();
    };
    wrap.appendChild(chip);
  });

  // If a region is expanded, show its country chips inline
  if (calGeoExpanded && calGeoFilter.has(calGeoExpanded)) {
    const subRow = document.createElement('div');
    subRow.className = 'geo-sub-chips';
    const codes = regionCodes(calGeoExpanded).filter(c => ccCount.has(c));
    codes.forEach(code => {
      const m = COUNTRY_MAP[code]; if (!m) return;
      const cnt = ccCount.get(code) || 0;
      // Individual country filter stored in calGeoFilter as 'cc:XX'
      const key = 'cc:' + code;
      const active = calGeoFilter.has(key);
      const sub = document.createElement('button');
      sub.className = 'chip' + (active ? ' on' : '');
      sub.innerHTML = `${m.f} ${m.n} <span style="color:var(--muted2);font-size:.52rem">${cnt}</span>`;
      sub.onclick = () => {
        if (calGeoFilter.has(key)) calGeoFilter.delete(key); else calGeoFilter.add(key);
        buildCalChips(); renderCalendar();
      };
      subRow.appendChild(sub);
    });
    if (subRow.children.length) wrap.appendChild(subRow);
  }
}

function calFilter(arr) {
  if (calGeoFilter.size === 0) return arr;
  // Collect region IDs and explicit country codes from filter
  const activeRegions = new Set([...calGeoFilter].filter(k => !k.startsWith('cc:')));
  const activeCountries = new Set([...calGeoFilter].filter(k => k.startsWith('cc:')).map(k => k.slice(3)));

  return arr.filter(e => {
    const cc = e.country || '';
    const r  = COUNTRY_MAP[cc]?.r || '';
    if (activeCountries.size > 0 && activeRegions.size > 0) {
      // Mixed: show if matches an active country OR belongs to an active region (but not expanded one, where country filter applies)
      if (activeRegions.has(r) && r !== calGeoExpanded) return true;
      if (activeCountries.has(cc)) return true;
      return false;
    }
    if (activeCountries.size > 0) return activeCountries.has(cc) || activeRegions.has(r);
    return activeRegions.has(r);
  });
}

function setCalView(view) {
  calView = view;
  document.getElementById('calview-all').classList.toggle('on', view === 'all');
  document.getElementById('calview-mx').classList.toggle('on', view === 'mx');
  // Show/hide rows that only make sense for global view
  const mxRow = document.getElementById('mx-sort-row');
  const typeRow = document.getElementById('cal-type-row');
  if (mxRow) mxRow.style.display = view === 'mx' ? 'flex' : 'none';
  if (typeRow) typeRow.style.display = view === 'mx' ? 'none' : '';
  renderCalendar();
}

function setMxSort(sort) {
  mxSort = sort;
  document.getElementById('mxsort-date').classList.toggle('on', sort === 'date');
  document.getElementById('mxsort-rank').classList.toggle('on', sort === 'rank');
  renderCalendar();
}

// CDMX city detection ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â handles common Ticketmaster city name variants
function isCDMX(city) {
  const c = (city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /\b(mexico\s*city|cdmx|ciudad\s*de\s*mexico|ciudad\s*de\s*mex|d\.?\s*f\.?|cuauhtemoc|benito\s*juarez|miguel\s*hidalgo|coyoacan|iztapalapa|tlalpan|gustavo|alvaro\s*obregon|azcapotzalco|venustiano|xochimilco|tlahuac|milpa\s*alta|cuajimalpa|iztacalco|magdalena\s*contreras)\b/.test(c);
}

// Rank score for an artist ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â combines plays and list position
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ DATE OFFSET HELPER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function dateOffset(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ UNIFIED ARTIST RANK SCORE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Shared by MX calendar, overview map, and everywhere else
// Returns: high = artist you listen to a lot = show higher priority
function artistRankScore(artistName) {
  const key = (artistName || '').toLowerCase();
  const plays = ARTIST_PLAYS[key] || 0;
  const listIdx = ARTISTS.findIndex(a => a.toLowerCase() === key);
  const posScore = listIdx >= 0 ? (ARTISTS.length - listIdx) : 0;
  return plays * 100 + posScore;
}
// Alias used by map rendering (non-linear weighting for visual sizing)
function _rankScore(artist) {
  const key = (artist || '').toLowerCase();
  const plays = ARTIST_PLAYS[key] || 0;
  const idx   = ARTISTS.findIndex(a => a.toLowerCase() === key);
  const pos   = idx >= 0 ? (ARTISTS.length - idx) / Math.max(ARTISTS.length, 1) * 20 : 0;
  return (plays >= 20 ? 200 + Math.log2(plays) * 10 :
          plays >= 5  ? 100 + plays * 4 :
          plays >= 1  ? 20  + plays * 5 : 0) + pos;
}

function renderMxCalendar() {
  const today = new Date().toISOString().split('T')[0];

  // All future MX concerts ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use unified score filter
  let mxCons = dateFilter_(visibleConcerts())
    .filter(c => c.country === 'MX' && !isHidden(c.artist) && scoreOkArtist(c.artist));

  // MX festivals ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use score filter for fests
  const mxFests = showFests
    ? dateFilter_(festivals).filter(f => f.country === 'MX' && scoreOkFest(f))
    : [];

  // Split concerts into CDMX and Resto
  const cdmx  = mxCons.filter(c => isCDMX(c.city));
  const resto  = mxCons.filter(c => !isCDMX(c.city));

  const tallyEl = document.getElementById('mx-tally');
  const total = mxCons.length + mxFests.length;
  if (tallyEl) tallyEl.textContent = total ? `${total} events` : '';

  const body = document.getElementById('cal-body');
  if (!total && !mxCons.length) {
    if (concerts.length) {
      body.innerHTML = `<div class="empty"><div class="empty-icon">ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â²ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¡Ã‚Â½</div><div class="empty-msg">No MÃƒÆ’Ã‚Â©xico concerts in current data.<br><span style="font-size:.62rem;color:var(--muted2)">Check your geo filter settings or run a new scan.</span></div></div>`;
    } else if (window._scanActive) {
      // Scan is still running ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â show a scanning placeholder instead of the onboard overlay
      body.innerHTML = `<div class="empty"><div class="empty-icon" style="animation:breathe 1.5s ease-in-out infinite">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â</div><div class="empty-msg">Scanning for MÃƒÆ’Ã‚Â©xico concertsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦<br><span style="font-size:.62rem;color:var(--muted2)">Results will appear here as artists are checked.</span></div></div>`;
    } else {
      body.innerHTML = ''; showOnboard();
    }
    return;
  }

  // Sort function by ranking (plays + list position)
  const byRank = (a, b) => {
    const ra = artistRankScore(a.artist), rb = artistRankScore(b.artist);
    return rb - ra || a.date.localeCompare(b.date);
  };
  const byDate = (a, b) => a.date.localeCompare(b.date) || artistRankScore(b.artist) - artistRankScore(a.artist);
  const sortFn = mxSort === 'rank' ? byRank : byDate;

  const frag = document.createDocumentFragment();

  const renderMxSection = (concerts, label, cls) => {
    if (!concerts.length) return;

    const sec = document.createElement('div');
    sec.className = 'mx-section';
    sec.innerHTML = `
      <div class="mx-section-name ${cls}">${label}</div>
      <div class="mx-section-count">${concerts.length} show${concerts.length !== 1 ? 's' : ''}</div>`;
    frag.appendChild(sec);

    const sorted = [...concerts].sort(sortFn);

    if (mxSort === 'rank') {
      // By rank: flat list, show date prominently
      sorted.forEach(c => frag.appendChild(renderMxRow(c)));
    } else {
      // By date: grouped by month
      const byMonth = {};
      sorted.forEach(c => {
        const m = c.date.slice(0, 7);
        (byMonth[m] = byMonth[m] || []).push(c);
      });
      for (const [month, evs] of Object.entries(byMonth)) {
        const sep = document.createElement('div');
        sep.className = 'month-sep';
        sep.textContent = new Date(month + '-02').toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
        frag.appendChild(sep);
        evs.forEach(c => frag.appendChild(renderMxRow(c)));
      }
    }
  };

  renderMxSection(cdmx,  'CDMX', 'cdmx');
  renderMxSection(resto, 'Resto de MÃƒÆ’Ã‚Â©xico', 'resto');

  // MX festivals at the end
  if (mxFests.length) {
    const sec = document.createElement('div');
    sec.className = 'mx-section';
    sec.innerHTML = `<div class="mx-section-name cdmx">Festivales</div>
      <div class="mx-section-count">${mxFests.length}</div>`;
    frag.appendChild(sec);
    [...mxFests].sort((a,b) => a.date.localeCompare(b.date)).forEach(f => {
      const d = f.date.split('-');
      const dayname = new Date(f.date + 'T12:00:00').toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      const loc = [f.city].filter(Boolean).join(' ');
      const row = document.createElement('div');
      row.className = 'ev-row';
      const dayblock = document.createElement('div');
      dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;
      const main = document.createElement('div');
      main.className = 'ev-main';
      const nameEl = document.createElement('div');
      nameEl.className = 'ev-name' + (f.url ? ' tkt' : '');
      nameEl.textContent = f.name;
      const badge = document.createElement('span');
      badge.className = 'fest-badge'; badge.textContent = 'Festival';
      nameEl.appendChild(badge);
      if (f.url) nameEl.onclick = () => window.open(f.url, '_blank');
      const sub = document.createElement('div');
      sub.className = 'ev-sub';
      sub.innerHTML = `<strong>${f.venue || ''}</strong>${loc ? ' Ãƒâ€šÃ‚Â· ' + loc : ''}`;
      main.appendChild(nameEl); main.appendChild(sub);
      row.appendChild(dayblock); row.appendChild(main); row.appendChild(document.createElement('div'));
      frag.appendChild(row);
    });
  }

  body.innerHTML = '';
  body.appendChild(frag);
}

function renderMxRow(c) {
  const d = c.date.split('-');
  const dayname = new Date(c.date + 'T12:00:00').toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

  // Location: in rank mode show city, in date mode show venue
  const venuePart = c.venue || '';
  const cityPart  = [c.city, c.state && c.country === 'US' ? c.state : ''].filter(Boolean).join(', ');

  const row = document.createElement('div');
  const dim = isHidden(c.artist);
  row.className = 'ev-row' + (dim ? ' faded' : '');

  const dayblock = document.createElement('div');
  if (mxSort === 'rank') {
    // In rank mode: show date compactly
    const [, mon, day] = d;
    dayblock.innerHTML = `<span class="ev-daynum" style="font-size:1.3rem">${day}</span><span class="ev-dayname">${new Date(c.date + 'T12:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>`;
  } else {
    dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;
  }

  const main = document.createElement('div');
  main.className = 'ev-main';

  const nameEl = document.createElement('div');
  nameEl.className = 'ev-name' + (c.url ? ' tkt' : '');

  // Artist name + rank badge
  nameEl.textContent = c.artist;
  const plays = ARTIST_PLAYS[(c.artist || '').toLowerCase()] || 0;
  const isFav = favoriteArtists.has((c.artist || '').toLowerCase());
  if (plays > 0 || isFav) {
    const badge = document.createElement('span');
    badge.className = 'mx-rank-badge' + (isFav ? ' fav' : '');
    badge.textContent = isFav ? 'ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦' + (plays || '') : plays + ' ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶';
    nameEl.appendChild(badge);
  }
  if (c.url) nameEl.onclick = () => window.open(c.url, '_blank');

  const sub = document.createElement('div');
  sub.className = 'ev-sub';
  sub.innerHTML = `<strong>${venuePart}</strong>${cityPart ? ' Ãƒâ€šÃ‚Â· ' + cityPart : ''}`;

  main.appendChild(nameEl);
  main.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'ev-actions';
  const btn = document.createElement('button');
  btn.className = 'hide-btn' + (dim ? ' rst' : '');
  btn.textContent = dim ? 'Restore' : 'Hide';
  btn.onclick = dim ? () => restoreArtist(c.artist) : () => openSnooze(c.artist);
  actions.appendChild(btn);

  row.appendChild(dayblock); row.appendChild(main); row.appendChild(actions);
  return row;
}

let calDateFrom = '';  // ISO date for range start
let calDateTo   = '';  // ISO date for range end

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ DATE RANGE PICKER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
let _drpYear, _drpMonth;   // currently viewed month
let _drpSelStart = '';      // selected start (ISO)
let _drpSelEnd   = '';      // selected end (ISO)

function drpToggle(e) {
  e && e.stopPropagation();
  const pop = document.getElementById('drp-popover');
  if (pop.classList.contains('open')) { pop.classList.remove('open'); return; }
  // Init to current month or start of range
  const ref = calDateFrom ? new Date(calDateFrom + 'T12:00') : new Date();
  _drpYear = ref.getFullYear(); _drpMonth = ref.getMonth();
  _drpSelStart = calDateFrom; _drpSelEnd = calDateTo;
  drpRender();
  pop.classList.add('open');
  // Close on outside click ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use capture so we can check containment properly
  setTimeout(() => document.addEventListener('click', _drpOutside, { once: true }), 0);
}
function _drpOutside(e) {
  const pop = document.getElementById('drp-popover');
  if (pop && pop.contains(e.target)) {
    // Click was inside ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â re-register the listener
    setTimeout(() => document.addEventListener('click', _drpOutside, { once: true }), 0);
    return;
  }
  if (pop) pop.classList.remove('open');
}
function drpNavMonth(dir, e) {
  e && e.stopPropagation();
  _drpMonth += dir;
  if (_drpMonth > 11) { _drpMonth = 0; _drpYear++; }
  if (_drpMonth < 0)  { _drpMonth = 11; _drpYear--; }
  drpRender();
}
function drpRender() {
  const ML = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('drp-month-lbl').textContent = ML[_drpMonth] + ' ' + _drpYear;
  const grid = document.getElementById('drp-grid');
  const today = new Date().toISOString().split('T')[0];
  grid.innerHTML = '';
  // Day-of-week headers
  ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(d => {
    const el = document.createElement('div'); el.className = 'drp-dow'; el.textContent = d;
    grid.appendChild(el);
  });
  const first = new Date(_drpYear, _drpMonth, 1);
  const lastDay = new Date(_drpYear, _drpMonth + 1, 0).getDate();
  // Offset: Monday=0
  let startDow = (first.getDay() + 6) % 7;
  for (let i = 0; i < startDow; i++) {
    const el = document.createElement('div'); el.className = 'drp-day drp-empty';
    grid.appendChild(el);
  }
  for (let d = 1; d <= lastDay; d++) {
    const iso = _drpYear + '-' + String(_drpMonth + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    const el = document.createElement('div');
    el.className = 'drp-day';
    el.textContent = d;
    if (iso < today) el.classList.add('drp-past');
    if (iso === today) el.classList.add('drp-today');
    if (_drpSelStart && iso === _drpSelStart) el.classList.add('drp-start');
    if (_drpSelEnd   && iso === _drpSelEnd)   el.classList.add('drp-end');
    if (_drpSelStart && _drpSelEnd && iso > _drpSelStart && iso < _drpSelEnd) el.classList.add('drp-in-range');
    el.onclick = (ev) => drpDayClick(iso, ev);
    grid.appendChild(el);
  }
  // Update hint
  const hint = document.getElementById('drp-hint');
  const applyBtn = document.querySelector('#drp-popover .drp-apply-btn');
  if (!_drpSelStart) {
    hint.textContent = 'Click a date to select';
    if (applyBtn) applyBtn.disabled = true;
  } else if (!_drpSelEnd) {
    const fmt = s => new Date(s+'T12:00').toLocaleString('en-US',{month:'short',day:'numeric'});
    hint.textContent = fmt(_drpSelStart) + ' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â click another date for range, or Apply';
    if (applyBtn) applyBtn.disabled = false;
  } else {
    const fmt = s => new Date(s+'T12:00').toLocaleString('en-US',{month:'short',day:'numeric'});
    hint.textContent = fmt(_drpSelStart) + ' ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ' + fmt(_drpSelEnd);
    if (applyBtn) applyBtn.disabled = false;
  }
}
function drpDayClick(iso, e) {
  e && e.stopPropagation();
  if (!_drpSelStart || (_drpSelStart && _drpSelEnd)) {
    // Start fresh: first click sets start only
    _drpSelStart = iso; _drpSelEnd = '';
  } else {
    // Second click ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â set end (ensure order)
    if (iso < _drpSelStart) { _drpSelEnd = _drpSelStart; _drpSelStart = iso; }
    else if (iso === _drpSelStart) { _drpSelEnd = ''; } // toggle off
    else _drpSelEnd = iso;
  }
  drpRender();
  // If both dates chosen, apply immediately
  if (_drpSelStart && _drpSelEnd) drpApply();
}
function drpClear(e) {
  e && e.stopPropagation();
  _drpSelStart = ''; _drpSelEnd = '';
  drpRender();
}
function drpApply(e) {
  e && e.stopPropagation();
  if (!_drpSelStart) return;
  document.getElementById('drp-popover').classList.remove('open');
  // Single date = one-day filter; range = startÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢end
  const end = _drpSelEnd && _drpSelEnd !== _drpSelStart ? _drpSelEnd : _drpSelStart;
  setDateFilter('range', _drpSelStart, end);
  // Update chip label
  const fmt = s => new Date(s+'T12:00').toLocaleString('en-US',{month:'short',day:'numeric'});
  const chip = document.getElementById('drp-chip');
  const label = _drpSelEnd && _drpSelEnd !== _drpSelStart
    ? 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦ ' + fmt(_drpSelStart) + ' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ ' + fmt(_drpSelEnd)
    : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦ ' + fmt(_drpSelStart);
  if (chip) chip.textContent = label;
}

function monthBounds(offsetMonths = 0) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  const iso = d => d.toISOString().split('T')[0];
  return { from: iso(first), to: iso(last) };
}

function dateMatchesPreset(dateStr, filter = dateFilter) {
  const today = new Date().toISOString().split('T')[0];
  if (!dateStr) return false;
  if (filter === 'all') return dateStr >= today;
  if (filter === '7')   return dateStr >= today && dateStr <= dateOffset(7);
  if (filter === '14')  return dateStr >= today && dateStr <= dateOffset(14);
  if (filter === '30')  return dateStr >= today && dateStr <= dateOffset(30);
  if (filter === '90')  return dateStr >= today && dateStr <= dateOffset(90);
  if (filter === '180') return dateStr >= today && dateStr <= dateOffset(180);
  if (filter === 'year') return dateStr >= today && dateStr.startsWith(String(new Date().getFullYear()));
  if (filter === 'thismonth') {
    const { from, to } = monthBounds(0);
    return dateStr >= (today > from ? today : from) && dateStr <= to;
  }
  if (filter === 'nextmonth') {
    const { from, to } = monthBounds(1);
    return dateStr >= from && dateStr <= to;
  }
  if (filter === 'spring') { const m = parseInt(dateStr.slice(5, 7), 10); return m >= 3 && m <= 5; }
  if (filter === 'summer') { const m = parseInt(dateStr.slice(5, 7), 10); return m >= 6 && m <= 8; }
  if (filter === 'autumn') { const m = parseInt(dateStr.slice(5, 7), 10); return m >= 9 && m <= 11; }
  if (filter === 'winter') { const m = parseInt(dateStr.slice(5, 7), 10); return m === 12 || m <= 2; }
  if (filter === 'range') {
    const from = calDateFrom || today;
    const to   = calDateTo   || dateOffset(365 * 3);
    return dateStr >= from && dateStr <= to;
  }
  return dateStr >= today;
}

function setDateFilter(f, fromDate, toDate) {
  dateFilter = f;
  if (f === 'range') { calDateFrom = fromDate || ''; calDateTo = toDate || ''; }
  else { const chip = document.getElementById('drp-chip'); if (chip) chip.textContent = 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦'; }
  document.querySelectorAll('.chip[data-d]').forEach(c => c.classList.toggle('on', c.dataset.d === f));
  renderCalendar(); renderMap(); _updateTally();
}

// setPlaysFilter removed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use setScoreFilter instead

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FAVORITES ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
let showFavOnly = false;
let showPossibleDupes = false; // when false, aggressive dedup hides same-artist/date/venue-prefix entries

function toggleFavorite(artistName, e) {
  if (e) e.stopPropagation();
  const key = artistName.toLowerCase();
  if (favoriteArtists.has(key)) favoriteArtists.delete(key);
  else favoriteArtists.add(key);
  persistSettings();
  buildSidebar();
  renderMap();
  // Show/hide fav-only toggle
  const favBtn = document.getElementById('lt-fav');
  if (favBtn) favBtn.style.display = favoriteArtists.size ? '' : 'none';
}

function toggleFavOnly() {
  showFavOnly = !showFavOnly;
  const btn = document.getElementById('lt-fav');
  if (btn) { btn.style.color = showFavOnly ? '#ffd700' : ''; btn.style.borderColor = showFavOnly ? '#ffd700' : ''; }
  renderMap();
}

function resetFavorites() {
  favoriteArtists.clear();
  showFavOnly = false;
  const btn = document.getElementById('lt-fav');
  if (btn) btn.style.display = 'none';
  persistSettings();
  buildSidebar();
  renderMap();
}

function toggleType(t) {
  if (t === 'shows') { showShows = !showShows; document.querySelector('[data-t=shows]').classList.toggle('on', showShows); }
  else               { showFests  = !showFests;  document.querySelector('[data-t=fests]').classList.toggle('on', showFests); }
  renderCalendar(); renderMap();
}

function dateFilter_(arr) {
  return arr.filter(e => dateMatchesPreset(e.date));
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SCORE FILTER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Level 0 = all, 1 = low+, 2 = mid+, 3 = high+, 4 = top+
// For artists (tracks in playlist): 0, >3, >5, >10, >20
// For festivals (0-100 score):      0, >20, >30, >50, >70
const SCORE_ARTIST_MIN = [0, 3, 5, 10, 20];  // min ARTIST_PLAYS tracks per level
const SCORE_FEST_MIN   = [0, 20, 30, 50, 70]; // min f.score per level
let calScoreFilter = 0;   // 0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“4

function setScoreFilter(level) {
  calScoreFilter = level;
  document.querySelectorAll('#score-filter-row .plays-chip').forEach(c =>
    c.classList.toggle('on', parseInt(c.dataset.s) === level));
  renderCalendar(); renderMap(); _updateTally();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MAP-SPECIFIC FILTER HELPERS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Map uses the SAME filter state as the calendar (dateFilter, calScoreFilter, geoQuickOk)
// so filters are unified ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â changing a calendar chip also updates the map.
function mapScoreOkArtist(name) {
  if (!calScoreFilter) return true;
  return (ARTIST_PLAYS[name.toLowerCase()] || 0) >= SCORE_ARTIST_MIN[calScoreFilter];
}
function mapScoreOkFest(f) {
  if (!calScoreFilter) return true;
  return (f.score || 0) >= SCORE_FEST_MIN[calScoreFilter];
}
function mapDateOk(dateStr) {
  return dateMatchesPreset(dateStr);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MAP RENDER PIPELINE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
//
// _rebuildMapData(): lightweight alternative to full renderMap().
// Rebuilds allTourData applying current map filter state WITHOUT
// also rebuilding the full sidebar DOM (which renderMap does via buildSidebar).
//
function _rebuildMapData() {
  const today = new Date().toISOString().split('T')[0];
  allTourData = {};
  const skipTours = mapTypeFilter === 'fests';
  if (!skipTours) {
    for (const c of visibleConcerts()) {
      if (c.date < today || isHidden(c.artist)) continue;
      if (!geoDisplayOk(c.country || '')) continue;
      if (!mapDateOk(c.date)) continue;
      if (!mapScoreOkArtist(c.artist)) continue;
      (allTourData[c.artist] = allTourData[c.artist] || []).push(c);
    }
    for (const a in allTourData) {
      allTourData[a].sort((a, b) => a.date.localeCompare(b.date));
      getColor(a);
    }
  }
  // Update sidebar artist count to reflect the current filter
  const cntEl = document.getElementById('msb-all-cnt');
  if (cntEl) cntEl.textContent = Object.keys(allTourData).length + ' artists';
}

// withMapSpinner(workFn): shows the loading overlay for one paint frame,
// then runs workFn, then hides the overlay.
//
// Why double-rAF? The browser renders frames in a pipeline:
//   JS runs ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Style recalc ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Layout ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Paint ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Composite
// A single rAF yields until after the current frame paints (showing the
// spinner). The second rAF gives CSS transition time to complete.
// workFn() runs in the second frame ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â by then the spinner is on screen.
//
let _mapRenderPending = false;
function withMapSpinner(workFn) {
  const overlay = document.getElementById('map-loading-overlay');

  // Debounce: if a render is already queued, skip this click so rapid
  // tapping doesn't queue multiple renders that run back-to-back.
  if (_mapRenderPending) return;
  _mapRenderPending = true;

  if (overlay) overlay.classList.add('visible');

  requestAnimationFrame(() => {          // frame 1: browser paints overlay
    requestAnimationFrame(() => {        // frame 2: CSS transition applied
      try {
        workFn();                        // ÃƒÂ¢Ã¢â‚¬Â Ã‚Â heavy synchronous Leaflet work
      } catch (err) {
        // Surface the error in the debug log but don't let it leave
        // the spinner permanently visible or _mapRenderPending stuck.
        console.error('[map render error]', err);
        if (typeof dblog === 'function') dblog('warn', 'Map render error: ' + err.message);
      } finally {
        if (overlay) overlay.classList.remove('visible');
        _mapRenderPending = false;
      }
    });
  });
}

// Filter control handlers
function setMapType(t) {
  mapTypeFilter = t;
  // Update button styles: tours/fests use their respective colors
  ['both','tours','fests'].forEach(v => {
    const btn = document.getElementById('mft-' + v);
    if (!btn) return;
    btn.classList.remove('on', 'on-f');
    if (v === t) btn.classList.add(v === 'fests' ? 'on-f' : 'on');
  });
  // Sync the old layer-toggle state variables
  showMapTours = t !== 'fests';
  showMapFests = t !== 'tours';
  // Hide score row when fests-only (fests use festival.score, not ARTIST_PLAYS)
  const scoreRow = document.getElementById('mfilt-score-row');
  if (scoreRow) scoreRow.style.display = t === 'fests' ? 'none' : '';
  // Sync sidebar tab to match map type
  if (t === 'fests' && sidebarTab === 'tours') setTab('fests');
  else if (t === 'tours' && sidebarTab === 'fests') setTab('tours');
  else withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}
function setMapScore(s) {
  mapScoreFilter = s;
  document.querySelectorAll('[data-ms]').forEach(b =>
    b.classList.toggle('on', +b.dataset.ms === s));
  withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}
function setMapDate(d) {
  mapDateMode = d;
  document.querySelectorAll('[data-md],[data-md2]').forEach(b => {
    const val = b.dataset.md || b.dataset.md2;
    b.classList.toggle('on', val === d);
  });
  const rangeRow = document.getElementById('mfilt-range-row');
  if (rangeRow) rangeRow.style.display = d === 'range' ? '' : 'none';
  if (d === 'range') {
    const today = new Date().toISOString().split('T')[0];
    const end   = dateOffset(30);
    const fromEl = document.getElementById('mfilt-from');
    const toEl   = document.getElementById('mfilt-to');
    if (fromEl && !fromEl.value) fromEl.value = today;
    if (toEl   && !toEl.value)   toEl.value   = end;
    mapDateFrom = fromEl?.value || today;
    mapDateTo   = toEl?.value   || end;
  }
  if (d !== 'range') withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}
function applyMapRange() {
  mapDateFrom = document.getElementById('mfilt-from')?.value || '';
  mapDateTo   = document.getElementById('mfilt-to')?.value   || '';
  withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}

function setMapMaxArtists(n) {
  // Clamp between 5 and 200 in steps of 5
  MAP_MAX_ARTISTS = Math.max(5, Math.min(200, Math.round(n / 5) * 5));
  const valEl = document.getElementById('mfilt-max-val');
  if (valEl) valEl.textContent = MAP_MAX_ARTISTS;
  // No need to rebuild allTourData ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â the cap is applied inside renderOverview
  withMapSpinner(() => { clearMapLayers(); renderOverview(); });
}

function scoreOkArtist(artistName) {
  if (!calScoreFilter) return true;
  const plays = ARTIST_PLAYS[(artistName||'').toLowerCase()] || 0;
  return plays >= SCORE_ARTIST_MIN[calScoreFilter];
}
function scoreOkFest(f) {
  if (!calScoreFilter) return true;
  return (f.score || 0) >= SCORE_FEST_MIN[calScoreFilter];
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ GEO QUICK FILTER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
let geoNoUSA = true;   // default: hide US events
let geoNoCA  = false;
let geoNoGB  = false;

// Legacy compat ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â some restore paths still call setGeoQuick with old modes
let geoQuick = 'nousa'; // kept for state restore only
function setGeoQuick(mode) {
  // Convert legacy mode ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ new booleans
  geoNoUSA = (mode === 'nousa' || mode === 'nousacanada');
  geoNoCA  = (mode === 'nocanada' || mode === 'nousacanada');
  geoQuick = mode;
  _syncGeoButtons();
  renderCalendar(); _updateTally();
}

function toggleGeoExclude(cc) {
  if (cc === 'US') geoNoUSA = !geoNoUSA;
  if (cc === 'CA') geoNoCA  = !geoNoCA;
  if (cc === 'GB') geoNoGB  = !geoNoGB;
  _syncGeoButtons();
  _mapFirstFit = false;
  renderCalendar(); renderMap(); _updateTally();
}

function _syncGeoButtons() {
  const btnUS = document.getElementById('geoq-nousa');
  const btnCA = document.getElementById('geoq-noca');
  const btnGB = document.getElementById('geoq-nouk');
  if (btnUS) btnUS.classList.toggle('on', geoNoUSA);
  if (btnCA) btnCA.classList.toggle('on', geoNoCA);
  if (btnGB) btnGB.classList.toggle('on', geoNoGB);
  document.querySelectorAll('[data-gp]').forEach(btn =>
    btn.classList.toggle('on', btn.dataset.gp === geoPreset));
}

function geoPresetCodes(preset) {
  if (preset === 'eu') return new Set(regionCodes('eu'));
  if (preset === 'americas') return new Set([...regionCodes('na'), ...regionCodes('sa')]);
  if (preset === 'latam') return new Set([...regionCodes('sa'), 'MX']);
  if (preset === 'mx') return new Set(['MX']);
  if (preset === 'apac') return new Set([...regionCodes('as'), ...regionCodes('oc')]);
  if (preset === 'ukie') return new Set(['GB', 'IE']);
  return null;
}

function geoPresetOk(cc) {
  if (!cc || geoPreset === 'all') return true;
  const set = geoPresetCodes(geoPreset);
  return !set || set.has(cc);
}

function geoDisplayOk(cc) {
  return geoQuickOk(cc) && geoPresetOk(cc);
}

function setGeoPreset(preset) {
  geoPreset = preset;
  _syncGeoButtons();
  persistSettings();
  _mapFirstFit = false;
  renderCalendar();
  renderMap();
  _updateTally();
}

function _updateTally() {
  const el = document.getElementById('ev-tally');
  if (!el) return;
  const today = new Date().toISOString().split('T')[0];
  const con = visibleConcerts().filter(c => c.date >= today && geoDisplayOk(c.country||'') && scoreOkArtist(c.artist) && !isHidden(c.artist) && dateMatchesPreset(c.date));
  const fst = festivals.filter(f => f.date >= today && (f.score||0) > 0 && geoDisplayOk(f.country||'') && scoreOkFest(f) && dateMatchesPreset(f.date));
  const total = con.length + fst.length;
  el.textContent = total ? `${total} events` : '';
}

// Fast geo check using geoQuick ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â replaces calGeoFilter for the quick buttons
// Fast lookup: is a concert actually a festival appearance?
// Cross-references against the festivals[] array by date + proximity (< 2 km).
// Used in map popup to show correct ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª marker and festival name.
function _festForConcert(c) {
  if (!c || !c.date) return null;
  return festivals
    .filter(f => _festivalConcertBridge(f, c))
    .sort((a, b) => {
      const da = (a.lat != null && c.lat != null) ? geoDist(a.lat, a.lng, c.lat, c.lng) : 999;
      const db = (b.lat != null && c.lat != null) ? geoDist(b.lat, b.lng, c.lat, c.lng) : 999;
      return da - db || (a.date || '').localeCompare(b.date || '');
    })[0] || null;
}

function geoQuickOk(cc) {
  if (geoNoUSA && cc === 'US') return false;
  if (geoNoCA  && cc === 'CA') return false;
  if (geoNoGB  && cc === 'GB') return false;
  return true;
}

function expireHidden() {
  const now = Date.now();
  for (const a in hiddenArtists) if (hiddenArtists[a] !== 0 && hiddenArtists[a] < now) delete hiddenArtists[a];
}
function isHidden(a) { if (!(a in hiddenArtists)) return false; const u = hiddenArtists[a]; return u === 0 || Date.now() < u; }

function renderCalendar() {
  expireHidden();

  // Show score-filter row only when there's play count data
  const hasPlays = Object.values(ARTIST_PLAYS).some(v => v > 0);
  const scoreRow = document.getElementById('score-filter-row');
  if (scoreRow) scoreRow.style.display = hasPlays || festivals.some(f => f.score > 0) ? '' : 'none';

  // Delegate to Mexico view renderer
  if (calView === 'mx') { renderMxCalendar(); return; }

  // Combined filter: geoQuick + score
  const scoreFilterOk = (ev) => {
    if (!ev.artist) return scoreOkFest(ev);  // festival object
    return scoreOkArtist(ev.artist);
  };

  // calFilter still handles the old region chips if present; geoQuick is additive
  const geoOk = (ev) => geoDisplayOk(ev.country || '');

  const con = showShows ? dateFilter_(visibleConcerts()).filter(e => !isHidden(e.artist) && geoOk(e) && scoreFilterOk(e)) : [];
  const fst = showFests  ? dateFilter_(festivals).filter(e => geoOk(e) && (e.score||0) > 0 && scoreOkFest(e)) : [];

  // Hidden bar
  const hidList = Object.keys(hiddenArtists).filter(isHidden);
  const bar = document.getElementById('hidden-bar');
  if (hidList.length) {
    bar.style.display = 'flex';
    const frag = document.createDocumentFragment();
    const lbl = document.createElement('span');
    lbl.className = 'hidden-lbl'; lbl.textContent = 'Hidden';
    frag.appendChild(lbl);
    hidList.forEach(a => {
      const u = hiddenArtists[a];
      const lbl2 = u === 0 ? 'ÃƒÂ¢Ã‹â€ Ã…Â¾' : new Date(u).toLocaleDateString('en',{month:'short',day:'numeric'});
      const pill = document.createElement('span');
      pill.className = 'hidden-pill';
      pill.innerHTML = `${a} <span class="hidden-lbl" style="font-size:.5rem">${lbl2}</span>`;
      const x = document.createElement('span');
      x.className = 'hidden-pill-x'; x.textContent = 'ÃƒÆ’Ã¢â‚¬â€';
      x.onclick = () => restoreArtist(a);
      pill.appendChild(x);
      frag.appendChild(pill);
    });
    bar.innerHTML = '';
    bar.appendChild(frag);
  } else bar.style.display = 'none';

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Group concerts by date+venue (implicit festival detection) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // Key: date|venueSlug ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â groups with 3+ tracked artists = one venue-festival row
  const IMPLICIT_FEST_THRESHOLD = 3;
  const venueGroups = new Map(); // key ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ [{concert}]
  const venueKey = c => `${c.date}|${(c.venue||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,30)}|${(c.city||'').toLowerCase().slice(0,15)}`;

  for (const c of con) {
    const k = venueKey(c);
    if (!venueGroups.has(k)) venueGroups.set(k, []);
    venueGroups.get(k).push(c);
  }

  // Build display items: either single concert or a grouped venue-festival
  const displayItems = []; // {type:'concert'|'venue-fest', date, ...}
  const usedKeys = new Set();

  for (const c of con) {
    const k = venueKey(c);
    if (usedKeys.has(k)) continue;
    usedKeys.add(k);
    const group = venueGroups.get(k);
    if (group.length >= IMPLICIT_FEST_THRESHOLD && shouldGroupAsVenueFestival(group)) {
      // Grouped: sort by ARTISTS list order (or alpha), visible ones first
      const trackedSet = new Set(ARTISTS.map(a => a.toLowerCase()));
      const sorted = [...group].sort((a, b) => {
        const ia = ARTISTS.findIndex(x => x.toLowerCase() === a.artist.toLowerCase());
        const ib = ARTISTS.findIndex(x => x.toLowerCase() === b.artist.toLowerCase());
        return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
      });
      // Deduplicate by artist name (same artist can appear multiple times as featured)
      const seenNames = new Set();
      const dedupSorted = sorted.filter(a => {
        const k = a.artist.toLowerCase();
        if (seenNames.has(k)) return false;
        seenNames.add(k);
        return true;
      });
      displayItems.push({
        type: 'venue-fest',
        date: c.date, venue: c.venue, city: c.city, country: c.country, state: c.state,
        artists: dedupSorted,
        url: dedupSorted.find(x => x.url)?.url || null,
      });
    } else {
      group.forEach(cc => displayItems.push({ type: 'concert', ...cc }));
    }
  }

  // Add festivals
  fst.forEach(f => displayItems.push({ type: 'festival', _fest: true, ...f }));
  displayItems.sort((a, b) => a.date.localeCompare(b.date));

  const el = document.getElementById('ev-tally');
  if (el) el.textContent = (concerts.length || festivals.length) ? `${con.length} shows Ãƒâ€šÃ‚Â· ${fst.length} festivals` : '';

  const body = document.getElementById('cal-body');
  if (!displayItems.length) {
    if (concerts.length || festivals.length) {
      body.innerHTML = `<div class="empty"><div class="empty-icon">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â­</div><div class="empty-msg">No events match current filters.</div></div>`;
    } else if (window._scanActive) {
      // Scan running but no results yet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â show live scanning state instead of onboarding
      body.innerHTML = `<div class="empty"><div class="empty-icon" style="animation:breathe 1.5s ease-in-out infinite">ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â</div><div class="empty-msg">Scanning for concertsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦<br><span style="font-size:.62rem;color:var(--muted2)">Results will appear here as artists are checked.</span></div></div>`;
    } else {
      body.innerHTML = '';
      // No data at all ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â show the onboarding overlay
      showOnboard();
    }
    return;
  }

  const byMonth = {};
  for (const ev of displayItems) {
    const m = ev.date.slice(0,7);
    (byMonth[m] = byMonth[m] || []).push(ev);
  }

  // Precompute last-show dates per artist (only for tours with ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¥3 shows)
  const lastShowByArtist = {};
  for (const [artist, evs] of Object.entries(allTourData)) {
    if (evs.length >= 3) lastShowByArtist[artist.toLowerCase()] = evs[evs.length - 1].date;
  }

  const frag = document.createDocumentFragment();
  for (const [month, evs] of Object.entries(byMonth)) {
    const sep = document.createElement('div');
    sep.className = 'month-sep';
    sep.textContent = new Date(month+'-02').toLocaleString('en-US',{month:'long',year:'numeric'}).toUpperCase();
    frag.appendChild(sep);

    for (const ev of evs) {
      const d = ev.date.split('-');
      const dayname = new Date(ev.date+'T12:00:00').toLocaleString('en-US',{weekday:'short'}).toUpperCase();
      const loc = [ev.city, ev.state && ev.country==='US' ? ev.state : '', ev.country ? flag(ev.country) : ''].filter(Boolean).join(' ');

      const row = document.createElement('div');
      const dim = ev.type === 'concert' && isHidden(ev.artist);
      row.className = 'ev-row' + (dim ? ' faded' : '');

      const dayblock = document.createElement('div');
      dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;

      const main = document.createElement('div');
      main.className = 'ev-main';
      const actions = document.createElement('div');
      actions.className = 'ev-actions';

      if (ev.type === 'venue-fest') {
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Implicit festival row (multi-artist same venue/date) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        row.classList.add('ev-implicit-fest');

        const nameEl = document.createElement('div');
        nameEl.className = 'ev-name' + (ev.url ? ' tkt' : '');
        nameEl.textContent = ev.venue || 'Multi-artist show';
        if (ev.url) nameEl.onclick = () => window.open(ev.url, '_blank');

        const badgeWrap = document.createElement('span');
        const festBadge = document.createElement('span');
        festBadge.className = 'fest-badge'; festBadge.textContent = 'Festival';
        const cntBadge = document.createElement('span');
        cntBadge.className = 'fest-badge';
        cntBadge.style.cssText = 'background:rgba(255,170,60,.15);border-color:rgba(255,170,60,.5);color:#ffaa3c';
        cntBadge.textContent = `&#9733; ${ev.artists.length}`;
        badgeWrap.appendChild(festBadge);
        badgeWrap.appendChild(cntBadge);
        nameEl.appendChild(badgeWrap);

        const sub = document.createElement('div');
        sub.className = 'ev-sub';
        sub.innerHTML = `<strong>${ev.venue}</strong>${loc ? ' Ãƒâ€šÃ‚Â· '+loc : ''}`;

        const chipsEl = document.createElement('div');
        chipsEl.className = 'ev-artists';
        const trackedSet = new Set(ARTISTS.map(a => a.toLowerCase()));
        const seenArtists = new Set();

        ev.artists.forEach(cc => {
          const key = cc.artist.toLowerCase();
          if (seenArtists.has(key)) return;
          seenArtists.add(key);
          const isMine = trackedSet.has(key);
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip' + (isMine ? ' mine' : '');
          if (isMine) {
            const dot = document.createElement('span');
            dot.className = 'chip-dot';
            dot.style.background = getColor(cc.artist);
            chip.appendChild(dot);
            const plays = ARTIST_PLAYS[key] || 0;
            if (plays > 0) {
              const pl = document.createElement('span');
              pl.style.cssText = 'opacity:.55;font-size:.8em;margin-left:2px';
              pl.textContent = plays;
              chip.appendChild(document.createTextNode(cc.artist));
              chip.appendChild(pl);
            } else {
              chip.appendChild(document.createTextNode(cc.artist));
            }
          } else {
            chip.appendChild(document.createTextNode(cc.artist));
          }
          chip.style.cursor = 'pointer';
          chip.onclick = () => { focusArtist(cc.artist); setTab('tours'); };
          chipsEl.appendChild(chip);
        });

        main.appendChild(nameEl); main.appendChild(sub); main.appendChild(chipsEl);

      } else if (ev.type === 'festival') {
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Known festival from Ticketmaster ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        const nameEl = document.createElement('div');
        nameEl.className = 'ev-name' + (ev.url ? ' tkt' : '');
        nameEl.textContent = ev.name;
        const badge = document.createElement('span');
        badge.className = 'fest-badge'; badge.textContent = 'Festival';
        nameEl.appendChild(badge);
        if (ev.url) nameEl.onclick = () => window.open(ev.url, '_blank');
        const sub = document.createElement('div');
        sub.className = 'ev-sub';
        const dateStr = fmtDateRange(ev._fest ? ev : {date:ev.date, endDate:ev.endDate});
        sub.innerHTML = `<strong>${ev.venue||''}</strong>${loc ? ' Ãƒâ€šÃ‚Â· '+loc : ''}${ev.endDate ? ' Ãƒâ€šÃ‚Â· '+dateStr : ''}`;
        main.appendChild(nameEl); main.appendChild(sub);

        // Show matched artists (what triggered this festival to appear)
        const matched = ev.matched || [];
        if (matched.length) {
          const chipsEl = document.createElement('div');
          chipsEl.className = 'ev-artists';
          matched.slice(0, 6).forEach(m => {
            const chip = document.createElement('span');
            chip.className = 'ev-artist-chip mine';
            const dot = document.createElement('span');
            dot.className = 'chip-dot';
            dot.style.background = getColor(m.artist);
            chip.appendChild(dot);
            const plays = m.plays || 0;
            chip.appendChild(document.createTextNode(m.artist));
            if (plays > 0) {
              const pl = document.createElement('span');
              pl.style.cssText = 'opacity:.5;font-size:.5rem;margin-left:2px';
              pl.textContent = plays;
              chip.appendChild(pl);
            }
            chip.onclick = () => focusArtist(m.artist);
            chipsEl.appendChild(chip);
          });
          if (matched.length > 6) {
            const more = document.createElement('span');
            more.className = 'ev-artist-chip ev-more-chip';
            more.textContent = `+${matched.length - 6} more`;
            more.title = 'Click to show all';
            more.onclick = () => {
              // Replace this chip with the remaining artists
              more.remove();
              matched.slice(6).forEach(m => {
                const chip = document.createElement('span');
                chip.className = 'ev-artist-chip mine';
                const dot = document.createElement('span');
                dot.className = 'chip-dot';
                dot.style.background = getColor(m.artist);
                chip.appendChild(dot);
                chip.appendChild(document.createTextNode(m.artist));
                const plays = m.plays || 0;
                if (plays > 0) {
                  const pl = document.createElement('span');
                  pl.style.cssText = 'opacity:.5;font-size:.5rem;margin-left:2px';
                  pl.textContent = plays;
                  chip.appendChild(pl);
                }
                chip.onclick = () => focusArtist(m.artist);
                chipsEl.appendChild(chip);
              });
            };
            chipsEl.appendChild(more);
          }
          main.appendChild(chipsEl);
        }

      } else {
        // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Single concert ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
        const nameEl = document.createElement('div');
        nameEl.className = 'ev-name';
        nameEl.textContent = ev.artist;
        // Click artist name ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ open their tour in focus mode
        nameEl.style.cursor = 'pointer';
        nameEl.onclick = () => { focusArtist(ev.artist); setTab('tours'); };

        // LAST SHOW badge: is this the final known date for this artist's tour?
        const artistKey = (ev.artist || '').toLowerCase();
        if (lastShowByArtist[artistKey] && ev.date === lastShowByArtist[artistKey]) {
          const badge = document.createElement('span');
          badge.style.cssText = 'font-size:.44rem;padding:1px 6px;border-radius:100px;border:1px solid #ff8080;color:#ff8080;background:rgba(255,80,80,.07);margin-left:6px;vertical-align:middle;letter-spacing:.04em';
          badge.textContent = 'LAST SHOW';
          nameEl.appendChild(badge);
        }

        const sub = document.createElement('div');
        sub.className = 'ev-sub';
        if (ev.url && ev.venue) {
          const vLink = document.createElement('strong');
          vLink.textContent = ev.venue;
          vLink.style.cssText = 'cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;';
          vLink.title = 'Open ticket page';
          vLink.onclick = (e) => { e.stopPropagation(); window.open(ev.url, '_blank'); };
          sub.appendChild(vLink);
          if (loc) sub.appendChild(document.createTextNode(' Ãƒâ€šÃ‚Â· ' + loc));
        } else {
          sub.innerHTML = `<strong>${ev.venue}</strong>${loc ? ' Ãƒâ€šÃ‚Â· '+loc : ''}`;
        }
        main.appendChild(nameEl); main.appendChild(sub);

        const fest = _festForConcert(ev);
        const metaRow = document.createElement('div');
        metaRow.className = 'ev-artists';
        const artistTourCount = (allTourData[ev.artist] || []).filter(x => x.date >= today).length;
        if (fest) {
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip mine';
          chip.textContent = `Festival Ãƒâ€šÃ‚Â· ${fest.name}`;
          chip.onclick = e => { e.stopPropagation(); openFestDetail(fest.id); };
          metaRow.appendChild(chip);
        }
        if (artistTourCount > 1) {
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip';
          chip.textContent = `${artistTourCount} tour dates`;
          metaRow.appendChild(chip);
        }
        if (ev.eventName && _normText(ev.eventName) !== _normText(ev.artist)) {
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip';
          chip.textContent = ev.eventName;
          metaRow.appendChild(chip);
        }
        if (metaRow.childNodes.length) main.appendChild(metaRow);

        // Row click ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ open concert card drawer
        row.style.cursor = 'pointer';
        row.onclick = (e) => {
          if (e.target.closest('.hide-btn,.ev-name,.ev-sub strong')) return;
          openConcertDrawer(ev);
        };

        const btn = document.createElement('button');
        btn.className = 'hide-btn' + (dim ? ' rst' : '');
        btn.textContent = dim ? 'Restore' : 'Hide';
        btn.onclick = dim ? () => restoreArtist(ev.artist) : () => openSnooze(ev.artist);
        actions.appendChild(btn);
      }

      row.appendChild(dayblock); row.appendChild(main); row.appendChild(actions);
      frag.appendChild(row);
    }
  }
  body.innerHTML = '';
  body.appendChild(frag);
  _updateTally();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SNOOZE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function openSnooze(artist) {
  snoozeTarget = artist;
  document.getElementById('snooze-sub').textContent = `Hide upcoming events for "${artist}"`;
  document.getElementById('snooze-bg').classList.remove('off');
}
function closeSnooze() { document.getElementById('snooze-bg').classList.add('off'); snoozeTarget = ''; }
function doSnooze(days) {
  if (!snoozeTarget) return;
  hiddenArtists[snoozeTarget] = days === 0 ? 0 : Date.now() + days * 86400000;
  persistSettings(); closeSnooze(); renderCalendar();
}
function restoreArtist(artist) { delete hiddenArtists[artist]; persistSettings(); renderCalendar(); }

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// MAP
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
function getColor(artist) {
  if (!artistColors[artist]) artistColors[artist] = ARTIST_COLORS[colorIdx++ % ARTIST_COLORS.length];
  return artistColors[artist];
}

function initMap() {
  if (lmap) return;
  // Show floating tab buttons since sidebar starts collapsed
  const floatTabs = document.getElementById('sidebar-open-tabs');
  if (floatTabs) { floatTabs.style.opacity = '1'; floatTabs.style.pointerEvents = 'auto'; }
  // Start at a reasonable zoom/center ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â renderOverview will immediately fitBounds to
  // actual data on first render, so this is just a placeholder while tiles load.
  // minZoom:2 + worldCopyJump:true prevents the "world repeats 3 times" artifact.
  lmap = L.map('map', {
    zoomControl: false,
    minZoom: 2,
    worldCopyJump: true,
  }).setView([30, 10], 3);
  L.control.zoom({ position:'bottomright' }).addTo(lmap);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:'Ãƒâ€šÃ‚Â© OpenStreetMap Ãƒâ€šÃ‚Â© CARTO', subdomains:'abcd', maxZoom:19
  }).addTo(lmap);

  // Zoom-responsive re-render (overview only, not focus mode)
  let _zRenderTimer = null;
  lmap.on('zoomend', () => {
    // Always clear any pending timer first ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â even in focus mode.
    // If we return early without clearing, a prior-queued timer would
    // fire 180ms later and destroy focus mode with renderOverview().
    clearTimeout(_zRenderTimer);
    if (focusedArtist || focusedFest) return;
    _zRenderTimer = setTimeout(() => {
      if (focusedArtist || focusedFest) return; // user may have entered focus during debounce
      try { clearMapLayers(); renderOverview(); }
      catch(e) { console.error('[zoomend render]', e); }
    }, 180);
  });
  // Pan: don't re-render markers, just update the visible list
  let _moveTimer = null;
  lmap.on('moveend', () => {
    clearTimeout(_moveTimer);
    _moveTimer = setTimeout(updateVisiblePanel, 150);
  });
}

function clearMapLayers() {
  tourMarkers.forEach(m => m.remove()); tourMarkers = [];
  festMarkers.forEach(m => m.remove()); festMarkers = [];
  routeLines.forEach(l => l.remove()); routeLines = [];
}

function toggleLayer(type) {
  // Update mapTypeFilter to match toggle state, then re-render
  if (type === 't') {
    showMapTours = !showMapTours;
    if (!showMapTours && !showMapFests) { showMapFests = true; } // at least one must be on
    document.getElementById('lt-t').classList.toggle('on-t', showMapTours);
  } else {
    showMapFests = !showMapFests;
    if (!showMapTours && !showMapFests) { showMapTours = true; }
    document.getElementById('lt-f').classList.toggle('on-f', showMapFests);
  }
  mapTypeFilter = (showMapTours && showMapFests) ? 'both' : showMapTours ? 'tours' : 'fests';
  // Sync the filter bar chips
  ['both','tours','fests'].forEach(v => {
    const btn = document.getElementById('mft-' + v);
    if (!btn) return;
    btn.classList.remove('on', 'on-f');
    if (v === mapTypeFilter) btn.classList.add(v === 'fests' ? 'on-f' : 'on');
  });
  clearMapLayers(); renderOverview();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ VISIBLE-NOW PANEL ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Shows which artists/fests have a marker currently in the map viewport.
// Rebuilds on every renderOverview call and on zoomend/moveend.

let _visiblePanelOpen = false;

function toggleVisiblePanel() {
  _visiblePanelOpen = !_visiblePanelOpen;
  const panel = document.getElementById('msb-visible');
  if (panel) panel.classList.toggle('open', _visiblePanelOpen);
  const dateRow = document.getElementById('msb-date-row');
  if (dateRow) dateRow.style.display = _visiblePanelOpen ? 'flex' : 'none';
  if (_visiblePanelOpen) updateVisiblePanel();
}

function updateVisiblePanel() {
  const panel  = document.getElementById('msb-visible');
  const list   = document.getElementById('msb-visible-list');
  const badge  = document.getElementById('msb-visible-count');
  if (!panel || !list || !badge || !lmap) return;

  const bounds = lmap.getBounds();
  const today  = new Date().toISOString().split('T')[0];
  const in7    = dateOffset(7);
  const in30   = dateOffset(30);

  // Collect visible tours ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â apply ALL active map filters (geo, score, date, hidden)
  const visibleTours = [];
  if (mapTypeFilter !== 'fests') {
    for (const [artist, evs] of Object.entries(allTourData)) {
      if (isHidden(artist)) continue;
      if (!mapScoreOkArtist(artist)) continue;
      const next = evs.find(e =>
        e.date >= today && e.lat && e.lng &&
        geoDisplayOk(e.country || '') &&
        mapDateOk(e.date) &&
        bounds.contains([e.lat, e.lng])
      );
      if (next) {
        visibleTours.push({ type: 'tour', artist, ev: next,
          urgency: next.date <= in7 ? 'urgent' : next.date <= in30 ? 'soon' : 'far' });
      }
    }
  }
  // Sort: urgent first, then soon, then far; within tier by rank
  const urgOrder = { urgent:0, soon:1, far:2 };
  visibleTours.sort((a, b) =>
    (urgOrder[a.urgency] - urgOrder[b.urgency]) ||
    (_rankScore(b.artist) - _rankScore(a.artist)));

  // Collect visible festivals
  const visibleFests = [];
  if (mapTypeFilter !== 'tours') {
    for (const f of festivals) {
      if (f.date >= today && f.lat && f.lng
          && geoDisplayOk(f.country || '') && mapDateOk(f.date) && mapScoreOkFest(f)
          && bounds.contains([f.lat, f.lng])) {
        visibleFests.push(f);
      }
    }
    visibleFests.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  const total = visibleTours.length + visibleFests.length;
  badge.textContent = total;

  // Show panel when we have tours data
  panel.style.display = total > 0 || Object.keys(allTourData).length > 0 ? '' : 'none';

  if (!_visiblePanelOpen) { list.innerHTML = ''; return; }

  if (!total) {
    list.innerHTML = '<div class="msb-vis-empty">Nothing in this area ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â zoom out or pan</div>';
    return;
  }

  const frag = document.createDocumentFragment();

  // Tours (only when map shows tours)
  if (mapTypeFilter !== 'fests') {
    visibleTours.forEach(({ artist, ev, urgency }) => {
    const row = document.createElement('div');
    row.className = 'msb-vis-row';
    const col = getColor(artist);

    const dot = document.createElement('div');
    dot.className = 'msb-vis-dot';
    dot.style.background = col;
    dot.style.boxShadow = urgency === 'urgent' ? `0 0 5px ${col}` : '';

    const name = document.createElement('div');
    name.className = 'msb-vis-name';
    name.title = artist;
    name.textContent = artist;

    const date = document.createElement('div');
    date.className = 'msb-vis-date';
    date.textContent = fmtDate(ev.date);
    if (urgency === 'urgent') date.style.color = '#ff9060';
    else if (urgency === 'soon') date.style.color = 'var(--accent)';

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(date);

    // Click ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ focus this artist
    row.onclick = () => { focusArtist(artist); };
    frag.appendChild(row);
  });
  } // end if (mapTypeFilter !== 'fests')

  // Festivals
  visibleFests.forEach(f => {
    const row = document.createElement('div');
    row.className = 'msb-vis-row';

    const dot = document.createElement('div');
    dot.className = 'msb-vis-dot';
    dot.style.background = 'var(--fest)';
    dot.style.borderRadius = '2px'; // diamond-ish

    const name = document.createElement('div');
    name.className = 'msb-vis-name';
    name.title = f.name;
    name.textContent = f.name;

    const lbl = document.createElement('div');
    lbl.className = 'msb-vis-fest';
    lbl.textContent = fmtDate(f.date);

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(lbl);
    row.onclick = () => { setTab('fests'); };
    frag.appendChild(row);
  });

  list.innerHTML = '';
  list.appendChild(frag);
}

function renderMap() {
  initMap();
  clearMapLayers();
  const today = new Date().toISOString().split('T')[0];
  allTourData = {};
  // Apply map-local filters: type, score, date window
  const skipTours = mapTypeFilter === 'fests';
  for (const c of visibleConcerts()) {
    if (skipTours) continue; // tours excluded when fests-only mode
    if (c.date < today || isHidden(c.artist)) continue;
    if (!geoDisplayOk(c.country || '')) continue;
    if (!mapDateOk(c.date)) continue;
    if (!mapScoreOkArtist(c.artist)) continue;
    (allTourData[c.artist] = allTourData[c.artist] || []).push(c);
  }
  for (const a in allTourData) { allTourData[a].sort((a,b) => a.date.localeCompare(b.date)); getColor(a); }
  buildSidebar();
  // If an artist was already focused, keep focus mode ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â don't reset to overview.
  // renderFocusMode handles the case where allTourData[focusedArtist] is missing
  // (case-insensitive fallback + rebuild guard are inside renderFocusMode itself).
  if (focusedArtist) renderFocusMode(focusedArtist);
  else renderOverview();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MAP SIDEBAR TOGGLE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function toggleMapSidebar(tab) {
  const sidebar = document.getElementById('map-sidebar');
  const tabs = document.getElementById('sidebar-open-tabs');
  const collapsed = sidebar.classList.contains('collapsed');
  if (collapsed || tab) {
    sidebar.classList.remove('collapsed');
    if (tabs) { tabs.style.opacity = '0'; tabs.style.pointerEvents = 'none'; }
    if (tab) setTab(tab);
  } else {
    sidebar.classList.add('collapsed');
    if (tabs) { tabs.style.opacity = '1'; tabs.style.pointerEvents = 'auto'; }
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ CONCERT CARD DRAWER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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
              <div class="cdr-tour-sub">${esc2(stop.venue || '')}${stop.country ? ` Ãƒâ€šÃ‚Â· ${flag(stop.country)}` : ''}</div>
            </div>`;
        }).join('')}
      </div>
    </div>` : '';
  const festCard = fest ? `
    <div class="cdr-fest-card">
      <div class="cdr-fest-head">
        <div>
          <div class="cdr-fest-name">${esc2(fest.name)}</div>
          <div class="cdr-fest-meta">${esc2(fmtDateRange(fest))}${fest.city ? ` Ãƒâ€šÃ‚Â· ${esc2(fest.city)}` : ''}${fest.country ? ` ${flag(fest.country)}` : ''}</div>
        </div>
        <div class="cdr-fest-match">${fest.score || 0}</div>
      </div>
      <div class="cdr-mini-note">
        ${festTracked.length ? `${festTracked.length} tracked artist${festTracked.length > 1 ? 's' : ''}` : 'No tracked lineup hits yet'}
        ${festLineup.length ? ` Ãƒâ€šÃ‚Â· lineup ${festLineup.length}` : ''}
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
    <div class="cdr-mini-note">${upcomingShows[0] ? `Next stop: ${esc2(fmtDate(upcomingShows[0].date))} Ãƒâ€šÃ‚Â· ${esc2(upcomingShows[0].city || upcomingShows[0].venue || '')}` : 'No more upcoming dates in current dataset'}</div>
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

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. Photo from Deezer (no key needed) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  try {
    const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}&limit=1`);
    const data = await res.json();
    const deezerArtist = data.data?.[0];
    if (deezerArtist?.picture_xl) {
      const img = document.createElement('img');
      img.src = deezerArtist.picture_xl;
      img.className = 'cdr-artist-photo';
      img.onerror = () => img.remove();
      artistPanel.insertBefore(img, artistPanel.firstChild);
    }
  } catch(e) { /* photo non-critical */ }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. Top tracks from Spotify (client credentials, no OAuth) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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
              onclick="window.open('${t.external_urls?.spotify || '#'}','_blank');event.stopPropagation()">ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶</div>
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


// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SIDEBAR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function setTab(tab) {
  sidebarTab = tab;
  document.getElementById('tab-tours').className   = 'msb-tab' + (tab === 'tours'  ? ' t-on' : '');
  document.getElementById('tab-fests').className   = 'msb-tab' + (tab === 'fests'  ? ' f-on' : '');
  document.getElementById('tab-match').className   = 'msb-tab' + (tab === 'match'  ? ' m-on' : '');
  document.getElementById('tab-errors').className  = 'msb-tab' + (tab === 'errors' ? ' e-on' : '') +
    (Object.keys(fetchErrors).length ? '' : ''); // keep visible/hidden via display:none in updateErrorTab
  document.getElementById('tab-honest').className  = 'msb-tab' + (tab === 'honest' ? ' h-on' : '');
  document.getElementById('pane-tours').classList.toggle('on',   tab === 'tours');
  document.getElementById('pane-fests').classList.toggle('on',   tab === 'fests');
  document.getElementById('pane-match').classList.toggle('on',   tab === 'match');
  document.getElementById('pane-errors').classList.toggle('on',  tab === 'errors');
  document.getElementById('pane-honest').classList.toggle('on',  tab === 'honest');
  document.getElementById('map-sidebar').classList.toggle('fests-mode', tab === 'fests');

  { const _lt = document.getElementById('lt-t'); if (_lt) _lt.style.display = (tab === 'fests' || tab === 'match') ? 'none' : ''; }
  { const _lf = document.getElementById('lt-f'); if (_lf) _lf.style.display = (tab === 'fests' || tab === 'match') ? 'none' : ''; }

  if (tab === 'honest') {
    // Ensure sidebar is open
    const sidebar = document.getElementById('map-sidebar');
    const floatTabs = document.getElementById('sidebar-open-tabs');
    if (sidebar?.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
      if (floatTabs) { floatTabs.style.opacity = '0'; floatTabs.style.pointerEvents = 'none'; }
    }
    buildHonestyPane(); return;
  }
  if (tab === 'errors') { updateErrorTab(); return; }  // just refresh error list, don't touch map
  if (tab === 'match') {
    focusedArtist = null;
    { const _fo1 = document.getElementById('focus-overlay'); if (_fo1) _fo1.style.display = 'none'; }
    { const _mr1 = document.getElementById('map-reset'); if (_mr1) _mr1.style.display = 'none'; }
    if (matchHerMap && Object.keys(matchHerMap).length) renderMatchMap();
    else { clearMapLayers(); lmap && lmap.flyTo && lmap.flyTo([30, 10], 2, { duration:1 }); }
    return;
  }
  if (tab === 'fests') {
    focusedArtist = null; focusedFest = null;
    { const _fo2 = document.getElementById('focus-overlay'); if (_fo2) _fo2.style.display = 'none'; }
    { const _mr2 = document.getElementById('map-reset'); if (_mr2) _mr2.style.display = 'none'; }
    const leg = document.getElementById('map-legend');
    if (leg) leg.style.opacity = '0';
    // Sync map type to Fests if it was Tours-only
    if (mapTypeFilter === 'tours') {
      mapTypeFilter = 'both'; showMapTours = true; showMapFests = true;
      ['both','tours','fests'].forEach(v => {
        const b = document.getElementById('mft-'+v);
        if (b) { b.classList.remove('on','on-f'); if (v==='both') b.classList.add('on'); }
      });
    }
    clearMapLayers();
    renderFestMap(null);
  } else {
    const leg = document.getElementById('map-legend');
    if (leg) leg.style.opacity = '1';
    // Sync map type to Tours if it was Fests-only
    if (mapTypeFilter === 'fests') {
      mapTypeFilter = 'both'; showMapTours = true; showMapFests = true;
      ['both','tours','fests'].forEach(v => {
        const b = document.getElementById('mft-'+v);
        if (b) { b.classList.remove('on','on-f'); if (v==='both') b.classList.add('on'); }
      });
    }
    clearMapLayers();
    _rebuildMapData();
    if (focusedArtist && allTourData[focusedArtist]) renderFocusMode(focusedArtist);
    else renderOverview();
  }
}

function toggleUnrankedFests(checked) {
  showUnrankedFests = checked;
  buildFestPanel();
}

function setFestSort(s) {
  festSort = s;
  document.getElementById('fsort-score').classList.toggle('on', s === 'score');
  document.getElementById('fsort-date').classList.toggle('on', s === 'date');
  buildFestPanel();
}

function setArtistSort(s) {
  artistSort = s;
  document.getElementById('asort-list').classList.toggle('on', s === 'list');
  document.getElementById('asort-alpha').classList.toggle('on', s === 'alpha');
  document.getElementById('asort-shows').classList.toggle('on', s === 'shows');
  persistSettings();
  buildSidebar();
}

function setArtistPreset(preset) {
  artistPreset = preset;
  document.querySelectorAll('[data-ap]').forEach(btn =>
    btn.classList.toggle('on', btn.dataset.ap === preset));
  persistSettings();
  buildSidebar();
}

function applyArtistPreset(list) {
  if (artistPreset === 'all') return list;
  const today = new Date().toISOString().split('T')[0];
  if (artistPreset === 'fav') {
    return list.filter(artist => favoriteArtists.has((artist || '').toLowerCase()));
  }
  if (artistPreset === 'dense') {
    return list.filter(artist => (allTourData[artist] || []).length >= 3);
  }
  if (artistPreset === 'soon') {
    const soon = dateOffset(30);
    return list.filter(artist => (allTourData[artist] || []).some(ev => ev.date >= today && ev.date <= soon));
  }
  if (artistPreset === 'ending') {
    const endWindow = dateOffset(90);
    return list.filter(artist => {
      const evs = allTourData[artist] || [];
      const last = evs[evs.length - 1]?.date || '';
      return evs.length >= 3 && last >= today && last <= endWindow;
    });
  }
  if (artistPreset === 'top') {
    const ranked = [...list].sort((a, b) => _rankScore(b) - _rankScore(a));
    const keep = new Set(ranked.slice(0, Math.min(20, Math.max(8, Math.ceil(ranked.length * 0.3)))));
    return list.filter(artist => keep.has(artist));
  }
  return list;
}

function sortedArtists() {
  const keys = Object.keys(allTourData);
  if (artistSort === 'alpha') {
    return keys.sort((a, b) => a.localeCompare(b));
  }
  if (artistSort === 'shows') {
    return keys.sort((a, b) => allTourData[b].length - allTourData[a].length || a.localeCompare(b));
  }
  // 'list' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â sort by plays desc (if plays data exists), then by textarea line order
  const hasPlays = Object.values(ARTIST_PLAYS).some(v => v > 0);
  const lineIdx  = Object.fromEntries(ARTISTS.map((a, i) => [a.toLowerCase(), i]));
  return keys.sort((a, b) => {
    if (hasPlays) {
      const pa = ARTIST_PLAYS[a.toLowerCase()] || 0;
      const pb = ARTIST_PLAYS[b.toLowerCase()] || 0;
      if (pa !== pb) return pb - pa; // more plays = higher
    }
    // Tie-break: preserve textarea order
    const ia = lineIdx[a.toLowerCase()] ?? Infinity;
    const ib = lineIdx[b.toLowerCase()] ?? Infinity;
    return ia !== ib ? ia - ib : a.localeCompare(b);
  });
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// MATCH ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â find shared artists between two playlists
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

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
  if (!pid) { matchSetStatus('ÃƒÂ¢Ã…Â¡Ã‚Â  Paste a valid Spotify playlist URL', 'err'); return; }
  if (!ARTISTS.length) { matchSetStatus('ÃƒÂ¢Ã…Â¡Ã‚Â  Load your playlist first (Settings ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Import)', 'err'); return; }

  const btn = document.getElementById('match-btn');
  btn.disabled = true; btn.textContent = 'LoadingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦';
  matchSetStatus('AuthenticatingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦');
  matchSetProgress(0, 0);

  try {
    const token = await spGetToken();
    matchSetStatus('Fetching her playlistÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦');

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
    matchSetStatus(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ "${playlist.name}" Ãƒâ€šÃ‚Â· ${matchShared.length} shared artists`, 'ok');
    buildMatchPane();
    renderMatchMap();

  } catch(e) {
    matchClearProgress();
    matchSetStatus('ÃƒÂ¢Ã…Â¡Ã‚Â  ' + (e.message || 'Something went wrong'), 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Match';
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
    matchSetStatus(`"${playlist.name}" Ãƒâ€šÃ‚Â· ${matchShared.length} shared artists`, 'ok');
    buildMatchPane();
    renderMatchMap();
  } catch (e) {
    matchClearProgress();
    if (e.status === 401 && SERVER_MANAGED_SPOTIFY_LOGIN) {
      setSpotifyAuthFlash('Connect Spotify to open private or collaborative playlists.', 'error');
      renderOnboardSpotifyAuth();
    }
    matchSetStatus('ÃƒÂ¢Ã…Â¡Ã‚Â  ' + (e.message || 'Something went wrong'), 'err');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Match';
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

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Shared concerts section ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const concertHd = document.createElement('div');
  concertHd.className = 'match-section-hd';
  const sharedWithShows = matchShared.filter(s => allTourData[s.name]);
  concertHd.innerHTML = `<span>ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¸ Shared artists on tour</span><span class="match-section-cnt purple">${sharedWithShows.length}</span>`;
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
          <span class="match-plays-me" title="Your plays">${s.myCount > 0 ? 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ '+s.myCount : 'Ãƒâ€šÃ‚Â·'}</span>
          <span class="match-plays-her" title="Her plays">ÃƒÂ¢Ã¢â€žÂ¢Ã‚Â¡ ${s.herCount}</span>
        </div>`;
      row.onclick = () => {
        // Switch to tours tab and focus this artist
        setTab('tours');
        focusArtist(s.name);
      };
      frag.appendChild(row);
    });
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Festival ranking section ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const festHd = document.createElement('div');
  festHd.className = 'match-section-hd';
  festHd.style.marginTop = '4px';

  // Score festivals by combined taste
  const scoredFests = matchScoreFestivals();
  const topFests = scoredFests.filter(f => f.matchScore > 0).slice(0, 30);
  festHd.innerHTML = `<span>ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª Festivals for both of you</span><span class="match-section-cnt purple">${topFests.length}</span>`;
  frag.appendChild(festHd);

  if (!topFests.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px 14px;font-size:.6rem;color:var(--muted2)';
    empty.textContent = 'No festivals scored ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â scan data first.';
    frag.appendChild(empty);
  } else {
    const maxScore = topFests[0].matchScore || 1;
    topFests.forEach(f => {
      const scoreNorm = Math.round((f.matchScore / maxScore) * 100);
      const card = document.createElement('div');
      card.className = 'match-fcard';
      const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
      const myChips  = f.matchedMe.slice(0,3).map(m => `<span class="match-chip-me" title="Your list">ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ ${m}</span>`).join('');
      const herChips = f.matchedHer.slice(0,3).map(m => `<span class="match-chip-her" title="Her list">ÃƒÂ¢Ã¢â€žÂ¢Ã‚Â¡ ${m}</span>`).join('');
      const sharedChips = f.matchedShared.slice(0,4).map(m => `<span class="match-chip-shared">ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦ ${m}</span>`).join('');
      const extra = (f.matchedShared.length + f.matchedMe.length + f.matchedHer.length) > 7
        ? `<span class="match-chip-shared" style="opacity:.5">+${f.matchedShared.length + f.matchedMe.length + f.matchedHer.length - 7}</span>` : '';
      card.innerHTML = `
        <div class="match-fcard-top">
          <div class="match-fcard-ring">${scoreNorm}</div>
          <div class="match-fcard-info">
            <div class="match-fcard-name">${f.name}</div>
            <div class="match-fcard-meta">${fmtDate(f.date)} Ãƒâ€šÃ‚Â· ${loc}</div>
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
  // Weight function ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â same tier system as scoreFestivals
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
        <strong>${s.name}</strong><br>${fmtDate(ev.date)}<br>${ev.venue || ''}${ev.city ? ' Ãƒâ€šÃ‚Â· '+ev.city : ''}
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

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ HONESTY PANE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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
    ? 'Worldwide ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no country filter on API calls'
    : countryMode === 'include' && includeCountries.size > 1
      ? `ÃƒÂ¢Ã…Â¡Ã‚Â  Include-mode with ${includeCountries.size} countries ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TM API only accepts 1 countryCode, so no server-side geo filter is active. All results fetched, filtered client-side. <strong>Slow + uses more quota.</strong>`
      : countryMode === 'include' && includeCountries.size === 1
        ? `1 country set ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â server-side filter active (fast)`
        : `Exclude mode ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no server-side filter, client-side only`;

  el.innerHTML = `
<div class="honest-h1">ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Fixed / shipped</div>

${item('FIXED', 'htag-fix', '<strong>attractionId fetch:</strong> Resolve each artist\'s TM <code>attractionId</code> first ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ query by ID, not keyword. Up to 1000 shows (5ÃƒÆ’Ã¢â‚¬â€200), no keyword noise. Keyword fallback retained for artists not in TM.')}
${item('FIXED', 'htag-fix', '<strong>Diacritic matching:</strong> "SÃƒÆ’Ã‚Â­loÃƒÆ’Ã‚Â©" finds "Siloe", "Arda BogotÃƒÆ’Ã‚Â¡" finds "Arda Bogota". Two-pass: exact name ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ diacritic-normalized ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ASCII fallback API request.')}
${item('FIXED', 'htag-fix', '<strong>Hi-Fi / substring false matches:</strong> Attraction name match now requires artist to appear at start or after a bill separator (ÃƒÆ’Ã¢â‚¬â€, &, +). "Mungos Hi Fi" no longer matches "Hi-Fi".')}
${item('FIXED', 'htag-fix', '<strong>Duplicate shows:</strong> Three-pass dedup ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â venue key, city+country, and city+country+date across sources. Catches TM + BIT returning same show independently.')}
${item('FIXED', 'htag-fix', '<strong>Multi-day festival date ranges:</strong> "Jun 26ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“28, 2026" or "Jun 30ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Jul 2, 2026" displayed on all cards. endDate preserved through deduplication.')}
${item('FIXED', 'htag-fix', '<strong>Festival map labels with collision avoidance:</strong> Labels sorted by score (high priority first), each tries 6 positions; lowest-score label hides when all overlap. Recalculates on zoom so hidden labels can reappear.')}
${item('FIXED', 'htag-fix', '<strong>No USA / No CA / No UK geo filters:</strong> Applied to calendar, map markers, route lines, festival labels, and ON SCREEN panel simultaneously.')}
${item('FIXED', 'htag-fix', '<strong>Map sidebar collapsed by default:</strong> Floating tab buttons show on map edge. Clicking Tours/Fests/Match opens sidebar to the right tab.')}
${item('FIXED', 'htag-fix', '<strong>ON SCREEN panel respects all active filters:</strong> Geo, score, date, hidden artists ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â list matches exactly what\'s on the map.')}
${item('FIXED', 'htag-fix', '<strong>Concert card drawer:</strong> Click any concert row ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bottom sheet with full concert info + artist photo (Deezer), top 8 Spotify tracks with real global popularity score (0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“100), Spotify link. Uses existing Spotify Client Credentials ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no extra OAuth needed.')}
${item('FIXED', 'htag-fix', '<strong>Map type ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Â sidebar tab sync:</strong> Selecting "Fests" on map switches sidebar to Festivals tab (and vice versa). No more showing concert list while fests-only map is active.')}
${item('FIXED', 'htag-fix', '<strong>Festival ticket links:</strong> When an artist\'s map marker is a festival appearance, "Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢" links to the festival page, not the individual concert listing.')}
${item('FIXED', 'htag-fix', '<strong>Stats bar, last-show badge, BIT cross-check, favorites, festival rescan progress bar.</strong> (Prior sessions.)')}

<div class="honest-h1">ÃƒÂ¢Ã…Â¡Ã‚Â  Active workarounds</div>

${item('HACK', 'htag-hack', '<strong>Festival lineup from TM attractions:</strong> TM only populates attractions[] if they explicitly linked performers. Most LatAm and smaller festivals return empty lineup ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ score = 0. Artist cross-reference via geo+venue+date is a best-effort workaround.')}
${item('HACK', 'htag-hack', '<strong>Concert drawer photo:</strong> Artist photo still from Deezer (no key needed). Tracks are Spotify top-tracks with real popularity score. If Spotify credentials are missing, tracks section shows a prompt.')}
${item('HACK', 'htag-hack', '<strong>Festival map popup artist list:</strong> TM often stores tour name as attraction instead of individual bands. "My artists" section may be empty for small fests where TM has no structured data.')}
${item('HACK', 'htag-hack', '<strong>Bandsintown CORS:</strong> BIT API called from browser. If CORS tightened, fallback silently returns [].')}
${item('HACK', 'htag-hack', '<strong>Multi-country speed:</strong> 30 EU countries = 30+ sequential API calls for festival discovery. ~10s in EU-include mode.')}
${item('HACK', 'htag-hack', '<strong>Artist matching is intentionally conservative:</strong> tribute / candlelight / cover-style events are filtered harder now, so a few edge-case promoter titles may still be skipped until Ticketmaster links the real attraction correctly.')}

<div class="honest-h1">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  Live diagnostics</div>

${hasData ? `
${item('INFO', 'htag-limit', `Artists loaded: <strong>${totalArtists}</strong> Ãƒâ€šÃ‚Â· on tour: <strong>${artistsWithShows}</strong> Ãƒâ€šÃ‚Â· no shows found: <strong>${artistsNoShows}</strong>`)}
${item('INFO', 'htag-limit', `Concerts: <strong>${concerts.length}</strong> Ãƒâ€šÃ‚Â· Festivals: <strong>${festivals.length}</strong>`)}
${item('INFO', 'htag-limit', `Festival appearances in tour data: <strong>${concerts.filter(c=>c.isFest).length}</strong>`)}
${item('INFO', 'htag-limit', `BIT-sourced shows: <strong>${Object.values(allTourData).reduce((s,evs)=>s+evs.filter(e=>e._src==='bit').length,0)}</strong>`)}
${item('INFO', 'htag-limit', `Shows per artist (avg / max): <strong>${artistsWithShows ? Math.round(concerts.length / artistsWithShows) : 0} / ${Math.max(0, ...Object.values(allTourData).map(e => e.length))}</strong> ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â low is normal: TM only lists shows sold via TM.`)}
${dupeCheck > 0
  ? item('INFO', 'htag-limit', `<strong>${dupeCheck} probable duplicate entries</strong> hidden. ÃƒÂ¢Ã‚Â§Ã¢â‚¬Â° in map toolbar reveals them.`)
  : item('OK', 'htag-fix', 'No probable duplicates detected.')
}
${item('INFO', 'htag-limit', `Geo scope: ${scopeNote}`)}
` : item('INFO', 'htag-limit', 'No data loaded yet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â run a scan to see live diagnostics.')}

<div class="honest-h1">ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Â§ Still needs engineering</div>

${item('TODO', 'htag-todo', '<strong>Festival lineup enrichment:</strong> No reliable free API. Setlist.fm (key needed) or Songkick would be better sources.')}

<div style="margin-top:16px;padding:8px 10px;background:var(--s2);border-radius:6px;border:1px solid var(--border);font-size:.58rem;color:var(--muted2);line-height:1.6">
  v${APP_VERSION} Ãƒâ€šÃ‚Â· Updated this session. All items above are observed behaviors, not theoretical edge cases.
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

  // Tours ending soon: last show is within 90 days, tour has ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¥5 shows
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

  const sep = '<span class="msb-stat-sep">Ãƒâ€šÃ‚Â·</span>';
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

function buildSidebar() {
  buildStats();
  const today = new Date().toISOString().split('T')[0];
  const in90  = new Date(); in90.setDate(in90.getDate() + 90);
  const in90s = in90.toISOString().split('T')[0];
  document.querySelectorAll('[data-ap]').forEach(btn =>
    btn.classList.toggle('on', btn.dataset.ap === artistPreset));

  // Show/hide fav-only toggle
  const favBtn = document.getElementById('lt-fav');
  if (favBtn) favBtn.style.display = favoriteArtists.size ? '' : 'none';

  // Show dupe-toggle button only when there are actually hidden dupes
  const dupesBtn = document.getElementById('dupes-toggle');
  if (dupesBtn) {
    const rawCount   = concerts.length;
    const dedupCount = visibleConcerts().length;
    const hiddenDupes = rawCount - dedupCount;
    dupesBtn.style.display = hiddenDupes > 0 ? '' : 'none';
    dupesBtn.style.color       = showPossibleDupes ? 'var(--accent)' : '';
    dupesBtn.style.borderColor = showPossibleDupes ? 'var(--accent)' : '';
    dupesBtn.style.background  = showPossibleDupes ? 'rgba(200,255,95,.08)' : '';
    dupesBtn.title = !showPossibleDupes && hiddenDupes > 0
      ? `${hiddenDupes} possible duplicate show${hiddenDupes !== 1 ? 's' : ''} hidden ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â click to show`
      : 'Showing all entries including possible duplicates ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â click to hide';
  }

  let artists = sortedArtists();
  if (showFavOnly) artists = artists.filter(a => favoriteArtists.has(a.toLowerCase()));
  artists = applyArtistPreset(artists);

  document.getElementById('msb-all').classList.toggle('on', focusedArtist === null);
  document.getElementById('msb-all-cnt').textContent =
    showFavOnly ? `${artists.length} favorites` : artistPreset === 'all' ? `${artists.length} artists` : `${artists.length} filtered`;

  const list = document.getElementById('msb-list');

  // Show reset button if there are favorites
  const existingReset = list.parentElement.querySelector('.fav-reset-btn');
  if (existingReset) existingReset.remove();
  if (favoriteArtists.size > 0) {
    const rb = document.createElement('button');
    rb.className = 'fav-reset-btn';
    rb.textContent = `ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¢ Clear ${favoriteArtists.size} favorites`;
    rb.style.cssText = 'display:block;margin:6px 14px 2px;font-size:.52rem;';
    rb.onclick = resetFavorites;
    list.before(rb);
  }

  if (!artists.length) {
    const emptyMsg = showFavOnly
      ? 'No favorites on tour'
      : artistPreset === 'all'
        ? 'No tour data'
        : 'No artists match this preset';
    list.innerHTML = `<div style="padding:16px;font-size:.62rem;color:var(--muted2)">${emptyMsg}</div>`;
    buildFestPanel(); return;
  }

  const frag = document.createDocumentFragment();
  artists.forEach(artist => {
    const col = getColor(artist);
    const evs = allTourData[artist];
    const isFav = favoriteArtists.has(artist.toLowerCase());
    const row = document.createElement('div');
    row.className = 'msb-artist' + (focusedArtist === artist ? ' on' : '');
    if (isFav) row.style.borderLeft = '2px solid rgba(255,215,0,.7)';
    row.dataset.artist = artist;

    const showCount = evs.length;
    const badgeCol = showCount >= 5 ? 'var(--accent)' : showCount >= 2 ? 'var(--text)' : 'var(--muted)';
    const lastDate = evs[evs.length - 1]?.date || '';
    // ENDING: last known show within 90 days AND tour has ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¥3 shows (short gigs don't "end")
    const isEndingSoon = evs.length >= 3 && lastDate >= today && lastDate <= in90s;
    const nextShow = evs.find(e => e.date >= today);
    const metaText = nextShow
      ? `${nextShow.city || nextShow.venue || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}${nextShow.country ? ' ' + flag(nextShow.country) : ''}`
      : evs[0]?.city || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â';

    // In "My list" mode show plays score visually ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â a bar + play count label
    const plays = ARTIST_PLAYS[artist.toLowerCase()] || 0;
    const _allPlays = Object.values(ARTIST_PLAYS);
    const topPlays = _allPlays.length ? Math.max(1, ..._allPlays) : 1;
    const playBarPct = (artistSort === 'list' && plays > 0)
      ? Math.round(plays / topPlays * 100) : 0;
    const playsLabel = (artistSort === 'list' && plays > 0)
      ? `<span style="font-size:.48rem;color:var(--accent);font-family:'DM Mono',monospace;opacity:.9">${plays}ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶</span>` : '';

    row.innerHTML = `
      <button class="msb-star ${isFav ? 'on' : ''}" title="${isFav ? 'Unfavorite' : 'Favorite'}">ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦</button>
      <div class="msb-dot" style="background:${col}${isFav ? ';box-shadow:0 0 7px rgba(255,215,0,.55)' : ''}"></div>
      <div class="msb-ainfo">
        <div class="msb-aname">${artist}</div>
        <div class="msb-ameta">${metaText}</div>
        ${playBarPct > 0 ? `<div style="height:2px;border-radius:1px;background:var(--s3);overflow:hidden;margin-top:3px;width:80px"><div style="height:100%;width:${playBarPct}%;background:var(--accent);border-radius:1px;opacity:.55"></div></div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">
        ${playsLabel}
        <span style="font-size:.54rem;color:${badgeCol};font-family:'DM Mono',monospace">${showCount}ÃƒÆ’Ã¢â‚¬â€</span>
        ${isEndingSoon ? '<span style="font-size:.44rem;color:#ff8080;letter-spacing:.04em">ENDING</span>' : ''}
      </div>
      <button class="msb-focus">ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</button>`;
    row.querySelector('.msb-star').onclick  = e => toggleFavorite(artist, e);
    row.querySelector('.msb-focus').onclick = e => { e.stopPropagation(); focusArtist(artist); };
    row.onclick = () => focusArtist(artist);
    frag.appendChild(row);
  });
  list.innerHTML = '';
  list.appendChild(frag);
  buildFestPanel();
}

function buildFestPanel() {
  const today = new Date().toISOString().split('T')[0];
  const upFests = festivals.filter(f => f.date >= today && geoDisplayOk(f.country || '') && dateMatchesPreset(f.date));
  const withM = upFests.filter(f => f.score > 0).length;
  document.getElementById('tab-fests').textContent = upFests.length ? `ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª Festivals Ãƒâ€šÃ‚Â· ${withM}ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦` : 'ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª Festivals';

  const container = document.getElementById('fest-cards');
  // Sync checkbox to state (handles cases where the DOM is rebuilt)
  const cb = document.getElementById('show-unranked-cb');
  if (cb) cb.checked = showUnrankedFests;
  if (!upFests.length) { container.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">No festivals match current date / location filters</div>'; return; }

  // Respect the "show unranked" toggle ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â filter out score=0 fests when off
  const displayFests = showUnrankedFests ? upFests : upFests.filter(f => (f.score || 0) > 0);

  // Update the empty-state message to explain why the list might be short
  if (!displayFests.length) {
    container.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">'
      + (showUnrankedFests ? 'No festivals match current filters' : 'No ranked festivals in current filters ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â enable "unranked" to see all')
      + '</div>';
    return;
  }

  const sorted = [...displayFests].sort((a, b) =>
    festSort === 'date' ? a.date.localeCompare(b.date) : ((b.score - a.score) || a.date.localeCompare(b.date))
  );
  const frag = document.createDocumentFragment();
  sorted.forEach(f => {
    const score = f.score || 0, matched = f.matched || [];
    const lineup = f.lineupResolved || _resolvedFestivalLineup(f);
    const linkedShows = f.linkedShows || _festivalLinkedConcerts(f).length;
    // score is already 0-100 (normalized in scoreFestivals)
    const perfect = score >= 80 && matched.length >= 2;
    const ringCls = perfect ? 'p' : score > 0 ? 's' : '';
    const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
    const lineupMeta = [
      matched.length ? `${matched.length} tracked` : '',
      lineup.length ? `lineup ${lineup.length}` : '',
      linkedShows ? `${linkedShows} linked` : ''
    ].filter(Boolean).join(' Ãƒâ€šÃ‚Â· ');

    const card = document.createElement('div');
    card.className = 'fcard' + (f.id === focusedFest ? ' hl' : '');
    card.dataset.id = f.id;

    const hasPlays = matched.some(m => m.plays > 0);
    const chips = matched.slice(0,6).map((m, i) => {
      const playsTag = hasPlays && m.plays > 0
        ? `<span style="opacity:.55;margin-left:3px">${m.plays}</span>`
        : '';
      return `<span class="fcard-chip${i<2?' top':''}">${m.artist}${playsTag}</span>`;
    }).join('');

    const ringLabel = score > 0 ? score : 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â';

    card.innerHTML = `
      <div class="fcard-top">
        <div class="fcard-ring ${ringCls}" title="${score}/100">${ringLabel}</div>
        <div class="fcard-info">
          <div class="fcard-name">${f.name}</div>
          <div class="fcard-meta">${fmtDateRange(f)}${f.endDate ? '<span style="font-size:.5rem;margin-left:4px;opacity:.6;vertical-align:middle">'+(Math.round((new Date(f.endDate)-new Date(f.date))/86400000)+1)+'d</span>' : ''} Ãƒâ€šÃ‚Â· ${loc}</div>
          ${lineupMeta ? `<div class="fcard-meta" style="opacity:.72">${lineupMeta}</div>` : ''}
        </div>
        ${f.url ? `<a class="fcard-tkt" href="${f.url}" target="_blank">Tickets</a>` : ''}
      </div>
      <div class="fcard-chips" data-fid="${f.id}">${matched.length ? chips : '<span class="fcard-none">No tracked artists</span>'}</div>
      ${score > 0 ? `<div class="fcard-bar"><div class="fcard-bar-fill${perfect?' p':''}" style="width:${score}%"></div></div>` : ''}`;

    // Add +N chip via DOM (so click handler can expand inline)
    if (matched.length > 6) {
      const chipsEl = card.querySelector('.fcard-chips');
      const more = document.createElement('span');
      more.className = 'fcard-chip fcard-chip-more';
      more.textContent = `+${matched.length - 6}`;
      more.title = 'Show all';
      more.onclick = e => {
        e.stopPropagation();
        more.remove();
        matched.slice(6).forEach(m => {
          const pl = hasPlays && m.plays > 0 ? `<span style="opacity:.55;margin-left:3px">${m.plays}</span>` : '';
          const chip = document.createElement('span');
          chip.className = 'fcard-chip';
          chip.innerHTML = m.artist + pl;
          chipsEl.appendChild(chip);
        });
      };
      card.querySelector('.fcard-chips').appendChild(more);
    }

    card.onclick = e => { if (e.target.tagName === 'A' || e.target.classList.contains('fcard-chip-more')) return; openFestDetail(f.id); };
    frag.appendChild(card);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

function filterArtists() {
  const q = document.getElementById('msb-search').value.trim().toLowerCase();
  document.querySelectorAll('.msb-artist').forEach(r => {
    r.style.display = !q || (r.dataset.artist||'').toLowerCase().includes(q) ? '' : 'none';
  });
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FOCUS MODE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function focusArtist(artist) {
  focusedArtist = artist;
  { const _mr3 = document.getElementById('map-reset'); if (_mr3) _mr3.style.display = artist ? '' : 'none'; }
  document.querySelectorAll('.msb-artist').forEach(r => r.classList.toggle('on', r.dataset.artist === artist));
  document.getElementById('msb-all').classList.toggle('on', artist === null);
  clearMapLayers();

  if (!artist) {
    { const _fo3 = document.getElementById('focus-overlay'); if (_fo3) _fo3.style.display = 'none'; }
    lmap.flyTo([30, 10], 2, { duration:1 });
    renderOverview();
  } else {
    // Switch to tours tab visually if needed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â but don't call setTab() which would
    // trigger a second clearMapLayers()+renderFocusMode() call and double fitBounds.
    if (sidebarTab !== 'tours') {
      sidebarTab = 'tours';
      document.getElementById('tab-tours').className = 'msb-tab t-on';
      document.getElementById('tab-fests').className = 'msb-tab';
      document.getElementById('tab-match').className = 'msb-tab';
      document.getElementById('pane-tours').classList.add('on');
      document.getElementById('pane-fests').classList.remove('on');
      document.getElementById('pane-match').classList.remove('on');
      document.getElementById('map-sidebar').classList.remove('fests-mode');
      const leg = document.getElementById('map-legend'); if (leg) leg.style.opacity = '1';
      const _lt = document.getElementById('lt-t'); if (_lt) _lt.style.display = '';
      const _lf = document.getElementById('lt-f'); if (_lf) _lf.style.display = '';
    }
    { const _fo4 = document.getElementById('focus-overlay'); if (_fo4) _fo4.style.display = 'block'; }
    renderFocusMode(artist);
  }
}

function renderFocusMode(artist) {
  // allTourData keys are canonical names from concerts[]. Two failure modes:
  // 1. allTourData was wiped by a mid-scan renderMap() while focusedArtist was
  //    still set ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â we rebuild it before the lookup.
  // 2. Name case/whitespace mismatch between the click closure and the stored key
  //    ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â we do a case-insensitive fallback.
  if (Object.keys(allTourData).length === 0 && concerts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    for (const c of concerts) {
      if (c.date < today || isHidden(c.artist)) continue;
      (allTourData[c.artist] = allTourData[c.artist] || []).push(c);
    }
    for (const a in allTourData) allTourData[a].sort((a, b) => a.date.localeCompare(b.date));
  }
  let evs = allTourData[artist];
  if (!evs) {
    const lower = artist.toLowerCase();
    const key = Object.keys(allTourData).find(k => k.toLowerCase() === lower);
    if (key) { evs = allTourData[key]; artist = key; }
  }
  if (!evs) { renderOverview(); return; }
  const col = getColor(artist);
  const today = new Date().toISOString().split('T')[0];
  const future = evs.filter(e => e.date >= today);
  const display = future.length ? future : evs;

  document.getElementById('focus-name').textContent = artist;
  { const _fn = document.getElementById('focus-name'); if (_fn) _fn.style.color = col; }
  document.getElementById('focus-sub').textContent =
    `${display.length} show${display.length!==1?'s':''} Ãƒâ€šÃ‚Â· ${future.length} upcoming`;

  // Build a venue+date ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ other tracked artists map for festival co-detection
  // Key: date|venueSlug ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â same logic as calendar grouping
  const venueSlug = c => `${c.date}|${(c.venue||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,25)}`;
  const venueMap = new Map(); // key ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ [artistName, ...]
  for (const c of concerts) {
    const k = venueSlug(c);
    if (!venueMap.has(k)) venueMap.set(k, []);
    venueMap.get(k).push(c.artist);
  }

  // Build a date+city ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ festival info map
  const festMap = new Map(); // date|city ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ festival
  for (const f of festivals) {
    const k = `${f.date}|${(f.city||'').toLowerCase().slice(0,15)}`;
    if (!festMap.has(k)) festMap.set(k, f);
  }

  const listEl = document.getElementById('focus-list');
  const frag = document.createDocumentFragment();

  display.forEach((ev, i) => {
    const dayObj  = new Date(ev.date + 'T12:00:00');
    const dayNum  = ev.date.slice(8);
    const month   = dayObj.toLocaleString('en-US', { month:'short' }).toUpperCase();
    const dayName = dayObj.toLocaleString('en-US', { weekday:'short' }).toUpperCase();

    // Co-artist detection: other tracked artists at same venue
    const vk = venueSlug(ev);
    const coAtVenue = (venueMap.get(vk) || [])
      .filter(a => a !== artist && a.toLowerCase() !== artist.toLowerCase());

    // Festival match: same date+city
    const fk = `${ev.date}|${(ev.city||'').toLowerCase().slice(0,15)}`;
    const matchedFest = festMap.get(fk);
    const festCoArtists = matchedFest
      ? (matchedFest.matched || []).filter(m => m.artist.toLowerCase() !== artist.toLowerCase())
      : [];

    // Merge co-artists (prefer festCoArtists as they have plays data)
    const coArtists = festCoArtists.length
      ? festCoArtists
      : coAtVenue.map(a => ({ artist: a, plays: ARTIST_PLAYS[a.toLowerCase()] || 0 }));

    const isFest = coArtists.length >= 2 || !!matchedFest;
    // LAST SHOW: only flag the actual final show in the list, and only for real tours (ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¥3 shows)
    const isLast = i === display.length - 1 && display.length >= 3;

    const row = document.createElement('div');
    row.className = 'fshow' + (i === 0 ? ' active' : '');

    // Accent bar
    const accent = document.createElement('div');
    accent.className = 'fshow-accent';
    accent.style.background = i === 0 ? col : 'transparent';
    row.appendChild(accent);

    // Date header
    const head = document.createElement('div');
    head.className = 'fshow-head';
    head.innerHTML = `
      <span class="fshow-date" style="color:${col}">${dayNum} ${month}</span>
      <span class="fshow-day">${dayName}${isFest ? '<span class="fshow-fest-badge">FEST</span>' : ''}${isLast ? '<span class="fshow-last-badge">LAST SHOW</span>' : ''}</span>`;

    // Body: city, venue, co-artists, footer
    const body = document.createElement('div');
    body.className = 'fshow-body';

    const cityLine = document.createElement('div');
    cityLine.className = 'fshow-city';
    cityLine.textContent = ev.city || ev.venue || '?';

    const venueLine = document.createElement('div');
    venueLine.className = 'fshow-venue';
    venueLine.textContent = ev.venue || '';

    body.appendChild(cityLine);
    body.appendChild(venueLine);

    // Co-artist chips
    if (coArtists.length) {
      const coEl = document.createElement('div');
      coEl.className = 'fshow-co';
      // Show self first then others
      const selfChip = document.createElement('span');
      selfChip.className = 'fshow-co-chip self';
      selfChip.textContent = artist;
      coEl.appendChild(selfChip);

      coArtists.slice(0, 5).forEach(m => {
        const chip = document.createElement('span');
        chip.className = 'fshow-co-chip';
        const label = m.plays > 0 ? `${m.artist} ${m.plays}` : m.artist;
        chip.textContent = label;
        coEl.appendChild(chip);
      });
      if (coArtists.length > 5) {
        const more = document.createElement('span');
        more.className = 'fshow-co-chip';
        more.style.opacity = '.5';
        more.textContent = `+${coArtists.length - 5} more`;
        coEl.appendChild(more);
      }
      body.appendChild(coEl);
    }

    // Footer: flag + tickets
    const foot = document.createElement('div');
    foot.className = 'fshow-foot';
    const flagEl = document.createElement('span');
    flagEl.className = 'fshow-flag';
    flagEl.textContent = ev.country ? flag(ev.country) : '';
    foot.appendChild(flagEl);

    if (ev.url) {
      const tkt = document.createElement('a');
      tkt.className = 'fshow-tkt';
      tkt.href = ev.url; tkt.target = '_blank';
      tkt.textContent = 'Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢';
      tkt.style.borderColor = col; tkt.style.color = col;
      tkt.onclick = e => e.stopPropagation();
      foot.appendChild(tkt);
    }
    body.appendChild(foot);

    row.appendChild(head);
    row.appendChild(body);

    // Click = fly to venue, highlight accent
    row.onclick = () => {
      document.querySelectorAll('.fshow').forEach(r => {
        r.classList.remove('active');
        const _fa1 = r.querySelector('.fshow-accent'); if (_fa1) _fa1.style.background = 'transparent';
      });
      row.classList.add('active');
      accent.style.background = col;
      if (ev.lat) lmap.flyTo([ev.lat, ev.lng], 11, { duration:.7 });
    };

    frag.appendChild(row);
  });

  listEl.innerHTML = '';
  listEl.appendChild(frag);

  // "ÃƒÂ¢Ã¢â‚¬Â Ã‚Â All artists" footer ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â lets user close without scrolling back to the top.
  // Useful when a tour has many shows (The Neighbourhood had 19, user had to scroll to bottom).
  const backFooter = document.createElement('div');
  backFooter.style.cssText = 'padding:14px;border-top:1px solid var(--border);text-align:center;';
  const backBtn = document.createElement('button');
  backBtn.style.cssText = 'font-family:"DM Mono",monospace;font-size:.6rem;padding:6px 16px;' +
    'border-radius:var(--r);border:1px solid var(--border2);background:var(--s2);' +
    'color:var(--muted);cursor:pointer;transition:all .12s;width:100%;';
  backBtn.textContent = 'ÃƒÂ¢Ã¢â‚¬Â Ã‚Â All artists';
  backBtn.onmouseenter = () => { backBtn.style.borderColor = 'var(--accent)'; backBtn.style.color = 'var(--accent)'; };
  backBtn.onmouseleave = () => { backBtn.style.borderColor = ''; backBtn.style.color = ''; };
  backBtn.onclick = () => focusArtist(null);
  backFooter.appendChild(backBtn);
  listEl.appendChild(backFooter);

  // Map: geo-index ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ display-index (fixes row sync when non-geo shows exist)
  const geoToDisplay = {};
  let gi = 0;
  display.forEach((ev, di) => { if (ev.lat) geoToDisplay[gi++] = di; });

  // Map: draw route + numbered markers
  const coords = display.filter(e => e.lat);
  if (coords.length > 1)
    routeLines.push(L.polyline(coords.map(e => [e.lat, e.lng]),
      { color: col, weight: 2.5, opacity: .65, dashArray: '6 4' }).addTo(lmap));

  coords.forEach((ev, i) => {
    const dispIdx  = geoToDisplay[i] ?? i; // corrected display index
    const first = i === 0;
    // Check isFest flag OR cross-reference with festivals[] by date+geo
    const matchedFest = _festForConcert(ev);
    const isFestShow = ev.isFest || !!matchedFest;
    const festName = matchedFest ? matchedFest.name : null;
    const sz = first ? 28 : 22;

    let markerHtml;
    if (isFestShow && !first) {
      markerHtml = `<div style="width:${sz}px;height:${sz}px;border-radius:4px;transform:rotate(45deg);
        background:rgba(8,8,10,.92);border:2px solid #ffaa3c;
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(-45deg);font-family:'DM Mono',monospace;font-weight:700;font-size:.52rem;color:#ffaa3c">${i+1}</span>
      </div>`;
    } else {
      markerHtml = `<div style="width:${sz}px;height:${sz}px;border-radius:50%;
        background:${first ? col : 'rgba(8,8,10,.92)'};border:2px solid ${col};
        color:${first ? '#fff' : col};display:flex;align-items:center;justify-content:center;
        font-family:'DM Mono',monospace;font-weight:700;font-size:${first?'.6':'.52'}rem;
        box-shadow:0 2px 12px rgba(0,0,0,.7);cursor:pointer">${i+1}</div>`;
    }

    const icon = L.divIcon({ className:'', iconSize:[sz, sz], iconAnchor:[sz/2, sz/2], html: markerHtml });
    // Show festival name in popup when the concert is actually a fest appearance
    const popTitle = isFestShow && festName
      ? `<b style="color:#ffaa3c">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âª ${festName}</b><br><span style="color:${col};font-size:.62rem">${artist}</span>`
      : `<b style="color:${col}">${artist}</b>`;
    // For fest appearances, prefer the festival's own ticket URL over the artist-specific one
    const ticketUrl = (isFestShow && matchedFest?.url) ? matchedFest.url : (ev.url || '');
    const pop = `${popTitle} #${i+1}<br>${fmtDate(ev.date)}<br>
      ${ev.venue}<br><span style="color:var(--muted)">${ev.city} ${ev.country ? flag(ev.country) : ''}</span>
      ${ticketUrl ? `<br><a href="${ticketUrl}" target="_blank" style="color:${isFestShow?'#ffaa3c':col}">Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</a>` : ''}`;
    // bubblingMouseEvents:false prevents click bubbling to the map where
    // Leaflet's closePopupOnClick would immediately close the just-opened popup.
    const mk = L.marker([ev.lat, ev.lng], { icon, bubblingMouseEvents: false })
      .addTo(lmap)
      .bindPopup(pop, { autoPan: true, autoPanPaddingTopLeft: [10,10], autoPanPaddingBottomRight: [10,80] });
    mk.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      const rows = document.querySelectorAll('.fshow');
      rows.forEach((r, ri) => {
        const isThis = ri === dispIdx;  // use corrected index
        r.classList.toggle('active', isThis);
        const _fa2 = r.querySelector('.fshow-accent'); if (_fa2) _fa2.style.background = isThis ? col : 'transparent';
        if (isThis) r.scrollIntoView({ behavior:'smooth', block:'nearest' });
      });
    });
    tourMarkers.push(mk);
  });

  // Fly to fit all markers
  if (coords.length > 0) {
    const bounds = L.latLngBounds(coords.map(e => [e.lat, e.lng]));
    lmap.fitBounds(bounds, { padding:[40, 320], maxZoom:8, duration:.9 });
  }
}

// Maximum artists to show on the map overview when results are abundant.
// When more than this pass the filters, only the top MAP_MAX_ARTISTS by rank
// are rendered as markers. The sidebar list still shows everyone.
// This is a `let` so the in-map stepper control can change it without a reload.
let MAP_MAX_ARTISTS = 30;
let _mapWasCapped = false;   // true when last render trimmed to top 20
let _mapFirstFit  = false;   // becomes true after the first fitBounds ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â prevents jumping on filter changes

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Festival map popup ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rich card with lineup ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function _buildFestPopup(f) {
  const cc      = f.country ? ' ' + flag(f.country) : '';
  const dateStr = fmtDateRange(f);
  let matched   = (f.matched || []).slice();
  const lineup  = f.lineupResolved || _resolvedFestivalLineup(f);
  const matchedNames = new Set(matched.map(m => _normText(m.artist || m)));

  for (const artist of ARTISTS) {
    const key = _normText(artist);
    if (!key || matchedNames.has(key) || !_lineupArtistHit(artist, lineup)) continue;
    matchedNames.add(key);
    matched.push({ artist, plays: ARTIST_PLAYS[key] || 0, weight: ARTIST_PLAYS[key] || 0 });
  }
  matched.sort((a, b) => (b.plays || b.weight || 0) - (a.plays || a.weight || 0));

  const topOther = lineup
    .filter(n => !matchedNames.has(_normText(n)) && !_isFestivalSelfReference(n, f.name))
    .slice(0, 6);
  const linkedShows = _festivalLinkedConcerts(f).filter(c => !isHidden(c.artist));

  // My artists row
  const myRows = matched.map(m => {
    const name  = m.artist || m;
    const plays = m.plays  || 0;
    const col   = getColor(name);
    return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <span style="width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0"></span>
      <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:.72rem;color:${col};flex:1">${esc2(name)}</span>
      ${plays > 0 ? `<span style="font-size:.55rem;color:rgba(255,255,255,.35);font-family:'DM Mono',monospace">${plays}ÃƒÆ’Ã¢â‚¬â€</span>` : ''}
    </div>`;
  }).join('');

  // Other top headliners row
  const otherRows = topOther.length ? `
    <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)">
      <div style="font-size:.46rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:4px">Headliners</div>
      ${topOther.map(n => `<div style="font-size:.64rem;color:rgba(255,255,255,.5);padding:1px 0">${esc2(n)}</div>`).join('')}
    </div>` : '';

  const hasLineup = matched.length > 0 || topOther.length > 0;
  const lineupBlock = hasLineup ? `
    <div style="margin-top:10px">
      ${myRows}
      ${otherRows}
    </div>` : '';

  const scoreBar = f.score > 0 ? `
    <div style="margin-top:8px;height:2px;background:rgba(255,255,255,.1);border-radius:1px;overflow:hidden">
      <div style="height:100%;width:${f.score}%;background:#ffaa3c;border-radius:1px"></div>
    </div>` : '';

  // Poster image (from TM or a Songkick/Bands-in-Town fallback via Google image search not available)
  // We use TM's stored image directly. Clicking opens the ticket page.
  const imgHtml = f.imageUrl ? `
    <a href="${f.url || '#'}" target="_blank" style="display:block;margin-bottom:10px;border-radius:6px;overflow:hidden;line-height:0;border:1px solid rgba(255,170,60,.2)">
      <img src="${f.imageUrl}" alt="${esc2(f.name)}"
        style="width:100%;max-height:140px;object-fit:cover;display:block"
        onerror="this.parentElement.style.display='none'">
    </a>` : '';

  return `<div style="min-width:260px;max-width:320px">
    ${imgHtml}
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:.9rem;color:#ffaa3c;line-height:1.2;margin-bottom:3px">${esc2(f.name)}</div>
    <div style="font-size:.64rem;color:rgba(255,255,255,.65);margin-bottom:1px">${dateStr}</div>
    ${f.venue ? `<div style="font-size:.6rem;color:rgba(255,255,255,.45)">${esc2(f.venue)}</div>` : ''}
    <div style="font-size:.58rem;color:rgba(255,255,255,.35);margin-bottom:4px">${esc2(f.city)}${cc}</div>
    <div style="font-size:.54rem;color:rgba(255,255,255,.42);margin-bottom:4px">
      ${matched.length ? `${matched.length} tracked` : '0 tracked'}${lineup.length ? ` Ãƒâ€šÃ‚Â· lineup ${lineup.length}` : ''}${linkedShows.length ? ` Ãƒâ€šÃ‚Â· linked ${linkedShows.length}` : ''}
    </div>
    ${lineupBlock}
    ${scoreBar}
    ${f.url ? `<div style="margin-top:10px"><a href="${f.url}" target="_blank" style="color:#ffaa3c;font-size:.64rem;font-family:'DM Mono',monospace;text-decoration:none;letter-spacing:.02em">ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â« Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</a></div>` : ''}
  </div>`;
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Festival label renderer ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â called from renderOverview AND on zoom ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// On zoom: only redraws festMarkers (cheap), tour markers stay in place.
function _renderFestLabels() {
  if (!lmap) return;
  // Remove existing fest markers only
  festMarkers.forEach(m => m.remove()); festMarkers = [];

  const today = new Date().toISOString().split('T')[0];
  const skipFests = mapTypeFilter === 'tours';
  if (skipFests) return;

  const festsToRender = festivals.filter(f => f.date >= today && f.lat && f.lng
    && geoDisplayOk(f.country || '') && mapDateOk(f.date) && mapScoreOkFest(f));

  // High-score fests get label priority in collision resolution
  festsToRender.sort((a, b) => (b.score||0) - (a.score||0));

  // Occupied rectangles in screen px [x, y, w, h]
  const occupied = [];
  const PX_PAD = 6;
  const rectOverlap = (a, b) =>
    a[0] < b[0]+b[2]+PX_PAD && a[0]+a[2]+PX_PAD > b[0] &&
    a[1] < b[1]+b[3]+PX_PAD && a[1]+a[3]+PX_PAD > b[1];

  festsToRender.forEach(f => {
    const score = f.score || 0;
    const pct   = score / 100;
    const col   = pct > .6 ? '#c8ff5f' : pct > .25 ? '#ffaa3c' : '#d4813a';
    const colBg = pct > .6 ? 'rgba(200,255,95,' : pct > .25 ? 'rgba(255,170,60,' : 'rgba(200,120,60,';
    const fs    = score === 0 ? 10 : score < 25 ? 11 : score < 50 ? 13 : score < 75 ? 15 : 18;
    const fw    = score >= 50 ? 700 : score >= 25 ? 600 : 500;
    const opacity = score === 0 ? 0.55 : 0.78 + pct * 0.22;
    const sz    = Math.round(5 + pct * 7);
    const shortName = f.name.length > 24 ? f.name.slice(0, 22) + '\u2026' : f.name;

    const labelW = Math.round(shortName.length * fs * 0.62);
    const labelH = fs + 2;
    const totalH = labelH + 3 + sz;
    const totalW = Math.max(labelW, sz + 4);

    const pt = lmap.latLngToContainerPoint([f.lat, f.lng]);

    // Candidate offsets: above, below, right, left, lower-right, lower-left
    const offsets = [
      [0, 0],
      [0, totalH + sz],
      [totalW + 2, -totalH/2],
      [-(totalW + 2), -totalH/2],
      [totalW/2, totalH],
      [-totalW/2, totalH],
    ];

    // Base rect when label is above
    const baseRect = [pt.x - totalW/2, pt.y - totalH, totalW, totalH];

    let chosenOffset = null;
    for (const [dx, dy] of offsets) {
      const rect = [baseRect[0]+dx, baseRect[1]+dy, totalW, totalH];
      if (!occupied.some(o => rectOverlap(rect, o))) {
        chosenOffset = [dx, dy];
        occupied.push(rect);
        break;
      }
    }

    // If every position overlaps ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â render dot only (no label text), so location is still visible
    const renderLabel = chosenOffset !== null;
    const [dx, dy] = chosenOffset || [0, 0];

    const html = renderLabel
      ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none">
          <div style="font-family:'Syne',sans-serif;font-weight:${fw};font-size:${fs}px;
            color:${col};opacity:${opacity};white-space:nowrap;
            text-shadow:0 1px 5px rgba(0,0,0,.95),0 0 10px rgba(0,0,0,.9);
            letter-spacing:.01em;line-height:1">${shortName}</div>
          <div style="width:${sz}px;height:${sz}px;border:1.5px solid ${col};
            transform:rotate(45deg);background:${colBg}.18);border-radius:1px;opacity:${opacity}"></div>
        </div>`
      // Dot-only when label hidden due to overlap
      : `<div style="width:${sz}px;height:${sz}px;border:1.5px solid ${col};
            transform:rotate(45deg);background:${colBg}.18);border-radius:1px;
            opacity:${Math.max(opacity - 0.1, 0.35)}"></div>`;

    const dotOnlyW = sz + 4, dotOnlyH = sz + 4;
    const w = renderLabel ? totalW : dotOnlyW;
    const h = renderLabel ? totalH : dotOnlyH;
    const anchorX = renderLabel ? (totalW/2 - dx) : dotOnlyW/2;
    const anchorY = renderLabel ? (totalH - dy)   : dotOnlyH;

    const icon = L.divIcon({ className:'', iconSize:[w, h], iconAnchor:[anchorX, anchorY], html });
    const popup = _buildFestPopup(f);
    const mk = L.marker([f.lat, f.lng], { icon, zIndexOffset: Math.round(score * 5) })
      .addTo(lmap).bindPopup(popup, { maxWidth: 340, className: 'fest-map-popup' });
    festMarkers.push(mk);
  });

  if (!showMapFests) festMarkers.forEach(m => m.remove());
}

function renderOverview() {
  const today = new Date().toISOString().split('T')[0];
  const in7   = dateOffset(7);
  const in30  = dateOffset(30);
  const in90  = dateOffset(90);
  const zoom  = lmap ? lmap.getZoom() : 3;

  // Fav filter applied to full entry set
  let tourEntries = Object.entries(allTourData).filter(([a]) =>
    !showFavOnly || favoriteArtists.has(a.toLowerCase())
  );

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Top-N cap ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // When too many artists pass all the map filters, showing all of them
  // produces a noisy unreadable dot-cloud. Cap the map to the top 20 by
  // rank score so the most relevant artists are always visible.
  const totalPassing = tourEntries.length;
  if (totalPassing > MAP_MAX_ARTISTS) {
    // Sort descending by rank
    const ranked = tourEntries
      .map(([a, evs]) => ({ artist: a, evs, rank: _rankScore(a) }))
      .sort((a, b) => b.rank - a.rank);

    // Take top N
    const top = ranked.slice(0, MAP_MAX_ARTISTS);
    const topSet = new Set(top.map(x => x.artist));

    // Country coverage: for each country that has concerts but no artist in top N,
    // add the highest-ranked artist from that country
    const today2 = new Date().toISOString().split('T')[0];
    const coveredCountries = new Set();
    top.forEach(({ evs }) => evs.forEach(e => { if (e.date >= today2 && e.country) coveredCountries.add(e.country); }));

    ranked.slice(MAP_MAX_ARTISTS).forEach(({ artist, evs, rank }) => {
      const artistCountries = new Set(evs.filter(e => e.date >= today2 && e.country).map(e => e.country));
      const uncovered = [...artistCountries].filter(cc => !coveredCountries.has(cc));
      if (uncovered.length > 0) {
        top.push({ artist, evs, rank });
        uncovered.forEach(cc => coveredCountries.add(cc));
      }
    });

    tourEntries = top.map(({ artist, evs }) => [artist, evs]);
    _mapWasCapped = true;
  } else {
    _mapWasCapped = false;
  }
  // Update sidebar cap notice
  const capNotice = document.getElementById('map-cap-notice');
  if (capNotice) {
    if (_mapWasCapped) {
      capNotice.textContent = `Top ${MAP_MAX_ARTISTS} of ${totalPassing} shown ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use filters to narrow`;
      capNotice.style.display = '';
    } else {
      capNotice.style.display = 'none';
    }
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. ROUTE LINES (all zoom levels) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // We clip each artist's route to only include points that are within
  // the viewport (padded 80%) so zooming into a region doesn't show
  // dangling lines flying off to distant continents.
  const bounds = lmap.getBounds().pad(0.8);
  tourEntries.forEach(([artist, evs]) => {
    const pts = evs.filter(e => e.lat && e.date >= today);
    if (pts.length < 2) return;

    // Only keep points within the padded viewport, OR that are adjacent
    // to a visible point (so lines exit the viewport smoothly rather than
    // hard-stopping at the edge). We do a two-pass: mark in-bounds pts,
    // then include immediate neighbors.
    const inBounds = pts.map(e => bounds.contains([e.lat, e.lng]));
    const keep = pts.map((_, i) =>
      inBounds[i] ||
      (i > 0              && inBounds[i - 1]) ||
      (i < pts.length - 1 && inBounds[i + 1])
    );

    // Gather the kept points into continuous segments (split on gaps)
    const segments = [];
    let seg = null;
    pts.forEach((e, i) => {
      if (keep[i]) {
        if (!seg) { seg = []; segments.push(seg); }
        seg.push([e.lat, e.lng]);
      } else {
        seg = null; // gap ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â start a new segment on next kept point
      }
    });

    if (!segments.length) return;
    const isFav = favoriteArtists.has(artist.toLowerCase());
    const rank  = _rankScore(artist);
    const col   = getColor(artist);
    segments.forEach(segPts => {
      if (segPts.length < 2) return;
      routeLines.push(L.polyline(segPts, {
        color: col,
        weight:  isFav ? 2 : rank > 150 ? 1.5 : 0.9,
        opacity: isFav ? .45 : rank > 150 ? .22 : rank > 50 ? .14 : .08,
        dashArray: '4 9'
      }).addTo(lmap));
    });
  });

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. FUTURE SHOW DOTS at zoom > 7 (tiny, along route) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  if (zoom > 7) {
    tourEntries.forEach(([artist, evs]) => {
      const col = getColor(artist);
      const nextGeo = evs.find(e => e.date >= today && e.lat);
      evs.filter(e => e.lat && e.date >= today && e !== nextGeo).forEach(ev => {
        const sz = 3;
        tourMarkers.push(L.marker([ev.lat, ev.lng], { icon: L.divIcon({
          className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2],
          html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${col};opacity:.35"></div>`
        })}).addTo(lmap));
      });
    });
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3. NEXT-SHOW MARKERS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â city clustered ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // Group each artist's next geolocated show into city buckets.
  // KEY FIX: prefer the first in-bounds future show over the globally-first show.
  // This prevents "ghost lines" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â route lines that enter the viewport but whose
  // marker is off-screen because the artist's next show is in a different region.
  const vpBounds = lmap.getBounds().pad(0.15); // tighter than route-line padding
  const cityMap = new Map();
  tourEntries.forEach(([artist, evs]) => {
    const futureGeo = evs.filter(e => e.date >= today && e.lat);
    if (!futureGeo.length) return;
    // Prefer first in-viewport show; fall back to globally first
    const inViewport = futureGeo.find(e => vpBounds.contains([e.lat, e.lng]));
    const nextGeo = inViewport || futureGeo[0];
    const rank = _rankScore(artist);
    const cityKey = `${(nextGeo.city||'?').toLowerCase().trim().slice(0,13)}|${nextGeo.country||''}`;
    if (!cityMap.has(cityKey)) cityMap.set(cityKey, {
      lat: nextGeo.lat, lng: nextGeo.lng,
      city: nextGeo.city || '?', country: nextGeo.country || '',
      entries: []
    });
    cityMap.get(cityKey).entries.push({ artist, ev: nextGeo, rank });
  });

  // Render each city cluster
  cityMap.forEach(({ lat, lng, city, country, entries }) => {
    entries.sort((a, b) => b.rank - a.rank);
    const topArtist = entries[0].artist;
    const topEv     = entries[0].ev;
    const topRank   = entries[0].rank;
    const topCol    = getColor(topArtist);
    const isFav     = entries.some(e => favoriteArtists.has(e.artist.toLowerCase()));
    const accentCol = isFav ? '#ffd700' : topCol;
    const count     = entries.length;
    const isCluster = count > 1 && zoom <= 6;

    // Temporal urgency of the top artist's next show
    const urgency = topEv.date <= in7  ? 'urgent' :
                    topEv.date <= in30 ? 'soon'   :
                    topEv.date <= in90 ? 'near'   : 'far';

    if (isCluster) {
      // City bubble: shows count + top artist color
      _renderCityBubble(lat, lng, city, country, entries, accentCol, urgency, isFav, topArtist);
    } else if (entries.length === 1 || zoom > 6) {
      // Individual pill for each artist, with jitter to de-overlap same-location markers
      entries.forEach(({ artist, ev, rank }, ji) => {
        _renderArtistPill(artist, ev, rank, today, in7, in30, entries.length > 1 ? ji : 0);
      });
    } else {
      // zoom ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤ 6 but only 1 artist ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ single pill
      _renderArtistPill(topArtist, topEv, topRank, today, in7, in30, 0);
    }
  });

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4. FESTIVALS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rendered via standalone function (also called on zoom) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  _renderFestLabels();

  if (!showMapTours) { tourMarkers.forEach(m=>m.remove()); routeLines.forEach(l=>l.remove()); }
  if (!showMapFests) festMarkers.forEach(m=>m.remove());

  updateVisiblePanel();

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Auto-fit: on the very first render with data, fly to the bounding box
  // of all visible markers so the map opens at a sensible zoom level.
  // We only do this once (_mapFirstFit flag) so that filter changes don't
  // re-center the map while the user is panning/zooming.
  if (!_mapFirstFit && lmap) {
    const allPts = [];
    tourMarkers.forEach(m => { const ll = m.getLatLng(); allPts.push([ll.lat, ll.lng]); });
    festMarkers.forEach(m => { const ll = m.getLatLng(); allPts.push([ll.lat, ll.lng]); });
    // Also include route line coordinates so we fit even when all markers are clustered
    routeLines.forEach(l => l.getLatLngs().forEach(pt => allPts.push([pt.lat, pt.lng])));
    if (allPts.length > 0) {
      const bounds = L.latLngBounds(allPts);
      if (bounds.isValid()) {
        // padding: [top/bottom px, left px] ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â left padding accounts for the ~240px sidebar
        lmap.fitBounds(bounds, { padding: [48, 48], maxZoom: 7, animate: false });
        _mapFirstFit = true;
      }
    }
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ City cluster bubble marker ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function _renderCityBubble(lat, lng, city, country, entries, col, urgency, isFav, topArtist) {
  const count  = entries.length;
  const sz     = Math.min(54, 26 + count * 4);
  const glow   = urgency === 'urgent' ? `0 0 18px ${col}90` :
                 urgency === 'soon'   ? `0 0 10px ${col}60` : 'none';
  const isPulse = urgency === 'urgent';

  const plays = ARTIST_PLAYS[(topArtist||'').toLowerCase()] || 0;
  const showName = plays >= 5 || isFav;

  const html = `<div style="position:relative;width:${sz}px;height:${sz}px">
    ${isPulse ? `<div class="map-pulse-ring" style="color:${col}"></div>` : ''}
    <div class="${isPulse?'map-glow':''}" style="position:absolute;inset:0;border-radius:50%;
      background:rgba(8,8,10,.96);border:2.5px solid ${col};
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      cursor:pointer;box-shadow:${glow};overflow:hidden;gap:0">
      <span style="font-family:'DM Mono',monospace;font-weight:800;
        font-size:${count>9?'.5':'.62'}rem;color:${col};line-height:1.1">${count}</span>
      ${showName ? `<span style="font-size:.27rem;color:${col};opacity:.7;line-height:1.1;
        text-align:center;max-width:${sz-6}px;overflow:hidden;white-space:nowrap;
        text-overflow:ellipsis;padding:0 3px">${topArtist}</span>` : ''}
    </div>
  </div>`;

  const icon = L.divIcon({ className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2], html });

  const cc = country ? flag(country) : '';
  const artistLines = entries.slice(0, 8).map(e => {
    const p = ARTIST_PLAYS[(e.artist||'').toLowerCase()] || 0;
    return `<span style="color:${getColor(e.artist)}">${e.artist}${p ? ` <span style="opacity:.5;font-size:.58rem">${p}ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶</span>` : ''}</span>`;
  }).join(' Ãƒâ€šÃ‚Â· ');
  const extra = entries.length > 8 ? ` <span style="opacity:.4">+${entries.length-8}</span>` : '';
  const popup = `<b style="font-family:Syne,sans-serif;color:${col}">${city} ${cc}</b> ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${count} shows<br><span style="font-size:.62rem;line-height:1.9">${artistLines}${extra}</span><br><span style="font-size:.5rem;color:var(--muted2)">Click to zoom in ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ see individual shows</span>`;

  const mk = L.marker([lat, lng], { icon, zIndexOffset: count * 20 })
    .addTo(lmap);
  mk.bindPopup(popup);
  // Click zooms in to reveal individual pills (don't block on isPopupOpen - just close popup and zoom)
  mk.on('click', () => {
    mk.closePopup();
    lmap.flyTo([lat, lng], Math.max(lmap.getZoom() + 3, 8), { duration: .65 });
  });
  tourMarkers.push(mk);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Individual artist pill/dot marker ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function _renderArtistPill(artist, ev, rank, today, in7, in30, jitterIdx) {
  const col    = getColor(artist);
  const plays  = ARTIST_PLAYS[(artist||'').toLowerCase()] || 0;
  const isFav  = favoriteArtists.has((artist||'').toLowerCase());
  const acc    = isFav ? '#ffd700' : col;
  const urgency = ev.date <= in7  ? 'urgent' :
                  ev.date <= in30 ? 'soon'   : 'far';
  const glow   = isFav               ? `0 0 14px rgba(255,215,0,.65)` :
                 urgency === 'urgent' ? `0 0 12px ${col}90` :
                 urgency === 'soon'   ? `0 0 7px ${col}60` : 'none';
  const dimOp  = urgency === 'far' && !isFav && plays === 0 ? '.45' : '1';

  const tierS  = plays >= 20 || isFav;
  const tierA  = plays >= 5;
  const tierB  = plays >= 1;

  let html, iconW, iconH, anchorX, anchorY;

  if (tierS || tierA) {
    const ph   = tierS ? 22 : 18;
    const ds   = tierS ? 8  : 6;
    const fs   = tierS ? '.55rem' : '.48rem';
    // Syne is wider than monospace ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use 8.5px/char for Syne bold
    // Width: content-driven, no hard max ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â short names (e.g. "EDEN") must never truncate
    const estW = Math.min(220, Math.max(60, artist.length * (tierS ? 8.5 : 7.5) + 46));

    html = `<div style="position:relative;display:inline-flex;align-items:center;gap:4px;
      padding:3px 8px 3px ${3+ds}px;background:rgba(8,8,10,.94);
      border:${tierS?1.5:1}px solid ${acc};border-radius:100px;
      cursor:pointer;white-space:nowrap;box-shadow:${glow};opacity:${dimOp}">
      ${urgency==='urgent'?`<div class="map-pulse-ring" style="color:${acc};border-radius:100px"></div>`:''}
      <div style="width:${ds}px;height:${ds}px;border-radius:50%;background:${acc};flex-shrink:0"></div>
      <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:${fs};
        color:${acc}">${artist}</span>
      ${plays > 0 ? `<span style="font-family:'DM Mono',monospace;font-size:.38rem;color:${acc};opacity:.55;flex-shrink:0">${plays}</span>` : ''}
    </div>`;
    iconW = estW; iconH = ph;
    anchorX = iconW / 2; anchorY = ph / 2;

  } else {
    const sz = tierB ? 7 : 5;
    html = `<div style="width:${sz}px;height:${sz}px;border-radius:50%;
      background:${col};border:1px solid ${col};cursor:pointer;
      box-shadow:${glow};opacity:${dimOp}"></div>`;
    iconW = sz + 2; iconH = sz + 2;
    anchorX = iconW / 2; anchorY = iconH / 2;
  }

  // Jitter overlapping markers so they don't stack on the same pixel.
  // The offset radius scales with zoom so it always produces ~70px visual
  // separation regardless of zoom level:
  //   r_degrees = 70px ÃƒÆ’Ã¢â‚¬â€ 360 / (256 ÃƒÆ’Ã¢â‚¬â€ 2^zoom)
  let jLat = ev.lat, jLng = ev.lng;
  if (jitterIdx && jitterIdx > 0) {
    const zoom  = lmap ? lmap.getZoom() : 5;
    const r     = (70 * 360 / (256 * Math.pow(2, zoom))) * Math.ceil(jitterIdx / 5);
    const angle = (jitterIdx * 137.5) * (Math.PI / 180); // golden-angle spiral avoids clumping
    jLat = ev.lat + Math.cos(angle) * r;
    jLng = ev.lng + Math.sin(angle) * r;
  }

  const icon = L.divIcon({ className:'', iconSize:[iconW, iconH], iconAnchor:[anchorX, anchorY], html });
  const popup = `<b style="font-family:Syne,sans-serif;color:${acc}">${isFav?'ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦ ':''}${artist}</b><br>
    ${fmtDate(ev.date)}<br>${ev.venue}<br>
    <span style="color:var(--muted)">${ev.city}${ev.country?' '+flag(ev.country):''}</span>
    ${ev.url?`<br><a href="${ev.url}" target="_blank" style="color:${acc}">Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</a>`:''}`;

  const zIdx = Math.round(rank) + (isFav ? 5000 : 0) +
               (urgency === 'urgent' ? 2000 : urgency === 'soon' ? 800 : 0);

  const mk = L.marker([jLat, jLng], { icon, zIndexOffset: zIdx })
    .addTo(lmap).bindPopup(popup);
  mk.on('click', () => { mk.closePopup(); focusArtist(artist); });
  tourMarkers.push(mk);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FESTIVAL MAP ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FESTIVAL DETAIL MODAL ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function openFestDetail(festId) {
  const f = festivals.find(x => x.id === festId);
  if (!f) return;

  const today = new Date().toISOString().split('T')[0];
  const score    = f.score  || 0;
  const matched  = (f.matched || []).slice().sort((a, b) => b.weight - a.weight);
  const lineup   = (f.lineup || []);

  // The "untracked" list: lineup members not in matched (case-insensitive).
  const trackedNames = new Set(matched.map(m => m.artist.toLowerCase()));
  const untracked = lineup.filter(n => n && !trackedNames.has(n.toLowerCase()));

  // Visual accent depends on score tier
  const accentCol = score >= 70 ? 'var(--accent)'
                  : score >= 30 ? 'var(--fest)'
                  : 'var(--muted)';
  const ringCls = score >= 70 ? 'top' : score > 0 ? '' : 'none';
  const ringLabel = score > 0 ? score : 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â';

  // Max weight across matched artists ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â used to normalise play bars
  const maxW = matched.length ? matched[0].weight : 1;

  const loc = [f.venue, f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' Ãƒâ€šÃ‚Â· ');

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Hero section ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  document.getElementById('fd-hero').innerHTML = `
    <button class="fd-close" onclick="closeFestDetail()">ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¢</button>
    <div class="fd-hero-top">
      <div class="fd-score-ring ${ringCls}">${ringLabel}</div>
      <div class="fd-title-block">
        <div class="fd-name">${esc(f.name)}</div>
        <div class="fd-meta">
          <span class="fd-meta-pill">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦ ${fmtDate(f.date)}</span>
          <span class="fd-meta-pill">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â ${esc(loc)}</span>
          ${matched.length ? `<span class="fd-meta-pill" style="border-color:${accentCol};color:${accentCol}">ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦ ${matched.length} of your artists</span>` : ''}
        </div>
        <div style="margin-top:8px">
          ${f.url ? `<a class="fd-tkt-btn" href="${f.url}" target="_blank">ÃƒÂ°Ã…Â¸Ã…Â½Ã…Â¸ Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</a>` : ''}
          <button class="fd-map-btn" onclick="closeFestDetail();clearMapLayers();renderFestMap('${f.id}')">ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã‚Âº View on map</button>
        </div>
      </div>
    </div>`;

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Body: tracked artists ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  let bodyHtml = '';

  if (matched.length) {
    bodyHtml += `<div class="fd-section-hd">Your artists<span>${matched.length}</span></div>`;
    matched.forEach((m, i) => {
      const col     = getColor(m.artist);
      const barPct  = Math.round(m.weight / maxW * 100);
      const playsLbl = m.plays > 0 ? `${m.plays}ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶` : '';
      // Show position rank (#1, #2, ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦) as a subtle contextual hint
      bodyHtml += `
        <div class="fd-artist-row" onclick="closeFestDetail();focusArtist('${m.artist.replace(/'/g,"\\'")}')">
          <span class="fd-artist-rank" style="color:${accentCol}">#${i+1}</span>
          <div class="fd-artist-dot" style="background:${col}"></div>
          <div class="fd-artist-name" style="color:${col}">${esc(m.artist)}</div>
          <div class="fd-artist-bar-wrap">
            <div class="fd-artist-bar" style="width:${barPct}%;background:${col}"></div>
          </div>
          <div class="fd-artist-plays">${playsLbl}</div>
        </div>`;
    });
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Body: full lineup (untracked portion) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  if (untracked.length) {
    if (matched.length) bodyHtml += '<div class="fd-divider"></div>';
    bodyHtml += `<div class="fd-section-hd">Full lineup<span>${lineup.length} artists</span></div>`;
    bodyHtml += '<div class="fd-lineup-grid">';
    // Sort untracked alphabetically for easy scanning
    [...untracked].sort((a, b) => a.localeCompare(b)).forEach(name => {
      bodyHtml += `<span class="fd-lineup-pill">${esc(name)}</span>`;
    });
    bodyHtml += '</div>';
  } else if (!matched.length && !lineup.length) {
    bodyHtml += '<div class="fd-empty">No lineup data available from Ticketmaster for this festival.</div>';
  }

  document.getElementById('fd-body').innerHTML = bodyHtml;

  // Open with animation
  document.getElementById('fd-overlay').classList.add('open');
  document.addEventListener('keydown', _fdKeyHandler);
}

function closeFestDetail() {
  document.getElementById('fd-overlay').classList.remove('open');
  document.removeEventListener('keydown', _fdKeyHandler);
}

function _fdKeyHandler(e) {
  if (e.key === 'Escape') closeFestDetail();
}

function renderFestMap(hlId) {
  festMarkers.forEach(m => m.remove()); festMarkers = [];
  focusedFest = hlId;
  document.querySelectorAll('.fcard').forEach(c => c.classList.toggle('hl', c.dataset.id === hlId));

  const today = new Date().toISOString().split('T')[0];
  const up = festivals.filter(f => f.date >= today && f.lat && f.lng && geoDisplayOk(f.country || ''));
  if (!up.length) return;

  const maxS = Math.max(...up.map(f => f.score||0), 1);

  up.forEach(f => {
    const score = f.score || 0, isHL = f.id === focusedFest;
    // score is 0-100; pct is 0-1 for visual sizing/coloring
    const pct = score / 100;
    const size = isHL ? 32 : score > 0 ? Math.round(10 + pct * 18) : 8;
    const col = isHL ? '#c8ff5f' : pct > .5 ? '#c8ff5f' : pct > .15 ? '#ffaa3c' : score > 0 ? '#ff8c5f' : '#3a3a42';
    const bg = isHL ? 'rgba(200,255,95,.22)' : score > 0 ? `rgba(200,170,95,${.07+pct*.13})` : 'rgba(8,8,10,.75)';
    const glow = isHL ? '0 0 16px rgba(200,255,95,.5)' : score > 0 ? '0 0 6px rgba(200,170,95,.35)' : 'none';
    const mc = (f.matched||[]).length;
    // Show score number inside marker (instead of match count)
    const inner = score > 0 ? `<span style="font-size:${Math.max(.44,.34+pct*.2)}rem;font-weight:700;font-family:'DM Mono',monospace;color:${isHL?'#08080a':col};line-height:1">${score}</span>` : '';
    const label = isHL ? `<div style="position:absolute;bottom:${size+6}px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(8,8,10,.96);border:1.5px solid #c8ff5f;border-radius:5px;padding:3px 9px;font-family:Syne,sans-serif;font-weight:800;font-size:.6rem;color:#c8ff5f;box-shadow:0 2px 14px rgba(0,0,0,.85);pointer-events:none">${f.name}</div>` : '';
    const totalH = size + (isHL ? size+8 : 0);

    const icon = L.divIcon({ className:'', iconSize:[size, totalH], iconAnchor:[size/2, totalH],
      html:`<div style="position:relative;width:${size}px;height:${totalH}px;display:flex;align-items:flex-end;justify-content:center">
        ${label}
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${isHL?2.5:1.5}px solid ${col};display:flex;align-items:center;justify-content:center;box-shadow:${glow};flex-shrink:0">${inner}</div>
      </div>`
    });

    const cc = f.country ? ' '+flag(f.country) : '';
    const matched = f.matched || [];
    const artistChips = matched.map(m => {
      const label = m.plays > 0 ? `${m.artist} <span style="opacity:.55;font-size:.58rem">${m.plays}</span>` : m.artist;
      return `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;margin:2px 2px 0 0;border-radius:100px;background:rgba(200,255,95,.1);border:1px solid rgba(200,255,95,.3);color:#c8ff5f;font-size:.6rem;white-space:nowrap">${label}</span>`;
    }).join('');
    const artistBlock = matched.length
      ? `<div style="margin:6px 0 4px;max-height:120px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:0">ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦ ${artistChips}</div>`
      : '';
    const popup = `<b style="font-family:Syne,sans-serif;color:${score>0?'#c8ff5f':'#ffaa3c'}">${f.name}</b><br>${fmtDate(f.date)} Ãƒâ€šÃ‚Â· ${f.city}${cc}<br>${f.venue?`<span style="color:var(--muted);font-size:.62rem">${f.venue}</span><br>`:''}${artistBlock}${f.url?`<a href="${f.url}" target="_blank" style="color:#ffaa3c">Tickets ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</a>`:''}`;

    const mk = L.marker([f.lat, f.lng], { icon, zIndexOffset: isHL ? 1000 : Math.round(score * 5) })
      .addTo(lmap).bindPopup(popup);
    mk.on('click', () => {
      if (f.id !== focusedFest) {
        renderFestMap(f.id);
        const card = document.querySelector(`.fcard[data-id="${f.id}"]`);
        if (card) card.scrollIntoView({ behavior:'smooth', block:'nearest' });
      }
    });
    festMarkers.push(mk);
  });

  if (hlId) {
    const hf = up.find(f => f.id === hlId);
    if (hf) lmap.flyTo([hf.lat, hf.lng], 7, { duration:.8 });
  } else {
    const matched = up.filter(f => f.score > 0);
    const fits = matched.length ? matched : up;
    if (fits.length === 1) lmap.setView([fits[0].lat, fits[0].lng], 7);
    else lmap.fitBounds(L.latLngBounds(fits.map(f => [f.lat, f.lng])), { padding:[40,40], maxZoom:6 });
  }
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// DEBUG LOG
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
const dbgEntries = [];
let dbgVisible = false;
let dbgFilter  = 'all';        // active filter tab
let dbgBannerDismissed = false;

// Per-type counters and error streak tracking
const dbgStats = { ok:0, error:0, timeout:0, rate:0, net:0 };
let netErrStreak   = 0;  // consecutive network-level errors
let netErrTotal    = 0;  // total network errors this scan
let circuitOpen    = false;  // true when scan is paused for network

const DBG_COLORS = {
  ok:      '#4ade80',
  error:   '#f87171',
  net:     '#ff9f6b',   // network-level errors ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â distinct from API errors
  warn:    '#facc15',
  info:    '#60a5fa',
  timeout: '#fb923c',
  rate:    '#e879f9',
};

// Categorise an error message as 'net' (browser-level) vs 'error' (API-level)
function classifyLevel(level, msg) {
  if (level === 'error' && (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('NETWORK') || msg.includes('net::') || msg.includes('ERR_'))) return 'net';
  return level;
}

// Better human-readable diagnosis for "Failed to fetch"
function diagnoseNetworkError(e, url) {
  const msg = (e?.message || String(e)).toLowerCase();
  if (!navigator.onLine) return 'browser is offline (navigator.onLine = false)';
  if (msg.includes('cors') || msg.includes('cross-origin')) return 'CORS blocked ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TM API not allowing requests from this origin';
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
    if (url?.includes('ticketmaster')) return '"Failed to fetch" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â likely CORS block or TM blocking this origin. Check Network tab for red CORS error.';
    return '"Failed to fetch" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â network request blocked before it left the browser';
  }
  if (msg.includes('abort')) return 'request aborted (timeout)';
  return e?.message || String(e);
}

function dblog(level, msg, detail='') {
  const ts = new Date().toLocaleTimeString('en-GB', { hour12:false });
  const effectiveLevel = classifyLevel(level, msg);
  const entry = { ts, level: effectiveLevel, origLevel: level, msg, detail, col: DBG_COLORS[effectiveLevel] || '#9ca3af' };
  dbgEntries.push(entry);

  // Mirror to onboard minilog ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â only errors and warnings (not OK spam)
  const onboardActive = document.getElementById('onboard-prog-wrap')?.classList.contains('visible');
  if (onboardActive && typeof onboardLog === 'function') {
    if (effectiveLevel === 'net' || effectiveLevel === 'error') {
      onboardLog(msg.slice(0, 120), 'err');
    } else if (effectiveLevel === 'warn') {
      onboardLog(msg.slice(0, 120), 'warn');
    }
  }

  // Update counters
  if (effectiveLevel === 'ok')      dbgStats.ok++;
  else if (effectiveLevel === 'net') { dbgStats.net++; dbgStats.error++; netErrStreak++; netErrTotal++; }
  else if (effectiveLevel === 'error')  dbgStats.error++;
  else if (effectiveLevel === 'timeout') { dbgStats.timeout++; netErrStreak++; }
  else if (effectiveLevel === 'rate') dbgStats.rate++;

  if (effectiveLevel === 'ok' || effectiveLevel === 'info') {
    netErrStreak = Math.max(0, netErrStreak - 1);
  }

  // Circuit breaker: consecutive network failures ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ show banner and pause
  checkCircuitBreaker(effectiveLevel, msg);

  if (dbgVisible) appendDbgRow(entry);
  updateDbgSummary();
}

function updateDbgSummary() {
  const el = document.getElementById('dbg-summary');
  if (!el) return;
  const parts = [];
  if (dbgStats.ok)      parts.push(`<span style="color:#4ade80">ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“${dbgStats.ok}</span>`);
  if (dbgStats.net)     parts.push(`<span style="color:#ff9f6b">ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¡${dbgStats.net}</span>`);
  if (dbgStats.error)   parts.push(`<span style="color:#f87171">ÃƒÂ¢Ã…â€œÃ¢â‚¬â€${dbgStats.error}</span>`);
  if (dbgStats.timeout) parts.push(`<span style="color:#fb923c">ÃƒÂ¢Ã‚ÂÃ‚Â±${dbgStats.timeout}</span>`);
  if (dbgStats.rate)    parts.push(`<span style="color:#e879f9">429:${dbgStats.rate}</span>`);
  el.innerHTML = parts.join(' ');
}

function checkCircuitBreaker(level, msg) {
  const banner = document.getElementById('dbg-banner');
  const bannerText = document.getElementById('dbg-banner-text');
  if (!banner || !bannerText) return;

  // Trip circuit: 5 consecutive network/timeout errors ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ pause dispatch
  if (netErrStreak >= 5 && !circuitOpen) {
    circuitOpen = true;
    dbgBannerDismissed = false;
    const isOffline = !navigator.onLine;
    const proxyAlreadyOn = tmProxyMode !== 'none';
    // Don't auto-switch proxy mode ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â user chose direct, respect that.
    // Just surface a button so they can enable it manually if they want.
    const diagHint = isOffline
      ? 'ÃƒÂ¢Ã…Â¡Ã‚Â  Browser reports you are <strong>offline</strong>. Check your connection.'
      : (proxyAlreadyOn
          ? '"Failed to fetch" even with proxy. The proxy may be down or blocking TM. Try a different proxy in Settings ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Proxy settings.'
          : '"Failed to fetch" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TM is blocking direct requests from your browser (CORS or IP ban).<br>' +
            '&nbsp;<strong>Fix: enable TM proxy in Settings ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Proxy settings</strong>');
    const proxyBtn = (!isOffline && !proxyAlreadyOn)
      ? `&nbsp;<button onclick="setTmProxy('auto');openSettings();setSettingsTab('advanced');dbgDismissBanner()" style="font-family:'DM Mono',monospace;font-size:.6rem;padding:3px 10px;border-radius:4px;border:1px solid var(--accent);background:rgba(200,255,95,.1);color:var(--accent);cursor:pointer;margin-top:4px;display:inline-block">ÃƒÂ¢Ã…Â¡Ã‚Â¡ Enable TM proxy ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</button>`
      : '';
    bannerText.innerHTML = `<strong>ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ ${netErrStreak} consecutive network failures ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â scan paused</strong><br>${diagHint}${proxyBtn}`;
    banner.classList.add('visible');
    dblog('warn', `ÃƒÂ¢Ã‚ÂÃ‚Â¸ Circuit open after ${netErrStreak} net errors ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â new artists queued but paused`);
  } else if (netErrStreak === 0 && circuitOpen) {
    circuitOpen = false;
    banner.classList.remove('visible');
    dbgBannerDismissed = false;
    dblog('ok', 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Network recovered ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â scan resuming');
  } else if (circuitOpen && !dbgBannerDismissed) {
    // Keep updating the count in the banner
    bannerText.querySelector && (bannerText.innerHTML = bannerText.innerHTML.replace(/\d+ consecutive/, `${netErrStreak} consecutive`));
    banner.classList.add('visible');
  }
}

function dbgDismissBanner() {
  dbgBannerDismissed = true;
  circuitOpen = false;  // force-resume scan even with network issues
  document.getElementById('dbg-banner').classList.remove('visible');
  dblog('info', 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Banner dismissed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â scan resuming (errors will continue to retry)');
}

function dbgClear() {
  dbgEntries.length = 0;
  dbgStats.ok = dbgStats.error = dbgStats.timeout = dbgStats.rate = dbgStats.net = 0;
  netErrStreak = netErrTotal = 0;
  circuitOpen = false;
  dbgBannerDismissed = false;
  document.getElementById('dbg-log').innerHTML = '';
  document.getElementById('dbg-banner').classList.remove('visible');
  updateDbgSummary();
}

// Grouping: collapse consecutive same-message errors into one row with a ÃƒÆ’Ã¢â‚¬â€N count
let _lastGroupKey = null;
let _lastGroupRow = null;
let _lastGroupCount = 0;

function appendDbgRow(entry) {
  const log = document.getElementById('dbg-log');
  if (!log) return;

  // Filter visibility
  const visible = dbgFilter === 'all'
    || (dbgFilter === 'net'   && (entry.level === 'net' || entry.level === 'timeout'))
    || (dbgFilter === 'error' && (entry.level === 'error' || entry.level === 'net'))
    || (dbgFilter === 'warn'  && entry.level === 'warn')
    || (dbgFilter === 'ok'    && entry.level === 'ok')
    || (dbgFilter === 'info'  && entry.level === 'info');

  // Group consecutive identical-type entries (e.g. 10ÃƒÆ’Ã¢â‚¬â€ "Failed to fetch")
  const groupKey = entry.level + '|' + entry.msg.slice(0, 60);
  if (groupKey === _lastGroupKey && _lastGroupRow && _lastGroupCount < 50) {
    _lastGroupCount++;
    const countEl = _lastGroupRow.querySelector('.dbg-count');
    if (countEl) { countEl.textContent = `ÃƒÆ’Ã¢â‚¬â€${_lastGroupCount}`; countEl.style.display = ''; }
    else {
      const c = document.createElement('span');
      c.className = 'dbg-count'; c.textContent = `ÃƒÆ’Ã¢â‚¬â€2`;
      _lastGroupRow.appendChild(c);
    }
    _lastGroupRow.classList.toggle('hidden', !visible);
    return;
  }

  _lastGroupKey = groupKey;
  _lastGroupCount = 1;

  const row = document.createElement('div');
  row.className = 'dbg-row' +
    (entry.level === 'net' || entry.level === 'timeout' ? ' net-err' : '') +
    (visible ? '' : ' hidden');
  row.dataset.level = entry.level;

  // Enrich "Failed to fetch" with a hint
  let displayMsg = entry.msg;
  if (entry.level === 'net') {
    displayMsg += ' <em>Ãƒâ€šÃ‚Â· browser blocked request (CORS / offline / IP ban)</em>';
  }

  row.innerHTML =
    `<span class="dbg-ts">${entry.ts}</span>` +
    `<span class="dbg-lvl" style="color:${entry.col}">[${entry.level.toUpperCase()}]</span>` +
    `<span class="dbg-msg">${displayMsg}</span>` +
    (entry.detail ? `<span class="dbg-detail" title="${entry.detail}">${entry.detail}</span>` : '');

  log.appendChild(row);
  _lastGroupRow = row;
  log.scrollTop = log.scrollHeight;
}

function dbgSetFilter(f) {
  dbgFilter = f;
  document.querySelectorAll('.dbg-filter').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.f === f);
  });
  // Re-apply visibility to all rows
  const log = document.getElementById('dbg-log');
  if (!log) return;
  log.querySelectorAll('.dbg-row').forEach(row => {
    const level = row.dataset.level || 'info';
    const visible = f === 'all'
      || (f === 'net'   && (level === 'net' || level === 'timeout'))
      || (f === 'error' && (level === 'error' || level === 'net'))
      || (f === 'warn'  && level === 'warn')
      || (f === 'ok'    && level === 'ok')
      || (f === 'info'  && level === 'info');
    row.classList.toggle('hidden', !visible);
  });
}

function toggleDbg() {
  dbgVisible = !dbgVisible;
  const panel = document.getElementById('dbg-panel');
  panel.classList.toggle('off', !dbgVisible);
  if (dbgVisible) {
    _lastGroupKey = null; _lastGroupRow = null; _lastGroupCount = 0;
    const log = document.getElementById('dbg-log');
    log.innerHTML = '';
    dbgEntries.forEach(appendDbgRow);
    log.scrollTop = log.scrollHeight;
    updateDbgSummary();
  }
}

function copyDbg() {
  const text = dbgEntries.map(e => `${e.ts} [${e.level.toUpperCase()}] ${e.msg}${e.detail?' | '+e.detail:''}`).join('\n');
  navigator.clipboard.writeText(text).catch(() => prompt('Copy this:', text));
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ NETWORK DIAGNOSIS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
async function dbgRunDiagnose() {
  if (!dbgVisible) toggleDbg();
  dblog('info', 'ÃƒÂ°Ã…Â¸Ã‚Â©Ã‚Âº Running network diagnosisÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦');

  // 1. Browser online?
  dblog('info', `navigator.onLine = ${navigator.onLine}`);

  // 2. Can we reach a neutral endpoint?
  const neutralOk = await testUrl('https://www.google.com/favicon.ico', 'Internet (google.com)');
  if (!neutralOk) {
    dblog('error', 'ÃƒÂ¢Ã…Â¡Ã‚Â  Cannot reach google.com ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â you appear to be completely offline');
    return;
  }

  // 3. Can we reach TM's root domain?
  const tmRoot = await testUrl('https://ticketmaster.com/favicon.ico', 'ticketmaster.com root');

  // 4. Can we reach TM's API domain?
  const tmApi = await testUrl(
    `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=test&size=1`,
    'app.ticketmaster.com API'
  );

  if (neutralOk && !tmApi) {
    dblog('net', 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Diagnosis: Internet works but TM API is unreachable.');
    dblog('info', 'Possible causes: CORS block (check browser Network tab for red OPTIONS/GET), IP ban, or TM API outage.');
    dblog('info', 'Try: open the TM URL in a new tab and see if you get a JSON response.');
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=test&size=1`;
    dblog('info', `Direct test URL: ${tmUrl}`);
  } else if (tmApi) {
    dblog('ok', 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ TM API is reachable ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â errors were temporary. Scan will resume automatically.');
    netErrStreak = 0;
    circuitOpen = false;
    dbgBannerDismissed = false;
    document.getElementById('dbg-banner')?.classList.remove('visible');
  }
}

async function testUrl(url, label) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { method:'HEAD', signal: AbortSignal.timeout(5000), mode:'no-cors' });
    dblog('ok', `ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ Reachable: ${label} (${Date.now()-t0}ms)`);
    return true;
  } catch(e) {
    dblog('net', `ÃƒÂ¢Ã…â€œÃ¢â‚¬â€ Unreachable: ${label} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${e.message}`);
    return false;
  }
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// RESIZE
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
(function() {
  const handle = document.getElementById('rhandle');
  const panel = document.getElementById('cal-panel');
  let drag = false, sx = 0, sw = 0, raf = null;

  handle.addEventListener('mousedown', e => {
    drag = true; sx = e.clientX; sw = panel.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cssText = 'cursor:col-resize;user-select:none';
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    if (raf) return; // throttle to 1 rAF per frame
    raf = requestAnimationFrame(() => {
      raf = null;
      const minW = parseFloat(getComputedStyle(document.documentElement).fontSize) * 18;
      panel.style.width = Math.max(minW, Math.min(sw + (e.clientX - sx), window.innerWidth - 400)) + 'px';
      lmap?.invalidateSize();
    });
  });
  document.addEventListener('mouseup', () => {
    if (!drag) return;
    drag = false; handle.classList.remove('dragging');
    document.body.style.cssText = '';
  });
})();

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// ONBOARDING
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// INSTANT RESUME ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â rebuild results from IDB cache without re-scanning
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

// State mirrored from onboard filter panel (applied before entering app)
const PINNED_PLAYLIST = Object.freeze({
  id: '0lXmCRl0wc26aSdwfgIAwQ',
  url: 'https://open.spotify.com/playlist/0lXmCRl0wc26aSdwfgIAwQ',
  name: 'loremcdmx twitch playlist',
  artistCount: 2449,
  trackCount: 5569,
  topArtists: ['Fall Out Boy', 'The Maine', 'Anacondaz', 'Panic! At The Disco'],
});
const DEFAULT_ONBOARD_TITLE = 'Start with Spotify<br>or open the sample';
const DEFAULT_ONBOARD_SUB =
  'Connect Spotify to pick one of your playlists, or open the loremcdmx twitch playlist instantly. Cached scans reopen fast on this device.';
const spotifyAccountState = {
  loaded: false,
  loading: false,
  connected: false,
  user: null,
  playlists: [],
  playlistsLoaded: false,
  playlistsLoading: false,
  error: '',
};
let spotifyAuthFlash = null;

function setSpotifyAuthFlash(message, tone = '') {
  spotifyAuthFlash = message ? { message, tone } : null;
}

function getSpotifyAuthErrorMessage(code) {
  switch (String(code || '').toLowerCase()) {
    case 'access_denied':
      return 'Spotify login was canceled.';
    case 'state_mismatch':
      return 'Spotify login expired before it finished. Try again.';
    case 'token_exchange_failed':
      return 'Spotify login did not complete. Check the redirect URI in the server environment.';
    default:
      return 'Spotify login failed. Try again.';
  }
}

function renderSpotifyPlaylistChoices() {
  const wrap = document.getElementById('onboard-auth-list-wrap');
  const list = document.getElementById('onboard-auth-list');
  if (!wrap || !list) return;

  if (!SERVER_MANAGED_SPOTIFY_LOGIN || !spotifyAccountState.connected) {
    wrap.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  wrap.style.display = '';
  list.innerHTML = '';

  if (spotifyAccountState.playlistsLoading) {
    list.innerHTML = '<div class="onboard-auth-empty">Loading your Spotify playlists...</div>';
    return;
  }

  if (!spotifyAccountState.playlistsLoaded) {
    list.innerHTML = '<div class="onboard-auth-empty">Load your Spotify playlists, then pick one to scan.</div>';
    return;
  }

  if (!spotifyAccountState.playlists.length) {
    list.innerHTML = '<div class="onboard-auth-empty">No playlists found on this Spotify account yet.</div>';
    return;
  }

  spotifyAccountState.playlists.slice(0, 12).forEach(item => {
    const card = document.createElement('div');
    card.className = 'onboard-pl';

    if (item.imageUrl) {
      const coverWrap = document.createElement('div');
      coverWrap.className = 'onboard-pl-cover-wrap';
      const cover = document.createElement('img');
      cover.className = 'onboard-pl-cover';
      cover.src = item.imageUrl;
      cover.alt = '';
      cover.loading = 'lazy';
      coverWrap.appendChild(cover);
      card.appendChild(coverWrap);
    } else {
      const ph = document.createElement('div');
      ph.className = 'onboard-pl-cover-ph';
      ph.textContent = 'ÃƒÂ¢Ã¢â€žÂ¢Ã‚Âª';
      card.appendChild(ph);
    }

    const body = document.createElement('div');
    body.className = 'onboard-pl-body';
    body.innerHTML =
      `<div class="onboard-pl-name">${esc2(item.name || 'Untitled playlist')}</div>` +
      `<div class="onboard-pl-meta">${item.trackCount || 0} tracks${item.ownerName ? ` Ãƒâ€šÃ‚Â· ${esc2(item.ownerName)}` : ''}</div>`;
    card.appendChild(body);

    const arrow = document.createElement('div');
    arrow.className = 'onboard-pl-arrow';
    arrow.innerHTML = '&#x2192;';
    card.appendChild(arrow);

    card.onclick = () => {
      const url = item.url || `https://open.spotify.com/playlist/${item.id}`;
      const inp = document.getElementById('onboard-url');
      if (inp) inp.value = url;
      syncOnboardPrimaryAction();
      handleOnboardPrimaryAction();
    };

    list.appendChild(card);
  });
}

function setSpotifyLocalSetupStatus(message, tone = '') {
  const el = document.getElementById('sp-local-setup-status');
  if (!el) return;
  el.textContent = message || '';
  el.style.color = tone === 'error'
    ? '#ff7070'
    : tone === 'ok'
      ? 'var(--accent)'
      : '';
}

function hasTicketmasterSetup() {
  if (SERVER_MANAGED_TICKETMASTER) return true;
  if ((API_KEY || '').trim()) return true;
  if (Array.isArray(TM_KEYS) && TM_KEYS.some(item => item?.key && item.key !== SERVER_TM_PLACEHOLDER)) {
    return true;
  }
  try {
    return Boolean(
      (localStorage.getItem('tt_key') || '').trim() ||
      (localStorage.getItem('tt3_key') || '').trim(),
    );
  } catch {
    return false;
  }
}

function renderSpotifyLocalSetupPanel() {
  const wrap = document.getElementById('sp-local-setup');
  const redirect = document.getElementById('sp-local-redirect');
  const hint = document.getElementById('sp-local-setup-hint');
  const saveBtn = document.getElementById('sp-local-save-btn');
  const spotifyGuide = document.getElementById('sp-local-spotify-guide');
  const spotifyFields = document.getElementById('sp-local-spotify-fields');
  const redirectRow = document.getElementById('sp-local-redirect-row');
  const tmFields = document.getElementById('sp-local-tm-fields');
  if (!wrap || !redirect || !hint || !saveBtn) return;

  redirect.textContent = SPOTIFY_REDIRECT_URI_HINT;

  if (!LOCAL_SETUP_ALLOWED) {
    wrap.style.display = 'none';
    return;
  }

  const needsSpotify = !SERVER_MANAGED_SPOTIFY_LOGIN;
  const needsTicketmaster = !hasTicketmasterSetup();

  if (!needsSpotify && !needsTicketmaster) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = '';
  if (spotifyGuide) spotifyGuide.style.display = needsSpotify ? '' : 'none';
  if (spotifyFields) spotifyFields.style.display = needsSpotify ? '' : 'none';
  if (redirectRow) redirectRow.style.display = needsSpotify ? '' : 'none';
  if (tmFields) tmFields.style.display = needsTicketmaster ? '' : 'none';

  if (needsSpotify && needsTicketmaster) {
    hint.textContent = 'Finish Spotify login setup and add at least one Ticketmaster key so playlist scans can immediately fetch concerts.';
    saveBtn.textContent = 'Save Spotify + Ticketmaster locally';
  } else if (needsSpotify) {
    hint.textContent = 'Use the Spotify Dashboard link below, copy Client ID and Client Secret, then add the Redirect URI shown here.';
    saveBtn.textContent = 'Save Spotify locally & enable login';
  } else {
    hint.textContent = 'Spotify is already configured on this local server. Add a Ticketmaster key once to enable live concert and festival scans.';
    saveBtn.textContent = 'Save Ticketmaster key locally';
  }
  saveBtn.disabled = false;
}

function focusSpotifyLocalSetup() {
  const input = !SERVER_MANAGED_SPOTIFY_LOGIN
    ? document.getElementById('sp-local-client-id')
    : document.getElementById('sp-local-ticketmaster-keys');
  if (input) input.focus();
}

function openTicketmasterSetup() {
  showOnboard();
  showNewImport();
  if (typeof openSettings === 'function') {
    openSettings();
    if (typeof setSettingsTab === 'function') setSettingsTab('advanced');
  }
  renderSpotifyLocalSetupPanel();
  setTimeout(() => {
    const input = document.getElementById('sp-local-ticketmaster-keys')
      || document.getElementById('api-input');
    if (input) input.focus();
  }, 60);
}

async function saveSpotifyLocalSetup() {
  const clientId = (document.getElementById('sp-local-client-id')?.value || '').trim();
  const clientSecret = (document.getElementById('sp-local-client-secret')?.value || '').trim();
  const ticketmasterApiKeys = (document.getElementById('sp-local-ticketmaster-keys')?.value || '').trim();
  const saveBtn = document.getElementById('sp-local-save-btn');
  const needsSpotify = !SERVER_MANAGED_SPOTIFY_LOGIN;
  const savingSpotify = needsSpotify || clientId || clientSecret;
  const savingTicketmaster = !!ticketmasterApiKeys;

  if (!savingSpotify && !savingTicketmaster) {
    setSpotifyLocalSetupStatus('Paste Spotify credentials or at least one Ticketmaster API key.', 'error');
    focusSpotifyLocalSetup();
    return;
  }

  if (savingSpotify && (!clientId || !clientSecret)) {
    setSpotifyLocalSetupStatus('Paste both Spotify Client ID and Client Secret.', 'error');
    if (!clientId) document.getElementById('sp-local-client-id')?.focus();
    else document.getElementById('sp-local-client-secret')?.focus();
    return;
  }

  if (saveBtn) saveBtn.disabled = true;
  setSpotifyLocalSetupStatus(
    savingSpotify && savingTicketmaster
      ? 'Saving Spotify and Ticketmaster setup locally...'
      : savingSpotify
        ? 'Saving Spotify setup locally...'
        : 'Saving Ticketmaster keys locally...',
    '',
  );

  try {
    const body = {};
    if (savingSpotify) {
      body.spotifyClientId = clientId;
      body.spotifyClientSecret = clientSecret;
    }
    if (savingTicketmaster) {
      body.ticketmasterApiKeys = ticketmasterApiKeys;
    }
    const res = await fetch('/api/local/setup', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Local setup failed (${res.status}).`);
    }

    setSpotifyLocalSetupStatus('Saved. Reloading local setup...', 'ok');
    setSpotifyAuthFlash(
      data.message || 'Local provider setup saved. Reloading now.',
      'ok',
    );
    setTimeout(() => window.location.reload(), 900);
  } catch (e) {
    setSpotifyLocalSetupStatus(e.message || 'Could not save local provider setup.', 'error');
    if (saveBtn) saveBtn.disabled = false;
  }
}

function renderSpotifyAccessButton() {
  const btn = document.getElementById('spotify-auth-btn');
  if (!btn) return;

  btn.classList.remove('setup', 'connected');
  btn.disabled = false;

  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    btn.textContent = 'Spotify Setup';
    btn.classList.add('setup');
    btn.title = 'Spotify login is not configured on this server yet.';
    return;
  }

  if (spotifyAccountState.loading || spotifyAccountState.playlistsLoading) {
    btn.textContent = 'Spotify...';
    btn.disabled = true;
    btn.title = 'Checking Spotify status...';
    return;
  }

  if (spotifyAccountState.connected) {
    btn.textContent = 'Spotify Ready';
    btn.classList.add('connected');
    btn.title = spotifyAccountState.user?.displayName
      ? `Connected as ${spotifyAccountState.user.displayName}`
      : 'Spotify is connected.';
    return;
  }

  btn.textContent = 'Connect Spotify';
  btn.title = 'Connect Spotify and pick a playlist.';
}

function renderOnboardSpotifyAuth() {
  const wrap = document.getElementById('onboard-auth-wrap');
  const button = document.getElementById('onboard-auth-btn');
  const logout = document.getElementById('onboard-auth-logout');
  const status = document.getElementById('onboard-auth-status');
  if (!wrap || !button || !logout || !status) return;
  renderSpotifyLocalSetupPanel();

  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    wrap.style.display = '';
    button.disabled = false;
    button.textContent = 'Open Spotify setup';
    logout.style.display = 'none';
    status.textContent = LOCAL_SETUP_ALLOWED
      ? `Spotify login is not configured yet. Open setup and add your Spotify Client ID + Client Secret. Redirect URI: ${SPOTIFY_REDIRECT_URI_HINT}`
      : 'Spotify login is not configured on this server yet. Add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SESSION_SECRET in .env or Vercel, then reload.';
    status.dataset.tone = 'error';
    renderSpotifyPlaylistChoices();
    renderSpotifyAccessButton();
    renderOnboardSetupNotice();
    return;
  }

  wrap.style.display = '';
  button.disabled = spotifyAccountState.loading || spotifyAccountState.playlistsLoading;

  if (!spotifyAccountState.loaded || spotifyAccountState.loading) {
    button.textContent = 'Checking Spotify...';
  } else if (!spotifyAccountState.connected) {
    button.textContent = 'Continue with Spotify';
  } else if (spotifyAccountState.playlistsLoading) {
    button.textContent = 'Loading playlists...';
  } else if (spotifyAccountState.playlistsLoaded) {
    button.textContent = 'Refresh playlists';
  } else {
    button.textContent = 'Show my playlists';
  }

  logout.style.display = spotifyAccountState.connected ? '' : 'none';

  let message = '';
  let tone = '';
  if (spotifyAuthFlash && spotifyAuthFlash.message) {
    message = spotifyAuthFlash.message;
    tone = spotifyAuthFlash.tone || '';
  } else if (spotifyAccountState.error) {
    message = spotifyAccountState.error;
    tone = 'error';
  } else if (spotifyAccountState.connected) {
    const name = spotifyAccountState.user?.displayName || 'Spotify';
    message = `${name} connected. Pick one of your playlists or open the sample below.`;
    tone = 'ok';
  } else {
    message = 'Connect Spotify to browse your playlists, or open the sample below.';
  }

  status.textContent = message;
  status.dataset.tone = tone;
  renderSpotifyPlaylistChoices();
  renderSpotifyAccessButton();
  renderOnboardSetupNotice();
}

function renderOnboardSetupNotice() {
  const wrap = document.getElementById('onboard-setup-note');
  const status = document.getElementById('onboard-setup-status');
  const btn = document.getElementById('onboard-tm-setup-btn');
  if (!wrap || !status || !btn) return;

  if (hasTicketmasterSetup()) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = '';
  status.textContent = SERVER_MANAGED_SPOTIFY_LOGIN
    ? 'Spotify is ready. Add one free Ticketmaster key to unlock live concert and festival scans for your playlists.'
    : 'After Spotify setup, you will still need one Ticketmaster key for live concert and festival scans.';
  btn.textContent = 'Add Ticketmaster key';
}

async function refreshSpotifyAccount(opts = {}) {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) return null;

  spotifyAccountState.loading = true;
  spotifyAccountState.error = '';
  renderOnboardSpotifyAuth();

  try {
    const res = await fetch('/api/auth/spotify/session', {
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || `Spotify session check failed (${res.status}).`);
      error.status = res.status;
      throw error;
    }

    spotifyAccountState.loaded = true;
    spotifyAccountState.connected = !!data.connected;
    spotifyAccountState.user = data.user || null;
    spotifyAccountState.error = '';
    if (!spotifyAccountState.connected) {
      spotifyAccountState.playlists = [];
      spotifyAccountState.playlistsLoaded = false;
      spotifyAccountState.playlistsLoading = false;
    }
  } catch (e) {
    spotifyAccountState.loaded = true;
    spotifyAccountState.connected = false;
    spotifyAccountState.user = null;
    spotifyAccountState.playlists = [];
    spotifyAccountState.playlistsLoaded = false;
    spotifyAccountState.playlistsLoading = false;
    spotifyAccountState.error = e.message || 'Spotify is unavailable right now.';
  } finally {
    spotifyAccountState.loading = false;
    renderOnboardSpotifyAuth();
  }

  if (spotifyAccountState.connected && opts.withPlaylists) {
    return loadSpotifyAccountPlaylists(Boolean(opts.force));
  }

  return spotifyAccountState;
}

async function loadSpotifyAccountPlaylists(force = false) {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN || !spotifyAccountState.connected) return [];
  if (spotifyAccountState.playlistsLoaded && !force) {
    renderOnboardSpotifyAuth();
    return spotifyAccountState.playlists;
  }

  spotifyAccountState.playlistsLoading = true;
  spotifyAccountState.error = '';
  renderOnboardSpotifyAuth();

  try {
    const res = await fetch('/api/spotify/me/playlists', {
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || `Spotify playlists failed (${res.status}).`);
      error.status = res.status;
      throw error;
    }
    spotifyAccountState.playlists = Array.isArray(data.items) ? data.items : [];
    spotifyAccountState.playlistsLoaded = true;
    spotifyAccountState.error = '';
  } catch (e) {
    if (e.status === 401) {
      spotifyAccountState.connected = false;
      spotifyAccountState.user = null;
      spotifyAccountState.playlists = [];
      spotifyAccountState.playlistsLoaded = false;
      spotifyAccountState.error = 'Spotify session expired. Connect again.';
    } else {
      spotifyAccountState.error = e.message || 'Could not load Spotify playlists.';
    }
  } finally {
    spotifyAccountState.playlistsLoading = false;
    renderOnboardSpotifyAuth();
  }

  return spotifyAccountState.playlists;
}

function handleSpotifyAuthReturnFlag() {
  const url = new URL(window.location.href);
  const status = url.searchParams.get('spotify');
  if (!status) return;

  if (status === 'connected') {
    setSpotifyAuthFlash('Spotify connected. Pick a playlist or open the sample below.', 'ok');
  } else {
    setSpotifyAuthFlash(
      getSpotifyAuthErrorMessage(url.searchParams.get('code')),
      'error',
    );
  }

  url.searchParams.delete('spotify');
  url.searchParams.delete('code');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

async function onboardSpotifyAuthAction() {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    setSpotifyAuthFlash('Spotify login is not configured yet. Finish server setup, then reload this page.', 'error');
    renderOnboardSpotifyAuth();
    if (typeof openSettings === 'function') {
      openSettings();
      if (typeof setSettingsTab === 'function') setSettingsTab('advanced');
    }
    setTimeout(focusSpotifyLocalSetup, 60);
    return;
  }
  if (!spotifyAccountState.connected) {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/api/auth/spotify/login?returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }
  await loadSpotifyAccountPlaylists(true);
}

function openSpotifyAccess() {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    setSpotifyAuthFlash('Spotify login is not configured yet. Finish server setup, then reload this page.', 'error');
    showOnboard();
    showNewImport();
    if (typeof openSettings === 'function') {
      openSettings();
      if (typeof setSettingsTab === 'function') setSettingsTab('advanced');
    }
    renderOnboardSpotifyAuth();
    setTimeout(focusSpotifyLocalSetup, 60);
    return;
  }

  if (spotifyAccountState.connected) {
    showOnboard();
    showNewImport();
    loadSpotifyAccountPlaylists(true).catch(() => {});
    return;
  }

  onboardSpotifyAuthAction();
}

async function spotifyLogout() {
  try {
    await fetch('/api/auth/spotify/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch (e) {
    // keep local state reset even if the network call fails
  }

  spotifyAccountState.loaded = true;
  spotifyAccountState.loading = false;
  spotifyAccountState.connected = false;
  spotifyAccountState.user = null;
  spotifyAccountState.playlists = [];
  spotifyAccountState.playlistsLoaded = false;
  spotifyAccountState.playlistsLoading = false;
  spotifyAccountState.error = '';
  setSpotifyAuthFlash('Spotify disconnected. You can still open the sample below.');
  renderOnboardSpotifyAuth();
  renderSpotifyAccessButton();
}

function samePlaylistUrl(a, b) {
  const aId = spExtractId(a || '');
  const bId = spExtractId(b || '');
  return !!aId && aId === bId;
}

function getDefaultOnboardPlaylistUrl() {
  return getOnboardHistory()[0]?.url || PINNED_PLAYLIST.url;
}

function syncOnboardPrimaryAction() {
  const inp = document.getElementById('onboard-url');
  const btn = document.getElementById('onboard-btn');
  if (!btn) return;
  const raw = (inp?.value || '').trim();
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (samePlaylistUrl(raw, latestUrl)) {
    btn.textContent = 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Open last';
  } else if (samePlaylistUrl(raw, PINNED_PLAYLIST.url)) {
    btn.textContent = 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Open sample';
  } else {
    btn.textContent = 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Start scan';
  }
}

function primeOnboardPlaylistInput() {
  const inp = document.getElementById('onboard-url');
  if (!inp) return;
  if (!inp.value.trim()) inp.value = getDefaultOnboardPlaylistUrl();
  syncOnboardPrimaryAction();
}

function focusOnboardPlaylistInput(selectText = false) {
  const inp = document.getElementById('onboard-url');
  if (!inp) return;
  inp.focus();
  if (selectText) inp.select();
}

function usePinnedPlaylist(opts = {}) {
  const inp = document.getElementById('onboard-url');
  if (inp) inp.value = PINNED_PLAYLIST.url;
  syncOnboardPrimaryAction();
  if (opts.start) return handleOnboardPrimaryAction();
  focusOnboardPlaylistInput();
  return Promise.resolve(false);
}

function canInstantResumeFor(rawValue, info) {
  if (!info || info.artistCount <= 0) return false;
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (!rawValue) return true;
  if (!latestUrl) return true;
  return samePlaylistUrl(rawValue, latestUrl);
}

async function handleOnboardPrimaryAction() {
  primeOnboardPlaylistInput();
  return resumeOrImport();
}

let _obGeo   = 'nousa';  // mirrors geoQuick
let _obScore = 0;        // mirrors calScoreFilter

function obSetGeo(mode) {
  _obGeo = mode;
  document.querySelectorAll('.obf-btn[id^="obfq-"]').forEach(b => b.classList.remove('on'));
  const el = document.getElementById('obfq-' + mode);
  if (el) el.classList.add('on');
}

function obSetScore(level) {
  _obScore = level;
  document.querySelectorAll('.obf-btn[data-os]').forEach(b =>
    b.classList.toggle('on', parseInt(b.dataset.os) === level));
}

// Check IDB for cached artist data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â returns summary or null
async function checkIDBCache() {
  try {
    const keys = await DB.keys('artists');
    // Filter out special keys
    const artistKeys = keys.filter(k => k !== '__ping__');
    if (!artistKeys.length) return null;
    // Count total cached shows
    let concertCount = 0;
    const today = new Date().toISOString().split('T')[0];
    for (const key of artistKeys) {
      try {
        const rec = await DB.get('artists', key);
        if (rec?.shows) concertCount += rec.shows.filter(s => s.date >= today).length;
      } catch {}
    }
    // Get festival cache
    let festCount = 0;
    try {
      const fc = await DB.get('meta', 'festivals');
      if (fc?.data) festCount = fc.data.filter(f => f.date >= today).length;
    } catch {}
    return { artistCount: artistKeys.length, concertCount, festCount };
  } catch { return null; }
}

// Rebuild concerts + festivals from IDB cache instantly
async function instantResume(opts = {}) {
  const btn = document.getElementById('onboard-resume-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'ÃƒÂ¢Ã…Â¸Ã‚Â³ LoadingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦'; }

  // Show a brief loading hint on the onboard card (auto-resume case)
  const titleEl = document.getElementById('onboard-resume-title');
  const importPanelEl = document.getElementById('onboard-import-panel');
  if (!opts.manual) {
    // Auto-resume: hide import panel, show a spinner in the card
    if (importPanelEl) importPanelEl.style.display = 'none';
    const resumeEl = document.getElementById('onboard-resume');
    if (resumeEl) {
      resumeEl.style.display = '';
      // Build stat summary while loading
      const hist = getOnboardHistory();
      const plName = hist[0]?.name || 'Your playlist';
      const lastScan = hist[0]?.ts ? tsAgo(hist[0].ts) : '';
      if (titleEl) titleEl.textContent = plName;
      const metaEl = document.getElementById('onboard-resume-meta');
      if (metaEl) metaEl.textContent = lastScan ? `last scan ${lastScan}` : '';
      const statsEl = document.getElementById('onboard-resume-stats');
      if (statsEl) statsEl.innerHTML = '<div class="onboard-resume-stat" style="color:var(--muted2)">Loading from cacheÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</div>';
    }
  }

  // Apply onboard filters to toolbar state
  setGeoQuick(_obGeo);  // converts legacy mode ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ geoNoUSA/geoNoCA + syncs buttons
  calScoreFilter = _obScore;
  document.querySelectorAll('#score-filter-row .plays-chip').forEach(c =>
    c.classList.toggle('on', parseInt(c.dataset.s) === calScoreFilter));

  // Apply min-tracks filter ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â same logic as runSpotifyImport but applied here
  // so Quick Load respects the chip selection too
  if (_minTracksFilter > 1 && ARTIST_PLAYS && Object.keys(ARTIST_PLAYS).length) {
    const before = ARTISTS.length;
    ARTISTS = ARTISTS.filter(name => (ARTIST_PLAYS[name.toLowerCase()] || 0) >= _minTracksFilter);
    const skipped = before - ARTISTS.length;
    if (skipped > 0) dblog('info', `Min-tracks filter (>=${_minTracksFilter}): kept ${ARTISTS.length} artists, skipped ${skipped}`);
  }

  const today = new Date().toISOString().split('T')[0];
  try {
    // Rebuild concerts from IDB artist cache
    const keys = await DB.keys('artists');
    const artistKeys = keys.filter(k => k !== '__ping__');
    concerts = [];
    for (const key of artistKeys) {
      try {
        const rec = await DB.get('artists', key);
        if (rec?.shows) concerts.push(...rec.shows.filter(s => s.date >= today));
      } catch {}
    }
    concerts = deduplicateConcerts(concerts);

    // Rebuild festivals from IDB meta cache
    try {
      const fc = await DB.get('meta', 'festivals');
      if (fc?.data) festivals = deduplicateFestivals(fc.data.filter(f => f.date >= today));
    } catch {}

    cacheTimestamp = Date.now();

    if (festivals.length && ARTISTS.length) scoreFestivals();

    const age = cacheAge() || 'cached';
    setStatus(`ÃƒÂ¢Ã¢â‚¬Â Ã‚Â» Resumed Ãƒâ€šÃ‚Â· ${concerts.length} concerts Ãƒâ€šÃ‚Â· ${festivals.length} festivals Ãƒâ€šÃ‚Â· ${age} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use ÃƒÂ¢Ã¢â‚¬Â Ã‚Â» Merge rescan to refresh`, true);
    /* refresh-btn removed */

    buildCalChips(); renderCalendar(); renderMap();
    hideOnboard();

  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Resume session'; }
    const statusEl = document.getElementById('onboard-status-text');
    if (statusEl) statusEl.textContent = 'ÃƒÂ¢Ã…Â¡Ã‚Â  Resume failed: ' + e.message;
    // Fall back to showing the import panel
    if (importPanelEl) importPanelEl.style.display = '';
    const resumeEl = document.getElementById('onboard-resume');
    if (resumeEl) resumeEl.style.display = 'none';
  }
}

// Show new import panel (switch from resume UI)
function showNewImport() {
  document.getElementById('onboard-resume').style.display = 'none';
  document.getElementById('onboard-import-panel').style.display = '';
  renderOnboardSpotifyAuth();
  primeOnboardPlaylistInput();
  setTimeout(() => {
    focusOnboardPlaylistInput();
  }, 80);
}

function showOnboard() {
  const el = document.getElementById('onboard');
  if (!el) return;
  el.classList.remove('hidden');
  renderOnboardSpotifyAuth();
  renderOnboardHistory();
  primeOnboardPlaylistInput();
  setTimeout(_paintPinnedMosaic, 0);
  // Show "back to last session" only if there's cached data
  const skip = document.getElementById('onboard-skip');
  if (skip) skip.style.display = (concerts.length || festivals.length) ? '' : 'none';
  // Focus the input after a brief delay
  setTimeout(() => {
    focusOnboardPlaylistInput();
  }, 150);
}

function hideOnboard() {
  const el = document.getElementById('onboard');
  if (el) el.classList.add('hidden');
}

// Saved playlists store for onboarding history
function getOnboardHistory() {
  try { return JSON.parse(localStorage.getItem('tt_pl_history') || '[]'); } catch { return []; }
}
function saveOnboardHistory(list) {
  localStorage.setItem('tt_pl_history', JSON.stringify(list.slice(0, 10)));
}
function addToOnboardHistory(name, url, trackCount, artistCount, coverUrl, topArtists, meta) {
  const list = getOnboardHistory();
  const existing = list.findIndex(p => p.url === url);
  if (existing >= 0) list.splice(existing, 1);
  list.unshift({ name, url, trackCount, artistCount, coverUrl: coverUrl || '', topArtists: topArtists || [], ts: Date.now(), ...(meta||{}) });
  saveOnboardHistory(list);
}

function tsAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h/24)}d ago`;
}

function renderOnboardHistory() {
  const list = getOnboardHistory();
  const wrap = document.getElementById('onboard-history-wrap');
  const hist = document.getElementById('onboard-history');
  if (!wrap || !hist) return;
  if (!list.length) { wrap.style.display = 'none'; } else {
    wrap.style.display = '';
    hist.innerHTML = '';
    list.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'onboard-pl';
      const ago = tsAgo(p.ts);
      const artists = (p.topArtists || []).slice(0, 4);
      const chips = artists.map(a => `<span class="onboard-pl-chip">${esc2(a)}</span>`).join('');
      el.innerHTML = `
        <canvas class="onboard-pl-canvas" width="68" height="68"
          style="width:68px;height:68px;flex-shrink:0;display:block"></canvas>
        <div class="onboard-pl-body">
          <div class="onboard-pl-name">${esc2(p.name)}</div>
          <div class="onboard-pl-meta">${p.artistCount||'?'} artists &middot; ${p.trackCount||'?'} tracks &middot; ${ago}</div>
          ${chips ? `<div class="onboard-pl-chips">${chips}</div>` : ''}
        </div>
        <div class="onboard-pl-arrow">&#x2192;</div>
        <button class="onboard-pl-del" title="Remove from history" onclick="removeOnboardHistory(event,${i})">&#xd7;</button>`;
      // Draw mosaic on the canvas
      _drawPlaylistMosaic(el.querySelector('canvas'), artists);
      el.onclick = e => {
        if (e.target.classList.contains('onboard-pl-del')) return;
        document.getElementById('onboard-url').value = p.url;
        syncOnboardPrimaryAction();
        handleOnboardPrimaryAction();
      };
      hist.appendChild(el);
    });
  }
  // Hide quick-load card if this playlist is already in history (avoid duplication)
  const alreadyInHistory = list.some(p => samePlaylistUrl(p.url || '', PINNED_PLAYLIST.url));
  const ql = document.getElementById('onboard-quickload');
  if (ql) ql.style.display = alreadyInHistory ? 'none' : '';
}

function removeOnboardHistory(e, i) {
  e.stopPropagation();
  const list = getOnboardHistory();
  list.splice(i, 1);
  saveOnboardHistory(list);
  renderOnboardHistory();
}

function esc2(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let _onboardTimerInt = null;
let _onboardStartTs  = 0;
let _onboardAborted  = false;

function onboardSetStatus(msg, color) {
  const el = document.getElementById('onboard-status-text');
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || '';
  // Auto-show proxy row on error
  const proxyRow = document.getElementById('onboard-proxy-row');
  if (proxyRow) {
    const isError = color === '#ff7070' || (msg && msg.startsWith('ÃƒÂ¢Ã…Â¡Ã‚Â '));
    proxyRow.style.display = isError ? '' : 'none';
    if (isError) syncOnboardProxyBtns();
  }
}

let _minTracksFilter = 1; // global: min track count for artist to be included in scan

function setMinTracks(v) {
  _minTracksFilter = v;
  document.querySelectorAll('.onboard-mt-chip').forEach(b =>
    b.classList.toggle('on', +b.dataset.v === v));
  const hint = document.getElementById('onboard-mintracks-hint');
  if (hint) {
    if (v <= 1) {
      hint.textContent = 'all artists';
    } else if (ARTIST_PLAYS && Object.keys(ARTIST_PLAYS).length && ARTISTS.length) {
      const passing = ARTISTS.filter(name => (ARTIST_PLAYS[name.toLowerCase()] || 0) >= v).length;
      hint.textContent = passing + ' of ' + ARTISTS.length + ' artists';
    } else {
      hint.textContent = 'artists with <' + v + ' tracks skipped';
    }
  }
  document.querySelectorAll('.settings-mt-chip').forEach(b =>
    b.classList.toggle('on', +b.dataset.v === v));
}

function onboardSetSpProxy(mode) {
  setSpProxy(mode);
  syncOnboardProxyBtns();
}

function syncOnboardProxyBtns() {
  document.querySelectorAll('.onboard-proxy-btn').forEach(b =>
    b.classList.toggle('on', b.dataset.p === spProxyMode));
}

function onboardLog(msg, type) {
  const box = document.getElementById('onboard-minilog');
  if (!box) return;
  const colors = { ok:'#4cd97a', warn:'#ffaa3c', err:'#ff7070', net:'#ff9f6b' };
  const line = document.createElement('div');
  line.style.color = colors[type] || 'var(--muted)';
  const ts = Math.round((Date.now() - _onboardStartTs) / 1000);
  line.textContent = `[${ts}s] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function onboardShowProgress(label) {
  const wrap = document.getElementById('onboard-prog-wrap');
  if (wrap) wrap.classList.add('visible');
  const fill = document.getElementById('onboard-prog-fill');
  if (fill) fill.style.width = '5%';
  const lbl = document.getElementById('onboard-prog-label');
  if (lbl) lbl.textContent = label || 'ConnectingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦';
  _onboardStartTs = Date.now();
  _onboardAborted = false;
  // Clear minilog
  const logBox = document.getElementById('onboard-minilog');
  if (logBox) logBox.innerHTML = '';
  const logWrap = document.getElementById('onboard-minilog-wrap');
  if (logWrap) logWrap.style.display = 'none';

  clearInterval(_onboardTimerInt);
  _onboardTimerInt = setInterval(() => {
    const elapsed = Math.round((Date.now() - _onboardStartTs) / 1000);
    const el = document.getElementById('onboard-prog-timer');
    if (el) el.textContent = elapsed + 's';
    // Show log after 5 seconds
    if (elapsed >= 5 && logWrap) logWrap.style.display = '';
    // Only warn if genuinely stuck ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â progress bar still at 5% (no tracks fetched yet)
    const fill = document.getElementById('onboard-prog-fill');
    const pct = fill ? parseFloat(fill.style.width) : 0;
    if (elapsed === 10 && pct < 10) {
      onboardLog('Still on auth/first page after 10s ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â possible IP block', 'warn');
      onboardLog('Try: cancel ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ enable ÃƒÂ¢Ã…Â¡Ã‚Â¡ Auto-fallback proxy ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ retry', 'warn');
      // Auto-show proxy row
      const pr = document.getElementById('onboard-proxy-row');
      if (pr) { pr.style.display = ''; syncOnboardProxyBtns(); }
    }
  }, 1000);
}

function onboardHideProgress() {
  const wrap = document.getElementById('onboard-prog-wrap');
  if (wrap) wrap.classList.remove('visible');
  clearInterval(_onboardTimerInt);
  _onboardTimerInt = null;
  const timer = document.getElementById('onboard-prog-timer');
  if (timer) timer.textContent = '';
}

function onboardSetProgress(done, total) {
  const fill = document.getElementById('onboard-prog-fill');
  const lbl  = document.getElementById('onboard-prog-label');
  const pct  = total ? Math.round(done / total * 100) : 20;
  if (fill) fill.style.width = pct + '%';
  if (lbl)  lbl.textContent = total ? `Fetched ${done} / ${total} tracksÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦` : 'AuthenticatingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦';
}

function onboardClearProgress() {
  onboardHideProgress();
}

function onboardCancel() {
  _onboardAborted = true;
  onboardHideProgress();
  onboardSetStatus('Cancelled.');
  spTokenCache = null; // force fresh token next attempt
  const btn = document.getElementById('onboard-btn');
  if (btn) btn.disabled = false;
  syncOnboardPrimaryAction();
}


// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Shared Spotify import logic ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Used by both onboarding screen and settings modal.
// opts.mode: 'onboard' | 'settings'
// Returns true on success, false on failure.
async function runSpotifyImport(opts = {}) {
  const mode = opts.mode || 'onboard';
  const isOnboard = mode === 'onboard';

  const urlInputId = isOnboard ? 'onboard-url' : 'sp-playlist-url';
  const btnId      = isOnboard ? 'onboard-btn'  : 'sp-import-btn';

  const raw = ((document.getElementById(urlInputId)?.value || '').trim()) || (isOnboard ? getDefaultOnboardPlaylistUrl() : '');
  const pid = spExtractId(raw);

  if (!pid) {
    if (isOnboard) onboardSetStatus('ÃƒÂ¢Ã…Â¡Ã‚Â  Paste a valid Spotify playlist URL', '#ff7070');
    else spSetError("Couldn't parse playlist ID ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â paste the full Spotify URL.");
    return false;
  }

  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = true; btn.textContent = isOnboard ? 'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦' : 'ImportingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦'; }

  // Show progress immediately so user sees something is happening
  if (isOnboard) onboardShowProgress('Connecting to SpotifyÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦');

  // Sync progress to whichever UI is active
  const setStatus = isOnboard
    ? (msg, color) => onboardSetStatus(msg, color)
    : (msg, color) => { const el = document.getElementById('hero-status-text'); if (el) { el.style.color = color||''; el.textContent = msg; } };

  const setProgress = isOnboard
    ? (done, total) => {
        if (_onboardAborted) return;
        onboardSetProgress(done, total);
      }
    : (done, total) => spSetProgress(done, total);

  const clearProgress = isOnboard ? onboardClearProgress : spClearProgress;

  try {
    setStatus('Authenticating with SpotifyÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', '');

    // Temporarily hook spSetProgress for the shared fetch function
    const _origSpSetProg = window._spProgHook;
    window._spProgHook = setProgress;

    const token = await spGetToken();
    if (isOnboard && _onboardAborted) return false;
    if (isOnboard) onboardSetProgress(0, 0); // show indeterminate progress
    setStatus('Fetching playlistÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦', '');

    const { playlist: pl, tracks } = await spFetchAllTracks(token, pid);
    if (isOnboard && _onboardAborted) return false;

    window._spProgHook = _origSpSetProg;

    const artistMap = spBuildArtistMap(tracks);
    const allArtists = Object.values(artistMap).sort((a, b) => b.count - a.count);
    const minT = _minTracksFilter || 1;
    const artists = minT > 1 ? allArtists.filter(a => a.count >= minT) : allArtists;
    const skipped = allArtists.length - artists.length;
    if (skipped > 0) dblog('info', `Min-tracks filter (ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¥${minT}): kept ${artists.length} artists, skipped ${skipped} with fewer tracks`);
    const lines = artists.map(a => `${a.name} ${a.count}`);

    // Populate artist textarea
    const ta = document.getElementById('artists-ta');
    if (ta) ta.value = lines.join('\n');
    updateArtistCount();

    // Save to history
    const coverUrl = pl.images?.[0]?.url || '';
    const topArtists = artists.slice(0, 8).map(a => a.name);
    addToOnboardHistory(pl.name || 'Playlist', raw, tracks.length, artists.length, coverUrl, topArtists);

    // Keep both URL inputs in sync
    const onboardInput = document.getElementById('onboard-url');
    const settingsInput = document.getElementById('sp-playlist-url');
    if (onboardInput  && onboardInput.value  !== raw) onboardInput.value  = raw;
    if (settingsInput && settingsInput.value !== raw) settingsInput.value = raw;

    clearProgress();
    const skipNote = skipped > 0 ? ` (${skipped} skipped <${minT}tr)` : '';
    setStatus(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“ "${pl.name}" Ãƒâ€šÃ‚Â· ${artists.length} artists${skipNote} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â scanningÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`, 'var(--accent)');

    setTimeout(() => {
      // profHideEmpty() resets the onboard title/subtitle back to their
      // default wording (in case we were showing the per-profile import prompt)
      // and then calls hideOnboard() ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â so it's safe to call unconditionally.
      if (isOnboard) profHideEmpty(); else closeSettings();
      saveAndFetch(false);
    }, 700);

    return true;

  } catch(e) {
    clearProgress();
    // Detect likely IP-block / timeout ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â add a proxy hint
    const isBlock = e.message && (e.message.includes('8Ãƒâ€˜Ã‚Â') || e.message.includes('blocked') ||
      e.message.includes('Failed to fetch') || e.message.includes('NetworkError'));
    const proxyHint = (isBlock && spProxyMode === 'none')
      ? ' ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ÃƒÂÃ…Â¸ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¿Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â±Ãƒâ€˜Ã†â€™ÃƒÂÃ‚Â¹ ÃƒÂ¢Ã…Â¡Ã‚Â¡ Auto-fallback proxy ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¶ÃƒÂÃ‚Âµ.' : '';
    const msg = 'ÃƒÂ¢Ã…Â¡Ã‚Â  ' + (e.message || 'Something went wrong') + proxyHint;
    setStatus(msg, '#ff7070');
    if (btn) btn.disabled = false;
    if (isOnboard) syncOnboardPrimaryAction();
    else if (btn) btn.textContent = 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“ Import & Scan';
    return false;
  }
}

async function runSpotifyImportV2(opts = {}) {
  const mode = opts.mode || 'onboard';
  const isOnboard = mode === 'onboard';
  const urlInputId = isOnboard ? 'onboard-url' : 'sp-playlist-url';
  const btnId = isOnboard ? 'onboard-btn' : 'sp-import-btn';
  const raw = ((document.getElementById(urlInputId)?.value || '').trim()) || (isOnboard ? getDefaultOnboardPlaylistUrl() : '');
  const pid = spExtractId(raw);

  if (!pid) {
    if (isOnboard) onboardSetStatus('Paste a valid Spotify playlist URL', '#ff7070');
    else spSetError("Couldn't parse playlist ID - paste the full Spotify URL.");
    return false;
  }

  const btn = document.getElementById(btnId);
  if (btn) {
    btn.disabled = true;
    btn.textContent = isOnboard ? '...' : 'Importing...';
  }

  if (isOnboard) onboardShowProgress('Opening playlist...');

  const setStatus = isOnboard
    ? (msg, color) => onboardSetStatus(msg, color)
    : (msg, color) => {
        const el = document.getElementById('hero-status-text');
        if (el) {
          el.style.color = color || '';
          el.textContent = msg;
        }
      };

  const setProgress = isOnboard
    ? (done, total) => {
        if (_onboardAborted) return;
        onboardSetProgress(done, total);
      }
    : (done, total) => spSetProgress(done, total);

  const clearProgress = isOnboard ? onboardClearProgress : spClearProgress;

  try {
    setStatus('Opening playlist...', '');
    if (isOnboard) onboardSetProgress(0, 0);

    const { playlist: pl, tracks } = await spFetchPlaylistImport(pid);
    if (isOnboard && _onboardAborted) return false;
    setProgress(tracks.length || 1, tracks.length || 1);

    const artistMap = spBuildArtistMap(tracks);
    const allArtists = Object.values(artistMap).sort((a, b) => b.count - a.count);
    const minT = _minTracksFilter || 1;
    const artists = minT > 1 ? allArtists.filter(a => a.count >= minT) : allArtists;
    const skipped = allArtists.length - artists.length;
    if (skipped > 0) dblog('info', `Min-tracks filter (>=${minT}): kept ${artists.length} artists, skipped ${skipped} with fewer tracks`);
    const lines = artists.map(a => `${a.name} ${a.count}`);

    const ta = document.getElementById('artists-ta');
    if (ta) ta.value = lines.join('\n');
    updateArtistCount();

    const coverUrl = pl.images?.[0]?.url || '';
    const topArtists = artists.slice(0, 8).map(a => a.name);
    addToOnboardHistory(pl.name || 'Playlist', raw, tracks.length, artists.length, coverUrl, topArtists);

    const onboardInput = document.getElementById('onboard-url');
    const settingsInput = document.getElementById('sp-playlist-url');
    if (onboardInput && onboardInput.value !== raw) onboardInput.value = raw;
    if (settingsInput && settingsInput.value !== raw) settingsInput.value = raw;

    clearProgress();
    const skipNote = skipped > 0 ? ` (${skipped} skipped <${minT}tr)` : '';
    setStatus(`"${pl.name}" Ãƒâ€šÃ‚Â· ${artists.length} artists${skipNote} - scanning...`, 'var(--accent)');

    setTimeout(() => {
      if (isOnboard) profHideEmpty(); else closeSettings();
      saveAndFetch(false);
    }, 700);

    return true;
  } catch (e) {
    clearProgress();
    if (e.status === 401 && SERVER_MANAGED_SPOTIFY_LOGIN) {
      setSpotifyAuthFlash('Connect Spotify to open private or collaborative playlists.', 'error');
      renderOnboardSpotifyAuth();
    }
    const msg = 'ÃƒÂ¢Ã…Â¡Ã‚Â  ' + (e.message || 'Something went wrong');
    setStatus(msg, '#ff7070');
    if (btn) btn.disabled = false;
    if (isOnboard) syncOnboardPrimaryAction();
    else if (btn) btn.textContent = 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“ Import & Scan';
    return false;
  }
}

function onboardSetProgress(done, total) {
  const fill = document.getElementById('onboard-prog-fill');
  const lbl = document.getElementById('onboard-prog-label');
  const pct = total ? Math.round(done / total * 100) : 20;
  if (fill) fill.style.width = pct + '%';
  if (lbl) lbl.textContent = total ? `Fetched ${done} / ${total} tracks...` : 'Opening playlist...';
}

async function runSpotifyImportV2(opts = {}) {
  return runSpotifyImport(opts);
}

// Smart entry point: if IDB has cached data, resume instantly; otherwise run full Spotify import
async function resumeOrImport() {
  const raw = (document.getElementById('onboard-url')?.value || '').trim();
  const info = await checkIDBCache().catch(() => null);
  if (canInstantResumeFor(raw, info)) {
    instantResume();
  } else {
    onboardImport();
  }
}

// Thin wrappers that delegate to the shared function
async function onboardImport() { return runSpotifyImportV2({ mode: 'onboard' }); }
async function spotifyImport()  { return runSpotifyImportV2({ mode: 'settings' }); }

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
// INIT
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
const _vbadge = document.getElementById('app-ver-badge');
if (_vbadge) _vbadge.textContent = 'v' + (SERVER_CONFIG.appVersion || APP_VERSION);
const _onboardUrlInput = document.getElementById('onboard-url');
if (_onboardUrlInput) {
  _onboardUrlInput.addEventListener('input', syncOnboardPrimaryAction);
}
handleSpotifyAuthReturnFlag();
restore();
profInit();       // load active profile snapshot into ARTISTS/ARTIST_PLAYS if non-Main
restoreProxySettings();
renderSpotifyAccessButton();
renderOnboardSpotifyAuth();
refreshSpotifyAccount({ withPlaylists: !!spotifyAuthFlash }).catch(() => {});
initMap();

if (ARTISTS.length) {
  const ta = document.getElementById('artists-ta');
  if (ta) ta.value = ARTISTS.join('\n');
}
updateArtistCount();

if (concerts.length || festivals.length) {
  // Data in localStorage ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â go straight to app immediately
  if (festivals.length && ARTISTS.length) scoreFestivals();
  setStatus(`${concerts.length} concerts Ãƒâ€šÃ‚Â· ${festivals.length} festivals Ãƒâ€šÃ‚Â· cached ${cacheAge()} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â use ÃƒÂ¢Ã¢â‚¬Â Ã‚Â» Merge rescan to refresh`, true);
  /* refresh-btn removed */
  buildCalChips(); renderCalendar(); renderMap();
  hideOnboard();
} else {
  // No localStorage data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â silently check IDB before showing anything
  // Show a minimal loading state on the onboard card while we check
  const onboardEl = document.getElementById('onboard');
  if (onboardEl) onboardEl.classList.remove('hidden');

  checkIDBCache().then(info => {
    if (info && info.artistCount > 0) {
      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ IDB has data: auto-resume immediately, no manual steps ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      instantResume();
    } else {
      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Truly empty: show the new-import screen ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      setStatus('Connect Spotify or open the sample to get started', false);
      renderOnboardHistory();
      const skip = document.getElementById('onboard-skip');
      if (skip) skip.style.display = 'none';
      setTimeout(() => {
        const inp = document.getElementById('onboard-url');
        if (inp) inp.focus();
      }, 150);
    }
  }).catch(() => {
    // IDB check failed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fall back to normal onboard
    setStatus('Connect Spotify or open the sample to get started', false);
    showOnboard();
  });
}
