
function getTimeFromMillis( milliseconds ) {
	if (milliseconds === 0) {		// tab has not been activated since initialization
		return "--";
	} else {
		var d = new Date();
		return (( d.getTime() - milliseconds ) / 1000 / 60.0).toFixed(2) + " m";
	}
}

function createRowDivForTab(tabName, favIconUrl, timeSinceLastActive, tabId) {
	var newRow = document.createElement("div");
	newRow.className = "row";

	var favIconDiv = document.createElement("div");
	favIconDiv.className = "icon-col";
	var favIconImg = document.createElement("img");
	favIconImg.setAttribute("src", favIconUrl);
	favIconDiv.appendChild(favIconImg);

	var tabNameDiv = document.createElement("div");
	tabNameDiv.setAttribute("class", "name-col");
	var tabNameText = document.createTextNode(tabName);
	tabNameDiv.appendChild(tabNameText);

	var timeSinceLastActiveDiv = document.createElement("div");
	timeSinceLastActiveDiv.setAttribute("class", "time-since-last-active-col");
	var timeSinceLastActiveText = document.createTextNode( timeSinceLastActive);
	timeSinceLastActiveDiv.appendChild(timeSinceLastActiveText);

	var closeIconDiv = document.createElement("div");
	closeIconDiv.setAttribute("class", "close-icon-col");
	closeIconDiv.addEventListener("click", function() {
		chrome.tabs.remove(tabId);
		closeIconDiv.parentNode.parentNode.parentNode.removeChild(closeIconDiv.parentNode.parentNode);
	});

	newRow.appendChild(favIconDiv);
	newRow.appendChild(tabNameDiv);
	newRow.appendChild(timeSinceLastActiveDiv);
	newRow.appendChild(closeIconDiv);

	return newRow;
}

function appendTabToList( list, div ) {
	var newListItem = document.createElement("li");
	newListItem.appendChild(div);
	list.appendChild( newListItem );
}

function renderTabList( list, tabs ) {
	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i][0];
		var time = getTimeFromMillis( tabs[i][1] );
		var newDiv = createRowDivForTab( tab.title, tab.favIconUrl, time, tab.id );	
		appendTabToList( list, newDiv );
	}
}

/*
 * On extension page load:
 * Render tabs in list
 */
document.addEventListener('DOMContentLoaded', function() {
	var list = document.getElementById('tabList');

	chrome.storage.sync.get('times', function(items) {
		var timesLastActive = items.times;
		renderTabList(list, timesLastActive);
	});
} );



