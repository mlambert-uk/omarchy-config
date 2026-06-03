---
description: Synchronise the active Omarchy system theme with OpenCode's TUI theme, keeping the terminal and OpenCode UI visually coherent
model: github-copilot/claude-haiku-4.5
agent: omarchy
---

# /omarchy-theme-sync

Switch the Omarchy system theme and update the OpenCode TUI theme to match in one step, keeping your entire desktop visually coherent.

## Purpose

Omarchy's `omarchy-theme-set` applies a theme to the terminal, Waybar, Hyprlock, and other components. OpenCode has its own separate theme configured in `~/.config/opencode/tui.json`. Without synchronisation, switching an Omarchy theme leaves OpenCode on a mismatched colour scheme.

This command does both in one step.

## Usage

```bash
/omarchy-theme-sync [theme-name]
```

If no theme name is supplied, display the list of available themes and ask the user to choose.

## What It Does

### Phase 1: Omarchy Detection

- Run `command -v omarchy-debug` to confirm this is an Omarchy system
- If not detected, abort with instructions to install Omarchy

### Phase 2: Theme Selection

- If a theme name was provided, validate it exists in `omarchy-theme-list`
- If no theme was provided, show available themes and prompt for selection:
  ```bash
  omarchy-theme-list
  ```

### Phase 3: Apply Omarchy Theme

```bash
omarchy-theme-set <theme-name>
```

This applies the theme system-wide: terminal colours, Waybar, Hyprlock, and all Omarchy-managed components.

### Phase 4: Update OpenCode TUI Theme

Look up the matching OpenCode theme name from this mapping table and update `~/.config/opencode/tui.json`:

| Omarchy theme      | OpenCode theme         |
| ------------------ | ---------------------- |
| `catppuccin`       | `catppuccin`           |
| `catppuccin-latte` | `catppuccin-macchiato` |
| `gruvbox`          | `gruvbox`              |
| `tokyo-night`      | `tokyonight`           |
| `nord`             | `nord`                 |
| `kanagawa`         | `kanagawa`             |
| `everforest`       | `everforest`           |
| `rose-pine`        | `system`               |
| `hackerman`        | `matrix`               |
| `vantablack`       | `system`               |
| `ethereal`         | `system`               |
| _(any other)_      | `system`               |

**Update `~/.config/opencode/tui.json`:**

```bash
TUI_CONFIG=~/.config/opencode/tui.json

# Create if it doesn't exist
if [ ! -f "$TUI_CONFIG" ]; then
  mkdir -p ~/.config/opencode
  echo '{"$schema":"https://opencode.ai/tui.json"}' > "$TUI_CONFIG"
fi

# Backup
cp "$TUI_CONFIG" "$TUI_CONFIG.bak.$(date +%s)"

# Update theme field
node - "$TUI_CONFIG" "$OPENCODE_THEME" <<'EOF'
const fs = require('fs');
const [,, configPath, themeName] = process.argv;
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.theme = themeName;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
EOF
```

### Phase 5: Confirm

```
Theme synchronised.

Omarchy:  omarchy-theme-set tokyo-night
OpenCode: ~/.config/opencode/tui.json → theme: "tokyonight"

Restart OpenCode to apply the new TUI theme.
```

## Standalone Script

For use outside of OpenCode (e.g. from a shell alias or Hyprland binding):

```bash
~/.config/opencode/skills/avaylerflow-omarchy/sync-theme.sh <theme-name>
```

## Notes

- OpenCode must be restarted for the TUI theme change to take effect (`tui.json` is read at startup)
- Unmapped Omarchy themes fall back to `system`, which adapts to the terminal background colour
- To add a new mapping, edit both this command file and `sync-theme.sh`

---

**Version:** 1.0
