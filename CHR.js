/*###############################
	Variables
###############################*/	

//Corruption Array
var corruptionArray = new Array();
// % of untouched duration for corruption at begining
var corruptionBuffer = 0.20;
// Current active or upcoming corruption
var corruptionCurrent = 0;
// Corruption toggle
var corruptionEnabled = false;
// ~Corruptions per Round
var corruptionRate = 1.2;
var corruptionStart = 0;
var corruptionStep = 0;
var roundArray = new Array();
var currentRound = 0;
var currentEnd = 0;
var localURLs = new Array();
var xhttp = new XMLHttpRequest();
var videoNode = 0;

/*###############################
	Triggers
###############################*/

//onLoad
window.onload=function()
{		
	

	//XML Input
	var xmlNode = document.getElementById('xmlInput');
	var loadXMLFile = function () 
	{
		var file = this.files[0];
		var type = file.type;
		var fileURL = URL.createObjectURL(file);
		openXMLFile(fileURL);					
	}
	xmlNode.addEventListener('change', loadXMLFile, false);
	
	//Start Button
	var	startButton = document.getElementById('startButton');
	var startFirst = function()
	{
		currentRound = 0;
		if(roundArray[currentRound])
		{
			playVideo(roundArray[currentRound]["LocalURL"],roundArray[currentRound]["Start"],roundArray[currentRound]["End"]);
		}
	}
	startButton.addEventListener('click', startFirst, false);

	//Shuffle Button
	var	shuffleButton = document.getElementById('shuffleButton');
	var shufflePlaylist = function ()
	{	
		var tempArray = roundArray;	
		var i = roundArray.length;
		while(i>0)
		{
			var random = Math.floor(Math.random()*i);
			tempArray.push(roundArray[random]);
			roundArray.splice(random,1);
			i--;
		}
		roundArray = tempArray;
		displayPlaylist();
	}
	shuffleButton.addEventListener('click', shufflePlaylist, false);
	
	//Assemble Button
	var	assembleButton = document.getElementById('assembleButton');
	var assemblePlaylist = function ()
	{	
		var assembleRounds = document.getElementById("assembleRounds");
		var assembleDiffDown = document.getElementById("assembleDiffDown");
		var assembleDiffUp = document.getElementById("assembleDiffUp");
		var tempArray = roundArray;	
		var sortedArray = new Array();
		var i = roundArray.length;
		while(i>0)
		{
			if(!sortedArray[roundArray[i-1]["Difficulty"]])
			{
				sortedArray[roundArray[i-1]["Difficulty"]] = new Array();
			}
			sortedArray[roundArray[i-1]["Difficulty"]].push(roundArray[i-1]);
			roundArray.splice(i-1,1);
			i--;
		}
		var j = 0;
		var diffLevel = 0;
		while(j<assembleRounds.value)
		{	
			if(sortedArray[diffLevel])
			{
				var random = Math.floor(Math.random()*sortedArray[diffLevel].length);
				tempArray.push(sortedArray[diffLevel][random]);
				sortedArray[diffLevel].splice(random,1);
			}
			
			if((assembleRounds.value-j-1)*parseInt(assembleDiffUp.value)>10-diffLevel)
			{
				var diffChangeRange = parseInt(assembleDiffDown.value) + parseInt(assembleDiffUp.value);		
				diffLevel += (Math.floor(Math.random()*diffChangeRange))-assembleDiffDown.value;
			}
			else
			{
				diffLevel+= parseInt(assembleDiffUp.value);
			}
			
			if(diffLevel<1)
			{
				diffLevel = 1
			}
			else if(diffLevel>10)
			{
				diffLevel=10;
			}			
			j++;
		}
		roundArray = tempArray;
		displayPlaylist();
	}
	assembleButton.addEventListener('click', assemblePlaylist, false);
	
	//Open Local XML button
	var	localButton = document.getElementById('localButton');
	openLocalXML = function ()
	{
		xhttp.open("GET", "Cockheroorg.xml", true);
		xhttp.send(); 
	}
	localButton.addEventListener('click', openLocalXML, false);	
		
	//Corruptions On/Off
	var	chkCorruption = document.getElementById('chkCorruption');
	var toggleCorruptions = function()
	{
		corruptionEnabled = chkCorruption.checked ; 
	}
	chkCorruption.addEventListener('change',toggleCorruptions, false);
		
		
	/*
	var arer = function () 
	{
		buildFilesList(this.files);
	}
	var videoInput = document.getElementById('videoInput');
	videoInput.addEventListener('change', arer, false);
	*/
	
	
	videoNode = document.querySelector('video');
	
}

//XML handler
xhttp.onreadystatechange = function() 
{
	if (this.readyState == 4 && this.status == 200) 
	{
		initializeCHR(xhttp.responseXML);
	}
};


/*###############################
	Functions 
###############################*/

function openXMLFile(filepath)
{
	xhttp.open("GET", filepath, true);
	xhttp.send(); 
}

function buildFilesList(fileList)
{
	var URL = window.URL || window.webkitURL;
	var i = 0;
	while(fileList[i])
	{
		localURLs.push(new Array(fileList[i].name,URL.createObjectURL(fileList[i])));			
		i++;
	}	
}	

function initializeCHR(xml,fileList)
{
	if(typeof(xml)!="undefined")
	{
		var nodes = xml.evaluate("Library/Video", xml, null, XPathResult.ANY_TYPE, null);
		var vidResult = nodes.iterateNext();
		while (vidResult) 
		{
			var roundCounter = 0;
			//Tag Logic here?
			var subNodes = xml.evaluate("Library/Video[@Filename='"+ vidResult.getAttribute("Filename") +"']/Round", xml, null, XPathResult.ANY_TYPE, null);
			var roundResult = subNodes.iterateNext();
			while (roundResult)
			{	
				var j = 0;
				while(localURLs[j]||vidResult.getAttribute("Remote"))
				{
					if (vidResult.getAttribute("Remote"))
					{
						var tempArray = new Array();
						tempArray["VideoName"] = vidResult.getAttribute("Name");	
						tempArray["Name"] = roundResult.getAttribute("Name");							
						tempArray["Difficulty"] = roundResult.getAttribute("Difficulty");		
						if(!tempArray["Difficulty"])
						{
							tempArray["Difficulty"] = roundCounter;
						}
						roundCounter++;
						if(roundCounter>10)
						{
							roundCounter = 10;
						}
						tempArray["Filename"] = vidResult.getAttribute("Filename");						
						tempArray["LocalURL"] = vidResult.getAttribute("Filename");
						var k = 0;
						var start= 0;
						while (roundResult.getAttribute("Start").split(":")[k])
						{
							start += roundResult.getAttribute("Start").split(":")[k] * Math.pow(60,roundResult.getAttribute("Start").split(":").length-1-k);
							k++;
						}						
						tempArray["Start"] = start;							
						var l = 0;
						var end= 0;
						while (roundResult.getAttribute("End").split(":")[l])
						{
							end += roundResult.getAttribute("End").split(":")[l] * Math.pow(60,roundResult.getAttribute("End").split(":").length-1-l);
							l++;
						}	
						tempArray["End"] = end;
						
						//Get Tags
						var tagsArray = new Array();
						var tagsNodes = xml.evaluate("Library/Video[@Filename='"+ vidResult.getAttribute("Filename") +"']/Round[@Name='"+ roundResult.getAttribute("Name") +"']/Tag", xml, null, XPathResult.ANY_TYPE, null);
						var tagsResult = tagsNodes.iterateNext();
						while(tagsResult)
						{
							tagsArray.push(tagsResult.getAttribute("Name"));
							tagsResult = tagsNodes.iterateNext();
						}
						tempArray["Tags"] = tagsArray;
						
						//get Pornstars						
						var pornstarsArray = new Array();
						var pornstarsNodes = xml.evaluate("Library/Video[@Filename='"+ vidResult.getAttribute("Filename") +"']/Round[@Name='"+ roundResult.getAttribute("Name") +"']/Pornstar", xml, null, XPathResult.ANY_TYPE, null);
						var pornstarsResult = pornstarsNodes.iterateNext();
						while(pornstarsResult)
						{
							pornstarsArray.push(pornstarsResult.getAttribute("Name"));
							pornstarsResult = pornstarsNodes.iterateNext();
						}
						tempArray["Pornstars"] = pornstarsArray;
						
						//Push Final array
						roundArray.push(tempArray);
						break;
					}
					else if(localURLs[j][0] == vidResult.getAttribute("Filename"))
					{
						var tempArray = new Array();						
						tempArray["VideoName"] = vidResult.getAttribute("Name");		
						tempArray["Name"] = roundResult.getAttribute("Name");								
						tempArray["Filename"] = vidResult.getAttribute("Filename");						
						tempArray["LocalURL"] = localURLs[j][1];
						var k = 0;
						var start= 0;
						while (roundResult.getAttribute("Start").split(":")[k])
						{
							start += roundResult.getAttribute("Start").split(":")[k] * Math.pow(60,roundResult.getAttribute("Start").split(":").length-1-k);
							k++;
						}						
						tempArray["Start"] = start;							
						var l = 0;
						var end= 0;
						while (roundResult.getAttribute("End").split(":")[l])
						{
							end += roundResult.getAttribute("End").split(":")[l] * Math.pow(60,roundResult.getAttribute("End").split(":").length-1-l);
							l++;
						}	
						tempArray["End"] = end;
						roundArray.push(tempArray);
					}
					j++;
				}
				
				roundResult = subNodes.iterateNext();
			}					
			//Corruptions Logic
			var corruptionNodes = xml.evaluate("Library/Video[@Filename='"+ vidResult.getAttribute("Filename") +"']/Corruption", xml, null, XPathResult.ANY_TYPE, null);
			var corruptionResult = corruptionNodes.iterateNext();
			while(corruptionResult)
			{
				var tempArray = new Array();					
				tempArray["Filename"] = vidResult.getAttribute("Filename");						
				tempArray["LocalURL"] = vidResult.getAttribute("Filename");
				var k = 0;
				var start= 0;
				while (corruptionResult.getAttribute("Start").split(":")[k])
				{
					start += corruptionResult.getAttribute("Start").split(":")[k] * Math.pow(60,corruptionResult.getAttribute("Start").split(":").length-1-k);
					
					k++;
				}		
				
				tempArray["Start"] = start;							
				var l = 0;
				var end= 0;
				while (corruptionResult.getAttribute("End").split(":")[l])
				{
					end += corruptionResult.getAttribute("End").split(":")[l] * Math.pow(60,corruptionResult.getAttribute("End").split(":").length-1-l);
					l++;
				}	
				tempArray["End"] = end;		
				corruptionArray.push(tempArray);
				
				//Move to Next Corruption
				corruptionResult = corruptionNodes.iterateNext();
			}
			//Move to next Video
			vidResult = nodes.iterateNext();
		} 
		displayPlaylist();
	}
}	

function playVideo(src, start, end)
{
	videoNode.src = src;
	var temp = start;	
	if(corruptionEnabled)
	{			
		var corruptionTest = Math.random()<=(corruptionRate/((roundArray[currentRound]["End"]-roundArray[currentRound]["Start"])/(roundArray[currentRound]["End"]-start)));
		if(corruptionStep != 1 && corruptionTest)
		{			
			corruptionStep = 1;
			corruptionStart = start + ((corruptionBuffer+(Math.random()*(1-corruptionBuffer)))*(end-start));
			currentEnd = corruptionStart;			
		}
		else 
		{
			currentEnd = end;	
			corruptionStep = 0;
		}
	}
	else currentEnd = end;	
	videoNode.addEventListener("timeupdate", endVideo);	
	videoNode.addEventListener
	(
		'loadedmetadata', 
		function () 
		{		
			videoNode.currentTime = temp;	
		}, 
		false
	);		
}

function endVideo()
{	
	if(videoNode.currentTime >= currentEnd) 
	{	
		videoNode.pause();	
		switch(corruptionStep)
		{
			case 1:			
				corruptionCurrent = Math.floor(Math.random()*corruptionArray.length);
				videoNode.removeEventListener("timeupdate",endVideo);	
				playVideo(corruptionArray[corruptionCurrent]["LocalURL"],corruptionArray[corruptionCurrent]["Start"],corruptionArray[corruptionCurrent]["End"]);
				corruptionStep = 2
				break;
				
			case 2:
				videoNode.removeEventListener("timeupdate",endVideo);				
				playVideo(roundArray[currentRound]["LocalURL"],corruptionStart,roundArray[currentRound]["End"]);
				break;
				
			default:
				currentRound++;			
				videoNode.removeEventListener("timeupdate",endVideo);
				if(roundArray[currentRound])
				{
					playVideo(roundArray[currentRound]["LocalURL"],roundArray[currentRound]["Start"],roundArray[currentRound]["End"]);
				}
				break;
		}		
	}
}	

//Display playlist of current Items
function displayPlaylist()
{		

	var messages = document.querySelector('p');	
	messages.innerHTML = "";
	var i = 0;	
	while(roundArray[i])
	{
		var roundDisplay = "";		
		
		//Tags Display
		var tags = "<ul>";
		var j = 0;
		while(roundArray[i]["Tags"][j])
		{
			tags += "<li>" + roundArray[i]["Tags"][j] + "</li>";
			j++;
		}
		tags += "</ul>";
		
		//Pornstars Display
		var pornstars = "<ul>";
		var j = 0;
		while(roundArray[i]["Pornstars"][j])
		{
			pornstars += "<li>" + roundArray[i]["Pornstars"][j] + "</li>";
			j++;
		}
		pornstars += "</ul>";
		
		roundDisplay += "<button class='CollapseButton'>"+ roundArray[i]["Name"] + "</button><div class='CollapseContent'>" + (roundArray[i]["Difficulty"]?"<h4>Difficulty: " + roundArray[i]["Difficulty"]+ "</h4>":"") + "<h3>" + roundArray[i]["VideoName"] + "</h3>" + (roundArray[i]["Tags"].length?"Tags:" + tags:"") + (roundArray[i]["Pornstars"].length?"Pornstars:" + pornstars:"") + "</div>"
		
		messages.innerHTML += roundDisplay;
		i++;
	}
	
	// ##############Collapsible logic#########################
	var coll = document.getElementsByClassName("CollapseButton");
	var i;
	for (i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function() {
		this.classList.toggle("expanded");
		var content = this.nextElementSibling;				
		if (content.style.maxHeight)
		{
		  content.style.maxHeight = null;
		} 
		else 								
		{							
			var collapseheight = content.scrollHeight;
			content.style.maxHeight = collapseheight + "px";	
			var recursiveParent = this.closest(".CollapseContent");
			while(typeof recursiveParent != "undefined")
			{	
				//Add to Calculated Height
				collapseheight += recursiveParent.scrollHeight;
				//Set Height for active container
				recursiveParent.style.maxHeight = collapseheight + "px";
				//set the parent collapsible container for recursion.
				recursiveParent = recursiveParent.parentNode.closest(".CollapseContent");
			}		
		} 
	  });
	}
	//###########################################################
}


	
