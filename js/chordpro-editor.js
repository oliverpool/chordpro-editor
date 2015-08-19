ChordProEditor = {
    //main function
    watch: function(classSelector){
        this.songs = document.querySelectorAll('textarea.'+classSelector);
        this.background_songs = [];

        this.insert_backgrounds(this.songs);
        //this.background_songs = document.querySelectorAll('div.'+classSelector);

        this.load_grammar();
    },

    debug:false,

    resfreshTimers: [],
    resfreshDelay: 500,

    // song tags transformation
    insert_backgrounds: function(songs) {
        var length = songs.length;
        var background_model = document.createElement('div');
        background_model.className = "chordpro-song";
        for (var i = 0; i < length; i++) {
            songs[i].dataset.id = i;
            this.textarea_adjust_height(songs[i]);
            var background_song = background_model.cloneNode(false);
            this.insert_background(songs[i], background_song);
        }
    },
    insert_background: function(song, background_song) {
        song.parentNode.insertBefore(background_song, song);
        this.background_songs.push(background_song);
    },


    textarea_adjust_height: function(song) {
        song.style.height = 'auto';
        song.style.height = song.scrollHeight+'px';
    },

    // song markup transformation
    initialize_markups: function(songs) {
        var length = songs.length;
        for (var i = 0; i < length; i++) {
            addEvent(songs[i], 'input', this.markup_changed);
            addEvent(songs[i], 'keyup', this.markup_changed);
            this.update_markup(songs[i]);
        }
    },
    markup_changed: function(event){
        var song = event.target;
        ChordProEditor.textarea_adjust_height(song);
        var id = song.dataset.id;
        window.clearTimeout(ChordProEditor.resfreshTimers[id]);
        ChordProEditor.resfreshTimers[id] = window.setTimeout(function(){
            ChordProEditor.update_markup(song);
        }, ChordProEditor.resfreshDelay);
    },
    clean_newlines: function(text){
        // add a leading newline
        clean_text = '\n' + text;
        // only "\n" type are considered
        clean_text = clean_text.replace(/\r\n/g ,'\n').replace(/\r/g ,'\n');
        // add a trailing newline if missing
        if(clean_text.slice(-1) != '\n'){
            clean_text += '\n';
        }
        return clean_text;
    },
    clean_formatted_newlines: function(text){
        // remove first newline and add a trailing newline
        return text.slice(1) + "\n";
    },
    insert_exception_markup: function(exception, text){
        if(ChordProEditor.debug){
            console.log(exception);
        }
        var line = exception.line - 1;
        var column = exception.column - 1;

        var max_line = (text.match(/\n/g) || []).length;
        if(line == max_line){
            line -= 1;
        }

        var regex_model = '^((?:[^\\n]*\\n){@line})([^\\n]{@column})([^\\n]?)([^\\n]*)((?:\\n.*)*)$';
        regex_model = regex_model.replace('@line', line);
        regex_model = regex_model.replace('@column', column);
        var regex = new RegExp(regex_model);

        matches = text.match(regex);

        formatted_text = matches[1];
        formatted_text += '<span class="error-line">';
        formatted_text += matches[2];
        formatted_text += '<span class="error-char">';
        formatted_text += matches[3];
        formatted_text += '</span>';
        formatted_text += matches[4];
        formatted_text += '</span>';
        formatted_text += matches[5];

        return formatted_text;
    },
    update_markup: function(song) {
        var id = song.dataset.id;
        var background_song = ChordProEditor.background_songs[id]

        var raw_text = ChordProEditor.clean_newlines(song.value);

        var parsed_text;
        try {
            parsed_text = ChordProEditor.peg.parse(raw_text);
        } catch (exception) {
            parsed_text = ChordProEditor.insert_exception_markup(exception, raw_text);
        }
        parsed_text = ChordProEditor.clean_formatted_newlines(parsed_text);

        background_song.innerHTML = parsed_text;
    },


    //load grammar file
    grammar_file: "js/grammar.txt",
    load_grammar: function(){
        this.load_file(this.grammar_file, this.parse_grammar);
    },
    parse_grammar: function(text){
        this.peg = PEG.buildParser(text);
        this.initialize_markups(this.songs);
        this.prevent_chord_overlapping();
    },

    // Method to load a plain text file
    // https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/
    load_file: function(filepath, success_callback){
        var that = this;
        var r = new XMLHttpRequest();
        r.open("GET", filepath, true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;
            success_callback.apply(that, [r.responseText]);
        };
        r.overrideMimeType("text/plain");
        r.send();
    },

    //switch css style
    switch_to_visual_css: function(set_visual){
        var active = (set_visual)?"visual":"editor";
        var current_href = document.getElementById("editor_css").getAttribute('href');
        var new_href = current_href.replace(/[^\/]+\.css$/, active + ".css");
        document.getElementById("editor_css").setAttribute('href', new_href);
        if(set_visual){
            this.prevent_chord_overlapping();
        }
    },
    prevent_chord_overlapping: function(){
        var chords = document.querySelectorAll('div > p > span.chord');
        var line = -1;
        var offsetX = 0;
        for (var i = 0; i < chords.length; i++) {
            if(chords[i].offsetWidth > 0){
                return setTimeout(this.prevent_chord_overlapping, 500);
            }
            var rect = chords[i].getBoundingClientRect();
            if(rect.top == line && rect.left < offsetX){
                chords[i].style.marginLeft = (offsetX - rect.left) + "px";
                rect = chords[i].getBoundingClientRect();
            }
            line = rect.top;
            offsetX = rect.left + chords[i].scrollWidth;
        }
    }
}


// from https://plainjs.com/javascript/events/binding-and-unbinding-of-event-handlers-12/
function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
}
/*
function removeEvent(el, type, handler) {
    if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
}
*/
