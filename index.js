const { start } = require("live-server");

const { basename } = require('path');
const marked = require('marked');
const hbs = require('handlebars');
const sass = require('node-sass');
const watch = require('node-watch');
const fm = require('front-matter');
const { abs, dir, exists, join, read, stat, walk, write } = require('fs-array');

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

const ignore = /(node_modules|\.git|\.sass-cache)/;
const filter = /\.(sass|scss|hbs|md)$/;
watch(__dirname, { recursive: true, filter }, (err, file) => {
  const walked = walk(__dirname).filter(src => !ignore.test(src));
  const folder = join(__dirname, 'blog');

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

  // The SASS or SCSS is being modified, rebuild them all
  if (/\.s(a|c)ss$/.test(file)) {
    // Only main scss that are not partials (ignore "_name.scss" )
    walked.filter(src => /^[^_].+\.s(a|c)ss$/.test(src.split('/').pop())).forEach(style => {
      console.log('Change:', style);
      const options = { file: style, outputStyle: 'compressed' };
      const output = style.replace(/\.s(a|c)ss$/, '.min.css');
      write(output, sass.renderSync(options).css.toString());
    });
  }
});


const params = {
  port: 3000, // Set the server port. Defaults to 8080.
  host: "localhost", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  open: true, // When false, it won't load your browser by default.
  // ignore: '.sass-cache,node_modules,scss,sass,hbs,md', // comma-separated string for paths to ignore
  // wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec. Good for the build process
  middleware: [(req,res,next) => setTimeout(next, 100)]
};

start(params);
