import { EventDispatcher } from 'three';
import { Navigation } from './dom/navigation';
import { Rule } from './dom/rule';
import { Simulation } from './dom/simulation';
import { Top } from './dom/top';
import { ThreeJsApp } from './threejs/app';
import { AppModel } from './threejs/models/appModel';
import { APP_STATE, MAX_STEP, SCENE } from './threejs/utils/constants';
import {
	ASSETS_LOADED,
	CHANGE_SPACE_SIZE,
	CLICK_PLAY_PAUSE_BTN,
	CLICK_RESET_BTN,
	DONE_SIMULATION,
	MOVE_NEXT_STEP,
	MOVE_PREV_STEP,
	NAVIGATE_RULE,
	NAVIGATE_SIMULATION,
	NAVIGATE_TOP,
	RESIZE,
	START_UPDATE_SPACE_SIZE,
	UPDATE_AGENT_RATE,
	UPDATE_APP_STATE,
	UPDATE_REMOVE,
	UPDATE_RESTRICTION,
	UPDATE_RULE,
	UPDATE_SPACE_SIZE,
	UPDATE_STEP
} from './threejs/utils/eventNames';
import { WindowManager } from './threejs/utils/WindowManager';

export class App extends EventDispatcher {
	private threeJsApp: ThreeJsApp;
	private simulation: Simulation;
	private top: Top;
	private rule: Rule;
	private navigation: Navigation;
	private model: AppModel = new AppModel();
	constructor() {
		super();

		this.onResizeHandler = this.onResizeHandler.bind(this);
		this.onClickPlayPauseBtnHandler = this.onClickPlayPauseBtnHandler.bind(this);
		this.onClickResetBtnHandler = this.onClickResetBtnHandler.bind(this);
		this.onUpdateAppStateHandler = this.onUpdateAppStateHandler.bind(this);
		this.navigateToTop = this.navigateToTop.bind(this);
		this.navigateToRule = this.navigateToRule.bind(this);
		this.navigateToSimulation = this.navigateToSimulation.bind(this);

		this.threeJsApp = new ThreeJsApp();
		this.simulation = new Simulation();
		this.top = new Top();
		this.rule = new Rule();
		this.navigation = new Navigation();

		const wndowManager = WindowManager.GET_INSTANCE();
		wndowManager.addEventListener(RESIZE, this.onResizeHandler);

		this.addEvents();
	}

	public startToLoad() {
		this.threeJsApp.addEventListener(ASSETS_LOADED, () => {
			this.startApplication();
		});
		this.threeJsApp.addEventListener(UPDATE_AGENT_RATE, () => {
			this.simulation.update(this.threeJsApp.getAgentRate(), this.threeJsApp.getTotalTime());
		});
		this.threeJsApp.addEventListener(DONE_SIMULATION, () => {
			this.simulation.doneSimulation();
		});
		this.threeJsApp.startToLoad();
	}

	public showSimulation(step: string) {
		this.model.scene = SCENE.SIMULATION;

		this.threeJsApp.showSimulation(step);
		this.simulation.showScene(this.threeJsApp.getSimulationStep());
		
		this.top.hide();
		this.rule.hide();

		if (this.threeJsApp.getIsLoaded()) {
			this.threeJsApp.resetSimulationApp(SCENE.TOP);
			this.simulation.show(
				this.threeJsApp.getSpaceSize(),
				this.threeJsApp.getRestrictionRate(),
				this.threeJsApp.getRemoveRate()
			);
		}
		
	}

	public showTop() {
		this.model.scene = SCENE.TOP;
		this.top.show();
		this.simulation.hide();
		this.rule.hide();
		this.threeJsApp.showTop();
		if (this.threeJsApp.getIsLoaded()) {
			this.threeJsApp.forceAppStatePlayable();
			this.threeJsApp.play();
		}
	}

	public showRule(ruleStep: string) {
		this.model.scene = SCENE.RULE;
		this.top.hide();
		this.simulation.hide();
		this.rule.show();
		this.rule.updateRule(ruleStep);

		this.threeJsApp.showRule(ruleStep);

		if (this.threeJsApp.getIsLoaded()) {
			this.threeJsApp.updateRuleAgent();
			this.threeJsApp.forceAppStatePlayable();
			this.threeJsApp.play();			
		}
	}

	private startApplication() {
		switch (this.threeJsApp.getScene()) {
			case SCENE.SIMULATION:
				this.simulation.show(
					this.threeJsApp.getSpaceSize(),
					this.threeJsApp.getRestrictionRate(),
					this.threeJsApp.getRemoveRate()
				);
				break;
			case SCENE.RULE:
				this.threeJsApp.updateRuleAgent();
				break;
			default:
		}

		this.threeJsApp.resetAgents();
		this.threeJsApp.moveCamera();

		this.threeJsApp.startTick();
	}

	private onResizeHandler() {
		if (this.simulation) {
			this.simulation.resize();
		}

		if (this.threeJsApp) {
			this.threeJsApp.resize();
		}
	}

	private addEvents() {
		this.simulation.addEventListener(CLICK_PLAY_PAUSE_BTN, this.onClickPlayPauseBtnHandler);
		this.simulation.addEventListener(CLICK_RESET_BTN, this.onClickResetBtnHandler);
		this.simulation.addEventListener(MOVE_NEXT_STEP, () => {
			const simulationStep = this.threeJsApp.getSimulationStep();
			const simulationStepNum = Number(simulationStep);
			if (simulationStepNum >= MAX_STEP) {
				return;
			}
			const nextSimulationStep = (simulationStepNum + 1).toString();
			this.dispatchEvent({ type: UPDATE_STEP, step: nextSimulationStep });
		});
		this.simulation.addEventListener(MOVE_PREV_STEP, () => {
			const simulationStep = this.threeJsApp.getSimulationStep();
			const simulationStepNum = Number(simulationStep);
			if (simulationStepNum <= 1) {
				return;
			}
			const prevSimulationStep = (simulationStepNum - 1).toString();
			this.dispatchEvent({ type: UPDATE_STEP, step: prevSimulationStep });
		});
		this.simulation.addEventListener(UPDATE_STEP, event => {
			const simulationStep = this.threeJsApp.getSimulationStep();
			if (simulationStep === event.step) {
				return;
			}
			this.dispatchEvent({ type: UPDATE_STEP, step: event.step });
		});

		this.simulation.addEventListener(UPDATE_SPACE_SIZE, event => {
			const appState = this.threeJsApp.getAppState();
			if (appState === APP_STATE.DONE) {
				this.simulation.updateSimulationState(this.threeJsApp.getSimulationState());
			}
			this.threeJsApp.forceAppStatePlayable();
			const size = Math.floor(event.value) + 50;
			this.threeJsApp.updateBoudarySize(size);
			this.threeJsApp.resetSimulationApp(this.model.scene);
			this.threeJsApp.render();
		});

		this.simulation.addEventListener(UPDATE_RESTRICTION, event => {
			this.threeJsApp.updateRestriction(Math.floor(event.value) / 100);
			this.threeJsApp.resetSimulationApp(this.model.scene);
			this.threeJsApp.render();
		});

		this.simulation.addEventListener(UPDATE_REMOVE, event => {
			this.threeJsApp.updateRemove(Math.floor(event.value) / 100);
			this.threeJsApp.resetSimulationApp(this.model.scene);
			this.threeJsApp.render();
		});

		this.threeJsApp.addEventListener(UPDATE_APP_STATE, this.onUpdateAppStateHandler);
		this.navigation.addEventListener(NAVIGATE_TOP, this.navigateToTop);
		this.navigation.addEventListener(NAVIGATE_RULE, this.navigateToRule);
		this.navigation.addEventListener(NAVIGATE_SIMULATION, this.navigateToSimulation);

		this.rule.addEventListener(MOVE_NEXT_STEP, () => {
			const ruleStep = this.threeJsApp.getRuleStep();
			const ruleStepNum = Number(ruleStep);
			if (ruleStepNum >= MAX_STEP) {
				return;
			}
			const step = (ruleStepNum + 1).toString();
			this.dispatchEvent({ type: UPDATE_RULE, step: step });
		});
		this.rule.addEventListener(MOVE_PREV_STEP, () => {
			const ruleStep = this.threeJsApp.getRuleStep();
			const ruleStepNum = Number(ruleStep);
			if (ruleStepNum <= 1) {
				return;
			}
			const step = (ruleStepNum - 1).toString();
			this.dispatchEvent({ type: UPDATE_RULE, step: step });
		});
		this.rule.addEventListener(UPDATE_RULE, event => {
			if (event.step === this.threeJsApp.getRuleStep()) {
				return;
			}
			this.dispatchEvent({ type: UPDATE_RULE, step: event.step });
		});
	}

	// event callback function
	private onClickPlayPauseBtnHandler() {
		this.threeJsApp.playAndPause();
	}

	private onClickResetBtnHandler() {
		this.threeJsApp.resetApp(this.model.scene);
	}

	private onUpdateAppStateHandler() {
		this.simulation.updateSimulationState(this.threeJsApp.getSimulationState());
	}

	private navigateToTop() {
		this.dispatchEvent({ type: NAVIGATE_TOP });
	}
	private navigateToRule() {
		this.dispatchEvent({ type: NAVIGATE_RULE });
	}
	private navigateToSimulation() {
		this.dispatchEvent({ type: NAVIGATE_SIMULATION });
	}
}
