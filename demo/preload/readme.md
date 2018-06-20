# Preload




```js
// Open one of the urls. Fallback if it's an external path (use only relative!)
link.open();

// (pre) load a link into the memory so when it's cached for later clicks
link.load();

// Show a loading bar 300ms. Pass a promise to hide the bar on resolution/error
link.bar();
// You can set it to false to remove it:
link.bar = false;

// Cache instance. Using tiny-lru: https://www.npmjs.com/package/tiny-lru
link.cache = lru(100, false, 100000, 100000);
link.cache.get(HREF);
link.cache.set(HREF, { href: HREF, html: HTML });
link.cache.expire = 1000;  // Maximum time of the page
link.cache.clear();        // Remove all items from cache
```
