"""Headroom Dashboard - Real-time proxy monitoring UI."""

from pathlib import Path

DASHBOARD_DIR = Path(__file__).parent
TEMPLATES_DIR = DASHBOARD_DIR / "templates"
WEB_DIST_DIR = DASHBOARD_DIR / "web" / "dist"


def _read_index_html() -> str:
    """Read the React SPA index.html, or fall back to the legacy template."""
    index_path = WEB_DIST_DIR / "index.html"
    if index_path.exists():
        return index_path.read_text(encoding="utf-8")
    # Fallback to legacy templates
    return get_dashboard_html_fallback()


def get_dashboard_html() -> str:
    """Serve the Headroom dashboard UI (React SPA or legacy fallback)."""
    return _read_index_html()


def get_dashboard_html_fallback() -> str:
    """Load the legacy dashboard HTML template."""
    template_path = TEMPLATES_DIR / "dashboard.html"
    return template_path.read_text(encoding="utf-8")


def get_settings_html() -> str:
    """Serve the Headroom settings GUI (React SPA or legacy fallback)."""
    # The React SPA handles /dashboard/settings via client-side routing
    return _read_index_html()
