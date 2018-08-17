const play = (() => {
  const clean = line => line.trim().replace(/^\[/, '').replace(/\]$/, '');

  const parseCommand = line => ({
    line,
    display: clean(line.split(']')[0]).split(':')[0].trim(),
    extra: clean(line.split(']')[0]).split(':').slice(1),
    command: clean(line.split(']')[1]).trim(),
    content: ''
  });

  const parse = inst => inst.trim().split('\n').reduce((arr, line) => {
    if (/^\s*\[/.test(line)) return arr.concat(parseCommand(line));
    arr[arr.length - 1].content += line + '\n';
    return arr;
  }, []);

  const show = (name, title = "") => {
    const stop = u(name).is('.active');
    u('section').removeClass('active');
    u(name).addClass('visible active');
    if (title) u(name).data('title', ' ' + title);
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

  play.terminal = async ({ element, command, content, extra }) => {
    await show('.terminal', extra[0]);
    element.text(element.text() + (element.text() ? '\n' : '') + '$ ');
    await type(element, command);
    element.text(`${element.text()}\n${content}`.trim());
    await play.wait(1000 + parseInt(content.length * 25));
  };

  play.browser = async ({ element, content, command }) => {
    await show('.browser', command);
    element.html(content);
    await play.wait(parseInt(command));
  };

  play.code = async ({ element, content, command, extra }) => {
    await show('.code', command);
    element = element.html(element.html() + `<pre><code class="language-${extra[0]}"></code></pre>`).find('code').html('');
    await type(element, content, ({ element }) => {
      element.html(Prism.highlight(element.text(), Prism.languages.javascript, 'javascript'));
    });
    await play.wait(1000);
  };

  play.wait = time => new Promise(resolve => setTimeout(resolve, time));

  // Export it for webpack
  if (typeof module === 'object' && module.exports) {
    module.exports = play;
  }
  return play;
})();
