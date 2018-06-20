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
  return {
    id: folder.split('/').pop(),
    file,
    folder,
    ...attributes,
      // Create the main handlebars template based on the selected layout
    template: hbs.compile(`{{> ${attributes.layout}}}`),
    body: marked(body)
  };
}

const ignore = /(node_modules|\.git|\.sass-cache)/;
const partial = src => src.split('/').pop()[0] === '_';
const full = src => !partial(src);
const ext = (...end) => src => end.find(ext => src.slice(-ext.length) === ext);
const filter = /\.(sass|scss|hbs|md|js)$/;
watch(__dirname, { recursive: true, filter }, (err, file) => {
  const walked = walk(__dirname).filter(src => !ignore.test(src));
  const folder = join(__dirname, 'blog');

  // Handlebars import all '_name.hbs' in the blog folder as partials
  dir(folder).filter(isPartial).map(getName).forEach(([name, src]) => {
    hbs.registerPartial(name, src);
  });

  // Actual markdown
  const blog = dir(folder).filter(hasReadme).map(parseData);
  blog.forEach(data => write(join(data.folder, 'index.html'), data.template(data)));

  // Render any .hbs in the page in place for a .html file
  if (/\.(hbs|md)$/.test(file)) {
    // Only main scss that are not partials (ignore "_name.scss" )
    walked.filter(src => /^[^_].+\.hbs$/.test(src.split('/').pop())).forEach(src => {
      const output = src.replace(/\.hbs$/, '.html');
      write(output, hbs.compile(read(src))({ blog }));
    });
  }

  // The SASS or SCSS is being modified, rebuild them all
  if (/\.s(a|c)ss$/.test(file)) {
    // Only main scss that are not partials (ignore "_name.scss" )
    walked.filter(full).filter(ext('scss')).forEach(style => {
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
  // middleware: [(req,res,next) => setTimeout(next, 100)]
};

start(params);
