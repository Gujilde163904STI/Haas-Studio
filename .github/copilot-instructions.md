<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HAAS Studio Auto Translator Extension

This is a VS Code extension project that automatically translates Chinese text in the HAAS Studio extension to English.

## Project Guidelines

Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Key Features
- Automatically detects Chinese text in HAAS Studio webviews
- Uses Google Translate API for translation
- Provides toggle commands for enabling/disabling translation
- Caches translations for better performance
- Real-time DOM monitoring for dynamic content

## Development Notes
- The extension hooks into webview creation to inject translation scripts
- Uses MutationObserver to watch for DOM changes
- Implements translation caching to avoid repeated API calls
- Provides configuration options for translation service selection

## Translation Approach
1. Detects Chinese characters using Unicode ranges [\u4e00-\u9fff]
2. Skips content that's already in English
3. Injects JavaScript into webviews for real-time translation
4. Uses message passing between extension and webview for translation requests
