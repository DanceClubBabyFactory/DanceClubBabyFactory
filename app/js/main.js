var GameObject = function() {
    //private vars
    var sound,
        audioPlayer,
        background,
        door,
        babyRepo,
        goerGen,
        projectiles,
        title;

    //private funcs
    function init() {
        canvas = document.createElement('canvas');

        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight;
        CONSTANTS.WIDTH = window.innerWidth * 0.8;
        CONSTANTS.HEIGHT = window.innerHeight;

        canvas.setAttribute('id', 'c');

        document.body.appendChild(canvas);
        stage = new createjs.Stage(canvas);
        stage.mouseEventsEnabled = true;

        window.onresize = function() {
            onResize();
        };

        if(!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', title_tick);
        }
        createjs.Ticker.setFPS(30);

        background = new BackgroundObject();

        title = new TitleObject(game);
    }

    function title_tick() {
      stage.update();
    }

    function game() {
        var new_stage = new createjs.Stage(canvas);
        new_stage.mouseEventsEnabled = true;

        window.onresize = function() {
            onResize();
        };

        if(!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', tick);
        }
        createjs.Ticker.setFPS(30);

        //init audio player
        audioPlayer = new AudioPlayerObject();

        //init background
        background = new BackgroundObject();

        //init projectiles
        projectiles = new ProjectileGeneratorObject();

        //init baby repo
        babyRepo = new BabyRepoObject();

        //init door
        door = new DoorObject();

        //init party goers
        goerGen = new PartyGoerGenObject();

        new_stage.addEventListener("pressmove", mousePressMoveHandler);
        new_stage.addEventListener("click", mouseClickHandler);
        return new_stage;
    }

    //same as perform_logic() in zenilib
    function tick() {
        audioPlayer.tick();
        stage.update();
        goerGen.tick();
        projectiles.tick();
    }

    function onResize() {
        // browser viewport size
        var w = window.innerWidth * 0.8;
        var h = window.innerHeight;

        // stage dimensions
        var ow = CONSTANTS.WIDTH;
        var oh = CONSTANTS.HEIGHT;
       
        // keep aspect ratio
        var scale = Math.min(w / ow, h / oh);
        stage.scaleX = scale;
        stage.scaleY = scale;

        stage.canvas.width = ow * scale;
        stage.canvas.height = oh * scale;

        stage.update();
    }

    function mousePressMoveHandler(event) {
        console.log('press move');
        door.moveDoor(event);
    }

    function mouseClickHandler(event) {
        console.log('click');
        babyRepo.addBaby();
        goerGen.addPartyGoer();
    }

    //public funcs
    this.init = function() {
        init();
    };

    this.getBackground = function() {
        return background;
    };

    this.getSound = function() {
        return sound;
    };

    this.getDoor = function() {
        return door;
    };

    this.getBabyRepo = function() {
        return babyRepo;
    };

    this.getGoerGen = function() {
        return goerGen.getGoer();
    };
};

var gameObject = new GameObject();
document.body.onload = gameObject.init();
