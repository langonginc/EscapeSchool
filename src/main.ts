import * as ex from 'excalibur'
import { DialogManager } from './dialog/dialog-manager';
import { AlertManager } from './alert-manager';
import { addLevels } from './components/level';
import { MenuManager } from './menu-manager';
import { PauseManager } from './pause-manager';
import { GameOverManager } from './game-over-manager';
import { VictoryManager } from './victory-manager';


const game = new ex.Engine({
    width: 480,
    height: 320,
    backgroundColor: ex.Color.fromHex("#020222"),
    pixelArt: true,
    pixelRatio: 2,
    displayMode: ex.DisplayMode.FitScreen,
    physics: {
        solver: ex.SolverStrategy.Arcade
    },
});

addLevels(game);

DialogManager.init();
AlertManager.init();
MenuManager.init(game);

game.on('preupdate', () => {
    if (DialogManager.isActive) {
        if (game.input.keyboard.wasPressed(ex.Keys.W) || game.input.keyboard.wasPressed(ex.Keys.Up) ||
            game.input.keyboard.wasPressed(ex.Keys.S) || game.input.keyboard.wasPressed(ex.Keys.Down)) {
            if (game.input.keyboard.wasPressed(ex.Keys.W) || game.input.keyboard.wasPressed(ex.Keys.Up)) 
                DialogManager.handleInput(ex.Keys.Up);
            if (game.input.keyboard.wasPressed(ex.Keys.S) || game.input.keyboard.wasPressed(ex.Keys.Down)) 
                DialogManager.handleInput(ex.Keys.Down);
        }

        if (game.input.keyboard.wasPressed(ex.Keys.F)) {
            DialogManager.next();
        }
    }
});

game.on('postupdate', () => {
    AlertManager.render();
});

game.start().then(async() => {
    PauseManager.init(game);
    GameOverManager.init();
    VictoryManager.init(game);
    
    MenuManager.showMainMenu();
});
