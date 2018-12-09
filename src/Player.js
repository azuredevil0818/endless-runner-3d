class Player {

    constructor(scene) {
        
        this.scene = scene;

        this.statuses = {
            'RUNNING': true,
            'JUMPING': false,
            'DRAGGING': false,
            'FALLING_DOWN' : false
        };

        /**
         * Set it to true to make the player indestructible for tests
         */
        this.godMode = false;

        this.defaultSpeed = 15;
        this.speed = this.defaultSpeed;

        this.gravity = -12;
        
        /**
         * Stores the player last altitude to check if the player is falling down
         */
        this.lastAltitude = 0.25;
        this.jumpMaxAltitude = 4.5;

        this.onDie = null;

        /**
         * Used to store the travelled distance and calculate where to generate more level tiles
         * and to give points to the player
         * The travelledDistance will reset each 100 "meters". When travelledDistance is equal to 70
         * the Level will generate more tiles
         */
        this.travelledDistance = 0;
        this.totalTravelledDistance = 0;
        
        /**
         * Method to set an ellipsoid (for collision) based on boundingbox size 
         */ 
        BABYLON.Mesh.prototype.setEllipsoidPerBoundingBox = function(scene) {
            var bi = this.getBoundingInfo();
            var bb = bi.boundingBox;
            this.ellipsoid = bb.maximumWorld.subtract(bb.minimumWorld).scale(0.5);
        }

        this.mesh = BABYLON.MeshBuilder.CreateBox("player", {
            width: 0.3333333, 
            height: 0.5, 
            depth: 0.3333333
        }, this.scene);

        this.mesh.position.y = 0.25;

        let playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
        playerMaterial.alpha = 0.5;

        this.mesh.material = playerMaterial;

        this.mesh.setEllipsoidPerBoundingBox();

        GAME.drawEllipsoid(this.mesh);

    }

    setStatus(status, value = true) {
        this.statuses[status] = value;
    }

    move() {

        let elapsedTime = (GAME.engine.getDeltaTime() / 1000),
            gravity = (this.godMode) ? 0 : (this.gravity / 100),
            jump = (this.statuses.JUMPING && !this.statuses.FALLING_DOWN) ? 1 : 0,
            runSpeed = this.speed * elapsedTime;

        // If is jumping, multiply the speed by 1.5
        runSpeed *= (this.statuses.JUMPING) ? 1.5 : 1;

        this.mesh.moveWithCollisions(new BABYLON.Vector3(
            0, 
            gravity + jump, 
            runSpeed
        ));
        
        this.calculateTravelledDistance(elapsedTime);
        
        if(this.mesh.position.y < this.lastAltitude) {
            this.setStatus('FALLING_DOWN', true);
        } else {
            this.setStatus('FALLING_DOWN', false);
        }

        this.lastAltitude = this.mesh.position.y;

        if(GAME.keys.left) {
            this.mesh.position.x -= (this.speed / 5) * elapsedTime;
        }

        if(GAME.keys.right) {
            this.mesh.position.x += (this.speed / 5) * elapsedTime;
        }

        // Player JUMPING
        if(GAME.keys.up && !this.statuses.JUMPING && !this.statuses.FALLING_DOWN) {
            this.setStatus('JUMPING', true);
        }

        if(this.mesh.position.y >= this.jumpMaxAltitude && this.statuses.JUMPING) {
            this.setStatus('JUMPING', false);
        }
        
        // Player DRAGGING
        if(GAME.keys.down) {
            this.mesh.scaling.y = 0.5;
            this.mesh.setEllipsoidPerBoundingBox();
            this.speed = this.defaultSpeed * 1.5;
        } else {
            this.speed = this.defaultSpeed;
            this.mesh.setEllipsoidPerBoundingBox();
            this.mesh.scaling.y = 1;
        }

        if(this.mesh.position.y <= -2) {
            this.die();
        }

    }

    getMesh() {
        return this.mesh;
    }

    calculateTravelledDistance(elapsedTime) {
        if(this.travelledDistance >= 100) {
            this.travelledDistance = 0;
        }

        this.travelledDistance += this.speed * elapsedTime;
        this.totalTravelledDistance += this.speed * elapsedTime;
    }

    getTravelledDistance() {
        return this.travelledDistance;
    }

    reset() {
        this.mesh.position.x = 0;
        this.mesh.position.y = 0.25;
        this.mesh.position.z = 0;
        this.travelledDistance = 0;
        this.totalTravelledDistance = 0;
    }

    die() {
        if(this.onDie && !this.godMode) {
            this.onDie();
        }
    }

}