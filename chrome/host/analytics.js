// TODO: This should be converted to a class so it's mockeable under unit tests.

/** Initializes google analytics tracker object. */
function setupGoogleAnalytics() {
  if (!window.ga) {
    (function(){
      window.ga = function() {
        (window.ga.q = window.ga.q || []).push(arguments);
      }, window.ga.l = 1 * new Date();
      var tag = 'script';
      var a = document.createElement(tag);
      var m = document.getElementsByTagName(tag)[0];
      a.async = 1;
      a.src = 'https://www.google-analytics.com/analytics.js';
      m.parentNode.insertBefore(a, m);
    })();
    ga('create', 'UA-64063186-1', 'auto');
    ga('set', 'checkProtocolTask', null);
  }
}

/**
 * Sends start event for the given url and language.
 * @param {string} url
 * @param {Lang} lang
 */
function sendStartEvent(url, lang) {
  ga('set', 'dimention1', Lang.toCode(lang));
  ga('send', {
      hitType: 'event',
      eventCategory: 'read',
      eventAction: 'init',
      page: url,
      eventLabel: '',
      eventValue: ''
  });
}