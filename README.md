# HAAS Studio Auto Translator

A VS Code extension that automatically translates Chinese text in the HAAS Studio extension to English, making it more accessible for English-speaking developers.

## Features

- **Automatic Detection**: Identifies Chinese text in HAAS Studio webviews and UI elements
- **Real-time Translation**: Translates content as it appears using Google Translate
- **Smart Caching**: Avoids repeated translation of the same text for better performance
- **Toggle Control**: Enable/disable translation with a simple command
- **Configuration Options**: Choose between different translation services

## Installation

1. Clone this repository
2. Open in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to launch the extension in a new Extension Development Host window

## Usage

### Commands

- **Translate All Text**: `HAAS Translator: Translate All Text`
  - Manually trigger translation of all visible HAAS Studio content
  
- **Toggle Auto Translation**: `HAAS Translator: Toggle Auto Translation`
  - Enable or disable automatic translation

### Configuration

The extension can be configured through VS Code settings:

```json
{
  "haasStudioTranslator.enabled": true,
  "haasStudioTranslator.translationService": "google",
  "haasStudioTranslator.apiKey": ""
}
```

## How It Works

1. **Extension Activation**: The extension activates when VS Code starts
2. **Webview Monitoring**: Hooks into webview creation to detect HAAS Studio panels
3. **Script Injection**: Injects translation JavaScript into HAAS Studio webviews
4. **Text Detection**: Uses MutationObserver to watch for new Chinese text
5. **Translation**: Sends text to translation service and updates the DOM

## Supported Translation Services

- **Google Translate** (default): Free public API
- **Microsoft Translator**: Requires API key (planned)

## Development

### Project Structure

```
src/
├── extension.ts          # Main extension code
├── translationService.ts # Translation service interfaces
└── ...

package.json              # Extension manifest
tsconfig.json            # TypeScript configuration
```

### Building

```bash
npm run compile
```

### Testing

```bash
npm run test
```

## Requirements

- VS Code 1.74.0 or higher
- HAAS Studio extension installed
- Internet connection for translation services

## Known Limitations

- Currently only translates Chinese to English
- Requires active internet connection
- Translation quality depends on the service used
- Some UI elements may not be translatable due to security restrictions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### 0.0.1
- Initial release
- Basic Chinese to English translation
- Google Translate integration
- Configuration options
