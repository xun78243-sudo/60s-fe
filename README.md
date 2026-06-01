# 60s API Explorer

一个面向 [60s API](http://60s.lxxn.me/api/) 的单页前端仪表盘，聚合 60+ 数据源，以卡片式 UI 展示新闻、娱乐、生活服务、工具、技术和趣味内容。

## 功能特性

- **60+ 数据源** — 新闻资讯、娱乐影音、生活服务、实用工具、技术极客、趣味杂谈
- **卡片式布局** — 按分类展示，支持折叠展开、搜索过滤
- **右侧面板** — 趣味杂谈和生活服务固定在右侧独立展示
- **自定义渲染** — 汇率、油价、金价、农历、奥运赛事等有专属渲染组件
- **自定义端点** — 可通过侧边栏添加更多 API 端点，参数可配置
- **本地持久化** — 自定义端点和参数自动保存到 localStorage
- **明亮主题** — 固定亮色模式

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 构建生产版本
npm run build

# 本地预览生产版本
npm run preview
```

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| Vite 6 | 构建工具 |
| Tailwind CSS 3.4 | 样式 |
| lucide-react | 图标 |
| clsx + tailwind-merge | 类名工具 |

## 项目结构

```
src/
├── App.tsx                  # 主组件：状态管理、API调用、布局
├── main.tsx                 # 入口
├── index.css                # 主题变量、滚动条样式、JSON 高亮
├── lib/
│   ├── api-config.ts        # 端点配置、分类、渲染类型定义
│   ├── types.ts             # ResultState 类型
│   └── utils.ts             # cn() 工具函数
└── components/
    └── DataRenderer.tsx     # 所有数据渲染组件 + 错误边界
```

## API 端点列表

### 新闻资讯
每日60秒、微博热搜、知乎热榜、今日头条、百度热搜、百度实时、百度电视剧、百度贴吧、抖音热点、小红书、懂车帝、历史上的今天、AI 新闻

### 娱乐影音
B站热搜、网易云排行榜、歌词搜索、猫眼票房（全部/实时电影/实时电视/实时网播/总票房）、豆瓣每周（电影/华语剧/全球剧/华语综艺/全球综艺）

### 生活服务（右侧面板）
汇率查询、油价查询、金价查询、农历查询、奥运赛事

### 实用工具
二维码生成、Hash 计算、随机密码、密码检查、文本翻译、翻译语言列表、随机颜色、颜色调色板、健康检查、OG 信息获取、化学元素查询、百科查询、Bing 搜索、万能回答、颜色详情

### 趣味杂谈（右侧面板）
一言、随机段子、KFC 疯狂星期四、摸鱼日历

### 技术极客
IT 资讯、IT 资讯排行、Hacker News（最新/热门/最佳）、Awesome JS、Epic 免费游戏、夸克网盘、酷安、QQ 资料

## 渲染类型

| 类型 | 说明 |
|------|------|
| `news-list` | 编号列表（60秒风格） |
| `hot-list` | 排行榜（热度值、外链） |
| `card-list` | 卡片网格（封面、评分、价格） |
| `single` | 单项展示（一言、天气、农历等） |
| `table` | 表格 |
| `image` | 图片（二维码） |
| `raw` | 原始 JSON |
| `exchange-rate` | 汇率两列网格 |
| `fuel-price` | 油价趋势+价格列表 |
| `gold-price` | 金价/银价列表 |
| `lunar` | 农历日期卡片 |
| `event-list` | 赛事列表 |

## 配置

所有端点配置集中在 `src/lib/api-config.ts`：

- `endpoints` — 端点定义（path、name、category、renderType、params）
- `categories` — 分类列表
- `autoLoadEndpoints` — 自动加载的端点
- `funPanelEndpoints` / `lifePanelEndpoints` — 右侧面板端点
- `hiddenCategories` / `hiddenEndpoints` — 隐藏项
- `API_BASE` — 后端地址
