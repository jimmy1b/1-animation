function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Unicorn(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 0, 0, 206, 110, 0.02, 30, true, true);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 618, 334, 174, 138, 0.02, 40, false, true);
    this.jumping = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 0, 400);
}

Unicorn.prototype = new Entity();
Unicorn.prototype.constructor = Unicorn;

Unicorn.prototype.update = function () {
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    Entity.prototype.update.call(this);
}

Unicorn.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

function Knight(game) {
    this.start = new Animation(ASSET_MANAGER.getAsset("./img/knightt.png"), 1, 393, 62, 51, 0.10, 9, false, false);
    this.idle = new Animation(ASSET_MANAGER.getAsset("./img/knightt.png"), 1, 2, 36, 32, 0.10, 4, true, false);
    this.run = new Animation(ASSET_MANAGER.getAsset("./img/knightt.png"), 1, 77, 42, 35, 0.02, 6, false, false);
    this.jump = new Animation(ASSET_MANAGER.getAsset("./img/knightt.png"), 1, 2333, 38, 34, 0.20, 5, false, false);
    this.swing = new Animation(ASSET_MANAGER.getAsset("./img/knightt.png"), 1, 186, 56, 35, 0.02, 5, false, false);
    this.jumping = false;
    this.starting = true;
    this.radius = 100;
    this.ground = 440;
    Entity.call(this, game, 0, 440);
}

Knight.prototype = new Entity();
Knight.prototype.constructor = Knight;

Knight.prototype.update = function () {
    if (!this.starting) {
        if (this.game.space) this.jumping = true;
        if (this.jumping) {
            if (this.jump.isDone()) {
                this.jump.elapsedTime = 0;
                this.jumping = false;
            }
            var jumpDistance = this.jump.elapsedTime / this.jump.totalTime;
            var totalHeight = 200;

            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;

            //var height = jumpDistance * 2 * totalHeight;
            var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.ground - height;
        }
    } else {
        if (this.start.isDone()) {
                this.start.elapsedTime = 0;
                this.starting = false;
            }
            var jumpDistance = this.start.elapsedTime / this.start.totalTime;
            var totalHeight = 200;

            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;

            //var height = jumpDistance * 2 * totalHeight;
            var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.ground - height;
            this.x = this.x + 3;
    }
    Entity.prototype.update.call(this);
}

Knight.prototype.draw = function(ctx) {
    if (this.starting) {
        this.start.drawFrame(this.game.clockTick, ctx, this.x - 35, this.y - 15, 2);
    } 
    else if (this.jumping) {
        this.jump.drawFrame(this.game.clockTick, ctx, this.x - 10, this.y - 10, 2);
    }
    else {
        this.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
    }
    Entity.prototype.draw.call(this);
}


function rat(game) {

}

rat.prototype = new Entity();
rat.prototype.constructor = rat;

rat.prototype.update = function () {

}

rat.prototype.draw = function(ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/RobotUnicorn.png");
ASSET_MANAGER.queueDownload("./img/knightt.png");
ASSET_MANAGER.queueDownload("./img/ratt.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var unicorn = new Unicorn(gameEngine);

    var knight = new Knight(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(unicorn);

    gameEngine.addEntity(knight);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
