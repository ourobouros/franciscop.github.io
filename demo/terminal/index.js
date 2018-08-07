const wait = time => new Promise(resolve => setTimeout(resolve, time));

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
  return stop || wait(500);
};


const type = async (el, text) => {
  for (const char of text.split('')) {
    el.text(el.text() + char);
    await wait(/\W/.test(char) ? 250 : 80);
  }
};


const play = async inst => {
  const base = u('.asobu');

  const commands = parse(inst);

  const term = base.find('.terminal').html('');
  const browser = base.find('.browser').html('');
  for (const item of commands) {
    if (item.display === 'terminal') {
      await show('.terminal');
      term.text(term.text() + (term.text() ? '\n' : '') + '$ ');
      await type(term, item.command);
      term.text(`${term.text()}\n${item.content}`.trim());
      await wait(1000);
    } else if (item.display === 'browser') {
      await show('.browser');
      browser.html(item.content);
      await wait(parseInt(item.command));
    } else if (item.display === 'wait') {
      await wait(parseInt(item.command));
    }
  }
};


play.browser = ({ element, command, content }) => {
  u('section', element).removeClass('active');
  u('.browser', element).addClass('active');
};

[
  { terminal: { 'mkdir mypage': '' } },
  { terminal: { 'cd mypage': '' } },
]

play(`
[terminal: mkdir mypage]
[terminal: cd mypage]
[terminal: echo "Hello <strong>world</strong>" > index.html]
[terminal: ls]
index.html
[terminal: firefox index.html]

[browser:2000]
Hello <strong>world</strong>
`);
