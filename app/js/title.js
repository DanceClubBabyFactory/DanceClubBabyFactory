var TitleObject = function(new_stage){
    var instr1, instr2;
    var titleBackgroundInterval;
    var song;
    var loadingMeter, loadingMeterBackground;

    //private funcs
    function init() {
        $('.HUD').hide();

        titleBackgroundInterval = setInterval(function() {
            var juice = new JuicySplosion({x: (Math.random() * CONSTANTS.WIDTH), y: (Math.random() * CONSTANTS.HEIGHT)}, 100 * Math.random(), getRandomColorWithOpacity(1.0));
        }, 40);

        initLoadingMeter();

        loadQueue = new createjs.LoadQueue();
        sound = new SoundObject();
        loadQueue.installPlugin(createjs.Sound);
        var manifest = [
            {
                id: "gameSong",
                src: "music/Delusional Confusion, Welcome.mp3"
            },
            {
                src: "music/rewind_sound.mp3",
                id: "Rewind"
            }/*,
            {
                src: "music/siren_sound.mp3",
                id: "Siren"
            }*/
        ];
        loadQueue.loadManifest(manifest, true);

        $(".titlePlayButton").click(handlePlayButton);
        $(".tutorialButton").click(change_stage);
        createjs.Ticker.addEventListener('tick', tick);
        stage.update();
    }

    function tick() {
        if(!loadQueue.loaded)
            fileProgress(loadQueue.progress);
        else 
            handleComplete(loadQueue.getItem("gameSong"));
        stage.update();
    }

    function initLoadingMeter() {
        loadingMeterBackground = new createjs.Shape();
        loadingMeterBackground.x = CONSTANTS.WIDTH/2 - 200;
        loadingMeterBackground.y = 250;
        loadingMeterBackground.graphics.beginFill("#FFF").drawRect(0, 0, 400, 40);
        stage.addChild(loadingMeterBackground);

        loadingMeter = new createjs.Shape();
        loadingMeter.x = CONSTANTS.WIDTH/2 - 200;
        loadingMeter.y = 250;
        loadingMeter.graphics.beginFill("#ff00ef").drawRect(0, 0, 400, 40);
        loadingMeter.scaleX = 0;
        stage.addChild(loadingMeter);
    }

    function handlePlayButton() {
        clearInterval(titleBackgroundInterval);
        change_stage();
        document.getElementById("instructions").style.display = "none";
        gameObject.getAudioPlayer().playHandler();
    }

    function handleComplete(songFile) {
        stage.removeChild(loadingMeter);
        stage.removeChild(loadingMeterBackground);
        song = songFile;
        $('#titleMenu').show();
    }

    function fileProgress(progress) {
        createjs.Tween.get(loadingMeter).to({scaleX: progress, scaleY: 1}, 100, createjs.Ease.quartIn);
    }

    function change_stage() {
        clearInterval(titleBackgroundInterval);
        $('#titleState').hide();
        $('.HUD').show();
        $('.audioControlsPane').show();
        stage.removeAllChildren();
        new_stage();
        stage.update();
    }

    init();
};
