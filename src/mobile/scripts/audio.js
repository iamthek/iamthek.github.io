var audio = {
    isFirstPlay:true,
    playTime:0,
	analyser: {},
	buffer: {},
	buffer_effects: {},
	compatibility: {},
	convolver: {},
	effects: [],
	files: [],
	gain: {},
	gain_loop: {},
	gain_once: {},
	message: {
		quote: ["I like audio loops... better than I like you.<br>~ Dr. McCoy to Spock", "There is the theory of the mobius, a twist in the fabric of space where time becomes a loop...<br>~ Worf", "Hey doll, is this audio boring you? Come and talk to me. I'm from a different planet.<br>~ Zaphod Beeblebrox", "I need your headphones, your record player and your glowsticks.<br>~ Arnold Schwarzenegger", "I'm the synthesizer. Are you the keymaster?<br>~ Sigourney Weaver", "Flash? Where we're going, we don't need flash.<br>~ Doc Brown", "I'll be history.back()<br>~ Arnold Schwarzenegger", "I don't want one loop, I want all loops!<br>~ Ruby Rhod", "If it reads, we can stream it.<br>~ Arnold Schwarzenegger"],
		quote_last: -1
	},
	pause_vis: true,
	playing: 0,
	proceed: true,
	source_loop: {},
	source_once: {},
	volume_fade_time: .7
};
audio.findSync = function (n) {
	var current = 0,offset = 0;
    if(audio.isFirstPlay){
    return offset;
    }
    else{
        var duration = audio.buffer[n].duration;
		offset = audio.playTime % duration;
	return offset;
    }
};
audio.message.random = function () {
	var num;
	do {
		num = Math.floor(Math.random() * audio.message.quote.length)
	} while (num === audio.message.quote_last);
	audio.message.quote_last = num;
	return audio.message.quote[num]
};
audio.play = function (n, playOnly) {
	if (audio.source_loop[n]._playing) {  
		if (!playOnly) {
			audio.stop(n)
        }
	} else {
		audio.source_loop[n] = audio.context.createBufferSource();
		audio.source_loop[n].buffer = audio.buffer[n];
		audio.source_loop[n].connect(audio.gain_loop[n]);
		audio.source_loop[n].loop = true;
        var offset = audio.findSync(n);
		if (audio.compatibility.start === "noteOn") {
			audio.source_once[n] = audio.context.createBufferSource();
			audio.source_once[n].buffer = audio.buffer[n];
			audio.source_once[n].connect(audio.gain_once[n]);
			audio.source_once[n].noteGrainOn(0, offset, audio.buffer[n].duration - offset);
			audio.gain_once[n].gain.setValueAtTime(0, audio.context.currentTime);
			audio.gain_once[n].gain.linearRampToValueAtTime(1, audio.context.currentTime + audio.volume_fade_time);
			audio.source_loop[n][audio.compatibility.start](audio.context.currentTime + (audio.buffer[n].duration - offset))
		} else {
			audio.source_loop[n][audio.compatibility.start](0, offset)
		}
		audio.gain_loop[n].gain.setValueAtTime(0, audio.context.currentTime);
		audio.gain_loop[n].gain.linearRampToValueAtTime(1, audio.context.currentTime + audio.volume_fade_time);
		audio.source_loop[n]._playing = true;
		audio.playing = audio.playing + 1;
		if (audio.playing === 1) {
			audio.pause_vis = false;
			drawSpectrum();
		}
	}
};
audio.playAll = function () {
	for (var a in audio.source_loop) {
		audio.play(a, true)
	}
};
audio.stop = function (n) {
	if (audio.source_loop[n]._playing && !audio.source_loop[n]._stopping) {
        audio.isFirstPlay=false;
        audio.playTime = audio.context.currentTime;
		audio.source_loop[n]._stopping = true;
		audio.source_loop[n][audio.compatibility.stop](audio.context.currentTime + audio.volume_fade_time);
		if (audio.compatibility.start === "noteOn") {
			audio.source_once[n][audio.compatibility.stop](audio.context.currentTime + audio.volume_fade_time);
			audio.gain_once[n].gain.setValueAtTime(1, audio.context.currentTime);
			audio.gain_once[n].gain.linearRampToValueAtTime(0, audio.context.currentTime + audio.volume_fade_time)
		}(function () {
			var num = n;
			setTimeout(function () {
				audio.source_loop[num]._playing = false;
				audio.source_loop[num]._stopping = false
			}, audio.volume_fade_time * 100)
		})();
		audio.gain_loop[n].gain.setValueAtTime(1, audio.context.currentTime);
		audio.gain_loop[n].gain.linearRampToValueAtTime(0, audio.context.currentTime + audio.volume_fade_time);
		
		audio.playing = audio.playing - 1;
		if (audio.playing === 0) {
			setTimeout(function () {
				if (audio.playing === 0) {
					audio.pause_vis = true;
				}
			}, 5e3)
		}
	}
};
audio.stopAll = function () {
	for (var a in audio.source_loop) {
		audio.stop(a)
	}
};
try {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audio.context = new window.AudioContext
} catch (e) {
	audio.proceed = false;
	alert("Web Audio API not supported in this browser.")
}
if (audio.proceed) {
	(function () {
		var name = "createGain";
		if (typeof audio.context.createGain !== "function") {
			name = "createGainNode"
		}
		audio.compatibility.createGain = name
	})();
	(function () {
		var start = "start",
			stop = "stop",
			buffer = audio.context.createBufferSource();
		if (typeof buffer.start !== "function") {
			start = "noteOn"
		}
		audio.compatibility.start = start;
		if (typeof buffer.stop !== "function") {
			stop = "noteOff"
		}
		audio.compatibility.stop = stop
	})();
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
	audio.gain.booster = audio.context[audio.compatibility.createGain]();
	audio.gain.booster.gain.value = 3;
	audio.convolver = audio.context.createConvolver();
	audio.convolver.connect(audio.gain.booster);
	audio.gain.collapse = audio.context[audio.compatibility.createGain]();
	var img = new Image;
img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAE0lEQVQoU2MM/sLMgBswjkpjAwCHiQzv8K89BwAAAABJRU5ErkJggg==";
	var canvas_div = document.getElementById("vis-div");
	var canvas = document.getElementById("vis");
	//canvas.height = canvas_div.offsetHeight;
	//canvas.width = canvas_div.offsetWidth;
	var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;

	function drawSpectrum() {
		audio.analyser.getByteFrequencyData(audio.frequencyData);
		var bar_width = Math.ceil(canvas.width / (audio.analyser.frequencyBinCount * .85));
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var freq, x, y, w, h;
		ctx.fillStyle = ctx.createPattern(img, "repeat");
		for (var i = 0; i < audio.analyser.frequencyBinCount; i++) {
			freq = audio.frequencyData[i] || 0;
			x = bar_width * i;
			if (x + bar_width < canvas.width) {
				y = canvas.height;
				w = bar_width - 1;
				h = -(Math.floor(freq / 255 * canvas.height) + 1);
				ctx.fillRect(x, y, w, h)
			}
		}
		if (!audio.pause_vis) {
			requestAnimationFrame(drawSpectrum)
		} else {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
		}
	}
	audio.analyser = audio.context.createAnalyser();
	audio.analyser.smoothingTimeConstant = .85;
	audio.analyser.fftSize = 256;
	audio.frequencyData = new Uint8Array(audio.analyser.frequencyBinCount);
 
	audio.gain.master = audio.context[audio.compatibility.createGain]();
	audio.gain.master.gain.value = .8649;
	audio.gain.master.connect(audio.analyser);
	audio.gain.master.connect(audio.context.destination);
	audio.gain.collapse.connect(audio.gain.master);

}