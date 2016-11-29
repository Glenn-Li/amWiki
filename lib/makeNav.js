/**
 * @desc amWiki 工作端·创建$navigation导航文件模块
 * @author Tevin
 */

var fs = require("fs");
var directories = require('./directories');

module.exports = {
    //手动更新导航
	checkNameFomat : true,

    update: function (state, callback) {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            alert('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return;
        }
        if (grammar.scopeName !== 'source.gfm' && grammar.scopeName !== 'text.md') {
            alert('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return;
        }
        if (editor.getPath().indexOf('library') < 0) {
            alert('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return;
        }

		var atomProjects = atom.project.getPaths();
		var editorPath = editor.getPath();

		for (i = 0; i < atomProjects.length; i++) {
			if (editorPath.indexOf(atomProjects[i]) != -1) {
				projectPath = atomProjects[i];
				break;
			}
		}

		configPath = projectPath + '\\config.json';

		console.info("Glenn -- configPath:" + configPath);
		var exists = true;
		//= fs.exists(configPath);
		console.info("Glenn -- exists:" + exists);
        if (!exists) {
            alert(configPath + ' 文件不存在！');
			return;
        } else {
			console.info("Glenn -- Read Config File:");
            var config = fs.readFileSync(configPath, 'utf-8') || '';
			if (config.length == 0) {
	            if (!confirm('没有读取到任何配置，继续么？')) {
	                return;
	            } else {
	                config = "{}";
	            }
	        }
	        //解析默认配置
	        var parseOk = true;
	        try {
	            config = JSON.parse(config);
	        } catch (e) {
	            alert('配置解析失败，请检查您的 config.json 是否有严格按 Json 格式书写！\n错误消息：' + e.message);
	            parseOk = false;
	        }
	        if (!parseOk) {
	            return;
	        }
			config.namefomat =  config.namefomat || 'true';
			console.info("Glenn -- namefomat:" + config.namefomat);
			this.checkNameFomat = config.namefomat == 'true' ? true : false;
        }

        this.refresh(editor.getPath(), function (libPath) {
            //如果当前文库没有记录，添加记录
			console.info("Glenn -- refresh:" + this.checkNameFomat?'true':'false');
            var hs, i;
            i = 0;
            hs = false;
            while (i < state.libraryList.length) {
                if (state.libraryList[i] === libPath) {
                    hs = true;
                    break;
                }
                i++;
            }
            if (!hs) {
                state.libraryList.push(libPath);
                callback && callback(libPath);
            }
        });
    },
    //刷新导航（创建wiki时）
    refresh: function (editorPath, callback) {

        var that = this;
        var path = editorPath.replace(/\\/g, '/').split('library')[0] + 'library/';
        callback && callback(path);
        directories.readLibraryDir(path, function (err, tree, folders) {
            if (err) {
                console.warn(err);
            } else {
                that.make(path, tree);
            }
        });
    },
    //创建md导航文件
    make: function (path, data) {
        if (this.hasDuplicateId(data)) {
            return;
        }
        var hsErrId = false;
        var checkId = function (name, path) {
			if (this.checkNameFomat) {
				if (/^\d+(\.\d+)?[-_](.*?)$/.test(name)) {
	                return true
	            } else {
	                var text = 'Error File ID!\n排序id仅允许由整数或浮点数构成，并使用连接符或下划线与具体名称相连\n' +
	                    '    at path "library/' + path + '"\n' +
	                    '    at file "' + name + '"';
	                hsErrId = true;
	                alert(text);
	                return false;
	            }
			} else {
				return true;
			}

        };
        var checkFileName = function (name, path) {
			if (this.checkNameFomat) {
				if (/^\d+(\.\d+)?[-_](.*?)\.md$/.test(name)) {
	                return true
	            } else {
	                var errText = 'Error File Name\n文件名须由 “排序id-名称.md” 格式构成\n' +
	                    '    at path "library/' + path + '/"\n' +
	                    '    at file "' + name + '"';
	                alert(errText);
	                return false;
	            }
			} else {
				return true;
			}
        };
        var markdown = '';
        markdown += '\n#### [HomePage](?file=HomePage "Return HomePage")\n';
        for (var dir1 in data) {
            if (data.hasOwnProperty(dir1) && checkId(dir1, '')) {
				if (data[dir1]) { // 第一层目录
					//console.info("Glenn -- There is in First folder:" + dir1);
					if (this.checkNameFomat) {
	                	markdown += '\n##### ' + dir1.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '\n';
					} else {
						markdown += '\n##### ' + dir1 + '\n';
					}

	                for (var dir2 in data[dir1]) {
	                    if (data[dir1].hasOwnProperty(dir2) && checkId(dir2, dir1 + '/')) {
	                        //当为文件夹时
	                        if (data[dir1][dir2]) {  // 第二层 目录
								//console.info("Glenn -- There is in second folder:" + dir2);
								if (this.checkNameFomat) {
									markdown += '- **' + dir2.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '**\n';
								} else {
									markdown += '- **' + dir2 + '**\n';
								}

	                            for (var dir3 in data[dir1][dir2]) {

									if (data[dir1][dir2][dir3]) { // 第三层 目录
										console.info("Glenn -- There is in thrid folder:" + dir3);
										if (this.checkNameFomat) {
											markdown += '		- *' + dir3.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '*\n';
										} else {
											markdown += '		- *' + dir3 + '*\n';
										}

										for (var dir4 in data[dir1][dir2][dir3]) {  // 只添加第四层的文件
											if (data[dir1][dir2][dir3].hasOwnProperty(dir4) && checkId(dir4, dir1 + '/' + dir2 + '/' + dir3 + '/')) {
			                                    if (checkFileName(dir4, dir1 + '/' + dir2 + '/' + dir3 + '/')) {
													var name3 = '';
													if (this.checkNameFomat) {
														name3 = dir3.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
														dir4 = dir3.split('.md')[0];
													} else {
														name3 = dir4;
													}

													console.info("Glenn -- The fourth level, name3:" + name3);

			                                        markdown += '		- [' + name3 + '](?file=' +
			                                            dir1 + '/' + dir2 + '/' + dir3 + '/' + dir4 +' "' + name3 + '")\n';
			                                    }
			                                }
										}
									}
									else { // 第三层 文件
										if (data[dir1][dir2].hasOwnProperty(dir3) && checkId(dir3, dir1 + '/' + dir2 + '/')) {
		                                    if (checkFileName(dir3, dir1 + '/' + dir2 + '/')) {
												var name2 = '';
												if (this.checkNameFomat) {
													name2 = dir3.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
													dir3 = dir3.split('.md')[0];
												} else {
													name2 = dir3;
												}

												console.info("Glenn -- The third level, name2:" + name2);

		                                        markdown += '    - [' + name2 + '](?file=' +
		                                            dir1 + '/' + dir2 + '/' + dir3 + ' "' + name2 + '")\n';
		                                    }
		                                }
									}
	                            }
	                        }
	                        //当为文件时
	                        else {   // 第二层 文件
	                            if (checkFileName(dir2, dir1 + '/')) {
									var name = '';
									if (this.checkNameFomat) {
										name = dir2.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
										dir2 = dir2.split('.md')[0];
									} else {
										name = dir2;
									}
	                                markdown += '- [' + name + '](?file=' +
	                                    dir1 + '/' + dir2 + ' "' + name + '")\n';
	                            }
	                        }
	                    }
	                }
	            }
				else {  // 第一层 文件
					if (checkFileName(dir1, '/') && dir1.indexOf("HomePage.md") != -1 && dir1.indexOf("$navigation.md") != -1) {
						var name = '';
						if (this.checkNameFomat) {
							name = dir1.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
							dir1 = dir1.split('.md')[0];
						} else {
							name = dir1;
						}
						markdown += '- [' + name + '](?file=' +
							'/' + dir1 + ' "' + name + '")\n';
					}
				}
			}
        }
        if (!hsErrId) {
            fs.writeFileSync(path + '$navigation.md', markdown, 'utf-8');
        }
    },
    //检查重复id
    hasDuplicateId: function (data) {
        //单层检查
        var check = function (obj, path) {
            var hash = {};
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
					if (this.checkNameFomat) {
						if (!hash[name.split('-')[0]]) {
	                        hash[name.split('-')[0]] = name;
	                    } else {
	                        alert('Duplicate File ID!\n同级目录下存在重复ID：' + name.split('-')[0] + '。\n' +
	                            '    at path "library/' + path + '"\n' +
	                            '    at file "' + hash[name.split('-')[0]] + '"\n' +
	                            '    at file "' + name + '"');
	                        return false;
	                    }
					} else {  //  不需要 id 也行，但是目录下的所有内容都不应该按照规则来，主要是用来添加现有文档用
						if (!hash[name]) {
	                        hash[name] = name;
	                    } else {
	                        alert('Duplicate File ID!\n同级目录下存在重复ID：' + name + '。\n' +
	                            '    at path "library/' + path + '"\n' +
	                            '    at file "' + hash[name] + '"\n' +
	                            '    at file "' + name + '"');
	                        return false;
	                    }
					}
                }
            }
            return true;
        };
        //是否存在重复id
        var duplicate = 'none';
        //第一层，library直接子级
        if (check(data, '')) {
            for (var p1 in data) {
                if (data.hasOwnProperty(p1) && data[p1]) {
                    //第二层，可能是文件夹也可能是文件
                    if (check(data[p1], p1 + '/')) {
                        for (var p2 in data[p1]) {
                            if (data[p1].hasOwnProperty(p2) && data[p1][p2]) {
                                //第三层，只有文件
                                if (!check(data[p1][p2], p1 + '/' + p2 + '/')) {
                                    duplicate = 'yes';
                                    break;
                                }
                            }
                        }
                    } else {
                        duplicate = 'yes';
                        break;
                    }
                }
            }
        } else {
            duplicate = 'yes';
        }
        return duplicate == 'yes';
    }
};
