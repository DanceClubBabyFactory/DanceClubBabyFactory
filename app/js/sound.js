var SoundObject = function(track){
    //private vars
    //declare private vars her
    var FFTSIZE = 32;      // number of samples for the analyser node FFT, min 32
    var RADIUS_FACTOR = 120; // the radius of the circles, factored for which ring we are drawing
    var MIN_RADIUS = 1;     // the minimum radius of each circle
    var COLOR_CHANGE_THRESHOLD = 10;    // amount of change before we change color
    var circleHue = 300;   // the base color hue used when drawing circles, which can change
    var HUE_VARIANCE = 120;  // amount hue can vary by

    var audio,
        playing,
        sound_path = 'music/',
        src = sound_path + track;
    var soundInstance;      // the sound instance we create    

    //low pass filter
    var lowPassFilter;
    var lowPassAnalyserNode;
    var lpFreqByteData, lpTimeByteData;  // arrays to retrieve data from lowPassAnalyserNode

    //band pass filter 1
    var bandPass1Filter;
    var bandPass1AnalyserNode;
    var bp1FreqByteData, bp1TimeByteData;

    //band pass filter 2
    var bandPass2Filter;
    var bandPass2AnalyserNode;
    var bp2FreqByteData, bp2TimeByteData;
    
    //high pass filter
    var highPassFilter;
    var highPassAnalyserNode;
    var hpFreqByteData, hpTimeByteData;  // arrays to retrieve data from highPassAnalyserNode

    var dataAverage = [42,42,42,42];   // an array recording data for the last 4 ticks
    var circleFreqChunk;    // The chunk of freqByteData array that is computed per circle
    var evt;

    //private funcs
    function init() {
        evt = document.createEvent('Event');
        evt.initEvent('pulse', true, true);


        if (!createjs.Sound.registerPlugin(createjs.WebAudioPlugin)) { return; }
        var manifest = [
                {
                    id: "Song",
                    src: sound_path+track
                }
            ];
         
        createjs.Sound.addEventListener("fileload", createjs.proxy(handleLoad, this));
        createjs.Sound.registerSound(src);
        audio = createjs.Sound.activePlugin;
    }

    function handleLoad(event) {
        // createjs.Sound.play("Song");
        var context = createjs.WebAudioPlugin.context;

        // attach visualizer node to our existing dynamicsCompressorNode, which was connected to context.destination
        var dynamicsNode = createjs.WebAudioPlugin.dynamicsCompressorNode;
        dynamicsNode.disconnect();  // disconnect from destination

        //init filters
        initLowPassFilter(context, dynamicsNode);
        initBandPassFilter1(context, dynamicsNode);
        initBandPassFilter2(context, dynamicsNode);
        initHighPassFilter(context, dynamicsNode);

        // calculate the number of array elements that represent each circle
        circleFreqChunk = bandPass1AnalyserNode.frequencyBinCount;
        // console.log(lowPassAnalyserNode.frequencyBinCount);
        // startPlayback();
    }

    function initLowPassFilter(context, dynamicsNode) {
        //create lowpass filter
        lowPassFilter = context.createBiquadFilter();
        lowPassFilter.type = 0; // Low-pass filter. See BiquadFilterNode docs
        lowPassFilter.frequency.value = 170; // Set cutoff to 440 HZ
        lowPassFilter.connect(context.destination);

        // create an lowpass analyser node
        lowPassAnalyserNode = context.createAnalyser();
        lowPassAnalyserNode.fftSize = FFTSIZE;  //The size of the FFT used for frequency-domain analysis. This must be a power of two
        lowPassAnalyserNode.smoothingTimeConstant = 0.85;  //A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame
        lowPassAnalyserNode.connect(lowPassFilter);  // connect to the context.destination, which outputs the audio

        dynamicsNode.connect(lowPassAnalyserNode);

        // set up the arrays that we use to retrieve the lowPassAnalyserNode data
        lpFreqByteData = new Uint8Array(lowPassAnalyserNode.frequencyBinCount);
        lpTimeByteData = new Uint8Array(lowPassAnalyserNode.frequencyBinCount);
    }

    function initBandPassFilter1(context, dynamicsNode) {
        bandPass1Filter = context.createBiquadFilter();
        bandPass1Filter.type = 2;
        bandPass1Filter.frequency.value = 345;
        bandPass1Filter.Q = 165;
        bandPass1Filter.connect(context.destination);

        bandPass1AnalyserNode = context.createAnalyser();
        bandPass1AnalyserNode.fftSize = FFTSIZE;  //The size of the FFT used for frequency-domain analysis. This must be a power of two
        bandPass1AnalyserNode.smoothingTimeConstant = 0.85;  //A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame
        bandPass1AnalyserNode.connect(bandPass1Filter);  // connect to the context.destination, which outputs the audio

        dynamicsNode.connect(bandPass1AnalyserNode);

        // set up the arrays that we use to retrieve the bandPass1AnalyserNode data
        bp1FreqByteData = new Uint8Array(bandPass1AnalyserNode.frequencyBinCount);
        bp1TimeByteData = new Uint8Array(bandPass1AnalyserNode.frequencyBinCount);
    }

    function initBandPassFilter2(context, dynamicsNode) {
        bandPass2Filter = context.createBiquadFilter();
        bandPass2Filter.type = 2;
        bandPass2Filter.frequency.value = 1250;
        bandPass2Filter.Q = 750;
        bandPass2Filter.connect(context.destination);

        bandPass2AnalyserNode = context.createAnalyser();
        bandPass2AnalyserNode.fftSize = FFTSIZE;  //The size of the FFT used for frequency-domain analysis. This must be a power of two
        bandPass2AnalyserNode.smoothingTimeConstant = 0.85;  //A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame
        bandPass2AnalyserNode.connect(bandPass2Filter);  // connect to the context.destination, which outputs the audio

        dynamicsNode.connect(bandPass2AnalyserNode);

        // set up the arrays that we use to retrieve the bandPass1AnalyserNode data
        bp2FreqByteData = new Uint8Array(bandPass2AnalyserNode.frequencyBinCount);
        bp2TimeByteData = new Uint8Array(bandPass2AnalyserNode.frequencyBinCount);
    }

    function initHighPassFilter(context, dynamicsNode) {
        //create highpass filter
        highPassFilter = context.createBiquadFilter();
        highPassFilter.type = 1; // Low-pass filter. See BiquadFilterNode docs
        highPassFilter.frequency.value = 2000;
        highPassFilter.connect(context.destination);

        // create an highpass analyser node
        highPassAnalyserNode = context.createAnalyser();
        highPassAnalyserNode.fftSize = FFTSIZE;  //The size of the FFT used for frequency-domain analysis. This must be a power of two
        highPassAnalyserNode.smoothingTimeConstant = 0.85;  //A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame
        highPassAnalyserNode.connect(highPassFilter);  // connect to the context.destination, which outputs the audio

        dynamicsNode.connect(highPassAnalyserNode);

        // set up the arrays that we use to retrieve the highPassAnalyserNode data
        hpFreqByteData = new Uint8Array(highPassAnalyserNode.frequencyBinCount);
        hpTimeByteData = new Uint8Array(highPassAnalyserNode.frequencyBinCount);
    }

    function updateAnalysers() {
        lowPassAnalyserNode.getByteFrequencyData(lpFreqByteData);  // this gives us the frequency
        lowPassAnalyserNode.getByteTimeDomainData(lpTimeByteData);  // this gives us the waveform

        bandPass1AnalyserNode.getByteFrequencyData(bp1FreqByteData);
        bandPass1AnalyserNode.getByteTimeDomainData(bp1TimeByteData);

        bandPass2AnalyserNode.getByteFrequencyData(bp2FreqByteData);
        bandPass2AnalyserNode.getByteTimeDomainData(bp2TimeByteData);

        highPassAnalyserNode.getByteFrequencyData(hpFreqByteData);
        highPassAnalyserNode.getByteTimeDomainData(hpTimeByteData);
    }

    function startPlayback() {
        playing = true;
        if (soundInstance)
            soundInstance.play();
        else
            soundInstance = createjs.Sound.play(src);
    }

    function stopPlayback() {
        playing = false;
        soundInstance.pause();
    }

    //public funs
    this.playPause = function() {
        if (playing)
            stopPlayback();
        else
            startPlayback();
    };

    this.setVolume = function(value) {
        soundInstance.setVolume(value);
    };

    this.tick = function() {
        if(playing) {
            updateAnalysers();
            
            var lastRadius = 0;  // we use this to store the radius of the last circle, making them relative to each other
            var freqSum = 0;
            var timeSum = 0;

            for(var x = circleFreqChunk; x; x--) {
                var index = circleFreqChunk-x;
                freqSum += lpFreqByteData[index];
                timeSum += lpTimeByteData[index];
            }
            freqSum = freqSum / circleFreqChunk / 255;  // gives us a percentage out of the total possible value
            timeSum = timeSum / circleFreqChunk / 255;  // gives us a percentage out of the total possible value
            // NOTE in testing it was determined that i 1 thru 4 stay 0's most of the time

            // draw circle
            lastRadius += freqSum*RADIUS_FACTOR + MIN_RADIUS;

            // update our dataAverage, by removing the first element and pushing in the new last element
            dataAverage.shift();
            dataAverage.push(lastRadius);

            // get our average data for the last 3 ticks
            var dataSum = 0;
            for(var i = dataAverage.length-1; i; i--) {
                dataSum += dataAverage[i-1];
            }
            dataSum = dataSum / (dataAverage.length-1);

            // calculate latest change
            var dataDiff = dataAverage[dataAverage.length-1] - dataSum;

            // change color based on large enough changes
            if(dataDiff>COLOR_CHANGE_THRESHOLD || dataDiff<COLOR_CHANGE_THRESHOLD) {
                circleHue = circleHue + dataDiff;
               
            }
            // gameObject.getBackground().setFlareColor(hslToRgb((HUE_VARIANCE+circleHue)%360, 50, 10));
            gameObject.getBackground().setFlareChangeInRadius(dataDiff);
            console.log(dataDiff);
            evt.dataDiff = dataDiff;
            document.dispatchEvent(evt);
        }
    };

    function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    function hslToRgb(h, s, l){
        var r, g, b;

        if(s === 0){
            r = g = b = l; // achromatic
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [r * 255, g * 255, b * 255];
    }

    init();
};