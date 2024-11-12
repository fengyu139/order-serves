const { exec } = require('child_process');

// 在 macOS 上通过 AppleScript 触发 Command+E
setInterval(() => {
exec(`osascript -e 'tell application "System Events" to keystroke "e" using {command down}'`);
}, 6000);