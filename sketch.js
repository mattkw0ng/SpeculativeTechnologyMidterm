/*******************************************************************************************************************
      Moody
    by Scott Kildall
 
  Color Palette Values:

  Black: #031927
  Turquoise: #3ED8D2
  Canary: #FFF689
  Sizzling Red: #F2545B
  Pale Purple: #E9D6EC

    Uses the p5.ComplexStateMachine library. Check the README.md + source code documentation
    The index.html needs to include the line:  <script src="p5.complexStateManager.js"></script>
*********************************************************************************************************************/

var complexStateMachine;           // the ComplexStateMachine class
var clickablesManager;             // our clickables manager
var clickables;                    // an array of clickable objects

var currentStateName = "";
var moodImage;

var bkColor = '#031927';
var textColor = '#E9D6EC';

var buttonFont;

var playerNames = [];
var playerDescriptions = [];
var playerIndex = 0;

function preload() {
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  complexStateMachine = new ComplexStateMachine("data/interactionTable.csv", "data/clickableLayout.csv");

  buttonFont = loadFont("AtariClassic-ExtraSmooth.ttf");
}

// Setup code goes here
function setup() {
  createCanvas(1440, 800);
  imageMode(CENTER);

  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();

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
  drawImage();
  drawOther();
  drawUI();
}

function setupClickables() {
  // All clickables to have same effects
  for( let i = 0; i < clickables.length; i++ ) {
    clickables[i].onHover = clickableButtonHover;
    clickables[i].onOutside = clickableButtonOnOutside;
    clickables[i].onPress = clickableButtonPressed;
    clickables[i].strokeWeight = 0;
    clickables[i].textSize = 24;
    clickables[i].width = 250;
  }
}

// tint when mouse is over
clickableButtonHover = function () {
  if (this.id == 0) {
    this.textColor = "#007BFF"
  }
}

// color a light gray if off
clickableButtonOnOutside = function () {
  // backto our gray color
  this.noFill = true;
  if (currentStateName === "Splash") {
    this.textColor = "#707070";
  } else {
    this.textColor = "#EAEAEA";
  }
  
}

clickableButtonPressed = function() {
  complexStateMachine.clickablePressed(this.name);
}

// this is a callback, which we use to set our display image
function setImage(imageFilename) {
  moodImage = loadImage(imageFilename);
} 

// this is a callback, which we can use for different effects
function stateChanged(newStateName) {
    currentStateName = newStateName;
    console.log(currentStateName);
} 


//==== KEYPRESSED ====/
function mousePressed() {
  // if( currentStateName === "Splash" ) {
  //   complexStateMachine.newState("Instructions");
  // }
}

//==== MODIFY THIS CODE FOR UI =====/

function drawBackground() {
  background(color(bkColor));
}

function drawImage() {
  if( moodImage !== undefined ) {
    image(moodImage, width/2, height/2);
  }  
}

function drawOther() {
  push();

   // Draw mood — if not on Splash or Instructions screen  
  if( currentStateName == "Splash") {
    drawSplash();  
  } else if (currentStateName == "Description") {
    drawDescription();
  } else if (currentStateName == "MeetThePlayers") {
    drawPlayers();
  } 

  pop();
}

function drawSplash() {
  console.log("drawSplash()");
}

function drawDescription() {
  console.log("drawDescription()");
  writeTextInBox("Rescue Aid Drones:\nDrones designed to help in the recovery of people from any dangerous situations that require immediate evacuation/rescue. The purpose of these drones is not to rescue the person itself, but rather to assist a rescue operation so that it can go as smoothly as possible.")
}

function addPlayers() {
  // write player data to arrs
  playerNames = ["RADtech CEO", "Mayor of LA", "Martha (Retired Schoolteacher)", "Fire Chief", "Mike (Construction Worker)"];
  playerDescriptions.push("This is the brilliant young woman who designed and manufactures these Rescue Aid Drones (hence the name RADtech). She wants to help people with her invention, but she is mainly focused on making money to fund her many other business ventures.");
}

function drawPlayers() {
  console.log("meet the players");
  let stringBuf = playerNames[playerIndex] + ":\n" + playerDescriptions[playerIndex];
  writeTextInBox(stringBuf);
}

function drawChoice() {
  console.log("drawChoice()");
}

function drawExit() {
  console.log("drawExit()");
}

//-- right now, it is just the clickables
function drawUI() {
  clickablesManager.draw();
}

function writeTextInBox(stringBuf) {
  push();
  fill("#EAEAEA");
  textSize(32);
  textFont("Helvetica");
  text(stringBuf, 430, 300, 800, 400);
  pop();
}