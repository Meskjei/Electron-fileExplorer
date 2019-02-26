'use strict'
const fs           = require('fs');
const search       = require('./search.js');
const EventEmitter = require('events');
const fileSystem   = require('./fileSystem.js');
let   pageStack    = [];                          //页面栈
pageStack.push(fileSystem.getUserHomeFolder()); //最底层默认为home
let pageIndex           = 0;                   //页面索引
let btnStateChangeEvent = new EventEmitter();
// 能否前进后退的标记
let btnState = {
    _canMoveBackward: false,
    _canMoveForward : false
};

Object.defineProperty(btnState, 'canMoveForward', {
    get: function(){
        return this._canMoveForward;
    },
    set: function(newValue){
        this._canMoveForward = newValue;
        btnStateChangeEvent.emit('btnStateChange');
    }
});

Object.defineProperty(btnState, 'canMoveBackward', {
    get: function(){
        return this._canMoveBackward;
    },
    set: function(newValue){
        this._canMoveBackward = newValue;
        btnStateChangeEvent.emit('btnStateChange');
    }
});

// 显示文件、文件夹
function displayFile(file){
    const mainArea = document.getElementById('main-area');
    const template = document.querySelector('#fileItem-template');
    let   clone    = document.importNode(template.content, true);
    search.addToIndex(file);
    if(file.type == 'file'){
        displayIcon(clone, file.fileName);
    } else {
        clone.querySelector('img').src = `images/${file.type}.png`;
    }
    clone.querySelector('.fileName').innerHTML = file.fileName;
    clone.querySelector('.fileItem').setAttribute('filepath', file.path);
    let fileItem = clone.querySelector('.fileItem');
    if(file.type == 'directory'){
        // 为文件夹添加双击监听
        fileItem.addEventListener('dblclick', (e)=>{
            // let folderPath = e.currentTarget.getAttribute('folderpath');
            pageStack.splice(pageIndex + 1, pageStack.length - pageIndex - 1);
            pageStack.push(file.path);
            pageIndex                = pageStack.length - 1;
            btnState.canMoveBackward = true;
            loadDirectory(file.path);
        }, true);
        // fileItem.setAttribute('folderpath', file.path);
    } else {
        fileItem.addEventListener('dblclick', ()=>{
            fileSystem.openFile(file.path);
        }, false);
    }
    
    mainArea.appendChild(clone);
}

function displayFiles(err, files){
    if(err){
        return alert('无法显示您的文件');
    }
    for(let file of files){
        displayFile(file);
    }
}

// 更新当前文件夹路径
function updateFolderPath(folderPath){
    document.getElementById('current-folder').innerText = folderPath;
}

// 清空main-area中内容
function clearView(){
    const mainArea   = document.getElementById('main-area');
    let   firstChild = mainArea.firstChild;
    // 循环选择第一个子元素来清空
    while(firstChild){
        mainArea.removeChild(firstChild);
        firstChild = mainArea.firstChild;
    }
}

// 加载文件夹
function loadDirectory(folderPath){
    search.resetIndex();
    updateFolderPath(folderPath);
    fileSystem.getFilesInFolder(folderPath, (err, files)=>{
        clearView();
        if(err){
            return alert('无法加载您的路径');
        }
        fileSystem.inspectAndDescribeFiles(folderPath, files, displayFiles);
    });
}
//  为导航键绑定监听
function setBtnHandler(){
    let navBtns = document.querySelectorAll('.navBtn');
    for(let i=0, length=navBtns.length; i<length; i++){
        navBtns[i].addEventListener('click', btnHandler);
    }
}
// 导航键监听
function btnHandler(e){
    let flag = e.currentTarget.getAttribute('id');
    switch(flag){
        case      'backward'          : 
        pageIndex = pageIndex == 0 ? 0: pageIndex - 1;
            loadDirectory(pageStack[pageIndex]);
            btnState.canMoveForward = true;
            if(pageIndex <= 0){
                btnState.canMoveBackward = false;
            }
            break;
        case 'forward': 
            loadDirectory(pageStack[++pageIndex]);
            btnState.canMoveBackward = true;
            if(pageIndex == pageStack.length - 1){
                btnState.canMoveForward = false;
            }
            break;
        default: 
            let homePath         = pageStack[0];
                pageIndex        = 0;
                pageStack.length = 0;
                pageStack.push(homePath);
                btnState.canMoveBackward = false, btnState.canMoveForward = false;
                // console.log(canMoveBackward);
                loadDirectory(homePath);
    }
}

// 为pageIndexChange设置监听
btnStateChangeEvent.on('btnStateChange', ()=>{
    if(btnState.canMoveBackward){
        document.getElementById('backward').removeAttribute('disabled');
    } else {
        document.getElementById('backward').setAttribute('disabled', 'disabled');
    }

    if(btnState.canMoveForward){
        document.getElementById('forward').removeAttribute('disabled');
    } else {
        document.getElementById('forward').setAttribute('disabled', 'disabled');
    }
});

function bindSearchField(cb){
    document.getElementById('search').addEventListener('keyup', cb, false);
}

function filterResults(results){
    const validFilePaths = results.map((result)=>{
        return result.ref;
    });
    const items = document.getElementsByClassName('fileItem');
    for(let i=0; i<items.length; i++){
        let item     = items[i];
        let filePath = item.getAttribute('filepath');
        if(validFilePaths.indexOf(filePath) !== -1){
            item.style = null;
        } else {
            item.style = 'display: none';
        }
    }
}

function resetFileter(){
    const items = document.getElementsByClassName('fileItem');
    for(let i=0; i<items.length; i++){
        items[i].style = null;
    }
}

function parsePostFix(fileName){
    let postFix = fileName.split('.');
    if(postFix.length > 0){
        return postFix[postFix.length - 1];
    } else {
        return '.file';
    }
}

function displayIcon(clone, fileName){
    let postFix = parsePostFix(fileName);
    if(postFix != undefined){
        let path = `${__dirname}/images/${postFix}.png`;
        // console.log(path);
        try{
            fs.accessSync(path);
            clone.querySelector('img').src = `images/${postFix}.png`;
        } catch(err){
            clone.querySelector('img').src = `images/file.png`;
        }
    }
}

module.exports = {displayFiles, loadDirectory, setBtnHandler, bindSearchField, resetFileter, filterResults};