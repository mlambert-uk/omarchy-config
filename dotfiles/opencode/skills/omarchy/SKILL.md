---
name: omarchy
description: Omarchy system knowledge for safe configuration editing, package management, theme control, and troubleshooting on Arch Linux with Hyprland. Load when working on an Omarchy system.
license: MIT
compatibility: opencode
version: 1.1.0
metadata:
  audience: all-agents
  domain: omarchy, linux, hyprland, arch
  workflow: config-editing, package-management, theming, troubleshooting
---

# Omarchy System Skill

Patterns for safely working with an [Omarchy](https://github.com/basecamp/omarchy) system — a curated Arch Linux desktop built around Hyprland, tmux, Neovim, and a consistent `omarchy-*` command ecosystem (~145 commands).

## What I do

Provide agents with the command patterns, config file locations, reload behaviours, backup requirements, and safety rules needed to make configuration changes, manage packages, control themes, and troubleshoot issues on an Omarchy system — without breaking the managed environment.

## When to use me

**Load this skill when:**

- Editing any configuration file under `~/.config/` on an Omarchy system
- Adding, removing, or querying installed packages
- Switching or customising the system theme
- Troubleshooting an Omarchy component (Hyprland, Waybar, Walker, terminal)
- Adding Hyprland keybindings or window rules
- Working with Omarchy's `omarchy-*` command tools

**Do NOT use when:**

- The system is not running Omarchy (no `omarchy` command present)
- Working inside a Docker container or CI environment without a desktop

**Detection:**

```bash
command -v omarchy &>/dev/null && echo "omarchy" || echo "not-omarchy"
```

---

## Command Taxonomy

As of v3.7.0, Omarchy provides a unified `omarchy` CLI alongside individual `omarchy-*` commands. All commands follow a consistent `omarchy-<category>-<action>` pattern, and can also be invoked as `omarchy <category> <action>`.

| Prefix              | Purpose                                         | Examples                                                        |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `omarchy-refresh-*` | Reset config to default (always backs up first) | `omarchy-refresh-waybar`, `omarchy-refresh-hyprland`            |
| `omarchy-restart-*` | Restart a component/service                     | `omarchy-restart-waybar`, `omarchy-restart-terminal`            |
| `omarchy-toggle-*`  | Toggle a feature on/off                         | `omarchy-toggle-animations`                                     |
| `omarchy-theme-*`   | Theme management                                | `omarchy-theme-set`, `omarchy-theme-list`                       |
| `omarchy-install-*` | Install optional software                       | `omarchy-install-docker`, `omarchy-install-postgres`            |
| `omarchy-launch-*`  | Launch applications                             | `omarchy-launch-browser`, `omarchy-launch-editor`               |
| `omarchy-pkg-*`     | Package management (wraps pacman)               | `omarchy-pkg-add`, `omarchy-pkg-remove`                         |
| `omarchy-setup-*`   | Initial setup tasks                             | `omarchy-setup-git`, `omarchy-setup-ssh`                        |
| `omarchy-update-*`  | System update tasks                             | `omarchy-update-system`                                         |
| `omarchy-capture-*` | Screenshots and screen recording                | `omarchy-capture-screenshot`, `omarchy-capture-screenrecording` |
| `omarchy-audio-*`   | Audio controls                                  | `omarchy-audio-output-switch`, `omarchy-audio-input-mute`       |
| `omarchy-system-*`  | System actions                                  | `omarchy-system-lock`                                           |
| `omarchy-sudo-*`    | Sudo configuration                              | `omarchy-sudo-passwordless`                                     |
| `omarchy-debug`     | Diagnostics (always use `--no-sudo --print`)    | `omarchy-debug --no-sudo --print`                               |

### v3.7.0 Command Renames

Several `omarchy-cmd-*` commands were renamed in v3.7.0. **Do not use the old names** — they are no longer valid:

| Old name (deprecated)              | New name                          |
| ---------------------------------- | --------------------------------- |
| `omarchy-cmd-audio-switch`         | `omarchy-audio-output-switch`     |
| `omarchy-cmd-mic-mute`             | `omarchy-audio-input-mute`        |
| `omarchy-cmd-mic-mute-xps`         | `omarchy-audio-input-mute`        |
| `omarchy-cmd-mic-mute-thinkpad`    | `omarchy-audio-input-mute`        |
| `omarchy-cmd-screenrecord`         | `omarchy-capture-screenrecording` |
| `omarchy-cmd-screenshot`           | `omarchy-capture-screenshot`      |
| `omarchy-cmd-first-run`            | `omarchy-first-run`               |
| `omarchy-cmd-screensaver`          | `omarchy-screensaver`             |
| `omarchy-cmd-share`                | `omarchy-menu-share`              |
| `omarchy-lock-screen`              | `omarchy-system-lock`             |
| `omarchy-sudo-passwordless-toggle` | `omarchy-sudo-passwordless`       |

Note: `omarchy-cmd-terminal-cwd` was **not** renamed and remains valid.

**Discover all commands:**

```bash
omarchy commands              # List all commands (v3.7.0+)
omarchy commands --all        # Include hidden commands
omarchy commands --json       # Machine-readable list

# Legacy discovery (still works)
compgen -c | grep -E '^omarchy-' | sort -u
```

---

## Hyprland Configuration

### Config File Locations

```text
~/.config/hypr/
├── hyprland.conf      # Main config (sources all others)
├── bindings.conf      # Keybindings  ← most commonly edited
├── monitors.conf      # Display configuration
├── input.conf         # Keyboard/mouse settings
├── looknfeel.conf     # Appearance (gaps, borders, animations, blur)
├── envs.conf          # Environment variables
├── autostart.conf     # Startup applications
├── hypridle.conf      # Idle behaviour (screen off, lock, suspend)
├── hyprlock.conf      # Lock screen appearance
└── hyprsunset.conf    # Night light / blue light filter
```

**Hyprland auto-reloads on save** — no restart command needed.

### Keybinding Syntax

```conf
# Full syntax
bindd = MODIFIERS, KEY, Description, exec, COMMAND

# Application launch examples
bindd = SUPER, RETURN, Terminal, exec, uwsm-app -- xdg-terminal-exec
bindd = SUPER ALT, RETURN, Tmux, exec, uwsm-app -- xdg-terminal-exec bash -c "tmux attach || tmux new -s Work"
bindd = SUPER SHIFT, RETURN, Browser, exec, omarchy-launch-browser
bindd = SUPER SHIFT, N, Editor, exec, omarchy-launch-editor

# Web app shortcut
bindd = SUPER SHIFT, A, ChatGPT, exec, omarchy-launch-webapp "https://chatgpt.com"

# Custom command
bindd = SUPER SHIFT, O, OpenCode, exec, uwsm-app -- xdg-terminal-exec bash -c "opencode"

# Screenshot (use new name)
bindd = SUPER SHIFT, S, Screenshot, exec, omarchy-capture-screenshot
```

**Modifier keys**: `SUPER`, `CTRL`, `ALT`, `SHIFT` (combine with space: `SUPER SHIFT`)

**Common `omarchy-launch-*` helpers:**

```bash
omarchy-launch-browser       # Default browser
omarchy-launch-editor        # Neovim
omarchy-launch-webapp URL    # Chromium app mode for a URL
omarchy-launch-or-focus APP  # Focus existing window or launch
```

---

## Pattern 1: Safe Configuration Edit

**ALWAYS follow this sequence when editing any config file:**

```bash
# 1. Read current config
cat ~/.config/hypr/bindings.conf

# 2. Backup before changes (REQUIRED)
cp ~/.config/hypr/bindings.conf ~/.config/hypr/bindings.conf.bak.$(date +%s)

# 3. Make changes with Edit tool

# 4. Apply changes — reload behaviour varies by component:
#    - Hyprland configs: AUTO-RELOAD on save (no command needed)
#    - Waybar:           omarchy-restart-waybar
#    - Walker:           omarchy-restart-walker
#    - Terminals:        omarchy-restart-terminal
#    - Mako:             omarchy-restart-mako
```

**Reload reference:**

| Component             | Reload method              |
| --------------------- | -------------------------- |
| Hyprland (any .conf)  | Automatic on save          |
| Waybar (status bar)   | `omarchy-restart-waybar`   |
| Walker (app launcher) | `omarchy-restart-walker`   |
| Terminal emulator     | `omarchy-restart-terminal` |
| Mako (notifications)  | `omarchy-restart-mako`     |

---

## Pattern 2: Package Management

**ALWAYS use `omarchy-pkg-add` — never raw `pacman -S`:**

```bash
# Install one package
omarchy-pkg-add neovim

# Install multiple packages
omarchy-pkg-add git nodejs npm typescript

# With post-install steps (follow the script source for hints)
omarchy-pkg-add docker
systemctl enable --now docker
usermod -aG docker $USER
```

**Why `omarchy-pkg-add` instead of `pacman -S`:**

- Applies Omarchy's required update flags automatically
- Checks if package is already installed before acting
- Safe for use in scripts and automation

**Query installed packages:**

```bash
pacman -Q                          # All installed
pacman -Qs <search-term>           # Search installed
pacman -Qi <package>               # Package details
```

**Remove a package:**

```bash
omarchy-pkg-remove <package>       # If available
# Fallback: sudo pacman -Rns <package>
```

---

## Pattern 3: Theme Management

**Available built-in themes:**

```bash
omarchy-theme-list
# Output includes: Catppuccin, Catppuccin Latte, Ethereal, Everforest,
#                  Gruvbox, Hackerman, Kanagawa, Nord, Rose Pine,
#                  Tokyo Night, Vantablack, ...
```

**Set a theme (applies system-wide — terminal, Waybar, Hyprlock, etc.):**

```bash
omarchy-theme-set tokyo-night
omarchy-theme-set catppuccin
omarchy-theme-set gruvbox
omarchy-theme-set nord
omarchy-theme-set rose-pine
omarchy-theme-set hackerman
omarchy-theme-set vantablack
```

**Theme storage locations:**

- Built-in: `~/.local/share/omarchy/themes/`
- User-created: `~/.config/omarchy/themes/`

**Interactive theme picker:**

```bash
theme=$(omarchy-theme-list | fzf)
omarchy-theme-set "$theme"
```

---

## Pattern 4: Reset Config to Default

**`omarchy-refresh-*` always creates a backup before resetting:**

```bash
# Reset specific component
omarchy-refresh-waybar
omarchy-refresh-hyprland

# Reset a specific config file (path relative to ~/.config/)
omarchy-refresh-config hypr/hyprlock.conf
omarchy-refresh-config hypr/bindings.conf

# What refresh does internally:
# 1. Backs up current config with timestamp
# 2. Copies default from ~/.local/share/omarchy/config/
# 3. Restarts the component
```

**REQUIRED**: Always confirm with the user before running any `omarchy-refresh-*` command.

---

## Pattern 5: Troubleshooting

```bash
# Get debug information (ALWAYS use these flags — avoid interactive prompts)
omarchy-debug --no-sudo --print

# Upload logs for support
omarchy-upload-log

# Nuclear option — full config reinstall (CONFIRM with user first)
omarchy-reinstall
```

**Diagnostic decision tree:**

```
Issue observed?
├── Single component broken → omarchy-refresh-<component>
├── Multiple components broken → omarchy-debug --no-sudo --print → review output
├── After system update → omarchy-update-system → restart affected components
└── Nothing works → omarchy-reinstall (LAST RESORT — confirm with user)
```

---

## Common Config Locations (Quick Reference)

| Component            | Config path                    |
| -------------------- | ------------------------------ |
| Hyprland             | `~/.config/hypr/hyprland.conf` |
| Keybindings          | `~/.config/hypr/bindings.conf` |
| Waybar               | `~/.config/waybar/`            |
| Walker (launcher)    | `~/.config/walker/`            |
| Terminal (Kitty)     | `~/.config/kitty/`             |
| Terminal (Alacritty) | `~/.config/alacritty/`         |
| Terminal (Ghostty)   | `~/.config/ghostty/`           |
| Mako (notifs)        | `~/.config/mako/`              |
| Omarchy themes       | `~/.config/omarchy/themes/`    |
| Omarchy user conf    | `~/.config/omarchy/`           |

---

## Safety Rules

- **PROHIBITED**: Using raw `pacman -S` — always use `omarchy-pkg-add`
- **PROHIBITED**: Editing `~/.local/share/omarchy/` — these are Omarchy's managed defaults
- **PROHIBITED**: Running `omarchy-reinstall` without explicit user confirmation
- **PROHIBITED**: Running any `omarchy-refresh-*` without explicit user confirmation
- **PROHIBITED**: Using deprecated `omarchy-cmd-*` command names (see rename table above)
- **REQUIRED**: Backup any config file before editing (timestamped `cp`)
- **REQUIRED**: Run `omarchy-restart-*` for components that don't auto-reload after editing

---

## References

- [Omarchy repository](https://github.com/basecamp/omarchy)
- [Omarchy v3.7.0 release notes](https://github.com/basecamp/omarchy/releases/tag/v3.7.0)
- [Hyprland documentation](https://wiki.hyprland.org/)
- [Arch Linux wiki](https://wiki.archlinux.org/)
