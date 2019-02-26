'use strict'

const lunr = require('lunr');
let index, builder;
function resetIndex(){
    builder = new lunr.Builder();
    builder.ref('path');
    builder.field('fileName');
    builder.field('type');  
}

function addToIndex(file){
    builder.add(file);
    // index = builder.build();
    // console.log(index);
}

function find(query, cb){
    index = builder.build();
    if(!index){
        resetIndex();
    }
    const results = index.search(`fileName:${query}`);
    cb(results);
}

module.exports = {addToIndex, find, resetIndex};
