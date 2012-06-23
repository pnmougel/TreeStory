// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


// Add a method to the String prototype to get the location when the string is an url
// It is a little bit hugly since it is not applicable to string but who cares ?
String.prototype.toLocation = function() {
	var a = document.createElement('a');
    a.href = this;
    return a;
};

history = {};
visits = {};

function addEdge(historyItemFrom, historyItemTo, visitId) {
	console.log('New link:');
	console.log('From:' + history[historyItemFrom].url);
	console.log('To:' + history[historyItemTo].url);
}

function addNode(historyId) {
	console.log('');
	console.log('New node:');
	console.log("url: " + history[historyId].url);
	console.log("domain: " + history[historyId].url.toLocation().hostname);
	console.log("nbVisits: " + history[historyId].visitCount);
	console.log("title: " + history[historyId].title);
}

function onHistoryElement(historyItems) {
	for (var i = 0; i < historyItems.length; ++i) {
		history[historyItems[i].id] = {
			url: historyItems[i].url, 
			lastVisitTime: historyItems[i].lastVisitTime, 
			title: historyItems[i].title, 
			visitCount: historyItems[i].visitCount};
// 		var urlHistory = document.createElement('p');
		var url = historyItems[i].url;
// 		console.log(url.toLocation().hostname);
// 		console.log("Visits from " + url);
// 		console.log(historyItems[i]);
// 		urlHistory.textContent = url;
		addNode(historyItems[i].id);
		chrome.history.getVisits({url: url}, function(visitItems) {
			for(var j in visitItems){
// 				console.log("Visit from: " + history[visitItems[j].id].url);
				visits[visitItems[j].visitId] = {
					visitTime: visitItems[j].visitTime,
					transition: visitItems[j].transition,
					referringVisitId: visitItems[j].referringVisitId,
					historyId: visitItems[j].id
				};
// 				console.log("Current visit Id: " + visitItems[j].visitId);
// 				console.log(visits);
// 				console.log("Visit from: " + visitItems[j].referringVisitId);
// 				console.log(visits["" + visitItems[j].referringVisitId]);
// 				if(visitItems[j].referringVisitId in visits) {
// 					var historyItemFrom = visits[visitItems[j].referringVisitId].historyId;
// 					var historyItemTo = visitItems[j].id;
// 					addEdge(historyItemFrom, historyItemTo, visitItems[j].visitId);
// 				}
// 				console.log(visitItems[j]);
// 				console.log(visitItems[j].id);
			}
		});
// 		document.getElementById("content").appendChild(urlHistory);
// 		console.log(history);
	}
}

function buildEdges() {
	console.log("Creating the graph");
	for(var visitId in visits) {
		if(visits[visitId].referringVisitId in visits) {
			var historyItemFrom = visits[visits[visitId].referringVisitId].historyId;
			var historyItemTo = visits[visitId].historyId;
			addEdge(historyItemFrom, historyItemTo, visitId);
		}
	}
}
setTimeout(buildEdges,1000);

chrome.history.search({'text' : '', 'startTime': 0}, onHistoryElement); 
