import * as vscode from "vscode";
import path from "path";
import generateHTMLfromMD from "./utils/generateHTMLfromMD";
import getNonce from "./utils/getNonce";

interface TutorialData {
  sections: QuickstartSection[];
}

interface SectionStep {
  doc: string;
  code: string;
}

interface QuickstartSection {
  title: string;
  description: string;
  steps: SectionStep[];
}

class QuickstartSection {
  title: string;
  description: string;
  _steps: SectionStep[];
  currentStep: number;
  private _done = false;

  constructor(section: QuickstartSection) {
    this.title = section.title;
    this.description = section.description;
    this._steps = section.steps;
    this.currentStep = 0;
    return this;
  }

  nextStep() {
    if (this.currentStep + 1 < this._steps.length) {
      this.currentStep++;
    } else {
      this._done = true;
    }
  }

  doc() {
    return this._steps[this.currentStep].doc;
  }

  code() {
    return this._steps[this.currentStep].code;
  }

  reset() {
    this.currentStep = 0;
  }

  done?() {
    return this._done;
  }
}

export default class Quickstart {
  public metadata: TutorialData;
  public terminal: vscode.Terminal | undefined;
  public editor: vscode.TextEditor | undefined;
  public panel: vscode.WebviewPanel | undefined;
  public sections: QuickstartSection[];
  public context: vscode.ExtensionContext;
  public currentSectionIndex = 0;

  constructor(metadata: TutorialData, context: vscode.ExtensionContext) {
    this.metadata = metadata;
    this.sections = this.metadata.sections.map((section) => {
      return new QuickstartSection(section);
    });
    this.context = context;
  }

  registerCommands() {
    this.context.subscriptions.push(
      vscode.commands.registerCommand("zenml.openDocPanel", this.onOpenDocPanel)
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "zenml.openCodePanel",
        this.onOpenCodePanel
      )
    );

    // Runs the first open text editor with node - Creates a terminal if there isn't one already
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "zenml.runCurrentPythonFile",
        async () => {
          this.onRunCodeFile();
        }
      )
    );
  }

  async openSection(sectionId: number) {
    this.currentSectionIndex = sectionId; // set current step to opened section -- should probbaly include some verification that that step exists first
    const currentSection = this.sections[this.currentSectionIndex];
    await vscode.commands.executeCommand("vscode.setEditorLayout", {
      orientation: 0,
      groups: [
        { groups: [{}], size: 0.5 },
        { groups: [{}], size: 0.5 },
      ],
    });

    vscode.commands.executeCommand(
      "zenml.openCodePanel",
      currentSection.code()
    );
    vscode.commands.executeCommand(
      "zenml.openDocPanel",
      currentSection.title,
      currentSection.doc()
    );
  }

  openNextStep() {
    const currentSection = this.sections[this.currentSectionIndex];
    currentSection.nextStep();

    this.openSection(this.currentSectionIndex);
  }

  runCode() {
    vscode.commands.executeCommand("zenml.runCurrentPythonFile");
  }

  // VSCODE COMMANDS LOGIC:

  // ideally i just want this to have a title and a docPath
  onOpenDocPanel(title: string, docPath: string) {
    if (!this.panel) {
      this._initializePanel();
    }

    const tutorialPath = path.join(this.context.extensionPath, docPath);

    // nullcheck to make typescript happy
    if (this.panel) {
      this.panel.title = title;
      this.panel.webview.html = generateHTMLfromMD(tutorialPath);
    }
  }

  async onOpenCodePanel(codePath: string) {
    const onDiskPath = path.join(this.context.extensionPath, codePath);

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

  // PRIVATE METHODS:

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
      this.openNextStep();
      watcher.dispose();
    });

    return signalFilePath;
  }
}
