---
layout: blog.hbs
title: Better Promises
date: 2018-09-20
---

I love promises. It isn't a secret and I've said it [many](https://medium.com/server-for-node-js/async-await-are-awesome-c0834cc09ab), [many](https://medium.com/server-for-node-js/servers-middleware-promises-41d82a184452) times. They come in all asynchronous shapes and colors. But the question always arises: could they be any better? To even pretend to answer that, let's see some places where they fall short:



### Parallel

To run several promises at once you'll use `Promise.all()` quite too often:

```js
// Load several websites at once
const webs = await Promise.all(urls.map(url => got(url)));

// Load several files at once with `mz/fs`
const files = await Promise.all(files.map(file => readFile(file, 'utf-8')));
```

If we have an array of promises we should be able to just wait at the whole thing instead of having to wrap it once more. This syntax would be much better, wouldn't it?

```js
// Does NOT work :(
const webs = await urls.map(url => got(url));
const files = await files.map(file => readFile(file, 'utf-8'));
```



### Opaque

The next issue is when you want to perform any operation on the promise value. You have to await for the whole thing to finish with `.then()` to perform the next operation:

```js
// Get each line from a remote URL
const lines = await fetch(...).then(res => res.text()).then(res => res.split('\n'));
```

What if we could call the method straight out of the Promise? The promise would know it has to wait until it's finished and then execute the method itself:

```js
// Does NOT work :(
const lines = await fetch(...).text().split('\n');
```



### Combination

When we combine those two, we get to ridiculous extremes. For a set of operations:

```js
// Perform two async operations on a list of items
let value = await Promise.all(data.map(op1));
value = value.filter(op2);
value = await Promise.all(value.map(op3));
```

It would be better if let the promise chain figure out those:

```js
// Does NOT work
const value = await data.map(op1).filter(op2).map(op3);
```



## Magic Promises

Well now you *can* with a bit of `magic()`! I just wrote [the library `magic-promises`](https://github.com/franciscop/magic-promises) to allow this:

```bash
npm install magic-promises
```

```js
const value = await magic(data).map(op1).filter(op2).map(op3);
```

It *extends* the promise definition so you can use them transparently. But it also adds the perfect syntax sugar for whenever it matters:

```js
// With a bit of `magic()`
const newMap = await magic(arr1).map(op1);
const newLines = await magic(fetch(...)).text().split('\n');

// Traditional style
const oldMap = await Promise.all(arr1.map(op1));
const oldLines = await fetch(...).then(res => res.text()).then(txt => txt.split('\n'));
```

It will effectively build the internal queue of methods and arguments, and resolve them as each of the steps get resolved. Then you can treat Promises even more transparently.



## File System

A perfect example of magic promises being useful is the filesystem, so I *also* published [`fs-array`](https://www.npmjs.com/package/fs-array):

```bash
npm install fs-array
```

```js
const { read, walk } = require('fs-array');

// Read all of the readme anywhere inside the current directory or children
const files = await walk('demo')
  .filter(name => /\/readme\.md$/.test(name))
  .map(read);

// IF fs-array did not use magic-promises internally:
const all = await walk('demo');
const readmes = all.filter(name => /\/readme\.md$/.test(name));
const files = Promise.all(readmes.map(read));
```


## Wrap up

My initial experience by creating and using `magic-promises` has been great. There is still some things to do, like `.filter()` accepting promises that resolve to booleans, but that's for the next chapter.
