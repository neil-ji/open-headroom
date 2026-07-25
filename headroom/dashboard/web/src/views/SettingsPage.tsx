import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/i18n/translations";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/Card";
import { Tabs, Tab, TabList, Select, Switch, Button } from "@spark-ui/components";

interface SettingsField {
  key: string;
  label: string;
  type: "bool" | "enum" | "int" | "float" | "str" | "header-map";
  value: unknown;
  stored: unknown;
  default: unknown;
  group: string;
  tier: string;
  help: string;
  secret?: boolean;
  choices?: string[];
  minimum?: number;
  maximum?: number;
  manifest_managed?: boolean;
  env_override?: boolean;
  env?: string;
}

interface SettingsSchema {
  fields: SettingsField[];
  groups: string[];
  values: Record<string, unknown>;
  supervised: boolean;
}

export function SettingsPage() {
  const { lang } = useAppContext();
  const _t = (k: string) => t(k, lang);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [fields, setFields] = useState<SettingsField[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [storedValues, setStoredValues] = useState<Record<string, unknown>>({});
  const [manifestManaged, setManifestManaged] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [applyMode, setApplyMode] = useState("");
  const [applyCommand, setApplyCommand] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [clearedKeys, setClearedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/settings/schema");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const schema: SettingsSchema = await res.json();
        setFields(schema.fields || []);
        setGroups(schema.groups || []);
        const vals: Record<string, unknown> = {};
        const stored: Record<string, unknown> = {};
        for (const f of schema.fields) {
          vals[f.key] = schema.values ? schema.values[f.key] : f.value;
          stored[f.key] = f.stored;
        }
        setValues(vals);
        setStoredValues(stored);
        setManifestManaged(!!schema.supervised);
        setLoaded(true);
      } catch (e) {
        setLoadError(_t("Failed to load settings: ") + (e as Error).message);
      }
    })();
  }, []);

  const fieldsIn = (group: string) =>
    fields.filter((f) => f.group === group && f.tier === activeTab);

  const isLocked = (field: SettingsField) =>
    (!!field.manifest_managed && manifestManaged) || !!field.env_override;

  const isEmpty = (v: unknown) => v === "" || v === null || v === undefined;

  const editableValues = () => {
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      if (isLocked(f)) continue;
      if (clearedKeys[f.key]) {
        out[f.key] = null;
        continue;
      }
      const v = values[f.key];
      const stored = storedValues[f.key] as unknown;
      const baseline = isEmpty(stored) ? f.default : stored;
      if (isEmpty(v)) {
        if (!isEmpty(stored)) out[f.key] = null;
        continue;
      }
      if (v === baseline) continue;
      out[f.key] = v;
    }
    return out;
  };

  const save = async () => {
    setBusy(true);
    setStatus(_t("Saving…"));
    setFieldErrors({});
    try {
      const res = await fetch("/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: editableValues() }),
      });
      const data = await res.json();
      if (res.status === 200) {
        setStatus(_t("Saved."));
        const changed = data.changed_keys || [];
        setBanner(
          changed.length
            ? _t("Restart required to apply: ") + changed.join(", ")
            : _t("Saved — no changes to apply."),
        );
        setApplyMode("");
        setApplyCommand("");
        setClearedKeys({});
      } else if (res.status === 422) {
        setFieldErrors(data.field_errors || {});
        setStatus(_t("Fix the highlighted fields."));
      } else {
        setStatus(data.error || "Error " + res.status);
      }
    } catch (e) {
      setStatus(_t("Save failed: ") + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const applyAndRestart = async () => {
    setBusy(true);
    setStatus(_t("Applying…"));
    setFieldErrors({});
    try {
      const res = await fetch("/settings/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: editableValues() }),
      });
      const data = await res.json();
      if (res.status === 422) {
        setFieldErrors(data.field_errors || {});
        setStatus(_t("Fix the highlighted fields."));
        setBusy(false);
        return;
      }
      if (res.status === 400) {
        setStatus(data.error || "Bad request");
        setBusy(false);
        return;
      }
      setApplyMode(data.mode || "");
      if (data.restarted && data.mode === "service") {
        setBanner(_t("Restarting…"));
        setStatus(_t("Waiting for the proxy to come back…"));
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const hRes = await fetch("/health", { cache: "no-store" });
            if (hRes.ok) {
              setBanner("");
              setStatus(_t("Applied — proxy restarted."));
              setBusy(false);
              return;
            }
          } catch {
            /* still down */
          }
        }
        setStatus(_t("Timed out waiting for the proxy. Check the proxy logs."));
      } else if (data.mode === "docker") {
        setApplyCommand(data.command || "");
        setBanner(_t("Saved. To apply, run the command on the host:"));
        setStatus("");
      } else {
        setBanner(data.instruction || _t("Saved. Restart the proxy to apply."));
        setStatus("");
      }
    } catch (e) {
      setStatus(_t("Apply failed: ") + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageLayout
      title={_t("Settings")}
      description={_t("Configure Headroom runtime knobs. Changes need a restart to apply.")}
      className="max-w-3xl"
    >

      {/* Load error */}
      {loadError && (
        <Card className="mb-4 !border-[var(--color-negative)]">
          <p className="text-sm" style={{ color: "var(--color-negative)" }}>{loadError}</p>
        </Card>
      )}

      {/* Banner */}
      {banner && (
        <Card className="mb-4 !border-[var(--color-warning)]">
          <p className="text-sm font-medium" style={{ color: "var(--color-warning)" }}>{banner}</p>
          {applyMode === "docker" && applyCommand && (
            <div className="mt-2">
              <p className="text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                {_t("Run this on the host to apply:")}
              </p>
              <code
                className="block text-xs rounded px-3 py-2 select-all font-mono"
                style={{ background: "var(--color-surface-alt)" }}
              >
                {applyCommand}
              </code>
            </div>
          )}
        </Card>
      )}

      {/* Tab pills — using spark-ui Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} className="mb-6">
        <TabList>
          <Tab value="basic">{_t("Settings")}</Tab>
          <Tab value="advanced">{_t("Advanced")}</Tab>
        </TabList>
      </Tabs>

      {/* Form */}
      {loaded && (
        <form onSubmit={(e) => e.preventDefault()}>
          {groups
            .filter((g) => fieldsIn(g).length > 0)
            .map((group) => (
              <Card key={group} className="mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  {group}
                </h2>
                {fieldsIn(group).map((field) => (
                  <div key={field.key} className="mb-4 last:mb-0">
                    <label className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{field.label}</span>
                      {field.type === "bool" ? (
                        <Switch
                          checked={!!values[field.key]}
                          onChange={(checked) => setValues((v) => ({ ...v, [field.key]: checked }))}
                          disabled={isLocked(field)}
                          size="sm"
                        />
                      ) : field.type === "enum" ? (
                        <Select
                          options={(field.choices || []).map((c) => ({ value: c, label: c }))}
                          value={String(values[field.key] || "")}
                          onChange={(v) => setValues((v2) => ({ ...v2, [field.key]: v }))}
                          disabled={isLocked(field)}
                          size="sm"
                        />
                      ) : field.type === "int" || field.type === "float" ? (
                        <input
                          type="number"
                          className="rounded px-2 py-1 text-sm w-full sm:w-56"
                          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                          step={field.type === "float" ? "any" : "1"}
                          min={field.minimum}
                          max={field.maximum}
                          disabled={isLocked(field)}
                          value={String(values[field.key] ?? "")}
                          onChange={(e) => setValues((v) => ({ ...v, [field.key]: field.type === "float" ? parseFloat(e.target.value) : parseInt(e.target.value, 10) }))}
                        />
                      ) : (
                        <input
                          type={field.secret ? "password" : "text"}
                          className="rounded px-2 py-1 text-sm w-full sm:w-56"
                          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                          disabled={isLocked(field)}
                          value={String(values[field.key] || "")}
                          onChange={(e) => {
                            setValues((v) => ({ ...v, [field.key]: e.target.value }));
                            const ck = { ...clearedKeys };
                            delete ck[field.key];
                            setClearedKeys(ck);
                          }}
                        />
                      )}
                    </label>
                    {field.secret && !isLocked(field) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1"
                        style={{ color: "var(--color-negative)" }}
                        onClick={() => {
                          setValues((v) => ({ ...v, [field.key]: "" }));
                          setClearedKeys((c) => ({ ...c, [field.key]: true }));
                        }}
                      >
                        {_t("Clear stored value")}
                      </Button>
                    )}
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                      {field.help}
                    </p>
                    {field.manifest_managed && manifestManaged && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-warning)" }}>
                        {_t("Managed by the install manifest — change via")} <code>headroom install</code>.
                      </p>
                    )}
                    {field.env_override && !(field.manifest_managed && manifestManaged) && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-warning)" }}>
                        {_t("Overridden by environment variable")} <code>{field.env}</code> — {_t("edits here have no effect until it's unset.")}
                      </p>
                    )}
                    {fieldErrors[field.key] && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-negative)" }}>
                        {fieldErrors[field.key]}
                      </p>
                    )}
                  </div>
                ))}
              </Card>
            ))}

          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={save}
            >
              {_t("Save")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={applyAndRestart}
            >
              {_t("Apply & Restart")}
            </Button>
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {status}
            </span>
          </div>
        </form>
      )}
    </PageLayout>
  );
}
