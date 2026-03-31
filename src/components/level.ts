import * as ex from 'excalibur'
import { Level1Scene } from './levels/level1';

export const LEVEL_COUNTS = 5;

export const setupGameScenes = (game: ex.Engine) => {
    console.log("打包后 Level1Scene 是什么鬼？", Level1Scene);
    game.addScene('menuScene', new ex.Scene());

    game.addScene('level1', new Level1Scene());
}