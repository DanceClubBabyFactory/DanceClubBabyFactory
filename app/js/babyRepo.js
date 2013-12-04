var BabyRepoObject = function() {
    //private vars
    //declare private vars here
    var container;
    var radius = 75;
    var babies = [];
    var birthEvt;

    //private funcs
    function init() {
        drawContainer();
        birthEvt = document.createEvent('Event');
        birthEvt.initEvent('birth', true, true);
    }

    function drawContainer() {
        container = new createjs.Shape();
        container.x = CONSTANTS.WIDTH/2;
        container.y = CONSTANTS.HEIGHT/2;
        container.graphics
            .beginStroke('#ee2a7b')
            .setStrokeStyle(8)
            .beginFill('#ec87b8')
            //.beginFill('#ffffff')
            .drawCircle(0, 0, radius);

        // container.cache(CONSTANTS.WIDTH/2 - 80, CONSTANTS.HEIGHT/2 - 80, 160, 160);
        stage.addChild(container);
    }

    function drawBaby() {
        var baby = new BabyObject();
        baby.setPosition(getRandomPos(baby));
        babies.push(baby);
        document.dispatchEvent(birthEvt);
        //alert(this.getNumBabies());
    }

    /*function checkForCollisions(baby_) {
        for (var i in babies) {
            if(circlesDoCollide(babies[i], baby_))
                return true;
        }
        return false;
    }*/

    function getRandomPos(baby) {
        var position = {
            x: Math.random() * 50 * getRandomSign(),
            y: Math.random() * 50 * getRandomSign()
        };
        return position;
    }

    //public funcs
    this.addBaby = function() {
        drawBaby();
    };

    this.getPosition = function() {
        return {
            x: container.x,
            y: container.y
        };
    };

    this.getRadius = function() {
        return radius;
    };

    this.getNumBabies = function() {
        return babies.length;
    };

    this.reset = function() {
        for (var i in babies) {
            stage.removeChild(babies[i].baby);
        }
        babies = [];
    };

    init();
};
