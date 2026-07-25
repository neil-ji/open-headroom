// ── I18N translations for Headroom Dashboard ──
// English keys are used as-is; Chinese translations mapped below.

const zh: Record<string, string> = {
  // Header & nav
  Session: "会话",
  Lifetime: "累计",
  History: "历史",
  Historical: "历史",
  Language: "语言",
  "Anon Telemetry": "匿名遥测",
  Status: "状态",
  Healthy: "健康",
  Error: "异常",
  Updated: "更新于",
  Settings: "设置",
  Dashboard: "控制台",
  "Live Feed": "实时流",
  Feed: "实时流",
  "Toggle light/dark mode": "切换明暗主题",
  "Anonymous aggregate telemetry is enabled. Disable with HEADROOM_TELEMETRY=off or --no-telemetry.":
    "匿名聚合遥测已启用。使用 HEADROOM_TELEMETRY=off 或 --no-telemetry 禁用。",
  Documentation: "文档",
  loading: "加载中",
  "s ago": "秒前",
  "m ago": "分前",

  // Overview
  Overview: "概览",
  "Request Health": "请求健康",
  Completed: "已完成",
  Failed: "失败",
  "Rate Limited": "被限流",
  Cached: "已缓存",
  "Live Activity": "实时活动",
  "Active Requests": "活跃请求",
  "Active WebSockets": "活跃 WebSocket",
  "Relay Tasks": "中继任务",
  "Compression Queued": "待压缩",

  // Savings
  "Savings Breakdown": "节省明细",
  "Token Savings": "Token 节省",
  "Output Tokens Saved": "输出 Token 节省",
  "Tool-Schema Deferral": "工具模式延迟",
  Proxy: "代理",
  "Of total wire:": "总传输占比:",

  // Performance
  Performance: "性能",
  Overhead: "开销",
  Throughput: "吞吐量",
  "Overhead Range": "开销范围",
  "TTFB Range": "首字节范围",
  "Failed Requests": "失败请求",
  "Pipeline Breakdown": "管道明细",
  Requests: "请求",
  "Output Tokens": "输出 Token",

  // Token Flow
  "Token Flow": "Token 流向",
  "Token Usage": "Token 用量",
  "Before Compression": "压缩前",
  "After Compression (sent)": "压缩后 (已发送)",
  "What Headroom Removed": "Headroom 移除了什么",
  "Savings Over Time": "节省趋势",
  "Proxy Removed": "代理已移除",
  "Input (wall / active p50)": "输入 (时钟 / 活跃中位)",
  "Forward (p50 / p95)": "转发 (中位 / P95)",

  // Cache
  "Cache & Efficiency": "缓存与效率",
  "Prefix Cache Impact": "前缀缓存影响",
  "Cache Writes": "缓存写入",
  "Hit Rate": "命中率",
  "Cache Busts": "缓存失效",
  Providers: "提供商",
  "Cache Efficiency": "缓存效率",
  "Observed TTL Buckets": "观察到的 TTL 桶",
  "Compression vs Cache": "压缩 vs 缓存",
  "Cache Miss Attribution": "缓存未命中归因",
  Net: "净值",
  "Prefix Freeze Net": "前缀冻结净值",
  "TTL Expiry": "TTL 过期",
  "Prefix Change": "前缀变化",
  Unknown: "未知",
  "Total Misses": "总未命中",
  "Per-Provider Breakdown": "按提供商明细",

  // Clients & Models
  "Clients & Models": "客户端与模型",
  "Agent Usage": "Agent 用量",
  Before: "压缩前",
  After: "压缩后",
  Saved: "已节省",
  Savings: "节省率",
  "Token flow": "Token 流向",
  Share: "占比",
  "Per-Model Token Savings": "按模型 Token 节省",
  Model: "模型",
  Reduction: "缩减",
  "Tokens Saved": "Token 已节省",
  "Tokens Sent": "Token 已发送",
  "Show all models": "显示所有模型",
  "Show only this model": "仅显示此模型",
  "Show only this model in the chart": "在图表中仅显示此模型",

  // Activity Log
  "Activity Log": "活动日志",
  "Recent Requests": "最近请求",
  Time: "时间",
  Input: "输入",
  Output: "输出",
  Latency: "延迟",
  "Transforms Applied": "已应用转换",
  "Waste Detected": "检测到废弃物",

  // Quota
  "Anthropic Subscription Window": "Anthropic 订阅窗口",
  "OpenAI Codex Rate-Limit Window": "OpenAI Codex 速率限制窗口",
  "GitHub Copilot Quota": "GitHub Copilot 配额",
  "Resets in": "重置倒计时",
  "Monthly Reset": "每月重置",

  // Lifetime
  "Lifetime data since": "累计数据自",
  "Full metric coverage since": "完整指标覆盖自",
  "Cumulative savings across all sessions since": "自运行以来的累计节省",
  "Per-Project Savings": "按项目节省",
  "No per-project data yet.": "暂无项目数据。",
  Project: "项目",
  "Last Active": "最近活跃",
  "Loading lifetime data…": "加载累计数据…",
  "Persistence healthy": "持久化正常",
  "Persistence degraded": "持久化降级",
  "Tokens & Cost": "Token 与费用",
  "Attempted Input": "原始输入",
  "Input cost": "输入费用",
  "Compression saved": "压缩节省",
  "Prefix Cache saved": "前缀缓存节省",
  "Hits / requests": "命中 / 请求",
  "Read / write": "读取 / 写入",
  "TTL 1h / 5m": "TTL 1小时 / 5分钟",
  "Cache bust": "缓存失效",
  "Saved $": "节省 $",
  Stacks: "技术栈",
  "Top Models": "热门模型",
  "No data": "无数据",
  "project(s)": "个项目",

  // History
  "Historical Proxy Compression": "历史代理压缩",
  "Export JSON": "导出 JSON",
  "Export CSV": "导出 CSV",
  "Exporting…": "导出中…",
  "Daily Savings": "每日节省",
  "Weekly Savings": "每周节省",
  "Monthly Savings": "每月节省",
  "Historical Savings Trend": "历史节省趋势",
  "Per-Model Breakdown": "按模型分解",
  "Historical Summary": "历史摘要",
  "No persisted savings history yet": "尚无持久化节省历史",
  "Loading history…": "加载历史…",
  "Durable local savings history": "持久化本地节省历史",
  "Durable local savings history with trend analysis and checkpoints": "持久化本地节省历史，含趋势分析与检查点",
  "Lifetime Compression Savings": "累计压缩节省",
  "Lifetime Tokens Saved": "累计 Token 节省",
  "Active Days": "活跃天数",
  "Average Saved / Day": "日均节省",
  "Average Saved / Week": "周均节省",
  Daily: "每日",
  Weekly: "每周",
  Monthly: "每月",
  Checkpoints: "检查点",
  "Need more data points for trend.": "需要更多数据点以显示趋势。",
  "Recent Checkpoints": "最近检查点",
  "Cumulative proxy compression savings": "累积代理压缩节省",
  tokens: "Token",
  "Latest total": "最新总计",
  "Selected points": "已选数据点",
  Retention: "保留策略",
  "Historical data is written locally after proxy requests save tokens. Keep using Headroom and this view will fill in automatically across restarts.":
    "历史数据在代理请求节省 Token 后写入本地。继续使用 Headroom，此视图将随重启自动填充。",

  // Settings
  Advanced: "高级",
  Dashboard: "控制台",
  Save: "保存",
  "Apply & Restart": "应用并重启",
  "Clear stored value": "清除已存储值",
  "Configure Headroom runtime knobs. Changes need a restart to apply.":
    "配置 Headroom 运行时参数。更改需要重启才能生效。",
  "Saved. To apply, run the command on the host:": "已保存。在宿主机上运行以下命令以应用:",
  "Saved. Restart the proxy to apply.": "已保存。重启代理以应用。",
  "Managed by the install manifest — change via": "由安装清单管理 — 通过",
  "Overridden by environment variable": "已被环境变量",
  "edits here have no effect until it's unset.": "该变量取消前此处编辑无效。",

  // KPI Bar
  failed: "失败",
  saved: "已节省",
  "tok/s": "tok/s",
  "fwd tok/s": "转发 tok/s",

  // StatusBlock
  Retry: "重试",

  // LiveFeed
  "Message Transformations": "消息转换",
  msgs: "条消息",
  "Close feed": "关闭实时流",
  "No transformations yet.": "暂无转换。",
  unknown: "未知",
  "Enable HEADROOM_LOG_MESSAGES=true to see content": "启用 HEADROOM_LOG_MESSAGES=true 以查看内容",
  "[truncated]": "[已截断]",

  // SessionView
  "Loading session stats…": "加载会话统计…",
  "Current proxy process · runtime counters reset on restart": "当前代理进程 · 运行时计数器在重启时重置",
  "Real-time proxy compression metrics · runtime counters reset on restart": "实时代理压缩指标 · 计数器重启时重置",
  "calls · tool schemas deferred": "次调用 · 工具模式已延迟",
  "No waste signals detected yet. Data appears after requests are processed.":
    "尚未检测到废弃物信号。处理请求后数据将出现。",
  "Trend data will appear after multiple requests.": "趋势数据将在多次请求后出现。",
  "with cache data": "含缓存数据",
  "Before and after token usage by detected client": "检测到的客户端 Token 用量前后对比",
  requests: "请求",
  "% saved": "% 已节省",
  "last 25 — click row to expand": "最近 25 条 — 点击行展开",
  "No requests yet. Start using the proxy to see activity here.":
    "暂无请求。开始使用代理以在此处查看活动。",
  "Original Tokens": "原始 Token",
  "Compressed Tokens": "压缩 Token",
  "Tokens Removed": "已移除 Token",
  "Optimization Time": "优化耗时",
  Collapse: "折叠",
  Expand: "展开",
  "Net savings:": "净节省:",
  "write premium": "写入溢价",
  "tokens re-written": "Token 已重写",

  // App
  "Skip to main content": "跳到主要内容",
  "Press R to refresh": "按 R 刷新",

  // Misc
  "not installed": "未安装",
  "No requests yet": "暂无请求",
  Press: "按",
  "to refresh": "刷新",
};

const dicts: Record<string, Record<string, string>> = { zh };

export function t(key: string, lang: string): string {
  if (lang === "en" || !key) return key;
  const dict = dicts[lang];
  if (!dict) return key;
  return dict[key] || key;
}
