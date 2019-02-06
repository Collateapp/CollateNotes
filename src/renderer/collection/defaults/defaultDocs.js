export default [
  {
    fileName: 'Welcome-to-Collate.note',
    noteFileName: 'Welcome-to-Collate.md',
    body: `# Hi, thanks for trying out Collate!
## Collate is a note taking application that takes your data seriously.
It does this by making sure all your files are stored and organized in folders with plain text files.  This means that even if you don't have access to Collate, your notes can be read and edited as easily as looking through documents on your computer.  Your notes are stored locally, which gives you the option of using any number of services to sync your data. Don't want your data in the cloud? Store your collection on your hard drive or a pen drive. The choice is yours Collate will never send or receive your data without permission.
### Collection
A \`Collection\` is simply a folder on your computer where Collate creates notebooks and notes.  Nothing fancy about it!

### Notebooks
A \`Notebook\` is just a folder inside a \`Collection\`.

### Notes
Notes are folders with a \`.md\` file which is a plain text file that uses [Markdown](http://kirkstrobeck.github.io/whatismarkdown.com/) formatting or HTML

**If you click the preview button in the bar above (the eye icon), you can see how markdown looks when rendered. **

Markdown is great because it gives you the simplicity of keeping notes in plain text with the option of addng some flair.

#### Markdown files
A quick note on how the Markdown files are actually stored. If you open this note up with a text editing program, you'll see a small section on top that looks like this:

\`\`\`
---
title: Welcome to Collate!
tags: []
type: 'markdown'
---
\`\`\`

This tiny block is call front matter! It's formatted in a way that both humans and machines can read and is used to store data like tags.  Everything underneath this block is the contents of your editor, depending on the type of note you've created.

#### Note Types

Note types are flexible ways to create notes. The types of notes you can create using Note Types:

1. Markdown - Plain text notes using Markdown formatting. This is the most basic type of note and the most readable plain text format.
2. Rich Text - Text formatted with HTML.  This note type allows for more formatting options including font color and embedded images. Notes are saved as .html files which can be previewed in a browser.
3. Web Clipper - Give it a URL and it will save the website to the attachments folder. This note type is useful for saving and archiving webpages.
4. Outline - Create outlines with the Outline note type which also doubles as a checklist.

#### Attachments
Each note can have a folder named \`attachments\` in it.  This attachment folder will hold any files you attach to the note.  You can attach anything!  Documents, pictures, media clips, etc.  If you want to remember it, create a note, attach the file and write a short description.
`,
    frontmatter: {
      title: 'Welcome to Collate!',
      tags: ['Collate']
    }
  },
  {
    fileName: 'tips.note',
    noteFileName: 'tips.md',
    frontmatter: {
      title: 'Tips',
      tags: ['Collate']
    },
    body: `# Collate pro tips

1. Sync notes. If you'd like your notes accessible anywhere, simply put your collection inside a synced folder.  Services like Google Drive, Dropbox, and Box offer ways to keep your files in sync.
  - [Google Drive](https://support.google.com/drive/answer/2374987?hl=en&ref_topic=6069785)
  - [Dropbox](https://www.dropbox.com/en/help/)
  - [Box](https://sites.box.com/sync/)

2. Import data. Import data from Evernote using the built in importer! [Follow this tutorial](http://www.collatenotes.com/export-from-evernote/) to export your data from Evernote and into Collate.

3. Keyboard shortcuts. Customize keyboard shortcuts in the settings.

4. Too many panes? Click the Collate logo on the top left of the screen to collapse the Notebook and Tag pane.

5. Standalone editor. Right click on a note and choose 'Open in Editor' to open up a compact note editor.  Useful to save some screen real estate!

6. Multiple windows.  Need to reference more than one note?  Either open in the mini editor or click Collate > New Window in the menu bar to open up a new window.

7. Have an idea on how to improve Collate? Found a bug? Click Help > Open Help Pane > Report a bug  (It's okay if it's not a bug).
`
  }
]
