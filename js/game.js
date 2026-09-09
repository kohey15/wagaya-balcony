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

  /** 新規ゲームの状態を作る */
  function createNewState() {
    var plantEntries = {};
    Object.keys(plants).forEach(function (plantId) {
      var p = plants[plantId];
      plantEntries[p.slotId] = {
        plantId: plantId,
        genki: balance.genki.initial,
        harvestedToday: false
      };
    });

    return {
      version: 1,
      day: 1,
      jishin: balance.jishin.initial,
      firstHarvestDone: false,
      careUsedToday: false,
      lastCareType: null,
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
   * 収穫する。行動回数は消費しないが、1日1回まで（見た目上の株の回復待ち）。
   * 戻り値: { ok, lines, jishinGained }
   */
  function harvest(slotId) {
    var slot = state.plants[slotId];
    if (!slot) return { ok: false, lines: [] };

    if (slot.harvestedToday) {
      return { ok: false, lines: window.Events.getHarvestBlocked() };
    }

    slot.harvestedToday = true;
    var isFirst = !state.firstHarvestDone;
    var gained = isFirst ? balance.jishin.gainHarvestFirst : balance.jishin.gainHarvest;
    addJishin(gained);

    var lines;
    if (isFirst) {
      state.firstHarvestDone = true;
      lines = window.Events.getFirstHarvest();
    } else {
      lines = window.Events.getHarvest();
    }

    window.Save.store(state);
    return { ok: true, lines: lines, jishinGained: gained };
  }

  /**
   * お世話をする（水・肥料・見守る）。1日1回。
   * 戻り値: { ok, lines, jishinGained }
   */
  function care(type) {
    if (state.careUsedToday) {
      return { ok: false, lines: window.Events.getCareBlocked() };
    }

    var genkiGainMap = {
      water: balance.genki.waterGain,
      fertilizer: balance.genki.fertilizerGain,
      watch: balance.genki.watchGain
    };
    var jishinGainMap = {
      water: balance.jishin.gainWater,
      fertilizer: balance.jishin.gainFertilizer,
      watch: balance.jishin.gainWatch
    };

    if (!(type in genkiGainMap)) return { ok: false, lines: [] };

    Object.keys(state.plants).forEach(function (slotId) {
      var slot = state.plants[slotId];
      slot.genki = clampGenki(slot.genki + genkiGainMap[type]);
    });

    var gained = jishinGainMap[type];
    addJishin(gained);
    state.careUsedToday = true;
    state.lastCareType = type;

    var lines = window.Events.getCare(type);
    window.Save.store(state);
    return { ok: true, lines: lines, jishinGained: gained };
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

    var lines = window.Events.getDayStart(state.day);
    if (state.day === balance.mvpDays + 1) {
      lines = window.Events.getMilestone(state.day).concat(lines);
    }

    window.Save.store(state);
    return { day: state.day, lines: lines };
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
    harvest: harvest,
    care: care,
    nextDay: nextDay,
    getState: getState,
    getBalance: getBalance,
    getPlantData: getPlantData,
    getPlantId: getPlantId,
    getGenkiView: getGenkiView,
    getJishinLevel: getJishinLevel,
    getAllSlotIds: getAllSlotIds,
    isFirstHarvestPending: isFirstHarvestPending
  };
})();
