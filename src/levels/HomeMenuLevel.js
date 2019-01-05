class HomeMenuLevel extends Level {

    buildScene() {

        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);

        // Make this scene transparent to see the background
        this.scene.clearColor = new BABYLON.Color4(0,0,0,0);
 
        var menu = new UI('homeMenuUI');
        
        menu.addButton('playButton', 'Play Game', {
            'background': '#636e72',
            'color': 'white',
            'onclick': () => GAME.goToLevel('RunnerLevel')
        });
        
        menu.addButton('creditsButton', 'Credits', {
            'top': '70px',
            'background': '#636e72',
            'color': 'white',
            'onclick': () => GAME.goToLevel('CreditsLevel')
        });

    }

}