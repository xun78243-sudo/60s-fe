export interface ParamConfig {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "select";
  options?: { value: string; label: string }[];
}

export interface EndpointConfig {
  path: string;
  name: string;
  desc: string;
  category: string;
  params?: ParamConfig[];
  isImage?: boolean;
  /** How to render the result data */
  renderType?:
    | "news-list"
    | "hot-list"
    | "card-list"
    | "single"
    | "table"
    | "image"
    | "raw"
    | "exchange-rate"
    | "fuel-price"
    | "gold-price"
    | "lunar"
    | "event-list";
  /** Which fields to show in list items */
  displayFields?: string[];
}

export const API_BASE = "http://60s.lxxn.me/api";

export const categories = [
  { id: "news", name: "新闻资讯", icon: "📰" },
  { id: "entertainment", name: "娱乐影音", icon: "🎬" },
  { id: "life", name: "生活服务", icon: "🌤" },
  { id: "tools", name: "实用工具", icon: "🔧" },
  { id: "tech", name: "技术极客", icon: "💻" },
  { id: "fun", name: "趣味杂谈", icon: "🎲" },
] as const;

/** Hidden categories that won't show in nav or main grid */
export const hiddenCategories = ["life", "fun"];

/** Default number of cards to display per category (expandable) */
export const categoryDefaultCards: Record<string, number> = {
  news: 6,
  entertainment: 3,
  tools: 3,
  tech: 6,
  life: 3,
  fun: 10,
};

/** Hidden endpoint paths that won't show anywhere */
export const hiddenEndpoints = ["/v2/olympics"];

/** Fun endpoints that are combined into a single right-side panel */
export const funPanelEndpoints = [
  "/v2/hitokoto",
  "/v2/duanzi",
  "/v2/kfc",
  "/v2/moyu",
];

/** Life service endpoints that go to the right-side panel below fun panel */
export const lifePanelEndpoints = [
  "/v2/exchange-rate",
  "/v2/fuel-price",
  "/v2/gold-price",
  "/v2/lunar",
  "/v2/olympics/events",
];

/** APIs to auto-load on page open */
export const autoLoadEndpoints = [
  "/v2/60s",
  "/v2/weibo",
  "/v2/zhihu",
  "/v2/toutiao",
  "/v2/bili",
  "/v2/ncm-rank/list",
  "/v2/maoyan/realtime/movie",
  "/v2/hitokoto",
  "/v2/epic",
  "/v2/douyin",
  "/v2/duanzi",
  "/v2/kfc",
  "/v2/hacker-news/top",
  "/v2/it-news",
  "/v2/moyu",
  "/v2/baidu/hot",
  "/v2/password",
  "/v2/color/random",
  "/v2/exchange-rate",
  "/v2/fuel-price",
  "/v2/gold-price",
  "/v2/lunar",
  "/v2/olympics/events",
];

export const endpoints: EndpointConfig[] = [
  // === 新闻资讯 ===
  {
    path: "/v2/60s",
    name: "每日60秒",
    desc: "每天60秒读懂世界",
    category: "news",
    renderType: "news-list",
    displayFields: ["news"],
  },
  {
    path: "/v2/60s/rss",
    name: "60秒 RSS",
    desc: "每日60秒 RSS 格式",
    category: "news",
    renderType: "raw",
  },
  {
    path: "/v2/toutiao",
    name: "今日头条",
    desc: "今日头条热门新闻",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/weibo",
    name: "微博热搜",
    desc: "微博实时热搜榜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/zhihu",
    name: "知乎热榜",
    desc: "知乎实时热榜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/baidu/hot",
    name: "百度热搜",
    desc: "百度实时热搜榜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/baidu/teleplay",
    name: "百度电视剧",
    desc: "百度电视剧热搜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title"],
  },
  {
    path: "/v2/baidu/tieba",
    name: "百度贴吧",
    desc: "百度贴吧热议榜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/ai-news",
    name: "AI 新闻",
    desc: "AI 领域最新资讯",
    category: "news",
    renderType: "card-list",
    displayFields: ["title", "desc", "cover"],
  },
  {
    path: "/v2/douyin",
    name: "抖音热点",
    desc: "抖音实时热点榜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/rednote",
    name: "小红书",
    desc: "小红书热门笔记",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/dongchedi",
    name: "懂车帝",
    desc: "懂车帝热门资讯",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/baidu/realtime",
    name: "百度实时",
    desc: "百度实时热搜榜",
    category: "news",
    renderType: "hot-list",
    displayFields: ["title", "score_desc"],
  },
  {
    path: "/v2/today-in-history",
    name: "历史上的今天",
    desc: "历史上的今天发生的大事",
    category: "news",
    renderType: "card-list",
    displayFields: ["title", "description"],
  },

  // === 娱乐影音 ===
  {
    path: "/v2/bili",
    name: "B站热搜",
    desc: "B站实时热搜榜",
    category: "entertainment",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/ncm-rank/list",
    name: "网易云排行榜",
    desc: "网易云音乐排行榜列表",
    category: "entertainment",
    renderType: "card-list",
    displayFields: ["name", "description", "cover"],
  },
  {
    path: "/v2/ncm-rank/:id",
    name: "网易云排行详情",
    desc: "根据排行榜ID获取详情",
    category: "entertainment",
    renderType: "card-list",
    params: [
      {
        name: "id",
        label: "排行榜 ID",
        placeholder: "如 3778678",
        required: true,
      },
    ],
  },
  {
    path: "/v2/lyric",
    name: "歌词搜索",
    desc: "搜索歌曲歌词",
    category: "entertainment",
    renderType: "single",
    params: [
      {
        name: "keyword",
        label: "歌曲关键词",
        placeholder: "如 晴天",
        required: true,
      },
    ],
  },
  {
    path: "/v2/maoyan/all/movie",
    name: "猫眼全部电影",
    desc: "猫眼电影全部榜单",
    category: "entertainment",
    renderType: "hot-list",
    displayFields: ["movie_name", "box_office_desc"],
  },
  {
    path: "/v2/maoyan/realtime/movie",
    name: "猫眼实时电影",
    desc: "猫眼实时电影票房",
    category: "entertainment",
    renderType: "hot-list",
    displayFields: ["movie_name", "box_office_desc"],
  },
  {
    path: "/v2/maoyan/realtime/tv",
    name: "猫眼实时电视",
    desc: "猫眼实时电视剧热度",
    category: "entertainment",
    renderType: "hot-list",
    displayFields: ["programme_name", "market_rate_desc"],
  },
  {
    path: "/v2/maoyan/realtime/web",
    name: "猫眼实时网播",
    desc: "猫眼实时网播热度",
    category: "entertainment",
    renderType: "hot-list",
    displayFields: ["name", "heatInfo", "cover"],
  },
  {
    path: "/v2/douban/weekly/movie",
    name: "豆瓣每周电影",
    desc: "豆瓣每周电影推荐",
    category: "entertainment",
    renderType: "card-list",
    displayFields: ["name", "rating", "cover"],
  },
  {
    path: "/v2/douban/weekly/tv_chinese",
    name: "豆瓣华语剧",
    desc: "豆瓣每周华语剧集",
    category: "entertainment",
    renderType: "card-list",
    displayFields: ["name", "rating", "cover"],
  },
  {
    path: "/v2/douban/weekly/tv_global",
    name: "豆瓣全球剧",
    desc: "豆瓣每周全球剧集",
    category: "entertainment",
    renderType: "card-list",
    displayFields: ["name", "rating", "cover"],
  },
  {
    path: "/v2/douban/weekly/show_chinese",
    name: "豆瓣华语综艺",
    desc: "豆瓣每周华语综艺",
    category: "entertainment",
    renderType: "card-list",
    displayFields: ["name", "rating", "cover"],
  },
  {
    path: "/v2/douban/weekly/show_global",
    name: "豆瓣全球综艺",
    desc: "豆瓣每周全球综艺",
    category: "entertainment",
    renderType: "card-list",
    displayFields: ["name", "rating", "cover"],
  },
  {
    path: "/v2/maoyan",
    name: "猫眼总票房",
    desc: "猫眼电影历史总票房榜",
    category: "entertainment",
    renderType: "hot-list",
    displayFields: ["movie_name", "box_office_desc"],
  },

  // === 生活服务 ===
  {
    path: "/v2/weather/realtime",
    name: "实时天气",
    desc: "查询城市实时天气",
    category: "life",
    renderType: "single",
    params: [
      { name: "city", label: "城市名", placeholder: "如 北京", required: true },
    ],
  },
  {
    path: "/v2/weather/forecast",
    name: "天气预报",
    desc: "查询城市天气预报",
    category: "life",
    renderType: "card-list",
    params: [
      { name: "city", label: "城市名", placeholder: "如 北京", required: true },
    ],
  },
  {
    path: "/v2/exchange-rate",
    name: "汇率查询",
    desc: "实时汇率信息",
    category: "life",
    renderType: "exchange-rate",
  },
  {
    path: "/v2/fuel-price",
    name: "油价查询",
    desc: "国内油价信息",
    category: "life",
    renderType: "fuel-price",
  },
  {
    path: "/v2/gold-price",
    name: "金价查询",
    desc: "实时金价信息",
    category: "life",
    renderType: "gold-price",
  },
  {
    path: "/v2/lunar",
    name: "农历查询",
    desc: "今日农历信息",
    category: "life",
    renderType: "lunar",
  },
  {
    path: "/v2/olympics",
    name: "奥运奖牌",
    desc: "奥运会奖牌榜",
    category: "life",
    renderType: "table",
  },
  {
    path: "/v2/olympics/events",
    name: "奥运赛事",
    desc: "奥运会赛事信息",
    category: "life",
    renderType: "event-list",
  },
  {
    path: "/v2/ip",
    name: "IP 查询",
    desc: "查询IP地址信息（留空则查本机）",
    category: "life",
    renderType: "single",
    params: [
      {
        name: "ip",
        label: "IP 地址",
        placeholder: "留空查本机，或输入如 8.8.8.8",
      },
    ],
  },
  {
    path: "/v2/whois",
    name: "Whois 查询",
    desc: "查询域名 Whois 信息",
    category: "life",
    renderType: "single",
    params: [
      {
        name: "domain",
        label: "域名",
        placeholder: "如 baidu.com",
        required: true,
      },
    ],
  },

  // === 实用工具 ===
  {
    path: "/v2/qrcode",
    name: "二维码生成",
    desc: "生成指定内容的二维码",
    category: "tools",
    renderType: "image",
    params: [
      {
        name: "text",
        label: "内容",
        placeholder: "如 https://example.com",
        required: true,
      },
    ],
    isImage: true,
  },
  {
    path: "/v2/hash",
    name: "Hash 计算",
    desc: "计算文本的 Hash 值",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "text",
        label: "文本",
        placeholder: "输入要计算哈希的文本",
        required: true,
      },
      {
        name: "algo",
        label: "算法",
        placeholder: "选择算法",
        type: "select",
        options: [
          { value: "md5", label: "MD5" },
          { value: "sha1", label: "SHA-1" },
          { value: "sha256", label: "SHA-256" },
          { value: "sha512", label: "SHA-512" },
        ],
      },
    ],
  },
  {
    path: "/v2/password",
    name: "随机密码",
    desc: "生成随机密码",
    category: "tools",
    renderType: "single",
  },
  {
    path: "/v2/password/check",
    name: "密码检查",
    desc: "检查密码强度",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "password",
        label: "密码",
        placeholder: "输入要检查的密码",
        required: true,
      },
    ],
  },
  {
    path: "/v2/fanyi",
    name: "文本翻译",
    desc: "翻译文本内容",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "text",
        label: "文本",
        placeholder: "如 hello world",
        required: true,
      },
      {
        name: "to",
        label: "目标语言",
        placeholder: "选择目标语言",
        type: "select",
        required: true,
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "英语" },
          { value: "ja", label: "日语" },
          { value: "ko", label: "韩语" },
          { value: "fr", label: "法语" },
          { value: "de", label: "德语" },
          { value: "ru", label: "俄语" },
          { value: "es", label: "西班牙语" },
        ],
      },
    ],
  },
  {
    path: "/v2/fanyi/langs",
    name: "翻译语言列表",
    desc: "获取翻译支持的语言",
    category: "tools",
    renderType: "table",
  },
  {
    path: "/v2/color/random",
    name: "随机颜色",
    desc: "获取随机颜色",
    category: "tools",
    renderType: "single",
  },
  {
    path: "/v2/color/palette",
    name: "颜色调色板",
    desc: "获取颜色调色板",
    category: "tools",
    renderType: "card-list",
  },
  {
    path: "/v2/health",
    name: "健康检查",
    desc: "API 健康检查",
    category: "tools",
    renderType: "single",
  },
  {
    path: "/v2/og",
    name: "OG 信息获取",
    desc: "获取网页 OpenGraph 信息",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "url",
        label: "网址",
        placeholder: "如 https://github.com",
        required: true,
      },
    ],
  },
  {
    path: "/v2/chemical",
    name: "化学元素",
    desc: "查询化学元素信息",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "element",
        label: "元素",
        placeholder: "如 H, He, 铁",
        required: true,
      },
    ],
  },
  {
    path: "/v2/baike",
    name: "百科查询",
    desc: "查询百度百科信息",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "keyword",
        label: "关键词",
        placeholder: "如 人工智能",
        required: true,
      },
    ],
  },
  {
    path: "/v2/bing",
    name: "Bing 搜索",
    desc: "Bing 搜索结果",
    category: "tools",
    renderType: "card-list",
    params: [
      {
        name: "keyword",
        label: "关键词",
        placeholder: "如 AI 技术",
        required: true,
      },
    ],
  },
  {
    path: "/v2/answer",
    name: "万能回答",
    desc: "智能回答问题",
    category: "tools",
    renderType: "single",
    params: [
      {
        name: "question",
        label: "问题",
        placeholder: "如 今天星期几",
        required: true,
      },
    ],
  },
  {
    path: "/v2/color",
    name: "颜色详情",
    desc: "获取颜色详细色值信息",
    category: "tools",
    renderType: "single",
  },

  // === 趣味杂谈 ===
  {
    path: "/v2/duanzi",
    name: "随机段子",
    desc: "获取随机搞笑段子",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/kfc",
    name: "KFC 疯狂星期四",
    desc: "KFC 疯狂星期四文案",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/dad-joke",
    name: "冷笑话",
    desc: "获取随机冷笑话",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/fabing",
    name: "发病文学",
    desc: "随机发病文学",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/hitokoto",
    name: "一言",
    desc: "获取随机一言",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/luck",
    name: "今日运势",
    desc: "查看今日运势",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/moyu",
    name: "摸鱼日历",
    desc: "摸鱼人日历",
    category: "fun",
    renderType: "single",
  },
  {
    path: "/v2/changya",
    name: "长雅",
    desc: "随机长雅语录",
    category: "fun",
    renderType: "single",
  },

  // === 技术极客 ===
  {
    path: "/v2/it-news",
    name: "IT 资讯",
    desc: "IT 行业新闻资讯",
    category: "tech",
    renderType: "card-list",
    displayFields: ["title", "desc", "cover"],
  },
  {
    path: "/v2/it-news/rank",
    name: "IT 资讯排行",
    desc: "IT 资讯热度排行",
    category: "tech",
    renderType: "hot-list",
    displayFields: ["title", "hot_value"],
  },
  {
    path: "/v2/hacker-news/new",
    name: "HN 最新",
    desc: "Hacker News 最新",
    category: "tech",
    renderType: "hot-list",
    displayFields: ["title", "points"],
  },
  {
    path: "/v2/hacker-news/top",
    name: "HN 热门",
    desc: "Hacker News 热门",
    category: "tech",
    renderType: "hot-list",
    displayFields: ["title", "points"],
  },
  {
    path: "/v2/hacker-news/best",
    name: "HN 最佳",
    desc: "Hacker News 最佳",
    category: "tech",
    renderType: "hot-list",
    displayFields: ["title", "points"],
  },
  {
    path: "/v2/awesome-js",
    name: "Awesome JS",
    desc: "精选 JavaScript 题目",
    category: "tech",
    renderType: "single",
  },
  {
    path: "/v2/epic",
    name: "Epic 免费游戏",
    desc: "Epic 本周免费游戏",
    category: "tech",
    renderType: "card-list",
    displayFields: ["title", "description", "cover"],
  },
  {
    path: "/v2/quark",
    name: "夸克网盘",
    desc: "夸克网盘资源",
    category: "tech",
    renderType: "card-list",
  },
  {
    path: "/v2/beta/kuan",
    name: "酷安",
    desc: "酷安相关内容",
    category: "tech",
    renderType: "hot-list",
    params: [
      {
        name: "keyword",
        label: "关键词",
        placeholder: "如 微信",
        required: true,
      },
    ],
  },
  {
    path: "/v2/beta/qq/profile",
    name: "QQ 资料",
    desc: "查询 QQ 用户资料",
    category: "tech",
    renderType: "single",
    params: [
      {
        name: "qq",
        label: "QQ 号",
        placeholder: "如 123456789",
        required: true,
      },
    ],
  },
];
