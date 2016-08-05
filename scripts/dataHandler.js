var mode = "AS";
mode = "INI";
var INIStore = new INIManager();
INIStore.registerINI("","PokemonStats",false);
var currFile = INIStore.checkoutINI("PokemonStats");
currFile.removeSection("main");
currFile.addSection("PKMN151");
var fileList = document.getElementById("fileList");
var unitList = document.getElementById("unitList");

function listFiles() {
	var out = [];
	var out2 = [];
	for (var i=0; i < INIStore.INILib.length; i++) {
		var curr = INIStore.INILib[i];
		out.push(curr.name);
	}
	for (var i=0; i < currFile.sections.length; i++) {
		var curr = currFile.sections[i][0];
		out2.push(curr);
	}
	fileList.innerHTML = "[ " + out.join(" , ") + " ]";
	unitList.innerHTML = "[ " + out2.join(" , ") + " ]";
}
listFiles();

function resetForm() {
	for (var i=0; i < db.statList.length; i++) {
		var curr = db.statList[i];
		var currV = curr["default"]["FORM"];
		var curr2 = document.getElementById(curr.id);
		if (curr.optLim) {
			for (var i2=0; i2 < curr2.options.length; i2++) {
				curr3 = curr2.options[i2];
				if (curr3.value == currV) {
					curr2.selectedIndex = i2;
				}
			}
		} else {
			curr2.value = currV;
		}
	}
}

var compat = {
	"Form" : "FORM",
	"AS" : "AS",
	"INI" : "INI"
};

var statTabList = ["common"];
var statTabs = document.getElementById("statTabs");
var statTabPanes = document.getElementById("statList");
var statInfoList = document.getElementById("statInfoList");
function initEditor(){
for (var i=0; i < db.statList.length; i++) {
	var curr = db.statList[i];
	var currTab = curr.tab;
	var tabExists = false;
	for (var i2=0; i2 < statTabList.length; i2++) {
		var curr2 = statTabList[i2];
		if (curr2 == currTab) {
			tabExists = true;
			break;
		}
	}
	if (!tabExists) {
		statTabs.innerHTML += "<li><a data-toggle=\"tab\" href=\"#stats" + currTab + "\">" + currTab + "</a></li>";
		statTabList.push(currTab);
		statTabPanes.innerHTML += "<div id=\"stats" + currTab + "\" class=\"tab-pane fade\"><h3>" + currTab + "&nbsp;stats:&nbsp;</h3></div>";
		statInfoList.innerHTML += "<li>" + currTab + "<ul id=\"statInfo_" + currTab + "\"></ul>";
	}
	var currPane = document.getElementById("stats" + currTab);
	var currInfo = document.getElementById("statInfo_" + currTab);
	currInfo.innerHTML += "<li>" + curr.id + "&nbsp;,&nbsp;" + curr.type + "&nbsp;,&nbsp;" + curr.docu+ "</li>"; 
	var pendingElement = "";
	var currStat = curr.id;
	var defStatValue = curr["default"].FORM;
	if(!curr.optLim) {
		pendingElement +=  currStat + ":&nbsp;<input id=\"" + currStat + "\""; 
		pendingElement += "size=\"" + 7 + "\"";
		pendingElement += "type=\"text\" value=\"" + defStatValue + "\"></input>&nbsp;";
		currPane.innerHTML += pendingElement;
	} else {
		pendingElement += currStat + ":&nbsp;<select id=\"" + currStat + "\">";
		for (var i2=0; i2 < curr.mapForm.length; i2++) {
			var curr3 = curr.mapForm[i2];
			var displayValue = curr.displayForm[i2];
			pendingElement += "<option value=\"" + curr3 + "\"";
			if (curr3 == defStatValue) {
				pendingElement += " selected";
			}
			pendingElement += ">" + displayValue + "</option>";
		}
		pendingElement += "</select>&nbsp;";
		currPane.innerHTML += pendingElement;
	}

}
}
//initEditor();

function houseCleaner(input,mode,format){
var output = input;
	for (var i=0; i < input.length; i++){
		var curr = input[i];
		for (var i2=0; i2 < db.statList.length; i2++) {
			var curr2 = db.statList[i2];
			if (curr2.id == curr.id) {
				var curr3 = curr2["map" + format];
				if (curr.value != curr2["default"][compat[format]]) {
					switch (curr3[0]) {
						case "@OVR_NUM" : {						
							output[i].value = output[i].value;
							break;
						}
						case "@OVR_STR" : {
							output[i].value = "\"" + output[i].value + "\"";
							break;
						}
						case "@OVR_ASCODE" : {
							output[i].value = "@ERR_CANNOT_RECOVER_DATA";
							break;
						}
						case "@OVR_CAMM_ARRAY" : {
							//console.log("test! [CAMM ARRAY]");
							var theData = output[i].value.replace("{","");
							theData = theData.replace("}","");
							var ar = theData.split("|");
							if (mode == "AS") {
								for (var i4 = 0; i4 < ar.length; i4++) {
									ar[i4] = "\tthis.children.push(\"" + ar[i4] + "\" + this.type.substr(3));";
								}
								var arAS = ar.join("\n") + "\n";
								//console.log(arAS);
								output[i].value = arAS;
							} else if (mode == "Form") {
								arForm = ar.join(",");
								output[i].value = arForm;
								//console.log(arForm);
							}
							//console.log("out : " + output[i].value);
							break;
						}
						case "@OVR_STR_ARRAY" : {
							//console.log("DEBUG MULTI-RUN: STRING ARRAY");
							var ar = output[i].value.split(",");
							if (mode == "INI") {
								var arINI = "{" + ar.join("|") + "}";
								//console.log(arINI);
								output[i].value = arINI;
								break;
							} else if (mode == "AS") {
								//this.children.push("UA_"+this.type.substr(3)); //ref
								for (var i4 = 0; i4 < ar.length; i4++) {
									ar[i4] = "\tthis.children.push(\"" + ar[i4] + "\" + this.type.substr(3));";
								}
								var arAS = ar.join("\n") + "\n";
								//console.log(arAS);
								output[i].value = arAS;
								output[i].preFabbed = true;
								break;
							}
							
						}
						case "@OVR_UH" : {
							//this.parent.parent.findBuilding("BC_"+this.team, this.parent.team);
							if (format == "Form") {
								if (mode == "INI") {
									//nothing needs done
								} else if (mode == "AS") {
									output[i].value = "\tthis.parent.parent.findBuilding(\"" + output[i].value + "\" + this.team, this.parent.team);\n";
									output[i].preFabbed = true;
								}
							} else if (format == "INI") {
								if (mode == "Form") {
									//nothing needs done
								} else if (mode == "AS") {
									output[i].value = "\tthis.parent.parent.findBuilding(\"" + output[i].value + "\" + this.team, this.parent.team);\n";
									output[i].preFabbed = true;
								}
							}
						}
						default : {
							for (var i3=0; i3 < curr3.length; i3++) {
								var curr4 = curr3[i3];
								if (curr4 == curr.value) {
									output[i].value = curr2["map" + mode][i3];
									break;
								}
							}
						}
					}
				} else {
					output[i].disabled = true;
				}
				break;
				/*
				and somehow it takes adding an 'array' type of stat 
				for the lack of this break statement to break the program... 
				ok... /:
				*/
			}
		}
	}
	return output;

}

function getStatData() {
	resetForm();
	var dump = [];
	var fileSel = document.getElementById("fileSel");
	var unitSel = document.getElementById("unitSel");
	var fileName = fileSel.value;
	var unitName = unitSel.value;
	var failed = false;
	var data = null;
	var test = INIStore.checkoutINI(fileName);
	if (test != "failed!") {
		currFile = test;
	} else {
		alert("the requested INI does not exist!");
		failed = true;
	}
	var test2 = currFile.getSection(unitName);
	if (test2[0] != "data_missing") {
		data = test2;
		//console.log(JSON.stringify(data));
		//alert("found section!");
	} else {
		if (currFile.sections.length > 0) {
			data = currFile.sections[0];
			//console.log(JSON.stringify(data));
			//alert("default section!");
		} else {
			alert("the requested INI is empty!");
			failed = true;
		}
	}
	if (!failed) {
		for (var i=0; i < data[1].length; i++) {
			var currK = data[1][i];
			var currV = data[2][i];
			dump.push({"id":currK,"value":currV});
			//console.log("key , value : " + currK + " " + currV);
		}
		dump = houseCleaner(dump,"Form","INI");
		//console.log(JSON.stringify(dump));
		//alert("break!");
		for (var i=0; i < dump.length; i++) {
			var currData = dump[i];
			if (!currData.disabled) {
				for (var i2=0; i2 < db.statList.length; i2++) {
					currDB = db.statList[i2];
					if (currDB.id == currData.id) {
						if (currDB.optLim) {
							var temp = document.getElementById(currData.id);
							for (var i3=0; i3 < temp.options.length; i3++) {
								var currOp = temp.options[i3].value;
								if (currOp == currData.value) {
									temp.selectedIndex = i3;
								}
							}
						}
					} else {
						var temp = document.getElementById(currData.id);
						temp.value = currData.value;
					}
				}
			}
		}
	}
}

function dumpStatData(internal,wholeFile){
	var IDtxt = document.getElementById("IDtxt");
	var filetxt = document.getElementById("filetxt");
	var ascomtxt = document.getElementById("ascomtxt");
	var dump = getFormInputs();
	//alert("hi");
	//console.log("dumping stat data");
	if (!internal) {dump = houseCleaner(dump,mode,"Form");} else {dump = houseCleaner(dump,"INI","Form");}
	//console.log("finished!");
	//console.log(JSON.stringify(dump));
	//alert("break");
	var ID = IDtxt.value;
	var asComment = ascomtxt.value;
	var fileName = filetxt.value;
	if (internal) {
		var test = INIStore.checkoutINI(fileName);
		if (test != "failed!") {
			currFile = test;
		} else {
			INIStore.registerINI("",fileName,false);
			currFile = INIStore.checkoutINI(fileName);
			currFile.removeSection("main");
		}
	}
	if (mode == "AS" && !internal) {
		var ext = ".as";
		var out = "//hack into game VIA flash wrapper!\n"
		if (!wholeFile) {
			out += "if ((this.type==\"" + ID + "_good\") || (this.type==\"" + ID + "_evil\")){\n";
			out += "//" + asComment + "\n";
			for (var i=0; i < dump.length; i++){
				if (!dump[i].disabled && !dump[i].preFabbed) {
				out += "\tthis." + dump[i].id + " = " + dump[i].value + ";\n"
				} else if (dump[i].preFabbed) {
					out += dump[i].value;
				}
			}
			out += "}"
		} else {
			for (var i=0; i < currFile.sections.length; i++) {
				var dump = [];
				var curr = currFile.sections[i];
				var ID = curr[0];
				for (var i2=0; i2 < curr[1].length; i2++) {
					var currK = curr[1][i2];
					var currV = curr[2][i2];
					dump.push({"id":currK,"value":currV});
				}
				dump = houseCleaner(dump,mode,"INI");
				if (i > 0) {
					out += "\n";
				}
				out += "if ((this.type==\"" + ID + "_good\") || (this.type==\"" + ID + "_evil\")){\n";
				for (var i3=0; i3 < dump.length; i3++) {
					if (!dump[i3].disabled && !dump[i3].preFabbed) {
						out += "\tthis." + dump[i3].id + " = " + dump[i3].value + ";\n"
					} else if (dump[i3].preFabbed) {
						out += dump[i3].value;
					}
				}
				out += "}"
			}
		}
	}
	if (mode == "INI" && !internal) {
		var ext = ".ini";
		if (!wholeFile) {
			var out = "[" + ID + "]\n";
			out += ";" + asComment + "\n";
			for (var i=0; i < dump.length; i++){
				if (!dump[i].disabled) {
					out += dump[i].id + "=" + dump[i].value + "\n";
				}
			}
		} else {
			var out = currFile.toString();
		}
	}
	if (internal) {
		currFile.removeSection(ID);
		currFile.addSection(ID);
		//currFile.addKey(ID,"INTERNAL_SPECIAL_COMMENT",asComment);
		for (var i=0; i < dump.length; i++){
			if (!dump[i].disabled) {
				currFile.addKey(ID,dump[i].id,dump[i].value);
				//console.log("added value to current file!");
			}
		}
		//console.log(JSON.stringify(currFile));
		listFiles();
	} else {
		var blob = new Blob([out], {type: "text/plain;charset=utf-8"});
		saveAs(blob, fileName + ext);
	}
}

function getFormInputs(){
var out = [];
	for (var i=0; i < db.statList.length; i++){
		var curr = db.statList[i];
		var curr2 = document.getElementById(curr.id);
		if (curr.optLim) {
			out.push({"id":curr.id,"value":curr2.options[curr2.selectedIndex].value});
		} else {
			out.push({"id":curr.id,"value":curr2.value});
		}
	}
	var modeT = document.getElementById("Emode");
	mode = modeT.options[modeT.selectedIndex].value;
	//console.log("output : " + JSON.stringify(out));
	return out;
}