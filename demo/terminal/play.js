const play = (() => {
  const clean = line => line.trim().replace(/^\[/, '').replace(/\]$/, '');

  const parseCommand = line => ({
    line,
    name: clean(line.split(']')[0]).split(':')[0].trim(),
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
    u('play-time > *').removeClass('active');
    u(name).addClass('visible active');
    if (title) u(name).data('title', ' ' + title);
    return stop || play.wait(500);
  };


  const type = async (element, text, cb = () => {}) => {
    for (const char of text.split('')) {
      while (!u('play-time').hasClass('play')) {
        await play.wait(200);
      }
      element.text(element.text() + char);
      cb({ element });
      await play.wait(/\W/.test(char) ? 250 : 80);
    }
  };


  async function play (inst) {
    // if (!(this instanceof play)) {
    //   return new play(inst);
    // }
    const base = u('play-time').addClass('play');
    const text = inst || base.text();
    base.text('');

    base.append(`<play-control><span class="play">⏸</span></play-control>`);
    const control = base.find('play-control');
    control.find('.play').on('click', e => {
      u(e.currentTarget).html(base.hasClass('play') ? '⏵' : '⏸');
      base.toggleClass('play');
    });

    const commands = parse(text).map(item => {
      if (!base.find(`.${item.name}`).length) {
        control.before(`<play-window class="${item.name}"></play-window>`);
      }
      control.append(`<span class="step">◌</span>`);
      return { ...item, element: base.find(`play-window.${item.name}`) };
    });

    for (const item of commands) {
      const index = commands.indexOf(item);
      u('play-control .step').each((el, i) => {
        //●◉◍○
        u(el).filter('.active').html('●');
        u(el).toggleClass('active', i === index);
        u(el).filter('.active').html('○');
      });
      while (!base.hasClass('play')) {
        await play.wait(100);
      }
      await play[item.name](item);
    }
    base.find('.step').html('●');
  };

  play.terminal = async ({ element, command, content, extra }) => {
    await show('play-window.terminal', extra[0]);
    element.text(element.text() + (element.text() ? '\n' : '') + '$ ');
    await type(element, command);
    element.text(`${element.text()}\n${content}`.trim());
    await play.wait(1000 + parseInt(content.length * 25));
  };

  play.browser = async ({ element, content, extra }) => {
    await show('play-window.browser', extra.join(':'));
    element.html(content);
  };

  play.code = async ({ element, content, command, extra }) => {
    const ext = extra[0].split('.').pop();
    await show('play-window.code', extra[0]);
    element = element.html(element.html() + `<pre><code class="language-${ext}"></code></pre>`).find('code').html('');
    await type(element, content, ({ element }) => {
      if (typeof Prism === 'undefined') return;
      element.html(Prism.highlight(element.text(), Prism.languages.javascript, ext));
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
