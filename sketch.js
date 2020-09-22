let Guiron_;
let head_set = [];
let right;
let left;
let Gyaos_head;
let Gyaos_head_width;
let width; let height;
let leftSpireWidth; let rightSpireWidth;
let leftSpireHeight; let rightSpireHeight;
let leftWidth; let rightWidth;
let foreground;
let CELL_SIZE = 300; 
let buffer = 10; //10 pixel buffer
let head_handler_ = new head_handler();
let floor;
let spatialHash = [];
let keySet = [];

function preload(){
  right = loadImage('./assets/GuironRight.png');
  left =  loadImage('./assets/GuironLeft.png');
  leftSpire = loadImage('./assets/Left_Spire_Small.png');
  rightSpire = loadImage('./assets/Right_Spire_Small.png');
  foreground = loadImage('./assets/VenusCropped.png');
  Gyaos_head = loadImage('./assets/Gyaos.png');

  leftSpireWidth = leftSpire.width;
  rightSpireWidth = rightSpire.width;
  leftSpireHeight = leftSpire.height;
  rightSpireHeight = rightSpire.height;
  leftWidth = left.width;
  rightWidth = right.width; 
  Gyaos_head_width = Gyaos_head.width;
}

function setup(){
  var cnv = createCanvas(windowWidth, windowHeight); //this line of code creates a canvas equal to the size of the window
  cnv.style('display', 'block');
  width = cnv.width;
  height = cnv.height;  
  head_handler_.createHeads(20);
  floor = 1200;
  //console.log("floor: ", floor);

  leftSpire.resize(width/5,height*.95);
  rightSpire.resize(width/5,height*.95);
  foreground.resize(width,height);

  Guiron_ = new Guiron(5,0,width-(width/10)-left.width,400,true, left)
}

function draw(){
  clear();
  // background(0, 0, 0);  
  noFill();
  // image(foreground,0,300)

  Guiron_.update();
  image(Guiron_.img, Guiron_.xPos, Guiron_.yPos);

  //image(leftSpire,-100,300);
  //image(rightSpire,(width-(width/5)),300);

  for(let i = 0; i < head_handler_.head_list.length; i++){
    image(head_handler_.head_list[i].img , head_handler_.head_list[i].location[0], head_handler_.head_list[i].location[1]);
    //rect(head_handler_.head_list[i].location[0] , head_handler_.head_list[i].location[1], 10, 10);
    head_handler_.head_list[i].update();
  }

  head_handler_.update();
  //draw a grid to get a visual on what out hash function will translate to on screen
  for(let i=0; i< Math.round(windowWidth/CELL_SIZE); i++){
    for (let j=0; j< Math.round(windowHeight/CELL_SIZE); j++){
      rect(i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      noFill();
    }
  }
}

function Guiron(_xVel,_yVel,_xPos,_yPos,_dir_state, _img){
   this.img = _img;
   this.xVel = _xVel;
   this.yVel = _yVel;
   this.xPos = _xPos;
   this.yPos = _yPos;
   this.dir_state = _dir_state;
   
   if(this.dir_state == true){ //if 'true' load the left facing image
     this.img = left;//loadImage("../assets/rightArrow.png");
     this.xVel *= -1;
   }else if(this.dir_state == false){
     this.img = right; //loadImage("../assets/leftArrow.png");    
   }
   
   this.update = function(){     
     this.xPos += this.xVel;
     //this.yPos = this.yPos+(sin(this.xPos));
     //this.yPos = this.yPos;
     
     if(this.xPos >= (width-width/10)-this.img.width || this.xPos <= (width/10)+leftSpire.width){ //switch direction
      this.xVel*=-1; //switch directions
        if(this.dir_state == true){ //change left to right...         
           this.dir_state = false;
           this.img = right;       
        }else if(this.dir_state == false){ //... and right to left      
           this.dir_state = true; 
           this.img = left; 
        }      
     }     
   }
 }

/**
* Function used to represent a 'head' object 
*/
function Gyaos(_xPos, _yPos, _id){
  this.topspeed = 5;
  this.img = Gyaos_head;
  this.w = this.img.width;
  this.h = this.img.height;
  this.xLimit = this.w + buffer;
  this.yLimit = this.h + buffer;
  this.ID = _id;  
  this.location = [_xPos,_yPos];
  this.velocity = [5,5];

  this.curr_cell = [];
  this.prev_cell = [Math.round(this.location[0] / CELL_SIZE) * CELL_SIZE, Math.round(this.location[1] / CELL_SIZE) * CELL_SIZE]; //initialize "previous cell"

  this.update = function(){      
    this.location = [this.location[0]+this.velocity[0] , this.location[1]+this.velocity[1] ];
    ellipse(this.location[0],this.location[1],5,5);
    rect(this.location[0],this.location[1],this.xLimit,this.yLimit);

    X_ = Math.round(this.location[0] / CELL_SIZE) * CELL_SIZE;
    Y_ = Math.round(this.location[1] / CELL_SIZE) * CELL_SIZE;
    this.curr_cell = [X_,Y_];
    //update the "current cell"
    if(this.prev_cell[0]*this.prev_cell[1] != this.curr_cell[0]*this.curr_cell[1]){ //AKA, if the previous cell is different from the new cell, update it      
      spatialHash.remove(this);
      this.prev_cell[0] = this.curr_cell[0];
      this.prev_cell[1] = this.curr_cell[1];
      spatialHash.add(this);
    }

    //Case where the object hits the ground 
    if(this.location[1] >= windowHeight || this.location[1] <= 0 ){
      this.velocity[0] *= 1;
      this.velocity[1] *= -1;      
    } //case where the object hits either the left or the right sides
    else if(this.location[0] <= 0 || this.location[0] >= windowWidth){
      this.velocity[0] *= -1;
      this.velocity[1] *= 1;
    } 
  }
 }

/**

*/
function head_handler(){
  this.head_list = [];
  this.available_spaces = [];
  this.random_i;

  this.createHeads = function(x){
    let counter = 0;
    for(let i=0; i<windowWidth/CELL_SIZE; i++){
      for(let j=0; j<windowHeight/CELL_SIZE; j++){        
        this.available_spaces[counter] = [i*CELL_SIZE, j*CELL_SIZE];        
        counter++;
      }
    }

    for(let i=0; i < x; i++){
      this.random_i = Math.floor(Math.random()*this.available_spaces.length); //randomly selected index      
      this.head_list[i] = new Gyaos(this.available_spaces[this.random_i][0], this.available_spaces[this.random_i][1], i);
      spatialHash.add(this.head_list[i]);
      this.available_spaces.splice(this.random_i,1); //remove the randomly selected element
    }
  }

  this.update = function(){
    for(let i=0; i<keySet.length; i++){
      if(spatialHash[keySet[i]].length > 1){
        this.checkCollission(spatialHash[keySet[i]]); //pass in the hash list
      }
    }
  }  

  /*
    hashList - an entry list located within the spatialHash
    The way I'm writing this may cause performance issues. We shall see
  */
  this.checkCollission = function(hashList){
    for(let j=0; j < hashList.length; j++){  
      for(let k=0; k < hashList.length; k++){
        if(j != k){
          if(this.checkOverlap(hashList[j],hashList[k])){            
            hashList[j].velocity[1] *= -1;
            hashList[j].velocity[0] *= -1;
            hashList[j].location[1] + (-1)*buffer;
            hashList[j].location[0] + (-1)*buffer;
          }
        }

      } 

    }
  }

  this.checkOverlap = function(a, b){
    //console.log(a.ID,b.ID);
    if(a.ID != b.ID){
      if(a.xLimit >= b.x && a.yLimit >= b.y) return true; 
      else if(a.x <= b.xLimit && a.y <= b.yLimit) return true;
      else return false;

    }
    else{
      return false; 
    }
  }

} //End of HeadHandler function

spatialHash.add = function(obj){
    var X = Math.round(obj.location[0] / CELL_SIZE) * CELL_SIZE;
    var Y = Math.round(obj.location[1] / CELL_SIZE) * CELL_SIZE;
    var key = X + "," + Y;
    if(spatialHash[key] == undefined){
      spatialHash[key] = [];
      keySet.push(key);        
    } 
    spatialHash[key].push(obj); 
  }

  //Given the object, remove it from the list
spatialHash.remove = function(obj){
  let key = obj.prev_cell[0] + "," + obj.prev_cell[1];
    if(spatialHash[key].length > 1){ //if there's more than one head located at that cell... 
      for(let i=0; i<spatialHash[key].length; i++){
        if(spatialHash[key][i].ID == obj.ID){ 
            spatialHash[key].splice(i,1);            
          } //if there's an object with that very ID, delete it       
      }
    }
    else if(spatialHash[key][0].ID = obj.ID){
      spatialHash[key].pop();
    }
  }