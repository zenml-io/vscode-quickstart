import * as vscode from "vscode";
import Quickstart from "./Quickstart";
import getNonce from "./utils/getNonce";

// Responsible for displaying Quickstart Steps
// Also responsible for changing the VSCode UI based on received messages from main.js
export default class ZenmlViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "zenml.stepsView";

  private _view?: vscode.WebviewView;
  private _quickstart;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    quickstart: Quickstart
  ) {
    this._quickstart = quickstart;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "openSection": {
          this._quickstart.openSection(data.id);
          break;
        }
        case "runCodeFile": {
          this._quickstart.runCode();
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
	
					<!--
						Use a content security policy to only allow loading styles from our extension directory,
						and only allow scripts that have a specific nonce.
						(See the 'webview-sample' extension sample for img-src content security policy examples)
					-->
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
	
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
					<title>Cool Stuff</title>
				</head>
				<body>
					<ul class="color-list">
					</ul>
	
					<button class="get-started">Say Hi</button>
          <button class="step-two">Go to Step 2</button>
          <button class="hello">Testing</button>
          <button class="execute-javascript">Execute Current Code</button>
	
					<script nonce="${nonce}" src="${scriptUri}"></script>
				</body>
				</html>`;
  }
}
