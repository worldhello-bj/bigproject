(function () {
    function createCityQuestPageViews(ctx) {
    const {
      state,
      el,
      SCRIPTS,
      LANDMARKS,
      FEED,
      homeMapConfig,
      getExpectedLandmarkId,
      getLandmarkById,
      getScriptById,
      updateStartupHero,
      hasActiveStorySession,
      hasFinishedStorySession,
      showPromptDialog,
      openChat,
      saveAssets,
      getDefaultAssets
    } = ctx;

    const pointLandmarkMap = {
      钟鼓楼: "zhonggulou",
      万宁桥: "wan_ning_bridge",
      景山: "jingshan",
      故宫: "gugong",
      社稷坛: "shejitan",
      太庙: "taimiao",
      天安门: "tiananmen",
      外金水桥: "waijinshuiqiao",
      正阳门: "zhengyangmen",
      先农坛: "xiannongtan",
      天坛: "tiantan",
      永定门: "yongdingmen"
    };
    const forumCoverImages = [
      "./素材/社区图/微信图片_20260329023420_453_131.jpg",
      "./素材/社区图/微信图片_20260329023422_454_131.jpg",
      "./素材/社区图/微信图片_20260329023424_456_131.jpg",
      "./素材/社区图/微信图片_20260329023426_457_131.jpg",
      "./素材/社区图/微信图片_20260329023430_458_131.jpg"
    ];
    const shopProductImages = [
      "./素材/周边/微信图片_20260329094347_479_131.jpg",
      "./素材/周边/微信图片_20260329094349_480_131.jpg",
      "./素材/周边/微信图片_20260329094350_481_131.jpg",
      "./素材/周边/微信图片_20260329094352_482_131.jpg"
    ];
    let communityView = "forum";
    let scriptFeedbackTimer = 0;
    let activeScriptFilter = "";

    function showScriptLibraryFeedback(message) {
      const node = document.getElementById("script-library-feedback");
      if (!node) return;
      node.textContent = message;
      node.classList.remove("hidden");
      node.classList.add("show");
      window.clearTimeout(scriptFeedbackTimer);
      scriptFeedbackTimer = window.setTimeout(() => {
        node.classList.remove("show");
        node.classList.add("hidden");
      }, 1800);
    }

    function resolvePointLandmarkId(pointName) {
      return pointLandmarkMap[pointName] || "";
    }

    function getPointPosition(point) {
      const baseWidth = Number(homeMapConfig?.width || 390);
      const baseHeight = Number(homeMapConfig?.height || 844);
      const x = Number(point?.x || 0);
      const y = Number(point?.y || 0);
      const origin = String(homeMapConfig?.origin || "bottom-left");

      const left = Math.max(0, Math.min(100, (x / baseWidth) * 100));
      const normalizedTop = origin === "bottom-left"
        ? (1 - y / baseHeight)
        : (y / baseHeight);
      const top = Math.max(0, Math.min(100, normalizedTop * 100));
      return { left, top };
    }

    function renderHomeMap(nextId) {
      const mapNode = el.homeMap || document.getElementById("home-map");
      if (!mapNode) return;
      const autoRouteMode = Boolean(
        state.session.generatedScript
        && Array.isArray(state.session.routePlan)
        && state.session.routePlan.length
      );
      const finishedStory = typeof hasFinishedStorySession === "function" && hasFinishedStorySession();

      const mapImage = homeMapConfig?.image || "./素材/主地图.png";
      mapNode.innerHTML = "";

      const baseWidth = Number(homeMapConfig?.width || 390);
      const baseHeight = Number(homeMapConfig?.height || 844);
      const rect = mapNode.getBoundingClientRect();
      const containerWidth = rect.width || mapNode.clientWidth || baseWidth;
      const containerHeight = rect.height || mapNode.clientHeight || baseHeight;
      const scale = Math.min(containerWidth / baseWidth, containerHeight / baseHeight);
      const stageWidth = Math.max(1, Math.round(baseWidth * scale));
      const stageHeight = Math.max(1, Math.round(baseHeight * scale));

      const stage = document.createElement("div");
      stage.className = "axis-map-stage";
      stage.style.width = `${stageWidth}px`;
      stage.style.height = `${stageHeight}px`;
      stage.style.backgroundImage = `url("${mapImage}")`;
      mapNode.appendChild(stage);

      if (autoRouteMode) return;

      const points = Array.isArray(homeMapConfig?.points) ? homeMapConfig.points : [];

      points.forEach((point) => {
        const pointName = String(point.name || "点位");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "axis-point";
        button.title = pointName;
        button.setAttribute("aria-label", pointName);
        if (pointName.length >= 4) button.classList.add("wide");

        const hitWidth = Number(point?.w || (pointName.length >= 4 ? 92 : 74));
        const hitHeight = Number(point?.h || 32);
        button.style.width = `${hitWidth}px`;
        button.style.height = `${hitHeight}px`;

        const linkedLandmarkId = resolvePointLandmarkId(pointName);
        if (!linkedLandmarkId) button.classList.add("disabled");
        if (finishedStory) button.classList.add("disabled");

        const pos = getPointPosition(point);
        button.style.left = `${pos.left}%`;
        button.style.top = `${pos.top}%`;

        button.addEventListener("click", () => {
          if (!linkedLandmarkId) {
            if (typeof showPromptDialog === "function") {
              showPromptDialog("该点位剧情暂未开放。", "提示");
            }
            return;
          }
          if (finishedStory) {
            if (typeof showPromptDialog === "function") {
              showPromptDialog("本卷已封卷，请从结局页“再启新卷”或返回起始页重新开始。", "主线已结束");
            }
            return;
          }
          const currentLandmarkId = getExpectedLandmarkId() || linkedLandmarkId;
          openChat(currentLandmarkId, "线性推进");
        });

        stage.appendChild(button);
      });
    }

    function renderHome() {
      const nextId = getExpectedLandmarkId();
      const autoRouteMode = Boolean(
        state.session.generatedScript
        && Array.isArray(state.session.routePlan)
        && state.session.routePlan.length
      );
      const hasActiveStory = typeof hasActiveStorySession === "function" ? hasActiveStorySession() : Boolean(
        state.session.landmarkId
        || state.session.story
        || state.session.history?.length
        || state.session.completed?.length
        || state.session.generatedScript
        || state.session.scriptIntroSeen
      );
      const finishedStory = typeof hasFinishedStorySession === "function" && hasFinishedStorySession();
      if (el.homeScriptText) {
        const nextName = nextId ? getLandmarkById(nextId).name : "主线已封卷（可重置再游）";
        const currentScriptName = state.session.generatedScript?.name || getScriptById(state.selectedScriptId).name;
        if (finishedStory) {
          el.homeScriptText.textContent = `《${currentScriptName}》已封卷。本轮旅程已经收束，可从结局页“再启新卷”，或返回“进入中轴世界”重新开始。`;
        } else {
          el.homeScriptText.textContent = autoRouteMode
            ? `AI剧本路线已生成：优先前往“${nextName}”继续主线。`
            : `主线将沿中轴逐阙推进，点击当前地名即可进入剧情；完成对话、到达判定与拍照后解锁下一站“${nextName}”。`;
        }
      }
      if (el.btnAbortHomeScript) {
        el.btnAbortHomeScript.classList.toggle("hidden", !hasActiveStory || finishedStory);
      }

      updateStartupHero(state.activeTab || "home");

      renderHomeMap(nextId);
    }

    function renderCommunity() {
      if (!el.communityFeed) return;
      el.communityFeed.innerHTML = "";

      const tabs = document.createElement("div");
      tabs.className = "community-switchbar";

      [
        { id: "forum", label: "论坛" },
        { id: "shop", label: "商城" }
      ].forEach((tab) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `community-switch${communityView === tab.id ? " active" : ""}`;
        button.textContent = tab.label;
        button.addEventListener("click", () => {
          communityView = tab.id;
          renderCommunity();
        });
        tabs.appendChild(button);
      });

      el.communityFeed.appendChild(tabs);

      if (communityView === "forum") {
        const subhead = document.createElement("div");
        subhead.className = "community-subhead";
        subhead.innerHTML = `
          <div>
            <div class="community-subtitle">论坛广场</div>
            <div class="community-subdesc">以小红书形式展示探店、打卡、路线心得与剧情讨论。</div>
          </div>
          <button type="button" class="community-pill">最新发布</button>
        `;
        el.communityFeed.appendChild(subhead);

        const feedGrid = document.createElement("div");
        feedGrid.className = "forum-grid";

        const forumCards = [
          {
            author: "阿阙不睡觉",
            title: "夜走钟鼓楼到景山，沉浸感真的拉满",
            text: "官方剧本从第一站开始就很稳，建议一定开声音玩，钟鼓楼那段代入感特别强。",
            likes: 312,
            saves: 88,
            cover: "teal"
          },
          {
            author: "小满的中轴手账",
            title: "我把 12 站线索整理成了手帐版路线图",
            text: "适合二刷时快速回忆路线分支，尤其是故宫到社稷坛那段很容易记混。",
            likes: 246,
            saves: 104,
            cover: "paper"
          },
          {
            author: "CityWalker",
            title: "AI 剧本居然刷出了天坛压轴，节奏很像追缉片",
            text: "随机路线体验比我预期好很多，适合做轻量 demo 展示。",
            likes: 168,
            saves: 42,
            cover: "gold"
          },
          {
            author: "旧城北",
            title: "打卡框如果换成不同节气主题会更绝",
            text: "现在的故宫和天坛打卡图已经不错了，后面可以继续扩充活动皮肤。",
            likes: 129,
            saves: 51,
            cover: "red"
          },
          ...FEED.map((post, idx) => ({
            author: post.user,
            title: idx === 0 ? "一次跑通十二阙是什么体验" : idx === 1 ? "续行功能非常适合中断后继续" : "想看支线与隐藏成就的讨论帖",
            text: post.content,
            likes: post.likes,
            saves: Math.max(8, Math.round(post.likes * 0.3)),
            cover: idx % 2 === 0 ? "ink" : "olive"
          }))
        ];

        forumCards.forEach((card, idx) => {
          const coverImage = forumCoverImages[idx % forumCoverImages.length] || "";
          const node = document.createElement("article");
          node.className = "forum-note";
          node.innerHTML = `
            <div class="forum-cover" data-cover="${card.cover}">
              ${coverImage ? `<img class="forum-cover-image" src="${coverImage}" alt="" />` : ""}
            </div>
            <div class="forum-note-body">
              <h3 class="forum-note-title">${card.title}</h3>
              <p class="forum-note-text">${card.text}</p>
              <div class="forum-note-meta">
                <span class="forum-note-author">${card.author}</span>
                <span>❤ ${card.likes}</span>
                <span>☆ ${card.saves}</span>
              </div>
            </div>
          `;
          feedGrid.appendChild(node);
        });

        el.communityFeed.appendChild(feedGrid);
        return;
      }

      const subhead = document.createElement("div");
      subhead.className = "community-subhead";
      subhead.innerHTML = `
        <div>
          <div class="community-subtitle">文旅商城</div>
          <div class="community-subdesc">普通商城演示，展示联名周边、票券和主题礼包。</div>
        </div>
        <button type="button" class="community-pill">综合推荐</button>
      `;
      el.communityFeed.appendChild(subhead);

      const banner = document.createElement("div");
      banner.className = "shop-banner";
      banner.innerHTML = `
        <div class="shop-banner-copy">
          <p class="shop-banner-tag">限时主题活动</p>
          <h3>中轴夜游联名季</h3>
          <p>满 199 减 30，文游礼包、纪念票根、场景明信片同步上新。</p>
        </div>
      `;
      el.communityFeed.appendChild(banner);

      const categories = document.createElement("div");
      categories.className = "shop-categories";
      ["热门周边", "票券礼包", "打卡道具", "主题香包"].forEach((label) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "shop-category";
        chip.textContent = label;
        categories.appendChild(chip);
      });
      el.communityFeed.appendChild(categories);

      const productGrid = document.createElement("div");
      productGrid.className = "shop-grid";

      const products = [
        { name: "中轴夜游礼盒", price: "￥168", desc: "含卷轴地图、封签贴纸、剧情票根", badge: "热卖", cover: "gift", image: shopProductImages[0] },
        { name: "十二阙通关票夹", price: "￥49", desc: "仿古票夹设计，适合配合打卡图收藏", badge: "新品", cover: "ticket", image: shopProductImages[1] },
        { name: "故宫夜色明信片组", price: "￥36", desc: "6 张套装，做旧烫金工艺", badge: "推荐", cover: "postcard", image: shopProductImages[2] },
        { name: "天坛祈年香包", price: "￥59", desc: "草木香调，节日限定包装", badge: "限定", cover: "sachet", image: shopProductImages[3] }
      ];

      products.forEach((product) => {
        const node = document.createElement("article");
        node.className = "shop-card";
        node.innerHTML = `
          <div class="shop-card-cover" data-cover="${product.cover}">
            ${product.image ? `<img class="shop-card-cover-image" src="${product.image}" alt="${product.name}" loading="lazy" />` : ""}
            <span class="shop-card-badge">${product.badge}</span>
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${product.name}</h3>
            <p class="shop-card-desc">${product.desc}</p>
            <div class="shop-card-foot">
              <span class="shop-card-price">${product.price}</span>
              <button type="button" class="shop-buy-btn">立即查看</button>
            </div>
          </div>
        `;
        productGrid.appendChild(node);
      });

      el.communityFeed.appendChild(productGrid);
    }

    function renderScriptLibrary() {
      if (!el.scriptList) return;
      el.scriptList.innerHTML = "";
      const activeId = state.selectedScriptId;
      const primary = SCRIPTS[0];
      const filterButtons = Array.from(document.querySelectorAll(".script-filter-chip"));
      const showcaseScripts = [
        {
          id: primary.id,
          name: primary.name,
          subtitle: primary.subtitle,
          difficulty: "困难",
          players: "7人",
          score: "4.8",
          accent: "moon",
          palette: "teal",
          available: true,
          tags: ["代入感", "硬核推理", "卷轴叙事"],
          summary: primary.summary
        },
        {
          id: `${primary.id}_night`,
          name: "大唐幻夜",
          subtitle: "一夜宫阙追缉",
          difficulty: "困难",
          players: "7人",
          score: "4.8",
          accent: "tower",
          palette: "umber",
          available: false,
          tags: ["硬核推理", "卷轴叙事"],
          summary: "待开放推荐剧本"
        },
        {
          id: `${primary.id}_sorrow`,
          name: "古风悲歌",
          subtitle: "长风卷雪断人间",
          difficulty: "困难",
          players: "7人",
          score: "4.8",
          accent: "plum",
          palette: "ivory",
          available: false,
          tags: ["古风悲歌", "卷轴叙事"],
          summary: "待开放推荐剧本"
        },
        {
          id: `${primary.id}_qin`,
          name: "春梳生绛",
          subtitle: "旧梦入画卷",
          difficulty: "困难",
          players: "7人",
          score: "4.8",
          accent: "lady",
          palette: "olive",
          available: false,
          tags: ["古风悲歌", "代入感"],
          summary: "待开放推荐剧本"
        },
        {
          id: `${primary.id}_fan`,
          name: "大唐幻夜",
          subtitle: "执扇问心",
          difficulty: "困难",
          players: "7人",
          score: "4.8",
          accent: "fan",
          palette: "sand",
          available: false,
          tags: ["代入感", "卷轴叙事"],
          summary: "待开放推荐剧本"
        },
        {
          id: `${primary.id}_red`,
          name: "大唐幻夜",
          subtitle: "深门绛影",
          difficulty: "困难",
          players: "7人",
          score: "4.8",
          accent: "door",
          palette: "red",
          available: false,
          tags: ["硬核推理", "古风悲歌"],
          summary: "待开放推荐剧本"
        }
      ];

      filterButtons.forEach((button) => {
        const label = String(button.textContent || "").trim();
        const isActive = label === activeScriptFilter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (button.dataset.bound === "true") return;
        button.dataset.bound = "true";
        button.addEventListener("click", () => {
          activeScriptFilter = activeScriptFilter === label ? "" : (label || "");
          renderScriptLibrary();
          showScriptLibraryFeedback(activeScriptFilter
            ? `已切换到“${activeScriptFilter}”筛选。`
            : "已恢复全选剧本。");
        });
      });

      const visibleScripts = showcaseScripts.filter((item) => {
        const tags = Array.isArray(item.tags) ? item.tags : [];
        return !activeScriptFilter || tags.includes(activeScriptFilter);
      });

      visibleScripts.forEach((item) => {
        const isActive = item.available && activeId === primary.id;
        const card = document.createElement("button");
        card.type = "button";
        card.className = `script-card${isActive ? " active" : ""}${item.available ? "" : " locked"}`;
        card.dataset.palette = item.palette;
        card.dataset.accent = item.accent;
        card.setAttribute("aria-label", item.available ? item.name : `${item.name}，暂未开放`);

        if (item.available) {
          card.addEventListener("click", () => {
            state.selectedScriptId = primary.id;
            renderScriptLibrary();
            showScriptLibraryFeedback(`已选中《${primary.name}》，可直接前往首页开卷。`);
          });
        } else {
          card.addEventListener("click", () => {
            showScriptLibraryFeedback(`《${item.name}》暂未开放，当前可游玩剧本为《${primary.name}》。`);
          });
        }

        card.innerHTML = `
          <div class="script-card-cover">
            <div class="script-card-cover-art">
              <span class="script-card-cover-glow"></span>
              <span class="script-card-cover-ridge"></span>
              <span class="script-card-cover-emblem"></span>
            </div>
            <div class="script-card-cover-label">
              <h3 class="script-card-cover-title">${item.name}</h3>
              <p class="script-card-cover-subtitle">${item.subtitle}</p>
            </div>
          </div>
          <div class="script-card-body">
            <div class="script-card-status">${item.available ? "可游玩" : "待开放"}</div>
            <div class="script-card-meta">
              <div class="script-card-meta-row">
                <span>难度：${item.difficulty}</span>
                <span>人数：${item.players}</span>
              </div>
              <div class="script-card-meta-row">
                <span>${item.available ? "主推" : "推荐"}</span>
                <span>评分：${item.score}</span>
              </div>
            </div>
          </div>
        `;

        el.scriptList.appendChild(card);
      });
    }

    function renderProfile() {
      if (el.profileScriptText) {
        const currentScript = getScriptById(state.selectedScriptId);
        const completedCount = Array.isArray(state.session.completed) ? state.session.completed.length : 0;
        el.profileScriptText.textContent = `当前剧本：${currentScript.name}｜已完成 ${completedCount} 站旅程`;
      }
    }

    function renderAdmin() {
      if (!el.adminAssets) return;
      const defaults = getDefaultAssets();

      const rows = [
        { key: "personaFrame", label: "角色边框图", desc: "拍照合成叠加透明 PNG" },
        { key: "couponImage", label: "优惠券图", desc: "结果页二维码或活动图" },
        { key: "resultBgImage", label: "结果页背景图", desc: "结果页视觉背景" },
        { key: "endingBgImage", label: "结局总结底图", desc: "主线完成后的总结页背景图" }
      ];

      el.adminAssets.innerHTML = "";
      rows.forEach((row) => {
        const wrap = document.createElement("div");
        wrap.className = "asset-row";

        const title = document.createElement("div");
        title.className = "item-title";
        title.textContent = row.label;

        const desc = document.createElement("div");
        desc.className = "item-sub";
        desc.textContent = row.desc;

        const image = document.createElement("img");
        image.className = "asset-preview";
        image.alt = row.label;
        image.src = state.designAssets[row.key] || defaults[row.key];

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.hidden = true;

        const button = document.createElement("button");
        button.className = "btn";
        button.textContent = "上传替换";
        button.addEventListener("click", () => input.click());

        input.addEventListener("change", () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            state.designAssets[row.key] = String(reader.result || "");
            saveAssets();
            renderAdmin();
          };
          reader.readAsDataURL(file);
          input.value = "";
        });

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";
        toolbar.appendChild(button);

        wrap.appendChild(title);
        wrap.appendChild(desc);
        wrap.appendChild(image);
        wrap.appendChild(toolbar);
        wrap.appendChild(input);
        el.adminAssets.appendChild(wrap);
      });
    }

    return {
      renderHome,
      renderCommunity,
      renderScriptLibrary,
      renderProfile,
      renderAdmin
    };
  }

  window.createCityQuestPageViews = createCityQuestPageViews;
})();
