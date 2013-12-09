var TitleObject = function(new_stage){
    var box, title, instr1, instr2, button, start, yay;
    var recordOutline, recordTracks, recordLabel;

    //private funcs
    function init() {
        $('.HUD').hide();
        drawRecordOutline();
        drawRecordTracks();
        drawRecordLabel();
        drawTitle();
        drawLoadingText();
        drawInstructions();
        preload_songs();
    }

    function drawRecordOutline() {
        recordOutline = new createjs.Shape();
        recordOutline.graphics.beginStroke('#ffffff')
            .setStrokeStyle(8)
            .arc(CONSTANTS.WIDTH/4, CONSTANTS.HEIGHT/2, 250, 0, 2 * Math.PI);
        recordOutline.cache(CONSTANTS.WIDTH/4 - 260, CONSTANTS.HEIGHT/2 - 260, 520, 520);

        stage.addChild(recordOutline);
    }

    function drawRecordTracks() {
        for (var i = 100; i < 248; i += 4) {
            recordTracks = new createjs.Shape();
            if(i%18 === 0) {
                recordTracks.graphics.beginStroke('#111111')
                    .setStrokeStyle(4)
                    .arc(CONSTANTS.WIDTH/4, CONSTANTS.HEIGHT/2, i, 0, 2 * Math.PI);
            } else {
                recordTracks.graphics.beginStroke('#333333')
                    .setStrokeStyle(1)
                    .arc(CONSTANTS.WIDTH/4, CONSTANTS.HEIGHT/2, i, 0, 2 * Math.PI);
            }
            recordTracks.cache(CONSTANTS.WIDTH/4 - 260, CONSTANTS.HEIGHT/2 - 260, 520, 520);

            stage.addChild(recordTracks);
        }
    }

    function drawRecordLabel() {
        recordLabel = new createjs.Shape();
        recordLabel.graphics.beginStroke('#6e2bff')
            .setStrokeStyle(80)
            .arc(CONSTANTS.WIDTH/4, CONSTANTS.HEIGHT/2, 30, 0, 2 * Math.PI);
        recordLabel.cache(CONSTANTS.WIDTH/4 - 260, CONSTANTS.HEIGHT/2 - 260, 520, 520);

        stage.addChild(recordLabel);
    }

    function drawLoadingText() {
        yay = new createjs.Text("loading..",
                                "bold 65px Helvetica",
                                "#FFFFFF");

        // yay.alpha = 0.2;
        yay.x = CONSTANTS.WIDTH / 2;
        yay.y = CONSTANTS.HEIGHT / 4;
        yay.textBasline = "alphabetic";
        stage.addChild(yay);
    }

    function drawTitle() {
        title = new createjs.Text("the\ninfinite\ndubstep\nbaby\nfactory",
                                  "bold 75px Helvetica",
                                  "#00CCFF");
        title.alpha = 1.0;
        title.textAlign = "center";
        title.textBaseline = "middle";
        title.x = CONSTANTS.WIDTH/4;
        title.y = CONSTANTS.HEIGHT/4;
        stage.addChild(title);
    }

    function drawInstructions() {
        instructionTitle = new createjs.Text("instructions:",
                                   "bold 25px Helvetica",
                                   "#FFFFFF");
        instructionTitle.x = CONSTANTS.WIDTH / 2 + 20;
        instructionTitle.y = CONSTANTS.HEIGHT / 2 - 30;
        instructionTitle.textBaseline = "alphabetic";
        stage.addChild(instructionTitle);

        instructionText = new createjs.Text("throw the craziest party in town while\n" +
                             "running your illegal, for-profit orphanage\n\n" +
                             "catch the stars as they shoot to the beat of the music\n" +
                             "miss too many of them and the cops will shut you down\n" +
                             "use your stars to purchase powerups\n\n" +
                             "increase the volume to increase the difficulty\n" +
                             "the louder the party, the more partiers will come\n\n" + // need to implement this
                             "partiers will produce babies for you, which means profit!",
                            "20px Helvetica",
                            "#FFFFFF");
        instructionText.x = CONSTANTS.WIDTH / 2 + 40;
        instructionText.y = CONSTANTS.HEIGHT / 2;
        instructionText.lineHeight = 24;
        instructionText.textBaseline = "alphabetic";
        stage.addChild(instructionText);
    }

    function change_stage() {
        $('.HUD').show();
        $('.audioControlsPane').show();
        stage.removeAllChildren();
        new_stage();
        stage.update();
    }

    function preload_songs() {
      preloaded_songs = {};
      preloaded_songs['Flight Facilities - Crave You (Adventure Club Dubstep Remix).mp3'] = new SoundObject('Flight Facilities - Crave You (Adventure Club Dubstep Remix).mp3');
    }

    this.makeReadyForStart = function() {
        var button = new createjs.Shape();
        button.x = CONSTANTS.WIDTH / 2 - 10;
        button.y = CONSTANTS.HEIGHT / 4;
        button.graphics
              .beginStroke('#00CCFF')
              .setStrokeStyle(5)
              .beginFill('#6e2bff')
              .drawRoundRect(0,
                             0,
                             175,
                             80,
                             10);
        stage.addChild(button);
        yay.text = "play!";
        stage.setChildIndex(yay, stage.getNumChildren()-1);
        yay.addEventListener("click", function() {
            change_stage();
            gameObject.getHud().renderStartTimer();
            document.getElementById("instructions").style.display = "none";
        });

        button.addEventListener("click", function() {
            change_stage();
            gameObject.getHud().renderStartTimer();
            document.getElementById("instructions").style.display = "none";
        });
        
        var tutbutton = new createjs.Container();
        tutbutton.x = CONSTANTS.WIDTH / 2 + 220;
        tutbutton.y = CONSTANTS.HEIGHT / 4;
        var box = new createjs.Shape();
        box.graphics
            .beginStroke('#00CCFF')
            .setStrokeStyle(5)
            .beginFill('#6e2bff')
            .drawRoundRect(0,
                           0,
                           200,
                           80,
                           10);
        tutText = new createjs.Text("Tutorial",
                                "bold 48px Helvetica",
                                "#FFFFFF");
        tutText.textBaseline = "alphabetic";
        tutText.x = 10;
        tutText.y = 56;
        tutbutton.addChild(box);
        tutbutton.addChild(tutText);
        stage.addChild(tutbutton);
    };

    this.progress = function() {
        yay.text = yay.text + ".";
    };

    init();
};
