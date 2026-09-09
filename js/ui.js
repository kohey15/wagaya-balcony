/**
 * ui.js
 * DOM の描画とイベント処理だけを担当する。ゲームルールは Game 側に委譲する。
 */
window.UI = (function () {
  "use strict";

  var el = {}; // DOM参照キャッシュ
  var dialogueQueue = [];
  var speakerLabel = { father: "父", daughter: "娘" };

  /**
   * 画像が読み込めなかった場合に絵文字プレースホルダーへ差し替えるための
   * <img> onerror ハンドラ。壊れた画像アイコンを見せないためのもの。
   */
  function onImageError(img) {
    var wrap = img.parentElement;
    if (wrap) wrap.classList.add("img-error");
    img.remove();
  }
  window.__onImageError = onImageError; // インラインonerrorから呼び出すため

  function spriteHtml(src, alt, emojiFallback, extraClass) {
    return (
      '<div class="sprite ' + (extraClass || "") + '" data-emoji="' + emojiFallback + '">' +
      '<img src="' + src + '" alt="' + alt + '" onerror="window.__onImageError(this)">' +
      "</div>"
    );
  }

  function cacheDom() {
    el.dayNum = document.getElementById("dayNum");
    el.jishinTitle = document.getElementById("jishinTitle");
    el.jishinFill = document.getElementById("jishinFill");
    el.menuBtn = document.getElementById("menuBtn");
    el.menuPanel = document.getElementById("menuPanel");
    el.resetBtn = document.getElementById("resetBtn");
    el.bgLayer = document.getElementById("bgLayer");
    el.charFather = document.getElementById("charFather");
    el.charDaughter = document.getElementById("charDaughter");
    el.plantLayer = document.getElementById("plantLayer");
    el.dialogueBox = document.getElementById("dialogueBox");
    el.dialogueSpeaker = document.getElementById("dialogueSpeaker");
    el.dialogueText = document.getElementById("dialogueText");
    el.dialogueNext = document.getElementById("dialogueNext");
    el.harvestBtn = document.getElementById("harvestBtn");
    el.waterBtn = document.getElementById("waterBtn");
    el.fertilizerBtn = document.getElementById("fertilizerBtn");
    el.watchBtn = document.getElementById("watchBtn");
    el.nextDayBtn = document.getElementById("nextDayBtn");
  }

  function renderStaticLayers() {
    el.bgLayer.style.backgroundImage = "url('" + window.CONFIG.BACKGROUND_ASSET + "')";
    var ch = window.CONFIG.CHARACTER_ASSETS;
    el.charFather.innerHTML = spriteHtml(ch.father.image, "父", ch.father.emojiFallback, "char-sprite");
    el.charDaughter.innerHTML = spriteHtml(ch.daughter.image, "娘", ch.daughter.emojiFallback, "char-sprite");
  }

  function renderPlantSlots() {
    var state = window.Game.getState();
    var positions = window.CONFIG.SLOT_POSITIONS;
    el.plantLayer.innerHTML = "";

    window.Game.getAllSlotIds().forEach(function (slotId) {
      var plantId = window.Game.getPlantId(slotId);
      var plantData = window.Game.getPlantData(plantId);
      var pos = positions[slotId] || { left: "50%", bottom: "8%", width: "40%" };

      var wrap = document.createElement("div");
      wrap.className = "plant-slot";
      wrap.id = "slot_" + slotId;
      wrap.style.left = pos.left;
      wrap.style.bottom = pos.bottom;
      wrap.style.width = pos.width;

      wrap.innerHTML =
        spriteHtml(plantData.image, plantData.name, plantData.emojiFallback, "plant-sprite") +
        '<div class="genki-badge" id="genki_' + slotId + '"></div>';

      el.plantLayer.appendChild(wrap);
    });

    refreshGenkiBadges();
  }

  function refreshGenkiBadges() {
    window.Game.getAllSlotIds().forEach(function (slotId) {
      var badge = document.getElementById("genki_" + slotId);
      if (!badge) return;
      var view = window.Game.getGenkiView(slotId);
      badge.textContent = view ? view.emoji : "";
      badge.title = view ? view.label : "";
    });
  }

  function renderHud() {
    var state = window.Game.getState();
    var balance = window.Game.getBalance();
    el.dayNum.textContent = state.day;
    el.jishinTitle.textContent = window.Game.getJishinLevel().title;
    var pct = Math.round((state.jishin / balance.jishin.max) * 100);
    el.jishinFill.style.width = pct + "%";
  }

  function renderActionBar() {
    var state = window.Game.getState();
    var anyNotHarvested = window.Game.getAllSlotIds().some(function (slotId) {
      return !state.plants[slotId].harvestedToday;
    });

    el.harvestBtn.classList.toggle("hidden", !anyNotHarvested);

    var careDisabled = state.careUsedToday;
    [el.waterBtn, el.fertilizerBtn, el.watchBtn].forEach(function (btn) {
      btn.disabled = careDisabled;
    });

    if (careDisabled) {
      var doneLabel = { water: "💧 水やり済み", fertilizer: "🌱 肥料やり済み", watch: "👀 見守り済み" };
      [
        [el.waterBtn, "water"],
        [el.fertilizerBtn, "fertilizer"],
        [el.watchBtn, "watch"]
      ].forEach(function (pair) {
        if (state.lastCareType === pair[1]) pair[0].textContent = doneLabel[pair[1]];
      });
    } else {
      el.waterBtn.textContent = "💧 水をあげる";
      el.fertilizerBtn.textContent = "🌱 肥料をあげる";
      el.watchBtn.textContent = "👀 見守る";
    }
  }

  function refreshAll() {
    renderHud();
    refreshGenkiBadges();
    renderActionBar();
  }

  // ---- 会話ダイアログ ----

  function showQueue(lines) {
    dialogueQueue = (lines || []).slice();
    el.dialogueBox.classList.remove("idle");
    showNextLine();
  }

  function showIdleLine() {
    var lines = window.Events.getIdle();
    var line = lines[0] || { speaker: "father", text: "" };
    renderLine(line);
    el.dialogueBox.classList.add("idle");
    el.dialogueNext.classList.add("hidden");
  }

  function renderLine(line) {
    el.dialogueSpeaker.textContent = speakerLabel[line.speaker] || "";
    el.dialogueText.textContent = line.text;
  }

  function showNextLine() {
    if (dialogueQueue.length === 0) {
      showIdleLine();
      return;
    }
    var line = dialogueQueue.shift();
    renderLine(line);
    el.dialogueBox.classList.remove("idle");
    el.dialogueNext.classList.toggle("hidden", dialogueQueue.length === 0);
  }

  // ---- アクション ----

  function handleHarvest() {
    var result = window.Game.harvest("slot01");
    showQueue(result.lines);
    refreshAll();
  }

  function handleCare(type) {
    var result = window.Game.care(type);
    showQueue(result.lines);
    refreshAll();
  }

  function handleNextDay() {
    var result = window.Game.nextDay();
    refreshAll();
    if (result.lines && result.lines.length > 0) {
      showQueue(result.lines);
    } else {
      showIdleLine();
    }
  }

  function handleReset() {
    var ok = window.confirm("最初からやり直しますか？（これまでの記録は消えます）");
    if (!ok) return;
    window.Game.resetGame();
    el.menuPanel.classList.add("hidden");
    renderPlantSlots();
    refreshAll();
    maybeShowIntro();
  }

  function toggleMenu() {
    el.menuPanel.classList.toggle("hidden");
  }

  function maybeShowIntro() {
    var state = window.Game.getState();
    if (state.day === 1 && window.Game.isFirstHarvestPending()) {
      showQueue(window.Events.getIntroDay1());
    } else {
      showIdleLine();
    }
  }

  function wireEvents() {
    el.harvestBtn.addEventListener("click", handleHarvest);
    el.waterBtn.addEventListener("click", function () { handleCare("water"); });
    el.fertilizerBtn.addEventListener("click", function () { handleCare("fertilizer"); });
    el.watchBtn.addEventListener("click", function () { handleCare("watch"); });
    el.nextDayBtn.addEventListener("click", handleNextDay);
    el.dialogueBox.addEventListener("click", showNextLine);
    el.menuBtn.addEventListener("click", toggleMenu);
    el.resetBtn.addEventListener("click", handleReset);
  }

  function init() {
    cacheDom();
    renderStaticLayers();
    renderPlantSlots();
    refreshAll();
    wireEvents();
    maybeShowIntro();
  }

  return { init: init };
})();
