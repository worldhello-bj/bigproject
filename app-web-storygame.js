const storyConfig = window.CityQuestStoryConfig;
if (!storyConfig) {
  throw new Error("Story config module not loaded: app-web-storyconfig.js");
}

const {
  SCRIPTS,
  LANDMARKS,
  FEED,
  STORAGE_KEYS,
  COOKIE_KEYS,
  DEFAULT_ASSETS: DEFAULT_ASSETS_BASE,
  ASSET_SOURCES,
  RESULT_BG_CANDIDATES,
  ENDING_BG_CANDIDATES,
  STARTUP_HERO_IMAGE,
  STARTUP_BG_BY_TAB,
  LANDMARK_CHAT_BG,
  CHECKIN_BG_BY_LANDMARK,
  CHECKIN_BG_FALLBACK,
  HOME_MAP_CONFIG,
  NPC_ASSETS,
  SCENE_TEMPLATES,
  MAINLINE_BEATS,
  ROLE_ALIAS_BY_LANDMARK,
  ROLE_BIO_BY_LANDMARK,
  STATION_CHOICE_RESULTS,
  CHOICE_STYLE_BY_STATION,
  STYLE_FEEDBACK,
  ENDING_LIBRARY,
  ROUTE_BRANCH_GRAPH
} = storyConfig;

let DEFAULT_ASSETS = { ...DEFAULT_ASSETS_BASE };
const CHAT_SNAPSHOT_KEY = "cityquest_web_chat_snapshot";
const GENERATED_STYLE_LABELS = {
  order: "循制",
  insight: "辨伪",
  resolve: "决断"
};
const MOBILE_UA_PATTERN = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
const state = {
  activeTab: "home",
  selectedScriptId: SCRIPTS[0].id,
  session: {
    nextLandmarkId: "zhonggulou",
    routePlan: [],
    generatedScript: null,
    pendingScriptPlan: null,
    landmarkId: "",
    scriptIntroSeen: false,
    history: [],
    story: null,
    checkInPassed: false,
    composedImage: "",
    completed: [],
    introducedRoleKeys: [],
    choiceStats: { order: 0, insight: 0, resolve: 0 },
    finalEnding: null
  },
  designAssets: { ...DEFAULT_ASSETS },
  mediaStream: null
};

const el = {
  pages: { home: document.getElementById("page-home"), community: document.getElementById("page-community"), scripts: document.getElementById("page-scripts"), profile: document.getElementById("page-profile") },
  tabs: Array.from(document.querySelectorAll(".tab")),
  homeScriptText: document.getElementById("home-script-text"),
  btnAbortHomeScript: document.getElementById("btn-abort-home-script"),
  homeMap: document.getElementById("home-map"),
  startupHeroImage: document.getElementById("startup-hero-image"),
  scriptGenInput: document.getElementById("script-gen-input"),
  builderScriptList: document.getElementById("builder-script-list"),
  scriptPlanTitle: document.getElementById("script-plan-title"),
  scriptPlanSummary: document.getElementById("script-plan-summary"),
  scriptPlanOpening: document.getElementById("script-plan-opening"),
  scriptPlanRoute: document.getElementById("script-plan-route"),
  scriptIntroName: document.getElementById("script-intro-name"),
  scriptIntroSubtitle: document.getElementById("script-intro-subtitle"),
  scriptIntroRoleBio: document.getElementById("script-intro-role-bio"),
  scriptIntroSummary: document.getElementById("script-intro-summary"),
  scriptIntroOpening: document.getElementById("script-intro-opening"),
  scriptIntroRoleName: document.getElementById("script-intro-role-name"),
  scriptIntroPortrait: document.getElementById("script-intro-portrait"),
  scriptIntroPoints: document.getElementById("script-intro-points"),
  chatSceneBg: document.getElementById("chat-scene-bg"),
  landmarkChips: document.getElementById("landmark-chips"), landmarkList: document.getElementById("landmark-list"), communityFeed: document.getElementById("community-feed"),
  scriptList: document.getElementById("script-list"), profileScriptText: document.getElementById("profile-script-text"), chatTitle: document.getElementById("chat-title"),
  chatCharacterAvatar: document.getElementById("chat-character-avatar"), chatCharacterName: document.getElementById("chat-character-name"), chatCharacterRole: document.getElementById("chat-character-role"), chatDialogueText: document.getElementById("chat-dialogue-text"),
  chatScriptLine: document.getElementById("chat-script-line"), storyProgress: document.getElementById("story-progress"), routeImpact: document.getElementById("route-impact"),
  storyGrid: document.getElementById("story-grid"), chatMessages: document.getElementById("chat-messages"), chatChoices: document.getElementById("chat-choices"),
  btnGoCamera: document.getElementById("btn-go-camera"),
  cameraModal: document.querySelector("#overlay-camera .camera-modal"),
  cameraWrap: document.getElementById("camera-wrap"),
  cameraVideo: document.getElementById("camera-video"), cameraFrame: document.getElementById("camera-frame"), cameraTip: document.getElementById("camera-tip"),
  inputPhotoFile: document.getElementById("input-photo-file"), composeCanvas: document.getElementById("compose-canvas"), resultImage: document.getElementById("result-image"),
  resultCoupon: document.getElementById("result-coupon"), resultBg: document.getElementById("result-bg"), adminAssets: document.getElementById("admin-assets"),
  endingBg: document.getElementById("ending-bg"), endingTitle: document.getElementById("ending-title"),
  endingSummary: document.getElementById("ending-summary"), endingEpilogue: document.getElementById("ending-epilogue"),
  endingStats: document.getElementById("ending-stats"),
  promptDialog: document.getElementById("overlay-dialog"),
  promptCard: document.getElementById("prompt-card"),
  promptTitle: document.getElementById("prompt-title"),
  promptMessage: document.getElementById("prompt-message"),
  promptActions: document.getElementById("prompt-actions"),
  promptCancel: document.getElementById("btn-prompt-cancel"),
  promptOk: document.getElementById("btn-prompt-ok")
};

const promptDialogState = {
  onConfirm: null,
  onCancel: null
};

const getScriptById = (id) => SCRIPTS.find((s) => s.id === id) || SCRIPTS[0];
const getLandmarkById = (id) => LANDMARKS.find((l) => l.id === id) || LANDMARKS[0];
const getLandmarkIndex = (id) => LANDMARKS.findIndex((l) => l.id === id);
const hasGeneratedRoutePlan = () => Array.isArray(state.session.routePlan) && state.session.routePlan.length > 0;
const hasActiveStorySession = () => Boolean(
  state.session.landmarkId
  || state.session.story
  || state.session.history?.length
  || state.session.completed?.length
  || state.session.generatedScript
  || state.session.scriptIntroSeen
  || state.session.finalEnding
);
const hasFinishedStorySession = () => Boolean(state.session.finalEnding);
const getExpectedLandmarkId = () => {
  if (hasGeneratedRoutePlan()) {
    return state.session.routePlan[state.session.completed.length] || "";
  }
  return state.session.nextLandmarkId || "";
};
const getNpcByKey = (key) => NPC_ASSETS[key] || NPC_ASSETS.official;
const getNpcByLandmark = (landmark) => getNpcByKey(landmark?.npcKey);
const getChatBgByLandmark = (landmark) => LANDMARK_CHAT_BG[landmark?.id] || "./素材/每个地区的背景图/故宫.png";
const getCameraBackdropByLandmark = (landmark) => getChatBgByLandmark(landmark);
const getCheckinBgByLandmark = (landmark) => CHECKIN_BG_BY_LANDMARK[landmark?.id] || CHECKIN_BG_FALLBACK;
const getCheckinBgForSession = () => {
  const landmark = state.session.landmarkId ? getLandmarkById(state.session.landmarkId) : null;
  return getCheckinBgByLandmark(landmark) || state.designAssets.personaFrame || DEFAULT_ASSETS.personaFrame;
};
const getEndingBgForSession = () => state.designAssets.endingBgImage
  || state.designAssets.resultBgImage
  || "./素材/总结底图.png"
  || STARTUP_HERO_IMAGE;
const resolveNextLandmarkId = (landmarkId, choiceId) => {
  const branch = ROUTE_BRANCH_GRAPH[landmarkId] || {};
  const keyed = choiceId ? branch[choiceId] : null;
  if (keyed !== undefined) return keyed;
  if (branch.c1 !== undefined) return branch.c1;
  return null;
};
const getActiveScript = () => state.session.generatedScript || getScriptById(state.selectedScriptId);
const buildGeneratedScriptFromPrompt = (promptText) => {
  const generator = window.CityQuestStoryGen;
  if (!generator || typeof generator.buildGeneratedScriptFromPrompt !== "function") {
    throw new Error("Story generator module not loaded: app-web-storygen.js");
  }
  return generator.buildGeneratedScriptFromPrompt(promptText, {
    landmarks: LANDMARKS,
    sceneTemplates: SCENE_TEMPLATES,
    getLandmarkById
  });
};
const renderGeneratedScriptPlan = (script) => {
  if (!script) return;
  if (el.scriptPlanTitle) el.scriptPlanTitle.textContent = script.name;
  if (el.scriptPlanSummary) el.scriptPlanSummary.textContent = script.summary;
  if (el.scriptPlanOpening) el.scriptPlanOpening.textContent = script.opening;
  if (el.scriptPlanRoute) {
    el.scriptPlanRoute.innerHTML = "";
    script.routePlan.forEach((id, idx) => {
      const landmark = getLandmarkById(id);
      const routeNote = script.routeNotes?.[id] || "";
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `<div class="item-title">第 ${idx + 1} 站：${landmark.name}</div><div class="item-sub">${landmark.persona}${routeNote ? `｜${routeNote}` : ""}</div>`;
      el.scriptPlanRoute.appendChild(row);
    });
  }
};
const ensureChoiceStats = () => {
  if (!state.session.choiceStats) state.session.choiceStats = { order: 0, insight: 0, resolve: 0 };
  ["order", "insight", "resolve"].forEach((k) => {
    if (typeof state.session.choiceStats[k] !== "number") state.session.choiceStats[k] = 0;
  });
  return state.session.choiceStats;
};
const resolveFinalEnding = () => {
  const stats = ensureChoiceStats();
  const entries = Object.entries(stats);
  const top = Math.max(...entries.map(([, v]) => Number(v || 0)));
  const leaders = entries.filter(([, v]) => Number(v || 0) === top).map(([k]) => k);
  const endingId = leaders.length === 1 ? leaders[0] : "balanced";
  const ending = ENDING_LIBRARY[endingId] || ENDING_LIBRARY.balanced;
  return { id: endingId, ...ending, stats: { ...stats } };
};
const buildRoleIntroLine = (landmark, story) => {
  const npc = getNpcByLandmark(landmark);
  const objective = story?.objective || "完成本站文脉任务";
  const roleAlias = ROLE_ALIAS_BY_LANDMARK[landmark.id] || landmark.persona;
  const roleBio = ROLE_BIO_BY_LANDMARK[landmark.id] || "";
  return roleBio
    ? `初识角色｜${roleAlias}（${landmark.persona} / ${npc.name}）：${roleBio} 今夜将引导你完成「${objective}」。`
    : `初识角色｜${roleAlias}（${landmark.persona} / ${npc.name}）：驻守${landmark.name}，将引导你完成「${objective}」。`;
};
const renderScriptIntroOverlay = (script, landmark, story) => {
  const npc = getNpcByLandmark(landmark);
  const roleAlias = ROLE_ALIAS_BY_LANDMARK[landmark.id] || landmark.persona;
  const roleBio = ROLE_BIO_BY_LANDMARK[landmark.id] || "";
  const firstNode = story?.nodes?.n1;
  const choices = Array.isArray(firstNode?.choices) ? firstNode.choices : [];

  if (el.scriptIntroRoleName) {
    el.scriptIntroRoleName.textContent = `${roleAlias} · ${landmark.persona}`;
  }
  if (el.scriptIntroPortrait) {
    el.scriptIntroPortrait.src = npc.image;
    el.scriptIntroPortrait.alt = roleAlias;
  }
  if (el.scriptIntroName) el.scriptIntroName.textContent = script.name || "中轴遗章";
  if (el.scriptIntroSubtitle) el.scriptIntroSubtitle.textContent = `当前站点：${landmark.name}｜${script.subtitle || "追缉分卷"}`;
  if (el.scriptIntroRoleBio) {
    el.scriptIntroRoleBio.textContent = roleBio ? `人物小传：${roleBio}` : "";
  }
  if (el.scriptIntroSummary) {
    el.scriptIntroSummary.textContent = script.summary || "中轴危局将启，请沿线追缉并封阙。";
  }
  if (el.scriptIntroPoints) {
    el.scriptIntroPoints.innerHTML = "";
    const points = [];
    points.push(`本站任务：${story?.objective || "完成本阙校验"}`);
    if (hasGeneratedRoutePlan()) {
      const generatedTpl = state.session.generatedScript?.sceneTemplates?.[landmark.id];
      const nextGeneratedId = state.session.routePlan[(state.session.completed?.length || 0) + 1] || "";
      const nextGeneratedName = nextGeneratedId ? getLandmarkById(nextGeneratedId).name : "终章封卷";
      if (generatedTpl?.routeNote) points.push(`本段卷意：${generatedTpl.routeNote}`);
      choices.forEach((choice) => {
        const style = generatedTpl?.choiceStyles?.[choice.id] || "";
        const styleLabel = GENERATED_STYLE_LABELS[style] || "本站调查";
        points.push(`${choice.text}：强化${styleLabel}取向，不改变 AI 路线。`);
      });
      points.push(`下一站：${nextGeneratedName}`);
    } else {
      choices.forEach((choice) => {
        const targetId = resolveNextLandmarkId(landmark.id, choice.id);
        const targetName = targetId ? getLandmarkById(targetId).name : "终章封阙";
        points.push(`${choice.text}：导引至 ${targetName}`);
      });
    }
    points.push("完成本站后可进行拍照打卡，并继续追缉。");

    points.slice(0, 4).forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      el.scriptIntroPoints.appendChild(li);
    });
  }
  if (el.scriptIntroOpening) {
    const lead = script.opening || "追缉将启，慎择其路。";
    el.scriptIntroOpening.textContent = `启程告示：${lead}`;
  }
};
const resetSessionForGeneratedScript = (generated) => {
  state.session.nextLandmarkId = generated.routePlan?.[0] || "";
  state.session.routePlan = Array.isArray(generated.routePlan) ? [...generated.routePlan] : [];
  state.session.generatedScript = generated;
  state.session.pendingScriptPlan = null;
  state.session.landmarkId = "";
  state.session.scriptIntroSeen = false;
  state.session.history = [];
  state.session.story = null;
  state.session.checkInPassed = false;
  state.session.composedImage = "";
  state.session.completed = [];
  state.session.introducedRoleKeys = [];
  state.session.choiceStats = { order: 0, insight: 0, resolve: 0 };
  state.session.finalEnding = null;
};
const onGenerateScriptPlan = () => {
  const prompt = (el.scriptGenInput?.value || "").trim();
  if (!prompt) {
    showPromptDialog("请输入至少一个关键词，例如“悬疑”“宫廷”或“夜雨追缉”。", "补充关键词", {
      variant: "centered"
    });
    return;
  }
  let generated = null;
  try {
    generated = buildGeneratedScriptFromPrompt(prompt);
  } catch (_err) {
    showPromptDialog("剧本生成模块未加载，请检查 app-web-storygen.js。", "模块异常", {
      variant: "centered"
    });
    return;
  }
  if (!generated || !Array.isArray(generated.routePlan) || !generated.routePlan.length) {
    showPromptDialog("未生成可用路线，请更换关键词重试。", "生成失败", {
      variant: "centered"
    });
    return;
  }
  state.session.pendingScriptPlan = generated;
  renderGeneratedScriptPlan(generated);
  closeOverlay("script-builder");
  openOverlay("script-plan");
};
const renderScriptBuilderOptions = () => {
  if (!el.builderScriptList) return;
  el.builderScriptList.innerHTML = "";
  SCRIPTS.forEach((script) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = `item${state.selectedScriptId === script.id ? " active" : ""}`;
    node.innerHTML = `<div class="item-title">${script.name}</div><div class="item-sub">${script.subtitle}</div>`;
    node.addEventListener("click", () => {
      state.selectedScriptId = script.id;
      saveScriptId();
      renderScriptBuilderOptions();
    });
    el.builderScriptList.appendChild(node);
  });
};
const onStartSelectedScript = () => {
  const selected = getScriptById(state.selectedScriptId);
  resetSession();
  closeWelcome();
  setTab("home");
  closeOverlay("script-builder");
  closeOverlay("script-plan");
  openChat(state.session.nextLandmarkId || "zhonggulou", `${selected.name}启卷`);
};
const onStartGeneratedScript = () => {
  const generated = state.session.pendingScriptPlan;
  if (!generated) return;
  resetSessionForGeneratedScript(generated);
  clearStoryProgressStore();
  closeWelcome();
  setTab("home");
  closeOverlay("script-plan");
  closeOverlay("script-builder");
  const firstLandmarkId = state.session.nextLandmarkId;
  if (!firstLandmarkId) {
    showPromptDialog("未生成可用路线，请重新生成。", "生成失败", {
      variant: "centered"
    });
    return;
  }
  openChat(firstLandmarkId, "AI生成启卷");
};

function saveScriptId() { localStorage.setItem(STORAGE_KEYS.scriptId, state.selectedScriptId); }
function loadScriptId() { const raw = localStorage.getItem(STORAGE_KEYS.scriptId); if (SCRIPTS.some((s) => s.id === raw)) state.selectedScriptId = raw; }
function saveAssets() { localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(state.designAssets)); }
function loadAssets() { try { state.designAssets = { ...DEFAULT_ASSETS, ...(JSON.parse(localStorage.getItem(STORAGE_KEYS.assets) || "{}")) }; } catch (_e) { state.designAssets = { ...DEFAULT_ASSETS }; } }
function readCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const chunks = document.cookie ? document.cookie.split("; ") : [];
  for (const chunk of chunks) {
    if (chunk.startsWith(prefix)) return decodeURIComponent(chunk.slice(prefix.length));
  }
  return "";
}
function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; path=/; SameSite=Lax`;
}
function parseStoryProgressStore(raw) {
  if (!raw) return { byLandmark: {} };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { byLandmark: {} };
    if (!parsed.byLandmark || typeof parsed.byLandmark !== "object") parsed.byLandmark = {};
    return parsed;
  } catch (_e) {
    return { byLandmark: {} };
  }
}
function sanitizeChatHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((message) => message && typeof message === "object")
    .map((message) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: String(message.content || "")
    }))
    .filter((message) => message.content)
    .slice(-50);
}
function loadChatSnapshot(landmarkId) {
  try {
    const raw = localStorage.getItem(CHAT_SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    if (parsed.landmarkId !== landmarkId) return [];
    return sanitizeChatHistory(parsed.history);
  } catch (_e) {
    return [];
  }
}
function saveCurrentChatSnapshot() {
  try {
    if (!state.session.landmarkId || !state.session.story) {
      localStorage.removeItem(CHAT_SNAPSHOT_KEY);
      return;
    }
    localStorage.setItem(CHAT_SNAPSHOT_KEY, JSON.stringify({
      landmarkId: state.session.landmarkId,
      history: sanitizeChatHistory(state.session.history),
      updatedAt: Date.now()
    }));
  } catch (_e) {}
}
function clearChatSnapshot() {
  try {
    localStorage.removeItem(CHAT_SNAPSHOT_KEY);
  } catch (_e) {}
}
function loadStoryProgressStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.storyProgress);
    if (raw) return parseStoryProgressStore(raw);
  } catch (_e) {}
  const legacyRaw = readCookie(COOKIE_KEYS.storyProgress);
  if (!legacyRaw) return { byLandmark: {} };
  const legacyStore = parseStoryProgressStore(legacyRaw);
  saveStoryProgressStore(legacyStore);
  deleteCookie(COOKIE_KEYS.storyProgress);
  return legacyStore;
}
function saveStoryProgressStore(store) {
  try {
    localStorage.setItem(STORAGE_KEYS.storyProgress, JSON.stringify(store || { byLandmark: {} }));
  } catch (_e) {}
}
function getSavedLandmarkProgress(landmarkId) {
  const store = loadStoryProgressStore();
  return (store.byLandmark && store.byLandmark[landmarkId]) || null;
}
function persistCurrentLandmarkProgress() {
  const landmarkId = state.session.landmarkId;
  const story = state.session.story;
  if (!landmarkId || !story) return;
  const store = loadStoryProgressStore();
  if (!store.byLandmark || typeof store.byLandmark !== "object") store.byLandmark = {};
  store.byLandmark[landmarkId] = {
    currentNodeId: story.currentNodeId,
    tags: Array.isArray(story.tags) ? [...story.tags] : [],
    visitedNodes: Array.isArray(story.visitedNodes) ? [...story.visitedNodes] : [],
    canCheckArrival: Boolean(story.canCheckArrival),
    routeChoiceId: story.routeChoiceId || "",
    checkInPassed: Boolean(state.session.checkInPassed),
    updatedAt: Date.now()
  };
  store.route = {
    nextLandmarkId: state.session.nextLandmarkId || "zhonggulou",
    routePlan: Array.isArray(state.session.routePlan) ? [...state.session.routePlan] : [],
    generatedScript: state.session.generatedScript || null,
    scriptIntroSeen: Boolean(state.session.scriptIntroSeen),
    completed: Array.isArray(state.session.completed) ? [...state.session.completed] : [],
    introducedRoleKeys: Array.isArray(state.session.introducedRoleKeys) ? [...state.session.introducedRoleKeys] : [],
    choiceStats: { ...(state.session.choiceStats || { order: 0, insight: 0, resolve: 0 }) }
  };
  saveStoryProgressStore(store);
  saveCurrentChatSnapshot();
}
function clearStoryProgressStore() {
  try {
    localStorage.removeItem(STORAGE_KEYS.storyProgress);
  } catch (_e) {}
  deleteCookie(COOKIE_KEYS.storyProgress);
}
function normalizeSavedProgress(saved, story) {
  const entry = story.entry;
  const nodes = story.nodes || {};
  const tags = Array.isArray(saved?.tags) ? saved.tags.filter((v) => typeof v === "string") : [];
  const currentNodeId = nodes[saved?.currentNodeId] ? saved.currentNodeId : entry;
  const visitedRaw = Array.isArray(saved?.visitedNodes) ? saved.visitedNodes : [];
  const visitedNodes = visitedRaw.filter((id) => nodes[id]);
  if (!visitedNodes.includes(entry)) visitedNodes.unshift(entry);
  if (!visitedNodes.includes(currentNodeId)) visitedNodes.push(currentNodeId);
  return {
    tags,
    currentNodeId,
    visitedNodes,
    routeChoiceId: typeof saved?.routeChoiceId === "string" ? saved.routeChoiceId : "",
    canCheckArrival: Boolean(saved?.canCheckArrival),
    checkInPassed: Boolean(saved?.checkInPassed)
  };
}
function restoreRouteFromStorage() {
  const store = loadStoryProgressStore();
  const route = store.route;
  if (!route || typeof route !== "object") return;
  if (typeof route.nextLandmarkId === "string" && route.nextLandmarkId) {
    state.session.nextLandmarkId = route.nextLandmarkId;
  }
  if (Array.isArray(route.routePlan)) {
    state.session.routePlan = route.routePlan.filter((id) => LANDMARKS.some((l) => l.id === id));
  }
  if (route.generatedScript && typeof route.generatedScript === "object") {
    state.session.generatedScript = route.generatedScript;
  }
  if (typeof route.scriptIntroSeen === "boolean") {
    state.session.scriptIntroSeen = route.scriptIntroSeen;
  }
  if (Array.isArray(route.completed)) {
    state.session.completed = route.completed.filter((id) => LANDMARKS.some((l) => l.id === id));
  }
  if (Array.isArray(route.introducedRoleKeys)) {
    state.session.introducedRoleKeys = route.introducedRoleKeys.filter((item) => typeof item === "string");
  }
  if (route.choiceStats && typeof route.choiceStats === "object") {
    const stats = ensureChoiceStats();
    ["order", "insight", "resolve"].forEach((k) => {
      if (typeof route.choiceStats[k] === "number") stats[k] = route.choiceStats[k];
    });
  }
}

async function fetchTextIfExists(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return "";
    return (await response.text()).trim();
  } catch (_e) {
    return "";
  }
}

async function fetchUrlIfExists(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return "";
    return path;
  } catch (_e) {
    return "";
  }
}

function normalizeBase64(raw) {
  const compact = String(raw || "").replace(/\s+/g, "");
  if (!compact) return "";
  if (compact.startsWith("data:image")) return compact;
  return `data:image/png;base64,${compact}`;
}

async function resolveFolderDefaultAssets() {
  const resolved = { ...DEFAULT_ASSETS };
  const frameBase64 = normalizeBase64(await fetchTextIfExists(ASSET_SOURCES.personaFrame.b64));
  const couponBase64 = normalizeBase64(await fetchTextIfExists(ASSET_SOURCES.couponImage.b64));
  resolved.personaFrame = frameBase64 || ASSET_SOURCES.personaFrame.fallback;
  resolved.couponImage = couponBase64 || ASSET_SOURCES.couponImage.fallback;

  for (const candidate of RESULT_BG_CANDIDATES) {
    const existing = await fetchUrlIfExists(candidate);
    if (existing) {
      resolved.resultBgImage = existing;
      break;
    }
  }
  for (const candidate of ENDING_BG_CANDIDATES) {
    const existing = await fetchUrlIfExists(candidate);
    if (existing) {
      resolved.endingBgImage = existing;
      break;
    }
  }
  return resolved;
}

function setTab(tab) {
  state.activeTab = tab;
  document.body.classList.toggle("home-map-mode", tab === "home");
  Object.entries(el.pages).forEach(([k, n]) => n && n.classList.toggle("active", k === tab));
  el.tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
}

function updateStartupHero(tab) {
  if (!el.startupHeroImage) return;
  const visual = STARTUP_BG_BY_TAB[tab] || STARTUP_HERO_IMAGE;
  el.startupHeroImage.onerror = () => {
    el.startupHeroImage.onerror = null;
    el.startupHeroImage.src = STARTUP_HERO_IMAGE;
  };
  el.startupHeroImage.src = visual;
}

function updateViewportMetrics() {
  const viewport = window.visualViewport;
  const width = Math.max(320, Math.round(viewport?.width || window.innerWidth || 390));
  const height = Math.max(560, Math.round(viewport?.height || window.innerHeight || 844));
  const ua = navigator.userAgent || "";
  const screenWidth = window.screen?.width || width;
  const screenHeight = window.screen?.height || height;
  const shortestSide = Math.min(screenWidth, screenHeight);
  const isMobileLike = MOBILE_UA_PATTERN.test(ua) || (/Macintosh/i.test(ua) && Number(navigator.maxTouchPoints || 0) > 1 && shortestSide <= 1366);
  const desktopPhoneFrame = width > 560 && !isMobileLike;
  const appWidth = desktopPhoneFrame ? 390 : width;
  const appHeight = desktopPhoneFrame ? 844 : height;
  const fit = Math.min(appWidth / 390, appHeight / 844);
  const uiScale = Math.max(0.86, Math.min(1, fit));
  const denseScale = Math.max(0.82, Math.min(1, appHeight / 844));

  document.body.classList.toggle("desktop-phone-frame", desktopPhoneFrame);
  document.documentElement.style.setProperty("--app-vh", `${appHeight}px`);
  document.documentElement.style.setProperty("--ui-scale", uiScale.toFixed(4));
  document.documentElement.style.setProperty("--dense-scale", denseScale.toFixed(4));
}

function openWelcome() {
  updateStartupHero(state.activeTab || "home");
  openOverlay("welcome");
}

function closeWelcome() {
  closeOverlay("welcome");
  setTab(state.activeTab || "home");
}
function routeToHomeSurface(options = {}) {
  const forceWelcome = Boolean(options.forceWelcome);
  setTab("home");
  closeOverlay("script-builder");
  closeOverlay("script-plan");
  if (forceWelcome || !hasActiveStorySession()) {
    openWelcome();
    return;
  }
  closeWelcome();
}

let pageViews = null;
function ensurePageViews() {
  if (pageViews) return pageViews;
  if (typeof window.createCityQuestPageViews !== "function") {
    throw new Error("Page module not loaded: app-web-pages.js");
  }
  pageViews = window.createCityQuestPageViews({
    state,
    el,
    SCRIPTS,
    LANDMARKS,
    FEED,
    homeMapConfig: HOME_MAP_CONFIG,
    getExpectedLandmarkId,
    getLandmarkById,
    getScriptById,
    updateStartupHero,
    hasActiveStorySession,
    hasFinishedStorySession,
    showPromptDialog,
    openChat,
    saveAssets,
    getDefaultAssets: () => DEFAULT_ASSETS
  });
  return pageViews;
}
const getCurrentStoryNode = () => (state.session.story?.nodes || {})[state.session.story?.currentNodeId] || null;
const isChoiceUnlocked = (choice, story) => (choice.requirements || []).every((tag) => story.tags.includes(tag));
const getMissingRequirements = (choice, story) => (choice.requirements || []).filter((tag) => !story.tags.includes(tag));
function buildAxisStory(landmark) {
  const generatedTpl = state.session.generatedScript?.sceneTemplates?.[landmark.id];
  const tpl = generatedTpl || SCENE_TEMPLATES[landmark.id] || SCENE_TEMPLATES.zhonggulou;
  const clueA = tpl.clues?.[0] || `${landmark.name}线索甲`;
  const clueB = tpl.clues?.[1] || `${landmark.name}线索乙`;
  const stageTag = `${landmark.name}报告已提交`;
  return {
    title: tpl.title,
    objective: tpl.objective,
    report: tpl.report || "请提交当前站点报告。",
    clueMode: "any",
    requiredClues: [clueA, clueB],
    entry: "n1",
    nodes: {
      n1: {
        id: "n1",
        row: 1,
        col: 1,
        speaker: landmark.persona,
        text: tpl.intro,
        choices: [
          { id: "c1", text: tpl.options[0], effects: [{ type: "tag", value: clueA }], next: "n2" },
          { id: "c2", text: tpl.options[1], effects: [{ type: "tag", value: clueB }], next: "n2" }
        ]
      },
      n2: {
        id: "n2",
        row: 1,
        col: 2,
        speaker: "司牒官",
        text: tpl.report || "线索既得，可上此站文牒。",
        choices: [{
          id: "c1",
          text: "上呈站牒",
          effects: [{ type: "tag", value: stageTag }],
          next: "n3"
        }]
      },
      n3: {
        id: "n3",
        row: 1,
        col: 3,
        speaker: landmark.persona,
        text: tpl.bridge,
        choices: [{
          id: "c1",
          text: tpl.unlock || "准行到地校验",
          requirements: [stageTag],
          effects: [{ type: "unlockArrival" }],
          next: null
        }]
      }
    }
  };
}

function renderStoryGrid() {
  if (!el.storyGrid) return;
  el.storyGrid.innerHTML = "";
  const story = state.session.story;
  if (!story?.nodes) return;
  Object.values(story.nodes)
    .sort((a, b) => a.row * 10 + a.col - (b.row * 10 + b.col))
    .forEach((node) => {
      const box = document.createElement("div");
      box.className = "story-node";
      if (story.currentNodeId === node.id) box.classList.add("current");
      else if (story.visitedNodes.includes(node.id)) box.classList.add("visited");
      box.innerHTML = `<span class="node-id">${node.id}</span><span class="node-speaker">${node.speaker}</span>`;
      el.storyGrid.appendChild(box);
    });
}

function renderStoryChoices() {
  if (!el.chatChoices) return;
  el.chatChoices.innerHTML = "";
  const story = state.session.story;
  const node = getCurrentStoryNode();
  if (!story || !node) return;

  if (!node.choices?.length) {
    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = story.canCheckArrival ? "此段已竟，可行“到达判定”。" : "请继续选择剧情选项推进。";
    el.chatChoices.appendChild(hint);
    return;
  }

  node.choices.forEach((choice) => {
    const unlocked = isChoiceUnlocked(choice, story);
    const missing = getMissingRequirements(choice, story);
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.disabled = !unlocked;
    button.textContent = choice.text;
    if (!unlocked && missing.length) {
      button.appendChild(document.createElement("br"));
      const line = document.createElement("span");
      line.className = "choice-tag";
      line.textContent = `需线索：${missing.join("、")}`;
      button.appendChild(line);
    }
    button.addEventListener("click", () => onStoryChoice(choice.id));
    el.chatChoices.appendChild(button);
  });
}

function renderChat() {
  const landmark = state.session.landmarkId ? getLandmarkById(state.session.landmarkId) : null;
  const npc = getNpcByLandmark(landmark);
  const playerNpc = getNpcByKey("player");
  const story = state.session.story;
  const node = getCurrentStoryNode();
  const chatBg = getChatBgByLandmark(landmark);

  if (el.chatSceneBg) {
    el.chatSceneBg.onerror = () => {
      el.chatSceneBg.onerror = null;
      el.chatSceneBg.src = "./素材/每个地区的背景图/故宫.png";
    };
    el.chatSceneBg.src = chatBg;
  }

  if (el.chatTitle) el.chatTitle.textContent = landmark ? `${landmark.name} · 对话` : "地标对话";
  if (el.chatCharacterAvatar) {
    el.chatCharacterAvatar.src = npc.image;
    el.chatCharacterAvatar.alt = npc.name;
  }
  if (el.chatCharacterName) el.chatCharacterName.textContent = landmark?.persona || npc.name;
  if (el.chatCharacterRole) el.chatCharacterRole.textContent = landmark ? `${npc.name} · ${landmark.name}` : "";
  const activeScript = getActiveScript();
  const totalStops = (state.session.routePlan && state.session.routePlan.length) || LANDMARKS.length;
  if (el.chatScriptLine) el.chatScriptLine.textContent = `${activeScript.name}（${totalStops} 站）`;
  if (el.storyProgress) {
    const tags = story?.tags?.length ? story.tags.join("、") : "无";
    const required = story?.requiredClues?.length
      ? (story.clueMode === "any" ? `${story.requiredClues.join(" / ")}（择一）` : story.requiredClues.join("、"))
      : "无";
    el.storyProgress.textContent = story && node ? `${story.objective}｜需线索 ${required}｜已获 ${tags}` : "";
  }
  if (el.routeImpact) {
    const step = landmark ? ((state.session.completed?.length || 0) + 1) : 0;
    el.routeImpact.textContent = step ? `追缉进度：第 ${step} / ${totalStops} 站｜当前 ${landmark.name}` : "";
  }

  if (el.chatDialogueText) {
    let latest = "";
    for (let i = state.session.history.length - 1; i >= 0; i -= 1) {
      const message = state.session.history[i];
      if (message.role === "assistant") {
        latest = String(message.content || "");
        break;
      }
    }
    if (!latest && node?.text) latest = `${node.speaker}：${node.text}`;
    latest = latest.replace(/^[^：]{1,10}：/, "");
    el.chatDialogueText.textContent = latest || "……";
  }

  renderStoryGrid();

  if (el.chatMessages) {
    el.chatMessages.innerHTML = "";
    state.session.history.forEach((message) => {
      const row = document.createElement("div");
      const isUser = message.role === "user";
      const avatar = document.createElement("img");
      avatar.className = "msg-avatar";
      avatar.src = isUser ? playerNpc.image : npc.image;
      avatar.alt = isUser ? playerNpc.name : npc.name;

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = message.content;

      row.className = `msg ${isUser ? "user" : "assistant"}`;
      if (isUser) {
        row.appendChild(bubble);
        row.appendChild(avatar);
      } else {
        row.appendChild(avatar);
        row.appendChild(bubble);
      }
      el.chatMessages.appendChild(row);
    });
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }

  if (el.btnGoCamera) el.btnGoCamera.disabled = !state.session.checkInPassed;
  renderStoryChoices();
}

function renderResult() {
  if (el.resultImage) el.resultImage.src = state.session.composedImage || state.designAssets.couponImage;
  if (el.resultCoupon) {
    const couponSrc = state.designAssets.couponImage || "";
    if (!couponSrc) {
      el.resultCoupon.classList.add("hidden");
    } else {
      el.resultCoupon.classList.remove("hidden");
      el.resultCoupon.onerror = () => el.resultCoupon?.classList.add("hidden");
      el.resultCoupon.onload = () => el.resultCoupon?.classList.remove("hidden");
      el.resultCoupon.src = couponSrc;
    }
  }
  if (el.resultBg) {
    if (state.designAssets.resultBgImage) {
      el.resultBg.src = state.designAssets.resultBgImage;
      el.resultBg.classList.remove("hidden");
    } else {
      el.resultBg.classList.add("hidden");
    }
  }
}

function renderEnding() {
  const ending = state.session.finalEnding;
  if (!ending) return;
  if (el.endingBg) {
    const endingBg = getEndingBgForSession();
    el.endingBg.onerror = () => {
      el.endingBg.onerror = null;
      el.endingBg.src = STARTUP_HERO_IMAGE;
    };
    el.endingBg.src = endingBg;
  }
  if (el.endingTitle) el.endingTitle.textContent = `终局·${ending.title || "封阙毕"}`;
  if (el.endingSummary) el.endingSummary.textContent = ending.summary || "";
  if (el.endingEpilogue) el.endingEpilogue.textContent = ending.epilogue || "";
  if (el.endingStats) {
    const stats = ending.stats || { order: 0, insight: 0, resolve: 0 };
    el.endingStats.textContent = `取向统计：循制 ${stats.order} ｜ 机断 ${stats.insight} ｜ 决行 ${stats.resolve}`;
  }
}

function renderAll() {
  const views = ensurePageViews();
  views.renderHome();
  views.renderCommunity();
  views.renderScriptLibrary();
  views.renderProfile();
  renderChat();
  renderResult();
  renderEnding();
  renderScriptBuilderOptions();
}

function addChatMessage(role, content) {
  state.session.history.push({ role, content: String(content || "") });
  if (state.session.history.length > 50) state.session.history = state.session.history.slice(-50);
  saveCurrentChatSnapshot();
  renderChat();
}

function applyStoryEffects(effects) {
  const story = state.session.story;
  if (!story || !Array.isArray(effects)) return;
  effects.forEach((effect) => {
    if (effect.type === "tag" && effect.value && !story.tags.includes(effect.value)) story.tags.push(effect.value);
    if (effect.type === "unlockArrival") story.canCheckArrival = true;
  });
}

function moveToStoryNode(id) {
  const story = state.session.story;
  if (!story || !id || !story.nodes[id]) return;
  story.currentNodeId = id;
  if (!story.visitedNodes.includes(id)) story.visitedNodes.push(id);
  const node = story.nodes[id];
  addChatMessage("assistant", `${node.speaker}：${node.text}`);
}

function onStoryChoice(choiceId) {
  const story = state.session.story;
  const node = getCurrentStoryNode();
  if (!story || !node?.choices?.length) return;
  const choice = node.choices.find((item) => item.id === choiceId);
  if (!choice) return;
  if (!isChoiceUnlocked(choice, story)) {
    const missing = getMissingRequirements(choice, story);
    addChatMessage("assistant", `此选未启，尚缺：${missing.join("、") || "未知线索"}`);
    return;
  }
  addChatMessage("user", `吾择：${choice.text}`);
  applyStoryEffects(choice.effects || []);
  if (node.id === "n1") {
    const landmarkId = state.session.landmarkId;
    const generatedTpl = state.session.generatedScript?.sceneTemplates?.[landmarkId];
    story.routeChoiceId = choice.id;
    const result = generatedTpl?.choiceResults?.[choice.id] || STATION_CHOICE_RESULTS[landmarkId]?.[choice.id];
    if (result) addChatMessage("assistant", result);
    const style = generatedTpl?.choiceStyles?.[choice.id] || CHOICE_STYLE_BY_STATION[landmarkId]?.[choice.id];
    if (style) {
      const stats = ensureChoiceStats();
      stats[style] = Number(stats[style] || 0) + 1;
      if (STYLE_FEEDBACK[style]) addChatMessage("assistant", STYLE_FEEDBACK[style]);
    }
    const plannedNext = (state.session.routePlan && state.session.routePlan.length)
      ? state.session.routePlan[(state.session.completed?.length || 0) + 1]
      : "";
    const nextLandmarkId = plannedNext || resolveNextLandmarkId(landmarkId, choice.id);
    if (nextLandmarkId) {
      const nextLandmark = getLandmarkById(nextLandmarkId);
      addChatMessage("assistant", `线索导引：下一站宜赴 ${nextLandmark.name}。`);
    } else {
      addChatMessage("assistant", "线索导引：终局已近，下一站即封阙。");
    }
  }
  if (choice.next) {
    if (node.id === "n2") addChatMessage("assistant", "司牒官覆印：本站证据成卷，准转下一核。");
    moveToStoryNode(choice.next);
    persistCurrentLandmarkProgress();
    return;
  }
  if (story.canCheckArrival) addChatMessage("assistant", "此站文脉已合，地校符印已启，可行“到达判定”。");
  persistCurrentLandmarkProgress();
}
function syncOverlayBodyState() {
  const welcomeOpen = document.getElementById("overlay-welcome")?.classList.contains("show");
  document.body.classList.toggle("welcome-open", Boolean(welcomeOpen));
}

function openOverlay(name) {
  document.getElementById(`overlay-${name}`)?.classList.add("show");
  syncOverlayBodyState();
}

function closeOverlay(name) {
  document.getElementById(`overlay-${name}`)?.classList.remove("show");
  if (name === "camera") stopCamera();
  syncOverlayBodyState();
}
function setPromptButtonTone(button, tone = "") {
  if (!button) return;
  const hidden = button.classList.contains("hidden");
  button.className = "btn";
  if (tone) button.classList.add(tone);
  if (hidden) button.classList.add("hidden");
}
function showPromptDialog(message, title = "提示", options = {}) {
  const hasCancel = Boolean(options.showCancel || options.cancelText || options.onCancel);
  if (el.promptTitle) el.promptTitle.textContent = title;
  if (el.promptMessage) el.promptMessage.textContent = String(message || "");
  if (el.promptDialog) {
    if (options.variant) el.promptDialog.dataset.variant = options.variant;
    else delete el.promptDialog.dataset.variant;
  }
  if (el.promptOk) {
    el.promptOk.textContent = options.confirmText || "我知道了";
    setPromptButtonTone(el.promptOk, options.confirmTone || "primary");
  }
  if (el.promptCancel) {
    el.promptCancel.textContent = options.cancelText || "取消";
    el.promptCancel.classList.toggle("hidden", !hasCancel);
    setPromptButtonTone(el.promptCancel, options.cancelTone || "secondary");
  }
  if (el.promptActions) el.promptActions.classList.toggle("prompt-actions-split", hasCancel);
  promptDialogState.onConfirm = typeof options.onConfirm === "function" ? options.onConfirm : null;
  promptDialogState.onCancel = typeof options.onCancel === "function" ? options.onCancel : null;
  openOverlay("dialog");
}
function closePromptDialog() {
  promptDialogState.onConfirm = null;
  promptDialogState.onCancel = null;
  if (el.promptDialog) delete el.promptDialog.dataset.variant;
  if (el.promptActions) el.promptActions.classList.remove("prompt-actions-split");
  if (el.promptCancel) el.promptCancel.classList.add("hidden");
  if (el.promptOk) setPromptButtonTone(el.promptOk, "primary");
  if (el.promptCancel) setPromptButtonTone(el.promptCancel, "secondary");
  closeOverlay("dialog");
}
function onPromptDialogConfirm() {
  const callback = promptDialogState.onConfirm;
  closePromptDialog();
  if (callback) callback();
}
function onPromptDialogCancel() {
  const callback = promptDialogState.onCancel;
  closePromptDialog();
  if (callback) callback();
}

function onAbortHomeScript() {
  showPromptDialog("确认中止当前剧本吗？当前线索、进度与打卡流程将被清空，并返回“进入中轴世界”的起始页。", "中止剧本", {
    variant: "centered",
    showCancel: true,
    cancelText: "继续剧本",
    confirmText: "确认中止",
    confirmTone: "danger",
    onConfirm: () => {
      resetSession();
      routeToHomeSurface({ forceWelcome: true });
    }
  });
}

function openChat(landmarkId, entryHint = "") {
  state.session.landmarkId = landmarkId;
  state.session.history = [];
  state.session.checkInPassed = false;
  state.session.finalEnding = null;

  const landmark = getLandmarkById(landmarkId);
  const stageNo = Math.max(1, (state.session.completed?.length || 0) + 1);
  const script = getActiveScript();
  const story = buildAxisStory(landmark);
  const savedProgress = getSavedLandmarkProgress(landmark.id);
  if (!Array.isArray(state.session.introducedRoleKeys)) state.session.introducedRoleKeys = [];
  const introScriptId = script?.id || state.selectedScriptId;
  const introKey = `${introScriptId}:${landmark.id}`;
  const firstMeetRole = !state.session.introducedRoleKeys.includes(introKey);

  if (savedProgress) {
    const restored = normalizeSavedProgress(savedProgress, story);
    const restoredHistory = loadChatSnapshot(landmark.id);
    state.session.story = {
      title: story.title,
      objective: story.objective,
      entry: story.entry,
      currentNodeId: restored.currentNodeId,
      nodes: story.nodes,
      tags: restored.tags,
      visitedNodes: restored.visitedNodes,
      clueMode: story.clueMode,
      requiredClues: story.requiredClues,
      routeChoiceId: restored.routeChoiceId || "",
      canCheckArrival: restored.canCheckArrival
    };
    state.session.checkInPassed = restored.checkInPassed;
    state.session.history = restoredHistory;
  } else {
    state.session.story = {
      title: story.title,
      objective: story.objective,
      entry: story.entry,
      currentNodeId: story.entry,
      nodes: story.nodes,
      clueMode: story.clueMode,
      requiredClues: story.requiredClues,
      routeChoiceId: "",
      tags: [],
      visitedNodes: [story.entry],
      canCheckArrival: false
    };
    state.session.history = [];
  }

  if (!state.session.history.length) {
    const hint = entryHint ? `（入径：${entryHint}）` : "";
    addChatMessage("assistant", `${landmark.name}：${script.opening}${hint}`);
    if (hasGeneratedRoutePlan()) {
      const nextGeneratedId = state.session.routePlan[state.session.completed.length + 1] || "";
      const nextGeneratedName = nextGeneratedId ? getLandmarkById(nextGeneratedId).name : "终章封卷";
      addChatMessage("assistant", `【第 ${stageNo} 站】当前追缉点：${landmark.name}。本卷路线已预设，完成本站后将转往 ${nextGeneratedName}。`);
    } else {
      addChatMessage("assistant", `【第 ${stageNo} 站】当前追缉点：${landmark.name}。后续去向由本站抉择导引。`);
    }
    if (firstMeetRole) {
      state.session.introducedRoleKeys.push(introKey);
      addChatMessage("assistant", buildRoleIntroLine(landmark, story));
    }
    addChatMessage("assistant", `卷章启：${story.title}`);
    const beat = state.session.generatedScript?.beats?.[landmark.id] || MAINLINE_BEATS[landmark.id];
    if (beat) addChatMessage("assistant", beat);
    if (savedProgress) {
      const tags = state.session.story.tags || [];
      addChatMessage("assistant", `已恢复进度：已获线索 ${tags.length ? tags.join("、") : "无"}。`);
    }
    const first = getCurrentStoryNode();
    if (first) addChatMessage("assistant", `${first.speaker}：${first.text}`);
  } else {
    renderChat();
  }
  persistCurrentLandmarkProgress();
  openOverlay("chat");
  if (!state.session.scriptIntroSeen) {
    state.session.scriptIntroSeen = true;
    renderScriptIntroOverlay(script, landmark, story);
    persistCurrentLandmarkProgress();
    openOverlay("script-intro");
  }
}

function onCheckArrival() {
  const story = state.session.story;
  if (story && !story.canCheckArrival) { addChatMessage("assistant", "线索未齐，请先完此站抉择。"); return; }
  state.session.checkInPassed = true;
  addChatMessage("assistant", "地校吻合：此站可封记。请行“拍照打卡”留证并续追。");
  persistCurrentLandmarkProgress();
  renderChat();
}

async function startCamera() {
  const landmark = state.session.landmarkId ? getLandmarkById(state.session.landmarkId) : null;
  if (el.cameraModal) {
    const cameraBackdrop = getCameraBackdropByLandmark(landmark);
    if (cameraBackdrop) {
      el.cameraModal.style.setProperty("--camera-modal-bg-image", `url("${cameraBackdrop}")`);
    } else {
      el.cameraModal.style.removeProperty("--camera-modal-bg-image");
    }
  }
  if (el.cameraFrame) {
    const checkinBg = getCheckinBgForSession();
    el.cameraFrame.onload = syncCameraWindowToFrame;
    el.cameraFrame.onerror = () => {
      el.cameraFrame.onerror = null;
      el.cameraFrame.src = state.designAssets.personaFrame || DEFAULT_ASSETS.personaFrame;
    };
    el.cameraFrame.src = checkinBg;
    if (el.cameraFrame.complete) syncCameraWindowToFrame();
  }
  if (!navigator.mediaDevices?.getUserMedia) { if (el.cameraTip) el.cameraTip.textContent = "当前浏览器不支持摄像头，可上传图片合成。"; return; }
  try {
    state.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (el.cameraVideo) el.cameraVideo.srcObject = state.mediaStream;
    if (el.cameraTip) el.cameraTip.textContent = "可拍照或上传图片合成。";
  } catch (_e) { if (el.cameraTip) el.cameraTip.textContent = "摄像头不可用，可上传图片合成。"; }
}

function stopCamera() { if (!state.mediaStream) return; state.mediaStream.getTracks().forEach((t) => t.stop()); state.mediaStream = null; if (el.cameraVideo) el.cameraVideo.srcObject = null; }

function readFileAsDataURL(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result || "")); r.onerror = reject; r.readAsDataURL(file); }); }
function loadImage(src) { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; }); }

function drawImageCover(ctx, image, dx, dy, dWidth, dHeight) {
  const sourceWidth = image?.naturalWidth || image?.width || 0;
  const sourceHeight = image?.naturalHeight || image?.height || 0;
  if (!sourceWidth || !sourceHeight || !dWidth || !dHeight) return;

  const scale = Math.max(dWidth / sourceWidth, dHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = dx + ((dWidth - drawWidth) / 2);
  const drawY = dy + ((dHeight - drawHeight) / 2);

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function detectOpaqueBoundsFromFrame(image) {
  const width = image?.naturalWidth || image?.width || 0;
  const height = image?.naturalHeight || image?.height || 0;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[((y * width) + x) * 4 + 3];
      if (alpha <= 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;

  return {
    left,
    top,
    right,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1
  };
}

function detectCameraWindowBoundsFromFrame(image) {
  const width = image?.naturalWidth || image?.width || 0;
  const height = image?.naturalHeight || image?.height || 0;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const findLongestTransparentRun = (primaryIndex, limit, sampleAlpha) => {
    let runStart = -1;
    let bestStart = -1;
    let bestEnd = -1;
    let bestLength = 0;

    for (let offset = 0; offset < limit; offset += 1) {
      const isTransparent = sampleAlpha(primaryIndex, offset) < 16;

      if (isTransparent) {
        if (runStart < 0) runStart = offset;
        continue;
      }

      if (runStart >= 0) {
        const runLength = offset - runStart;
        if (runLength > bestLength) {
          bestLength = runLength;
          bestStart = runStart;
          bestEnd = offset - 1;
        }
        runStart = -1;
      }
    }

    if (runStart >= 0) {
      const runLength = limit - runStart;
      if (runLength > bestLength) {
        bestLength = runLength;
        bestStart = runStart;
        bestEnd = limit - 1;
      }
    }

    return { start: bestStart, end: bestEnd, length: bestLength };
  };

  const rowRuns = [];
  for (let y = 0; y < height; y += 1) {
    const run = findLongestTransparentRun(
      y,
      width,
      (rowIndex, x) => data[((rowIndex * width) + x) * 4 + 3]
    );
    if (run.length > 0) rowRuns.push(run);
  }

  if (!rowRuns.length) return null;

  const maxRowLength = Math.max(...rowRuns.map((run) => run.length));
  const dominantRows = rowRuns.filter((run) => run.length >= (maxRowLength * 0.96));
  if (!dominantRows.length) return null;

  const left = Math.min(...dominantRows.map((run) => run.start));
  const right = Math.max(...dominantRows.map((run) => run.end));

  const columnRuns = [];
  for (let x = left; x <= right; x += 1) {
    const run = findLongestTransparentRun(
      x,
      height,
      (columnIndex, y) => data[((y * width) + columnIndex) * 4 + 3]
    );
    if (run.length > 0) columnRuns.push(run);
  }

  if (!columnRuns.length) return null;

  const maxColumnLength = Math.max(...columnRuns.map((run) => run.length));
  const dominantColumns = columnRuns.filter((run) => run.length >= (maxColumnLength * 0.96));

  if (!dominantColumns.length) return null;

  const top = Math.min(...dominantColumns.map((run) => run.start));
  const bottom = Math.max(...dominantColumns.map((run) => run.end));

  const inset = 1;
  const safeLeft = Math.max(0, left + inset);
  const safeTop = Math.max(0, top + inset);
  const safeRight = Math.min(width - 1, right - inset);
  const safeBottom = Math.min(height - 1, bottom - inset);

  return {
    width,
    height,
    left: safeLeft,
    top: safeTop,
    windowWidth: Math.max(1, safeRight - safeLeft + 1),
    windowHeight: Math.max(1, safeBottom - safeTop + 1)
  };
}

function syncCameraWindowToFrame() {
  if (!el.cameraWrap || !el.cameraFrame) return;

  const crop = detectOpaqueBoundsFromFrame(el.cameraFrame);
  const bounds = detectCameraWindowBoundsFromFrame(el.cameraFrame);
  const fullWidth = el.cameraFrame.naturalWidth || 374;
  const fullHeight = el.cameraFrame.naturalHeight || 599;
  const cropLeft = crop?.left || 0;
  const cropTop = crop?.top || 0;
  const frameWidth = crop?.width || fullWidth;
  const frameHeight = crop?.height || fullHeight;

  el.cameraWrap.style.aspectRatio = `${frameWidth} / ${frameHeight}`;
  el.cameraWrap.style.maxWidth = `${frameWidth}px`;
  el.cameraWrap.style.setProperty("--camera-frame-width", String(frameWidth));
  el.cameraWrap.style.setProperty("--camera-frame-height", String(frameHeight));
  el.cameraFrame.style.width = `${(fullWidth / frameWidth) * 100}%`;
  el.cameraFrame.style.height = `${(fullHeight / frameHeight) * 100}%`;
  el.cameraFrame.style.left = `${-((cropLeft / frameWidth) * 100)}%`;
  el.cameraFrame.style.top = `${-((cropTop / frameHeight) * 100)}%`;

  if (!bounds) return;

  el.cameraWrap.style.setProperty("--camera-window-left", String(bounds.left - cropLeft));
  el.cameraWrap.style.setProperty("--camera-window-top", String(bounds.top - cropTop));
  el.cameraWrap.style.setProperty("--camera-window-width", String(bounds.windowWidth));
  el.cameraWrap.style.setProperty("--camera-window-height", String(bounds.windowHeight));
}

async function loadCheckinFrameAsset() {
  const fallbackFrame = state.designAssets.personaFrame || DEFAULT_ASSETS.personaFrame;
  const candidates = [getCheckinBgForSession(), fallbackFrame].filter(Boolean);
  const tried = new Set();

  for (const src of candidates) {
    if (!src || tried.has(src)) continue;
    tried.add(src);
    try {
      return await loadImage(src);
    } catch (_e) {}
  }

  return null;
}

async function composeFromSource(sourceDataUrl) {
  if (!el.composeCanvas) return sourceDataUrl;
  const canvas = el.composeCanvas;
  const ctx = canvas.getContext("2d");
  const photo = await loadImage(sourceDataUrl);
  const frame = await loadCheckinFrameAsset();

  if (frame) {
    const crop = detectOpaqueBoundsFromFrame(frame);
    const frameWidth = crop?.width || frame.naturalWidth || frame.width || 374;
    const frameHeight = crop?.height || frame.naturalHeight || frame.height || 599;
    const cropLeft = crop?.left || 0;
    const cropTop = crop?.top || 0;
    const bounds = detectCameraWindowBoundsFromFrame(frame) || {
      left: cropLeft,
      top: cropTop,
      windowWidth: frameWidth,
      windowHeight: frameHeight
    };

    canvas.width = frameWidth;
    canvas.height = frameHeight;
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawImageCover(
      ctx,
      photo,
      bounds.left - cropLeft,
      bounds.top - cropTop,
      bounds.windowWidth,
      bounds.windowHeight
    );
    ctx.drawImage(
      frame,
      cropLeft,
      cropTop,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );
    return canvas.toDataURL("image/png");
  }

  canvas.width = Math.min(photo.width || 720, 1280);
  canvas.height = Math.min(photo.height || 1280, 1920);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function onCapture() {
  if (el.cameraVideo && el.cameraVideo.videoWidth && el.cameraVideo.videoHeight) {
    const temp = document.createElement("canvas");
    temp.width = el.cameraVideo.videoWidth;
    temp.height = el.cameraVideo.videoHeight;
    temp.getContext("2d").drawImage(el.cameraVideo, 0, 0);
    state.session.composedImage = await composeFromSource(temp.toDataURL("image/png"));
    renderResult(); closeOverlay("camera"); openOverlay("result");
    return;
  }
  el.inputPhotoFile?.click();
}

async function onUploadPhoto(file) {
  const dataUrl = await readFileAsDataURL(file);
  state.session.composedImage = await composeFromSource(dataUrl);
  renderResult(); closeOverlay("camera"); openOverlay("result");
}

function onSkipCamera() {
  state.session.composedImage = getCheckinBgForSession() || state.designAssets.resultBgImage || state.designAssets.couponImage || DEFAULT_ASSETS.couponImage;
  renderResult(); closeOverlay("camera"); openOverlay("result");
}

function onSaveResult() {
  const url = state.session.composedImage || state.designAssets.couponImage;
  const link = document.createElement("a");
  link.href = url;
  link.download = "cityquest-result.png";
  link.click();
}

function onContinueProgress() {
  const current = state.session.landmarkId;
  if (!current) { closeOverlay("result"); return; }
  if (!state.session.completed.includes(current)) state.session.completed.push(current);

  closeOverlay("result");
  closeOverlay("camera");

  let nextLandmarkId = "";
  if (Array.isArray(state.session.routePlan) && state.session.routePlan.length) {
    nextLandmarkId = state.session.routePlan[state.session.completed.length] || "";
  } else {
    const routeChoiceId = state.session.story?.routeChoiceId || "c1";
    nextLandmarkId = resolveNextLandmarkId(current, routeChoiceId) || "";
  }
  state.session.nextLandmarkId = nextLandmarkId || "";
  persistCurrentLandmarkProgress();

  if (!nextLandmarkId) {
    const ending = resolveFinalEnding();
    state.session.finalEnding = ending;
    clearStoryProgressStore();
    clearChatSnapshot();
    closeOverlay("chat");
    setTab("home");
    renderEnding();
    openOverlay("ending");
    renderAll();
    return;
  }

  openChat(nextLandmarkId, "续行");
  renderAll();
}

function resetSession() {
  state.session = {
    nextLandmarkId: "zhonggulou",
    routePlan: [],
    generatedScript: null,
    pendingScriptPlan: null,
    landmarkId: "",
    scriptIntroSeen: false,
    history: [],
    story: null,
    checkInPassed: false,
    composedImage: "",
    completed: [],
    introducedRoleKeys: [],
    choiceStats: { order: 0, insight: 0, resolve: 0 },
    finalEnding: null
  };
  clearStoryProgressStore();
  clearChatSnapshot();
  closeOverlay("result"); closeOverlay("chat"); closeOverlay("camera");
  closeOverlay("ending"); closeOverlay("script-plan"); closeOverlay("script-builder"); closeOverlay("dialog");
  renderAll();
}

function bindEvents() {
  updateViewportMetrics();
  const onPrimaryTabSelect = (tab) => {
    const targetTab = tab || "home";
    if (targetTab === "home") {
      routeToHomeSurface();
      return;
    }
    setTab(targetTab);
    closeWelcome();
  };

  el.tabs.forEach((button) => button.addEventListener("click", () => onPrimaryTabSelect(button.dataset.tab)));
  const enterApp = () => {
    closeWelcome();
    if (state.activeTab === "home") {
      openOverlay("script-builder");
    }
  };

  const bindClick = (id, handler) => {
    const node = document.getElementById(id);
    if (node) node.addEventListener("click", handler);
  };

  bindClick("btn-enter-app", enterApp);
  bindClick("btn-generate-script", onGenerateScriptPlan);
  bindClick("btn-start-selected-script", onStartSelectedScript);
  bindClick("btn-start-generated-script", onStartGeneratedScript);
  bindClick("btn-back-from-welcome", closeWelcome);
  bindClick("btn-go-home-by-script", () => routeToHomeSurface());
  bindClick("btn-abort-home-script", onAbortHomeScript);
  bindClick("btn-script-intro-start", () => closeOverlay("script-intro"));
  bindClick("btn-check-arrival", onCheckArrival);
  bindClick("btn-go-camera", async () => { openOverlay("camera"); await startCamera(); });
  bindClick("btn-capture", onCapture);
  bindClick("btn-upload-photo", () => el.inputPhotoFile?.click());
  bindClick("btn-save-result", onSaveResult);
  bindClick("btn-restart", onContinueProgress);
  bindClick("btn-prompt-ok", onPromptDialogConfirm);
  bindClick("btn-prompt-cancel", onPromptDialogCancel);
  bindClick("btn-ending-home", () => closeOverlay("ending"));
  bindClick("btn-ending-replay", () => {
    resetSession();
    openOverlay("script-builder");
  });

  Array.from(document.querySelectorAll('[data-back="welcome"]'))
    .forEach((node) => node.addEventListener("click", openWelcome));

  // Hotspot fallback: in case absolute button shifts on some phone ratios,
  // clicking the vertical plaque area still enters.
  const welcomeModal = document.querySelector("#overlay-welcome .modal.welcome");
  if (welcomeModal) {
    welcomeModal.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#btn-enter-app")) return;

      const rect = welcomeModal.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const xRatio = (event.clientX - rect.left) / rect.width;
      const yRatio = (event.clientY - rect.top) / rect.height;
      const inPlaque = xRatio >= 0.42 && xRatio <= 0.58 && yRatio >= 0.20 && yRatio <= 0.74;
      if (inPlaque) {
        enterApp();
      }
    });
  }

  if (el.inputPhotoFile) el.inputPhotoFile.addEventListener("change", async () => { const file = el.inputPhotoFile.files?.[0]; if (!file) return; await onUploadPhoto(file); el.inputPhotoFile.value = ""; });
  Array.from(document.querySelectorAll("[data-close]")).forEach((node) => node.addEventListener("click", () => {
    const target = node.dataset.close;
    if (target === "script-builder") {
      closeOverlay("script-builder");
      openWelcome();
      return;
    }
    if (target === "script-plan") {
      closeOverlay("script-plan");
      openOverlay("script-builder");
      return;
    }
    closeOverlay(target);
  }));
  if (el.promptDialog) {
    el.promptDialog.addEventListener("click", (event) => {
      if (event.target !== el.promptDialog) return;
      if (el.promptDialog.dataset.variant === "centered") onPromptDialogCancel();
    });
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    updateViewportMetrics();
    if (state.activeTab !== "home") return;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      ensurePageViews().renderHome();
    }, 80);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateViewportMetrics);
  }
}

async function init() {
  loadScriptId();
  DEFAULT_ASSETS = await resolveFolderDefaultAssets();
  loadAssets();
  restoreRouteFromStorage();
  bindEvents();
  updateViewportMetrics();
  setTab("home");
  syncOverlayBodyState();
  renderAll();
}

init();

