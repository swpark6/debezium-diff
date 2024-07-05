import * as vscode from "vscode";
import * as DeepDiff from "deep-diff";

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined;
  let documentUri: vscode.Uri | undefined;

  let disposable = vscode.commands.registerCommand(
    "debezium-json-diff-viewer.viewBeforeAfterDiff",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        documentUri = document.uri;
        await updateWebviewContent(document.getText());

        if (!panel) {
          panel = vscode.window.createWebviewPanel(
            "debeziumJsonDiff",
            "Debezium JSON Diff",
            vscode.ViewColumn.One,
            { enableScripts: true }
          );

          panel.onDidDispose(
            () => {
              panel = undefined;
              documentUri = undefined;
            },
            null,
            context.subscriptions
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);

  vscode.workspace.onDidChangeTextDocument(
    async (event) => {
      if (panel && event.document.uri.toString() === documentUri?.toString()) {
        await updateWebviewContent(event.document.getText());
      }
    },
    null,
    context.subscriptions
  );

  async function updateWebviewContent(text: string) {
    let jsonData;

    try {
      jsonData = JSON.parse(text);
    } catch (error) {
      if (panel) {
        panel.webview.html = getWebviewContent(
          "The file content is not valid JSON."
        );
      }
      return;
    }

    try {
      if (jsonData.before && jsonData.after) {
        const diff = DeepDiff.diff(jsonData.before, jsonData.after);
        const formattedDiff = formatDiff(jsonData.before, diff);
        if (panel) {
          panel.webview.html = getWebviewContent(`<pre>${formattedDiff}</pre>`);
        }
      } else {
        if (panel) {
          panel.webview.html = getWebviewContent(
            'The JSON does not contain "before" and "after" fields.'
          );
        }
      }
    } catch (error: unknown) {
      if (panel) {
        panel.webview.html = getWebviewContent(
          "Error generating diff: " + (error as Error).message
        );
      }
    }
  }

  function formatDiff(base: any, diff: any): string {
    if (!diff) return JSON.stringify(base, null, 2);

    const delta = JSON.parse(JSON.stringify(base));

    diff.forEach((change: any) => {
      const path = change.path;
      let parent = delta;
      path.forEach((key: string, index: number) => {
        if (index === path.length - 1) {
          parent[
            key
          ] = `<span style="background-color: yellow">${parent[key]}</span>`;
        } else {
          parent = parent[key];
        }
      });
    });

    return JSON.stringify(delta, null, 2)
      .replace(/\"<span/g, "<span")
      .replace(/span>\"/g, "span>");
  }

  function getWebviewContent(content: string): string {
    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Debezium JSON Diff</title>
                <style>
                    body {
                        font-family: sans-serif;
                        margin: 0;
                        padding: 1rem;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    pre {
                        white-space: pre-wrap;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
  }
}

export function deactivate() {}
