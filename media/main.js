//@ts-check
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  //@ts-ignore
  const vscode = acquireVsCodeApi();

  document.querySelectorAll(".section").forEach((element) => {
    element.addEventListener("click", (e) => {
      //@ts-ignore
      const id = parseInt(e.target?.dataset.id, 10);
      handleOpenSection(id);
    });
  });

  document.querySelectorAll(".run-code").forEach((element) => {
    element.addEventListener("click", () => {
      handleRunCode();
    });
  });

  function handleRunCode() {
    vscode.postMessage({ type: "runCodeFile" });
  }

  function handleOpenSection(id) {
    vscode.postMessage({ type: "openSection", id });
  }
})();

(function () {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
})();
