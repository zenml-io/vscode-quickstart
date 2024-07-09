import * as vscode from "vscode";
import path from "path";
import generateHTMLfromMD from "./utils/generateHTMLfromMD";
import getNonce from "./utils/getNonce";

interface TutorialData {
  sections: QuickstartSection[];
}

interface QuickstartSection {
  tutorialTitle: string;
  tutorialPath: string;
  codePath: string;
}

export default class Quickstart {
  public metadata: TutorialData;
  public terminal: vscode.Terminal | undefined;
  public editor: vscode.TextEditor | undefined;
  public panel: vscode.WebviewPanel | undefined;
  public sections: QuickstartSection[];
  public context: vscode.ExtensionContext;
  public currentSection = 0;

  constructor(metadata: TutorialData, context: vscode.ExtensionContext) {
    this.metadata = metadata;
    this.sections = this.metadata.sections;
    this.context = context;
  }

  async openSection(sectionId: string) {
    this.currentSection = parseInt(sectionId, 10); // set current step to opened section -- should probbaly include some verification that that step exists first
    await vscode.commands.executeCommand("vscode.setEditorLayout", {
      orientation: 0,
      groups: [
        { groups: [{}], size: 0.5 },
        { groups: [{}], size: 0.5 },
      ],
    });
    vscode.commands.executeCommand("zenml.openCodePanel", sectionId);
    vscode.commands.executeCommand("zenml.openDocPanel", sectionId);
  }

  openNextSection() {
    const maxSteps = this.sections.length - 1;
    let nextStep = (this.currentSection += 1);
    if (nextStep > maxSteps) {
      return;
    }
    this.openSection(nextStep.toString());
  }

  runCode() {
    vscode.commands.executeCommand("zenml.runCurrentPythonFile");
  }

  onOpenDocPanel(id: number) {
    if (!this.panel) {
      this._initializePanel();
    }

    const tutorialPath = path.join(
      this.context.extensionPath,
      this.sections[id].tutorialPath
    );

    // nullcheck to make typescript happy
    if (this.panel) {
      this.panel.title = this.sections[id].tutorialTitle;
      this.panel.webview.html = generateHTMLfromMD(tutorialPath);
    }
  }

  async onOpenCodePanel(fileId: number) {
    const onDiskPath = path.join(
      this.context.extensionPath,
      this.sections[fileId].codePath
    );

    const filePath = vscode.Uri.file(onDiskPath);

    await this._openFile(filePath);
  }

  onRunCodeFile() {
    try {
      const activeEditorIsCurrentEditor =
        this.editor === vscode.window.activeTextEditor;

      if (!this.editor || !activeEditorIsCurrentEditor) {
        throw new Error("File has to be open and visible to execute");
      }

      const filePath = this.editor.document.uri.fsPath;
      const signalFilePath = this._initializeFileWatcher(filePath); // To automatically run

      if (!this.terminal) {
        this.terminal = vscode.window.createTerminal("PY Runner");
      }

      this.terminal.sendText(
        `python "${filePath}" && touch "${signalFilePath}"`
      );

      this.terminal.show();
    } catch (error) {
      vscode.window.showErrorMessage(`File has to be open to execute.`);
    }
  }

  private async _openFile(filePath: vscode.Uri) {
    try {
      const document = await vscode.workspace.openTextDocument(filePath);
      this.editor = await vscode.window.showTextDocument(
        document,
        vscode.ViewColumn.One
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open file: ${error}`);
    }
  }

  private _initializePanel() {
    this.panel = vscode.window.createWebviewPanel(
      "zenml.markdown", // used internally - I think an identifier
      "Zenml", // displayed to user
      vscode.ViewColumn.Two,
      {}
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  // Watcher is created in the same directory as the file being executed
  // So we're taking in the path to the file being executed and manipulating it
  // to get the directory
  private _initializeFileWatcher(path: string) {
    const removeLastFileFromPath = (filePath: string) => {
      let sections = filePath.split("/");
      sections.pop();
      return sections.join("/") + "/";
    };

    const uniqueNumber = getNonce();
    const signalFileName = `runcomplete${uniqueNumber}.txt`;
    const pathWithoutEndFile = removeLastFileFromPath(path);
    const signalFilePath = `${pathWithoutEndFile}${signalFileName}`;

    // File System watcher for signal file
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(pathWithoutEndFile, "*.txt")
    );

    // Logic to run once the signal file is created, includes disposing watcher
    watcher.onDidCreate(() => {
      vscode.window.showInformationMessage("Code Run Successfully! 🎉");
      vscode.workspace.fs.delete(vscode.Uri.file(signalFilePath));
      this.openNextSection();
      watcher.dispose();
    });

    return signalFilePath;
  }
}
