var AudioPlayerObject = function(){
    //private vars
    //declare private vars her
    var playButton,
        settingsButton,
        audioControlsOpen = false,
        stopped = true,
        playing = false,
        instance = this;

    var track = {
        artist: 'Flight Facilities',
        title: 'Crave You (Adventure Club Dubstep Remix)',
        src: 'Flight Facilities - Crave You (Adventure Club Dubstep Remix).mp3',
        cover: 'Ratatat-Classics.png'
    };

    //private funcs
    function init() {
        setSongInfo(track);
        playButton = $('#playButton');
        playButton.click(playButtonHandler);

        settingsButton = $('#settingsButton');
        settingsButton.click(settingsButtonHandler);

        //hook into volume slider
        $('#volumeSlider').change(setVolume);
        $('.onoffswitch-checkbox').change(switchHandler);
        document.addEventListener("upKey", increaseVolume, false);
        document.addEventListener("downKey", decreaseVolume, false);
        document.addEventListener("spaceKey", playButtonHandler, false);
    }
    
    this.countingDown = false;
    function playButtonHandler(event) {
        if (stopped) {
            $('#winState').hide();
            gameObject.resetGame();
            document.getElementById("instructions").style.display = "none";
            gameObject.getHud().renderStartTimer();
        } else {
            if (!instance.countingDown) {
                sound.playPause();
                if(playing) {
                    playing = false;
                    gameObject.pause();
                    playButton.children().removeClass('glyphicon-pause')
                                         .addClass('glyphicon-play');
                } else {
                    playing = true;
                    gameObject.resume();
                    playButton.children().removeClass('glyphicon-play')
                                         .addClass('glyphicon-pause');
                }
            }
        }
        stopped = false;
    }

    function switchHandler(event) {
        if (event.target.id === 'lowPassSwitch') {
            console.log('low pass switch');
            sound.toggleLowPassFilter();
        } else if (event.target.id === 'bandPass1Switch') {
            console.log('band pass 1 switch');
            sound.toggleBandPass1Filter();
        } else if (event.target.id === 'bandPass2Switch') {
            console.log('band pass 2 switch');
            sound.toggleBandPass2Filter();
        } else if (event.target.id === 'highPassSwitch') {
            console.log('high pass switch');
            sound.toggleHighPassFilter();
        }
    }

    function settingsButtonHandler(event) {
        var audioControlsPane = $('.audioControlsPane')[0];
        if(audioControlsOpen) {
            audioControlsPane.style.opacity = 0;
            audioControlsOpen = false;
        } else {
            audioControlsPane.style.opacity = 1;
            audioControlsOpen = true;
        }
    }

    function setVolume(event) {
        if(playing) {
            if(10 < event.target.value) {
                volumeModifier = event.target.value;
            } else {
                volumeModifier = 10;
            }
            sound.setVolume(volumeModifier/100);
        }
    }

    function increaseVolume(event) {
        if(playing) {
            if(volumeModifier < 100) {
                volumeModifier += 10;
            } else {
                volumeModifier = 100;
            }
            sound.setVolume(volumeModifier/100);
            $('#volumeSlider').val(volumeModifier);
        }
    }

    function decreaseVolume(event) {
        if(playing) {
            if(volumeModifier > 10) {
                volumeModifier -= 10;
            } else {
                volumeModifier = 10;
            }
            sound.setVolume(volumeModifier/100);
            $('#volumeSlider').val(volumeModifier);
        }
    }

    function setSongInfo(track) {
        $('#songTitle').text(track.title);
        $('#songArtist').text(track.artist);
        $('.albumCover')[0].src = '../music/covers/' + track.cover;
    }

    //public funs
    this.tick = function() {
        sound.tick();
    };
    
    this.isPlaying = function() {
        return playing;
    };
    
    this.stopPlayback = function() {
        var enterEasing = setInterval(function() {
            speedModifier = speedModifier*0.95;
            if (speedModifier < 0.1) {
                speedModifier = 1;
                clearInterval(enterEasing);
                sound.stop();
                instance.getSound().getSiren().volume = 0;
                createjs.Sound.play("Rewind");
            }
            gameObject.getAudioPlayer().getSound().getSong().LOLaudio.playbackRate.value = speedModifier;
        }, 10);
        playing = false;
        stopped = true;
        playButton.children().removeClass('glyphicon-pause')
                             .addClass('glyphicon-play');
    };

    this.getSound = function() {
        return sound;
    };

    this.play = function() {
        playButtonHandler();
    };
    
    init();
};
