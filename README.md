# Chordpro-editor
An HTML editor for ChordPro songs.

You can experiment it on http://oliverpool.github.io/chordpro-editor/.

The concept is simple: a `div` is added behind the `textarea` and backgrounds are added where needed.
This approach prevents complicated `contenteditable` tweaks (especially when dealing with shortcuts and markup).

Except the "header information" (like title), it support most of the ChordPro song features (at least the one used by [patanet](https://github.com/patacrep/patanet) project).

It uses the awesome [PEG.js](http://pegjs.org/) library.
