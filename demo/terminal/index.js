const clean = line => line.trim().replace(/^\[/, '').replace(/\]$/, '');

const parseCommand = line => ({
  line,
  display: clean(line).split(':')[0].trim(),
  command: clean(line).split(':').slice(1).join(':').trim(),
  content: ''
});

const parse = inst => inst.trim().split('\n').reduce((arr, line) => {
  if (/^\s*\[/.test(line)) return arr.concat(parseCommand(line));
  arr[arr.length - 1].content += line + '\n';
  return arr;
}, []);

const show = name => {
  const stop = u(name).is('.active');
  u('section').removeClass('active');
  u(name).addClass('visible active');
  return stop || play.wait(500);
};


const type = async (element, text, cb = () => {}) => {
  for (const char of text.split('')) {
    element.text(element.text() + char);
    cb({ element });
    await play.wait(/\W/.test(char) ? 250 : 80);
  }
};


const play = async inst => {
  const base = u('.asobu');

  const commands = parse(inst);

  const term = base.find('.terminal').html('');
  const browser = base.find('.browser').html('');
  for (const item of commands) {
    item.element = base.find(`section.${item.display}`);
    await play[item.display](item);
  }
};

play.terminal = async ({ element, command, content }) => {
  await show('.terminal');
  element.text(element.text() + (element.text() ? '\n' : '') + '$ ');
  await type(element, command);
  element.text(`${element.text()}\n${content}`.trim());
  await play.wait(1000 + parseInt(content.length * 25));
};

play.browser = async ({ element, content, command }) => {
  await show('.browser');
  element.html(content);
  await play.wait(parseInt(command));
};

play.code = async ({ element, content, command }) => {
  await show('.code');
  element = element.html(`<pre><code class="language-${command}"></code></pre>`).find('code').html('');
  await type(element, content, ({ element }) => {
    element.html(Prism.highlight(element.text(), Prism.languages.javascript, 'javascript'));
  });
  await play.wait(1000);
};

play.wait = time => new Promise(resolve => setTimeout(resolve, time));

play(`
[terminal: node --version]
v10.8.0
[terminal: npm init --yes]
Wrote to /home/[CURRENT_PATH]/package.json:
...

[terminal: npm install server]
+ server@1.0.18

[terminal: atom index.js]

[code:js]
const server = require('server');

// Launch it on localhost:3000
server(ctx => \`Hello <strong>localhost:\${ctx.options.port}</strong>!\`);
[terminal: node .]

[browser:2000]
Hello <strong>localhost:3000</strong>
`);
