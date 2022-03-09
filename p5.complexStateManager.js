/*******************************************************************************************************************

    ComplexStateMachine
    for P5.js

    Written by Scott Kildall

    Loads a CSV table in the constructor

    ComplexStateMachine variables:
        this.statesTable                =  CSV file table, loaded in preload(), used in setup(), then not used again
        this.currentState               =  index of the current state in the array, default to 1st state
        this.stateNames                 =  Array of state names
        this.states                     =  Array of State variables, matches entries and size of state names
        this.setImageFilenameCallback   =  Callback for image filename, when a new state is selected
        this.setTransitionsCallback     =  Callback for image filename, when a new state is selected
        

    State variables:
        this.stateName          = name of the state (for reference)
        this.imageFilename      = relative local path of filename
        this.transitions        = array of transitions (Strings)
        this.nextState          = next state we are going to
*********************************************************************************************************************/

class ComplexStateMachine {
    // Clickable layout table is an OPTIONAL parameter
    constructor(statesFilename, clickableLayoutFilename = null) {
        this.statesTable = loadTable(statesFilename, 'csv', 'header');
        this.currentState = 0;   
        this.stateNames = [];
        this.states = [];    
        this.stateNames = []; 
        this.setImageFilenameCallback = null;
        this.clickableArray = null;
        this.scoreManager = new ScoreManager();

        if( clickableLayoutFilename === null ) {
            this.clickableTable = null;
        }
        else {
            this.clickableTable = loadTable(clickableLayoutFilename, 'csv', 'header');
        }

        
        console.log(this.states);
    }

    // expects as .csv file with the format as outlined in the readme file
    // this will go through the states table and:
    // (1) add a new state for every unique state
    // (2) add a 
    setup(clickableManager, imageFilenameCallback, stateChangedCallback) {
        console.log(this.statesTable);

        this.setImageFilenameCallback = imageFilenameCallback;
        this.stateChangedCallback = stateChangedCallback;
        this.clickableArray = clickableManager.getClickableArray();

        // For each row, allocate a new state, if it is unique
        // and always add a transition
        for( let i = 0; i < this.statesTable.getRowCount(); i++ ) {
            let stateName = this.statesTable.getString(i, 'StateName');
            
            // find the state index in the statesArray
            let stateArrayIndex = this.stateNames.indexOf(stateName); 

            console.log("index: " + i + " = " + stateName );
            console.log("state index = " + stateArrayIndex);

            // if not present, we add it
            if( stateArrayIndex === -1 ) {
                this.stateNames.push(stateName);
                this.states.push(new State(stateName, this.statesTable.getString(i, 'PNGFilename')));
                stateArrayIndex = this.states.length - 1;
            } 

            // add other info
            let nextState = this.statesTable.getString(i, 'NextState');
            let clickableName = this.statesTable.getString(i, 'ClickableName');
            let satisfaction = eval(this.statesTable.getString(i, 'Satisfaction'));
            let stress =  eval(this.statesTable.getString(i, 'Stress'));
            let text = this.statesTable.getString(i, 'Text');

            this.states[stateArrayIndex].addInteraction(clickableName, nextState, satisfaction, stress, text);

        }
        
        // All DONE
        console.log("Setup done");
        console.log(this.states);
        console.log(this.clickableArray);
        
        this.performCallbacks();
        
        this.changeButtonsVisibility();

        return this.hasValidStates;
    }

    // EDITED: Handle clickable press
    clickablePressed(clickableName) {
        let cIndex = this.states[this.currentState].clickableNames.indexOf(clickableName); 
        console.log("cIndex: " + cIndex);
        if( cIndex !== -1 ) {
            let nextState = this.states[this.currentState].nextStates[cIndex];
            // ADDED : if this is a choice button, increase the score according to the stored data 
            if (this.stateNames[this.currentState].startsWith("Stage")) {
                let satisIncrease = this.states[this.currentState].satisIncrease[cIndex];
                let stressIncrease = this.states[this.currentState].stressIncrease[cIndex];
                console.log("satisfaction increase : " + satisIncrease);
                console.log("stress increase: " + stressIncrease);
                this.scoreManager.addSatisfaction(satisIncrease / 100);
                this.scoreManager.addStress(stressIncrease/ 100);
            } 
            // else if the restart button is clicked, reset the scores
            else if (nextState == "Splash") {
                this.scoreManager.reset();
            }
            console.log(nextState);
            this.newState(nextState);
        }
    }

    getState(stateName) {
        let index = this.stateNames.indexOf(stateName); 
        return this.states[index];
    }

    // set new state, make callbacks
    newState(newStateName) {
        let newStateNum = this.stateNames.indexOf(newStateName); 
        if( newStateNum === -1 ) {
            console.log("Error: " + newState() + " cannot find " + newStateName );
            return;
        }

        this.currentState = this.stateNames.indexOf(newStateName); 
        this.performCallbacks();
        this.changeButtonsVisibility();
    }

    // turn various clickables on/off according to the current state
    changeButtonsVisibility() {
        // this is the array where the button is VISIBLE for that state
        // OPTIMIZATION: store this in setup somethwere
        let clickablesOn = this.states[this.currentState].clickableNames; 

        for( let i = 0; i < this.clickableArray.length; i++ ) {
            let cIndex = clickablesOn.indexOf(this.clickableArray[i].name);
            if( cIndex === -1 ) {
                this.clickableArray[i].visible = false;
            }
            else {
                this.clickableArray[i].visible = true;
            }
        }
    }

    performCallbacks() {
        // perform initial callbacks - if there is an invalid CSV, this will produce an error
        this.setImageFilenameCallback(this.states[this.currentState].imageFilename);
        this.stateChangedCallback(this.states[this.currentState].stateName);
    }
}

class State {
    constructor(stateName, imageFilename) {
        this.stateName = stateName;
        this.imageFilename = imageFilename;
        this.clickableNames = [];
        this.nextStates = [];
        this.satisIncrease = [];
        this.stressIncrease = [];
        this.texts = [];
    }

    addInteraction(clickableName, nextState, satisfaction, stress, text) {
        this.clickableNames.push(clickableName);
        this.nextStates.push(nextState);
        this.satisIncrease.push(satisfaction);
        this.stressIncrease.push(stress);
        this.texts.push(text);
    }
}

class ScoreManager {
    constructor() {
        // 20 total units
        this.satisfaction = .15;
        this.stress = .1;
        this.gameOver = false;
    }

    addSatisfaction(amount) {
        this.satisfaction += amount;
    }

    addStress(amount) {
        this.stress += amount;
        if ( this.stress > this.satisfaction) {
            this.gameOver = true;
        }
    }

    reset() {
        this.satisfaction = .15;
        this.stress = .1;
        this.gameOver = false;
    }

    drawScore(xpos, ypos) {
        fill("#007BFF");
        rect(xpos, ypos, this.satisfaction * 700, 10);
        fill("#EF233C");
        rect(xpos, ypos + 20, this.stress * 700, 10);
    }
}
