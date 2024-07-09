import { marked } from "marked";
import { readFileSync } from "fs";

export default function generateHTMLfromMD(filePath: string) {
  const tutorialMarkdown = readFileSync(filePath, { encoding: "utf-8" });
  // marked will return a string unless set up to use async option
  const tutorialBody = marked(tutorialMarkdown) as string;

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tutorial</title>
  </head>
  <body>
  ${tutorialBody}
  </body>
  </html>`;
}