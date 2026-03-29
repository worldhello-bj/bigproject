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

  const PROFILE_COMPANIONS = {
    suspense: ["intrigue", "legend"],
    intrigue: ["suspense", "ritual"],
    pursuit: ["suspense", "legend"],
    ritual: ["intrigue", "legend"],
    legend: ["suspense", "ritual"]
  };

  const PROFILE_SECRETS = {
    suspense: ["一份被倒写的旧档", "两段互相抵触的口供", "一条被故意抹去的交接刻记"],
    intrigue: ["一册被调位的宫门旧牒", "一段被借名挪用的礼序", "一份不该出现在内廷的错印记录"],
    pursuit: ["一条被层层换手的南下线", "一道伪装成常规通行的撤离口", "一份仍在赶往终门的押运暗记"],
    ritual: ["一场尚未成形却已被预布的逆仪", "一处被改过朝向的终局位点", "一套借层阶拼合旧契的祭序"],
    legend: ["一段借旧闻藏身的真去向", "一则被人故意放大的异闻", "一缕在夜色里反复易手的旧痕"]
  };

  const PROFILE_COVER_STORIES = {
    suspense: ["把真证混进假证链里", "让每一站只看见被处理过的表象", "借错位口供抹平真正的断点"],
    intrigue: ["借礼序之名掩护递卷", "把内廷旧例伪装成合法手续", "拿站位与仪次做一层最稳的遮盖"],
    pursuit: ["以撤离线层层换手", "在桥门之间制造错追节奏", "借通行章法掩住真正押运口"],
    ritual: ["借坛庙次第拼出一场逆仪", "把层阶与朝向改成伪契", "让旧制看起来像在自行运转"],
    legend: ["把异闻当成掩护", "让旧说替真相遮面", "用夜色里半真半假的传闻拖偏追查"]
  };

  const ROUTE_PATTERNS = [
    {
      id: "north_watch",
      label: "北阙追迹",
      profiles: ["suspense", "pursuit", "legend"],
      keywords: ["钟鼓楼", "北城", "夜行", "桥影", "望阙", "追缉"],
      sequence: ["zhonggulou", "wan_ning_bridge", "jingshan", "gugong", "tiananmen", "zhengyangmen", "yongdingmen"]
    },
    {
      id: "court_core",
      label: "宫城拆局",
      profiles: ["intrigue", "suspense"],
      keywords: ["宫廷", "故宫", "太庙", "社稷", "宫门", "内廷"],
      sequence: ["jingshan", "gugong", "shejitan", "taimiao", "tiananmen", "waijinshuiqiao", "zhengyangmen"]
    },
    {
      id: "ritual_spine",
      label: "坛庙逆仪",
      profiles: ["ritual", "intrigue", "legend"],
      keywords: ["祭仪", "礼制", "社稷", "太庙", "圜丘", "天坛"],
      sequence: ["gugong", "shejitan", "taimiao", "xiannongtan", "tiantan", "yongdingmen"]
    },
    {
      id: "shadow_run",
      label: "桥门夜缉",
      profiles: ["pursuit", "legend", "suspense"],
      keywords: ["刺客", "逃亡", "桥契", "关牒", "城门", "南下"],
      sequence: ["zhonggulou", "wan_ning_bridge", "gugong", "tiananmen", "waijinshuiqiao", "zhengyangmen", "yongdingmen"]
    },
    {
      id: "southern_lock",
      label: "南城封卷",
      profiles: ["ritual", "pursuit"],
      keywords: ["终局", "封阙", "先农坛", "天坛", "永定门"],
      sequence: ["tiananmen", "waijinshuiqiao", "zhengyangmen", "xiannongtan", "tiantan", "yongdingmen"]
    },
    {
      id: "grand_axis",
      label: "全轴长卷",
      profiles: ["pursuit", "intrigue", "ritual", "legend", "suspense"],
      keywords: ["全轴", "史诗", "长篇", "完整", "十二阙"],
      sequence: ["zhonggulou", "wan_ning_bridge", "jingshan", "gugong", "shejitan", "taimiao", "tiananmen"]
    }
  ];

  const STYLE_LABELS = {
    order: "循制",
    insight: "辨伪",
    resolve: "决断"
  };

  const PROFILE_STYLE_ROTATIONS = {
    suspense: [["insight", "order"], ["insight", "resolve"], ["order", "resolve"]],
    intrigue: [["order", "insight"], ["order", "resolve"], ["insight", "resolve"]],
    pursuit: [["resolve", "insight"], ["resolve", "order"], ["insight", "order"]],
    ritual: [["order", "resolve"], ["insight", "order"], ["resolve", "insight"]],
    legend: [["insight", "resolve"], ["resolve", "order"], ["insight", "order"]]
  };

  const STYLE_CLUE_SUFFIXES = {
    order: ["次序", "旧例", "印次", "章法"],
    insight: ["暗纹", "伪迹", "旁证", "影痕"],
    resolve: ["去向", "截点", "锁口", "押痕"]
  };

  const THEME_CLUE_SUFFIXES = {
    suspense: ["疑点", "错记", "残证", "暗码"],
    intrigue: ["礼次", "宫签", "旧档", "门印"],
    pursuit: ["脚程", "换手", "南线", "追迹"],
    ritual: ["祭序", "层位", "朝向", "契痕"],
    legend: ["异闻", "夜痕", "旧说", "雾影"]
  };

  const STYLE_OPTION_TAGS = {
    order: ["稳次序", "校旧例", "定层位"],
    insight: ["辨伪迹", "拆暗纹", "问旁证"],
    resolve: ["截去向", "逼真凶", "锁关节"]
  };

  const STYLE_RESULT_LEADS = {
    order: ["你先把章法重新钉回了原位。", "你先让本该咬合的次序重新对上。", "你先稳住了这一站最容易失序的那一环。"],
    insight: ["你先拆开了表象之下最藏人的那层伪装。", "你先把真假线索之间的裂缝看清了。", "你先从混杂口供里剥出了能立住的实证。"],
    resolve: ["你先抢回了追缉的主动。", "你先把对方来得及转手的那一步截住了。", "你先逼住了最关键的转运口。"]
  };

  const DEFAULT_PROFILE = THEME_PROFILES.find((profile) => profile.id === "pursuit") || THEME_PROFILES[0];
  const CHAPTER_LABELS = ["起卷", "追迹", "逼城", "拆局", "得证", "封卷", "终章"];
  const BEAT_LABELS = ["起疑", "觅迹", "逼近", "拆解", "夺证", "定局", "封阙"];
  const PHASE_LABELS = ["启卷", "追索", "逼近", "拆局", "夺证", "合卷", "封阙"];
  const PHASE_GOALS = ["摸清起点", "补齐去向", "压缩假线", "拆出真手脚", "夺回关键证", "合成整卷", "完成封缄"];

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

  function unique(values) {
    return Array.from(new Set((Array.isArray(values) ? values : []).filter(Boolean)));
  }

  function tokenizePrompt(text) {
    const raw = String(text || "").trim();
    if (!raw) return [];
    const seedTokens = raw
      .split(/[\s,，。；;、/|]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    const expanded = [];
    seedTokens.forEach((token) => {
      const clean = token.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
      if (clean) expanded.push(clean);
      if (/^[\u4e00-\u9fa5]{4,}$/.test(clean)) {
        for (let size = 2; size <= 4; size += 1) {
          for (let index = 0; index <= clean.length - size; index += 1) {
            expanded.push(clean.slice(index, index + size));
          }
        }
      }
    });

    return unique(expanded).slice(0, 12);
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

  function scoreThemeProfiles(tokens) {
    return THEME_PROFILES
      .map((profile) => ({ profile, score: scoreThemeProfile(tokens, profile) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return Number(b.profile.priority || 0) - Number(a.profile.priority || 0);
      });
  }

  function resolveThemeBlend(tokens, rng) {
    const scored = scoreThemeProfiles(tokens);
    const top = scored[0];
    const primary = !top || top.score <= 0 ? DEFAULT_PROFILE : top.profile;
    const secondaryFromPrompt = scored.find((entry) => entry.profile.id !== primary.id && entry.score > 0)?.profile || null;
    if (secondaryFromPrompt) return { primary, secondary: secondaryFromPrompt, scored };

    const companions = (PROFILE_COMPANIONS[primary.id] || [])
      .map((id) => THEME_PROFILES.find((profile) => profile.id === id))
      .filter(Boolean);
    const secondary = pickFrom(
      companions,
      rng,
      THEME_PROFILES.find((profile) => profile.id !== primary.id) || DEFAULT_PROFILE
    );
    return { primary, secondary, scored };
  }

  function resolveMoodWord(tokens, rng) {
    for (const entry of MOOD_LIBRARY) {
      if (includesKeyword(tokens, entry.keywords)) return entry.word;
    }
    return pickFrom(["夜雨", "子夜", "风雪", "月下"], rng, "子夜");
  }

  function resolvePromptObject(tokens, profile, secondaryProfile, rng) {
    for (const entry of OBJECT_HINTS) {
      if (includesKeyword(tokens, entry.keywords)) return entry.value;
    }
    const pool = unique([...(profile.artifacts || []), ...((secondaryProfile?.artifacts) || [])]);
    return pickFrom(pool, rng, "密牒");
  }

  function resolveCaseTitle(tokens, profile, secondaryProfile, moodWord, rng) {
    const allThemeKeywords = THEME_PROFILES.flatMap((entry) => entry.keywords || []);
    const landmarkKeywords = Object.values(LANDMARK_KEYWORDS).flat();
    const objectKeywords = OBJECT_HINTS.flatMap((entry) => entry.keywords || []);
    const routeKeywords = ROUTE_PATTERNS.flatMap((entry) => entry.keywords || []);
    const specialToken = tokens.find((token) => token.length >= 2 && token.length <= 4 && /[\u4e00-\u9fa5]/.test(token)
      && !includesKeyword([token], [
        ...allThemeKeywords,
        ...landmarkKeywords,
        ...objectKeywords,
        ...routeKeywords,
        moodWord
      ]));
    if (specialToken && !specialToken.includes(moodWord) && !moodWord.includes(specialToken)) {
      return `${moodWord}${specialToken}卷`;
    }
    const nouns = unique([...(profile.caseTitles || []), ...((secondaryProfile?.caseTitles) || [])]);
    return `${moodWord}${pickFrom(nouns, rng, "疑牒")}`;
  }

  function resolveStoryLength(tokens) {
    let length = 5;
    if (tokens.length >= 4) length += 1;
    if (includesKeyword(tokens, ["长篇", "完整", "史诗", "多站", "全轴"])) length += 1;
    if (includesKeyword(tokens, ["短篇", "轻量", "简短", "快速"])) length -= 1;
    return clamp(length, 4, 7);
  }

  function findAnchorIds(tokens, landmarks) {
    const anchors = [];
    landmarks.forEach((landmark) => {
      const keywords = LANDMARK_KEYWORDS[landmark.id] || [landmark.name];
      if (includesKeyword(tokens, keywords)) anchors.push(landmark.id);
    });
    return unique(anchors);
  }

  function scoreRoutePattern(pattern, anchorIds, blueprint, tokens) {
    let score = 0;
    if (pattern.profiles.includes(blueprint.profile.id)) score += 5;
    if (blueprint.secondaryProfile && pattern.profiles.includes(blueprint.secondaryProfile.id)) score += 3;
    pattern.keywords.forEach((keyword) => {
      if (includesKeyword(tokens, [keyword])) score += 1;
    });
    const anchorHits = anchorIds.filter((id) => pattern.sequence.includes(id)).length;
    score += anchorHits * 3;
    if (anchorIds.length && !anchorHits) score -= 4;
    if (pattern.id === "grand_axis" && includesKeyword(tokens, ["全轴", "史诗", "长篇", "完整"])) score += 4;
    if (pattern.id === "southern_lock" && includesKeyword(tokens, ["终局", "封阙", "天坛", "永定门"])) score += 3;
    if (pattern.id === "court_core" && includesKeyword(tokens, ["宫廷", "内廷", "礼制"])) score += 2;
    if (pattern.id === "shadow_run" && includesKeyword(tokens, ["追缉", "刺客", "潜逃", "夜行"])) score += 2;
    return score;
  }

  function resolveRoutePattern(tokens, anchorIds, blueprint, rng) {
    const scored = ROUTE_PATTERNS
      .map((pattern) => ({ pattern, score: scoreRoutePattern(pattern, anchorIds, blueprint, tokens) }))
      .sort((a, b) => b.score - a.score);
    const top = scored[0];
    if (!top || top.score < 0) return null;
    const tied = scored.filter((entry) => entry.score === top.score).map((entry) => entry.pattern);
    return pickFrom(tied, rng, top.pattern);
  }

  function fitRouteToLength(sequence, desiredLength, anchorIds, tokens, blueprint, rng) {
    const cleanSequence = unique(sequence);
    if (!cleanSequence.length) return [];
    if (desiredLength >= cleanSequence.length) return cleanSequence;

    const anchorPositions = anchorIds
      .map((id) => cleanSequence.indexOf(id))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b);

    let start = 0;
    const length = Math.min(desiredLength, cleanSequence.length);

    if (anchorPositions.length) {
      const minAnchor = anchorPositions[0];
      const maxAnchor = anchorPositions[anchorPositions.length - 1];
      const anchorSpan = maxAnchor - minAnchor + 1;
      const fittedLength = Math.max(length, anchorSpan);
      const extra = fittedLength - anchorSpan;
      start = clamp(minAnchor - Math.floor(extra / 2), 0, Math.max(0, cleanSequence.length - fittedLength));
      return cleanSequence.slice(start, start + fittedLength);
    }

    const maxStart = Math.max(0, cleanSequence.length - length);
    let preferredStart = 0;
    if (includesKeyword(tokens, ["终局", "封阙", "南城", "永定门", "圜丘"])) {
      preferredStart = maxStart;
    } else if (blueprint.profile.id === "intrigue") {
      preferredStart = Math.floor(maxStart / 2);
    } else if (blueprint.profile.id === "ritual") {
      preferredStart = Math.max(0, maxStart - 1);
    } else if (blueprint.profile.id === "legend" && maxStart > 0) {
      preferredStart = Math.floor((typeof rng === "function" ? rng() : Math.random()) * (maxStart + 1));
    }

    start = clamp(preferredStart, 0, maxStart);
    return cleanSequence.slice(start, start + length);
  }

  function pickRoutePlan(landmarks, tokens, blueprint, rng) {
    if (!Array.isArray(landmarks) || !landmarks.length) return { routePlan: [], pattern: null };
    const desiredLength = resolveStoryLength(tokens);
    const anchorIds = findAnchorIds(tokens, landmarks);
    const fallbackSequence = landmarks.map((landmark) => landmark.id);
    const pattern = resolveRoutePattern(tokens, anchorIds, blueprint, rng);
    const sequence = pattern?.sequence?.length ? pattern.sequence : fallbackSequence;
    const routePlan = fitRouteToLength(sequence, desiredLength, anchorIds, tokens, blueprint, rng);
    return {
      routePlan: routePlan.length ? routePlan : fallbackSequence.slice(0, desiredLength),
      pattern
    };
  }

  function buildBlendLine(blueprint) {
    if (!blueprint.secondaryProfile || blueprint.secondaryProfile.id === blueprint.profile.id) {
      return `本卷以${blueprint.profile.label}为骨。`;
    }
    return `本卷以${blueprint.profile.label}为骨，兼带${blueprint.secondaryProfile.label}气息。`;
  }

  function buildSubtitle(profile, secondaryProfile, artifact, rng) {
    const templates = unique([...(profile.subtitleTemplates || []), ...((secondaryProfile?.subtitleTemplates) || [])]);
    const template = pickFrom(templates, rng, "沿中轴追查{artifact}的去向");
    const subtitle = template.replace(/\{artifact\}/g, artifact);
    if (!secondaryProfile || secondaryProfile.id === profile.id) return subtitle;
    return `${subtitle}，暗伏${secondaryProfile.label}之影`;
  }

  function buildRouteSummary(routeNames, blueprint, routePattern) {
    const startName = routeNames[0] || "起点";
    const endName = routeNames[routeNames.length - 1] || "终点";
    const patternLabel = routePattern?.label || "中轴追查";
    const blendLine = buildBlendLine(blueprint).replace(/。$/, "");
    return `${blueprint.villain}趁${blueprint.moodWord}之际${blueprint.incidentLine}，又试图${blueprint.coverStory}，让${blueprint.stake}。${blendLine}，这是一卷偏“${patternLabel}”的行进式调查。你需自${startName}起卷，沿 ${routeNames.join(" → ")} 逐站钉证，在抵达${endName}前拆明${blueprint.secret}背后真正的手脚。`;
  }

  function buildOpening(routeNames, blueprint, routePattern) {
    const first = routeNames[0] || "北阙";
    const final = routeNames[routeNames.length - 1] || "终门";
    const patternLabel = routePattern?.label || "中轴追查";
    return `${blueprint.introTone} 今夜失踪的是“${blueprint.artifact}”，牵头之人疑为${blueprint.villain}。表面看去，这不过是一宗${patternLabel}式的追查；可真正在卷底浮出的，却是${blueprint.secret}与一层“${blueprint.coverStory}”的旧皮。你将自${first}起卷，顺着${routeNames.join("、")}一路逼近；若不能在${final}前合住整卷，${blueprint.stake}。`;
  }

  function resolveChoiceStyles(blueprint, index) {
    const primaryRotation = PROFILE_STYLE_ROTATIONS[blueprint.profile.id] || PROFILE_STYLE_ROTATIONS.suspense;
    const secondaryRotation = PROFILE_STYLE_ROTATIONS[blueprint.secondaryProfile?.id || blueprint.profile.id] || primaryRotation;
    const pairA = primaryRotation[index % primaryRotation.length];
    const pairB = secondaryRotation[(index + 1) % secondaryRotation.length];
    const c1 = pairA[0];
    let c2 = pairB[1];
    if (!c2 || c1 === c2) {
      c2 = pairA[1] !== c1
        ? pairA[1]
        : ["order", "insight", "resolve"].find((item) => item !== c1) || "insight";
    }
    return { c1, c2 };
  }

  function decorateClue(baseClue, profileId, style, rng) {
    const raw = String(baseClue || "").replace(/[「」]/g, "").trim();
    const suffixPool = unique([
      ...(THEME_CLUE_SUFFIXES[profileId] || []),
      ...(STYLE_CLUE_SUFFIXES[style] || [])
    ]);
    const suffix = pickFrom(suffixPool, rng, "");
    if (!raw || !suffix || raw.includes("·")) return raw || suffix;
    return `${raw}·${suffix}`;
  }

  function buildGeneratedClues(base, blueprint, choiceStyles, rng) {
    const seedClues = Array.isArray(base.clues) && base.clues.length
      ? base.clues.slice(0, 2)
      : [`${blueprint.artifact}线索甲`, `${blueprint.artifact}线索乙`];
    while (seedClues.length < 2) seedClues.push(`${blueprint.artifact}线索${seedClues.length + 1}`);
    return [
      decorateClue(seedClues[0], blueprint.profile.id, choiceStyles.c1, rng),
      decorateClue(seedClues[1], blueprint.secondaryProfile?.id || blueprint.profile.id, choiceStyles.c2, rng)
    ];
  }

  function decorateOption(baseOption, style, rng) {
    const raw = String(baseOption || "").replace(/[。！？]/g, "").trim();
    const suffix = pickFrom(STYLE_OPTION_TAGS[style] || [], rng, "");
    if (!raw) return suffix ? `核查线索·${suffix}` : "核查线索";
    if (!suffix || raw.includes("·")) return raw;
    return `${raw}·${suffix}`;
  }

  function buildGeneratedOptions(base, choiceStyles, rng) {
    const seedOptions = Array.isArray(base.options) && base.options.length
      ? base.options.slice(0, 2)
      : ["先查旧迹", "先问行人"];
    while (seedOptions.length < 2) seedOptions.push(seedOptions[0] || "先查旧迹");
    return [
      decorateOption(seedOptions[0], choiceStyles.c1, rng),
      decorateOption(seedOptions[1], choiceStyles.c2, rng)
    ];
  }

  function buildPhaseLabel(index) {
    return PHASE_LABELS[Math.min(index, PHASE_LABELS.length - 1)] || `第${index + 1}站`;
  }

  function buildPhaseGoal(index) {
    return PHASE_GOALS[Math.min(index, PHASE_GOALS.length - 1)] || "补齐关键证";
  }

  function buildBeatText(landmark, scene, index, routePlan, blueprint, getLandmarkById) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    const cluePair = Array.isArray(scene.clues) && scene.clues.length ? scene.clues.join("、") : "本站线索";
    const beatLabel = `【${BEAT_LABELS[Math.min(index, BEAT_LABELS.length - 1)]}】`;
    if (!nextName) {
      return `${beatLabel}${landmark.name}已是本卷最后一层关口。你沿途收束的“${cluePair}”终于把${blueprint.secret}与“${blueprint.artifact}”钉到同一张卷面上，此刻只差终门一封，便能压住${blueprint.stake}。`;
    }
    return `${beatLabel}${landmark.name}掌着“${cluePair}”这组关键证词，它们会把${blueprint.secret}继续逼向明处。待此站落卷后，你须立刻转往${nextName}，免得${blueprint.villain}借下一站再覆一层假皮。`;
  }

  function buildStageObjective(landmark, blueprint, clues, index) {
    return `在${landmark.name}补齐「${clues[0]}」与「${clues[1]}」，${buildPhaseGoal(index)}，锁定${blueprint.artifact}的真实断点`;
  }

  function buildStageIntro(base, landmark, blueprint, index, routePlan, getLandmarkById) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    const blendHint = blueprint.secondaryProfile && blueprint.secondaryProfile.id !== blueprint.profile.id
      ? `这卷虽以${blueprint.profile.label}为主，却始终带着${blueprint.secondaryProfile.label}的阴影。`
      : `这一站延续着${blueprint.profile.label}的压迫感。`;
    const pressure = nextName
      ? `若此站核不清，通往${nextName}的证链就会被对方继续改写。`
      : "此处已是终局前最后一层缝口，你带来的每一份证词都将在这里被重新合卷。";
    return `【${buildPhaseLabel(index)}】${base.intro} ${blendHint}${landmark.name}这一站牵着${blueprint.secret}，而${blueprint.villain}正试图${blueprint.coverStory}。${pressure}`;
  }

  function buildStageReport(base, landmark, blueprint, clues) {
    return `${base.report} 此次上呈需特别说明「${clues[0]}」与「${clues[1]}」如何彼此互证，以及它们如何揭开${landmark.name}这一站所藏的${blueprint.secret}。`;
  }

  function buildStageBridge(landmark, blueprint, index, routePlan, getLandmarkById, routePattern) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    if (!nextName) {
      return `${landmark.name}这一站的两条证脉都已归卷，“${blueprint.artifact}”、${blueprint.secret}与${blueprint.villain}的去向终于并到一处。剩下的，只是把整夜散乱的桥、门、坛、殿、城当场封缄。`;
    }
    const patternLabel = routePattern?.label || "中轴线";
    return `${landmark.name}这一站的证脉已被你重新钉牢，${blueprint.villain}借以遮面的“${blueprint.coverStory}”也被拆去一层。下一步必须直趋${nextName}，继续沿${patternLabel}把“${blueprint.artifact}”从暗处逼出来。`;
  }

  function buildChoiceResult(landmark, clue, style, blueprint, index, routePlan, getLandmarkById, rng) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    const lead = pickFrom(STYLE_RESULT_LEADS[style] || [], rng, "你先抓住了这一站的要害。");
    const closing = nextName
      ? pickFrom([
        `这也让通往${nextName}的下一段证链更清楚了。`,
        `原本会在${nextName}被继续利用的那道缝，先一步被你照了出来。`,
        `你由此抢到了转往${nextName}之前最关键的半步。`
      ], rng, `这也让通往${nextName}的下一段证链更清楚了。`)
      : pickFrom([
        "终卷所需的最后一证因此归位。",
        "整夜散乱的线头终于在这里并拢。",
        "封阙前最后一层伪装也被你拆开了。"
      ], rng, "终卷所需的最后一证因此归位。");
    return `${lead} 你先从「${clue}」下手，${landmark.name}这一站最适合被${blueprint.villain}利用的缝隙因此露了出来。${closing}`;
  }

  function buildRouteNote(landmark, clues, index, routePlan, getLandmarkById) {
    const nextId = routePlan[index + 1] || "";
    const nextName = nextId ? getLandmarkById(nextId)?.name || nextId : "";
    return `${buildPhaseLabel(index)}：补齐${clues.join("、")}${nextName ? `，续压${nextName}` : "，准备终卷封缄"}`;
  }

  function buildChapterTitle(base, index) {
    const label = CHAPTER_LABELS[Math.min(index, CHAPTER_LABELS.length - 1)] || `第${index + 1}折`;
    return `${base.title}·${label}`;
  }

  function buildBlueprint(tokens, rng) {
    const themeBlend = resolveThemeBlend(tokens, rng);
    const profile = themeBlend.primary;
    const secondaryProfile = themeBlend.secondary;
    const moodWord = resolveMoodWord(tokens, rng);
    const artifact = resolvePromptObject(tokens, profile, secondaryProfile, rng);
    const incidentTemplate = pickFrom(
      unique([...(profile.incidentTemplates || []), ...((secondaryProfile?.incidentTemplates) || [])]),
      rng,
      "调包了{artifact}"
    );
    const villain = pickFrom(
      unique([...(profile.villains || []), ...((secondaryProfile?.villains) || [])]),
      rng,
      "黑灯贼子"
    );
    const stake = pickFrom(
      unique([...(profile.stakes || []), ...((secondaryProfile?.stakes) || [])]),
      rng,
      "中轴秩序会被彻底改写"
    );
    const secret = pickFrom(
      unique([...(PROFILE_SECRETS[profile.id] || []), ...((PROFILE_SECRETS[secondaryProfile?.id] || []).slice(0, 2))]),
      rng,
      "一条被改写的交接记号"
    );
    const coverStory = pickFrom(
      unique([...(PROFILE_COVER_STORIES[profile.id] || []), ...((PROFILE_COVER_STORIES[secondaryProfile?.id] || []).slice(0, 2))]),
      rng,
      "把真证藏进假线索里"
    );
    return {
      profile,
      secondaryProfile,
      moodWord,
      artifact,
      incidentLine: incidentTemplate.replace(/\{artifact\}/g, artifact),
      villain,
      stake,
      secret,
      coverStory,
      title: resolveCaseTitle(tokens, profile, secondaryProfile, moodWord, rng),
      subtitle: buildSubtitle(profile, secondaryProfile, artifact, rng),
      introTone: profile.introTone,
      blendLine: buildBlendLine({ profile, secondaryProfile })
    };
  }

  function buildGeneratedScriptFromPrompt(promptText, context) {
    const normalizedPrompt = String(promptText || "").trim();
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
    if (!normalizedPrompt) return null;

    const tokens = tokenizePrompt(normalizedPrompt);
    const rng = createRng(`${normalizedPrompt}|${landmarks.length}`);
    const blueprint = buildBlueprint(tokens, rng);
    const routeSelection = pickRoutePlan(landmarks, tokens, blueprint, rng);
    const routePlan = routeSelection.routePlan;
    const routePattern = routeSelection.pattern;
    if (!routePlan.length) return null;

    const sceneTemplates = {};
    const beats = {};
    const routeNotes = {};

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

      const choiceStyles = resolveChoiceStyles(blueprint, index);
      const clues = buildGeneratedClues(base, blueprint, choiceStyles, rng);
      const options = buildGeneratedOptions(base, choiceStyles, rng);
      const routeNote = buildRouteNote(landmark, clues, index, routePlan, getLandmarkById);

      sceneTemplates[landmarkId] = {
        ...base,
        title: buildChapterTitle(base, index),
        objective: buildStageObjective(landmark, blueprint, clues, index),
        intro: buildStageIntro(base, landmark, blueprint, index, routePlan, getLandmarkById),
        options,
        clues,
        report: buildStageReport(base, landmark, blueprint, clues),
        unlock: base.unlock || "本站线索已齐，可验其地。",
        bridge: buildStageBridge(landmark, blueprint, index, routePlan, getLandmarkById, routePattern),
        routeNote,
        choiceStyles,
        choiceResults: {
          c1: buildChoiceResult(landmark, clues[0], choiceStyles.c1, blueprint, index, routePlan, getLandmarkById, rng),
          c2: buildChoiceResult(landmark, clues[1], choiceStyles.c2, blueprint, index, routePlan, getLandmarkById, rng)
        }
      };

      routeNotes[landmarkId] = routeNote;
      beats[landmarkId] = buildBeatText(landmark, sceneTemplates[landmarkId], index, routePlan, blueprint, getLandmarkById);
    });

    const routeNames = routePlan.map((id) => getLandmarkById(id).name);

    return {
      id: `generated_${createSeed(`${normalizedPrompt}|${routePlan.join(",")}`)}`,
      name: blueprint.title,
      subtitle: blueprint.subtitle,
      summary: buildRouteSummary(routeNames, blueprint, routePattern),
      opening: buildOpening(routeNames, blueprint, routePattern),
      promptText: normalizedPrompt,
      routePlan,
      routeNotes,
      sceneTemplates,
      beats,
      meta: {
        theme: blueprint.profile.id,
        secondaryTheme: blueprint.secondaryProfile?.id || "",
        artifact: blueprint.artifact,
        villain: blueprint.villain,
        mood: blueprint.moodWord,
        secret: blueprint.secret,
        blendLine: blueprint.blendLine,
        routePatternId: routePattern?.id || "default",
        routePatternLabel: routePattern?.label || "中轴追查"
      }
    };
  }

  window.CityQuestStoryGen = {
    tokenizePrompt,
    buildGeneratedScriptFromPrompt
  };
})();
