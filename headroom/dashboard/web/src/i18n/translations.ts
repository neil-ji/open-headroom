// ── I18N translations for Headroom Dashboard ──
// English keys are used as-is; Chinese translations mapped below.

const zh: Record<string, string> = {
  // Header & nav
  Session: "会话",
  Lifetime: "累计",
  Historical: "历史",
  "Anon Telemetry": "匿名遥测",
  Status: "状态",
  Healthy: "健康",
  Error: "异常",
  Updated: "更新于",
  Settings: "设置",
  "Live Feed": "实时流",
  "Toggle light/dark mode": "切换明暗主题",
  "Anonymous aggregate telemetry is enabled. Disable with HEADROOM_TELEMETRY=off or --no-telemetry.":
    "匿名聚合遥测已启用。使用 HEADROOM_TELEMETRY=off 或 --no-telemetry 禁用。",
  Documentation: "文档",

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
  "Compression Queued": "排队压缩",

  // Savings
  "Savings Breakdown": "节省分解",
  "Token Savings": "Token 节省",
  "Output Tokens Saved": "输出 Token 节省",
  "Tool-Schema Deferral": "工具模式延迟",
  Proxy: "代理",
  "Of total wire:": "总线占比:",

  // Performance
  Performance: "性能",
  Overhead: "开销",
  Throughput: "吞吐量",
  "Overhead Range": "开销范围",
  "TTFB Range": "首字节范围",
  "Failed Requests": "失败请求",
  "Pipeline Breakdown": "管道分解",
  Requests: "请求",
  "Output Tokens": "输出 Token",

  // Token Flow
  "Token Flow": "Token 流向",
  "Token Usage": "Token 用量",
  "Before Compression": "压缩前",
  "After Compression (sent)": "压缩后 (已发送)",
  "What Headroom Removed": "Headroom 移除了什么",
  "Savings Over Time": "节省趋势",

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
  "Per-Provider Breakdown": "按提供商分解",

  // Clients & Models
  "Clients & Models": "客户端与模型",
  "Agent Usage": "代理用量",
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
  "Resets in": "重置于",
  "Monthly Reset": "每月重置",

  // Lifetime
  "Lifetime data since": "累计数据自",
  "Full metric coverage since": "完整指标覆盖自",
  "Per-Project Savings": "按项目节省",
  "No per-project data yet.": "暂无项目数据。",
  Project: "项目",
  "Last Active": "最近活跃",

  // History
  "Historical Proxy Compression": "历史代理压缩",
  "Export JSON": "导出 JSON",
  "Export CSV": "导出 CSV",
  "Daily Savings": "每日节省",
  "Weekly Savings": "每周节省",
  "Monthly Savings": "每月节省",
  "Historical Savings Trend": "历史节省趋势",
  "Per-Model Breakdown": "按模型分解",
  "Historical Summary": "历史摘要",
  "No persisted savings history yet": "尚无持久化节省历史",

  // Settings
  Advanced: "高级",
  Dashboard: "控制台",
  Save: "保存",
  "Apply & Restart": "应用并重启",
  "Clear stored value": "清除已存储的值",
  "Configure Headroom runtime knobs. Changes need a restart to apply.":
    "配置 Headroom 运行时参数。更改需要重启才能生效。",

  // Misc
  "not installed": "未安装",
  "No requests yet": "暂无请求",
  "Press": "按",
  "to refresh": "刷新",
  "Message Transformations": "消息转换",
};

const dicts: Record<string, Record<string, string>> = { zh };

export function t(key: string, lang: string): string {
  if (lang === "en" || !key) return key;
  const dict = dicts[lang];
  if (!dict) return key;
  return dict[key] || key;
}
