/* =========================================================
   唐诗宋词苑 · 交互脚本 v3
   全部使用原生 JavaScript 编写，数据直接写在脚本内，
   不发起任何网络请求，不依赖任何外部库，离线可用。
   保留：阅读进度条、吸顶导航、移动端菜单、水墨 Hero、
   滚动显现、栏目搜索筛选、诗词一键复制、滚动监听、
   随机读诗逐行浮现。
   新增：夜读模式切换、Hero 视差分层与浮墨点、按钮涟漪、
   细读弹窗、Toast 轻提示、分栏数字滚动、今日诗笺、
   标题逐字浮现、诗人页名句横幅、诗词数量角标。
   ========================================================= */

// 精选诗词摘句（用于首页"随机读诗"与"今日诗笺"）
var POEMS = [
  { title:"静夜思",                author:"李白",    dynasty:"唐", body:"床前明月光，疑是地上霜。\n举头望明月，低头思故乡。" },
  { title:"望庐山瀑布",            author:"李白",    dynasty:"唐", body:"日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。" },
  { title:"登高",                  author:"杜甫",    dynasty:"唐", body:"风急天高猿啸哀，渚清沙白鸟飞回。\n无边落木萧萧下，不尽长江滚滚来。" },
  { title:"春望",                  author:"杜甫",    dynasty:"唐", body:"国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。" },
  { title:"相思",                  author:"王维",    dynasty:"唐", body:"红豆生南国，春来发几枝。\n愿君多采撷，此物最相思。" },
  { title:"山居秋暝",              author:"王维",    dynasty:"唐", body:"空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。" },
  { title:"忆江南",                author:"白居易",  dynasty:"唐", body:"江南好，风景旧曾谙。\n日出江花红胜火，春来江水绿如蓝。能不忆江南？" },
  { title:"水调歌头·明月几时有（节选）", author:"苏轼", dynasty:"宋", body:"人有悲欢离合，月有阴晴圆缺，此事古难全。\n但愿人长久，千里共婵娟。" },
  { title:"江城子·密州出猎（节选）",   author:"苏轼",  dynasty:"宋", body:"会挽雕弓如满月，西北望，射天狼。" },
  { title:"如梦令·常记溪亭日暮",   author:"李清照",  dynasty:"宋", body:"常记溪亭日暮，沉醉不知归路。\n兴尽晚回舟，误入藕花深处。\n争渡，争渡，惊起一滩鸥鹭。" },
  { title:"一剪梅·红藕香残玉簟秋（节选）", author:"李清照", dynasty:"宋", body:"花自飘零水自流。一种相思，两处闲愁。\n此情无计可消除，才下眉头，却上心头。" },
  { title:"青玉案·元夕（节选）",    author:"辛弃疾",  dynasty:"宋", body:"众里寻他千百度。\n蓦然回首，那人却在，灯火阑珊处。" },
  { title:"蝶恋花·伫倚危楼风细细（节选）", author:"柳永", dynasty:"宋", body:"衣带渐宽终不悔，为伊消得人憔悴。" },
  { title:"雨霖铃·寒蝉凄切（节选）", author:"柳永",   dynasty:"宋", body:"今宵酒醒何处？杨柳岸，晓风残月。" }
];

// 诗人详情页名句横幅
var POET_QUOTES = {
  "李白":   { line:"长风破浪会有时，直挂云帆济沧海。",     from:"《行路难·其一》" },
  "杜甫":   { line:"会当凌绝顶，一览众山小。",             from:"《望岳》" },
  "王维":   { line:"行到水穷处，坐看云起时。",             from:"《终南别业》" },
  "白居易": { line:"同是天涯沦落人，相逢何必曾相识。",     from:"《琵琶行》" },
  "苏轼":   { line:"竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。", from:"《定风波·莫听穿林打叶声》" },
  "李清照": { line:"生当作人杰，死亦为鬼雄。",             from:"《夏日绝句》" },
  "辛弃疾": { line:"了却君王天下事，赢得生前身后名。",     from:"《破阵子·为陈同甫赋壮词以寄之》" },
  "柳永":   { line:"多情自古伤离别，更那堪，冷落清秋节！", from:"《雨霖铃·寒蝉凄切》" }
};

(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 小工具 ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function copyText(text, done) {
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, legacy);
    } else {
      legacy();
    }
  }

  function pageScrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function dayOfYear() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  /* ---------- 0. Toast 轻提示 ---------- */
  var toastWrap = null;
  function showToast(msg) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "toast-wrap";
      toastWrap.setAttribute("aria-live", "polite");
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="20 6 9 17 4 12"/>' +
      "</svg><span>" + esc(msg) + "</span>";
    toastWrap.appendChild(t);
    void t.offsetWidth;
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 350);
    }, 1900);
  }

  /* ---------- 1. 阅读进度条 + 吸顶阴影 ---------- */
  function setupProgress() {
    var bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.setAttribute("aria-hidden", "true");
    document.body.insertBefore(bar, document.body.firstChild);

    var header = document.querySelector(".site-header");
    function onScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? pageScrollY() / max : 0;
      bar.style.transform = "scaleX(" + p + ")";
      if (header) header.classList.toggle("scrolled", pageScrollY() > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. 导航高亮 ---------- */
  function setupNavHighlight() {
    var here = location.pathname.split("/").pop() || "index.html";
    var navLinks = document.querySelectorAll(".main-nav a");
    for (var i = 0; i < navLinks.length; i++) {
      var target = navLinks[i].getAttribute("href").split("/").pop();
      if (target === here) navLinks[i].classList.add("active");
    }
  }

  /* ---------- 3. 移动端菜单 + 夜读切换 ---------- */
  function setupNavToggle() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var btn = document.createElement("button");
    btn.className = "nav-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "展开菜单");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<g class="l" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">' +
          '<line class="line-1" x1="4" y1="7" x2="20" y2="7"/>' +
          '<line class="line-2" x1="4" y1="12" x2="20" y2="12"/>' +
          '<line class="line-3" x1="4" y1="17" x2="20" y2="17"/>' +
        "</g>" +
      "</svg>";
    header.appendChild(btn);

    function close() {
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "展开菜单");
    }
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "收起菜单" : "展开菜单");
    });
    var links = document.querySelectorAll(".main-nav a");
    for (var i = 0; i < links.length; i++) links[i].addEventListener("click", close);
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) close();
    });
  }

  function setupThemeToggle() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "切换夜读模式");
    btn.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>' +
      "</svg>" +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4.2"/>' +
        '<line x1="12" y1="2" x2="12" y2="4.4"/><line x1="12" y1="19.6" x2="12" y2="22"/>' +
        '<line x1="2" y1="12" x2="4.4" y2="12"/><line x1="19.6" y1="12" x2="22" y2="12"/>' +
        '<line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/>' +
        '<line x1="19.1" y1="4.9" x2="17.4" y2="6.6"/><line x1="6.6" y1="17.4" x2="4.9" y2="19.1"/>' +
      "</svg>";
    header.appendChild(btn);

    var saved = null;
    try { saved = localStorage.getItem("tss-night"); } catch (e) {}
    if (saved === "1") document.body.classList.add("night");

    btn.addEventListener("click", function () {
      var on = document.body.classList.toggle("night");
      btn.setAttribute("aria-label", on ? "切换日间模式" : "切换夜读模式");
      try { localStorage.setItem("tss-night", on ? "1" : "0"); } catch (e) {}
    });
  }

  /* ---------- 4. 水墨山水 Hero（仅首页，带视差分层） ---------- */
  function setupHeroScene() {
    var hero = document.querySelector(".hero");
    if (!hero || hero.querySelector(".hero-scene")) return;
    var svg =
      '<svg class="hero-scene" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
        "<defs>" +
          '<radialGradient id="tssMoon" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="var(--scene-moon)"/>' +
            '<stop offset="62%" stop-color="var(--scene-moon)"/>' +
            '<stop offset="100%" stop-color="rgba(239,220,174,0)"/>' +
          "</radialGradient>" +
          '<linearGradient id="tssMist" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="rgba(245,238,218,0)"/>' +
            '<stop offset="50%" stop-color="var(--scene-mist)"/>' +
            '<stop offset="100%" stop-color="rgba(245,238,218,0)"/>' +
          "</linearGradient>" +
        "</defs>" +
        '<g class="plx" data-depth="0.14">' +
          '<circle class="scene-moon" cx="930" cy="252" r="80" fill="url(#tssMoon)"/>' +
          '<circle cx="930" cy="252" r="30" fill="var(--scene-moon-core)"/>' +
        "</g>" +
        '<g class="plx" data-depth="0.30">' +
          '<path d="M0 352 L130 268 L272 342 L410 246 L552 338 L690 258 L836 346 L972 268 L1108 340 L1200 292 L1200 600 L0 600 Z" fill="var(--scene-mt1)" opacity=".5"/>' +
        "</g>" +
        '<g class="plx" data-depth="0.52">' +
          '<path d="M0 436 L190 330 L372 424 L536 344 L712 434 L872 352 L1036 434 L1200 366 L1200 600 L0 600 Z" fill="var(--scene-mt2)" opacity=".82"/>' +
        "</g>" +
        '<g class="plx" data-depth="0.42">' +
          '<ellipse class="scene-mist" cx="260" cy="468" rx="320" ry="36" fill="url(#tssMist)"/>' +
          '<ellipse class="scene-mist" cx="880" cy="498" rx="300" ry="30" fill="url(#tssMist)"/>' +
        "</g>" +
        '<g class="plx" data-depth="0.34">' +
          '<g class="scene-crane" transform="translate(0,300)">' +
            '<path d="M4 14 Q12 -6 24 12" fill="none" stroke="var(--scene-crane)" stroke-width="3" stroke-linecap="round"/>' +
            '<path d="M24 12 Q36 -4 46 16" fill="none" stroke="var(--scene-crane)" stroke-width="3" stroke-linecap="round"/>' +
          "</g>" +
          '<g class="scene-crane c2" transform="translate(90,256)">' +
            '<path d="M4 14 Q12 -6 24 12" fill="none" stroke="var(--scene-crane)" stroke-width="2.4" stroke-linecap="round"/>' +
            '<path d="M24 12 Q36 -4 46 16" fill="none" stroke="var(--scene-crane)" stroke-width="2.4" stroke-linecap="round"/>' +
          "</g>" +
        "</g>" +
      "</svg>";
    hero.insertAdjacentHTML("afterbegin", svg);

    if (reduced) return;

    /* 浮墨点 */
    var dots = [
      { s: 34, l: 8,  b: 22, d: 0 },
      { s: 22, l: 16, b: 60, d: 2.4 },
      { s: 44, l: 40, b: 12, d: 1.2 },
      { s: 18, l: 62, b: 66, d: 3.6 },
      { s: 30, l: 82, b: 30, d: 5.2 },
      { s: 20, l: 92, b: 58, d: 4.2 }
    ];
    for (var d = 0; d < dots.length; d++) {
      var dot = document.createElement("span");
      dot.className = "ink-dot";
      dot.style.width = dots[d].s + "px";
      dot.style.height = dots[d].s + "px";
      dot.style.left = dots[d].l + "%";
      dot.style.bottom = dots[d].b + "px";
      dot.style.animationDelay = dots[d].d + "s";
      dot.style.animationDuration = (7 + d * 1.3) + "s";
      hero.appendChild(dot);
    }

    /* 视差：滚动 + 鼠标 */
    var groups = hero.querySelectorAll(".plx");
    var ticking = false;
    var scrollY = 0, mx = 0, my = 0;

    function applyParallax() {
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        var depth = parseFloat(g.getAttribute("data-depth")) || 0.3;
        var ty = -scrollY * depth * 0.28;
        var tx = finePointer ? mx * -22 * depth : 0;
        var ty2 = finePointer ? my * -12 * depth : 0;
        g.style.transform = "translate3d(" + tx + "px, " + (ty + ty2) + "px, 0)";
      }
      ticking = false;
    }
    function requestTick() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(applyParallax); }
    }
    window.addEventListener("scroll", function () {
      scrollY = pageScrollY();
      requestTick();
    }, { passive: true });
    if (finePointer) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
        requestTick();
      });
    }
  }

  /* ---------- 5. 滚动显现 ---------- */
  function setupReveal() {
    var grouped = document.querySelectorAll(".poem-card");
    for (var i = 0; i < grouped.length; i++) {
      grouped[i].style.setProperty("--rd", (i % 3) * 90 + "ms");
    }
    var gates = document.querySelectorAll(".gate-card");
    for (var g = 0; g < gates.length; g++) {
      gates[g].style.setProperty("--rd", g * 150 + "ms");
    }
    var all = document.querySelectorAll(
      ".poet-section, .gate-card, .poem-card, .about-block, .poet-profile, .random-wrap, .section-head, .stats-bar, .featured-quote, .poet-quote"
    );
    if (!all.length || reduced) return;

    /* 仅对首屏以下的元素做滚动显现；首屏内容直接可见，避免任何隐藏风险 */
    var below = [];
    var fold = window.innerHeight * 0.9;
    for (var a = 0; a < all.length; a++) {
      if (all[a].getBoundingClientRect().top > fold) {
        all[a].classList.add("reveal");
        below.push(all[a]);
      }
    }
    if (!below.length) return;

    function revealInView() {
      for (var v = 0; v < below.length; v++) {
        if (!below[v].classList.contains("in")) {
          var r = below[v].getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            below[v].classList.add("in");
          }
        }
      }
    }
    if (!("IntersectionObserver" in window)) { revealInView(); return; }

    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          entries[e].target.classList.add("in");
          io.unobserve(entries[e].target);
        }
      }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    for (var o = 0; o < below.length; o++) io.observe(below[o]);

    /* 安全兜底：延迟后仍在视口内的元素立即显现，杜绝"永不可见" */
    setTimeout(revealInView, 1200);
    window.addEventListener("load", revealInView);
  }

  /* ---------- 6. 栏目搜索筛选 ---------- */
  function setupSearch() {
    var sections = document.querySelectorAll(".poet-section");
    var chipsWrap = document.querySelector(".poet-chips");
    if (!sections.length || !chipsWrap) return;

    var wrap = document.createElement("div");
    wrap.className = "search-wrap";
    wrap.innerHTML =
      '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/>' +
      "</svg>" +
      '<input id="poemSearch" type="text" placeholder="搜索诗人或诗词名，即时筛选" autocomplete="off" aria-label="搜索诗人或诗词名"/>' +
      '<button class="search-clear" type="button" aria-label="清空搜索">×</button>' +
      '<p class="search-hint">共收录 ' + sections.length + ' 位名家 · 输入关键词快速定位</p>';

    var empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "未找到匹配的诗作，请尝试其他关键词。";

    var parent = chipsWrap.parentNode;
    parent.insertBefore(wrap, chipsWrap);
    parent.insertBefore(empty, chipsWrap);

    var input = wrap.querySelector("#poemSearch");
    var clear = wrap.querySelector(".search-clear");

    function apply() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      for (var i = 0; i < sections.length; i++) {
        var hit = !q || sections[i].textContent.toLowerCase().indexOf(q) > -1;
        sections[i].style.display = hit ? "" : "none";
        if (hit) shown++;
      }
      empty.classList.toggle("show", q !== "" && shown === 0);
      clear.classList.toggle("show", q !== "");
    }
    input.addEventListener("input", apply);
    clear.addEventListener("click", function () {
      input.value = "";
      apply();
      input.focus();
    });
  }

  /* ---------- 7. 诗词卡片复制按钮 ---------- */
  function setupCopyButtons() {
    var cards = document.querySelectorAll(".poem-card");
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        if (card.querySelector(".copy-btn")) return;
        var btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.type = "button";
        btn.setAttribute("aria-label", "复制这首诗");
        btn.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>' +
          "</svg>";
        card.appendChild(btn);
        btn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var titleEl = card.querySelector(".poem-title");
          var metaEl = card.querySelector(".poem-meta");
          var bodyEl = card.querySelector(".poem-body");
          var text = (titleEl ? titleEl.textContent : "") +
                     (metaEl ? "（" + metaEl.textContent.trim() + "）" : "") +
                     "\n" + (bodyEl ? bodyEl.textContent.trim() : "");
          copyText(text, function () {
            btn.classList.add("copied");
            btn.setAttribute("aria-label", "已复制");
            showToast("已复制到剪贴板");
            setTimeout(function () {
              btn.classList.remove("copied");
              btn.setAttribute("aria-label", "复制这首诗");
            }, 1600);
          });
        });
      })(cards[i]);
    }
  }

  /* ---------- 8. 滚动监听（chips 高亮） ---------- */
  function setupScrollspy() {
    var chips = document.querySelectorAll(".poet-chips a");
    var sections = document.querySelectorAll(".poet-section");
    if (!chips.length || !sections.length) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var current = "";
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= 150) current = sections[i].id;
        }
        for (var c = 0; c < chips.length; c++) {
          var isActive = chips[c].getAttribute("href") === "#" + current;
          chips[c].classList.toggle("active", isActive);
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 9. 回到顶部（进度环） ---------- */
  function setupToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    btn.innerHTML =
      '<svg viewBox="0 0 36 36" aria-hidden="true">' +
        '<circle class="ring-bg" cx="18" cy="18" r="15"/>' +
        '<circle class="ring" cx="18" cy="18" r="15"/>' +
      "</svg>" +
      '<span class="arrow">↑</span>';
    var ring = btn.querySelector(".ring");
    var CIRC = 2 * Math.PI * 15;

    function onScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? pageScrollY() / max : 0;
      ring.style.strokeDashoffset = CIRC * (1 - p);
      btn.classList.toggle("show", pageScrollY() > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- 10. 随机读诗（逐行浮现 + 可复制） ---------- */
  function setupRandomPoem() {
    var rpBtn = document.querySelector("#randomPoemBtn");
    var rpBox = document.querySelector("#randomPoemBox");
    if (!rpBtn || !rpBox) return;

    var last = -1;
    rpBtn.addEventListener("click", function () {
      var idx;
      do { idx = Math.floor(Math.random() * POEMS.length); } while (idx === last && POEMS.length > 1);
      last = idx;
      var p = POEMS[idx];
      var lines = p.body.split("\n");

      var html = '<p class="rp-title">' + esc(p.title) + "</p><div class=\"rp-body\">";
      for (var i = 0; i < lines.length; i++) html += "<span>" + esc(lines[i]) + "</span>";
      html += '</div><p class="rp-meta">' + esc(p.dynasty) + " · " + esc(p.author) + "</p>" +
              '<button class="rp-copy" type="button">复制</button>';

      rpBox.innerHTML = html;
      rpBox.style.display = "block";
      rpBox.classList.remove("stamped");
      void rpBox.offsetWidth;
      rpBox.classList.add("stamped");

      var spans = rpBox.querySelectorAll(".rp-body span");
      for (var s = 0; s < spans.length; s++) {
        spans[s].style.transitionDelay = (160 + s * 150) + "ms";
      }
      window.requestAnimationFrame(function () {
        for (var k = 0; k < spans.length; k++) {
          spans[k].style.opacity = "1";
          spans[k].style.transform = "none";
        }
      });

      var cp = rpBox.querySelector(".rp-copy");
      cp.addEventListener("click", function () {
        var text = p.title + "\n" + p.body + "\n（" + p.dynasty + " · " + p.author + "）";
        copyText(text, function () {
          cp.textContent = "已复制";
          cp.classList.add("copied");
          showToast("已复制到剪贴板");
          setTimeout(function () { cp.textContent = "复制"; cp.classList.remove("copied"); }, 1600);
        });
      });
    });
  }

  /* ---------- 11. 今日诗笺（按日期轮换） ---------- */
  function setupFeaturedQuote() {
    var box = document.querySelector(".featured-quote");
    if (!box) return;
    var idx = dayOfYear() % POEMS.length;
    var p = POEMS[idx];
    var lines = p.body.split("\n").slice(0, 2);
    var inner = "";
    for (var i = 0; i < lines.length; i++) inner += "<span>" + esc(lines[i]) + "</span>";

    var label = box.querySelector(".fq-label");
    var text = box.querySelector(".fq-text");
    var meta = box.querySelector(".fq-meta");
    var foot = box.querySelector(".fq-foot span");
    if (label) label.textContent = "今日诗笺 · 第 " + idx + " 首";
    if (text) text.innerHTML = inner;
    if (meta) meta.textContent = esc(p.dynasty) + " · " + esc(p.author) + " · " + esc(p.title);
    if (foot) foot.textContent = "每日自动轮换 · 共收录 " + POEMS.length + " 首名篇";

    if (reduced) return;
    var spans = text ? text.querySelectorAll("span") : [];
    setTimeout(function () {
      for (var k = 0; k < spans.length; k++) {
        (function (sp, d) {
          setTimeout(function () { sp.classList.add("on"); }, d);
        })(spans[k], 250 + k * 220);
      }
    }, 300);
  }

  /* ---------- 12. 分栏统计数字滚动 ---------- */
  function setupStats() {
    var bar = document.querySelector(".stats-bar");
    var nums = document.querySelectorAll(".stat-num");
    if (!bar || !nums.length) return;

    function run() {
      for (var i = 0; i < nums.length; i++) {
        (function (el) {
          var target = parseInt(el.getAttribute("data-count"), 10) || 0;
          if (reduced) { el.textContent = target; return; }
          var dur = 1300, start = null;
          function step(now) {
            if (!start) start = now;
            var t = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) setTimeout(function () { step(Date.now()); }, 24);
          }
          setTimeout(function () { step(Date.now()); }, i * 90);
        })(nums[i]);
      }
    }

    /* 首屏内直接开跑；否则滚动进入再触发 */
    var rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) { run(); return; }
    if (!("IntersectionObserver" in window)) { run(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(bar);
  }

  /* ---------- 13. 标题逐字浮现 ---------- */
  function setupSplitReveal() {
    var els = document.querySelectorAll(".split-reveal");
    if (!els.length || reduced) return;
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var text = el.textContent;
        var chars = Array.from(text);
        var html = "";
        for (var c = 0; c < chars.length; c++) {
          var ch = chars[c] === " " ? "\u00A0" : chars[c];
          html += '<span class="char" style="--i:' + c + '">' + esc(ch) + "</span>";
        }
        el.innerHTML = html;
        el.classList.add("split");
        void el.offsetWidth;
        el.classList.add("in");
      })(els[i]);
    }
  }

  /* ---------- 14. 细读弹窗 ---------- */
  function setupReadingModal() {
    var cards = document.querySelectorAll(".poem-card");
    if (!cards.length) return;

    var modal = document.createElement("div");
    modal.className = "read-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "诗词细读");
    modal.innerHTML =
      '<div class="rm-backdrop"></div>' +
      '<div class="rm-panel">' +
        '<button class="rm-close" type="button" aria-label="关闭">×</button>' +
        '<span class="rm-seal">诗</span>' +
        '<h3 class="rm-title"></h3>' +
        '<p class="rm-meta"></p>' +
        '<p class="rm-body"></p>' +
        '<p class="rm-note" hidden></p>' +
        '<div class="rm-actions">' +
          '<button class="btn rm-copy" type="button">复制全篇</button>' +
          '<button class="btn btn-ghost rm-close-2" type="button">关闭</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(modal);

    var backdrop = modal.querySelector(".rm-backdrop");
    var panel = modal.querySelector(".rm-panel");
    var titleEl = modal.querySelector(".rm-title");
    var metaEl = modal.querySelector(".rm-meta");
    var bodyEl = modal.querySelector(".rm-body");
    var noteEl = modal.querySelector(".rm-note");
    var closeBtn = modal.querySelector(".rm-close");
    var close2 = modal.querySelector(".rm-close-2");
    var copyBtn = modal.querySelector(".rm-copy");
    var current = null;

    function open(card) {
      var t = card.querySelector(".poem-title");
      var m = card.querySelector(".poem-meta");
      var b = card.querySelector(".poem-body");
      var n = card.querySelector(".poem-note");
      var seal = card.querySelector(".seal-mark");
      if (!t || !b) return;
      current = card;
      titleEl.textContent = t.textContent;
      metaEl.textContent = m ? m.textContent.trim() : "";
      bodyEl.textContent = b.textContent.trim();
      if (n) {
        noteEl.textContent = n.textContent.trim();
        noteEl.hidden = false;
      } else {
        noteEl.hidden = true;
      }
      modal.querySelector(".rm-seal").textContent = seal ? seal.textContent : "诗";
      modal.classList.add("open");
      document.body.classList.add("modal-open");
      panel.scrollTop = 0;
      closeBtn.focus();
    }
    function close() {
      modal.classList.remove("open");
      document.body.classList.remove("modal-open");
      current = null;
    }

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener("click", function (ev) {
          if (ev.target.closest(".copy-btn")) return;
          if (ev.target.closest("a")) return;
          open(card);
        });
      })(cards[i]);
    }
    backdrop.addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    close2.addEventListener("click", close);
    copyBtn.addEventListener("click", function () {
      if (!current) return;
      var t = current.querySelector(".poem-title");
      var m = current.querySelector(".poem-meta");
      var b = current.querySelector(".poem-body");
      var n = current.querySelector(".poem-note");
      var text = (t ? t.textContent : "") +
                 (m ? "（" + m.textContent.trim() + "）" : "") +
                 "\n" + (b ? b.textContent.trim() : "") +
                 (n ? "\n\n" + n.textContent.trim() : "");
      copyText(text, function () { showToast("已复制全篇"); });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && modal.classList.contains("open")) close();
      if (ev.key === "Tab" && modal.classList.contains("open")) {
        var focusables = panel.querySelectorAll("button");
        if (focusables.length && !panel.contains(document.activeElement)) {
          ev.preventDefault();
          closeBtn.focus();
        }
      }
    });
  }

  /* ---------- 15. 按钮墨波涟漪 ---------- */
  function setupRipple() {
    var btns = document.querySelectorAll(".btn");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener("pointerdown", function (ev) {
          if (reduced) return;
          var r = btn.getBoundingClientRect();
          var d = Math.max(r.width, r.height) * 1.1;
          var rip = document.createElement("span");
          rip.className = "ripple";
          rip.style.width = rip.style.height = d + "px";
          rip.style.left = (ev.clientX - r.left - d / 2) + "px";
          rip.style.top = (ev.clientY - r.top - d / 2) + "px";
          btn.appendChild(rip);
          rip.addEventListener("animationend", function () {
            if (rip.parentNode) rip.parentNode.removeChild(rip);
          });
        });
      })(btns[i]);
    }
  }

  /* ---------- 16. 诗人页名句横幅 ---------- */
  function setupPoetQuote() {
    var profile = document.querySelector(".poet-profile");
    if (!profile) return;
    var name = profile.querySelector("h1");
    if (!name) return;
    var q = POET_QUOTES[name.textContent.trim()];
    if (!q) return;
    var band = document.createElement("div");
    band.className = "poet-quote";
    band.innerHTML =
      '<p class="pq-line">' + esc(q.line) + "</p>" +
      '<p class="pq-author">' + esc(name.textContent.trim()) + " · " + esc(q.from) + "</p>";
    profile.parentNode.insertBefore(band, profile.nextSibling);
  }

  /* ---------- 17. 诗人区块诗词数量角标 ---------- */
  function setupPoemCounts() {
    var heads = document.querySelectorAll(".poet-head");
    for (var i = 0; i < heads.length; i++) {
      var section = heads[i].closest(".poet-section");
      if (!section) continue;
      var count = section.querySelectorAll(".poem-card").length;
      var span = document.createElement("span");
      span.className = "poem-count";
      span.textContent = count + " 首";
      heads[i].appendChild(span);
    }
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    setupThemeToggle();
    setupProgress();
    setupNavHighlight();
    setupNavToggle();
    setupHeroScene();
    setupSplitReveal();
    setupReveal();
    setupSearch();
    setupCopyButtons();
    setupScrollspy();
    setupToTop();
    setupRandomPoem();
    setupFeaturedQuote();
    setupStats();
    setupReadingModal();
    setupRipple();
    setupPoetQuote();
    setupPoemCounts();
  });
})();
/* =========================================================
   Kamrul Islam All Rights Reserved
   ========================================================= */
