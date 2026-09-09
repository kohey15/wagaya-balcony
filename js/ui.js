/**
 * ui.js
 * DOM の描画とイベント処理だけを担当する。ゲームルールは Game 側に委譲する。
 */
window.UI = (function () {
  "use strict";

  var el = {}; // DOM参照キャッシュ
  var dialogueQueue = [];
  var dialogueTimer = null; // 会話の自動送りタイマー
  var speakerLabel = { father: "父", mother: "母", daughter: "娘" };

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
    el.charMother = document.getElementById("charMother");
    el.charDaughter = document.getElementById("charDaughter");
    el.plantLayer = document.getElementById("plantLayer");
    el.dialogueBox = document.getElementById("dialogueBox");
    el.dialogueSpeaker = document.getElementById("dialogueSpeaker");
    el.dialogueText = document.getElementById("dialogueText");
    el.dialogueNext = document.getElementById("dialogueNext");
    el.waterBtn = document.getElementById("waterBtn");
    el.fertilizerBtn = document.getElementById("fertilizerBtn");
    el.nextDayBtn = document.getElementById("nextDayBtn");
    el.plantSelectOverlay = document.getElementById("plantSelectOverlay");
    el.plantSelectList = document.getElementById("plantSelectList");
  }

  function renderStaticLayers() {
    el.bgLayer.style.backgroundImage = "url('" + window.CONFIG.BACKGROUND_ASSET + "')";
    var ch = window.CONFIG.CHARACTER_ASSETS;
    el.charFather.innerHTML = spriteHtml(ch.father.image, "父", ch.father.emojiFallback, "char-sprite");
    el.charMother.innerHTML = spriteHtml(ch.mother.image, "母", ch.mother.emojiFallback, "char-sprite");
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
      var slotEl = document.getElementById("slot_" + slotId);
      if (!badge) return;
      var view = window.Game.getGenkiView(slotId);
      badge.textContent = view ? view.emoji : "";
      badge.title = view ? view.label : "";
      // 元気が少ない状態は、枯れさせる代わりに見た目をわずかに控えめにするだけに留める
      if (slotEl) {
        slotEl.classList.toggle("genki-low", !!view && view.min === 0);
      }
    });
  }

  /** じしんのレベルアップ演出（バーと称号を一瞬光らせる） */
  function playLevelUpEffect() {
    [el.jishinFill, el.jishinTitle].forEach(function (node) {
      node.classList.remove("levelup-pulse");
      // 再アニメーションのため一度クラスを外してから戻す
      void node.offsetWidth;
      node.classList.add("levelup-pulse");
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
    var careDisabled = state.careUsedToday;
    [el.waterBtn, el.fertilizerBtn].forEach(function (btn) {
      btn.disabled = careDisabled;
    });

    if (careDisabled) {
      var doneLabel = { water: "💧 水やり済み", fertilizer: "🌱 肥料やり済み" };
      [
        [el.waterBtn, "water"],
        [el.fertilizerBtn, "fertilizer"]
      ].forEach(function (pair) {
        if (state.lastCareType === pair[1]) pair[0].textContent = doneLabel[pair[1]];
      });
    } else {
      el.waterBtn.textContent = "💧 水をあげる";
      el.fertilizerBtn.textContent = "🌱 肥料をあげる";
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

  function clearDialogueTimer() {
    if (dialogueTimer) {
      clearTimeout(dialogueTimer);
      dialogueTimer = null;
    }
  }

  /** セリフの長さに応じて、次のセリフへ自動で進むまでの時間を決める */
  function scheduleAutoAdvance(text) {
    var delay = Math.min(4500, Math.max(1200, 1000 + (text || "").length * 120));
    dialogueTimer = setTimeout(showNextLine, delay);
  }

  function showNextLine() {
    clearDialogueTimer();
    if (dialogueQueue.length === 0) {
      if (window.Game.isPendingPlantSelection()) {
        renderPlantSelectionOverlay();
        return;
      }
      showIdleLine();
      return;
    }
    var line = dialogueQueue.shift();
    renderLine(line);
    el.dialogueBox.classList.remove("idle");
    el.dialogueNext.classList.toggle("hidden", dialogueQueue.length === 0);
    scheduleAutoAdvance(line.text);
  }

  // ---- 鉢選択シーン ----

  function renderPlantSelectionOverlay() {
    var candidates = window.Game.getSelectionCandidates();
    el.plantSelectList.innerHTML = candidates
      .map(function (p) {
        return (
          '<button type="button" class="plant-select-card" data-plant-id="' + p.id + '">' +
          spriteHtml(p.image, p.name, p.emojiFallback, "plant-select-thumb") +
          '<span class="plant-select-info">' +
          '<span class="plant-select-name">' + p.name + "</span>" +
          '<span class="plant-select-desc">' + p.description + "</span>" +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    Array.prototype.forEach.call(el.plantSelectList.querySelectorAll(".plant-select-card"), function (btn) {
      btn.addEventListener("click", function () {
        handleChoosePlant(btn.getAttribute("data-plant-id"));
      });
    });

    el.plantSelectOverlay.classList.remove("hidden");
  }

  function handleChoosePlant(plantId) {
    var result = window.Game.choosePlant(plantId);
    el.plantSelectOverlay.classList.add("hidden");
    if (!result.ok) return;
    renderPlantSlots();
    refreshAll();
    showQueue(result.lines);
  }

  // ---- アクション ----

  function handleCare(type) {
    var careResult = window.Game.care(type);
    if (!careResult.ok) {
      // 1日1回の上限に達している場合など：お世話せず、その日の会話だけ表示する
      showQueue(careResult.lines);
      refreshAll();
      return;
    }

    // お世話を選んだら、収穫〜翌日への移行までまとめて自動的に進める
    var dayResult = window.Game.nextDay();
    refreshAll();
    showQueue(careResult.lines.concat(dayResult.lines));
    if (careResult.leveledUp || dayResult.leveledUp) playLevelUpEffect();
  }

  function handleNextDay() {
    var result = window.Game.nextDay();
    refreshAll();
    if (result.lines && result.lines.length > 0) {
      showQueue(result.lines);
    } else {
      showIdleLine();
    }
    if (result.leveledUp) playLevelUpEffect();
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
    if (window.Game.isPendingPlantSelection()) {
      renderPlantSelectionOverlay();
      return;
    }
    var state = window.Game.getState();
    if (state.day === 1 && window.Game.isFirstHarvestPending()) {
      // DAY1は「とっていい？」のやり取りのあと、収穫が自動で行われる。
      var introLines = window.Events.getIntroDay1();
      var harvestResult = window.Game.autoHarvestNow();
      refreshAll();
      showQueue(introLines.concat(harvestResult.lines));
      if (harvestResult.leveledUp) playLevelUpEffect();
    } else {
      showIdleLine();
    }
  }

  function wireEvents() {
    el.waterBtn.addEventListener("click", function () { handleCare("water"); });
    el.fertilizerBtn.addEventListener("click", function () { handleCare("fertilizer"); });
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
