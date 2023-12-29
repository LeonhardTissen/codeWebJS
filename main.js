const inputcode = document.getElementById('inputcode');
const outputcode = document.getElementById('outputcode');
const output = document.getElementById('output');
const inpvar = document.getElementById('inpvar');

inputcode.oninput = updateCode;
function updateCode() {
	outputcode.classList.remove('prettyprinted');
	outputcode.innerHTML = inputcode.value;
	PR.prettyPrint();
}
updateCode();

function canvas(width, height) {
	const cvs = document.createElement('canvas');
	cvs.width = width;
	cvs.height = height;
	const ctx = cvs.getContext('2d');
	return [cvs, ctx];
}
let can_run = true;
function image(src) {
	return new Promise(async (resolve, reject) => {
		const img = new Image();
		can_run = false;
		img.src = src;
		img.onload = () => {
			can_run = true;
			resolve(img);
		}
		img.onerror = (err) => {
			can_run = true;
			reject(err);
		}
	});
}
let gif_speed = 100;
function gifspeed(ms) {
	gif_speed = ms;
}

function sendMsg(msg, color) {
	const p = document.createElement('p');
	p.innerText = msg;
	p.style.color = color;
	output.appendChild(p);
}

console.log = function(msg) {
	sendMsg(msg, 'white')
}

console.error = function(msg) {
	sendMsg(msg, 'red')
}

console.post = function(cvs) {
	const bcvs = document.createElement('canvas');
	const bctx = bcvs.getContext('2d');
	bcvs.width = cvs.width;
	bcvs.height = cvs.height;
	bctx.drawImage(cvs, 0, 0, cvs.width, cvs.height);
	output_cvs.push(bcvs);
}

function run() {
	output.innerText = '';

	output_cvs = [];

	console.warn(output_cvs);

	try {
		eval(`let inp = "${inpvar.value}"; ${inputcode.value}`);
	} catch (err) {
		sendMsg(err, 'red');
	}

	let try_interval = setInterval(() => {
		if (can_run) {
			if (output_cvs.length > 0) {
				showCanvas(output_cvs);
			}
			clearInterval(try_interval);
		}
	}, 10);
}

let cvs_index = 0;
let cvs_interval = null;
function showCanvas(output_cvs) {
	clearInterval(cvs_interval);
	cvs_index = 0;

	const gifcvs = document.createElement('canvas');
	gifcvs.width = output_cvs[0].width;
	gifcvs.height = output_cvs[0].height;
	const gifctx = gifcvs.getContext('2d');
	output.appendChild(gifcvs);
	
	cvs_interval = setInterval(() => {
		gifctx.fillStyle = 'black';
		gifctx.fillRect(0, 0, gifcvs.width, gifcvs.height);

		gifctx.drawImage(output_cvs[cvs_index], 0, 0, gifcvs.width, gifcvs.height);

		cvs_index ++;
		if (cvs_index >= output_cvs.length) {
			cvs_index = 0;
		}
	}, gif_speed)
}

function scrollCode() {
	outputcode.scrollLeft = inputcode.scrollLeft;
	outputcode.scrollTop = inputcode.scrollTop;
	fixScroll();
}

function fixScroll() {
	inputcode.scrollTop = Math.min(inputcode.scrollTop, outputcode.scrollTop);
	inputcode.scrollLeft = Math.min(inputcode.scrollLeft, outputcode.scrollLeft);
}
inputcode.onscroll = scrollCode;

const nameQuery = new URLSearchParams(window.location.search).get('function');
if (nameQuery) {
	fetch(`https://warze.org/codebot/get?function=${nameQuery}`)
		.then(res => res.text())
		.then(code => {
			code = code.replace(/\\n/g, '\n').replaceAll('\\"', '"');
			inputcode.value = code;
			updateCode();
		});
}
