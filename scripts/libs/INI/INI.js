//INI.JS
//by ETXAlienRobot201
//Copyright (C) Crystalien Redux Project 2015 - 2016


var counter = 0;

function INI(name,notStrict){
    this.sections = [];
	this.name = name; //only useful if INI object is stored in an array
	this.strict = false;
	if (!notStrict){
		this.strict = true;
	}
	
	this.createSection = function(index){
		var tempS = [];
		this.sections.push(tempS);
		tempS.push("main"); //default section header
		tempS.push([]); //key
		tempS.push([]); //value
	}
	
	this.findValue = function(section,key,flagDupe){
		var out = "data_missing";
		if (flagDupe) {
			out = false;
		}
		for (var i=0; i < this.sections.length; i++){
			if(this.sections[i][0] == section){
				for (var i2=0; i2 < this.sections[i][1].length; i2++){
					if (this.sections[i][1][i2] == key){
						out = this.sections[i][2][i2];
						if (flagDupe) {
							out = true;
							//console.log("DUPLICATE KEY (" + key + ") FOUND!");
						}
						break;
					}
				}
			}
		}
		return out;
	}
	
	this.getSection = function(section,flagDupe) {
		var out = ["data_missing",[],[]];
		if (flagDupe) {
			out = false;
		}
		for (var i=0; i < this.sections.length; i++){
			if(this.sections[i][0] == section){
				out = this.sections[i];
				if (flagDupe) {
					out = true;
					//console.log("DUPLICATE SECTION (" + section + ") FOUND!");
				}
				break;
			}
		}
		return out;
	}
	
	this.toString = function(){
	var out = "";
		for (var i=0; i < this.sections.length; i++){
			out += "\n\n[" + this.sections[i][0] + "]";
			for (var i2=0; i2 < this.sections[i][1].length; i2++){
				out+= "\n" + this.sections[i][1][i2] + "=" + this.sections[i][2][i2];
			}
		}
	return out;
	}
	
	//strict mode methods merged into the data-reading methods
	
	//INI-writing methods:
	
	//add section <name>
	this.addSection = function(name){
		if (name) {
			var failed = false;
			if(this.strict){
				failed = this.getSection(name,true);
			}
			if (!failed) {
			this.createSection(this.sections.length);
			this.sections[this.sections.length-1][0] = name;
			//console.log("SECTION ADDED!");
			}
		}
	}
	
	//add key <keyName> to section <secName> , and set its value to <value>
	this.addKey =  function(secName,keyName,keyValue){
		for (var i=0; i < this.sections.length; i++){
			if (this.sections[i][0] == secName) {
				var failed = false;
				if (this.strict) {
					failed = this.findValue(secName,keyName,true);
				}
				if (!failed) {
					this.sections[i][1].push(keyName);
					this.sections[i][2].push(keyValue);
					//console.log("KEY ADDED!");
				}
			}
		}
	}
	
	//rename section <secName> to <secName2>
	this.reNameSection = function(secName,secName2) {
		var failed = false;
		if (this.strict){
			failed = this.getSection(secName2,true);
		}
		if (!failed){
			for (var i=0; i < this.sections.length; i++){
				if (this.sections[i][0] == secName) {
					this.sections[i][0] = secName2;
				}
			}
		}
	}
	
	//rename key <keyName> to <keyName2> ,within section <secName>
	this.reNameKey = function(secName,keyName,keyName2){
		for (var i=0; i < this.sections.length; i++) {
			var failed = false;
			if (this.sections[i][0] == secName){ 
				if (this.strict){
					failed = this.findValue(secName,keyName2,true);
				}
				if (!failed){
					for (var i2=0; i2 < this.sections[i][1].length; i2++) {
						if (this.sections[i][1][i2] == keyName) {
							this.sections[i][1][i2] = keyName2;
						}
					}
				}
			}
		}
	}
	
	//change the value of key <keyName> to <value> , within section <secName>
	this.changeKeyValue = function(secName,keyName,value){
		for (var i=0; i < this.sections.length; i++) {
			if(this.sections[i][0] == secName){
					for (var i2=0; i2 < this.sections[i][1].length; i2++) {
						if (this.sections[i][1][i2] == keyName) {
							this.sections[i][2][i2] = value;
					}
				}
			}
		}
	}
	
	//remove section <secName> from INI
	this.removeSection = function(secName) {
		for (var i=0; i < this.sections.length; i++) {
			if (this.sections[i][0] == secName) {
				this.sections.splice(i,1);
			}
		}
	}
	
	//remove key <key> from section <secName>
	this.removeKey = function(secName,keyName){
		for (var i=0; i < this.sections.length; i++) {
			if (this.sections[i][0] == secName) {
				for (var i2=0; i2 < this.sections[i][1].length; i2++) {
					if (this.sections[i][1][i2] == keyName) {
						this.sections[i][1].splice(i2,1);
						this.sections[i][2].splice(i2,1);
					}
				}
			}
		}
	}
	
}

//removes trailing whitespace, now supports tab and is in a separate utility function
function whiteSpace(input){
	var p = input.split("");
	var out = "";
	for (var i2 = p.length - 1; i2 < p.length; i2--) {
		if ((p[i2] == " ") || (p[i2] == "\t")) {
			p.splice(i2,1);
			//console.log("whitespace detected!");
		} else {
			break;
		}
	}
	out = p.join("");
	return out;
}

function parseINI(src,name,disableStrict){
    if (!name){
     name = "INI_" + counter;
     counter++;
    }
    var output = new INI(name);
	var sC = 0;
	var kC = 0;
	output.createSection(sC);
	//console.log(JSON.stringify(output.sections));
	if (!disableStrict){
	var sectionNames = [];
	var keyNames = [];
	output.strict = true;
	}
	var prev = "";
	var next = "";
	var pending = "";
	var inSection = false;
	var inKey = false;
	var inValue = false;
	var spacey = true;
	var currSec = "main";
	var currKey = "";
	
	for (var i = 0; i < src.length; i++) {
		var curr = src[i];
		if (i > 0) {
			prev = src[i-1];
		}
		next = src[i+1];
		switch(curr) {
			case "[": {
				if ((!inSection) && (!inKey) && (!inValue)) {
					inSection = true;
					spacey = true;
					output.createSection();
					//console.log("section!");
					sC++;
				} else if ((inSection) && (prev == "[")) {
					pending += curr;
				}
				break;
			}
			case "]": {
				var endSec = false;
				if ((next == "\r") || (next == "\n")) {
					endSec = true;
				}
				if (inSection) {
					inSection = false;
					if ((output.sections[sC][0] == "main") && (endSec)) {
						pending = whiteSpace(pending);
						output.sections[sC][0] =  "" + pending;
						currSec = "" + pending;
						pending = "";
						//console.log("section end!");
					} else if (!endSec) {
						pending += curr;
					}
					
				}
				break;
			}
			case "=": {
				if ((!inSection) && (!inValue) && (inKey)) {
					pending = whiteSpace(pending);
					output.addKey(currSec,pending,"");
					currKey = "" + pending;
					inKey = false;
					inValue = true;
					pending = "";
					//console.log("key end!")
					//console.log("value!");
					spacey = true;
				}
				break;
			}
			case "\n": {
				if (inValue) {
					pending = whiteSpace(pending);
					output.changeKeyValue(currSec,currKey,pending);
					//console.log("end value!");
				}
				if (inKey) {
					pending = whiteSpace(pending);
					output.addKey(currSec,pending);
					output.changeKeyValue(currSec,pending,"null");
					//console.log("POSSIBLE ERROR: UNEXPECTED KEY ENDING, VALUE SET TO NULL!");
				}
				inSection = false;
				inKey = false;
				inValue = false;
				spacey = true;
				pending = "";
				break;
			}
			case "\r": {
				if (inValue) {
					pending = whiteSpace(pending);
					output.changeKeyValue(currSec,currKey,pending);
					//console.log("end value!");
				}
				if (inKey) {
					pending = whiteSpace(pending);
					output.addKey(currSec,pending);
					output.changeKeyValue(currSec,pending,"null");
					//console.log("unexpected end key");
				}
				inSection = false;
				inKey = false;
				inValue = false;
				spacey = true;
				pending = "";
				break;
			}
			case " ": {
				if (((!inSection) && (!inValue) && (!inKey)) || spacey) {
				break;
				}
			}
			default : {
				pending += curr;
				if ((!inSection) && (!inValue)) {
					inKey = true;
				}
				spacey = false;
				if (inValue && ((next == undefined) || (next == null))) {
					pending = whiteSpace(pending);
					output.changeKeyValue(currSec,currKey,pending);
					//console.log("end value!");
				} else if (inKey && ((next == undefined) || (next == null))) {
					pending = whiteSpace(pending);
					output.addKey(currSec,pending);
					//console.log("end value!");
				}
			}
		}
		//console.log("CURRENT SECTION: " + currSec);
		//console.log("CURRENT KEY: " + currKey);
	}
	
	return output;
}

function INIManager(){
	this.INILib = [];
	
	this.registerINI = function(txt,id,notStrict){
		var temp = parseINI(txt,id,notStrict);
		this.INILib.push(temp);
	}
	
	this.getIndexOfINI = function(INIsearch){
		var out = -1;
		for (var i; i < this.INILib.length; i++){
			if (this.INILib[i].name == INIsearch){
				out = i;
			}
		}
		return out;
	}
	
	this.checkoutINI = function(ININame){
	var exists = false;
	var out;
		for (i=0; i < this.INILib.length; i++){
			if (this.INILib[i].name == ININame) {
				exists = true;
				out = this.INILib[i];
			} else {
			continue;
			}
		}
		if (!exists){
			//alert("ERROR! INI: " + ININame + " does not exist!");
			return "failed!";
		} else {
			return out;
		}
	}

}

/*
//updated to test whitspace removal
var test = "[[[la              \t\t\t\t\t\t\t\t\t\t\t\t\t\t]\nfalala=lalalalalalalalala\n[da]\n[kitty]\n]feline[=cat\n[la]\n                      pussy      =          also means cat\n[DELETE ME]\n[cool games]\ngame1=MineCraft\ngame2=Halo 4\ngame3=Arcuz\ngame4=Epic Battle Fantasy 4\ngame5=Fatcat"
//alert(test);
var INIStore = new INIManager();
INIStore.registerINI(test,"myINI");
var test2 = INIStore.checkoutINI("myINI");
var test1 = "";
var INI_S = test2.toString();
test1 += "ORIGINAL:\n" + INI_S + "\n\n";
INIStore.INILib[0].addSection("I am a new section");
INIStore.INILib[0].addSection("I am a new section"); //cause duplicate section error!
INIStore.INILib[0].addKey("I am a new section","New Key","a new key is added!");
INIStore.INILib[0].addKey("I am a new section","New Key","a new key is added!"); //cause duplicate key error!
INIStore.INILib[0].reNameSection("I am a new section","New section re-named");
INIStore.INILib[0].reNameKey("New section re-named","New Key","re-named new key");
INIStore.INILib[0].changeKeyValue("la","falala","Deck the halls with bows of holly, fa-la-la-la-la-la-la-la-la!");
INIStore.INILib[0].removeSection("DELETE ME");
INIStore.INILib[0].removeKey("cool games","game2");
var test3 = INIStore.checkoutINI("myINI");
var INI_S_2 = test3.toString();
test1 += "MODIFIED:\n" + INI_S_2;
alert(test1);
*/