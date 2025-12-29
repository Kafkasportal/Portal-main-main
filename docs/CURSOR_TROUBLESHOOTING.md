# 🔧 Cursor Troubleshooting Guide

This guide helps you diagnose and resolve common issues with Cursor. Problems can stem from extensions, app data, or system configuration.

## 📋 Table of Contents

1. [Network Connectivity](#network-connectivity)
2. [Extension Issues](#extension-issues)
3. [Clearing App Data](#clearing-app-data)
4. [Uninstalling Cursor](#uninstalling-cursor)
5. [Reinstalling Cursor](#reinstalling-cursor)
6. [Reporting an Issue](#reporting-an-issue)
7. [Common Issues](#common-issues)

---

## 🌐 Network Connectivity

### Check Network Connection

First, verify that Cursor can connect to its services.

**Run Network Diagnostics:**

1. Go to `Cursor Settings` → `Network`
2. Click `Run Diagnostics`
3. This tests your connection to Cursor's servers and identifies network issues affecting:
   - AI features
   - Updates
   - Other online functionality

### Resolve Network Issues

If diagnostics reveal connectivity problems:

1. **Check Firewall Settings**
   - Allow Cursor through Windows Firewall
   - Check antivirus software blocking connections
   - Verify corporate firewall rules

2. **Proxy Configuration**
   - Configure proxy settings in Cursor Settings → Network
   - Check if VPN is interfering
   - Test with proxy disabled

3. **Network Restrictions**
   - Verify internet connection
   - Check if network blocks specific domains
   - Test from different network

---

## 🔌 Extension Issues

### Disable All Extensions

For extension-related problems:

**Command Line Method:**
```bash
cursor --disable-extensions
```

If issues resolve after disabling extensions:
1. Re-enable extensions one by one
2. Identify the problematic extension
3. Update or remove the problematic extension

### Reset Extension Data

**Uninstall and Reinstall:**
1. Uninstall the problematic extension
2. Clear extension cache/data
3. Reinstall the extension
4. Check if settings persist (may need manual reset)

**Extension Settings:**
- Check extension configuration in Settings
- Reset to default settings
- Remove extension-specific data

---

## 🗑️ Clearing App Data

⚠️ **Warning:** This deletes your app data, including:
- Extensions
- Themes
- Snippets
- Installation-related data
- Custom settings

**Before clearing:** Export your profile to preserve data.

Cursor stores app data outside the app for restoration between updates and reinstallations.

### Windows

Run these commands in **Command Prompt** (as Administrator):

```cmd
rd /s /q "%USERPROFILE%\AppData\Local\Programs\Cursor"
rd /s /q "%USERPROFILE%\AppData\Local\Cursor"
rd /s /q "%USERPROFILE%\AppData\Roaming\Cursor"
del /f /q "%USERPROFILE%\.cursor*"
rd /s /q "%USERPROFILE%\.cursor"
```

### macOS

Run these commands in **Terminal**:

```bash
sudo rm -rf ~/Library/Application\ Support/Cursor
rm -f ~/.cursor.json
```

**Additional locations:**
```bash
rm -rf ~/Library/Preferences/com.cursor.*
rm -rf ~/Library/Caches/com.cursor.*
```

### Linux

Run these commands in **Terminal**:

```bash
rm -rf ~/.cursor ~/.config/Cursor/
```

**Additional locations:**
```bash
rm -rf ~/.local/share/Cursor
rm -rf ~/.cache/Cursor
```

---

## 🗑️ Uninstalling Cursor

### Windows

1. Open **Start Menu**
2. Search for "Add or Remove Programs"
3. Find "Cursor" in the list
4. Click "Uninstall"
5. Follow the uninstall wizard

**Manual cleanup (if needed):**
- Delete remaining folders in `%USERPROFILE%\AppData\Local\Cursor`
- Remove registry entries (advanced users only)

### macOS

1. Open **Applications** folder
2. Find "Cursor" application
3. Right-click and select **Move to Trash**
4. Empty Trash

**Clean up preferences:**
```bash
rm -rf ~/Library/Application\ Support/Cursor
rm -rf ~/Library/Preferences/com.cursor.*
```

### Linux

**For .deb packages (Debian/Ubuntu):**
```bash
sudo apt remove cursor
```

**For .rpm packages (Fedora/RHEL):**
```bash
# Fedora
sudo dnf remove cursor

# RHEL/CentOS
sudo yum remove cursor
```

**For AppImage:**
- Delete the `Cursor.appimage` file from its location
- Remove desktop integration files (if any)

---

## 🔄 Reinstalling Cursor

### Download

1. Visit [Cursor Downloads](https://www.cursor.com/downloads)
2. Download the latest version for your OS
3. Install following the installation wizard

### After Reinstallation

**Without cleared app data:**
- Cursor restores to its previous state
- Extensions, settings, and data are preserved

**With cleared app data:**
- Fresh install with default settings
- You'll need to reconfigure extensions and settings

---

## 📝 Reporting an Issue

If troubleshooting steps don't resolve your issue, report it to the [Cursor Forum](https://forum.cursor.com/).

### Before Reporting

Gather the following information for faster resolution:

#### 1. Screenshot of Issue

- Capture a screenshot of the problem
- Redact any sensitive information
- Include error messages if visible

#### 2. Steps to Reproduce

Document exact steps:
1. What were you doing when the issue occurred?
2. What did you expect to happen?
3. What actually happened?
4. Can you reproduce it consistently?

**Example:**
```
1. Opened Cursor
2. Tried to use Chat feature (Ctrl+L)
3. Expected: Chat window to open
4. Actual: Nothing happened, no error message
5. Can reproduce: Yes, every time
```

#### 3. System Information

Get system info from:
- **Cursor** → **Help** → **About**

Include:
- Cursor version
- Operating system
- System architecture
- Available memory

#### 4. Request IDs

For AI-related issues, include request IDs:
- See [Request Reporting Guide](/docs/troubleshooting/request-reporting)
- Request IDs help track specific API calls

#### 5. Console Errors

Check developer console for errors:

**Open Developer Tools:**
- **Windows/Linux:** `Ctrl+Shift+I` or `F12`
- **macOS:** `Cmd+Option+I`

**Or via menu:**
- **Developer** → **Toggle Developer Tools**

Look for:
- Red error messages
- Failed network requests
- JavaScript errors

#### 6. Logs

Access Cursor logs:

**Via Menu:**
- **Developer** → **Open Logs Folder**

**Common log locations:**
- **Windows:** `%APPDATA%\Cursor\logs`
- **macOS:** `~/Library/Application Support/Cursor/logs`
- **Linux:** `~/.config/Cursor/logs`

Include relevant log entries (especially errors) in your report.

---

## 🐛 Common Issues

### AI Features Not Working

**Symptoms:**
- Chat not responding
- Code generation not working
- "Connection error" messages

**Solutions:**
1. Check network connectivity (see above)
2. Verify API key/authentication
3. Check rate limits
4. Restart Cursor
5. Clear app data if persistent

### Slow Performance

**Symptoms:**
- Cursor feels sluggish
- High CPU/memory usage
- Slow startup

**Solutions:**
1. Disable unnecessary extensions
2. Check for large files in workspace
3. Clear cache and app data
4. Update Cursor to latest version
5. Check system resources

### Extension Conflicts

**Symptoms:**
- Features not working
- Crashes or freezes
- Error messages

**Solutions:**
1. Disable all extensions
2. Enable one by one to identify conflict
3. Update extensions
4. Check extension compatibility
5. Report to extension maintainer

### MCP Server Issues

**Symptoms:**
- MCP servers not connecting
- Tools not available
- Connection errors

**Solutions:**
1. Check MCP server configuration
2. Verify environment variables
3. Test server independently
4. Check server logs
5. Restart Cursor

### Update Issues

**Symptoms:**
- Update fails
- Stuck on old version
- Update notification persists

**Solutions:**
1. Check network connection
2. Download update manually
3. Clear app data and reinstall
4. Check firewall/antivirus
5. Run as administrator (Windows)

---

## 🔍 Diagnostic Commands

### Check Cursor Version

**Windows:**
```cmd
cursor --version
```

**macOS/Linux:**
```bash
cursor --version
```

### Check Installation

**Windows:**
```cmd
where cursor
```

**macOS/Linux:**
```bash
which cursor
```

### Run with Diagnostics

**Enable verbose logging:**
```bash
cursor --verbose
```

**Disable GPU acceleration (if graphics issues):**
```bash
cursor --disable-gpu
```

---

## 📚 Additional Resources

- [Cursor Forum](https://forum.cursor.com/) - Community support
- [Cursor Documentation](https://docs.cursor.com/) - Official docs
- [Cursor Changelog](https://www.cursor.com/changelog) - Latest updates
- [GitHub Issues](https://github.com/getcursor/cursor/issues) - Bug reports

---

## 💡 Prevention Tips

1. **Keep Cursor Updated**
   - Enable automatic updates
   - Check for updates regularly

2. **Manage Extensions**
   - Only install necessary extensions
   - Keep extensions updated
   - Remove unused extensions

3. **Regular Maintenance**
   - Clear cache periodically
   - Check for large log files
   - Monitor system resources

4. **Backup Settings**
   - Export your profile
   - Save custom configurations
   - Document MCP server setups

---

**Last Updated**: December 2024
**Cursor Version**: Latest
**Project**: Portal-main





