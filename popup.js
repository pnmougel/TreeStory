var redraw, g, renderer;

window.onload = function() {
	// only do all this when document has finished loading (needed for RaphaelJS)
	var width = 800;
	var height = 1000;

	g = new Graph();

	chrome.history.search({'text' : '', 'startTime': 0}, onHistoryElement); 
	
	// Build the graph after a while, since the chrome api seems to be asynchronous 
	setTimeout(buildEdges,500);
	
	setTimeout(function() {
		var layouter = new Graph.Layout.Spring(g);
		// draw the graph using the RaphaelJS draw implementation
		renderer = new Graph.Renderer.Raphael('canvas', g, width, height);

		layouter.layout();
		renderer.draw();
	},1000);
}


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
	g.addEdge(historyItemFrom, historyItemTo, { directed : true } );
}

function addNode(historyId) {
	console.log('');
	console.log('New node:');
	console.log('url: ' + history[historyId].url);
	console.log('domain: ' + history[historyId].url.toLocation().hostname);
	console.log('nbVisits: ' + history[historyId].visitCount);
	console.log('title: ' + history[historyId].title);
	g.addNode(historyId, {label: history[historyId].url.toLocation().hostname});
}

function onHistoryElement(historyItems) {
	for (var i = 0; i < historyItems.length; ++i) {
		history[historyItems[i].id] = {
			url: historyItems[i].url, 
			lastVisitTime: historyItems[i].lastVisitTime, 
			title: historyItems[i].title, 
			visitCount: historyItems[i].visitCount};
		var url = historyItems[i].url;
		addNode(historyItems[i].id);
		
		// List the visits to an history element
		chrome.history.getVisits({url: url}, function(visitItems) {
			for(var j in visitItems){
				visits[visitItems[j].visitId] = {
					visitTime: visitItems[j].visitTime,
					transition: visitItems[j].transition,
					referringVisitId: visitItems[j].referringVisitId,
					historyId: visitItems[j].id
				};
			}
		});
	}
}

function buildEdges() {
	console.log('Creating the graph');
	for(var visitId in visits) {
		if(visits[visitId].referringVisitId in visits) {
			var historyItemFrom = visits[visits[visitId].referringVisitId].historyId;
			var historyItemTo = visits[visitId].historyId;
			addEdge(historyItemFrom, historyItemTo, visitId);
		}
	}
}
