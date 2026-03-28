(function () {

const SCRIPTS = [{
  id: "axis_12_controls_v1",
  name: "中轴遗章·十二阙",
  subtitle: "循北阙而南门",
  summary: "子夜将临，钟鼓失序，宫城内外忽现错签异牒。有人盗改夜禁节次，意欲借中轴礼制逆启三印遗契，使城门、鼓更、祭仪与通行法度尽数紊乱。你奉命持牒南下，自钟鼓楼起，沿十二阙逐站追缉内应与贼踪，在子时前封阙止乱。",
  opening: "今夜风紧，北城先乱。钟鼓之间忽出伪签，宫门之内又见错印，黑灯贼子已挟旧牒南遁。三印若被逐一拼合，整条中轴的夜禁、通行与祭序都将被倒转。执此司牒，自钟鼓楼起，逐站查问、逐阙核验，务必在子时前合卷封阙。",
  style: "古典文字叙事"
}];

const LANDMARKS = [
  { id: "zhonggulou", name: "钟鼓楼", persona: "报时与守更双官", npcKey: "liu_sanniang", lat: 39.9440, lng: 116.3892 },
  { id: "wan_ning_bridge", name: "万宁桥", persona: "桥畔老者", npcKey: "merchant", lat: 39.9394, lng: 116.3915 },
  { id: "jingshan", name: "景山", persona: "山亭引路人", npcKey: "maid", lat: 39.9306, lng: 116.3975 },
  { id: "gugong", name: "故宫", persona: "殿前礼官", npcKey: "official", lat: 39.9163, lng: 116.3972 },
  { id: "shejitan", name: "社稷坛", persona: "祭坛执礼者", npcKey: "official", lat: 39.9112, lng: 116.3868 },
  { id: "taimiao", name: "太庙", persona: "宗庙典守", npcKey: "maid", lat: 39.9111, lng: 116.4082 },
  { id: "tiananmen", name: "天安门", persona: "宫门校尉", npcKey: "assassin", lat: 39.9087, lng: 116.3975 },
  { id: "waijinshuiqiao", name: "外金水桥", persona: "桥卫引导者", npcKey: "merchant", lat: 39.9056, lng: 116.3973 },
  { id: "zhengyangmen", name: "正阳门", persona: "城门校尉", npcKey: "assassin", lat: 39.8990, lng: 116.3975 },
  { id: "xiannongtan", name: "先农坛", persona: "坛场司农", npcKey: "merchant", lat: 39.8836, lng: 116.3856 },
  { id: "tiantan", name: "天坛", persona: "祭天司仪", npcKey: "maid", lat: 39.8837, lng: 116.4122 },
  { id: "yongdingmen", name: "永定门", persona: "终点守门人", npcKey: "official", lat: 39.8672, lng: 116.3944 }
];

const FEED = [
  { user: "中轴玩家017", content: "12 点路线一次跑通，节奏很稳。", likes: 26 },
  { user: "CityWalker", content: "续行之键更合行旅章法。", likes: 12 },
  { user: "北城探索者", content: "希望后续加支线与隐藏成就。", likes: 19 }
];

const STORAGE_KEYS = {
  scriptId: "cityquest_web_script_id",
  assets: "cityquest_web_design_assets"
};

const COOKIE_KEYS = {
  storyProgress: "cityquest_web_story_progress"
};

let DEFAULT_ASSETS = {
  personaFrame: "./assets/persona_frame.png",
  couponImage: "./assets/coupon_qr.png",
  resultBgImage: "",
  endingBgImage: ""
};

const ASSET_SOURCES = {
  personaFrame: { b64: "./assets/frame.b64", fallback: "./assets/persona_frame.png" },
  couponImage: { b64: "./assets/coupon.b64", fallback: "./assets/coupon_qr.png" }
};

const RESULT_BG_CANDIDATES = [
  "./assets/result_bg.png",
  "./assets/result_bg.jpg",
  "./assets/result_bg.jpeg",
  "./assets/result-bg.png",
  "./assets/result-bg.jpg",
  "./assets/result-bg.jpeg"
];
const ENDING_BG_CANDIDATES = [
  "./素材/总结底图.png",
  "./素材/总结底图.jpg",
  "./素材/总结底图.jpeg",
  "./素材/结束总结.png",
  "./素材/结束总结.jpg",
  "./assets/ending_bg.png",
  "./assets/ending_bg.jpg",
  "./assets/ending-bg.png",
  "./assets/ending-bg.jpg"
];

const STARTUP_HERO_IMAGE = "./素材/启动页.png";
const STARTUP_BG_BY_TAB = {
  home: "./素材/启动页.png",
  community: "./素材/主地图.png",
  scripts: "./素材/每个地区的背景图/故宫.png",
  profile: "./素材/每个地区的背景图/天坛.png"
};

const LANDMARK_CHAT_BG = {
  zhonggulou: "./素材/每个地区的背景图/钟楼.png",
  wan_ning_bridge: "./素材/每个地区的背景图/万宁桥.png",
  jingshan: "./素材/每个地区的背景图/景山.png",
  gugong: "./素材/每个地区的背景图/故宫.png",
  shejitan: "./素材/每个地区的背景图/故宫.png",
  taimiao: "./素材/每个地区的背景图/故宫.png",
  tiananmen: "./素材/每个地区的背景图/故宫.png",
  waijinshuiqiao: "./素材/每个地区的背景图/正阳门.png",
  zhengyangmen: "./素材/每个地区的背景图/正阳门.png",
  xiannongtan: "./素材/每个地区的背景图/天坛.png",
  tiantan: "./素材/每个地区的背景图/天坛.png",
  yongdingmen: "./素材/每个地区的背景图/永定门.png"
};

const CHECKIN_BG_BY_LANDMARK = {
  zhonggulou: "./素材/打卡/钟楼.png",
  wan_ning_bridge: "./素材/打卡/万宁桥.png",
  jingshan: "./素材/打卡/景山.png",
  gugong: "./素材/打卡/故宫.png",
  shejitan: "./素材/打卡/故宫.png",
  taimiao: "./素材/打卡/故宫.png",
  tiananmen: "./素材/打卡/故宫.png",
  waijinshuiqiao: "./素材/打卡/万宁桥.png",
  zhengyangmen: "./素材/打卡/故宫.png",
  xiannongtan: "./素材/打卡/天坛.png",
  tiantan: "./素材/打卡/天坛.png",
  yongdingmen: "./素材/打卡/永定门.png"
};

const CHECKIN_BG_FALLBACK = "./素材/打卡/故宫.png";

const HOME_MAP_CONFIG = {
  image: "./素材/主地图.png",
  width: 390,
  height: 844,
  origin: "bottom-left",
  points: [
    { name: "钟鼓楼", x: 195.0, y: 717.4, w: 78, h: 30 },
    { name: "万宁桥", x: 195.0, y: 675.2, w: 80, h: 30 },
    { name: "景山", x: 195.0, y: 582.4, w: 62, h: 28 },
    { name: "故宫", x: 195.0, y: 498.0, w: 74, h: 30 },
    { name: "社稷坛", x: 109.2, y: 447.3, w: 66, h: 30 },
    { name: "太庙", x: 273.0, y: 447.3, w: 58, h: 30 },
    { name: "天安门", x: 195.0, y: 371.4, w: 86, h: 30 },
    { name: "外金水桥", x: 195.0, y: 329.2, w: 98, h: 30 },
    { name: "正阳门", x: 195.0, y: 261.6, w: 88, h: 32 },
    { name: "先农坛", x: 105.3, y: 143.5, w: 68, h: 30 },
    { name: "天坛", x: 284.7, y: 143.5, w: 56, h: 30 },
    { name: "永定门", x: 195.0, y: 50.6, w: 88, h: 30 }
  ]
};

const NPC_ASSETS = {
  player: { name: "你", image: "./素材/npc/主人公.png" },
  assassin: { name: "刺客", image: "./素材/npc/刺客.png" },
  liu_sanniang: { name: "柳三娘", image: "./素材/npc/宫女.png" },
  maid: { name: "宫女", image: "./素材/npc/宫女.png" },
  merchant: { name: "富商", image: "./素材/npc/富商.png" },
  official: { name: "文官", image: "./素材/npc/文官之类的.png" }
};

const SCENE_TEMPLATES = {
  zhonggulou: {
    title: "晨鼓夜钟",
    objective: "得“晨钟刻”与“暮鼓拍”",
    intro: "更楼风急，铜钟余震尚在梁间回荡。司更官捧出一卷被水汽打湿的夜签，低声道：今夜钟刻被人偷改一笔，看似只差一刻，实则会让整城门禁、巡更与通行先后全数错位。若不能先校正钟鼓之序，后面的每一道门、每一处坛、每一份凭牒都会随之失准。",
    options: ["听钟辨刻", "按鼓定更"],
    clues: ["晨钟刻", "暮鼓拍"],
    report: "请将你所校定的时辰与更次上呈成牒，不只要答出钟鼓先后，还要说明这一错刻将如何牵动后续阙门的秩序。",
    unlock: "时序既定，可验其地。",
    bridge: "钟鼓既明，北阙第一层迷雾暂被揭开。司更官在卷尾补了一句：错签并非孤证，贼人曾在万宁桥附近与人递过水纹暗号。若想继续追下去，你须立刻南趋桥畔。"
  },
  wan_ning_bridge: {
    title: "桥影分波",
    objective: "得“拱影向”与“水脉辞”",
    intro: "夜水压着桥洞缓缓而过，桥畔老者倚杖不语，只抬眼看你一瞬，像是在辨认来者是否真持司牒。他指向水中摇碎的月影，说桥向一差，来路与去路便会在记录中被故意颠倒；而桥下水声里还藏着一句接头暗辞，若听错了，追到南边也只能撞见一地假线索。",
    options: ["观拱影辨桥向", "听水声记暗辞"],
    clues: ["拱影向", "水脉辞"],
    report: "请将桥向、水脉与暗辞三者的对应关系讲明。此处不是单纯认桥，而是在查证贼人是否借桥势伪造了自己的南遁路径。",
    unlock: "桥脉已合，可验其地。",
    bridge: "桥脉既合，你已确认黑灯贼子并非直奔宫门，而是在桥上故布疑阵、引人误判。老者在杖尾刻下一个残字，提示你若想看清他真正的落点，须登高望阙，去景山再辨全局。"
  },
  jingshan: {
    title: "万春望阙",
    objective: "得“亭上望”与“宫城位”",
    intro: "夜风从山亭穿过，压得松影贴地。引路人将一幅残缺宫城图展开在栏边，说城中诸阙表面如常，实则灯记与门线都被人悄悄挪动过。你若只盯眼前一门一殿，便会被牵着鼻子走；只有先在高处把南北、宫城中枢与潜行路线一并看透，之后每一步才不会被假迹拖偏。",
    options: ["凭高定南北", "遥指宫城中枢"],
    clues: ["亭上望", "宫城位"],
    report: "请把景山所见写成一份俯览校记：哪里是真正的南向要津，哪里又是被故意制造出来的假焦点，都要一并上呈。",
    unlock: "望势既成，可验其地。",
    bridge: "这一望之后，中轴不再只是地图上的直线，而成了一条被人动过手脚的礼制之链。引路人点着宫城中段道：真正的破口已经显在故宫，若再迟一步，第一枚关键门印便会被彻底调包。"
  },
  gugong: {
    title: "丹阙秩礼",
    objective: "得“入阙仪”与“中轴向”",
    intro: "殿阶之上风声顿止，礼官将袖中小册缓缓摊开，语气平静却不容置疑：有人并未强闯宫门，而是借礼制本身做手脚，将应当互相咬合的次序悄悄拆散。若不先把入阙仪次与中轴正向重新校正，任何一枚门印都可能在看似合礼的流程中被替换得毫无痕迹。",
    options: ["诵入阙仪次", "辨中轴正向"],
    clues: ["入阙仪", "中轴向"],
    report: "请把入阙礼序、站位朝向与可疑错置一并陈述。这里要核的不是死记礼文，而是找出哪一处礼序最适合被内应利用。",
    unlock: "礼数无失，可验其地。",
    bridge: "礼册核过，故宫这一段的伪装终于露出一道缝隙。礼官指出，贼人与内应并不只在宫门换印，还把另一条仪礼线索牵向了社稷坛。若要追全这条链，你必须从皇城秩礼继续转入坛域祭序。"
  },
  shejitan: {
    title: "社稷问坛",
    objective: "得“祭次序”与“坛位图”",
    intro: "坛前风声更低，执礼者掸去祭册上的尘，轻声说社稷之礼最忌颠次，贼人偏偏正是从“轻微错位”里做文章。若祭次先后被调换，表面仍能成礼，实则会让后续凭牒与祭文彼此相冲。你现在要查的，不是一个坛位，而是整个坛场秩序是否曾被人悄悄改写。",
    options: ["辨祭次先后", "识坛位四向"],
    clues: ["祭次序", "坛位图"],
    report: "请把祭次、坛位、四向关系整理成卷。若有一处错位能成为贼人递送暗记的空隙，也必须明确指出。",
    unlock: "祭问既明，可验其地。",
    bridge: "社稷坛的顺序一经扶正，你便看出这不是孤立伪迹，而是一套相互照应的错置法。执礼者告知：下一层破绽不在外廷，而藏在太庙旧典之中，那里或许能把内应的身份再逼近一步。"
  },
  taimiao: {
    title: "太庙存典",
    objective: "得“庙典章”与“昭穆位”",
    intro: "太庙深处烛影摇曳，典守翻开旧简，指尖停在一行被刮擦过的昭穆记录上。他说真正危险的不是有人闯入宗庙，而是有人懂得借章法伪装自己，让一切看起来都像旧例。你若不能把庙典章法与昭穆次位重新对齐，就分不出谁在借先王名义行今日之诈。",
    options: ["查庙典章法", "校昭穆次位"],
    clues: ["庙典章", "昭穆位"],
    report: "请依典成文，把可被借用的章法、可被伪装的位次与真正不容更动的准绳完整记录下来。",
    unlock: "庙典核定，可验其地。",
    bridge: "当太庙旧典被重新钉牢，几条原本散乱的线索开始互相指认。典守压低声音说：伪符真正启用之处，多半不在庙内，而是在天安门前的通行关节。若要抢在贼人前面截住第二印，现在就得往南。"
  },
  tiananmen: {
    title: "天门核符",
    objective: "得“门符令”与“行伍序”",
    intro: "宫门风压得旌旗猎猎作响，校尉按刀而立，眼里尽是审视。他将几枚真假难辨的门符摊在案上，说真正的威胁不是硬闯，而是有人带着看似完备的次序与文牒，从队列里无声无息地穿过宫门。你若不能同时核清门符暗令与行伍先后，就永远抓不住那一瞬间的替换。 ",
    options: ["对门符暗令", "整通行班序"],
    clues: ["门符令", "行伍序"],
    report: "请将门符暗令、通行班序和可疑穿插点一并合报。这里的关键，不是识别单一假符，而是找出那条能让假符混入真队的缝隙。",
    unlock: "门验既毕，可验其地。",
    bridge: "天门核符之后，你终于看见贼人真正的手法：他不是一路狂奔，而是在秩序之中藏身。校尉说有人曾带匣经外金水桥南去，若你还想追上，就必须把这条桥线接住。"
  },
  waijinshuiqiao: {
    title: "金水桥契",
    objective: "得“桥契文”与“过桥向”",
    intro: "桥卫引你停在桥身阴影最深处，指着水面几处几乎看不出的折光，说一桥三折，真正的方向从不写在明面上。贼人若真押匣过桥，必然留下桥契短文与方位痕迹；可一旦你把先后顺序认反，追缉就会被导向另一个完全错误的城门出口。",
    options: ["记桥契短句", "辨过桥方位"],
    clues: ["桥契文", "过桥向"],
    report: "请把桥契短文、过桥方向与可能的伪装路径一起校验成文，说明贼人究竟是借桥藏形，还是借桥误导追兵。",
    unlock: "桥契吻合，可验其地。",
    bridge: "桥契与方位终于拼上了第二层追缉链。桥卫确认匣子并未在桥后失踪，而是继续南押，直逼正阳门关。那里将不只是盘问口令，更可能是一次真正的围堵与识破。"
  },
  zhengyangmen: {
    title: "正阳门关",
    objective: "得“关牒号”与“门史名”",
    intro: "城门灯火压得夜色更沉，守门校尉先不看牒，只盯着你的神情喝问旧名与新称。这里最容易被人利用的，不是高墙，而是记忆：一处门史、一句旧称、一枚关牒暗号，只要有人故意说得半真半假，就足以骗过仓促之中的巡查。你若要堵住这道口子，必须同时校门史与核暗号。",
    options: ["校门史旧名", "应关牒暗号"],
    clues: ["关牒号", "门史名"],
    report: "请把门史沿革、关牒号令和盘问对答完整录下。真正重要的是指出：哪一句旧称、哪一段历史最适合被伪装者借来混关。",
    unlock: "关牒无误，可验其地。",
    bridge: "正阳门前的对答一过，贼人的假面已经撑不太住了。可他仍留下一道尾线，把你引往先农坛。那不是闲笔，而像是最后一枚实物封印真正藏匿之地。"
  },
  xiannongtan: {
    title: "先农课耕",
    objective: "得“耕礼图”与“田坛纪”",
    intro: "坛场土气未散，司农将耒耜横在身前，说世人常把先农坛只看作礼制边角，正因如此，最容易被人拿来藏匣、藏册、藏不该现身的旧物。耕礼的次序与田坛的格局看似平缓，实则每一处转折都能成为暗藏封物的机关。若你不能把仪程和地势一并看清，木匣纵在脚下也未必能找到。",
    options: ["辨耕礼仪程", "记田坛格局"],
    clues: ["耕礼图", "田坛纪"],
    report: "请把先农礼制的关键程式、田坛格局与可疑藏匣位置一并记入卷中，说明哪一处最像是被刻意留下的藏印空间。",
    unlock: "农礼已备，可验其地。",
    bridge: "先农坛的地窖与旧格局对上之后，第三印的真实去向终于浮出水面。司农提醒你：真正的逆启不会在这里完成，最后的仪式必然还要借天坛之势。若要截断终局，你现在就得赶过去。"
  },
  tiantan: {
    title: "圜丘听天",
    objective: "得“圜丘阶”与“祭天向”",
    intro: "天坛夜色空阔，司仪立于圜丘之侧，声音比风更冷。他说若前三印只是在铺路，那么真正的逆启之仪必定要在这里借位成形：层阶、朝向、仪次、停步之处，任何一处看似轻微的偏差，都会让整场仪式走向完全不同的结果。你现在已不是单纯在追人，而是在与一套被设计好的礼制机关抢时间。",
    options: ["数圜丘层阶", "定祭天朝向"],
    clues: ["圜丘阶", "祭天向"],
    report: "请把圜丘层级、朝向法与可能的逆启位点详细陈述。此处每一个阶级都可能决定你是截断仪式，还是亲手把它推向完成。",
    unlock: "天坛校定，可验其地。",
    bridge: "当层阶与朝向终于全部归位，司仪不再多言，只把最后一页密札交到你手中。其上写明：贼人会在永定门前合三印、借旧阙成契。此去已是终章，再无回头路。"
  },
  yongdingmen: {
    title: "永定封阙",
    objective: "得“封阙印”与“全轴录”",
    intro: "永定门外夜风扑面，终门守者接过你一路南下积攒的各站校记，逐页翻看，良久方道：如今你带来的已不只是线索，而是一条完整中轴如何被人拆解、错置、再企图逆启的证据链。此处成败，不在一枚印、一句口令，而在你能否把前十一站所得全部收拢成卷，当场压住那场即将成形的旧仪。",
    options: ["合三印成契", "呈全轴终录"],
    clues: ["封阙印", "全轴录"],
    report: "请据前十一站所得，将三印、全轴线索与最终判定合为终卷上呈。你不是在做最后一次抄录，而是在为整场追缉给出不可推翻的结论。",
    unlock: "封阙已成，可验其地。",
    bridge: "当终卷落定，散乱一夜的钟、门、桥、坛、宫与城终于重新咬合。无论你此刻是以秩序压住乱局，还是以机断、决行斩断其势，今夜这条中轴都将因你而重新归于沉静。"
  }
};

const MAINLINE_BEATS = {
  zhonggulou: "【序章】钟鼓夜签被改，值更记录前后互冲，卷末只留一句“黑灯南下”。你奉命持牒追查，却很快意识到这不是普通盗签，而是一场借礼制与时序层层铺开的逆启之局。",
  wan_ning_bridge: "【追迹】桥下捞起半张湿透断简，其上既有桥向记号，也有接头暗辞。你由此确认贼人并非仓皇遁走，而是在中轴北段就开始有计划地误导追兵。",
  jingshan: "【窥城】登高之后，宫城灯记与门线的异常终于同时显形。你意识到内廷必有熟知旧典的人在配合行动，否则这些错置不可能如此精准且彼此咬合。",
  gugong: "【入局】礼官检出第一枚门印的替换痕迹，说明贼人真正图谋的不是一站一地的混乱，而是整条中轴礼序的重组。追缉从此不再只是查人，更是在查一套被设计过的秩序。",
  shejitan: "【破绽】残缺祭册里露出代号“少司牒”，几条看似零散的错位线索开始向同一名内应收束。你第一次看见这场局背后隐约的人影。",
  taimiao: "【指认】宗庙旧注把换符、换印与借名分伪装串在了一起。至此，贼人与内应已不再只是猜测，而成为一条渐渐成形的证据链。",
  tiananmen: "【夺符】宫门截下伪符后，你确认第二层关键凭证已经现身。可对方并未在此死斗，而是弃符南逃，显然真正想保住的不是手上的假物，而是更后面的仪式节点。",
  waijinshuiqiao: "【紧追】桥卫回报有人押匣过桥，且故意留下真假难辨的过桥痕迹。你追到这里时已明白，黑灯贼子一路都在利用空间与次序制造分身。",
  zhengyangmen: "【围门】正阳门前的对牒与盘问终于撕开贼人的伪装，他被迫拆分路线、分散注意，只求拖延你赶往终局的时辰。",
  xiannongtan: "【得印】先农坛地窖中的封缄木匣被找到，第三印真形终于露面。此前十一分散乱象，至此开始向“合三印、逆旧阙”这一目的完全闭合。",
  tiantan: "【决断】圜丘密札写得极清楚：贼人要借祭时、借层阶、借朝向，把三印遗契倒向一场不该成立的旧仪。留给你的时间已只剩最后一更。",
  yongdingmen: "【终章】永定门前，所有桥、门、殿、坛、城的线索都要在此收束。你若能合卷封阙，整夜乱局便止于此；若迟疑半步，前面追回的一切都可能被反过来利用。"
};

const ROLE_ALIAS_BY_LANDMARK = {
  zhonggulou: "柳三娘",
  wan_ning_bridge: "沈桥翁",
  jingshan: "云清",
  gugong: "裴司礼",
  shejitan: "祝青衡",
  taimiao: "沈昭序",
  tiananmen: "韩雁行",
  waijinshuiqiao: "陆引桥",
  zhengyangmen: "戚守关",
  xiannongtan: "田守礼",
  tiantan: "闻天仪",
  yongdingmen: "封阙使"
};

const ROLE_BIO_BY_LANDMARK = {
  zhonggulou: "柳三娘曾在更楼主掌夜签誊录，记时分毫不差。她外表沉静寡言，实则对城中钟鼓、门禁与巡更节律了如指掌。今夜第一份被改动的夜签便经她手而出，因此她既是最早发现异动的人，也是最不肯放过这场错签之局的人。",
  wan_ning_bridge: "沈桥翁常年守在万宁桥侧，识桥势、认水脉、辨行舟，比多数衙役更懂来路与去向如何被地势悄悄篡改。他看似只是一位桥边老者，实则记得许多不该被轻易说出口的旧道与暗号。",
  jingshan: "云清本是替宫中传递景图与路记的引路人，擅长从高处统观城势，也最会从零散异象里看出真正的布局。她话不多，却总能在最短时间内指出一条线索究竟是实路还是障眼法。",
  gugong: "裴司礼多年掌仪，熟悉宫中礼数、站位与入阙章程。旁人眼里他只是循礼而行的殿前礼官，实际上他比谁都清楚，一旦有人懂得借礼制行诈，会比硬闯宫门更难防备。",
  shejitan: "祝青衡执守社稷坛已久，祭次、坛位、四向与旧册残页皆烂熟于心。他说话极轻，做事极稳，最擅长从那些看似无害的次序偏差里找出真正危险的破绽。",
  taimiao: "沈昭序出身宗庙典守世家，熟读庙典、昭穆与旧制沿革。他对“名分如何被借用、旧例如何被伪装”尤其警觉，因此凡涉章法与位次之事，他总比旁人多看出一层。",
  tiananmen: "韩雁行镇守宫门多年，识人、识符、识队列先后，是个极少被表象骗过的校尉。他最忌旁人把秩序当成摆设，因为他知道真正高明的潜入，往往不是破坏规矩，而是装作比谁都守规矩。",
  waijinshuiqiao: "陆引桥原是负责桥道引导与通行校验的桥卫，对桥契、来往方向和桥上脚步节奏十分敏感。他记事不用册，只用眼与耳，因此一些转瞬即逝的过桥痕迹，往往只有他能留下完整印象。",
  zhengyangmen: "戚守关脾气冷硬，最擅盘问旧名新称与牒文口令。许多人怕他问得太细，却也正因为他不肯放过任何一处含混，正阳门这道关卡才很少被人轻易糊弄过去。",
  xiannongtan: "田守礼长年主持先农坛礼务，熟悉耕礼程式、坛场格局与地窖旧构。别人眼里的冷僻角落，在他看来都藏着章法，因此他也最先意识到有人可能借此处掩藏真正的封物。",
  tiantan: "闻天仪为祭天司仪，最懂层阶、朝向与仪式停步之间的分寸。他一向不轻易下断语，可一旦开口，往往意味着他已看见整套仪式真正会落下去的位置与后果。",
  yongdingmen: "封阙使并非常设官名，更像是在大事临门时才会现身的终局执卷人。他不负责追缉前线，却负责在最后一刻核定诸证是否足以封卷，因此他既是守门人，也是全局最终的见证者。"
};

const STATION_CHOICE_RESULTS = {
  zhonggulou: {
    c1: "你先校正了晨钟刻度，楼上传下的报时终于重新吻合。表面只是改回了一刻，实则把整条追缉线最前端的时间基准重新钉住了。",
    c2: "你先重订暮鼓拍次，让原本即将错开的夜禁节奏重新归位。城中巡更因此稳住，也为你后续南追抢回了一点极珍贵的时辰。"
  },
  wan_ning_bridge: {
    c1: "你锁定了桥拱朝向，终于看出对方如何利用桥势制造方向误判。原本模糊的南遁路线在你眼前一下清晰了起来。",
    c2: "你记下水脉暗辞，那几句若有若无的水声终于不再只是噪音，而变成了能在下一站识别真假接头人的钥匙。"
  },
  jingshan: {
    c1: "你先定南北，把最容易让人绕远的西路误导线直接剔除。此后每一步都不再是盲追，而是沿着被校正后的中轴核心推进。",
    c2: "你先锁定宫城中枢，意识到真正的异动不是零散发生，而是围绕某个熟悉礼制的人在有组织地扩散。"
  },
  gugong: {
    c1: "你先补齐入阙礼序，把内应最擅长利用的那套“似是而非”礼法卡住了。这样一来，对方再想借章法拖延你，代价就高得多。",
    c2: "你先校定中轴向位，让所有后续门线与殿位都有了共同参照。追缉路线不再被假朝向牵着偏移。"
  },
  shejitan: {
    c1: "你先厘清祭次先后，一眼看出伪册里最隐蔽的时序错置。那不是抄错，而是有人故意留下的引导痕迹。",
    c2: "你先核对坛位四向，终于揪出内应埋在看似正规图式中的错位标记。原本沉默的坛场开始说话。"
  },
  taimiao: {
    c1: "你先查章法，逐步锁定少司牒能够调动与伪造的文牒权限。那张模糊的人影因此被你逼得更近了一层。",
    c2: "你先校昭穆，发现对方惯于假借名分、混入正统叙事之中。看穿这一点后，他的许多伪装忽然都变得拙劣起来。"
  },
  tiananmen: {
    c1: "你先对门符暗令，把贼人最关键的一段通关凭据直接掐断。即使他还握着别的线索，也很难再从容穿门而过。",
    c2: "你先整班序通行，把原本能容人插队混行的空隙全数封死。对方最擅长的“借秩序藏身”一招因此失了锐气。"
  },
  waijinshuiqiao: {
    c1: "你先记桥契文，把追捕继续南下所需的合法凭牒补得完整严密。之后再遇盘问，你就不必被迫停在桥头自证。",
    c2: "你先辨过桥向，终于锁定贼人绕门潜行的真正路径。那些原本像散沙的脚印与水痕开始彼此对上。"
  },
  zhengyangmen: {
    c1: "你先核门史旧名，识破了对方利用旧称、新称混淆关卡盘问的伎俩。城门这层迷雾因此被你撕开了一大半。",
    c2: "你先应关牒暗号，顺势钓出了藏在盘问之后的伪装接应人。此后这条线已不再只是怀疑，而是露了真容。"
  },
  xiannongtan: {
    c1: "你先补耕礼程式，确认木匣开启必须依循的正确次第。要是顺序错一层，前面追回来的三印线索都可能被重新打乱。",
    c2: "你先记田坛格局，迅速定位了地窖入口与藏匣落点。原本最容易被忽视的角落，反倒成了今晚最关键的一处实证。"
  },
  tiantan: {
    c1: "你先数阶，确定逆启仪式最可能落下的层位。这样一来，整个终局不再笼统，而被你逼成了一个具体、可抢先占住的位置。",
    c2: "你先定向，找准了截断整场仪式必须站住的正面位点。只要最后一步不偏，你就能把对方的旧仪当场掐灭。"
  },
  yongdingmen: {
    c1: "你先合印成契，让散了一夜的证物终于在你手里重新咬合。封阙从此不再只是口头判断，而成了具备法度与凭据的定论。",
    c2: "你先呈全轴终录，把前十一站追来的桥、门、坛、殿、城线索彻底闭环。到这一步，对方已很难再为自己留下任何翻案余地。"
  }
};

const CHOICE_STYLE_BY_STATION = {
  zhonggulou: { c1: "order", c2: "resolve" },
  wan_ning_bridge: { c1: "insight", c2: "order" },
  jingshan: { c1: "order", c2: "insight" },
  gugong: { c1: "resolve", c2: "order" },
  shejitan: { c1: "insight", c2: "resolve" },
  taimiao: { c1: "order", c2: "insight" },
  tiananmen: { c1: "resolve", c2: "order" },
  waijinshuiqiao: { c1: "insight", c2: "resolve" },
  zhengyangmen: { c1: "order", c2: "insight" },
  xiannongtan: { c1: "resolve", c2: "order" },
  tiantan: { c1: "insight", c2: "resolve" },
  yongdingmen: { c1: "resolve", c2: "insight" }
};

const STYLE_FEEDBACK = {
  order: "你选择了“循制而行”。这让局势推进得更稳，也让那些依赖秩序缝隙藏身的人更难轻易得手。",
  insight: "你选择了“先辨真伪”。信息面因此被你抢到前头，许多原本只能靠碰运气的判断开始有了根据。",
  resolve: "你选择了“先发制人”。追缉节奏被你主动提快，哪怕风险更高，也能把对方一步步逼出原定布局。"
};

const ENDING_LIBRARY = {
  order: {
    title: "金律封阙",
    summary: "你以礼制与次序稳住全轴，将逆启之仪压制于章法之内。",
    epilogue: "后世称你为“守阙司衡”，凡中轴大典皆以你的封卷为准。"
  },
  insight: {
    title: "玄鉴封阙",
    summary: "你以辨伪与推断反制内应，未待贼手落印便先破其局。",
    epilogue: "后世称你为“照牒明鉴”，疑案多以你的判例为镜。"
  },
  resolve: {
    title: "霆断封阙",
    summary: "你以快断快行斩断南遁链路，在子时前强行合印封阙。",
    epilogue: "后世称你为“夜行断缉”，危急军令常以你名号振众。"
  },
  balanced: {
    title: "中衡封阙",
    summary: "你在秩序、机断与决行间维持平衡，使三印同契、全轴同心。",
    epilogue: "后世称你为“中轴同衡”，文武两司共立你的封卷碑。"
  }
};

const ROUTE_BRANCH_GRAPH = {
  zhonggulou: { c1: "wan_ning_bridge", c2: "jingshan" },
  wan_ning_bridge: { c1: "gugong", c2: "gugong" },
  jingshan: { c1: "gugong", c2: "gugong" },
  gugong: { c1: "shejitan", c2: "taimiao" },
  shejitan: { c1: "tiananmen", c2: "tiananmen" },
  taimiao: { c1: "tiananmen", c2: "tiananmen" },
  tiananmen: { c1: "waijinshuiqiao", c2: "zhengyangmen" },
  waijinshuiqiao: { c1: "xiannongtan", c2: "xiannongtan" },
  zhengyangmen: { c1: "xiannongtan", c2: "xiannongtan" },
  xiannongtan: { c1: "tiantan", c2: "tiantan" },
  tiantan: { c1: "yongdingmen", c2: "yongdingmen" },
  yongdingmen: { c1: null, c2: null }
};

window.CityQuestStoryConfig = {
  SCRIPTS,
  LANDMARKS,
  FEED,
  STORAGE_KEYS,
  COOKIE_KEYS,
  DEFAULT_ASSETS,
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
};
})();
