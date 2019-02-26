'use strict'

const fileSystem    = require('./fileSystem.js');
const userInterface = require('./userInterface.js');
const search        = require('./search.js');
function main(){
    const folderPath = fileSystem.getUserHomeFolder();
    userInterface.setBtnHandler();
    userInterface.loadDirectory(folderPath);
    userInterface.bindSearchField((event)=>{
        const query = event.target.value;
        if(query === ''){
            userInterface.resetFileter();
        } else {
            search.find(query, userInterface.filterResults);
        }
    })
}

window.onload = main;
