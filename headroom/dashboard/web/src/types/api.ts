// ── API response types ──

export interface StatsResponse {
  tokens?: {
    saved: number;
    input: number;
    output: number;
    total_before_compression: number;
    proxy_compression_saved: number;
    savings_percent: number;
    output_saved: number;
    output_reduction_percent: number;
    output_reduction: {
      available: boolean;
      method?: string;
      ci_low_percent?: number;
      ci_high_percent?: number;
      requests?: number;
    } | null;
  };
  requests?: {
    total: number;
    failed: number;
    rate_limited: number;
    cached: number;
    by_provider?: Record<string, number>;
  };
  overhead?: { average_ms: number; min_ms: number; max_ms: number };
  ttfb?: { average_ms: number; min_ms: number; max_ms: number };
  throughput?: {
    rolling?: {
      input_wall_clock: number;
      input_active_p50: number;
      compression_p50: number;
      compression_p95: number;
      forward_p50: number;
      forward_p95: number;
      generation_p50: number;
      generation_p95: number;
    };
    current?: {
      input_active_p50: number;
      forward_p50: number;
    };
  };
  proxy_inbound?: { active: number };
  runtime?: {
    websocket_sessions?: { active_sessions: number; active_relay_tasks: number };
    compression_executor?: { queued: number };
  };
  savings?: {
    by_layer?: Record<
      string,
      { tokens: number; requests: number; label?: string }
    >;
  };
  waste_signals?: Record<string, number>;
  pipeline_timing?: Record<string, { average_ms: number; max_ms: number }>;
  agent_usage?: {
    totals: {
      requests: number;
      before_tokens: number;
      after_tokens: number;
      tokens_saved: number;
      savings_percent: number;
    };
    agents: AgentUsageRow[];
    coverage: { mode: string; logged_requests: number };
  };
  prefix_cache?: PrefixCache;
  recent_requests?: RecentRequest[];
  savings_history?: number[][];
  config?: { savings_profile?: string; target_savings_percent?: number };
  anon_telemetry_shipping?: boolean;
  log_full_messages?: boolean;
  subscription_window?: SubscriptionWindow;
  codex_rate_limits?: CodexRateLimits;
  copilot_quota?: CopilotQuota;
  cost?: { per_model?: Record<string, PerModelEntry> };
}

export interface AgentUsageRow {
  agent: string;
  label: string;
  requests: number;
  before_tokens: number;
  after_tokens: number;
  tokens_saved: number;
  savings_percent: number;
  share_of_saved_percent: number;
  source: string;
}

export interface PrefixCache {
  totals: {
    requests: number;
    cache_write_tokens: number;
    cache_read_tokens: number;
    write_premium_usd: number;
    hit_requests: number;
    hit_rate: number;
    bust_count: number;
    bust_write_tokens: number;
    net_savings_usd: number;
    observed_ttl_mix?: { "1h_pct": number; "5m_pct": number; active_buckets: string[] };
    observed_ttl_buckets?: Record<string, { tokens: number; requests: number }>;
  };
  by_provider?: Record<string, ProviderCacheEntry>;
  compression_vs_cache?: {
    tokens_saved_by_compression: number;
    tokens_lost_to_cache_bust: number;
    cache_bust_count: number;
    net_tokens?: number;
  };
  prefix_freeze?: {
    tokens_preserved: number;
    compression_foregone_tokens: number;
    busts_avoided: number;
    net_benefit_tokens?: number;
  };
  miss_attribution?: {
    totals: {
      total: number;
      ttl_expiry: number;
      prefix_change: number;
      unknown: number;
      ttl_expiry_pct: number;
      prefix_change_pct: number;
    };
  };
}

export interface ProviderCacheEntry {
  label: string;
  cache_write_tokens: number;
  cache_read_tokens: number;
  read_discount: string;
  write_premium: string;
  bust_count: number;
  net_savings_usd: number;
  observed_ttl_mix?: { "1h_pct": number; "5m_pct": number };
}

export interface RecentRequest {
  request_id: string;
  timestamp: string;
  model: string;
  input_tokens_original: number;
  input_tokens_optimized: number;
  output_tokens: number;
  tokens_saved: number;
  savings_percent: number;
  total_latency_ms: number;
  optimization_latency_ms: number;
  transforms_applied: string[];
  waste_signals: Record<string, number> | null;
}

export interface SubscriptionWindow {
  latest?: {
    five_hour?: { utilization_pct: number; seconds_to_reset: number };
    seven_day?: { utilization_pct: number; seconds_to_reset: number };
    extra_usage?: {
      is_enabled: boolean;
      used_credits_usd: number;
      monthly_limit_usd?: number;
      utilization_pct?: number;
    };
    last_active_at?: string;
  };
  contribution?: {
    tokens_submitted: number;
    raw_without_headroom: number;
    efficiency_pct: number;
    tokens_saved: { total: number; compression: number; cache_reads: number };
  };
  discrepancies?: { kind: string; description: string; severity: string }[];
}

export interface CodexRateLimits {
  limit_name?: string;
  primary?: {
    used_percent: number;
    window_label?: string;
    seconds_until_reset?: number;
  };
  secondary?: {
    used_percent: number;
    window_label?: string;
    seconds_until_reset?: number;
  };
  credits?: {
    unlimited: boolean;
    has_credits?: boolean;
    balance?: string;
  };
  promo_message?: string;
}

export interface CopilotQuota {
  latest?: {
    copilot_plan?: string;
    login?: string;
    quota_reset_date_utc?: string;
    categories: Record<
      string,
      {
        used?: number;
        entitlement?: number;
        remaining?: number;
        used_percent: number;
        unlimited: boolean;
        overage_count: number;
        overage_permitted: boolean;
      }
    >;
  };
}

export interface PerModelEntry {
  requests: number;
  tokens_saved: number;
  tokens_sent: number;
  reduction_pct: number;
}

export interface HealthResponse {
  status: string;
  version?: string;
}

export interface LifetimeStatsResponse {
  started_at?: string;
  full_fidelity_started_at?: string;
  requests?: {
    total: number;
    failed: number;
    rate_limited: number;
    cached: number;
    by_provider?: Record<string, number>;
    by_stack?: Record<string, number>;
  };
  tokens?: {
    input: number;
    output: number;
    attempted_input: number;
    saved: number;
    token_savings_percent: number;
  };
  cost?: {
    input_usd: number;
    compression_savings_usd: number;
    cache_savings_usd: number;
  };
  prefix_cache?: {
    requests: number;
    hit_requests: number;
    cache_hit_rate: number;
    cache_read_tokens: number;
    cache_write_tokens: number;
    ttl_1h_percent: number;
    ttl_5m_percent: number;
    bust_count: number;
    bust_tokens: number;
    misses_by_reason?: Record<string, number>;
  };
  waste_signals?: Record<string, number>;
  by_model?: Record<string, { input_tokens: number; output_tokens: number }>;
  projects?: Record<string, ProjectSavings>;

  persistence?: { healthy: boolean; error?: string };
  cli_filtering?: { label: string; lifetime: { tokens_saved: number }; available: boolean };
}

export interface ProjectSavings {
  requests: number;
  tokens_saved: number;
  compression_savings_usd: number;
  savings_percent: number;
  last_activity_at?: string;
}

export interface HistoryStatsResponse {
  lifetime?: {
    tokens_saved: number;
    compression_savings_usd: number;
  };
  history: HistoryPoint[];
  series?: {
    daily?: HistoryPoint[];
    weekly?: HistoryPoint[];
    monthly?: HistoryPoint[];
  };
  retention?: { max_history_age_days: number; max_history_points: number };
}

export interface HistoryPoint {
  timestamp: string;
  total_tokens_saved: number;
  tokens_saved: number;
  compression_savings_usd?: number;
  compression_savings_usd_delta?: number;
  total_input_cost_usd?: number;
  by_model?: Record<
    string,
    {
      tokens_saved: number;
      compression_savings_usd_delta?: number;
      total_input_cost_usd_delta?: number;
    }
  >;
}

export interface TransformationFeed {
  transformations: Transformation[];
  log_full_messages?: boolean;
}

export interface Transformation {
  timestamp: string;
  model: string;
  tokens_saved: number;
  savings_percent: number;
  tool_schema_saved_tokens?: number;
  request_messages?: { content: string }[];
  response_content?: string;
  transforms_applied: string[];
}
