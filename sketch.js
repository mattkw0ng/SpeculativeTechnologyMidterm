/*******************************************************************************************************************
    Speculative Technology
    by Matt Kwong

    Uses the p5.ComplexStateMachine library. Check the README.md + source code documentation
    The index.html needs to include the line:  <script src="p5.complexStateManager.js"></script>
*********************************************************************************************************************/

var complexStateMachine;           // the ComplexStateMachine class
var clickablesManager;             // our clickables manager
var clickablesManagerEx;           // second manager for non state buttons
var clickables;                    // an array of clickable objects
var clickablesEx;

var scoreManager;

var currentStateName = "";
var stateImage;

var bkColor = '#05003D';
var textColor = '#E9D6EC';

var titleFont;
var bodyFont;

var playerNames = [];
var playerDescriptions = [];
var playerIndex = 0;
var choiceIndex = 3;

// PNG filenames
var unselectedPNGs = ["assets/player_icons/ceo_unselected.png", "assets/player_icons/mayor_unselected.png", "assets/player_icons/martha_unselected.png", "assets/player_icons/chief_unselected.png", "assets/player_icons/mike_unselected.png"];
var selectedPNGs = ["assets/player_icons/ceo_selected.png", "assets/player_icons/mayor_selected.png", "assets/player_icons/martha_selected.png", "assets/player_icons/chief_selected.png", "assets/player_icons/mike_selected.png"];
var defaultPNGs = ["assets/player_icons/ceo.png", "assets/player_icons/mayor.png", "assets/player_icons/martha.png", "assets/player_icons/chief.png", "assets/player_icons/mike.png"];
// load pngs here
var loadedPNGs = [];

// state variables
var exHoverEnable = false;
var exDefaultState = false;
var animateSpeed = 1;
var droneAnimateSpeed = 0.5;
var droneY = 0;
var droneUp = true;
var droneUpAway = false;


// ======================== SETUP ======================== //

function preload() {
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  clickablesManagerEx = new ClickableManager('data/clickableLayoutExtra.csv');
  complexStateMachine = new ComplexStateMachine("data/interactionTable.csv", "data/clickableLayout.csv");
  scoreManager = new ScoreManager();

  for ( let i = 0 ; i < selectedPNGs.length ; i ++) {
    loadedPNGs.push(loadImage(unselectedPNGs[i]));
    loadedPNGs.push(loadImage(selectedPNGs[i]));
    loadedPNGs.push(loadImage(defaultPNGs[i]));
  }

  loadedPNGs.push(loadImage("assets/drone_gray.png"));

  titleFont = loadFont("assets/fonts/ocrastd.otf");
  bodyFont = loadFont("assets/fonts/courier-std-med.otf");
}

// Setup code goes here
function setup() {
  createCanvas(1440, 800);
  imageMode(CENTER);
  frameRate(60);
  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();
  clickablesEx = clickablesManagerEx.setup();

  // setup the state machine with callbacks
  complexStateMachine.setup(clickablesManager, setImage, stateChanged);

  // call OUR function to setup additional information about the p5.clickables
  // that are not in the array 
  setupClickables(); 
  addPlayers();
 }


// Draw code goes here
function draw() {
  drawBackground();
  drawImage(stateImage);
  drawOther();
  drawUI();
}

// ======================== DRAWING CODE ======================== //

function drawBackground() {
  background(color(bkColor));
}

function drawImage(img) {
  if( img !== undefined ) {
    image(img, width/2, height/2, width, height);
  }  
}

function drawOther() {
   // Draw mood — if not on Splash or Instructions screen  
  if( currentStateName == "Splash") {
    drawSplash();  
  } else if (currentStateName === "Description") {
    drawDescription();
  } else if (currentStateName === "MeetThePlayers") {
    drawPlayers();
  } else if (currentStateName === "Instructions") {
    drawInstructions();
  } else if (currentStateName.startsWith("Stage")) {
    drawStage();
  } else if (currentStateName.startsWith("ending")) {
    drawEnd();
  } else {
    drawGameOver();
  }
}

// ------------ DRAW STATES --------------

function drawSplash() {
  // animate drone up and down
  let img = loadedPNGs[loadedPNGs.length-1];
  if (droneY > 20) {
    droneUp = false;
  } else if (droneY < 0) {
    droneUp = true;
  }

  if (droneUp || droneUpAway) {
    droneY += droneAnimateSpeed;
  } else {
    droneY -= droneAnimateSpeed;
  }

  image(img, width/2, (height/2) - droneY, img.width/4, img.height/4);
}

function drawDescription() {
  writeTextInBox("Rescue Aid Drones:", "Drones designed to help in the recovery of people from any dangerous situations that require immediate evacuation/rescue. The purpose of these drones is not to rescue the person itself, but rather to assist a rescue operation so that it can go as smoothly as possible.")
}

function addPlayers() {
  // write player data to arrays
  playerNames = ["RADtech CEO", "Mayor of LA", "Martha", "Fire Chief", "Mike"];
  playerDescriptions.push("This is the brilliant young woman who designed and manufactures these Rescue Aid Drones (hence the name RADtech). While her invention is meant to help people, she herself is more concerned about earning a profit.");
  playerDescriptions.push("The mayor is a people pleaser, always concerned with his public image. He loves new technology and is always trying to find ways to integrate it into society. Recently, he authorized a program to convert all of the city's buses to be self driving vehicles.");
  playerDescriptions.push("As a retired school teacher, Martha keeps busy as she advocates for better accessibility for the elderly and disabled in her community. She herself is restricted to a wheelchair, but does not let that stop her from her campaigns.");
  playerDescriptions.push("The Fire Chief is an old fashioned man who does not like change. He does not believe that this new drone technology is necessary, and he thinks that it will create more problems than it solves.");
  playerDescriptions.push("Mike lives a modest life as a construction worker. Many people find him to be loud and hot-headed, not afraid to speak his mind. Due to the nature of his job, as well as his general lack of awareness, he tends to find himself in dangerous situations.");
}

function drawPlayers() {
  exHoverEnable = true;

  let titleBuf = playerNames[playerIndex] + ":";
  let stringBuf = playerDescriptions[playerIndex];
  writeTextInBox(titleBuf, stringBuf);

}

function drawInstructions() {
  exHoverEnable = false;
  exDefaultState = true;
  scoreManager.drawScore(930, 185);

}

function drawStage() {
  console.log("Stage");
  // get choices from state
  let choices = complexStateMachine.getState(currentStateName).texts;
  writeChoices(choices[0], choices[1]);

  complexStateMachine.scoreManager.drawScore(618,116);
}

function drawEnd() {
  console.log("End");
  complexStateMachine.scoreManager.drawScore(618,116);
  
  // Print the total score ( satisfaction - stress )
  push();
  fill("#007bff");
  textFont(titleFont);
  textSize(30);
  let score = complexStateMachine.getTotalScore() + "/55";
  text(score, 665, 428, 150, 30);
  pop();
}

function drawGameOver() {
  console.log("Game Over");
  complexStateMachine.scoreManager.drawScore(618,116);
}

//-- right now, it is just the clickables
function drawUI() {
  clickablesManager.draw();
  if( currentStateName !== "Splash") {
    clickablesManagerEx.draw();
  }
}

// ======================== Clickables ======================== //

function setupClickables() {
  // All clickables to have same effects
  for( let i = 0; i < 3; i++ ) {
    clickables[i].onHover = clickableButtonHover;
    clickables[i].onOutside = clickableButtonOnOutside;
    clickables[i].onPress = clickableButtonPressed;
    clickables[i].strokeWeight = 0;
    clickables[i].textSize = 24;
    clickables[i].width = 250;
    clickables[i].textFont = bodyFont;
    clickables[i].noFill = true;
  }
  for( let i = 3 ; i < 5 ; i++) {
    clickables[i].onHover = choiceHover;
    clickables[i].onOutside = choiceOnOutside;
    clickables[i].onPress = clickableButtonPressed;
    clickables[i].color = "#82809E";
    clickables[i].width = 42;
    clickables[i].height = 42;
  }

  for( let i = 0; i < clickablesEx.length; i++ ) {
    clickablesEx[i].onHover = exButtonHover;
    clickablesEx[i].onOutside = exButtonOnOutside;
    clickablesEx[i].onPress = exButtonPressed;
    clickablesEx[i].strokeWeight = 0;
    clickablesEx[i].weird = true;
    clickablesEx[i].width = 250;
    clickablesEx[i].textFont = bodyFont;
    clickablesEx[i].noFill = true;
  }
}

// tint when mouse is over
clickableButtonHover = function () {
  // if (this.id === 0) {
  //   this.textColor = "#007BFF"
  // }

  if (this.y > 697) {
    this.y -= animateSpeed;
  }
}

// Continue button handlers

clickableButtonOnOutside = function () {
  // backto our gray color
  if (currentStateName === "Splash") {
    this.textColor = "#707070";
  } else {
    this.textColor = "#EAEAEA";
  }
  if (this.y < 700) {
    this.y += animateSpeed;
  }
  
}

clickableButtonPressed = function() {
  if(currentStateName == "Splash") {
    droneAnimateSpeed *= 20;
    droneUpAway = true;
    setTimeout(() => {
      droneAnimateSpeed /= 20;
      droneUpAway = false;
      droneY = 0;
      complexStateMachine.clickablePressed(this.name);
    }, 800);
  } else {
    complexStateMachine.clickablePressed(this.name);
  }
}

// Choice button handlers

choiceHover = function() {
  choiceIndex = this.id;
  this.color = "#FFFFFF";
}

choiceOnOutside = function() {
  if ( this.id == choiceIndex) {
    this.color = "#FFFFFF";
  } else {
    this.color = "#82809E";
  }
}

// Extra button handlers (for player icons)

exButtonOnOutside = function () {
  let exId = this.id * 3;
  if( exDefaultState ) {
    this.setImage(loadedPNGs[exId + 2]);
  } else if ( playerIndex === this.id && exHoverEnable) {
    // slightly redundant, but highlights the first choice before any hover
    this.setImage(loadedPNGs[exId + 1]);
  } else {
    this.setImage(loadedPNGs[exId])
  }
}

exButtonHover = function() {
  if( exHoverEnable ) {
    playerIndex = this.id;
    let exId = this.id * 3;
    this.setImage(loadedPNGs[exId + 1]);
  }
}

exButtonPressed = function () {
  console.log(this.name + ": " + this.width);
  console.log(clickablesEx);
}

// ----------- extras ------------

// this is a callback, which we use to set our display image
function setImage(imageFilename) {
  stateImage = loadImage(imageFilename);
} 

// this is a callback, which we can use for different effects
function stateChanged(newStateName) {
    currentStateName = newStateName;
    console.log(currentStateName);
} 

// ======================== HELPER FUNCTIONS ======================== //

function writeTextInBox(titleBuf, stringBuf) {
  push();
  fill("#EAEAEA");
  textSize(36);
  textFont(titleFont);
  text(titleBuf, 280, 280, 1000, 50);
  textSize(34);
  textFont(bodyFont);
  text(stringBuf, 280, 340, 1000, 400);
  pop();
}

function writeInstructions() {
  push();
  fill("#EAEAEA");
  textSize(36);
  textFont(titleFont);
  text(titleBuf, 280, 280, 1000, 50);
  textSize(34);
  textFont(bodyFont);
  text(stringBuf, 280, 340, 1000, 400);
  pop();
}

function writeChoices(choice1, choice2) {
  let colors = ["#FFFFFF", "#82809E"];
  if( choiceIndex == 4 ) {
    colors = ["#82809E", "#FFFFFF"];
  }
  push();
  textFont(bodyFont);
  textSize(24);
  textAlign(RIGHT);
  fill(colors[0]);
  text(choice1,900, 590, 380, 25);
  fill(colors[1]);
  text(choice2,900, 650, 380, 25);
  pop();

}