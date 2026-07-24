export function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toString();
}

export function fmtCurrency(n: number): string {
  if (n < 0) return "-" + fmtCurrency(-n);
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(3);
  if (n > 0) return n.toFixed(4);
  return "0.00";
}

export function fmtTimeAgo(ts: string): string {
  if (!ts) return "-";
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  return d.toLocaleTimeString();
}

export function fmtDate(ts: string): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function truncateModel(model: string): string {
  if (!model) return "-";
  return model
    .replace(/^(anthropic\.|openai\.|bedrock\/|deepseek\/|google\/|minimax\/)/, "")
    .replace(/-\d{8}$/, "")
    .substring(0, 20);
}
