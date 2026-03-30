import * as ex from 'excalibur'
import { Level1Scene } from './levels/level1';

export const LEVEL_COUNTS = 1;

export const addLevels = (game: ex.Engine) => {
    const menuScene = new ex.Scene();
    game.add('menuScene', menuScene);

    game.add('level1', new Level1Scene());
}