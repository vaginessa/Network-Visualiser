var csv = require('csv-parser');
var fs = require('fs');

var nodeData = [];

var associated = 0;
var unassociated = 0;

function getRandomIntInclusive(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

fs.createReadStream('airmondata')
	.pipe(csv())
	.on('data', function(data) {

		// Remove unassociated clients
		if (data[' BSSID'] === ' (not associated) ') {
			unassociated++;
			return;
		}

		associated++;

		if(typeof nodeData[data[' BSSID']] === 'undefined') {
			nodeData[data[' BSSID']] = {
				"name": data[' BSSID'],
				"position": {
					"x": getRandomIntInclusive(25,1200),
					"y": getRandomIntInclusive(25,900)
				},
				"size": 10,
				"subnodes": []
			};
		}

		nodeData[data[' BSSID']].subnodes.push({
			"name": data['Station MAC'],
			"size": 5,
			"distance": (Math.max((1-data[' Power']),25))});
	})
	.on('end', function() {

		var cleanData = [];

		Object.keys(nodeData).forEach(function(key) {
			var val = nodeData[key];
			cleanData.push(val);
		});

		var allData = [];

		allData.push({
			"name": "WLAN9",
			"position": {
				"x": 600,
				"y": 300
			},
			"size": 20,
			"subnodes": cleanData
		});

		console.log('APs: '+cleanData.length);
		console.log('Associated Clients: '+associated);
		console.log('Unassociated Clients: '+unassociated);

		fs.writeFile('nodes.json', JSON.stringify(allData), { flags: '+w' }, function (err) {
			if (err !== null) {
				console.error(err);
				throw err;
			}
		});

	});
