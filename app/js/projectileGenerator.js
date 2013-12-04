MINTICKSPERPROJECTILE = 5;

var ProjectileGeneratorObject = function() {
    //private vars
    //declare private vars here
    var projectiles = new createjs.Container();
    var powerUps = new createjs.Container();
    var projectileAngle = 0;
    var projectileTarget = { x: -15, y: 0};
    var ticksSinceProjectile = 0;
    var rotateDirection = 1;
    var violationEvt;
    var blockedEvt;
    
    var slowPowerTimer;

    //private funcs
    function init() {
        violationEvt = document.createEvent('Event');
        violationEvt.initEvent('violation', true, true);
        blockedEvt = document.createEvent('Event');
        blockedEvt.initEvent('blocked', true, true);

        document.addEventListener("lpPulse", lpPulseHandler, false);
        document.addEventListener("hpPulse", hpPulseHandler, false);
        document.addEventListener("oneKey", firePowerUp, false);
    }

    function lpPulseHandler(event) {
        var dataDiff = event.dataDiff;
        fireProjectile(dataDiff, LO);
    }

    function hpPulseHandler(event) {
        var dataDiff = event.dataDiff;
        fireProjectile(dataDiff, HI);
        //console.log(dataDiff);
    }
    function removeProjectile(index) {
        stage.removeChild(projectiles.getChildAt(index).getShape());
        projectiles.removeChildAt(index);
    }

    function removePowerUp(index) {
        stage.removeChild(powerUps.getChildAt(index).getShape());
        powerUps.removeChildAt(index);
    }

    function noiseViolation(index) {
        var juice = new JuicySplosion(projectiles.getChildAt(index).getPosition(), 500, "rgba(255,0,0,0.2)");
        removeProjectile(index);
        document.dispatchEvent(violationEvt);
    }

    function drawProjectile(type) {
        var projectile = new ProjectileObject(type);
        projectiles.addChild(projectile);
        
        return projectile;
    }

    function drawPowerUp() {
        var powerUp = new PowerUpObject();
        powerUps.addChild(powerUp);
        
        return powerUp;
    }

    var count = 0;
    function fireProjectile(dataDiff, type) {
        if (ticksSinceProjectile > MINTICKSPERPROJECTILE/(volumeModifier/100) && dataDiff > 1) {
            var projectile = drawProjectile(type);
            var edgePos = calculateProjectileDirection(rotateDirection*dataDiff);
            var offsetPosition = {
                x: CONSTANTS.WIDTH/2+gameObject.getBabyRepo().getRadius()*Math.cos(projectileAngle), 
                y: CONSTANTS.HEIGHT/2+gameObject.getBabyRepo().getRadius()*Math.sin(projectileAngle)
            };
            projectile.setPosition(offsetPosition);
            createjs.Tween.get(projectile.getShape()).to(edgePos, (6000 + (500 * dataDiff)) * 100/volumeModifier * 1/speedModifier, createjs.Ease.linear);
            ticksSinceProjectile = 0;
            if (count++%10 === 0) {
                rotateDirection *= getRandomSign(); // maybe direction every 10 shots
            }
        }
        /*
        if (800 < count && count <= 900) {
            var projectile = drawProjectile();
            var edgePos = calculateProjectileDirection(dataDiff);
            var offsetPosition = {
                x: CONSTANTS.WIDTH/2+gameObject.getBabyRepo().getRadius()*Math.cos(projectileAngle), 
                y: CONSTANTS.HEIGHT/2+gameObject.getBabyRepo().getRadius()*Math.sin(projectileAngle)
            };
            projectile.setPosition(offsetPosition);
            createjs.Tween.get(projectile.getShape()).to(edgePos, (6000 + (500 * dataDiff)) * 100/volumeModifier * 1/speedModifier, createjs.Ease.linear);
            count = 0;
        }
        count += parseInt(volumeModifier, 10);
        */
    }

    function firePowerUp() {
        console.log('fire powerup');
        var stars = gameObject.getNumStars();
        if(stars >= SLOWDOWNCOST) {
            var dataDiff = 1;
            var powerUp = drawPowerUp();
            var edgePos = calculateProjectileDirection(dataDiff);
            createjs.Tween.get(powerUp.getShape()).to(edgePos, (6000 + (500 * dataDiff)) * 100/volumeModifier * 1/speedModifier, createjs.Ease.linear);
            gameObject.setNumStars(stars - SLOWDOWNCOST);
        }
    }

    function calculateProjectileDirection(dataDiff) {

        projectileAngle = projectileAngle + Math.PI/8 * dataDiff/5;

        var newPosition = {
            x: window.innerWidth/2 + 2 * window.innerHeight * Math.cos(projectileAngle),
            y: window.innerHeight/2 + 2 * window.innerHeight * Math.sin(projectileAngle)
        };

        return newPosition;
    }
    
    function blockProjectile(index) {
        var juice = new JuicySplosion(projectiles.getChildAt(index).getPosition(), 25, "#ABF000");
        document.dispatchEvent(blockedEvt);
        removeProjectile(index);
    }

    function gotPowerUp(index) {
        var juice = new JuicySplosion(powerUps.getChildAt(index).getPosition(), 50, "#FF00FF");
        gameObject.incrementStars();
        removePowerUp(index);
        var enterEasing = setInterval(function() {
            speedModifier = speedModifier*0.99 + 0.5*0.01;
            if (speedModifier < 0.51) {
                speedModifier = 0.5;
                clearInterval(enterEasing);
            }
            document.LOLaudio.playbackRate.value = speedModifier;
        }, 10);
        clearTimeout(slowPowerTimer);
        slowPowerTimer = setTimeout(function() {
            speedModifier = 0.51;
            var exitEasing = setInterval(function() {
                speedModifier = (speedModifier-0.5*0.01)/0.99;
                if (speedModifier > 0.99) {
                    speedModifier = 1;
                    clearInterval(exitEasing);
                }
                document.LOLaudio.playbackRate.value = speedModifier;
            }, 10);
        }, 10000);
    }

    //public funcs
    // NOT USED?
    this.addProjectile = function() {
        drawProjectile();
    };
    
    // NOT USED?
    this.spawnAndFire = function(dataDiff) {
        fireProjectile(dataDiff);
    };

    this.reset = function() {
        for (var i = 0; i < projectiles.getNumChildren(); i++) {
            stage.removeChild(projectiles.getChildAt(i).getShape());
            projectiles.removeChildAt(i);
        }
        for (i = 0; i < powerUps.getNumChildren(); i++) {
            stage.removeChild(powerUps.getChildAt(i).getShape());
            powerUps.removeChildAt(i);
        }
    };

    this.tick = function() {
        // Checks for when to remove projectiles
        for (var i = 0; i < projectiles.getNumChildren(); i++) {
            // outside stage
            var projectile = projectiles.getChildAt(i).getShape();
            if (projectile.x < 0 || projectile.y < 0 || projectile.x > CONSTANTS.WIDTH || projectile.y > CONSTANTS.HEIGHT) {
                noiseViolation(i);
                continue;
            }
            
            // blocked by door
            var projPosition = projectiles.getChildAt(i).getPositionFromCenter();
            if (gameObject.getDoor().detectCollision(projPosition.x, projPosition.y)) {
                blockProjectile(i);
            }
        }

        // Checks for when to remove powerups
        for (i = 0; i < powerUps.getNumChildren(); i++) {
            // outside stage
            var powerUp = powerUps.getChildAt(i).getShape();
            if (powerUp.x < 0 || powerUp.y < 0 || powerUp.x > CONSTANTS.WIDTH || powerUp.y > CONSTANTS.HEIGHT) {
                removePowerUp(i);
            }
            
            // blocked by door
            var powerUpPosition = powerUps.getChildAt(i).getPositionFromCenter();
            if (gameObject.getDoor().detectCollision(powerUpPosition.x, powerUpPosition.y)) {
                gotPowerUp(i);
            }
        }
        
        ticksSinceProjectile++;

    };

    this.getProjectiles = function() {
        return projectiles;
    };

    init();
};
