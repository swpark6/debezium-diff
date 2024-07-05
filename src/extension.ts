import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('debezium-json-diff-viewer.viewBeforeAfterDiff', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const text = document.getText();
            let jsonData;

            try {
                jsonData = JSON.parse(text);
            } catch (error) {
                vscode.window.showErrorMessage('The file content is not valid JSON.');
                return;
            }

            if (jsonData.before && jsonData.after) {
                const beforeContent = JSON.stringify(jsonData.before, null, 2);
                const afterContent = JSON.stringify(jsonData.after, null, 2);

                const beforeUri = vscode.Uri.parse('untitled:before.json');
                const afterUri = vscode.Uri.parse('untitled:after.json');

                // Open the before document
                const beforeDoc = await vscode.workspace.openTextDocument(beforeUri);
                const beforeEditor = await vscode.window.showTextDocument(beforeDoc, { preview: false });

                // Edit the before document
                await beforeEditor.edit(edit => edit.insert(new vscode.Position(0, 0), beforeContent));

                // Open the after document
                const afterDoc = await vscode.workspace.openTextDocument(afterUri);
                const afterEditor = await vscode.window.showTextDocument(afterDoc, { preview: false });

                // Edit the after document
                await afterEditor.edit(edit => edit.insert(new vscode.Position(0, 0), afterContent));

                // Show the diff view
                await vscode.commands.executeCommand('vscode.diff', beforeUri, afterUri, 'Before vs After');
            } else {
                vscode.window.showErrorMessage('The JSON does not contain "before" and "after" fields.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}