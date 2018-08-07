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


const type = async (el, text) => {
  for (const char of text.split('')) {
    el.text(el.text() + char);
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
  await play.wait(1000);
};

play.browser = async ({ element, content, command }) => {
  await show('.browser');
  element.html(content);
  await play.wait(parseInt(command));
};

play.wait = time => new Promise(resolve => setTimeout(resolve, time));


// u('.asobu').terminal();

play(`
[terminal: echo "Hello <strong>world</strong>" > index.html]
[terminal: ls]
index.html
[terminal: firefox index.html]

[browser:2000]
Hello <strong>world</strong>
`);
