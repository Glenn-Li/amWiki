/**
 * @desc amWiki 工作端·提取H2-H4为页内目录模块
 * @author Tevin
 */

module.exports = {
    //创建

	StartToc: 0,
	EndToc: 0,
	InsertPos:0,

    make: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }
        if (grammar.scopeName !== 'source.gfm' && grammar.scopeName !== 'text.md') {
            return;
        }

		var IsHasToc = this.hastoc(editor.getText());
		if (IsHasToc == true) {
			//editor.setTextInBufferRange(0, 0, this.extract(editor.getText()));
			//this.deleteToc();
			if (this.StartToc >= 0 && this.EndToc > this.StartToc) {
				editor.setTextInBufferRange([[this.StartToc, 0], [this.EndToc,20]], "");
			}
			//editor.insertText(this.extract(editor.getText()) || '');
			editor.setTextInBufferRange([[this.InsertPos, 0], [this.InsertPos, 0]], this.extract(editor.getText()));
		}
		else {
			//editor.insertText(this.extract(editor.getText()) || '');
			editor.setTextInBufferRange([[this.InsertPos, 0], [this.InsertPos, 0]], this.extract(editor.getText()));
		}
    },

	hastoc: function (arc) {
		var lines = arc.split('\n');
		if (lines.length == 1) {
            lines = lines[0].split('\r');
        }

		var open = false;
		var close = false;
		for (var i = 0; i < lines.length; i++) {
			if (!open) {
				//if (lines[i].match(/^<!--(.*)TOC(.*)-->$/)) {
				if (lines[i].match(/^<!--(.*)TOC(.*)-->/g)) {
					open = true;
					this.StartToc = i;
				}
			}
			else {
				//if(lines[i].match(/^<!--(.*)\/TOC(.*)-->$/)) {
				if (lines[i].match(/^<!--(.*)\/TOC(.*)-->/)) {
            		close = true;
					this.EndToc = i;
					break;
				}
			}
		}

		if (open == true && close == true) {
			return true;
		}
		return false;
	},

    //抽取标题
    extract: function (arc) {
        var lines = arc.split('\n');
        if (lines.length == 1) {
            lines = lines[0].split('\r');
        }
        var contents = '';
        var lineStr = '';
        var hashStr = '';
        var h1 = '';
		var Title = undefined;

		for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replace(/^\s*/, '');
            switch (lines[i].split(/\s/)[0]) {
                case '#':
                    var text = lines[i].split('# ')[1];
                    if (text != undefined) {
						if (this.InsertPos == 0) {
							this.InsertPos = 0;
						}
                        lineStr = text.replace(/^\s+|\s+$/g, ''); //去除首位空格
                        h1 = h1 == '' ? lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1') : h1;
						if (Title == undefined) {
							Title = lines[i];
						}						
                    }
                    break;
                case '##':
                    var text = lines[i].split('## ')[1];
                    if (text != undefined) {
                        lineStr = text.replace(/^\s+|\s+$/g, '');
                        lineStr = lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1'); //去除链接
                        contents += '1. [' + lineStr + '](#' + lineStr + ' "' + lineStr + '")\n';
                    }
                    break;
                case '###':
                    var text = lines[i].split('### ')[1];
                    if (text != undefined) {
                        lineStr = text.replace(/^\s+|\s+$/g, '');
                        lineStr = lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                        contents += '\t1. [' + lineStr + '](#' + lineStr + ' "' + lineStr + '")\n';
                    }
                    break;
				case '####':
                    var text = lines[i].split('#### ')[1];
                    if (text != undefined) {
                        lineStr = text.replace(/^\s+|\s+$/g, '');
                        lineStr = lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                        contents += '\t\t1. [' + lineStr + '](#' + lineStr + ' "' + lineStr + '")\n';
                    }
                    break;
            }
        }
        if (contents.substr(0, 2) != '1.') {
            contents = '1. ' + h1 + '\n' + contents;
        }

		contents = '>' + contents; //  The third line
		if (Title != undefined) {
			contents = Title + '\n' + contents;  // the second line
		}
		contents = "<!-- TOC depthFrom:0 depthTo:4 withLinks:1 updateOnSave:1 orderedList:1 -->\n" + contents; // First line

		contents += "<!-- /TOC -->";
        return contents;
    }

};
