/**
 * @desc amWiki markdown 格式化
 * @author Glenn Li
 */

module.exports = {
    //创建

    indent: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }

        editor.moveToFirstCharacterOfLine();
        editor.insertText("\t");
    },

    bold: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }

        editor.moveToFirstCharacterOfLine();
        editor.insertText("**");
        editor.moveToEndOfLine();
        editor.insertText("**");
    },

    h1: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }

        editor.moveToFirstCharacterOfLine();
        editor.insertText("# ");
    },

    h2: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }

        editor.moveToFirstCharacterOfLine();
        editor.insertText("## ");
    },

    h3: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }

        editor.moveToFirstCharacterOfLine();
        editor.insertText("### ");
    },
}
