//@ts-check
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  //@ts-ignore
  const vscode = acquireVsCodeApi();

  document.querySelector(".get-started")?.addEventListener("click", () => {
    onOpenMarkdown(0);
  });

  document.querySelector(".step-two")?.addEventListener("click", () => {
    onOpenMarkdown(1);
  });

  document
    .querySelector(".execute-javascript")
    ?.addEventListener("click", () => {
      onExecuteJavascript();
    });

  function onExecuteJavascript() {
    vscode.postMessage({ type: "runCodeFile" });
  }

  function onOpenMarkdown(id) {
    vscode.postMessage({ type: "openSection", id });
  }
})();
