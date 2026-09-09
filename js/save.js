/**
 * save.js
 * localStorage への読み書きだけを担当する。壊れたデータでもゲーム全体を止めない。
 */
window.Save = (function () {
  "use strict";

  var KEY = window.CONFIG.SAVE_KEY;

  /** 保存データの最低限の形をチェックする */
  function isValidState(state) {
    return (
      state &&
      typeof state === "object" &&
      typeof state.day === "number" &&
      typeof state.jishin === "number" &&
      state.plants &&
      typeof state.plants === "object"
    );
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!isValidState(parsed)) {
        console.warn("[Save] 保存データの形式が不正なため無視します。");
        return null;
      }
      return parsed;
    } catch (err) {
      console.warn("[Save] 保存データの読み込みに失敗しました。", err);
      return null;
    }
  }

  function store(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.warn("[Save] 保存に失敗しました。", err);
      return false;
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch (err) {
      console.warn("[Save] 削除に失敗しました。", err);
    }
  }

  function exists() {
    try {
      return isValidState(load());
    } catch (err) {
      return false;
    }
  }

  return { load: load, store: store, clear: clear, exists: exists };
})();
