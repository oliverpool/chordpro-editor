# Chordpro-editor
An HTML editor for ChordPro songs.

You can experiment it on http://oliverpool.github.io/chordpro-editor/.

The concept is simple: a `div` is added behind the `textarea` and backgrounds are added where needed.
This approach prevents complicated `contenteditable` tweaks (especially when dealing with shortcuts and markup).

Currently it only support `chorus`, `verse` and `verse*` (verse preceded by only one newline). An extended support is planned (to be later integrated into the project [patanet](https://github.com/patacrep/patanet) project).
