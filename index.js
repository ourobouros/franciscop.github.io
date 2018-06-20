// Static website generator. Compiles three things:
// - Handlbars: compile all "name.hbs" into "name.html"
// - Markdown: compile all "name.md" into "index.html" using the layout template
// - SASS: compile all "name.scss" into "name.min.css"
// All of this while ignoring the partials (filenames startig by "_")
const { start } = require("live-server");

const marked = require('marked');
const hbs = require('handlebars');
const sass = require('node-sass');
const watch = require('node-watch');
const fm = require('front-matter');
const { abs, dir, exists, join, name, read, stat, walk, write } = require('fs-array');

// Check whether a folder has a 'readme.md' file or not
const hasReadme = src => exists(join(src, 'readme.md'));

// Find all the relevant data for a blog post entry (a folder)
const parseData = (file, i, blog) => {
  // const file = join(folder, 'readme.md');
  const folder = file.replace(/readme\.md$/, '');
  const { attributes, body } = fm(read(file));
  if (!attributes.layout) return;
  return {
    id: folder.split('/').pop(),
    file,
    folder,
    ...attributes,
      // Create the main handlebars template based on the selected layout
    template: hbs.compile(`{{> ${attributes.layout}}}`),
    body: marked(body)
  };
};

// Folders to ignore
const svc = require('ignore')().add('.git');
if (exists('.gitignore')) svc.add(read('.gitignore'));
const ignore = src => !svc.ignores(src);

// Extensions to handle to changes
const filter = /\.(sass|scss|hbs|md|js)$/;
const isPartial = src => name(src)[0] === '_';
const isFull = src => !isPartial(src);
const ext = (...end) => src => end.find(ext => src.slice(-ext.length) === ext);
watch(__dirname, { recursive: true, filter }, (err, file) => {

  // All of the valid filenames within the project
  const walked = walk(__dirname).filter(ignore).filter(src => filter.test(src));

  // Handlebars import all '_name.hbs' in the blog folder as partials
  walked.filter(isPartial).filter(ext('hbs')).forEach(src => {
    hbs.registerPartial(name(src, '.hbs').slice(1), read(src));
  });

  // Actual markdown parsing
  // const blog = dir(folder).filter(hasReadme).map(parseData).filter(a => a);
  const blog = walked.filter(ext('md')).map(parseData).filter(a => a);
  blog.forEach(data => {
    write(join(data.folder, 'index.html'), data.template(data));
  });

  // Render any .hbs in the page in place for a .html file
  walked.filter(isFull).filter(ext('hbs')).forEach(src => {
    const output = src.replace(/\.hbs$/, '.html');
    write(output, hbs.compile(read(src))({ blog }));
  });

  // The SASS or SCSS is being modified, rebuild them all
  if (/\.s(a|c)ss$/.test(file)) {
    // Only main scss that are not partials (ignore "_name.scss" )
    walked.filter(isFull).filter(ext('scss')).forEach(style => {
      const options = { file: style, outputStyle: 'compressed' };
      const output = style.replace(/\.s(a|c)ss$/, '.min.css');
      write(output, sass.renderSync(options).css.toString());
    });
  }
});

start({ port: 3000, host: "localhost", open: true });
