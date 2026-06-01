import { Search, RefreshCw, ChevronDown, Plus, Loader2, X } from 'lucide-react';
import { EndpointConfig, API_BASE, endpoints, categories, autoLoadEndpoints, hiddenCategories, hiddenEndpoints, funPanelEndpoints, lifePanelEndpoints, ParamConfig, categoryDefaultCards } from './lib/api-config';
import { ResultState } from './lib/types';
import { DataRenderer } from './components/DataRenderer';
import { cn } from './lib/utils';
import { useState, useCallback, useEffect, useRef } from 'react';

interface CustomEndpoint {
  path: string;
  params?: Record<string, string>;
}

const CUSTOM_ENDPOINTS_KEY = 'customEndpoints';

function loadCustomEndpoints(): CustomEndpoint[] {
  try {
    const stored = localStorage.getItem(CUSTOM_ENDPOINTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomEndpoints(eps: CustomEndpoint[]) {
  localStorage.setItem(CUSTOM_ENDPOINTS_KEY, JSON.stringify(eps));
}

function App() {
  // 强制使用明亮模式
  useEffect(() => { document.documentElement.classList.remove('dark'); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const loadedRef = useRef(false);

  const callApi = useCallback(async (endpoint: EndpointConfig, paramValues?: Record<string, string>) => {
    const key = endpoint.path;
    let urlPath = endpoint.path;
    const queryParams: string[] = [];

    for (const param of endpoint.params || []) {
      const value = paramValues?.[param.name] || '';
      if (param.name === 'id' && urlPath.includes(':id')) {
        urlPath = urlPath.replace(':id', value);
      } else if (value) {
        queryParams.push(`${param.name}=${encodeURIComponent(value)}`);
      }
    }

    const fullUrl = `${API_BASE}${urlPath}${queryParams.length ? '?' + queryParams.join('&') : ''}`;

    // Show loading state while keeping current data as fallback
    setResults(prev => {
      const old = prev[key];
      return {
        ...prev,
        [key]: {
          endpointPath: endpoint.path,
          endpointName: endpoint.name,
          category: endpoint.category,
          data: old?.data ?? null,
          status: 0,
          loading: true,
          error: null,
          isImage: endpoint.isImage || false,
          imageUrl: old?.imageUrl ?? null,
          fetchedAt: Date.now()
        },
      };
    });

    try {
      if (endpoint.isImage) {
        setResults(prev => {
          const old = prev[key];
          return {
            ...prev,
            [key]: { endpointPath: endpoint.path, endpointName: endpoint.name, category: endpoint.category, data: old?.data ?? null, status: 200, loading: false, error: null, isImage: true, imageUrl: fullUrl, fetchedAt: Date.now() },
          };
        });
        return;
      }

      const res = await fetch(fullUrl);
      const text = await res.text();
      let data: Record<string, unknown> | string;
      try { data = JSON.parse(text) as Record<string, unknown>; } catch { data = text; }

      setResults(prev => ({
        ...prev,
        [key]: { endpointPath: endpoint.path, endpointName: endpoint.name, category: endpoint.category, data, status: res.status, loading: false, error: null, isImage: false, imageUrl: null, fetchedAt: Date.now() },
      }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [key]: { endpointPath: endpoint.path, endpointName: endpoint.name, category: endpoint.category, data: null, status: 0, loading: false, error: String(err), isImage: false, imageUrl: null, fetchedAt: Date.now() },
      }));
    }
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    for (const path of autoLoadEndpoints) {
      const ep = endpoints.find(e => e.path === path);
      if (ep && !ep.params?.some(p => p.required)) {
        callApi(ep);
      }
    }
    const custom = loadCustomEndpoints();
    for (const ce of custom) {
      if (autoLoadEndpoints.includes(ce.path)) continue;
      const ep = endpoints.find(e => e.path === ce.path);
      if (ep) {
        callApi(ep, ce.params);
      }
    }
  }, [callApi]);

  const handleAddEndpoint = useCallback((endpoint: EndpointConfig, paramValues?: Record<string, string>) => {
    callApi(endpoint, paramValues);
    if (!autoLoadEndpoints.includes(endpoint.path)) {
      const current = loadCustomEndpoints();
      if (!current.some(e => e.path === endpoint.path)) {
        current.push({ path: endpoint.path, params: paramValues });
        saveCustomEndpoints(current);
      }
    }
  }, [callApi]);

  const handleRemoveEndpoint = useCallback((path: string) => {
    setResults(prev => { const n = { ...prev }; delete n[path]; return n; });
    const current = loadCustomEndpoints();
    const next = current.filter(e => e.path !== path);
    saveCustomEndpoints(next);
  }, []);

  const customPaths = new Set(loadCustomEndpoints().map(e => e.path));

  // ─── Group results by category, excluding hidden ones ───
  const groupedResults: Record<string, { endpoint: EndpointConfig; result: ResultState }[]> = {};
  for (const [path, result] of Object.entries(results)) {
    if (hiddenCategories.includes(result.category)) continue;
    if (hiddenEndpoints.includes(path)) continue;
    if (funPanelEndpoints.includes(path)) continue;
    if (lifePanelEndpoints.includes(path)) continue;
    const cat = result.category;
    const ep = endpoints.find(e => e.path === path);
    if (!ep) continue;
    if (!groupedResults[cat]) groupedResults[cat] = [];
    groupedResults[cat].push({ endpoint: ep, result });
  }

  for (const cat of Object.keys(groupedResults)) {
    groupedResults[cat].sort((a, b) => {
      const aCustom = customPaths.has(a.endpoint.path) ? 0 : 1;
      const bCustom = customPaths.has(b.endpoint.path) ? 0 : 1;
      if (aCustom !== bCustom) return aCustom - bCustom;
      const aAuto = autoLoadEndpoints.includes(a.endpoint.path) ? 0 : 1;
      const bAuto = autoLoadEndpoints.includes(b.endpoint.path) ? 0 : 1;
      if (aAuto !== bAuto) return aAuto - bAuto;
      return a.endpoint.name.localeCompare(b.endpoint.name);
    });
  }

  const visibleCategories = categories.filter(cat => !hiddenCategories.includes(cat.id));
  const filteredCategories = visibleCategories.filter(cat => {
    if (activeCategory !== 'all' && cat.id !== activeCategory) return false;
    return true;
  });

  // ─── Fun panel data ───
  const funItems = funPanelEndpoints
    .map(path => {
      const ep = endpoints.find(e => e.path === path);
      const result = results[path];
      return ep && result ? { endpoint: ep, result } : null;
    })
    .filter((item): item is { endpoint: EndpointConfig; result: ResultState } => item !== null);

  // ─── Life panel data ───
  const lifePanelItems = lifePanelEndpoints
    .map(path => {
      const ep = endpoints.find(e => e.path === path);
      const result = results[path];
      return ep && result ? { endpoint: ep, result } : null;
    })
    .filter((item): item is { endpoint: EndpointConfig; result: ResultState } => item !== null);

  const unloadedEndpoints = endpoints.filter(ep => {
    if (hiddenCategories.includes(ep.category)) return false;
    if (hiddenEndpoints.includes(ep.path)) return false;
    if (funPanelEndpoints.includes(ep.path)) return false;
    if (lifePanelEndpoints.includes(ep.path)) return false;
    if (ep.params?.some(p => p.required)) return true;
    if (results[ep.path]) return false;
    const matchSearch = !searchQuery || ep.name.includes(searchQuery) || ep.desc.includes(searchQuery) || ep.path.includes(searchQuery);
    const matchCat = activeCategory === 'all' || ep.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <span className="text-primary text-sm font-bold">60</span>
            </div>
            <h1 className="text-base font-bold text-foreground hidden sm:block">60s 资讯聚合</h1>
          </div>

          <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              全部
            </button>
            {visibleCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text" placeholder="搜索..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-36 pl-8 pr-3 py-1.5 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {/* Plus button instead of Send */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn('p-2 rounded-md border transition-colors',
                sidebarOpen ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground')}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1800px] mx-auto w-full">
        <main className="flex-1 min-w-0 py-4 px-4">
          <div className="flex gap-4">
            {/* Left: main grid (3 cols) */}
            <div className="flex-1 min-w-0 space-y-6">
              {filteredCategories.map(cat => {
                if (cat.id === 'fun') return null;
                const catResults = groupedResults[cat.id];
                if (activeCategory !== 'all' && !catResults?.length) return null;
                const defaultCount = categoryDefaultCards[cat.id] ?? catResults?.length ?? 0;
                const customCount = catResults?.filter(r => customPaths.has(r.endpoint.path)).length ?? 0;
                const effectiveDefault = defaultCount + customCount;
                const isExpanded = expandedCats.has(cat.id);
                const visibleResults = isExpanded ? catResults : catResults?.slice(0, effectiveDefault);
                const hasMore = (catResults?.length ?? 0) > effectiveDefault;
                return (
                  <section key={cat.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{cat.icon}</span>
                      <h2 className="text-base font-bold text-foreground">{cat.name}</h2>
                      {catResults && <span className="text-xs text-muted-foreground">({catResults.length})</span>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleResults?.map(({ endpoint, result }) => (
                         <FeedCard key={endpoint.path} endpoint={endpoint} result={result}
                           onRefresh={() => callApi(endpoint)}
                           onRemove={() => handleRemoveEndpoint(endpoint.path)} />
                      ))}
                      {!catResults?.length && activeCategory === 'all' && (
                        <p className="text-xs text-muted-foreground py-4">点击右上角 + 加载更多</p>
                      )}
                    </div>
                    {hasMore && !isExpanded && (
                      <button onClick={() => setExpandedCats(prev => new Set(prev).add(cat.id))}
                        className="mt-2 text-xs text-primary hover:underline">
                        展开更多（共 {catResults!.length} 个）
                      </button>
                    )}
                    {isExpanded && hasMore && (
                      <button onClick={() => setExpandedCats(prev => { const n = new Set(prev); n.delete(cat.id); return n; })}
                        className="mt-2 text-xs text-primary hover:underline">
                        收起
                      </button>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Right: Fun panel + Life panel */}
            {(funItems.length > 0 || lifePanelItems.length > 0) && (
              <div className="hidden xl:block w-[calc(25%-12px)] flex-shrink-0 space-y-6">
                {funItems.length > 0 && <FunPanel items={funItems} onRefresh={(ep) => callApi(ep)} onRemove={(path) => handleRemoveEndpoint(path)} />}
                {lifePanelItems.length > 0 && <LifePanel items={lifePanelItems} onRefresh={(ep) => callApi(ep)} onRemove={(path) => handleRemoveEndpoint(path)} />}
              </div>
            )}
          </div>
        </main>

        {/* ─── Sidebar: Add endpoints ─── */}
        {sidebarOpen && (
          <aside className="w-72 flex-shrink-0 border-l border-border bg-card/50 overflow-y-auto scrollbar-hover max-h-[calc(100vh-60px)] sticky top-[60px]">
            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground mb-3">添加频道</h3>
              <div className="space-y-1">
                {unloadedEndpoints.map(ep => (
                  <SidebarItem key={ep.path} endpoint={ep} onCall={handleAddEndpoint} loading={results[ep.path]?.loading || false} />
                ))}
                {unloadedEndpoints.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">所有频道已加载</p>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Fun Panel: right-side column, vertically stacked sub-cards ───
function FunPanel({ items, onRefresh, onRemove }: {
  items: { endpoint: EndpointConfig; result: ResultState }[];
  onRefresh: (ep: EndpointConfig) => void;
  onRemove: (path: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎲</span>
        <h2 className="text-base font-bold text-foreground">趣味杂谈</h2>
      </div>
      {items.map(({ endpoint, result }) => (
        <div key={endpoint.path} className={cn(
          'rounded-xl border bg-card overflow-hidden transition-all',
          result.loading ? 'border-primary/30' : result.error ? 'border-destructive/30' : 'border-border'
        )}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground truncate">{endpoint.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onRefresh(endpoint)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className={cn('h-3 w-3', result.loading && 'animate-spin')} />
              </button>
              <button onClick={() => onRemove(endpoint.path)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          {/* Scrollable body */}
          <div>
            <DataRenderer result={result} endpoint={endpoint} onRefresh={() => onRefresh(endpoint)} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Life Panel: right-side column, below fun panel ───
function LifePanel({ items, onRefresh, onRemove }: {
  items: { endpoint: EndpointConfig; result: ResultState }[];
  onRefresh: (ep: EndpointConfig) => void;
  onRemove: (path: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🌤</span>
        <h2 className="text-base font-bold text-foreground">生活服务</h2>
      </div>
      {items.map(({ endpoint, result }) => (
        <div key={endpoint.path} className={cn(
          'rounded-xl border bg-card overflow-hidden transition-all',
          result.loading ? 'border-primary/30' : result.error ? 'border-destructive/30' : 'border-border'
        )}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground truncate">{endpoint.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onRefresh(endpoint)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className={cn('h-3 w-3', result.loading && 'animate-spin')} />
              </button>
              <button onClick={() => onRemove(endpoint.path)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto scrollbar-hover">
            <DataRenderer result={result} endpoint={endpoint} onRefresh={() => onRefresh(endpoint)} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Feed Card ───
function FeedCard({ endpoint, result, onRefresh, onRemove }: {
  endpoint: EndpointConfig;
  result: ResultState;
  onRefresh: () => void;
  onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden transition-all',
      result.loading ? 'border-primary/30' : result.error ? 'border-destructive/30' : 'border-border'
    )}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-1.5 min-w-0 cursor-pointer select-none"
          onClick={() => setCollapsed(c => !c)}>
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', collapsed && '-rotate-90')} />
          <h3 className="text-sm font-semibold text-foreground truncate">{endpoint.name}</h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {result.status > 0 && (
            <span className={cn('text-xs font-mono', result.status >= 200 && result.status < 300 ? 'text-success' : 'text-destructive')}>
              {result.status}
            </span>
          )}
          <button onClick={onRefresh} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="刷新">
            <RefreshCw className={cn('h-3.5 w-3.5', result.loading && 'animate-spin')} />
          </button>
          <button onClick={onRemove} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="关闭">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className={cn('grid transition-[grid-template-rows] duration-200', collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]')}>
        <div className="overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto scrollbar-hover">
            <DataRenderer result={result} endpoint={endpoint} onRefresh={onRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar item ───
function SidebarItem({ endpoint, onCall, loading }: { endpoint: EndpointConfig; onCall: (ep: EndpointConfig, params?: Record<string, string>) => void; loading: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const p of endpoint.params || []) {
      v[p.name] = p.type === 'select' ? (p.options?.[0]?.value || '') : '';
    }
    return v;
  });

  const hasParams = endpoint.params && endpoint.params.length > 0;
  const hasRequiredParams = endpoint.params?.some(p => p.required);

  const handleCall = () => {
    if (hasRequiredParams) {
      for (const p of endpoint.params!) {
        if (p.required && !paramValues[p.name]?.trim()) return;
      }
    }
    onCall(endpoint, hasParams ? paramValues : undefined);
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        onClick={() => hasParams ? setExpanded(!expanded) : handleCall()}
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-accent/50 transition-colors">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary flex-shrink-0" />
        ) : hasParams ? (
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform', expanded && 'rotate-180')} />
        ) : (
          <Plus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-foreground truncate flex-1">{endpoint.name}</span>
      </button>
      {hasParams && expanded && (
        <div className="px-3 pb-2 space-y-2 border-t border-border/50 pt-2">
          {endpoint.params!.map(param => (
            <ParamInput key={param.name} param={param} value={paramValues[param.name] || ''} onChange={v => setParamValues(prev => ({ ...prev, [param.name]: v }))} />
          ))}
          <button onClick={handleCall} disabled={loading}
            className="w-full py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            发送请求
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Param input ───
function ParamInput({ param, value, onChange }: { param: ParamConfig; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-0.5 block">
        {param.label}{param.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {param.type === 'select' && param.options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring">
          {param.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type="text" placeholder={param.placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onChange(value)}
          className="w-full px-2 py-1 rounded border border-border bg-background text-foreground text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring" />
      )}
    </div>
  );
}

export default App;
