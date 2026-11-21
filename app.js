/* Portfolio as a DOS setup program. No dependencies; all text comes from content.js.
   Three screens: 'setup' (the installer wizard), 'desktop' (menu bar, windows, status bar) and 'prompt' (Exit to DOS). */
(function () {
  'use strict';

  var D = window.PORTFOLIO;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrowMq = matchMedia('(max-width: 1000px)');
  var screen = '';

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, props, kids) {
    var n = document.createElement(tag), k;
    for (k in props || {}) {
      if (k === 'class') n.className = props[k];
      else if (k === 'text') n.textContent = props[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), props[k]);
      else n.setAttribute(k, props[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) n.append(c); });
    return n;
  }
  /* a label with its hotkey letter marked, the way DOS menus do */
  function hot(label, key) {
    var s = el('span'), i = key ? label.toLowerCase().indexOf(key.toLowerCase()) : -1;
    if (i < 0) { s.textContent = label; return s; }
    s.append(label.slice(0, i), el('span', { class: 'k', text: label[i] }), label.slice(i + 1));
    return s;
  }
  function link(text, url) {
    var a = el('a', { href: url, text: text });
    if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: nothing is remembered */ } }
  };
  function show(name) {
    screen = name;
    ['setup', 'desktop', 'prompt'].forEach(function (s) { $(s).hidden = s !== name; });
  }

  /* ---------- Setup ---------- */
  var COMPS = [
    { id: 'about', file: 'README.TXT', label: 'Read me first', kb: 4, on: true },
    { id: 'resume', file: 'RESUME.TXT', label: 'Resume', kb: 142, on: true },
    { id: 'projects', file: 'PROJECTS.DAT', label: 'Project work', kb: 1360, on: true },
    { id: 'contact', file: 'CONTACT.LST', label: 'Contact details', kb: 2, on: true },
    { id: 'photo', file: 'ME.LBM', label: 'Portrait', kb: 64, on: true },
    { id: 'crt', file: 'SCANLINE.DRV', label: 'CRT scanlines', kb: 64, on: true }
  ];
  var DEFAULTS = COMPS.map(function (c) { return c.id; });
  var step = 0, cur = 0, raf = 0;

  function startSetup() {
    closeMenu();
    show('setup');
    $('setupTitle').textContent = D.name + ' ' + D.product + ' ' + D.version + ' Setup';
    go(0);
  }
  function go(n) { cancelAnimationFrame(raf); step = n; STEPS[n](); }
  function setupStatus(items) {
    $('setupStatus').replaceChildren.apply($('setupStatus'), items.map(function (it) {
      return el('button', { onclick: it[2], text: it[0] + '=' + it[1] });
    }));
  }
  function skip() { finish(true); }

  var STEPS = [
    function welcome() {
      $('setupBody').replaceChildren(
        el('p', {}, [el('b', { text: 'Welcome to Setup.' })]),
        el('p', { text: 'The Setup program prepares the portfolio of ' + D.name + ' to run on your computer.' }),
        el('ul', {}, [
          el('li', { text: 'To set up the portfolio now, press ENTER.' }),
          el('li', { text: 'To skip Setup and go straight to the desktop, press ESC.' }),
          el('li', { text: 'No keyboard? Tap the keys in the bar at the bottom.' })
        ])
      );
      setupStatus([['ENTER', 'Continue', function () { go(1); }], ['ESC', 'Skip Setup', skip]]);
    },
    function components() {
      var list = el('div', { class: 'comps', role: 'group', 'aria-label': 'Components' }, COMPS.map(function (c, i) {
        return el('div', {
          class: 'comp' + (i === cur ? ' cur' : ''), role: 'checkbox', 'aria-checked': String(c.on),
          onclick: function () { cur = i; c.on = !c.on; go(1); }
        }, [
          el('span', { text: c.on ? '[X]' : '[ ]' }),
          el('span', { class: 'nm', text: c.label }),
          el('span', { text: c.kb.toLocaleString('en-US') + ' KB' })
        ]);
      }));
      var total = COMPS.reduce(function (n, c) { return n + (c.on ? c.kb : 0); }, 0);
      $('setupBody').replaceChildren(
        el('p', { text: 'Setup will install the following components. Each one opens as a window on the desktop.' }),
        el('p', {}, ['Use the ', el('b', { text: 'UP' }), ' and ', el('b', { text: 'DOWN' }), ' arrows to move, ', el('b', { text: 'SPACE' }), ' to change a choice.']),
        list,
        el('p', { class: 'totals', text: 'Space required: ' + total.toLocaleString('en-US') + ' KB     Space available: plenty' })
      );
      setupStatus([['ENTER', 'Install', function () { go(2); }], ['SPACE', 'Change', toggleCur], ['ESC', 'Skip Setup', skip]]);
    },
    function copying() {
      var files = ['SETUP.INI'].concat(COMPS.filter(function (c) { return c.on; }).map(function (c) { return c.file; }), ['VGA9X16.FNT']);
      var file = el('p'), fill = el('i'), pct = el('span', { text: '0%' });
      $('setupBody').replaceChildren(
        el('p', { text: 'Please wait while Setup copies files to your computer.' }),
        el('div', { class: 'dialog' }, [el('p', { text: 'Copying:' }), file, el('div', { class: 'bar', 'aria-hidden': 'true' }, [fill, pct])])
      );
      setupStatus([['ESC', 'Skip', function () { go(3); }]]);
      var dur = reduced ? 300 : 2800, t0 = performance.now();
      (function tick(now) {
        var p = Math.floor(Math.min(1, ((now || t0) - t0) / dur) * 40) / 40;   // the bar moves one text cell at a time
        fill.style.width = p * 100 + '%';
        pct.textContent = Math.round(p * 100) + '%';
        file.textContent = 'C:\\' + D.product + '\\' + files[Math.min(files.length - 1, Math.floor(p * files.length))];
        if (p < 1) raf = requestAnimationFrame(tick);
        else setTimeout(function () { if (screen === 'setup' && step === 2) go(3); }, 350);
      })();
    },
    function done() {
      $('setupBody').replaceChildren(
        el('p', {}, [el('b', { text: 'Setup is complete.' })]),
        el('ul', {}, [
          el('li', { text: 'Remove any disks from your floppy disk drives.' }),
          el('li', { text: 'Press ENTER to start ' + D.product + '.' })
        ])
      );
      setupStatus([['ENTER', 'Start', function () { finish(false); }]]);
    }
  ];
  function toggleCur() { COMPS[cur].on = !COMPS[cur].on; go(1); }

  function setupKey(e) {
    var k = e.key;
    if (step === 0 && k === 'Enter') go(1);
    else if (step === 1 && k === 'ArrowDown') { cur = (cur + 1) % COMPS.length; go(1); }
    else if (step === 1 && k === 'ArrowUp') { cur = (cur + COMPS.length - 1) % COMPS.length; go(1); }
    else if (step === 1 && k === ' ') toggleCur();
    else if (step === 1 && k === 'Enter') go(2);
    else if (step === 2 && (k === 'Escape' || k === 'Enter')) go(3);
    else if (step === 3 && (k === 'Enter' || k === 'Escape')) finish(false);
    else if (k === 'Escape') skip();
    else return;
    e.preventDefault();
  }

  /* leave Setup for the desktop; a skipped Setup installs the defaults */
  function finish(skipped) {
    cancelAnimationFrame(raf);
    var picked = skipped ? DEFAULTS : COMPS.filter(function (c) { return c.on; }).map(function (c) { return c.id; });
    startDesktop(picked);
  }

  /* ---------- desktop: windows ---------- */
  var desk = $('desk');
  var pos = {}, active = null, z = 1;
  var WINS = {
    about: { title: 'README.TXT', cls: 'grey', w: '58ch', build: buildAbout },
    resume: { title: 'RESUME.TXT', cls: '', w: '76ch', build: buildResume },
    projects: { title: 'Coding Projects', cls: '', w: '82ch', build: buildProjects },
    contact: { title: 'CONTACT.LST', cls: 'teal', w: '48ch', build: buildContact },
    photo: { title: 'ME.LBM', cls: 'grey', w: '16ch', build: buildPhoto },
    help: { title: 'Help', cls: 'grey', w: '50ch', build: buildHelp }
  };
  function win(id) { return $('w-' + id); }
  function visible() { return Object.keys(WINS).filter(function (id) { return !win(id).hidden; }); }

  function makeWin(id) {
    var def = WINS[id];
    var tbar = el('div', { class: 'tbar' });
    var w = el('section', { class: ('win ' + def.cls).trim(), id: 'w-' + id, 'aria-label': def.title, tabindex: '-1', style: '--w:' + def.w, hidden: '' }, [
      tbar,
      el('button', { class: 'close', 'aria-label': 'Close ' + def.title, onclick: function () { closeWin(id); } }, ['[', el('b', { text: '\u25A0' }), ']']),
      el('span', { class: 'wt', text: def.title })
    ]);
    [].concat(def.build()).forEach(function (n) { w.append(n); });
    w.addEventListener('pointerdown', function () { focusWin(id); }, true);
    w.addEventListener('focusin', function () { focusWin(id); });
    var sx, sy, ox, oy, on = false;
    tbar.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      on = true; tbar.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; ox = pos[id].x; oy = pos[id].y;
      w.classList.add('moving'); document.body.classList.add('dragging');
    });
    tbar.addEventListener('pointermove', function (e) { if (on) setPos(id, ox + e.clientX - sx, oy + e.clientY - sy); });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      tbar.addEventListener(t, function () { on = false; w.classList.remove('moving'); document.body.classList.remove('dragging'); });
    });
    desk.append(w);
  }
  /* keep a window inside the desktop; the top edge leaves room for the title that sits on the border */
  function setPos(id, x, y) {
    var w = win(id), top = parseFloat(getComputedStyle(w).lineHeight) / 2 + 4;
    x = Math.round(Math.max(4, Math.min(x, desk.clientWidth - w.offsetWidth - 4)));
    y = Math.round(Math.max(top, Math.min(y, desk.clientHeight - w.offsetHeight - 4)));
    pos[id] = { x: x, y: y };
    w.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function layout() {
    if (screen !== 'desktop' || document.body.classList.contains('narrow')) return;
    if (mode === 'tile') tile(); else cascade();
  }
  function focusWin(id) {
    if (active === id) return;
    active = id;
    win(id).style.zIndex = ++z;
    Object.keys(WINS).forEach(function (o) { win(o).classList.toggle('active', o === id); });
  }
  function openWin(id) {
    var w = win(id), narrow = document.body.classList.contains('narrow'), fresh = w.hidden;
    w.hidden = false;
    focusWin(id);
    if (fresh) layout();                       // a newly opened window gets its place; raising one that is already open moves nothing
    w.focus({ preventScroll: true });
    if (narrow) w.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }
  function topWin() {
    return visible().sort(function (a, b) { return win(b).style.zIndex - win(a).style.zIndex; })[0] || null;
  }
  function closeWin(id) {
    win(id).hidden = true;
    layout();
    if (active !== id) return;
    active = null;
    var next = topWin();
    if (next) { focusWin(next); win(next).focus({ preventScroll: true }); }
  }
  function nextWin() {
    var order = visible().sort(function (a, b) { return win(a).style.zIndex - win(b).style.zIndex; });
    if (order.length > 1) openWin(order[0]);
  }
  function closeAll() { visible().forEach(function (id) { win(id).hidden = true; }); active = null; }

  /* Two arrangements, as on a DOS desktop. Both size the windows themselves; dragging one afterwards is allowed.
     Tile: windows side by side in columns, filling the desktop without overlapping.
     Cascade: every window the same size, stacked diagonally so each title bar stays visible, the active one in front. */
  var mode = 'tile';
  var TILES = [                              // a column takes a share of the width (flex) or a fixed width in characters (ch)
    { flex: 1, wins: ['resume'] },
    { flex: 1.15, wins: ['about', 'projects', 'help'] },
    { ch: 30, wins: ['photo', 'contact'], auto: 'photo' }          // the portrait keeps its natural height, the rest fill what is left
  ];
  function setMode(m) {
    mode = m; store.set('pf.layout', m);
    desk.setAttribute('data-mode', m);
    layout();
  }
  function metrics() {
    var cs = getComputedStyle(desk), line = parseFloat(cs.lineHeight), ch = parseFloat(cs.fontSize) * 9 / 16;
    return { line: line, ch: ch, left: 1.5 * ch, top: line * .75, w: desk.clientWidth - 3.5 * ch, h: desk.clientHeight - line * .75 - 16 };
  }
  function box(id, x, y, w, h) {
    var e = win(id);
    e.classList.add('tiled');
    e.style.width = Math.floor(w) + 'px'; e.style.height = h == null ? '' : Math.floor(h) + 'px';
    pos[id] = { x: Math.round(x), y: Math.round(y) };
    e.style.transform = 'translate(' + pos[id].x + 'px,' + pos[id].y + 'px)';
  }
  function cascade() {
    var m = metrics(), order = visible().sort(function (a, b) { return win(a).style.zIndex - win(b).style.zIndex; }), n = order.length;
    var stepX = 3 * m.ch, stepY = m.line * 1.25;                          // one step shows the title bar of the window behind
    var w = Math.max(30 * m.ch, m.w - stepX * (n - 1)), h = Math.max(8 * m.line, m.h - stepY * (n - 1));
    order.forEach(function (id, i) { box(id, m.left + i * stepX, m.top + i * stepY, w, h); });
  }
  function tile() {
    var m = metrics(), open = visible(), cols = TILES.map(function (c) {
      return { flex: c.flex, ch: c.ch, auto: c.auto, ids: c.wins.filter(function (id) { return open.indexOf(id) >= 0; }) };
    }).filter(function (c) { return c.ids.length; });
    if (!cols.length) return;
    var gapX = 2.5 * m.ch, gapY = m.line, availW = m.w - gapX * (cols.length - 1);   // gaps leave room for drop shadows and the titles on the borders
    if (!cols.some(function (c) { return c.flex; })) cols.forEach(function (c) { c.flex = 1; c.ch = 0; });
    var fixed = cols.reduce(function (n, c) { return n + (c.ch ? Math.min(c.ch * m.ch, availW / 3) : 0); }, 0);
    var shares = cols.reduce(function (n, c) { return n + (c.ch ? 0 : c.flex); }, 0), x = m.left;
    cols.forEach(function (c) {
      var w = c.ch ? Math.min(c.ch * m.ch, availW / 3) : (availW - fixed) * c.flex / shares;
      var room = m.h - gapY * (c.ids.length - 1), y = m.top, auto = c.ids.length > 1 && c.ids.indexOf(c.auto) >= 0 ? c.auto : null, autoH = 0, rest;
      if (auto) { box(auto, x, y, w, null); autoH = Math.min(win(auto).offsetHeight, room * .66); }
      rest = (room - autoH) / (c.ids.length - (auto ? 1 : 0));
      c.ids.forEach(function (id) {
        var h = Math.floor(id === auto ? autoH : rest);
        box(id, x, y, w, h);
        y += h + gapY;
      });
      x += w + gapX;
    });
  }

  /* ---------- desktop: window contents ---------- */
  function doc(kids) { return el('div', { class: 'scroll doc' }, kids); }
  function opener(label, id) { return el('button', { class: 'btn', onclick: function () { openWin(id); } }, [label]); }

  function buildAbout() {
    var d = doc([
      el('h2', { class: 'name', style: '--n:' + D.name.length, text: D.name }),
      el('p', { class: 'sub', text: D.role })
    ].concat(D.about.map(function (t) { return el('p', { text: t }); }), [
      el('div', { class: 'btns' }, [opener('Resume', 'resume'), opener('Projects', 'projects'), opener('Contact', 'contact')]),
      el('h3', { text: 'How this works' }),
      el('p', {}, ['Open windows from the ', el('kbd', { text: 'File' }), ' menu, drag them by the title bar and close them with ', el('kbd', { text: '[\u25A0]' }), ' or ', el('kbd', { text: 'Esc' }), '. ', el('kbd', { text: 'F1' }), ' lists every key.']),
      el('h3', { text: 'Credits' }),
      el('p', {}, ['Type: IBM VGA 9x16 from The Ultimate Oldschool PC Font Pack by VileR, ', link('int10h.org', 'https://int10h.org/oldschool-pc-fonts/'), ', CC BY-SA 4.0. Stretched x1.35 here for 4:3, shared under the same licence.']),
      el('p', {}, ['Look inspired by the Monkey Island versions viewer at ', link('monkeyisland.pages.dev', 'https://monkeyisland.pages.dev/'), '.'])
    ]));
    d.classList.add('fit');                  // lets the name scale to the window's width
    return d;
  }

  function buildResume() {
    var R = D.resume, kids = [el('h3', { text: 'Summary' }), el('p', { text: R.summary }), el('h3', { text: 'Experience' })];
    R.experience.forEach(function (j) {
      kids.push(el('div', { class: 'job' }, [
        el('div', { class: 'hd' }, [el('b', { text: j.role + ', ' + j.company }), el('span', { text: j.when })]),
        el('ul', {}, j.notes.map(function (n) { return el('li', { text: n }); }))
      ]));
    });
    kids.push(el('h3', { text: 'Education' }));
    R.education.forEach(function (s) {
      kids.push(el('div', { class: 'job' }, [
        el('div', { class: 'hd' }, [el('b', { text: s.title + ', ' + s.place }), el('span', { text: s.when })])
      ]));
    });
    if (R.certifications && R.certifications.length) {
      kids.push(el('h3', { text: 'Certifications' }));
      R.certifications.forEach(function (c) {
        kids.push(el('div', { class: 'job' }, [
          el('div', { class: 'hd' }, [el('b', { text: c.title + ', ' + c.place }), el('span', { text: c.when })])
        ]));
      });
    }
    kids.push(el('h3', { text: 'Skills' }), el('dl', {}, R.skills.reduce(function (a, s) {
      return a.concat(el('dt', { text: s.group }), el('dd', { text: s.items.join(', ') }));
    }, [])));
    if (R.pdf) kids.push(el('div', { class: 'btns' }, [el('a', { class: 'btn', href: R.pdf, download: '' }, ['Download PDF'])]));
    return doc(kids);
  }

  function buildProjects() {
    var detail = el('div', { class: 'scroll doc pdetail' });
    var items = D.projects.map(function (p, i) {
      return el('button', { class: 'pitem', role: 'option', 'aria-selected': 'false', text: p.file || p.name, onclick: function () { pick(i); } });
    });
    function pick(i) {
      var p = D.projects[i];
      items.forEach(function (b, n) { b.setAttribute('aria-selected', String(n === i)); b.tabIndex = n === i ? 0 : -1; });
      var facts = [];
      if (p.stack && p.stack.length) facts.push(el('dt', { text: 'Built with' }), el('dd', { text: p.stack.join(', ') }));
      (p.links || []).forEach(function (l) { facts.push(el('dt', { text: l.label }), el('dd', {}, [link(l.url.replace(/^https?:\/\/|\/$/g, ''), l.url)])); });
      detail.replaceChildren.apply(detail, [
        el('h2', { text: p.name }),
        el('p', { class: 'sub', text: [p.file, p.year].filter(Boolean).join('  \u00B7  ') }),
        el('div', { class: 'rule' })
      ].concat(p.text.map(function (t) { return el('p', { text: t }); }), facts.length ? [el('dl', {}, facts)] : []));
      detail.scrollTop = 0;
    }
    var list = el('div', {
      class: 'plist', role: 'listbox', 'aria-label': 'Projects',
      onkeydown: function (e) {
        var i = items.indexOf(document.activeElement), d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (i < 0 || !d) return;
        e.preventDefault();
        i = (i + d + items.length) % items.length;
        pick(i); items[i].focus();
      }
    }, items);
    if (items.length) pick(0);
    return el('div', { class: 'proj' }, [list, detail]);
  }

  /* the portrait: a pixelated PNG made from a photo with tools/portrait.html, so the photo itself is never served.
     With a second, EGA picture set in content.js the window gets an EGA/VGA switch. */
  function buildPhoto() {
    var P = D.photo || {}, style = P.ega && P.style === 'ega' ? 'ega' : 'vga';
    var pic = el('img', { alt: 'Portrait of ' + D.name });
    var missing = el('p', { class: 'nopic', hidden: '' });
    var tabs = ['ega', 'vga'].map(function (m) {
      return el('button', { class: 'btn', text: m.toUpperCase(), onclick: function () { style = m; paint(); } });
    });
    function paint() {
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.textContent.toLowerCase() === style)); });
      pic.hidden = false; missing.hidden = true;
      pic.src = P[style] || 'portrait-' + style + '.png';
    }
    pic.onerror = function () { pic.hidden = true; missing.hidden = false; missing.textContent = 'File not found: ' + pic.getAttribute('src'); };
    paint();
    return el('div', { class: 'pic' }, [pic, missing, P.ega ? el('div', { class: 'btns mid' }, tabs) : null, P.caption ? el('p', { class: 'cap', text: P.caption }) : null]);
  }

  function buildContact() {
    return doc([
      el('p', { text: 'The fastest ways to reach me:' }),
      el('dl', {}, D.contact.reduce(function (a, c) {
        return a.concat(el('dt', { text: c.label }), el('dd', {}, [c.url ? link(c.text, c.url) : c.text]));
      }, []))
    ]);
  }

  var KEYS = [
    ['F10', 'Open the menu bar'], ['Alt-F O H', 'Open a menu'], ['\u2190 \u2191 \u2192 \u2193', 'Move through menus and lists'],
    ['Enter', 'Choose'], ['Esc', 'Close the menu or the active window'], ['F6', 'Next window'], ['F1', 'This help'], ['Alt-X', 'Exit to DOS']
  ];
  function buildHelp() {
    return doc([
      el('dl', {}, KEYS.reduce(function (a, k) { return a.concat(el('dt', {}, [el('kbd', { text: k[0] })]), el('dd', { text: k[1] })); }, [])),
      el('div', { class: 'btns mid' }, [el('button', { class: 'btn', onclick: function () { closeWin('help'); } }, ['OK'])])
    ]);
  }

  /* ---------- desktop: menu bar, pull-down menus, status bar ---------- */
  var crt = false;
  function setCrt(on) { crt = on; document.body.classList.toggle('crt', on); store.set('pf.scanlines', on ? '1' : '0'); }
  function opens(id) { return function () { openWin(id); }; }
  var MENUS = [
    { label: 'File', key: 'F', items: [
      { label: 'Read me', key: 'M', run: opens('about') },
      { label: 'Resume', key: 'R', run: opens('resume') },
      { label: 'Projects', key: 'P', run: opens('projects') },
      { label: 'Contact', key: 'C', run: opens('contact') },
      { label: 'Portrait', key: 'O', run: opens('photo') },
      null,
      { label: 'Run Setup again', key: 'S', run: startSetup },
      { label: 'Exit', key: 'x', hint: 'Alt-X', run: exitToDos }
    ] },
    { label: 'Options', key: 'O', items: [
      { label: 'Scanlines', key: 'S', check: function () { return crt; }, run: function () { setCrt(!crt); } },
      null,
      { label: 'Tile windows', key: 'T', check: function () { return mode === 'tile'; }, run: function () { setMode('tile'); } },
      { label: 'Cascade windows', key: 'A', check: function () { return mode === 'cascade'; }, run: function () { setMode('cascade'); } },
      { label: 'Close all', key: 'C', run: closeAll }
    ] },
    { label: 'Help', key: 'H', items: [
      { label: 'Keyboard', key: 'K', hint: 'F1', run: opens('help') },
      { label: 'About', key: 'A', run: opens('about') }
    ] }
  ];
  var titles = [], menuOpen = -1, dropdown = null;

  function buildBars() {
    var clock = el('span');
    titles = MENUS.map(function (m, i) {
      return el('button', {
        class: 'menu-title', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
        onclick: function () { if (menuOpen === i) closeMenu(); else openMenu(i); },
        onpointerenter: function () { if (menuOpen >= 0 && menuOpen !== i) openMenu(i); }
      }, [hot(m.label, m.key)]);
    });
    $('menubar').replaceChildren.apply($('menubar'), titles.concat(el('span', { class: 'right' }, [el('span', { class: 'wide', text: D.name + '   ' }), clock])));
    (function tick() {
      var d = new Date();
      clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      setTimeout(tick, (60 - d.getSeconds()) * 1000);
    })();

    function sbtn(key, label, run, wide) {
      return el('button', { class: wide ? 'wide' : '', onclick: run }, [el('span', { class: 'k', text: key }), ' ' + label]);
    }
    $('status').replaceChildren(
      sbtn('F1', 'Help', opens('help')),
      sbtn('F10', 'Menu', function () { openMenu(0); }),
      sbtn('F6', 'Next', nextWin, true),
      sbtn('Esc', 'Close', function () { if (active) closeWin(active); }, true),
      sbtn('Alt-X', 'Exit', exitToDos),
      el('span', { class: 'right wide', text: 'C:\\' + D.product })
    );
  }

  function openMenu(i) {
    closeMenu();
    menuOpen = i;
    titles[i].setAttribute('aria-expanded', 'true');
    dropdown = el('div', { class: 'dropdown', role: 'menu' }, MENUS[i].items.map(function (it) {
      if (!it) return el('div', { class: 'dd-sep', role: 'separator' });
      return el('button', { class: 'dd-item', role: 'menuitem', 'data-key': it.key.toLowerCase(), onclick: function () { closeMenu(); it.run(); } }, [
        el('span', { text: it.check && it.check() ? '\u221A' : '' }), hot(it.label, it.key), el('span', { text: it.hint || '' })
      ]);
    }));
    document.body.append(dropdown);
    var r = titles[i].getBoundingClientRect();
    dropdown.style.top = r.bottom + 'px';
    dropdown.style.left = Math.max(0, Math.min(r.left, innerWidth - dropdown.offsetWidth - 16)) + 'px';
    dropdown.querySelector('.dd-item').focus();
  }
  function closeMenu(refocus) {
    if (menuOpen < 0) return;
    var t = titles[menuOpen];
    t.setAttribute('aria-expanded', 'false');
    dropdown.remove(); dropdown = null; menuOpen = -1;
    if (refocus) t.focus();
  }
  document.addEventListener('pointerdown', function (e) {
    if (menuOpen >= 0 && !e.target.closest('.dropdown, .menu-title')) closeMenu();
  });

  function deskKey(e) {
    var k = e.key, n = MENUS.length;
    if (menuOpen >= 0) {
      var items = Array.prototype.slice.call(dropdown.querySelectorAll('.dd-item')), i = items.indexOf(document.activeElement);
      if (k === 'Escape') closeMenu(true);
      else if (k === 'ArrowDown') items[(i + 1) % items.length].focus();
      else if (k === 'ArrowUp') items[(i + items.length - 1) % items.length].focus();
      else if (k === 'ArrowRight') openMenu((menuOpen + 1) % n);
      else if (k === 'ArrowLeft') openMenu((menuOpen + n - 1) % n);
      else if (k === 'Tab') { closeMenu(); return; }
      else if (k.length === 1 && !e.altKey) {
        var hit = dropdown.querySelector('.dd-item[data-key="' + k.toLowerCase().replace(/["\\]/g, '') + '"]');
        if (!hit) return;
        hit.click();
      } else return;
      e.preventDefault();
      return;
    }
    if (e.altKey) {                       // e.code, because Alt changes the character on a Mac keyboard
      var m = MENUS.findIndex(function (x) { return e.code === 'Key' + x.key.toUpperCase(); });
      if (e.code === 'KeyX') exitToDos();
      else if (m >= 0) openMenu(m);
      else return;
    }
    else if (k === 'F10') openMenu(0);
    else if (k === 'F1') openWin('help');
    else if (k === 'F6') nextWin();
    else if (k === 'Escape' && active) closeWin(active);
    else return;
    e.preventDefault();
  }

  function startDesktop(picked) {
    show('desktop');
    document.body.classList.toggle('narrow', narrowMq.matches);
    closeAll(); pos = {};
    mode = store.get('pf.layout') === 'cascade' ? 'cascade' : 'tile';
    desk.setAttribute('data-mode', mode);
    setCrt(picked.indexOf('crt') >= 0);
    var ids = picked.filter(function (id) { return WINS[id]; });
    ids.filter(function (id) { return id !== 'about'; }).forEach(openWin);
    if (ids.indexOf('about') >= 0) openWin('about');                  // the read-me ends up on top
    if (narrowMq.matches) desk.scrollTop = 0;
  }

  /* ---------- Exit: a DOS prompt that answers a few commands ---------- */
  var out = '', buf = '';
  function ps1() { return 'C:\\' + D.product + '>'; }
  function drawPrompt() { $('promptText').textContent = out + ps1() + buf; $('prompt').scrollTop = $('prompt').scrollHeight; }
  function exitToDos() {
    closeMenu();
    show('prompt');
    out = 'Thank you for using ' + D.product + '.\n\nType ' + D.product + ' to return, or HELP for more.\n\n'; buf = '';
    $('promptBack').textContent = '[ Return to ' + D.product + ' ]';
    drawPrompt();
  }
  function backToDesktop() { show('desktop'); layout(); }
  function runCommand(line) {
    var cmd = line.trim().toUpperCase().replace(/\.(EXE|COM|BAT)$/, '');
    out += ps1() + line + '\n';
    if (!cmd) return;
    if (cmd === D.product.toUpperCase() || cmd === 'WIN' || cmd === 'EXIT') return backToDesktop();
    if (cmd === 'SETUP') return startSetup();
    if (cmd === 'CLS') { out = ''; return; }
    if (cmd === 'VER') out += '\n' + D.name + ' ' + D.product + ' Version ' + D.version + '\n\n';
    else if (cmd === 'HELP') out += '\n' + D.product.padEnd(10) + 'Return to the portfolio\nSETUP     Run Setup again\nDIR       List files\nVER       Show the version\nCLS       Clear the screen\n\n';
    else if (cmd === 'DIR') {
      out += '\n Volume in drive C is ' + D.product + '\n Directory of C:\\' + D.product + '\n\n' + COMPS.map(function (c) {
        var f = c.file.split('.');
        return f[0].padEnd(9) + f[1].padEnd(4) + (c.kb * 1024).toLocaleString('en-US').padStart(12);
      }).join('\n') + '\n' + String(COMPS.length).padStart(9) + ' file(s)\n\n';
    }
    else out += 'Bad command or file name\n\n';
  }
  function promptKey(e) {
    var k = e.key;
    if (k === 'Escape') backToDesktop();
    else if (k === 'Enter') { var line = buf; buf = ''; runCommand(line); if (screen === 'prompt') drawPrompt(); }
    else if (k === 'Backspace') { buf = buf.slice(0, -1); drawPrompt(); }
    else if (k.length === 1 && !e.altKey && buf.length < 60) { buf += k; drawPrompt(); }
    else return;
    e.preventDefault();
  }
  $('promptBack').addEventListener('click', backToDesktop);

  /* ---------- pixel-art mouse cursors ----------
     Drawn on a canvas and handed to CSS through the --cur-* variables. Everywhere: an adventure-game crosshair that
     cycles white and greys. On window title bars: a four-way move cursor, yellow while dragging. */
  var MOVE = [
    '.......k.......', '......kwk......', '.....kwwwk.....', '....kkkwkkk....', '...k..kwk..k...',
    '..kk..kwk..kk..', '.kwkkkkwkkkkwk.', 'kwwwwwwwwwwwwwk', '.kwkkkkwkkkkwk.', '..kk..kwk..kk..',
    '...k..kwk..k...', '....kkkwkkk....', '.....kwwwk.....', '......kwk......', '.......k.......'
  ];
  function crossRows() {                    // four arms round a hollow centre, with a dark edge so it shows on any colour
    var n = 17, mid = 8, rows = [], x, y, arm, near;
    for (y = 0; y < n; y++) {
      rows.push('');
      for (x = 0; x < n; x++) {
        arm = (x === mid && Math.abs(y - mid) > 1 && y > 0 && y < n - 1) || (y === mid && Math.abs(x - mid) > 1 && x > 0 && x < n - 1);
        near = (Math.abs(x - mid) <= 1 && Math.abs(y - mid) > 0) || (Math.abs(y - mid) <= 1 && Math.abs(x - mid) > 0);
        rows[y] += arm ? 'c' : near && (Math.abs(x - mid) > 1 || Math.abs(y - mid) > 1) ? 'k' : '.';
      }
    }
    return rows;
  }
  function cursorPng(rows, scale, fill) {
    var c = document.createElement('canvas'), g = c.getContext('2d');
    c.width = rows[0].length * scale; c.height = rows.length * scale;
    rows.forEach(function (row, y) {
      row.split('').forEach(function (ch, x) {
        var col = { k: '#000000', w: fill, c: fill }[ch];
        if (col) { g.fillStyle = col; g.fillRect(x * scale, y * scale, scale, scale); }
      });
    });
    return c.toDataURL('image/png');
  }
  function cursorCss(rows, scale, fill, fallback) {
    var hot = Math.floor(rows.length / 2) * scale + Math.floor(scale / 2);
    var sharp = window.CSS && CSS.supports && CSS.supports('cursor', 'image-set(url("a.png") 1x, url("b.png") 2x) 1 1, auto');
    var img = sharp ? 'image-set(url("' + cursorPng(rows, scale, fill) + '") 1x, url("' + cursorPng(rows, scale * 2, fill) + '") 2x)' : 'url("' + cursorPng(rows, scale, fill) + '")';
    return img + ' ' + hot + ' ' + hot + ', ' + fallback;
  }
  function installCursors() {
    if (!matchMedia('(pointer: fine)').matches) return;             // touch screens have no cursor to replace
    var root = document.documentElement.style, cross = crossRows(), f = 0;
    var frames = ['#FFFFFF', '#AAAAAA', '#555555', '#AAAAAA'].map(function (c) { return cursorCss(cross, 2, c, 'crosshair'); });
    function showFrame() { root.setProperty('--cur-arrow', frames[f]); root.setProperty('--cur-point', frames[f]); }
    root.setProperty('--cur-grab', cursorCss(MOVE, 2, '#FFFFFF', 'grab'));
    root.setProperty('--cur-grabbing', cursorCss(MOVE, 2, '#FFFF55', 'grabbing'));
    showFrame();
    if (!reduced) setInterval(function () { if (!document.hidden) { f = (f + 1) % frames.length; showFrame(); } }, 160);
  }

  /* ---------- boot ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) return;
    if (screen === 'setup') setupKey(e);
    else if (screen === 'desktop') deskKey(e);
    else if (screen === 'prompt') promptKey(e);
  });
  addEventListener('resize', function () { closeMenu(); layout(); });
  narrowMq.addEventListener('change', function () {
    document.body.classList.toggle('narrow', narrowMq.matches);
    layout();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);   // window widths are in ch, so they move once the font arrives

  document.title = D.name + ' - Portfolio';
  document.body.classList.toggle('narrow', narrowMq.matches);
  installCursors();
  Object.keys(WINS).forEach(makeWin);
  buildBars();
  /* straight to the desktop with everything open; Setup stays reachable from File > Run Setup again.
     Scanlines are on unless the visitor switched them off. */
  startDesktop(DEFAULTS.filter(function (id) { return id !== 'crt' || store.get('pf.scanlines') !== '0'; }));
})();
