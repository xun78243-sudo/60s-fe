import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import type { ResultState } from '../lib/types';
import type { EndpointConfig } from '../lib/api-config';

// ─── Error boundary: catches render crashes so one bad card doesn't break the page ───
class CardErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <p className="p-4 text-xs text-destructive text-center">渲染异常</p>;
    }
    return this.props.children;
  }
}

/** Extract the data array or object from API response */
function extractData(raw: Record<string, unknown> | string | null): unknown {
  if (!raw || typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw;
  if (raw.data !== undefined) return extractData(raw.data as Record<string, unknown>);
  return raw;
}

/** Find the first array field in an object (for APIs that wrap arrays in objects like { date, news: [...] }) */
function findArrayField(obj: Record<string, unknown>): unknown[] | null {
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      return val as Record<string, unknown>[];
    }
  }
  // Also look for string arrays
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
      return val;
    }
  }
  return null;
}

function fmtHot(val: unknown): string {
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 10_000).toFixed(1) + '万';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function getField(obj: Record<string, unknown>, field: string): string {
  const v = obj[field];
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  return '';
}

function isTruthy(v: unknown): boolean {
  return v === true || v === 1 || v === 'true';
}

// ─── News list (60s style) ───
function NewsList({ data }: { data: string[] }) {
  return (
    <ul className="divide-y divide-border">
      {data.map((item, i) => (
        <li key={i} className="py-2 px-3 text-sm leading-relaxed text-foreground/90 hover:bg-accent/40 transition-colors rounded flex items-center gap-2">
          <span className="text-primary font-mono text-xs flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
          <span className="truncate" title={item}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Hot list (weibo/zhihu style) ───
function HotList({ data, endpoint }: { data: Record<string, unknown>[]; endpoint: EndpointConfig }) {
  const hotField = endpoint.displayFields?.find(f => f.includes('hot') || f.includes('points') || f.includes('value') || f.includes('desc') || f.includes('rate')) || '';
  return (
    <ul className="divide-y divide-border">
      {data.map((item, i) => {
        const title = getField(item, endpoint.displayFields?.[0] || '') || getField(item, 'title') || getField(item, 'name') || getField(item, 'movie_name') || getField(item, 'programme_name') || '';
        const hot = hotField ? getField(item, hotField) : '';
        const sub = getField(item, 'release_info') || getField(item, 'channel_name') || getField(item, 'release_year') || '';
        const link = getField(item, 'link') || getField(item, 'url');
        const idx = i + 1;
        const content = (
          <>
            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs font-bold
              ${idx <= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {idx}
            </span>
            <span className="flex-1 min-w-0 text-sm text-foreground/90 truncate" title={title}>{title}</span>
            {sub && <span className="flex-shrink-0 text-xs text-muted-foreground truncate max-w-[80px]" title={sub}>{sub}</span>}
            {hot && <span className="flex-shrink-0 text-xs text-primary font-mono">{fmtHot(hot)}</span>}
          </>
        );
        if (link) {
          return (
            <li key={i} className="py-2 px-3 flex items-center gap-3 hover:bg-accent/40 transition-colors rounded group cursor-pointer">
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full">
                {content}
              </a>
            </li>
          );
        }
        return (
          <li key={i} className="py-2 px-3 flex items-center gap-3 hover:bg-accent/40 transition-colors rounded group">
            {content}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Card list (movies/music/games) ───
function CardList({ data, endpoint }: { data: Record<string, unknown>[]; endpoint?: EndpointConfig }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3">
      {data.map((item, i) => {
        const title = getField(item, 'title') || getField(item, 'name') || '';
        const cover = getField(item, 'cover') || getField(item, 'img') || getField(item, 'image') || '';
        const desc = getField(item, 'desc') || getField(item, 'description') || '';
        const rating = getField(item, 'rating') || getField(item, 'score') || '';
        const price = getField(item, 'original_price_desc') || getField(item, 'price') || '';
        const boxInfo = getField(item, 'boxInfo') || getField(item, 'box_info') || '';
        const link = getField(item, 'link') || getField(item, 'url') || '';
        const isFree = isTruthy(item.is_free_now);
        const extraFields = (endpoint?.displayFields || []).filter(f => !['title','name','cover','img','image','desc','description','rating','score','price','original_price_desc','link','url','boxInfo','box_info'].includes(f));
        const content = (
          <>
            {cover && (
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-muted mb-2">
                <img src={cover} alt={title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <p className="text-xs font-medium text-foreground/90 truncate" title={title}>{title}</p>
            {desc && <p className="text-xs text-muted-foreground truncate mt-0.5" title={desc}>{desc}</p>}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {rating && <span className="text-xs text-warning font-bold">{rating}</span>}
              {price && <span className="text-xs text-muted-foreground">{price}</span>}
              {boxInfo && <span className="text-xs text-primary font-medium">{boxInfo}</span>}
              {isFree && <span className="text-xs px-1.5 py-0.5 rounded bg-success/20 text-success font-bold">免费</span>}
            </div>
            {extraFields.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {extraFields.map(f => {
                  const val = getField(item, f);
                  if (!val) return null;
                  return <span key={f} className="text-xs text-muted-foreground truncate" title={val}>{val}</span>;
                })}
              </div>
            )}
          </>
        );
        if (link) {
          return (
            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg border border-border p-2 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
              {content}
            </a>
          );
        }
        return (
          <div key={i} className="rounded-lg border border-border p-2">{content}</div>
        );
      })}
    </div>
  );
}

// ─── Single item ───
function SingleItem({ data }: { data: Record<string, unknown> | string }) {
  if (typeof data === 'string') {
    return <p className="p-4 text-sm text-foreground/90 whitespace-pre-wrap break-words">{data}</p>;
  }
  if (!data || typeof data !== 'object') {
    return <p className="p-4 text-sm text-muted-foreground">暂无数据</p>;
  }
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (entries.length === 0) return <p className="p-4 text-sm text-muted-foreground">暂无数据</p>;

  // Hitokoto quote
  if (data.hitokoto) {
    const fromStr = data.from ? String(data.from) : '';
    const fullText = String(data.hitokoto) + (fromStr ? ` —— ${fromStr}` : '');
    return (
      <div className="p-4">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{String(data.hitokoto)}</p>
        {fromStr && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-words">—— {fromStr}</p>}
      </div>
    );
  }

  if (data.kfc) {
    return (
      <div className="p-4">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{String(data.kfc)}</p>
      </div>
    );
  }

  if (data.duanzi) {
    return (
      <div className="p-4">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{String(data.duanzi)}</p>
      </div>
    );
  }

  // Weather
  if (data.temperature !== undefined || data.temp !== undefined) {
    return <WeatherCard data={data} />;
  }

  // Moyu calendar (has date + progress + today fields)
  if (data.date && typeof data.date === 'object' && data.progress) {
    return <MoyuCard data={data} />;
  }

  // Generic key-value pairs
  return (
    <div className="p-3 space-y-1.5">
      {entries.map(([key, val]) => {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) return null;
        const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground flex-shrink-0 min-w-[80px]">{key}</span>
            <span className="text-foreground/90 whitespace-pre-wrap break-words" title={displayVal}>{displayVal}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Weather card ───
function WeatherCard({ data }: { data: Record<string, unknown> }) {
  const temp = String(data.temperature ?? data.temp ?? '');
  const condition = String(data.condition ?? data.weather ?? '');
  const city = String(data.city ?? '');
  const humidity = String(data.humidity ?? '');
  const wind = String(data.wind ?? data.windDirection ?? '');
  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-3">
        <span className="text-4xl font-light text-primary">{temp}°</span>
        <div>
          <p className="text-lg font-medium text-foreground">{city} · {condition}</p>
          <p className="text-xs text-muted-foreground">湿度 {humidity} · {wind}</p>
        </div>
      </div>
      {Object.entries(data)
        .filter(([k]) => !['temperature','temp','condition','weather','city','humidity','wind','windDirection'].includes(k))
        .slice(0, 8)
        .map(([key, val]) => {
          if (typeof val === 'object' && val !== null) return null;
          return (
            <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{key}:</span>
              <span className="text-foreground/80">{String(val)}</span>
            </div>
          );
        })}
    </div>
  );
}

// ─── Moyu calendar card ───
function MoyuCard({ data }: { data: Record<string, unknown> }) {
  const dateObj = data.date as Record<string, unknown> | undefined;
  const lunar = dateObj?.lunar as Record<string, unknown> | undefined;
  const today = data.today as Record<string, unknown> | undefined;
  const progress = data.progress as Record<string, Record<string, unknown>> | undefined;
  const nextHoliday = data.nextHoliday as Record<string, unknown> | undefined;

  const gregorian = dateObj ? getField(dateObj, 'gregorian') : '';
  const weekday = dateObj ? getField(dateObj, 'weekday') : '';
  const lunarStr = lunar ? `${getField(lunar, 'monthCN')}${getField(lunar, 'dayCN')}` : '';
  const zodiac = lunar ? getField(lunar, 'zodiac') : '';
  const isWeekend = today ? String(today.isWeekend) === 'true' : false;
  const holidayName = nextHoliday ? getField(nextHoliday, 'name') : '';

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{gregorian.slice(-2)}</p>
          <p className="text-xs text-muted-foreground">{weekday}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{gregorian}</p>
          <p className="text-xs text-muted-foreground">农历 {lunarStr} · 生肖{zodiac}</p>
          {isWeekend && <span className="text-xs px-1.5 py-0.5 rounded bg-success/20 text-success font-bold">周末</span>}
          {holidayName && <span className="text-xs px-1.5 py-0.5 rounded bg-warning/20 text-warning font-bold ml-1">下一个假期: {holidayName}</span>}
        </div>
      </div>
      {progress && (
        <div className="space-y-1.5 mt-3">
          {Object.entries(progress).map(([period, info]) => {
            const p = info as Record<string, unknown>;
            const pct = Number(p.percentage ?? 0);
            return (
              <div key={period}>
                <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                  <span>{period === 'week' ? '本周' : period === 'month' ? '本月' : '本年'}</span>
                  <span>{pct}% 已过</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Table ───
function TableRenderer({ data }: { data: Record<string, unknown>[] | Record<string, unknown> }) {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return <p className="p-4 text-sm text-muted-foreground">暂无数据</p>;
  const keys = Object.keys(items[0]).filter(k => {
    const v = items[0][k];
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  });
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {keys.slice(0, 6).map(k => (
              <th key={k} className="text-left py-2 px-3 text-muted-foreground font-medium">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
              {keys.slice(0, 6).map(k => (
                <td key={k} className="py-1.5 px-3 text-foreground/80 max-w-[200px] truncate">{String(item[k] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Image ───
function ImageRenderer({ url }: { url: string }) {
  return (
    <div className="p-4 flex items-center justify-center">
      <img src={url} alt="result" className="max-w-full max-h-[300px] rounded-lg" />
    </div>
  );
}

// ─── Raw JSON ───
function RawJson({ data }: { data: Record<string, unknown> | string | null }) {
  return (
    <pre className="p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground/70">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/** Safely convert any value to string, handling nested objects with name/name_short */
function safeStr(v: unknown, fallback = ''): string {
  if (v == null) return fallback;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const o = v as Record<string, unknown>;
  if (typeof o.name === 'string') return o.name;
  if (typeof o.name_short === 'string') return o.name_short;
  if (typeof o.label === 'string') return o.label;
  try { return JSON.stringify(v); } catch { return fallback; }
}

// ─── Exchange rate card ───
const MAJOR_CURRENCIES = ['USD','EUR','GBP','JPY','HKD','KRW','SGD','THB','TWD','MYR','INR','IDR','PHP','VND','RUB','MOP','AUD','CAD','NZD','CHF','SEK','NOK','DKK'];
function ExchangeRateCard({ data }: { data: Record<string, unknown> | string }) {
  if (typeof data !== 'object' || !data) return <RawJson data={data} />;
  const d = data as Record<string, unknown>;
  const rates = d.rates as Array<Record<string, unknown>> | undefined;
  const updated = safeStr(d.updated);
  if (!rates) return <RawJson data={data} />;
  const filtered = rates.filter(r => MAJOR_CURRENCIES.includes(safeStr(r.currency)));
  return (
    <div className="p-3">
      <p className="text-xs text-muted-foreground mb-2">基准 CNY · {updated.replace(/^(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3')}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {filtered.map(r => (
          <div key={safeStr(r.currency)} className="flex justify-between py-1 px-2 rounded hover:bg-accent/40">
            <span className="font-medium text-foreground/80">{safeStr(r.currency)}</span>
            <span className="text-foreground/90 font-mono">{Number(r.rate).toFixed(6)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fuel price card ───
function FuelPriceCard({ data }: { data: Record<string, unknown> | string }) {
  if (typeof data !== 'object' || !data) return <RawJson data={data} />;
  const d = data as Record<string, unknown>;
  const region = safeStr(d.region);
  const trend = d.trend as Record<string, unknown> | undefined;
  const items = d.items as Array<Record<string, unknown>> | undefined;
  const direction = safeStr(trend?.direction);
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">{region}</span>
        {direction && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            direction === '下调' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            direction === '上调' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-muted text-muted-foreground'
          }`}>
            {direction === '下调' ? '↓' : direction === '上调' ? '↑' : '→'} {direction}
          </span>
        )}
      </div>
      {items && (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs py-1.5 px-2 rounded bg-muted/30">
              <span className="text-foreground/80">{safeStr(item.name)}</span>
              <span className="font-semibold text-foreground">{safeStr(item.price_desc) || String(item.price ?? '')}</span>
            </div>
          ))}
        </div>
      )}
      {trend?.change_liter_desc && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{safeStr(trend.description)}</p>
      )}
    </div>
  );
}

// ─── Gold price card ───
function GoldPriceCard({ data }: { data: Record<string, unknown> | string }) {
  if (typeof data !== 'object' || !data) return <RawJson data={data} />;
  const d = data as Record<string, unknown>;
  const date = safeStr(d.date);
  const metals = d.metals as Array<Record<string, unknown>> | undefined;
  if (!metals) return <RawJson data={data} />;
  const keyMetals = metals.filter(m => {
    const name = safeStr(m.name);
    return name.includes('金价') || name.includes('黄金') || name.includes('铂金') || name.includes('银');
  }).slice(0, 5);
  return (
    <div className="p-3">
      {date && <p className="text-xs text-muted-foreground mb-2">{date}</p>}
      <div className="space-y-1.5">
        {keyMetals.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-muted/30">
            <span className="text-foreground/80">{safeStr(m.name)}</span>
            <div className="text-right">
              <span className="font-semibold text-foreground">{safeStr(m.sell_price) || safeStr(m.today_price)}</span>
              <span className="text-muted-foreground ml-1">{safeStr(m.unit, '元/克')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lunar calendar card ───
function LunarCard({ data }: { data: Record<string, unknown> | string }) {
  if (typeof data !== 'object' || !data) return <RawJson data={data} />;
  const d = data as Record<string, unknown>;
  const solar = d.solar as Record<string, unknown> | undefined;
  const lunar = d.lunar as Record<string, unknown> | undefined;
  return (
    <div className="p-3 space-y-3">
      {solar && (
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{safeStr(solar.full)}</p>
          <p className="text-xs text-muted-foreground">{safeStr(solar.week_desc)}</p>
        </div>
      )}
      {lunar && (
        <div className="text-center bg-muted/30 rounded-lg py-2">
          <p className="text-sm font-medium text-foreground/90">
            农历 {safeStr(lunar.year)}年{safeStr(lunar.month)}月{safeStr(lunar.day)}日
          </p>
          {lunar.full_with_hour && (
            <p className="text-xs text-muted-foreground mt-0.5">{safeStr(lunar.full_with_hour)}</p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 justify-center text-xs">
        {d.constellation && <span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground">{safeStr(d.constellation)}</span>}
        {d.zodiac && <span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground">生肖 {safeStr(d.zodiac)}</span>}
        {d.year_progress !== undefined && <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground">年进度 {Number(d.year_progress).toFixed(1)}%</span>}
      </div>
      {d.festivals && Array.isArray(d.festivals) && (d.festivals as unknown[]).length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">节日</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {(d.festivals as string[]).map((f, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">{f}</span>
            ))}
          </div>
        </div>
      )}
      {d.jieqi && <p className="text-center text-xs text-muted-foreground">节气: {safeStr(d.jieqi)}</p>}
    </div>
  );
}

// ─── Event list (Olympics events etc.) ───
function EventList({ data }: { data: Record<string, unknown>[] | Record<string, unknown> }) {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return <p className="p-4 text-sm text-muted-foreground">暂无数据</p>;
  const visible = items.slice(0, 10);
  return (
    <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto scrollbar-hover">
      {visible.map((item, i) => {
        const name = safeStr(item.name) || safeStr(item.title);
        const year = safeStr(item.year);
        const season = safeStr(item.season);
        const logo = safeStr(item.logo) || safeStr(item.cover);
        const url = safeStr(item.url) || safeStr(item.link);
        const content = (
          <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/40 transition-colors">
            {logo && (
              <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img src={logo} alt={name} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90 truncate">{name}</p>
              <p className="text-xs text-muted-foreground">{year} · {season}</p>
            </div>
          </div>
        );
        if (url) {
          return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
        }
        return <div key={i}>{content}</div>;
      })}
    </div>
  );
}

// ─── Main DataRenderer ───
interface DataRendererProps {
  result: ResultState;
  endpoint: EndpointConfig;
  onRefresh: () => void;
}

export function DataRenderer({ result, endpoint, onRefresh }: DataRendererProps) {
  const { data, error, isImage, imageUrl, loading } = result;

  // Only show loading state on initial load (no data yet)
  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 text-sm text-destructive">
        <p>请求失败: {error}</p>
        <button onClick={onRefresh} className="mt-2 text-xs text-primary hover:underline">重试</button>
      </div>
    );
  }

  // 图片渲染（带刷新遮罩）
  if (isImage && imageUrl) {
    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-card/50 flex items-center justify-center z-10 backdrop-blur-[1px] rounded-b-xl">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          </div>
        )}
        <ImageRenderer url={imageUrl} />
      </div>
    );
  }
  if (!data) return <p className="p-4 text-sm text-muted-foreground">暂无数据</p>;

  // 渲染内容主体，外层包裹刷新遮罩
  const rendered = (() => {
    try {
      const extracted = extractData(data);
      const renderType = endpoint.renderType || 'raw';

      if (renderType === 'raw') {
        if (Array.isArray(extracted) && extracted.length > 0 && typeof extracted[0] === 'object') {
          return <HotList data={extracted as Record<string, unknown>[]} endpoint={endpoint} />;
        }
        return <RawJson data={data} />;
      }

      if (renderType === 'news-list') {
        let newsArr: string[] = [];
        if (Array.isArray(extracted)) {
          newsArr = extracted.map(String);
        } else if (typeof extracted === 'object' && extracted !== null) {
          const newsData = (extracted as Record<string, unknown>).news;
          if (Array.isArray(newsData)) newsArr = newsData.map(String);
        }
        return <NewsList data={newsArr} />;
      }

      if (renderType === 'hot-list') {
        if (Array.isArray(extracted)) return <HotList data={extracted as Record<string, unknown>[]} endpoint={endpoint} />;
        if (typeof extracted === 'object' && extracted !== null) {
          const arr = findArrayField(extracted as Record<string, unknown>);
          if (arr) return <HotList data={arr as Record<string, unknown>[]} endpoint={endpoint} />;
        }
        return <RawJson data={data} />;
      }

      if (renderType === 'card-list') {
        if (Array.isArray(extracted)) return <CardList data={extracted as Record<string, unknown>[]} endpoint={endpoint} />;
        if (typeof extracted === 'object' && extracted !== null) {
          const arr = findArrayField(extracted as Record<string, unknown>);
          if (arr) return <CardList data={arr as Record<string, unknown>[]} endpoint={endpoint} />;
        }
        return <RawJson data={data} />;
      }

      if (renderType === 'single') {
        if (extracted === null || extracted === undefined) return <p className="p-4 text-sm text-muted-foreground">暂无数据</p>;
        return <SingleItem data={extracted as Record<string, unknown> | string} />;
      }

      if (renderType === 'table') {
        if (Array.isArray(extracted)) return <TableRenderer data={extracted as Record<string, unknown>[]} />;
        if (typeof extracted === 'object' && extracted !== null) return <TableRenderer data={extracted as Record<string, unknown>} />;
        return <RawJson data={data} />;
      }

      if (renderType === 'image') {
        if (imageUrl) return <ImageRenderer url={imageUrl} />;
        if (typeof extracted === 'object' && extracted !== null) {
          const img = getField(extracted as Record<string, unknown>, 'url') || getField(extracted as Record<string, unknown>, 'image') || getField(extracted as Record<string, unknown>, 'cover');
          if (img) return <ImageRenderer url={img} />;
        }
        return <RawJson data={data} />;
      }

      if (renderType === 'exchange-rate') {
        return <ExchangeRateCard data={extracted as Record<string, unknown> | string} />;
      }
      if (renderType === 'fuel-price') {
        return <FuelPriceCard data={extracted as Record<string, unknown> | string} />;
      }
      if (renderType === 'gold-price') {
        return <GoldPriceCard data={extracted as Record<string, unknown> | string} />;
      }
      if (renderType === 'lunar') {
        return <LunarCard data={extracted as Record<string, unknown> | string} />;
      }
      if (renderType === 'event-list') {
        if (Array.isArray(extracted)) return <EventList data={extracted as Record<string, unknown>[]} />;
        if (typeof extracted === 'object' && extracted !== null) {
          const arr = findArrayField(extracted as Record<string, unknown>);
          if (arr) return <EventList data={arr as Record<string, unknown>[]} />;
        }
        return <RawJson data={data} />;
      }

      return <RawJson data={data} />;
    } catch {
      return <RawJson data={data} />;
    }
  })();

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-card/50 flex items-center justify-center z-10 backdrop-blur-[1px] rounded-b-xl">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        </div>
      )}
      <CardErrorBoundary>
        {rendered}
      </CardErrorBoundary>
    </div>
  );
}
