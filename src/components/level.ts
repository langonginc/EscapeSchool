import * as ex from 'excalibur'
import { Level1Scene } from './levels/level1';

export const LEVEL_COUNTS = 1;

export const setupGameScenes = (game: ex.Engine) => {
    game.add('menuScene', new ex.Scene());

    game.add('level1', new Level1Scene());
}