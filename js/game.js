/**
 * game.js
 * ゲームの状態とルールだけを扱う（DOM操作はしない）。
 * UIからは Game.xxx() を呼び出し、戻り値やイベント経由で結果を受け取る。
 */
window.Game = (function () {
  "use strict";

  var balance = null;
  var plants = null;
  var state = null;

  /** 空いている中で最も番号の若いスロットIDを返す（slot01→slot02→…の順） */
  function findFreeSlotId() {
    var order = Object.keys(window.CONFIG.SLOT_POSITIONS);
    for (var i = 0; i < order.length; i++) {
      if (!state.plants[order[i]]) return order[i];
    }
    return null;
  }

  function makePlantEntry(plantId) {
    return { plantId: plantId, genki: balance.genki.initial, harvestedToday: false };
  }

  /** 新規ゲームの状態を作る（最初から持っている「starter」植物のみ配置） */
  function createNewState() {
    var plantEntries = {};
    var slotOrder = Object.keys(window.CONFIG.SLOT_POSITIONS);
    var slotIndex = 0;
    Object.keys(plants).forEach(function (plantId) {
      if (!plants[plantId].starter) return;
      plantEntries[slotOrder[slotIndex]] = makePlantEntry(plantId);
      slotIndex += 1;
    });

    return {
      version: 1,
      day: 1,
      jishin: balance.jishin.initial,
      firstHarvestDone: false,
      careUsedToday: false,
      lastCareType: null,
      pendingPlantSelection: false,
      plants: plantEntries
    };
  }

  /** 起動時のデータ読み込み（JSON）。失敗しても最低限のフォールバックで進める。 */
  function loadData() {
    var paths = window.CONFIG.DATA_PATHS;
    return Promise.all([
      fetch(paths.balance).then(function (r) { return r.json(); }),
      fetch(paths.plants).then(function (r) { return r.json(); }),
      fetch(paths.events).then(function (r) { return r.json(); })
    ]).then(function (results) {
      balance = results[0];
      plants = results[1];
      window.Events.setData(results[2]);
    });
  }

  function init(forceNew) {
    return loadData().then(function () {
      var loaded = forceNew ? null : window.Save.load();
      if (loaded) {
        state = loaded;
      } else {
        window.Save.clear();
        state = createNewState();
        window.Save.store(state);
      }
      return state;
    });
  }

  function clampJishin(value) {
    return Math.max(0, Math.min(balance.jishin.max, value));
  }

  function clampGenki(value) {
    return Math.max(balance.genki.min, Math.min(balance.genki.max, value));
  }

  function addJishin(amount) {
    state.jishin = clampJishin(state.jishin + amount);
  }

  /**
   * じしんを加算し、称号のしきい値をまたいだ場合はお祝いのセリフを添えて返す。
   */
  function addJishinAndGetLevelUp(amount) {
    var before = getJishinLevel();
    addJishin(amount);
    var after = getJishinLevel();
    var leveledUp = after.threshold !== before.threshold;
    return {
      leveledUp: leveledUp,
      lines: leveledUp ? window.Events.getLevelUp(after.threshold) : [],
      newLevelTitle: after.title
    };
  }

  /** まだ迎えていない植物species一覧のIDを返す */
  function getUnownedPlantIds() {
    var ownedIds = Object.keys(state.plants).map(function (slotId) {
      return state.plants[slotId].plantId;
    });
    return Object.keys(plants).filter(function (plantId) {
      return ownedIds.indexOf(plantId) === -1;
    });
  }

  /**
   * じしんが鉢追加のしきい値を超えたかを確認し、超えていれば選択待ち状態にする。
   * 保有している鉢の数だけ、しきい値を順番に消化していく（1つ目のしきい値→2鉢目、…）。
   */
  function checkPotUnlockAndGetLines() {
    var thresholds = balance.potUnlockThresholds || [];
    if (state.pendingPlantSelection) return [];

    var ownedCount = Object.keys(state.plants).length;
    var nextThresholdIndex = ownedCount - 1;
    if (nextThresholdIndex < 0 || nextThresholdIndex >= thresholds.length) return [];
    if (state.jishin < thresholds[nextThresholdIndex]) return [];
    if (getUnownedPlantIds().length === 0) return [];

    state.pendingPlantSelection = true;
    return window.Events.getPotUnlockAnnounce();
  }

  function isPendingPlantSelection() {
    return !!(state && state.pendingPlantSelection);
  }

  function getSelectionCandidates() {
    return getUnownedPlantIds().map(function (plantId) {
      return plants[plantId];
    });
  }

  /**
   * 選んだ植物を、空いている中で最も若いスロットへ迎え入れる。
   * 戻り値: { ok, lines, plantId }
   */
  function choosePlant(plantId) {
    if (!state.pendingPlantSelection || !plants[plantId]) {
      return { ok: false, lines: [] };
    }
    if (getUnownedPlantIds().indexOf(plantId) === -1) {
      return { ok: false, lines: [] };
    }

    var freeSlot = findFreeSlotId();
    if (!freeSlot) return { ok: false, lines: [] };

    state.plants[freeSlot] = makePlantEntry(plantId);
    state.pendingPlantSelection = false;

    var plantName = plants[plantId].name;
    var lines = window.Events.getNewPotWelcome().map(function (line) {
      return { speaker: line.speaker, text: line.text.replace("{name}", plantName) };
    });

    window.Save.store(state);
    return { ok: true, lines: lines, plantId: plantId };
  }

  function getPlantId(slotId) {
    return state.plants[slotId] ? state.plants[slotId].plantId : null;
  }

  function getGenkiView(slotId) {
    var slot = state.plants[slotId];
    if (!slot) return null;
    var states = balance.genki.states;
    for (var i = 0; i < states.length; i++) {
      if (slot.genki >= states[i].min) return states[i];
    }
    return states[states.length - 1];
  }

  function getJishinLevel() {
    var levels = balance.jishin.levels;
    var current = levels[0];
    for (var i = 0; i < levels.length; i++) {
      if (state.jishin >= levels[i].threshold) current = levels[i];
    }
    return current;
  }

  /**
   * その日にまだ収穫していない鉢をまとめて収穫する（内部処理）。
   * 収穫はプレイヤーの操作を必要とせず、日が始まるたびに自動で行われる。
   * save・鉢追加判定は呼び出し側でまとめて行うため、ここでは行わない。
   */
  function performAutoHarvest() {
    var beforeLevel = getJishinLevel();
    var totalGained = 0;
    var lines = [];
    var harvestedAny = false;

    Object.keys(state.plants).forEach(function (slotId) {
      var slot = state.plants[slotId];
      if (slot.harvestedToday) return;
      harvestedAny = true;

      var isFirst = !state.firstHarvestDone;
      slot.harvestedToday = true;
      var gained = isFirst ? balance.jishin.gainHarvestFirst : balance.jishin.gainHarvest;
      addJishin(gained);
      totalGained += gained;

      if (isFirst) {
        state.firstHarvestDone = true;
        lines = lines.concat(window.Events.getFirstHarvest());
      } else {
        lines = lines.concat(window.Events.getHarvest());
      }
    });

    var afterLevel = getJishinLevel();
    var leveledUp = afterLevel.threshold !== beforeLevel.threshold;
    if (leveledUp) lines = lines.concat(window.Events.getLevelUp(afterLevel.threshold));

    return { harvestedAny: harvestedAny, lines: lines, gained: totalGained, leveledUp: leveledUp };
  }

  /**
   * DAY1の開始時など、日またぎ以外のタイミングで収穫を確定させたい場合に呼ぶ。
   * 戻り値: { lines, gained, leveledUp, harvestedAny }
   */
  function autoHarvestNow() {
    var result = performAutoHarvest();
    var lines = result.lines.concat(checkPotUnlockAndGetLines());
    window.Save.store(state);
    return { lines: lines, gained: result.gained, leveledUp: result.leveledUp, harvestedAny: result.harvestedAny };
  }

  /**
   * お世話をする（水・肥料）。1日1回。
   * 戻り値: { ok, lines, jishinGained }
   */
  function care(type) {
    if (state.careUsedToday) {
      return { ok: false, lines: window.Events.getCareBlocked() };
    }

    var genkiGainMap = {
      water: balance.genki.waterGain,
      fertilizer: balance.genki.fertilizerGain
    };
    var jishinGainMap = {
      water: balance.jishin.gainWater,
      fertilizer: balance.jishin.gainFertilizer
    };

    if (!(type in genkiGainMap)) return { ok: false, lines: [] };

    Object.keys(state.plants).forEach(function (slotId) {
      var slot = state.plants[slotId];
      slot.genki = clampGenki(slot.genki + genkiGainMap[type]);
    });

    var gained = jishinGainMap[type];
    var levelInfo = addJishinAndGetLevelUp(gained);
    state.careUsedToday = true;
    state.lastCareType = type;

    var lines = window.Events.getCare(type);
    if (levelInfo.leveledUp) lines = lines.concat(levelInfo.lines);
    lines = lines.concat(checkPotUnlockAndGetLines());

    window.Save.store(state);
    return { ok: true, lines: lines, jishinGained: gained, leveledUp: levelInfo.leveledUp };
  }

  /**
   * 翌日へ進める。
   * 戻り値: { day, lines }
   */
  function nextDay() {
    // お世話しなかった株は少し元気が下がる（枯れることはない）
    if (!state.careUsedToday) {
      Object.keys(state.plants).forEach(function (slotId) {
        var slot = state.plants[slotId];
        slot.genki = clampGenki(slot.genki - balance.genki.decayPerDay);
      });
    }

    Object.keys(state.plants).forEach(function (slotId) {
      state.plants[slotId].harvestedToday = false;
    });

    state.day += 1;
    state.careUsedToday = false;
    state.lastCareType = null;

    // 節目の日 > 個別に用意した日 > それ以外はランダムな汎用会話、の優先順で選ぶ。
    // こうすることで、あらかじめ用意した日数を超えても会話が尽きない。
    var milestoneLines = window.Events.getMilestone(state.day);
    var explicitLines = window.Events.getDayStart(state.day);
    var lines;
    if (milestoneLines.length > 0) {
      lines = milestoneLines;
    } else if (explicitLines.length > 0) {
      lines = explicitLines;
    } else {
      lines = window.Events.getDayStartPool();
    }

    // 収穫はプレイヤーの操作なしで、日が始まるタイミングで自動的に行われる。
    var harvestResult = performAutoHarvest();
    lines = lines.concat(harvestResult.lines);

    // 元気が少ない株があれば、罰ではなく優しい一声を添える。
    var hasLowGenki = Object.keys(state.plants).some(function (slotId) {
      var view = getGenkiView(slotId);
      return view && view.min === 0;
    });
    if (hasLowGenki) {
      lines = lines.concat(window.Events.getLowGenkiHint());
    }

    lines = lines.concat(checkPotUnlockAndGetLines());

    window.Save.store(state);
    return { day: state.day, lines: lines, leveledUp: harvestResult.leveledUp };
  }

  function resetGame() {
    window.Save.clear();
    state = createNewState();
    window.Save.store(state);
    return state;
  }

  function getState() {
    return state;
  }

  function getBalance() {
    return balance;
  }

  function getPlantData(plantId) {
    return plants[plantId];
  }

  function getAllSlotIds() {
    return Object.keys(state.plants);
  }

  function isFirstHarvestPending() {
    return !state.firstHarvestDone;
  }

  return {
    init: init,
    resetGame: resetGame,
    autoHarvestNow: autoHarvestNow,
    care: care,
    nextDay: nextDay,
    getState: getState,
    getBalance: getBalance,
    getPlantData: getPlantData,
    getPlantId: getPlantId,
    getGenkiView: getGenkiView,
    getJishinLevel: getJishinLevel,
    getAllSlotIds: getAllSlotIds,
    isFirstHarvestPending: isFirstHarvestPending,
    isPendingPlantSelection: isPendingPlantSelection,
    getSelectionCandidates: getSelectionCandidates,
    choosePlant: choosePlant
  };
})();
