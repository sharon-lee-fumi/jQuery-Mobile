// myscript for Project
// Sharon Lee

var latH, longH;
var latD, longD;
var map;

var studentList = new Array();
var newStudent;
var rowID;	// use to hold user's selecction
function Student (sName, sLogin, sNumber, img, sProgram) {
	this.sName = sName;
	this.sLogin = sLogin;
	this.sNumber = sNumber;
	this.img = img;
	this.sProgram = sProgram;
}

var departmentList = new Array();
var newDepartment;
var dID;	// use to hold user's selecction
function Department (dName, description, fact1, fact2) {
	this.dName = dName;
	this.description = description;
	this.fact1 = fact1;
	this.fact2 = fact2;
}

var xmlData;	// holds the entire XML file from ajax call
var vID;	// use to hold user's selecction

// pull XML info
$(document).on("pagecreate", "#vitamins", function(){
	$.ajax({
		type : "GET", 
		url : "XML05-vitaminsdefinitions.xml", 
		dataType : "xml", 
		success : parseXML
	});	
	console.log("xml ready");	
});	// end of doc ready

function parseXML(xml) {	// one parameter to hold xml
	console.log("in parseXML");	
	
	xmlData = xml;
	var n=0;
	$(xml).find("expression").each(function(){
		$("#vList").append(
			"<li li-id='" + n + "'><a href='#indV'>" +
			$(this).text() + "</a></li>"
			);
		n++;
		$("#vList").listview("refresh");	
		});
};

$(document).on("click", "ul#vList >li", function(){
	vID = $(this).closest("li").attr("li-id");
	console.log("li selected: " + vID);
});

$(document).on("pageshow", "#indV", function(){
	pullXML(xmlData, vID);
});

function pullXML(result, choice){
	$("#indtitle").html(
		"Vitamin Name: " + 
		$(result).find("expression:nth(" + choice + ")").text()
	);
	$("#ind-data").html(
		"<h4>Explanation: " + 
		$(result).find("explanation:nth(" + choice + ")").text() +
		"</h4>"
	);
	$("#pic").html(
		"<h4><img src='_images/" +
				$(result).find("picture:nth(" + choice + ")").text() +
				"' style='width:80%; height:170px; display: block; margin: 0 auto;'>" +
				"Picture</h4>"
	);
	$("#ref").html(
		"<h5>Reference: " + 
		$(result).find("expression-group:nth(" + choice + ")").attr("reference") + 
		"<br>URL: " + 
		$(result).find("expression-group:nth(" + choice + ")").attr("reference-url") +
		"</h5>"
	);
}

// pull JSON info
$(document).on("pagecreate", "#home", function(){
	
	$.getJSON("hospital.json", function (data){
	console.log(data);
	
	hinfo = data.hospital;	
	$("#hospital").html("<h4 style='text-align:center;'>" +
					"Name: " +hinfo.name + 
					"<br>" + 
					"City: " + hinfo.city + 
					"<br>" + 
					"Url: " + "<a href='"+ hinfo.url + "'>" +hinfo.url + "</a>" +
					"<br>" + 
					"Phone: " + hinfo.phone +
					"</h4>");
	
	department = data.hospital.department;
	var n=0;	
	$("ul#dList").html("");
	
		for (x = 0; x < department.length; x++)
		{
			$("ul#dList").append(
			"<li li-id='" + n + "'>" + 
				"<a href='#indD'>" +
				department[x].dName +
				"</a>" +			
			"</li>");

			newDepartment = new Department(department[x].dName,
						department[x].description,
						department[x].fact1,
						department[x].fact2
						);
			departmentList.push(newDepartment);
			n++;
		}
		console.log(departmentList);
		$("ul#dList").listview("refresh");				

	});	
});

$(document).on("click", "ul#dList >li", function(){
	dID = $(this).closest("li").attr("li-id");
	console.log("li selected: " + dID);
});

$(document).on("pagebeforeshow", "#indD", function(){
	
	$.getJSON("hospital.json", function (data){
		$("#d-data").html(
			"<h4>Department Name: " +
			department[dID].dName +
			"<br><br>" +
			
			"Description: " +
			department[dID].description +
			"<br><br>" +

			"Fact1: " +
			department[dID].fact1 +
			"<br><br>" +

			"Fact2: " +
			department[dID].fact2 +
			"</h4>"
		);
	});
});


// start of map 
$(document).on("pagecreate", "#map", function(){
	
	$.getJSON("hospital.json", function (data){
		$.getJSON("info.json", function (sdata){
		
		
		latH = data.hospital.lat;
		longH = data.hospital.long;
		latD = 43.656233;
		longD = -79.739397;

		// info windows
		var inform = new google.maps.InfoWindow();	
		
		sInfo = sdata.student;
		
		var sN = "Students Name: <br>";
		for (x=0; x < sInfo.length; x++)
		{
			sN = sN + sInfo[x].sName + "<br>"
		}
		
		var r = [["Hospital Name: " + data.hospital.name + "<br>" + 
					 "City: " + data.hospital.city, latH, longH],
				 [sN, latD,longD]];
		
		hmap = new google.maps.LatLng(latH, longH);	// center point
		var maph = {
			center: hmap,
			zoom: 10, 
			mapTypeId: google.maps.MapTypeId.HYBRID
		}
		
		// draw map.... need output location and options
		map = new google.maps.Map(document.getElementById("map_canvas"), maph);
		var i;
		for (i=0;i<r.length;i++)
		{
			hLoc =  new google.maps.Marker({
				map: map,
				icon: "_images/pushpin.gif",
				animation: google.maps.Animation.DROP,
				position: new google.maps.LatLng(r[i][1], r[i][2]),	
			});
			
			//	add a listener to listen for a click on marker
			google.maps.event.addListener(hLoc, "click", (function(hLoc,i){
			return function() {
				inform.setContent(r[i][0]);
				inform.open(map, hLoc);
			}
			})(hLoc, i));	
		}
			
		var pathCoordinates = [
			{ lat:latH, lng: longH},
			{ lat:latD, lng: longD}
		];
		
		var myPath = new google.maps.Polyline({
			path: pathCoordinates,
			geodesic: true,
			strokeColor: "#FF0000",
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		
		myPath.setMap(map);
		
		});		
	});
});
// end of map 

// start of footer 
$(document).on("click", "ul#individual >li", function(){
	rowID = $(this).closest("li").attr("li-id");
	console.log("li selected: " + rowID);
});

$(document).on("pagecreate", "#popups", function(){
	$("#student").navbar("destroy");
	$("#student").navbar();
});

$(document).on("pageshow", "#popups", function(){

	$.getJSON("info.json", function (data){
	console.log(data);
	
	sInfo = data.student;
	var n=0;
	$("#sName").html(sInfo[rowID].sName);
	
	$("#info").html("<h5>" +
					"Student Name: " + 
					sInfo[rowID].sName + 
					"<br><br>" + 
					"Username: " + 
					sInfo[rowID].sLogin + 
					"<br><br>" + 
					"Student Number: " + 
					sInfo[rowID].sNumber + 
					"<br><br>" + 
					"Program: " + 
					sInfo[rowID].sProgram + 
					"<br>" +
					"</h5>");
	$("#spic").html("<h5>Personal image<br><img src='_images/" +
					sInfo[rowID].img +
					"' style='width:40%; height:40%; display: block; margin: 0 auto;'></h5>");
		
	});
	
});
// end of footer 