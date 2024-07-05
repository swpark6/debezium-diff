import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "debezium-json-viewer.viewBeforeAfter",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const text = document.getText();
        let jsonData;

        try {
          jsonData = JSON.parse(text);
        } catch (error) {
          vscode.window.showErrorMessage("The file content is not valid JSON.");
          return;
        }

        if (jsonData.before && jsonData.after) {
          const beforeContent = JSON.stringify(jsonData.before, null, 2);
          const afterContent = JSON.stringify(jsonData.after, null, 2);

          vscode.workspace
            .openTextDocument({ content: beforeContent, language: "json" })
            .then((doc) =>
              vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.One,
              })
            );

          vscode.workspace
            .openTextDocument({ content: afterContent, language: "json" })
            .then((doc) =>
              vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.Two,
              })
            );
        } else {
          vscode.window.showErrorMessage(
            'The JSON does not contain "before" and "after" fields.'
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
