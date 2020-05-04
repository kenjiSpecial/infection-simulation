import Bowser from 'bowser';
import { Color } from 'three';

export const ENV = Bowser.parse(window.navigator.userAgent);
export const IS_MOBILE = ENV.platform.type === 'mobile' ? true : false;
export const IS_TABLET =
	ENV.platform.type === 'tablet' ||
	(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
		? true
		: false;

export const IS_DEVICE = IS_MOBILE || IS_TABLET ? true : false;
export const IS_DESKTOP = ENV.platform.type === 'desktop' ? true : false;
export const PIXEL_RATIO = IS_DESKTOP ? 1 : IS_TABLET ? 1 : window.devicePixelRatio > 1 ? 1.5 : 1;

export const COLLIDE_DIS = 0.8;

export enum AGENT_STATE {
	S = 'S',
	I = 'I',
	R = 'R'
}

export const BLUE = '#2da7ff';
export const RED = '#ff6d6d';
export const ORANGE = '#ffb46f';

export const AGENT_COLOR = {
	S: new Color(0x2da7ff),
	I: new Color(0xff6d6d),
	R: new Color(0xffb46f)
};

export enum SCENE {
	TOP = 'top',
	RULE = 'rule',
	SIMULATION = 'simulation'
}

export enum SIMULATION {
	PLAY = 'PLAY',
	PAUSE = 'PAUSE',
	RESET = 'RESET',
}

export enum APP_STATE {
	PLAYABLE = 'PLAYABLE',
	DONE = 'DONE'
}

export const FOOTER_HEIGHT = 170;

export enum APP_STEP {
	STEP1 = 'step1',
	STEP2 = 'step2',
	STEP3 = 'step3'
}

export const MAX_STEP = 3;

export const breakpoint1 = 940;
export const breakpoint2 = 680;
export const breakpoint3 = 1200;