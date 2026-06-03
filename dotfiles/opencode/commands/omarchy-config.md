---
description: Safely edit any Omarchy configuration file with automatic backup, correct reload handling, and Omarchy convention enforcement
model: github-copilot/claude-haiku-4.5
agent: omarchy
---

# /omarchy-config

Edit Omarchy configuration files safely — with automatic backup, correct reload behaviour per component, and enforcement of Omarchy conventions.

## Purpose

Prevent the common failure modes of Omarchy config editing: forgetting to backup, using the wrong restart command (or none at all), and not knowing which component a config file belongs to.

## Usage

```bash
/omarchy-config <what you want to change>
```

## Examples

```bash
/omarchy-config add a keybinding to launch opencode with SUPER SHIFT O
/omarchy-config set Waybar to show battery percentage
/omarchy-config change the terminal font to JetBrains Mono 14
/omarchy-config disable screen blanking after idle
/omarchy-config add autostart entry for nm-applet
```

## What It Does

### Phase 1: Omarchy Detection

- Run `command -v omarchy-debug` to confirm this is an Omarchy system
- If not detected, abort with instructions to install Omarchy

### Phase 2: Config Identification

- Determine which config file the request targets using the component-to-file mapping from the `avaylerflow-omarchy` skill
- If ambiguous, ask the user to clarify before proceeding
- Read the current file content

### Phase 3: Conflict and Validation Check

- For keybindings: scan for existing use of the same key combination
- For other configs: identify the relevant section and any existing values that would conflict
- Report conflicts to the user before making changes

### Phase 4: Backup

- Create a timestamped backup:
  ```bash
  cp <config-file> <config-file>.bak.$(date +%s)
  ```
- Report the backup path to the user

### Phase 5: Edit

- Make the requested change using the correct syntax for the component
- For Hyprland: use `bindd` syntax and `omarchy-launch-*` helpers
- For Waybar: use the correct JSON module format
- For other components: follow the format of the existing file

### Phase 6: Reload

- Apply the correct reload command per component:
  - **Hyprland configs**: no action needed (auto-reloads)
  - **Waybar**: `omarchy-restart-waybar`
  - **Walker**: `omarchy-restart-walker`
  - **Terminals**: `omarchy-restart-terminal`
  - **Mako**: `omarchy-restart-mako`
- Confirm to the user that the change is live

## Output Format

```
Config change complete.

File:    ~/.config/hypr/bindings.conf
Change:  Added keybinding SUPER SHIFT O → opencode
Backup:  ~/.config/hypr/bindings.conf.bak.1742000000
Reload:  Hyprland auto-reloads — binding is active immediately.
```

## Safety Rules

- **PROHIBITED**: Editing `~/.local/share/omarchy/` (managed defaults — never edit directly)
- **PROHIBITED**: Running `omarchy-reinstall` or `omarchy-refresh-*` without explicit confirmation
- **REQUIRED**: Always backup before editing
- **REQUIRED**: Always confirm the correct reload behaviour before finishing
- If in doubt about a config change, ask before editing — config mistakes can break the desktop

## Integration

- Delegates to `@avaylerflow-omarchy-keybindings` for keybinding-specific requests
- Uses `avaylerflow-omarchy` skill for all config locations, reload rules, and safety constraints

---

**Version:** 1.0
