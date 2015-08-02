(function() {
  var click, backoff, scrollAndClick;
  click = function(link) {
    try {link.click();} catch (e) {}
  };
  backoff = function(action, base_delay) {
    var delay, success, next;
    base_delay = base_delay || 0;
    delay = 200;
    next = function() {
      try {
        // try the action
        success = action();
        // reset delay
        delay = 200;
        // go on to the next one
        if (success !== true) {
          setTimeout(next, base_delay);
        }
      } catch (e) {
        // try backing off
        if (delay < 180000) {
          setTimeout(next, parseInt(delay));
          delay *= 1.2;
        }
      }
    };
    setTimeout(next, 0);
  };
  scrollAndClick = function(container, selector, clickFn) {
    backoff(function() {
      var item = container.querySelector(selector + ':not([skip-me])');
      item.scrollIntoView(false);
      // try to click if it applies
      clickFn(item);
      // skip it next time
      item.setAttribute('skip-me', '1');
    }, 200);
  };

  // be nice, catch any errors when they happen
  try {
    // find an invite section
    if (document.location.pathname.match(/\/events\/[0-9]+\/.*/) !== null) {
      // event page detected
      var invite_section = document.getElementById('event_invite');
      var invite_links = invite_section.querySelector('a[role=button][rel=async-post]');
      Array.prototype.forEach.call(invite_links, click);
    } else {
      (document.querySelector('a[role=button][rel=dialog][href^="/ajax/choose"]')||document.querySelector('a[role=button][rel=dialog][href^="/pages/invite/\?.*"]')).click();
      // start looking for the invitation dialog
      backoff(function() {
        var dialog = document.querySelector('form[action^="/ajax/pages/invite/send/"]');
        if (dialog !== null) {
          // start clicking
          scrollAndClick(dialog, 'li[role=option]', function(li) {
            click(li.querySelector('a[role=button]'));
          });
          return true;
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
})();
