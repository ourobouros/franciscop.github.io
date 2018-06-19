const { basename } = require('path');
const marked = require('marked');
const hbs = require('handlebars');
const fm = require('front-matter');
const { abs, dir, exists, join, read, stat, write } = require('fs-array');

// Check if a full src file is a handlebars template or not
const isPartial = src => /^_[\w_]+\.hbs$/.test(basename(src));

// Find the name and content pair for the handlebars template
const getName = src => [basename(src, '.hbs').slice(1), read(src)];

// Check whether a folder has a 'readme.md' file or not
const hasReadme = src => exists(join(src, 'readme.md'));

// Find all the relevant data for a blog post entry (a folder)
const parseData = (folder, i, blog) => {
  const file = join(folder, 'readme.md');
  const { attributes, body } = fm(read(file));
  return { ...attributes, file, folder, body: marked(body), blog };
}



// Main initialization script
module.exports = (folder = 'blog') => {

  // Handlebars import all '_name.hbs' in the blog folder as partials
  dir(folder).filter(isPartial).map(getName).forEach(([name, src]) => {
    hbs.registerPartial(name, src);
  });

  // Create the main handlebars template
  const template = hbs.compile(read(join(folder, 'post.hbs')));

  // Actual markdown
  const blog = dir(folder).filter(hasReadme).map(parseData);
  blog.forEach(data => write(join(data.folder, 'index.html'), template(data)));

  // Render the main index.hbs
  const index = join(folder, 'index.hbs');
  if (exists(index)) {
    write(join(folder, 'index.html'), hbs.compile(read(index))({ blog }));
  }
};

module.exports();
