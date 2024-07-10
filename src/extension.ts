// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import quickstartMetadata from "./quickstart-metadata.json";
import Quickstart from "./Quickstart";
import ZenmlViewProvider from "./ZenmlViewProvider";

export async function activate(context: vscode.ExtensionContext) {
  const quickstart = new Quickstart(quickstartMetadata, context);
  const provider = new ZenmlViewProvider(context.extensionUri, quickstart);

  // Register webview
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ZenmlViewProvider.viewId,
      provider
    )
  );

  // If a user closes the terminal the extension opened we set it 
  // back to undefined so we know to open a new terminal
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal((closedTerminal) => {
      if (closedTerminal === quickstart.terminal) {
        quickstart.terminal = undefined;
      }
    })
  );

  quickstart.registerCommands();
}

// This method is called when your extension is deactivated
export function deactivate() {}
