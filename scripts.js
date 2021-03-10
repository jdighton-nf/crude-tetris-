'use strict';
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// the width and height of the blocks 

function updateScore(){ //when called increase score by one
    document.querySelector('.score').firstElementChild.textContent++;   
}
function clearScore(){
    document.querySelector('.score').firstElementChild.textContent++; 
}
// returns a random piece { piece name x y }
function getPiece(){
    const pieces = [
        {
            piece: [
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 0]
            ],
            name: "Tee",
            x:0, 
            y:0, 
            color:'red'
            
        },
        {
            piece: [
                [1, 0, 0, 0],
                [1, 0, 0, 0],
                [1, 0, 0, 0],
                [1, 0, 0, 0] 
            ],
            name: 'Long', 
            x:0, 
            y:0,
            color:'green'
        },
        {
            piece:[
                [1, 0, 0],
                [1, 0, 0], 
                [1, 1, 0]
            ], 
            name: 'Right L', 
            x:0, 
            y:0, 
            color:'blue'
        },
        {
            piece:[
                [0, 1, 0],
                [0, 1, 0], 
                [1, 1, 0]
            ], 
            name: 'Left L', 
            x:0, 
            y:0,
            color:'purple'
        },
        {
            piece:[
                [1, 1], 
                [1, 1]
            ], 
            name: 'Block',
            x:0,
            y:0,
            color:'orange' 
        }, 
        {
            piece:[
                [1, 0, 0], 
                [1, 1, 0], 
                [0, 1, 0]
            ], 
            name: 'Zig', 
            x:0, 
            y:0,
            color:'yellow'
        }, 
        {
            piece:[
                [0, 1, 0], 
                [1, 1, 0], 
                [1, 0, 0]
            ], 
            name: 'Zag', 
            x:0, 
            y:0,
            color:'pink'
        }
    ]
    let rand; 
    do {
        rand = Math.floor(Math.random() * 10); 
    } while(rand > 6);
    return pieces[rand];
}
// takes a reference to a piece, changes the x and y 
function transformPiece(pieceObject, xPos, yPos){
     pieceObject.x = xPos; 
     pieceObject.y = yPos; 
     return pieceObject;
}
// this runs each time the frame update fires
function updateActivePiece(pieceObject){ 
    transformPiece(pieceObject, pieceObject.x, pieceObject.y + 20);
    drawPiece(pieceObject);
}
// returns an array of objects containing the x and y coords for each block of each piece
function getPieceCoords(pieceObject){
    let piece = pieceObject.piece;
    let coordMatrix = [];
    let position = {
        column: 0,
        row: 0
    }
    const BLOCKSIZE = 20;

    function read(position){ //recurse through the piece
        if(position.row == piece.length){
            return;
        }    
        // logic
            if(piece[position.row][position.column] == 1){
                coordMatrix.push({x: pieceObject.x + (position.column * BLOCKSIZE), y: pieceObject.y + (position.row * BLOCKSIZE)});
            }

        // end logic

        position.column++; 
        if(position.column == piece[position.row].length){
            position.column = 0; 
            position.row++; 
        }

        return read(position)
    }
    read(position); 
    return coordMatrix;
}
// smarter drawing
function drawPiece(pieceObject){
    const BLOCKSIZE = 20; 
    const coords = getPieceCoords(pieceObject);
    ctx.fillStyle = pieceObject.color; 
    coords.forEach(block => {
        ctx.fillRect(block.x, block.y, BLOCKSIZE, BLOCKSIZE);
    });
}
// is the currPiece at the bottom of the field? 
function atBottom(pieceObject){
    const coords = getPieceCoords(pieceObject);
    let flag = false; 
    coords.forEach(block => {
        if(block.y >= 780){
            flag = true; 
        }
    });
    return flag; 
}
// functions for managing the static field
function fieldJanitorFunctions(){
    const BLOCKSIZE = 20; 
    let fieldArr = []; 
    function calcFieldCoords(){
        let fieldCoods = []; 
        fieldArr.forEach(brick => {
            brick[1].forEach(block => {
                fieldCoods.push({x:block.x, y:block.y});
            });
        })
        return fieldCoods; 
    }
    function add(piece){ 
        fieldArr.push([piece, getPieceCoords(piece)]);
    }
    function draw(){
        fieldArr.forEach(block => {
            ctx.fillStyle = block[0].color; 
            block[1].forEach(atom => {
                ctx.fillRect(atom.x, atom.y, BLOCKSIZE, BLOCKSIZE);
            });
        });     
    }
    // detect when pieces land on each other or we crash them into each other from the side
    function detectInterferance(currPiece){
        const currCoords = getPieceCoords(currPiece);
        const fieldCoods = calcFieldCoords(); 
        let flag = false; 
        currCoords.forEach(block => {
            fieldCoods.forEach(staticBlock => {
                if((block.x == staticBlock.x) && (block.y + 20) == staticBlock.y){
                    flag = true; 
                }
            });
        });
        return flag; 
    }
    // I forget what this was for. 
    function checkRows(blocks){
        let rows = []; 
        for(let row = 780; row > 0; row -= 20){
            let rowSorted = blocks.filter(block => {
                return (block.y == row);
            });
            rows.push(rowSorted);
        }
        return rows; 
    }
    // checked for lines, removes them, and offsets all the other static blocks to fill the space
    function lines(){
        // find completed lines
        const completeLines = checkRows(calcFieldCoords()).filter(row => {
            return (row.length == 20);
        });

        let toRemove = []; 

        completeLines.forEach(row => row.forEach(block => toRemove.push(block)));
        // remove the completed lines from the fieldArr

        if(toRemove.length != 0){ // only run when needed
            toRemove.forEach(function(blockToRemove){
                fieldArr.forEach(function(fieldEntry){
                    fieldEntry[1].forEach(function(fieldBlock){
                        // delete blocks from fieldArr
                        if((fieldBlock.x == blockToRemove.x) && (fieldBlock.y == blockToRemove.y)){
                            fieldEntry[1].splice(fieldEntry[1].indexOf(fieldBlock), 1);

                        }
                            // check if anything needs to be offset and then do it
                            fieldArr.forEach(fieldEntryA => {
                                fieldEntryA[1].forEach(fieldBlockA => {
                                    if((fieldBlockA.x == fieldBlock.x) && (fieldBlockA.y < fieldBlock.y)){
                                        fieldBlockA.y += 20; 
                                    }    
                                });
                            });
                    });
                });
            });
            for(let i = 0; i < completeLines.length; i++){
                updateScore(); 
            }
        }
    }

    return {add, draw, detectInterferance, lines};
}
// rotate current piece
function rotate(matrix){
    function mirrorOverX(matrix){
        let output = [];
        for(let i = matrix.length - 1; i >= 0; i--){
             output.push(matrix[i]);
        }
        return output;
    }
    function transpose(matrix){
        return matrix[0].map(function(element, index){ 
                    return matrix.map(function(element){  
                        return element[index];
                    });
               });
    }
    return mirrorOverX(transpose(matrix)); 
}
// set up some basics and kick off the game
function start(){
    let currPiece = transformPiece(getPiece(), 180, 20);
    drawPiece(currPiece);
    const field = fieldJanitorFunctions();
    let lastTime; 
    let targetInterval = 250 // ms

    function game(timestamp){
        if(lastTime === undefined){
            lastTime = timestamp;
        }
        const interval = timestamp - lastTime; 
        if(interval >= targetInterval){
            // BEGIN CONTROL LOGIC
        
            const formerx = currPiece.x; 
            const formery = currPiece.y; 

            if(field.detectInterferance(currPiece)){
                currPiece.y = formery;
                currPiece.x = formerx;
                field.add(currPiece);
                currPiece = transformPiece(getPiece(), 180, 20); 
            }

            if(atBottom(currPiece)){
                field.add(currPiece);
                currPiece = transformPiece(getPiece(), 180, 20); 
            }

            field.lines(); 

            ctx.clearRect(0,0, 400, 800); // clear the entire canvas every time
            updateActivePiece(currPiece); // move down each frame
            field.draw(); // redraw field


            // END CONTROL LOGIC
            lastTime = timestamp; // update last frame timestamp
        }
        window.requestAnimationFrame(game);
    }
    // EVENT HANDLER SET UP
    // can't move the callback into it's own function because we wouldn't have access to the currPiece variable
    window.addEventListener('keydown', function(e){
            const formerx = currPiece.x; 
            const formery = currPiece.y;  
            
            if(e.key == 'ArrowLeft'){
                currPiece.x -= 20; 
            }
            if(e.key == 'ArrowRight'){
                currPiece.x += 20; 
            }
            if(e.key == 'ArrowDown'){
                currPiece.y += 20; 
            }
            if(currPiece.y >= 760){ 
                currPiece.y = formery;
            }
            if(field.detectInterferance(currPiece)){
                currPiece.y = formery;
                currPiece.x = formerx;
                //field.add(currPiece);
                //currPiece = transformPiece(getPiece(), 180, 20); 
            }
            
            currPiece = transformPiece(currPiece, currPiece.x, currPiece.y) 
            const coords = getPieceCoords(currPiece);
            coords.forEach(block => {
                if((!(block.x >= 0)) || (!(block.x <= 380))){
                    currPiece.x = formerx; 
                }
            });
            field.lines(); 
            ctx.clearRect(0,0, 400, 800); 
            field.draw(); 
            drawPiece(currPiece)
            /* 
                what did we learn? MAKE THE CHANGE, CHECK THE CHANGE, IF OK SET THE CHANGE, ELSE REVERSE THE CHANGE AND SET NOTHING
            */
    });

    // detect spacebar, rotate currPiece
    window.addEventListener('keydown', e => {
        if(e.keyCode == 32){
            currPiece.piece = rotate(currPiece.piece);  
            ctx.clearRect(0,0, 400, 800); 
            field.draw(); 
            drawPiece(currPiece)
        }
    });

    // disable scrolling
    window.addEventListener('scroll', function(){
        window.scrollTo(0,0);
    });

    window.requestAnimationFrame(game); // kick things off
}

start();