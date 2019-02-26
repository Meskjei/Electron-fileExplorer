'use strict'
const osenv = require('osenv');
const fs    = require('fs');
const path  = require('path');
const async = require('async');

let shell;
if(process.versions.electron){
    shell = require('electron').shell;
} else {
    shell = window.require('nw.gui').Shell;
}

function getUserHomeFolder(){
    return osenv.home();
}

function getFilesInFolder(folderPath, cb){
    fs.readdir(folderPath, cb);
}

function inspectAndDescribeFile(filePath, cb){
    let file = {
        fileName: path.basename(filePath),
        path    : filePath,
        type    : ''
    }
    // console.log(file);
    fs.stat(filePath, (err, stat)=>{
        if(err){
            cb(err);
        } else {
            if(stat.isFile()){
                file.type = 'file';
                
            } else if(stat.isDirectory()){
                file.type = 'directory';
            } else {
                file.type = 'unknown';
            }
            cb(err, file);
        }
    });
}

function inspectAndDescribeFiles(folderPath, files, cb){
    async.map(files, (file, asyncCb)=>{
        // console.dir(asyncCb)\
        let resolveFilePath = path.resolve(folderPath, file);
        inspectAndDescribeFile(resolveFilePath, asyncCb);
    }, cb)
}

function openFile(filePath){
    shell.openItem(filePath);
}

module.exports = {
    getFilesInFolder,
    getUserHomeFolder,
    inspectAndDescribeFiles,
    openFile
};