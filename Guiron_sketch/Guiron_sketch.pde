ArrayList<Guiron> G_set = new ArrayList<Guiron>();

void setup(){
  size(1000,1000);
  G_set.add(new Guiron(1,0,300,200,true));
  //G_set.add(new Guiron(1,0,100,400,false));
  //println(G_set.size());
}

void draw(){
  clear();
  for(int i=0; i<G_set.size(); i++){
    G_set.get(i).update();
    G_set.get(i).render();
  }
}

class Guiron{
 int xVel;
 int yVel;
 int xPos;
 int yPos;
 PImage img; //note that this changes with the state
 PImage right = loadImage("../assets/rightArrow.png");
 PImage left = loadImage("../assets/leftArrow.png");
 boolean dir_state; //direction state, can either be left (true) or right (false)
 
 Guiron(int _xVel, int _yVel, int _xPos, int _yPos, boolean _dir_state){
   this.xVel = _xVel;
   this.yVel = _yVel;
   this.xPos = _xPos;
   this.yPos = _yPos;
   dir_state = _dir_state;
   
   if(dir_state == true){ //if 'true' load the left facing image
     img = left;//loadImage("../assets/rightArrow.png");
     xVel *= -1;
   }else if(dir_state == false){
     img = right; //loadImage("../assets/leftArrow.png");    
   }
   
 }
 
 void render(){
   image(img, xPos, yPos);
 }
 
 void update(){
   println("Current state:", dir_state);
   xPos += xVel;
   yPos += yVel;
   
   if(xPos >= 500 || xPos <= 0){
    xVel*=-1; //switch directions
      if(dir_state == true){ //change left to right and vice versa        
       dir_state = false;
       img = right;       
      }else if(dir_state == false){       
       dir_state = true; 
       img = left; 
      }
      println("new state: ", dir_state);
   }
   
 }
 
}
