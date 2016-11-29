/**
 * @desc amWiki 工作端·文件夹管理模块
 * @author Tevin
 */

var fs = require('fs');

module.exports = {
    //读取文库文件夹
    readLibraryDir: function (path, callback) {
        if (!/library(\\|\/)$/.test(path)) {
            callback('The path is not a library.');
            return;
        }
        var tree = {};
        var folders = [];
        var files = [];
        try {
            var files1 = fs.readdirSync(path),
                files2, files3, files4,
                path2, path3, path4, path5;
            folders.push(path);
            //第一层，files1，library直接子级，仅允许为文件夹
            for (var i = 0; i < files1.length; i++) {
                path2 = path + files1[i];
                if (/^\./.test(files1[i])) {
                    continue;
                }
                if (fs.statSync(path2).isDirectory(path2)) {
                    try {
                        files2 = fs.readdirSync(path2);
                        folders.push(path2);
                        tree[files1[i]] = {};
                        //第二层，files2，允许为文件夹和文件
                        for (var j = 0; j < files2.length; j++) {
                            path3 = path2 + '/' + files2[j];
                            if (/^\./.test(files2[j])) {
                                continue;
                            }
                            if (fs.statSync(path3).isDirectory(path3)) {
                                try {
                                    files3 = fs.readdirSync(path3);
                                    folders.push(path3);
                                    tree[files1[i]][files2[j]] = {};
                                    //第三层，files3，允许为文件夹和文件
                                    for (var k = 0; k < files3.length; k++) {
                                        path4 = path3 + '/' + files3[k];
                                        if (/^\./.test(files3[k])) {
                                            continue;
                                        }
										if (fs.statSync(path4).isDirectory(path4)) {
			                                try {
			                                    files4 = fs.readdirSync(path4);
			                                    folders.push(path4);
			                                    tree[files1[i]][files2[j]][files3[k]] = {};
			                                    //第四层，files4，只允许为文件
			                                    for (var l = 0; l < files4.length; l++) {
			                                        path5 = path4 + '/' + files4[l];
			                                        if (/^\./.test(files4[l])) {
			                                            continue;
			                                        }
			                                        if (!fs.statSync(path5).isDirectory(path5)) {
														console.info("Glenn -- 4");
			                                            tree[files1[i]][files2[j]][files3[k]][files4[l]] = false;
			                                            files.push(path5);
			                                        }
			                                    }
			                                } catch (err) {
												console.info("Glenn -- 3");
			                                    callback(err);
			                                    return;
			                                }
			                            } else {
											tree[files1[i]][files2[j]][files3[k]] = false;
                                            files.push(path4);
			                            }
                                    }
                                } catch (err) {
									console.info("Glenn -- 2");
                                    callback(err);
                                    return;
                                }
                            } else {
                                tree[files1[i]][files2[j]] = false;
                                files.push(path3);
                            }
                        }
                    } catch (err) {
						console.info("Glenn -- 1");
                        callback(err);
                        return;
                    }
                }
            }
        } catch (err) {
            callback(err);
            return;
        }
        callback(null, tree, files, folders);
    },
    //循环检查每个库
    eachLibrary: function (list, stepCallback) {
        var list2 = [];
        var path = '';
        var atomProjects = atom.project.getPaths();
        for (var i = 0; i < list.length; i++) {
            //路径缺乏library字段弃用
            if (list[i].indexOf('library') < 0) {
                continue;
            }
            path = list[i].replace(/\\/g, '/').split('library')[0] + 'library/';
            //路径不存在弃用
            if (!fs.existsSync(path)) {
                continue;
            }
            //路径重复弃用
            var pathRepeat = false;
            for (var j = 0; j < list2.length; j++) {
                if (list2[j] == list[i]) {
                    pathRepeat = true;
                    break;
                }
            }
            if (pathRepeat) {
                continue;
            }
            //如果atom已经移除此项目，弃用
            /*var pathUseful = false;
            for (var k = 0; k < atomProjects.length; k++) {
                if (atomProjects[k].replace(/\\/g, '/') + '/library/' == path) {
                    pathUseful = true;
                    break;
                }
            }
            if (!pathUseful) {
                continue;
            }*/
            //有用路径
            list2.push(path);
            stepCallback && stepCallback(list[i]);
        }
        return list2;
    },
    //判断一个文件夹是否为amWiki文库项目
    isAmWiki: function (path) {
        path = path.indexOf('library') < 0 ? path : path.split('library')[0];
        var states = [
            fs.existsSync(path + '/library/'),
            fs.existsSync(path + '/amWiki/'),
            fs.existsSync(path + '/config.json'),
            fs.existsSync(path + '/index.html')
        ];
        return states[0] && states[1] && states[2] && states[3];
    }
};
