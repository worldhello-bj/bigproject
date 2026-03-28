(function () {
  const THEME_PROFILES = [
    {
      id: "suspense",
      label: "悬疑追查",
      priority: 3,
      keywords: ["悬疑", "推理", "疑案", "谜案", "谜局", "迷案"],
      caseTitles: ["疑牒", "谜卷", "暗案", "迷局"],
      artifacts: ["密牒", "旧匣", "密札", "残卷"],
      incidentTemplates: ["调包了{artifact}", "截走了{artifact}", "让{artifact}在北阙离奇失踪", "把{artifact}换成了一份假卷"],
      villains: ["失踪司牒", "无名递卷人", "潜行内应"],
      stakes: ["整条证据链被假线索彻底拖偏", "你追到的每一站都沦为对方提前埋下的障眼法", "真正的证物在错位口供里被彻底洗去痕迹"],
      subtitleTemplates: [
        "围绕{artifact}失踪展开的中轴悬疑追查",
        "沿中轴拆解一宗与{artifact}相关的连续疑案"
      ],
      introTone: "这卷最危险的地方，不是线索太少，而是每一条线索都像是被人故意处理过。"
    },
    {
      id: "intrigue",
      label: "宫廷疑案",
      priority: 2,
      keywords: ["宫廷", "宫阙", "朝堂", "内廷", "故宫", "太庙", "社稷"],
      caseTitles: ["疑牒", "暗档", "错印", "密诏"],
      artifacts: ["密牒", "旧诏", "门印", "暗档"],
      incidentTemplates: ["调包了{artifact}", "错置了与{artifact}相关的旧档", "截留了{artifact}", "伪造了围绕{artifact}的文案"],
      villains: ["内廷伪官", "借名司牒", "宫中内应"],
      stakes: ["宫门礼序被人倒置", "中轴通行秩序被人改写", "旧制将被人借名重开"],
      subtitleTemplates: [
        "沿中轴追查内廷遗失的{artifact}",
        "在宫城与坛域之间追缉一份被调包的{artifact}"
      ],
      introTone: "局势看似平静，实则每一层礼序都被人悄悄动过手脚。"
    },
    {
      id: "pursuit",
      label: "追缉密卷",
      priority: 4,
      keywords: ["追缉", "追捕", "刺客", "逃亡", "夜行", "缉拿", "潜逃"],
      caseTitles: ["缉踪", "追卷", "夜捕", "追契"],
      artifacts: ["封缄木匣", "夜签", "密札", "关牒"],
      incidentTemplates: ["携走了{artifact}", "把{artifact}押入南下路线", "藏起了{artifact}", "让{artifact}在撤离线上连续易手"],
      villains: ["黑灯贼子", "夜行刺客", "失踪司牒"],
      stakes: ["失物一路南出城门后便再难追回", "整条追缉线被假路线彻底拖偏", "关键证物被借次序掩护押出城关"],
      subtitleTemplates: [
        "自北阙起卷，沿中轴追缉失踪的{artifact}",
        "循桥、门、坛、城一路南下，截住被押走的{artifact}"
      ],
      introTone: "你追的不是一个孤身逃犯，而是一条被提前布好的撤离路线。"
    },
    {
      id: "ritual",
      label: "祭仪秘局",
      priority: 2,
      keywords: ["祭仪", "祭祀", "仪式", "圜丘", "天坛", "社稷", "礼制"],
      caseTitles: ["逆仪", "祭契", "错序", "仪卷"],
      artifacts: ["祭册", "礼印", "遗契", "封阙印"],
      incidentTemplates: ["借{artifact}准备逆启旧仪", "盗用了{artifact}", "窜改了与{artifact}相关的祭序", "借{artifact}悄悄改换层阶与朝向"],
      villains: ["借仪行诈者", "隐身执礼人", "失序司仪"],
      stakes: ["一场不该成立的旧仪会在中轴末段被强行拼合", "祭序一旦被错置，整条轴线的礼制就会失衡", "有人试图借层阶与朝向把旧契倒向错误的终局"],
      subtitleTemplates: [
        "围绕{artifact}与祭序异动展开的中轴调查",
        "在礼制错位之前，沿中轴找回失落的{artifact}"
      ],
      introTone: "真正危险的不是刀兵，而是有人懂得如何借礼制本身完成一场逆启。"
    },
    {
      id: "legend",
      label: "夜色异闻",
      priority: 0,
      keywords: ["异闻", "奇谭", "怪谈", "传说", "月下", "夜雨", "风雪", "迷雾"],
      caseTitles: ["异闻", "夜章", "迷局", "雾契"],
      artifacts: ["残卷", "旧匣", "夜灯", "秘匣"],
      incidentTemplates: ["让{artifact}在夜色里几度易手", "借旧闻掩走了{artifact}", "让{artifact}化作一段似真似假的异闻", "把{artifact}伪装成旧闻的一部分"],
      villains: ["无名夜客", "雾中递匣人", "失踪引路者"],
      stakes: ["整条中轴的真伪记录彼此混淆", "夜色里的假线索把所有追查都引向错误终点", "旧闻被重新拼合后掩住真正的证据链"],
      subtitleTemplates: [
        "在夜色与旧闻之间追查一份失散的{artifact}",
        "顺着异闻留下的痕迹，沿中轴还原{artifact}的去向"
      ],
      introTone: "最棘手的并不是异象本身，而是它总披着一层似真似假的旧闻外衣。"
    }
  ];

  const MOOD_LIBRARY = [
    { keywords: ["夜雨", "雨", "潮", "湿"], word: "夜雨" },
    { keywords: ["风雪", "雪", "寒"], word: "风雪" },
    { keywords: ["月下", "月", "子夜"], word: "月下" },
    { keywords: ["迷雾", "雾", "烟"], word: "迷雾" },
    { keywords: ["肃杀", "冷", "寒夜"], word: "寒夜" }
  ];

  const OBJECT_HINTS = [
    { keywords: ["密牒", "密令", "牒"], value: "密牒" },
    { keywords: ["祭册", "祭仪", "祭祀"], value: "祭册" },
    { keywords: ["封印", "印"], value: "封印" },
    { keywords: ["残卷", "卷"], value: "残卷" },
    { keywords: ["匣", "木匣"], value: "木匣" },
    { keywords: ["口令", "关牒"], value: "关牒" }
  ];

  const LANDMARK_KEYWORDS = {
    zhonggulou: ["钟鼓楼", "钟楼", "鼓楼", "晨钟", "夜钟"],
    wan_ning_bridge: ["万宁桥", "桥", "桥影", "水脉"],
    jingshan: ["景山", "万春亭", "望阙", "山亭"],
    gugong: ["故宫", "宫城", "宫门", "丹阙"],
    shejitan: ["社稷坛", "社稷", "坛位"],
    taimiao: ["太庙", "宗庙", "昭穆"],
    tiananmen: ["天安门", "宫门", "门符"],
    waijinshuiqiao: ["外金水桥", "金水桥", "桥契"],
    zhengyangmen: ["正阳门", "城门", "关牒"],
    xiannongtan: ["先农坛", "耕礼", "田坛"],
    tiantan: ["天坛", "圜丘", "祭天"],
    yongdingmen: ["永定门", "封阙", "终门"]
  };

  const DEFAULT_PROFILE = THEME_PROFILES.find((profile) => profile.id === "pursuit") || THEME_PROFILES[0];
  const CHAPTER_LABELS = ["起卷", "追迹", "逼城", "拆局", "得证", "封卷", "终章"];
  const BEAT_LABELS = ["起疑", "觅迹", "逼近", "拆解", "夺证", "定局", "封阙"];

  function createSeed(text) {
    let seed = 2166136261;
    const input = String(text || "cityquest");
    for (let i = 0; i < input.length; i += 1) {
      seed ^= input.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }
    return seed >>> 0;
  }

  function createRng(seedText) {
    let seed = createSeed(seedText) || 1;
    return function random() {
      seed += 0x6D2B79F5;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickFrom(arr, rng, fallback = "") {
    if (!Array.isArray(arr) || !arr.length) return fallback;
    const random = typeof rng === "function" ? rng() : Math.random();
    return arr[Math.floor(random * arr.length)] || fallback || arr[0];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function tokenizePrompt(text) {
    return String(text || "")
      .split(/[\s,，。；;、/|]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function includesKeyword(tokens, keywords) {
    return tokens.some((token) => keywords.some((keyword) => token.includes(keyword) || keyword.includes(token)));
  }

  function scoreThemeProfile(tokens, profile) {
    return tokens.reduce((score, token) => {
      const hits = profile.keywords.filter((keyword) => token.includes(keyword) || keyword.includes(token)).length;
      return score + hits;
    }, 0);
  }

  function resolveThemeProfile(tokens, rng) {
    const scored = THEME_PROFILES
      .map((profile) => ({ profile, score: scoreThemeProfile(tokens, profile) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return Number(b.profile.priority || 0) - Number(a.profile.priority || 0);
      });
    const top = scored[0];
    if (!top || top.score <= 0) return DEFAULT_PROFILE;
    const tied = scored
      .filter((entry) => entry.score === top.score && Number(entry.profile.priority || 0) === Number(top.profile.priority || 0))
      .map((entry) => entry.profile);
    return pickFrom(tied, rng, DEFAULT_PROFILE);
  }

  function resolveMoodWord(tokens, rng) {
    for (const entry of MOOD_LIBRARY) {
      if (includesKeyword(tokens, entry.keywords)) return entry.word;
    }
    return pickFrom(["夜雨", "子夜", "风雪", "月下"], rng, "子夜");
  }

  function resolvePromptObject(tokens, profile, rng) {
    for (const entry of OBJECT_HINTS) {
      if (includesKeyword(tokens, entry.keywords)) return entry.value;
    }
    return pickFrom(profile.artifacts, rng, "密牒");
  }

  function resolveCaseTitle(tokens, profile, moodWord, rng) {
    const directToken = tokens.find((token) => token.length >= 2 && token.length <= 4 && /[\u4e00-\u9fa5]/.test(token));
    if (directToken && includesKeyword([directToken], profile.keywords)) {
      const noun = pickFrom(profile.caseTitles, rng, "疑牒");
      return `${moodWord}${noun}`;
    }
    return `${moodWord}${pickFrom(profile.caseTitles, rng, "疑牒")}`;
  }

  function resolveStoryLength(tokens) {
    let length = 5;
    if (tokens.length >= 4) length += 1;
    if (includesKeyword(tokens, ["长篇", "完整", "史诗", "多站"])) length += 1;
    if (includesKeyword(tokens, ["短篇", "轻量", "简短", "快速"])) length -= 1;
    return clamp(length, 4, 7);
  }

  function findAnchorIndices(tokens, landmarks) {
    const anchors = [];
    landmarks.forEach((landmark, index) => {
      const keywords = LANDMARK_KEYWORDS[landmark.id] || [landmark.name];
      if (includesKeyword(tokens, keywords)) anchors.push(index);
    });
    return anchors;
  }

  function pickRoutePlan(landmarks, tokens, rng) {
    const total = Array.isArray(landmarks) ? landmarks.length : 0;
    if (!total) return [];
    const desiredLength = resolveStoryLength(tokens);
    const anchors = findAnchorIndices(tokens, landmarks);

    let start = 0;
    let end = desiredLength - 1;

    if (anchors.length) {
      const minAnchor = Math.min(...anchors);
      const maxAnchor = Math.max(...anchors);
      const anchorSpan = maxAnchor - minAnchor + 1;
      const length = Math.max(desiredLength, anchorSpan);
      const extra = length - anchorSpan;
      const leftRoom = Math.floor(extra / 2);
      start = clamp(minAnchor - leftRoom, 0, Math.max(0, total - length));
      end = clamp(start + length - 1, 0, total - 1);
      start = Math.max(0, end - length + 1);
    } else {
      const maxStart = Math.max(0, total - desiredLength);
      const preferredStart = includesKeyword(tokens, ["钟鼓楼", "北城", "追缉", "夜行", "宫廷", "夜雨"])
        ? 0
        : Math.floor((typeof rng === "function" ? rng() : Math.random()) * (maxStart + 1));
      start = clamp(preferredStart, 0, maxStart);
      end = start + desiredLength - 1;
    }

    return landmarks.slice(start, end + 1).map((landmark) => landmark.id);
  }

  function buildSubtitle(profile, artifact, rng) {
    const template = pickFrom(profile.subtitleTemplates, rng, "沿中轴追查{artifact}的去向");
    return template.replace(/\{artifact\}/g, artifact);
  }

  function buildRouteSummary(routeNames, blueprint) {
    const startName = routeNames[0] || "起点";
    const endName = routeNames[routeNames.length - 1] || "终点";
    return `${blueprint.villain}趁${blueprint.moodWord}之际${blueprint.incidentLine}，并试图让${blueprint.stake}。你需自${startName}起卷，沿 ${routeNames.join(" → ")} 逐站追查，在抵达${endName}前把整卷证据重新收束。`;
  }

  function buildOpening(routeNames, blueprint) {
    const first = routeNames[0] || "北阙";
    const final = routeNames[routeNames.length - 1] || "终门";
    return `${blueprint.introTone} 今夜失踪的是“${blueprint.artifact}”，牵头之人疑为${blueprint.villain}。从${first}开始，你将顺着${routeNames.join("、")}一路南查；若不能在${final}前截住这条线，${blueprint.stake}。`;
  }

  function buildBeatText(landmark, base, index, routePlan, blueprint, getLandmarkById) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    const cluePair = Array.isArray(base.clues) && base.clues.length ? base.clues.join("、") : "本站线索";
    const beatLabel = `【${BEAT_LABELS[Math.min(index, BEAT_LABELS.length - 1)]}】`;
    if (!nextName) {
      return `${beatLabel}${landmark.name}是本卷最后一站。你已沿途收齐“${cluePair}”等关节证据，此刻必须据此压住${blueprint.artifact}背后的${blueprint.stake}，完成整卷封缄。`;
    }
    return `${beatLabel}${landmark.name}一站掌着“${cluePair}”这组关键证词，它们会把${blueprint.artifact}的真实流向再逼近一步。待此站落卷后，你须立刻转往${nextName}续查。`;
  }

  function buildStageObjective(base, landmark, blueprint) {
    const cluePair = Array.isArray(base.clues) && base.clues.length ? base.clues.join("与") : `${landmark.name}的两条线索`;
    return `借${cluePair}核明${blueprint.artifact}在${landmark.name}留下的真实断点`;
  }

  function buildStageIntro(base, landmark, blueprint, index, routePlan, getLandmarkById) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    const stageText = nextName
      ? `此站若核不清，下一步赶往${nextName}时便极可能被假迹牵走。`
      : "此处已是终局前的最后一层关口，你带来的每一份证词都将在这里被重新合卷。";
    return `${base.intro} 今卷所追的是“${blueprint.artifact}”，而${landmark.name}这一站偏偏握着最容易被${blueprint.villain}利用的一环。${stageText}`;
  }

  function buildStageReport(base, landmark, blueprint) {
    return `${base.report} 另需说明${landmark.name}这一站的证词，如何与“${blueprint.artifact}”以及${blueprint.villain}留下的手脚彼此对应。`;
  }

  function buildStageBridge(base, landmark, blueprint, index, routePlan, getLandmarkById) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    if (!nextName) {
      return `${landmark.name}的最后一块拼图已归入卷中。至此，“${blueprint.artifact}”的去向与${blueprint.villain}的布置都已明朗，你只待在终门处合卷封缄。`;
    }
    return `${landmark.name}这一站的证词已被你重新钉牢，但你也已看清，这不过是${blueprint.villain}布下的一段中继线。若想继续逼近“${blueprint.artifact}”的下落，下一站必须直取${nextName}。`;
  }

  function buildChapterTitle(base, index) {
    const label = CHAPTER_LABELS[Math.min(index, CHAPTER_LABELS.length - 1)] || `第${index + 1}折`;
    return `${base.title}·${label}`;
  }

  function buildBlueprint(tokens, rng) {
    const profile = resolveThemeProfile(tokens, rng);
    const moodWord = resolveMoodWord(tokens, rng);
    const artifact = resolvePromptObject(tokens, profile, rng);
    const incidentTemplate = pickFrom(profile.incidentTemplates, rng, "调包了{artifact}");
    const villain = pickFrom(profile.villains, rng, "黑灯贼子");
    const stake = pickFrom(profile.stakes, rng, "中轴秩序会被彻底改写");
    return {
      profile,
      moodWord,
      artifact,
      incidentLine: incidentTemplate.replace(/\{artifact\}/g, artifact),
      villain,
      stake,
      title: resolveCaseTitle(tokens, profile, moodWord, rng),
      subtitle: buildSubtitle(profile, artifact, rng),
      introTone: profile.introTone
    };
  }

  function buildGeneratedScriptFromPrompt(promptText, context) {
    const landmarks = Array.isArray(context?.landmarks) ? context.landmarks : [];
    const sceneTemplatePool = context?.sceneTemplates && typeof context.sceneTemplates === "object"
      ? context.sceneTemplates
      : {};
    const getLandmarkById = typeof context?.getLandmarkById === "function"
      ? context.getLandmarkById
      : (id) => landmarks.find((landmark) => landmark.id === id)
        || landmarks[0]
        || { id: "unknown", name: "未知地点", persona: "引路人" };

    if (!landmarks.length) return null;

    const tokens = tokenizePrompt(promptText);
    const rng = createRng(`${promptText || "cityquest"}|${landmarks.length}`);
    const blueprint = buildBlueprint(tokens, rng);
    const routePlan = pickRoutePlan(landmarks, tokens, rng);
    if (!routePlan.length) return null;

    const sceneTemplates = {};
    const beats = {};

    routePlan.forEach((landmarkId, index) => {
      const landmark = getLandmarkById(landmarkId);
      const base = sceneTemplatePool[landmarkId] || sceneTemplatePool.zhonggulou || {
        title: landmark.name,
        objective: "完成本站调查",
        intro: `你抵达了${landmark.name}。`,
        options: ["先查旧迹", "先问行人"],
        clues: [`${landmark.name}线索甲`, `${landmark.name}线索乙`],
        report: "请上呈本站调查结果。",
        unlock: "本站线索已齐，可验其地。",
        bridge: "本站线索暂明。"
      };

      sceneTemplates[landmarkId] = {
        ...base,
        title: buildChapterTitle(base, index),
        objective: buildStageObjective(base, landmark, blueprint),
        intro: buildStageIntro(base, landmark, blueprint, index, routePlan, getLandmarkById),
        options: Array.isArray(base.options) && base.options.length ? [...base.options] : ["先查旧迹", "先问行人"],
        clues: Array.isArray(base.clues) && base.clues.length ? [...base.clues] : [`${landmark.name}线索甲`, `${landmark.name}线索乙`],
        report: buildStageReport(base, landmark, blueprint),
        unlock: base.unlock || "本站线索已齐，可验其地。",
        bridge: buildStageBridge(base, landmark, blueprint, index, routePlan, getLandmarkById)
      };

      beats[landmarkId] = buildBeatText(landmark, sceneTemplates[landmarkId], index, routePlan, blueprint, getLandmarkById);
    });

    const routeNames = routePlan.map((id) => getLandmarkById(id).name);

    return {
      id: `generated_${createSeed(`${promptText}|${routePlan.join(",")}`)}`,
      name: blueprint.title,
      subtitle: blueprint.subtitle,
      summary: buildRouteSummary(routeNames, blueprint),
      opening: buildOpening(routeNames, blueprint),
      promptText: promptText || "",
      routePlan,
      sceneTemplates,
      beats,
      meta: {
        theme: blueprint.profile.id,
        artifact: blueprint.artifact,
        villain: blueprint.villain,
        mood: blueprint.moodWord
      }
    };
  }

  window.CityQuestStoryGen = {
    tokenizePrompt,
    buildGeneratedScriptFromPrompt
  };
})();
