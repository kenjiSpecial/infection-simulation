import { EventDispatcher } from 'three';
import { IBase } from '../app';
import { APP_STATE, SCENE, SIMULATION } from '../utils/constants';
import { ASSETS_LOADED, RESET_APP_MODEL, UPDATE_APP_STATE, UPDATE_STEP } from '../utils/eventNames';

export class GLAppModel extends EventDispatcher implements IBase {
	public scene: string;
	public simulationState: string;
	public appState: string;
	public simulationStep: string;
	public ruleStep: string;
	public infectionDistance: number = 1;
	public infectiousProbability: number = 1;
	public infectionDuration: number = 5;
	public restrictRate: number = 0.8;
	public removeRate: number = 0.3;
	public isAutoPuase: boolean = true;
	public max: { value: number; time: number } = { value: -9999, time: 0 };
	private isLoad: boolean = false;
	private prevTime: number;
	private totalTime: number = 0;
	private dt: number;
	private agentRateArr: number[][] = [[], [], [], []];

	constructor() {
		super();
		this.appState = APP_STATE.PLAYABLE;
		this.simulationState = SIMULATION.PAUSE;
	}

	public updateStep(value: string) {
		this.simulationState = value;
		this.dispatchEvent({ type: UPDATE_STEP });
	}

	public doSimulation(step: string) {
		this.scene = SCENE.SIMULATION;
		this.simulationStep = step;
	}

	public updateSceneRule(step: string) {
		this.scene = SCENE.RULE;
		this.ruleStep = step;
	}

	public updateSceneTop() {
		this.scene = SCENE.TOP;
	}

	public reset() {
		this.agentRateArr = [[], [], [], []];
		this.max.value = -1;
		this.max.time = 0;
		this.totalTime = 0;
		this.dispatchEvent({ type: RESET_APP_MODEL });

		if (this.appState === APP_STATE.DONE) {
			this.appState = APP_STATE.PLAYABLE;
			this.startTick();
		}
	}

	public startTick() {
		if (this.appState === APP_STATE.DONE) {
			return;
		}

		this.simulationState = SIMULATION.PLAY;
		this.prevTime = new Date().getTime();
		this.dispatchEvent({ type: UPDATE_APP_STATE });
	}

	public pauseTick() {
		this.simulationState = SIMULATION.PAUSE;
		this.dispatchEvent({ type: UPDATE_APP_STATE });
	}

	public done() {
		this.appState = APP_STATE.DONE;
		this.pauseTick();
	}

	public togglePlay() {
		if (this.simulationState === SIMULATION.PAUSE) {
			this.startTick();
		} else {
			this.pauseTick();
		}
	}

	public update() {
		const curTime = new Date().getTime();
		if (!this.prevTime) {
			this.prevTime = curTime;
		}
		this.dt = (curTime - this.prevTime) / 1000;
		this.prevTime = curTime;
		this.totalTime += this.dt;
	}

	public getTotalTime() {
		return this.totalTime;
	}

	public getDt() {
		return this.dt;
	}

	public loaded() {
		this.isLoad = true;
		this.dispatchEvent({ type: ASSETS_LOADED });
	}

	public getIsLoad() {
		return this.isLoad;
	}

	public setAgentRate(agentRateArr: number[]) {
		this.agentRateArr[0].push(this.totalTime);

		for (let ii = 0; ii < agentRateArr.length; ii = ii + 1) {
			this.agentRateArr[ii + 1].push(agentRateArr[ii]);
		}

		if (this.max.value < agentRateArr[1]) {
			this.max.time = this.totalTime;
			this.max.value = agentRateArr[1];
		}
	}

	public setRestriction(value: number) {
		this.restrictRate = value;
	}
	public setRemove(value: number) {
		this.removeRate = value;
	}

	public getAgentRate() {
		return this.agentRateArr;
	}

	public forceAppStatePlayable() {
		this.appState = APP_STATE.PLAYABLE;
	}
}
