// InstaClick is so broken that I had to do this :(

// Loader is the one for the current in-progress request Promises
const loader = {};

// Then they go to the cache. This only stores serializable data.
const cache = lru();

// Cache for 100 seconds (or browser refresh)
cache.expire = 10000;

cache.notify = true;
cache.onchange = (event, serializedCache) => {
  if (event !== 'remove' && event !== 'set') return;
  setLinks();
};

// These are already executed and should not be executed again
const loaded = {};




const setLinks = () => {
  const links = Object.keys(cache.cache);
  document.querySelectorAll('a').forEach(link => {
    // console.log(links, link.href);
    if (links.includes(link.href)) {
      if (link.getAttribute('data-cached')) return;
      return link.setAttribute('data-cached', true);
    } else {
      if (!link.getAttribute('data-cached')) return;
      link.removeAttribute('data-cached');
    }
  });
};


const bar = {
  min: 300,
  init: 0,
  show: () => {
    bar.init = new Date();
    document.querySelector('html').classList.add('loading');
  },
  hide: () => {
    const timeout = Math.max(bar.min, bar.min - (new Date() - bar.init));
    setTimeout(() => {
      document.querySelector('html').classList.remove('loading');
    }, timeout);
  }
};


// Inject the old, unevaluated script in the new document
const inject = (scr, body) => new Promise((resolve, reject) => {
  // console.log('Loaded scripts:', loaded[scr.src], scr.src, Object.keys(loaded));
  if (loaded[scr.src]) {
    // console.log(`Already loaded: ${scr.src}`);
    return resolve();
  }

  const script = document.createElement("script");

  // https://www.danielcrabtree.com/blog/25/gotchas-with-dynamically-adding-script-tags-to-html
  if (scr.src) {
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    // Cannot wrap this unfortunately ¯\_(ツ)_/¯
    script.src = scr.src;
    return body.appendChild(script);
  }

  // Script just has a string
  // Wrap it in a new context to avoid globals being re-assigned
  const wrapped = `(() => {${scr.innerHTML}})();`;
  script.appendChild(document.createTextNode(wrapped));
  body.appendChild(script);
  resolve();
});



// Fetch either a URL or an <a> element corresponding HTML
const preload = (ref) => {
  const href = ref.href || ref;

  // Already cached
  if (loader[href]) return loader[href];
  if (cache.get(href)) return Promise.resolve(cache.get(href));

  // Add to cache
  // console.log('Preloading:', href);
  loader[href] = fetch(href).then(res => res.text()).then(html => {
    cache.set(href, { href, html });
    setLinks();
    delete loader[href];
    return cache.get(href);
  });

  setLinks();
  return loader[href];
};

// Load either a URL or a <a> element referenced HTML into the body
const load = ref => {
  const href = ref.href || ref;

  // Loading indicator
  bar.show();

  // Already loaded! Yay!
  if (cache.get(href)) return replaceContent(cache.get(href));

  // The URL is loading; load the replaceContent later on
  if (loader[href]) return loader[href].then(replaceContent);

  // Manually trigger a link that was not preloaded (preload it then load it)
  preload(href).then(replaceContent);
};

// Set the new content to whatever it is passed
const replaceContent = ({ href, html }) => {
  // URL & History
  // This has to be before the DOM manipulations, otherwise the browser might
  //   think that the data is the old one
  history.pushState({ href }, "", href);

  // Generate a "virtual dom" (no, not your React virtual dom)
  const dom = document.createElement("html");
  dom.innerHTML = html;

  // Body replacement
  const body = document.querySelector('body')
  body.innerHTML = '';
  [...dom.querySelector('body').children].forEach(node => {
    body.appendChild(node);
  });

  document.querySelector('title').innerText = dom.querySelector('title').innerText;
  // const head = document.querySelector('head');
  // head.innerHTML = '';
  // [...dom.querySelector('head').children].forEach(node => {
  //   head.appendChild(node);
  // });

  // Load scripts
  const scripts = [...document.querySelectorAll('script')];

  // Recursive iteration over the scripts when they have finished loading
  function flipScript ([current, ...scripts]) {
    if (current) return inject(current, body).then(() => flipScript(scripts));
    return Promise.resolve();
  }

  flipScript(scripts).then(() => {
    // Reattach the links
    attach();

    // Set the webpage link attr to reflect the current website
    setLinks();

    // Hide the loading bar
    bar.hide();
  });
};




const attach = (links = 'a') => {
  document.querySelectorAll('script[data-once]').forEach(scr => loaded[scr.src] = true);

  document.querySelectorAll(links).forEach(link => {
    // Ignore the totally external links since they cannot be loaded anyway
    if (link.host !== location.host) return;

    link.addEventListener('mouseover', e => preload(e.currentTarget));
    link.addEventListener('touchstart', e => preload(e.currentTarget));
    link.addEventListener('click', e => {
      e.preventDefault();
      load(e.currentTarget);
    });
  });
};

const pwa = () => {
  document.querySelectorAll('a').forEach(preload);
};

window.onpopstate = function(e) {
  const href = e.currentTarget.location.href;
  load(href);
};

// without jQuery (doesn't work in older IEs)
document.addEventListener('DOMContentLoaded', function(){

  // This needs to be here so that any script loaded a posteriori is also added
  cache.set(window.location.href, {
    href: window.location.href,
    html: document.querySelector('html').outerHTML
  });

  attach();
}, false);
