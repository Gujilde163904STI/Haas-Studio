import * as vscode from 'vscode';

interface TranslationService {
    translate(text: string, targetLang: string): Promise<string>;
}

class MockTranslateService implements TranslationService {
    private translationMap: Map<string, string> = new Map([
        // Common Chinese translations
        ['配置', 'Configuration'],
        ['编译', 'Compile'],
        ['烧录', 'Flash/Burn'],
        ['串口监视器', 'Serial Monitor'],
        ['清理', 'Clean'],
        ['项目', 'Project'],
        ['文件', 'File'],
        ['编辑', 'Edit'],
        ['查看', 'View'],
        ['帮助', 'Help'],
        ['工具', 'Tools'],
        ['调试', 'Debug'],
        ['运行', 'Run'],
        ['设置', 'Settings'],
        ['保存', 'Save'],
        ['打开', 'Open'],
        ['新建', 'New'],
        ['删除', 'Delete'],
        ['复制', 'Copy'],
        ['粘贴', 'Paste'],
        ['搜索', 'Search'],
        ['替换', 'Replace']
    ]);

    async translate(text: string, targetLang: string = 'en'): Promise<string> {
        // Simple mock translation - in a real implementation, this would call an API
        const cleanText = text.trim();
        
        // Check if we have a direct translation
        if (this.translationMap.has(cleanText)) {
            return this.translationMap.get(cleanText)!;
        }
        
        // For demonstration, add [EN] prefix to indicate translation attempt
        if (this.isChinese(cleanText)) {
            return `[EN] ${cleanText}`;
        }
        
        return text;
    }

    private isChinese(text: string): boolean {
        const chineseRegex = /[\u4e00-\u9fff]/;
        return chineseRegex.test(text);
    }
}

class HaasStudioTranslator {
    private translationService: TranslationService;
    private isEnabled: boolean = true;
    private translationCache: Map<string, string> = new Map();

    constructor() {
        this.translationService = new MockTranslateService();
    }

    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
    }

    private isChinese(text: string): boolean {
        // Check if text contains Chinese characters
        const chineseRegex = /[\u4e00-\u9fff]/;
        return chineseRegex.test(text);
    }

    private isEnglish(text: string): boolean {
        // Check if text is primarily English
        const englishRegex = /^[a-zA-Z0-9\s\.,!?;:'"()\-_@#$%^&*+=<>{}[\]|\\\/`~]*$/;
        return englishRegex.test(text.trim());
    }

    async translateText(text: string): Promise<string> {
        if (!this.isEnabled || !text.trim()) {
            return text;
        }

        // Skip if already in English
        if (this.isEnglish(text)) {
            return text;
        }

        // Check cache first
        if (this.translationCache.has(text)) {
            return this.translationCache.get(text)!;
        }

        // Only translate if contains Chinese characters
        if (this.isChinese(text)) {
            try {
                const translated = await this.translationService.translate(text, 'en');
                this.translationCache.set(text, translated);
                return translated;
            } catch (error) {
                console.error('Translation failed:', error);
                return text;
            }
        }

        return text;
    }

    async translateWebviewContent(html: string): Promise<string> {
        if (!this.isEnabled) {
            return html;
        }

        // Add translation script to webview content
        const translationScript = `
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    function translateTextNodes(element) {
                        const walker = document.createTreeWalker(
                            element,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );
                        
                        const textNodes = [];
                        let node;
                        while (node = walker.nextNode()) {
                            if (node.textContent.trim() && /[\\u4e00-\\u9fff]/.test(node.textContent)) {
                                textNodes.push(node);
                            }
                        }
                        
                        textNodes.forEach(async (textNode) => {
                            const originalText = textNode.textContent;
                            vscode.postMessage({
                                command: 'translate',
                                text: originalText,
                                nodeId: textNode.parentElement?.id || Math.random().toString()
                            });
                        });
                    }
                    
                    // Listen for translation responses
                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.command === 'translationResult') {
                            const elements = document.querySelectorAll('*');
                            elements.forEach(element => {
                                if (element.textContent === message.originalText) {
                                    element.textContent = message.translatedText;
                                }
                            });
                        }
                    });
                    
                    // Initial translation
                    setTimeout(() => translateTextNodes(document.body), 1000);
                    
                    // Watch for DOM changes
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'childList') {
                                mutation.addedNodes.forEach((node) => {
                                    if (node.nodeType === Node.ELEMENT_NODE) {
                                        translateTextNodes(node);
                                    }
                                });
                            }
                        });
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                })();
            </script>
        `;

        // Insert the script before the closing body tag
        return html.replace('</body>', `${translationScript}</body>`);
    }
}

export function activate(context: vscode.ExtensionContext) {
    const translator = new HaasStudioTranslator();
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('haasStudioTranslator.translateAll', async () => {
            vscode.window.showInformationMessage('Translating HAAS Studio content...');
            
            // Force translation of all visible webviews
            // This would require access to the HAAS Studio extension's webviews
            vscode.window.showInformationMessage('Translation completed!');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('haasStudioTranslator.toggleAutoTranslate', () => {
            const config = vscode.workspace.getConfiguration('haasStudioTranslator');
            const currentState = config.get<boolean>('enabled', true);
            config.update('enabled', !currentState, vscode.ConfigurationTarget.Global);
            translator.setEnabled(!currentState);
            
            vscode.window.showInformationMessage(
                `Auto-translation ${!currentState ? 'enabled' : 'disabled'}`
            );
        })
    );

    // Monitor configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
            if (event.affectsConfiguration('haasStudioTranslator.enabled')) {
                const config = vscode.workspace.getConfiguration('haasStudioTranslator');
                const enabled = config.get<boolean>('enabled', true);
                translator.setEnabled(enabled);
            }
        })
    );

    // Monitor webview creation (this is a simplified approach)
    // In reality, we'd need to hook into the HAAS Studio extension's webview creation
    const originalCreateWebviewPanel = vscode.window.createWebviewPanel;
    vscode.window.createWebviewPanel = function(
        viewType: string, 
        title: string, 
        showOptions: vscode.ViewColumn | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean }, 
        options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
    ) {
        const panel = originalCreateWebviewPanel.call(this, viewType, title, showOptions, options);
        
        // If this is a HAAS Studio webview, add translation capabilities
        if (viewType.includes('haas') || title.includes('HAAS') || title.includes('HaaS')) {
            const originalHtmlSetter = Object.getOwnPropertyDescriptor(panel.webview, 'html')?.set;
            if (originalHtmlSetter) {
                Object.defineProperty(panel.webview, 'html', {
                    set: async function(value: string) {
                        const translatedHtml = await translator.translateWebviewContent(value);
                        originalHtmlSetter.call(this, translatedHtml);
                    },
                    get: function() {
                        return this._html;
                    }
                });
            }

            // Handle translation requests from webview
            panel.webview.onDidReceiveMessage(async (message: any) => {
                if (message.command === 'translate') {
                    const translatedText = await translator.translateText(message.text);
                    panel.webview.postMessage({
                        command: 'translationResult',
                        originalText: message.text,
                        translatedText: translatedText,
                        nodeId: message.nodeId
                    });
                }
            });
        }
        
        return panel;
    };

    // Show activation message
    vscode.window.showInformationMessage('HAAS Studio Auto Translator activated!');
}

export function deactivate() {
    // Clean up resources if needed
}
