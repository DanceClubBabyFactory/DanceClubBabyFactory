var CopObject = function() {
    //private vars
    //declare private vars here
    var radius = 8 * 2;
    var invade = false;
    var moved = false;
    var dead = false;
    var cop;
    var clock = 1;

    //private funcs
    function init() {
        drawCop();
    }

    function patrol() {
       var safety = 20;
       cop.x = CONSTANTS.WIDTH / 2 +
               (CONSTANTS.HEIGHT / 2 - safety) * Math.cos(clock);
       cop.y = CONSTANTS.HEIGHT / 2 +
               (CONSTANTS.HEIGHT / 2 - safety) * Math.sin(clock);
       clock = (clock + 0.005) % (2 * Math.PI);
    }

    function moveIn() {
      if (!moved) {
        moved = true;

        var babyRepo = gameObject.getBabyRepo();
        var babyRepoPos = babyRepo.getPosition();
        createjs.Tween.get(cop).to(babyRepoPos, 5000, createjs.Ease.linear)
                               .to({x: CONSTANTS.WIDTH / 2,
                                    y: CONSTANTS.HEIGHT + 50},
                                   5000, createjs.Ease.linear)
                               .call(function() { dead = true; });
      }

      if (seeDrugDealers()) {
        console.log("i command you to evict");
        gameObject.getCopGen().evictPeople();
      }
    }

    function drawCop() {
        cop = new createjs.Shape();
        cop.graphics
            .beginStroke('#00f')
            .setStrokeStyle(7)
            .beginFill('#aaa')
            .drawCircle(0, 0, radius);

        stage.addChild(cop);
    }

    function seeDrugDealers() {
        var babyRepo = gameObject.getBabyRepo();
        var babyRepoPos = babyRepo.getPosition();
        var doorRadius = gameObject.getDoor().getRadius();
        var x1 = babyRepoPos.x - doorRadius;
        var x2 = babyRepoPos.x + doorRadius;
        var y1 = babyRepoPos.y - doorRadius;
        var y2 = babyRepoPos.y + doorRadius;

        if ((cop.x > x1) &&
            (cop.x < x2) &&
            (cop.y > y1) &&
            (cop.y < y2)) {
          if (gameObject.getGoerGen().drugDealerInPartySize() > 0) {
            console.log("spotted");
            return true;
          }
        }

        return false;
    }

    this.tick = function() {
        if (invade) {
          moveIn();
        } else {
          patrol();
        }
    };

    //public funs
    this.setPosition = function(position) {
        cop.x = position.x;
        cop.y = position.y;
    };

    this.getPosition = function() {
        return {
            x: cop.x,
            y: cop.y
        };
    };

    this.setInvade = function(invade_) {
        invade = invade_;
    };

    this.getInvade = function() {
        return invade;
    };

    this.getRadius = function() {
        return radius;
    };

    this.getShape = function() {
        return cop;
    };

    this.isDead = function() {
        return dead;
    };

    init();
};

