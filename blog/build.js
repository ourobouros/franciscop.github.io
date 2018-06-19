const marked = require('marked');
const hbs = require('handlebars');

const prom = require('util').promisify;
const fs = Object.entries(require('fs'))
  .filter(pair => typeof pair[1] === 'function')
  .reduce((fs, [key, fn]) => ({ ...fs, [key]: prom(fn) }), {});

// https://gist.github.com/mathewbyrne/1280286
const slugify = text => text.toString().toLowerCase()
  .replace(/\s+/g, '-')           // Replace spaces with -
  .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
  .replace(/\-\-+/g, '-');        // Replace multiple - with single

const getPostInfo = async file => {
  const post = {};
  let body = await fs.readFile(file, 'utf-8');
  const parts = body.split(/^---$/m).map(a => a.trim());
  if (parts && parts[0] === '' && parts.length >= 3) {
    const extra = parts[1];
    extra.split(/\n/).map(a => a.trim()).filter(a => a).forEach(bit => {
      const [name, ...rest] = bit.split(':');
      const content = rest.join(':').trim();
      if (name === 'title') post.slug = slugify(content);
      post[name.trim()] = content;
    });

    // Recover it, since this is valid markdown
    post.body = parts.slice(2).join('---');
  }
  return post;
};

(async () => {
  const all = await fs.readdir('./');

  // Handlebars
  const template = await fs.readFile('./post.hbs', 'utf-8');
  await Promise.all(all.filter(it => /^_(\w+)\.hbs/.test(it))
    .map(it => it.replace(/^_(\w+)\.hbs/, (a, good) => good))
    .map(async name => {
      hbs.registerPartial(name, await fs.readFile(`./_${name}.hbs`, 'utf-8'));
    }));

  // Actual markdown
  const entries = all.filter(it => /\.md$/.test(it));
  const blog = await Promise.all(entries.map(getPostInfo));
  blog.forEach(entry => {
    blog.html = hbs.compile(template)({ blog, ...entry, body: marked(entry.body) });
    fs.mkdir(entry.slug).catch(noproblem => {});  // Already exists == ignore it
    fs.writeFile(entry.slug + '/index.html', blog.html);
  });

  console.log(blog);
})();
