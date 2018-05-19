var projects = [{
  title: 'picnic',
  subtitle: '.css',
  slogan: 'Lightweight and beautiful CSS library',
  links: [
    ['+ info', 'picnic'],
    ['Web', 'http://picnicss.com/'],
    ['Github', 'http://github.com/picnicss/picnic/']
  ],
  language: 'css',
  code: `
    $picnic-primary: #faa;

    @import 'bower/picnic/src/picnic';

    .call-to-action {
      @extends %button;
    }
  `
}, {
  title: 'cookies',
  subtitle: '.js',
  slogan: 'Super simple cookie manipulation on the front-end',
  links: [
    ['+ info', 'cookies'],
    ['Github', 'https://github.com/franciscop/cookies.js']
  ],
  code: `
    // Set a cookie that expires in 100 days
    cookies({ token: '42' });

    // Retrieve that same cookie as a string
    var token = cookies('token');

    // Remove the cookie
    cookies({ token: null });
  `
}, {
  title: 'superdom',
  subtitle: '.js',
  slogan: 'Manipulate the DOM like it\'s 2016',
  links: [
    ['CDN', 'https://unpkg.com/superdom'],
    ['Documentation', 'https://github.com/franciscop/superdom.js/blob/master/readme.md'],
    ['Github', 'https://github.com/franciscop/superdom.js']
  ],
  code: `
    // Fetch all of the link's urls
    var links = dom.a.href;

    // Set the targets to a new page
    dom.a.target = '_blank';

    // Manipulate the buttons without loops
    dom.class.cta.html = 'Click me!';
  `
}, ];

projects.forEach(project => {
  var code = project.code.replace(/\n\ {0,4}/g, '\n').replace(/^\s*/, '');
  var lang = project.language || 'js';
  dom.main[0].innerHTML += `
    <div class="flex slide">
      <div class="full half-900">
        <h2>${project.title}<sub>${project.subtitle}</sub></h2>
        <p>${project.slogan}</p>
        ${project.links.map(link => `
          <a href="${link[1]}" target="_blank">${link[0]}</a>
        `).join('')}
      </div>
      <div class="full half-900">
        <pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>
      </div>
    </div>
    `;
});


var findCurrent = () => dom.class.slide.findIndex(slide =>
  slide.classList.contains('current')
);

var slide = index => {
  dom.body[0].classList.remove('begin');
  dom.class.slide.forEach(slide => slide.classList.remove('current'));
  dom.class.active.forEach(active => active.classList.remove('active'));
  index = index < dom.class.slide.length ? index : 0;
  index = index >= 0 ? index : dom.class.slide.length - 1;
  dom.class.slide[index].classList.add('current');
  dom.class.dot[index].classList.add('active');
};

document.addEventListener('keyup', e => {
  if (e.keyCode === 39 || e.keyCode === 40) {
    slide(findCurrent() + 1);
  }
  if (e.keyCode === 37 || e.keyCode === 38) {
    slide(findCurrent() - 1);
  }
});

dom.class.next.forEach(next => next.addEventListener('click', e => {
  slide(findCurrent() + 1);
}));

dom.class.prev.forEach(next => next.addEventListener('click', e => {
  slide(findCurrent() - 1);
}));

var index;
dom.class.slide.forEach((slide, i) => {
  if (slide.classList.contains('current')) index = i;
  var title = slide.querySelector('h1,h2').textContent;
  dom.class.dots[0].innerHTML += '<li data-title="' + title + '" class="dot"></li>';
});
dom.class.dot.forEach((dot, i) => dot.addEventListener('click', e => {
  slide(i);
}));
dom.class.dot[index].classList.add('active');


function touch(cb){
  var start;
  touch.callbacks = touch.callbacks || [];
  touch.callbacks.push(cb);
  if (touch.attached) return;
  touch.attached = true;
  document.addEventListener('touchstart', function(e){
    if (!e.touches.length) return;
    start = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  });
  document.addEventListener('touchend', function(e){
    if (!e.changedTouches.length) return;
    var end = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    var diff = { x: end.x - start.x, y: end.y - start.y };
    touch.callbacks.forEach(function(cb){
      cb(diff, start, end);
    });
  });
}

var scrolled = false;
dom.pre.forEach(pre => pre.addEventListener('scroll', function () {
  scrolled = true;
}));

touch(function(diff){
  setTimeout(function(){
    if (scrolled) return scrolled = false;
    if (diff.x < -100) {
      slide(findCurrent() + 1);
    }
    if (diff.x > 100) {
      slide(findCurrent() - 1);
    }
  }, 100);
});


var scrolling = false;
var scrolled = e => {
  e.preventDefault();
  if (scrolling) return;
  slide(findCurrent() + Math.sign(e.detail || e.deltaY) * 1);
  scrolling = setTimeout(function(){
    scrolling = false;
    stopScroll = true;
  }, 300);
}

window.addEventListener('DOMMouseScroll', scrolled);
window.addEventListener('mousewheel', scrolled);
