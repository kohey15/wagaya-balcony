/**
 * events.js
 * 会話データ（data/events.json）から、状況に応じたセリフ配列を選び出す。
 */
window.Events = (function () {
  "use strict";

  var data = null;

  function setData(json) {
    data = json;
  }

  function pickRandom(list) {
    if (!list || list.length === 0) return [];
    return list[Math.floor(Math.random() * list.length)];
  }

  function getIntroDay1() {
    return (data && data.introDay1) || [];
  }

  function getFirstHarvest() {
    return (data && data.firstHarvest) || [];
  }

  function getHarvest() {
    return pickRandom(data && data.harvest);
  }

  function getHarvestBlocked() {
    return (data && data.harvestBlocked) || [];
  }

  function getCare(type) {
    var list = data && data.care && data.care[type];
    return pickRandom(list);
  }

  function getCareBlocked() {
    return (data && data.careBlocked) || [];
  }

  function getDayStart(day) {
    var list = data && data.dayStart && data.dayStart[String(day)];
    return list || [];
  }

  function getDayStartPool() {
    return pickRandom(data && data.dayStartPool);
  }

  function getMilestone(day) {
    var list = data && data.milestone && data.milestone[String(day)];
    return list || [];
  }

  function getLevelUp(threshold) {
    var list = data && data.levelUp && data.levelUp[String(threshold)];
    return list || [];
  }

  function getLowGenkiHint() {
    return pickRandom(data && data.lowGenkiHint);
  }

  function getPotUnlockAnnounce() {
    return (data && data.potUnlockAnnounce) || [];
  }

  function getNewPotWelcome() {
    return (data && data.newPotWelcome) || [];
  }

  function getIdle() {
    return (data && data.idle) || [];
  }

  return {
    setData: setData,
    getIntroDay1: getIntroDay1,
    getFirstHarvest: getFirstHarvest,
    getHarvest: getHarvest,
    getHarvestBlocked: getHarvestBlocked,
    getCare: getCare,
    getCareBlocked: getCareBlocked,
    getDayStart: getDayStart,
    getDayStartPool: getDayStartPool,
    getMilestone: getMilestone,
    getLevelUp: getLevelUp,
    getLowGenkiHint: getLowGenkiHint,
    getPotUnlockAnnounce: getPotUnlockAnnounce,
    getNewPotWelcome: getNewPotWelcome,
    getIdle: getIdle
  };
})();
