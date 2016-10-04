document.getElementById('network').width = window.innerWidth;
document.getElementById('network').height = window.innerHeight;

var canvas = document.getElementById('network');
var canvasContext = canvas.getContext('2d');
canvasContext.fillStyle = '#333';
canvasContext.strokeStyle = '#FFF';

var APs = {};

var socket = io('//:3000');

socket.on('AP', function (AP) {

	if (typeof APs[AP.mac] === 'undefined') {

		AP.position = {
			x: getRandomArbitrary(60, canvas.width-60),
			y: getRandomArbitrary(60, canvas.height-60)
		};

		AP.rotate = 0;

		APs[AP.mac] = AP;

		APs[AP.mac].clients = {};
	}
	else {
		var clients = APs[AP.mac].clients;
		var position = APs[AP.mac].position;

		APs[AP.mac] = AP;
		APs[AP.mac].clients = clients;
		APs[AP.mac].position = position;
	}

});

socket.on('client', function (client) {
	if (typeof APs[client.AP] === "undefined") {
		//drawNode(client);
		return;
	}

	APs[client.AP].clients[client.mac] = client;
});

function draw() {
	requestAnimationFrame(draw);
	render();
}
draw();


function render() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);

	for (var APMac in APs) {
		var AP = APs[APMac];
		drawAPClients(AP);
		drawAP(AP);
	}
}

function drawAP(AP) {

	// Set the node (and connecting line) colour based on the time the node was last seen
	let nodeColour = '#FFFFFF';
	if (AP.active !== true) {
		nodeColour = '#777777';
	}

	// Draw the node
	canvasContext.save();
	canvasContext.beginPath();
	canvasContext.translate(AP.position.x, AP.position.y);
	canvasContext.rotate(toRadians(AP.rotate));
	canvasContext.rect(-AP.size/2, -AP.size/2, AP.size, AP.size);
	canvasContext.strokeStyle = nodeColour;
	canvasContext.stroke();
	canvasContext.fill();
	canvasContext.closePath();
	canvasContext.restore();

}

function drawAPClients(AP) {

	var clientCount = Object.keys(AP.clients).length;

	if (clientCount === 0) {
		return;
	}

	var clientNodeDistance = 58;
	var angleDeg = (360 / clientCount);

	var i = 0;
	for (var clientMac in AP.clients) {

		var client = AP.clients[clientMac];
		var angle = (angleDeg * i++) - 90;

		client.position = {
			x: AP.position.x + (clientNodeDistance * Math.cos(toRadians(angle))),
			y: AP.position.y + (clientNodeDistance * Math.sin(toRadians(angle)))
		};

		linkNodes(AP, client);

		// Set the node (and connecting line) colour based on the time the node was last seen
		let nodeColour = '#FFFFFF';
		if (client.active !== true) {
			nodeColour = '#777777';
		}

		var w = client.size;
		var h = w * (Math.sqrt(3)/2);

		// Draw the node
		canvasContext.save();
		canvasContext.beginPath();
		canvasContext.translate(client.position.x, client.position.y);
		canvasContext.rotate(toRadians(client.rotate));
		canvasContext.strokeStyle = nodeColour;
		canvasContext.moveTo(0, (-2/3)*h);
		canvasContext.lineTo(w / 2, h / 3);
		canvasContext.lineTo(-w / 2, h / 3);
		canvasContext.closePath();
		canvasContext.stroke();
		canvasContext.fill();
		canvasContext.restore();
	}

}

function linkNodes(node, linkToNode) {

	let linkColour = '#FFFFFF';
	if (node.active !== true || linkToNode.active !== true) {
		linkColour = '#777777';
	}
	canvasContext.beginPath();
	canvasContext.moveTo(linkToNode.position.x, linkToNode.position.y);
	canvasContext.lineTo(node.position.x, node.position.y);
	canvasContext.strokeStyle = linkColour;
	canvasContext.stroke();
	canvasContext.closePath();
}

function drawHTMLNode(node) {

	if (node.hasHTMLElement === true) {
		return;
	}

	var elem = $('<div/>')
		.css({position: 'absolute', left: node.position.x, top: node.position.y, width: node.size, height: node.size, cursor: 'pointer'})
		.attr('title', node.SSID)
		.attr('id', 'MAC'+node.mac);
	$('#networkNodeMap').append(elem);

	document.addEventListener('dragexit', function(e) {
		var node = nodeLookup[this.getAttribute('id')];

		console.log(node);

		node.position = {
			x: e.pageX,
			y: e.pageY
		};

		drawAllNodes();
	}, false);

	node.hasHTMLElement = true;

}

function toRadians (angle) {
	return angle * (Math.PI / 180);
}

function getRandomArbitrary(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
