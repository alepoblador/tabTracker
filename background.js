/*
 * On first install/update,
 * - initialize timesLastActive array with all currently open tabs
 * and set all times to 0
 */
chrome.runtime.onInstalled.addListener( function() {
	var timesLastActive = [];		// Array: [ [tab][time] ]
	var queryInfo = {};
	chrome.tabs.query(queryInfo, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
			(function (i) {
				chrome.tabs.get(tabs[i].id, function(tab) {
					timesLastActive.push([tab, 0]);
				} );
			} (i) );
		}
	});
	setTimeout(function() {
		chrome.storage.sync.set({'times': timesLastActive});
	}, 3000);
});

/*
 * Register listener for when active tab changes
 * Update timesLastActive to keep sorted by (most recently active) --> (least recently active)
 */
chrome.tabs.onActivated.addListener( function(activeInfo) {
	var tabId = activeInfo.tabId;
	chrome.storage.sync.get('times', function(items) {
		var timesLastActive = items.times;

		var tabExists = false;
		var idx = -1;
		var d = new Date();
		for (var i = 0; i < timesLastActive.length; i++) {
			if (timesLastActive[i][0].id ===  tabId) {
				tabExists = true;
				idx = i;
			}
		}
		if ( tabExists && idx != -1 ) {
			// shift tabs before index down
			var tmp = timesLastActive[idx];
			for (var i = idx-1; i >= 0; i--) {
				timesLastActive[i+1] = timesLastActive[i];
			}
			// swap tab to front
			timesLastActive[0] = tmp;
			timesLastActive[0][1] = d.getTime();
			chrome.storage.sync.set({'times': timesLastActive});
		} else {
			chrome.tabs.get(tabId, function(tab) {
				timesLastActive.unshift([tab, d.getTime()]);
				chrome.storage.sync.set({'times': timesLastActive});
			});
		}

	});
});

/*
 * Register listener for when tab is closed
 * Remove tab from timesLastActive
 */
chrome.tabs.onRemoved.addListener( function(tabId, removeInfo) {
	chrome.storage.sync.get('times', function(items) {
		var timesLastActive = items.times;

		for (var i = 0; i < timesLastActive.length; i++ ) {
			if (timesLastActive[i][0].id === tabId) {
				timesLastActive.splice(i, 1);
				break;
			}
		}

		chrome.storage.sync.set({'times': timesLastActive});
	});
});

/*
 * Register listener for when tab is updated
 * Monitor changes in: tab title, tab faviconUrl
 */
chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
	chrome.storage.sync.get('times', function(items) {
		var timesLastActive = items.times;

		var tabExists = false;
		for (var i = 0; i < timesLastActive.length; i++) {
			if (timesLastActive[i][0].id ===  tabId) {
				tabExists = true;
				timesLastActive[i][0] = tab;
				break;
			}
		}
		if (!tabExists) {
			chrome.tabs.get(tabId, function(tab) {
				timesLastActive.push([tab, 0]);
			} );
			setTimeout(function() {
				chrome.storage.sync.set({'times': timesLastActive})
			}, 1000)
		} else {
			chrome.storage.sync.set({'times': timesLastActive});
		}
	});
});


