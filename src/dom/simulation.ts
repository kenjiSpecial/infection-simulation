import { EventDispatcher } from 'three';
import { BLUE, breakpoint, breakpoint1, breakpoint2, breakpoint3, ORANGE, RED, SIMULATION } from '../threejs/utils/constants';
import {
	CHANGE_REMOVE,
	CHANGE_RESTRICTION,
	CHANGE_SPACE_SIZE,
	CLICK_PLAY_PAUSE_BTN,
	CLICK_RESET_BTN,
	MOVE_NEXT_STEP,
	MOVE_PREV_STEP,
	START_UPDATE_SPACE_SIZE,
	UPDATE_REMOVE,
	UPDATE_RESTRICTION,
	UPDATE_SPACE_SIZE,
	UPDATE_STEP
} from '../threejs/utils/eventNames';
import { WindowManager } from '../threejs/utils/WindowManager';

export class Simulation extends EventDispatcher {
	private el: HTMLElement;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private buttonContainer: HTMLElement;
	private dataContainer: HTMLElement;
	private simulationVisualizerEl: HTMLElement;
	private simulationItemSecondEl: HTMLElement;
	private simulationItemSEl: HTMLElement;
	private simulationItemREl: HTMLElement;
	private simulationItemIEl: HTMLElement;
	private playAndPauseButton: HTMLElement;
	private playButton: HTMLElement;
	private pauseButton: HTMLElement;
	private resetButton: HTMLElement;
	private simulationDoneButton: HTMLElement;
	private spaceSimulationInput: HTMLInputElement;
	private restrictionSimulationInput: HTMLInputElement;
	private removeSimulationInput: HTMLInputElement;
	private sliderSpaceValue: HTMLElement;
	private sliderRestrictionValue: HTMLElement;
	private sliderRemoveValue: HTMLElement;
	private spaceSlider: HTMLElement;
	private removeSlider: HTMLElement;
	private restrictionSlider: HTMLElement;
	private simulationStep1Element: HTMLElement;
	private simulationStep2Element: HTMLElement;
	private simulationStep3Element: HTMLElement;
	private indicatorStep1: HTMLElement;
	private indicatorStep2: HTMLElement;
	private indicatorStep3: HTMLElement;
	private navigationNextElement: HTMLElement;
	private navigationPrevElement: HTMLElement;
	private canvasWidth: number;
	private canvasHeight: number;
	private visualHeight: number;

	constructor() {
		super();
		this.canvas = document.getElementById('simulation-visualizer-canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d');
		this.onClickPlayButtonHandler = this.onClickPlayButtonHandler.bind(this);
		this.onClickResetButtonHandler = this.onClickResetButtonHandler.bind(this);

		this.el = document.querySelector('.simulation');
		this.simulationVisualizerEl = document.getElementsByClassName(
			'simulation-visualizer'
		)[0] as HTMLElement;
		this.buttonContainer = document.getElementsByClassName(
			'simulation-visualizer-button-container'
		)[0] as HTMLElement;
		this.dataContainer = document.getElementsByClassName(
			'simulation-visualizer-data-container'
		)[0] as HTMLElement;
		this.simulationItemSecondEl = document.getElementsByClassName(
			'simulation-visualizer__item--value_number_second'
		)[0] as HTMLElement;
		this.simulationItemSEl = document.getElementsByClassName(
			'simulation-visualizer__item--value_number_s'
		)[0] as HTMLElement;
		this.simulationItemIEl = document.getElementsByClassName(
			'simulation-visualizer__item--value_number_i'
		)[0] as HTMLElement;
		this.simulationItemREl = document.getElementsByClassName(
			'simulation-visualizer__item--value_number_r'
		)[0] as HTMLElement;
		this.playAndPauseButton = this.simulationVisualizerEl.querySelector('.button-play-pause');
		this.pauseButton = this.simulationVisualizerEl.querySelector('.button-pause');
		this.playButton = this.simulationVisualizerEl.querySelector('.button-play');
		this.resetButton = this.simulationVisualizerEl.querySelector('.button-replay');
		this.simulationDoneButton = this.simulationVisualizerEl.querySelector(
			'.button-simulation-done'
		);
		this.spaceSimulationInput = document.querySelector('.space-simulation-input');
		this.restrictionSimulationInput = document.querySelector('.restriction-simulation-input');
		this.removeSimulationInput = document.querySelector('.remove-simulation-input');
		this.sliderSpaceValue = document.querySelector('.slider--space_value');
		this.sliderRestrictionValue = document.querySelector('.slider--restriction_value');
		this.sliderRemoveValue = document.querySelector('.slider--remove_value');
		this.simulationStep1Element = this.el.querySelector('.simulation-step_1');
		this.simulationStep2Element = this.el.querySelector('.simulation-step_2');
		this.simulationStep3Element = this.el.querySelector('.simulation-step_3');
		this.navigationNextElement = this.el.querySelector('.step-navigation_next');
		this.navigationPrevElement = this.el.querySelector('.step-navigation_prev');
		this.spaceSlider = this.el.querySelector('.space-slider');
		this.restrictionSlider = this.el.querySelector('.restriction-slider');
		this.removeSlider = this.el.querySelector('.remove-slider');
		this.indicatorStep1 = this.el.querySelector('.step-indicator--step_1');
		this.indicatorStep2 = this.el.querySelector('.step-indicator--step_2');
		this.indicatorStep3 = this.el.querySelector('.step-indicator--step_3');

		this.resize();
		this.addEvents();
	}
	public update(agentRate: number[][], totalTime: number) {
		this.ctx.fillStyle = BLUE;
		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.ctx.save();
		this.ctx.translate(0, 0);
		this.ctx.fillRect(0, 0, this.canvasWidth, this.visualHeight);

		const timeArr = agentRate[0];
		const blueArrRate = agentRate[1];
		const redArrRate = agentRate[2];
		const orangeArrRate = agentRate[3];
		const agentSize = timeArr.length;

		if (agentSize > 1 && totalTime > 0) {
			const dXdT = this.canvasWidth / totalTime;

			this.ctx.fillStyle = ORANGE;
			this.ctx.beginPath();
			this.ctx.moveTo(0, this.visualHeight);
			for (let ii = 0; ii < agentSize; ii = ii + 1) {
				const redOrangeRate = redArrRate[ii] + orangeArrRate[ii];
				const xpos = timeArr[ii] * dXdT;
				const ypos = this.visualHeight * (1 - redOrangeRate);
				this.ctx.lineTo(xpos, ypos);
			}
			this.ctx.lineTo(this.canvasWidth, this.visualHeight);
			this.ctx.closePath();
			this.ctx.fill();

			this.ctx.fillStyle = RED;
			this.ctx.beginPath();
			this.ctx.moveTo(0, this.visualHeight);
			for (let ii = 0; ii < agentSize; ii = ii + 1) {
				const redRate = redArrRate[ii];
				const xpos = timeArr[ii] * dXdT;
				const ypos = this.visualHeight * (1 - redRate);
				this.ctx.lineTo(xpos, ypos);
			}
			this.ctx.lineTo(this.canvasWidth, this.visualHeight);
			this.ctx.closePath();
			this.ctx.fill();

			this.ctx.lineWidth = 1.5;
			this.ctx.strokeStyle = '#666666';
			for (let ii = 1; ii < totalTime; ii = ii + 1) {
				this.ctx.beginPath();
				const xpos = ii * dXdT;
				this.ctx.moveTo(xpos, this.visualHeight - 1.0);
				this.ctx.lineTo(xpos, this.visualHeight + 1.0);
				this.ctx.closePath();

				this.ctx.stroke();
			}
		} else {
		}

		this.ctx.restore();
		const curTime = timeArr[agentSize - 1];
		const curSRate = blueArrRate[agentSize - 1];
		const curIRate = redArrRate[agentSize - 1];
		const curRRate = orangeArrRate[agentSize - 1];
		this.updateData(
			curTime.toFixed(2),
			(curSRate * 100).toFixed(1),
			(curIRate * 100).toFixed(1),
			(curRRate * 100).toFixed(1)
		);
	}
	public show(space: number, restriction: number, removed: number) {
		this.el.style.display = 'block';
		const spaceVal = Number(space - 50);
		const restrictionVal = Number(restriction * 100);
		const removedVal = Number(removed * 100);

		this.spaceSimulationInput.value = `${spaceVal}`;
		this.sliderSpaceValue.innerText = `${space}`;
		this.restrictionSimulationInput.value = `${restrictionVal}`;
		this.sliderRestrictionValue.innerText = `${restrictionVal}`;
		this.removeSimulationInput.value = `${removedVal}`;
		this.sliderRemoveValue.innerText = `${removedVal}`;

		this.resize();
		this.updateData();
	}
	public hide(){
		this.el.style.display = 'none';
	}
	public showScene(simulationStep: string) {
		switch (simulationStep) {
			case '1':
				this.simulationStep1Element.style.display = 'block';
				this.simulationStep2Element.style.display = 'none';
				this.simulationStep3Element.style.display = 'none';
				this.navigationNextElement.style.display = 'block';
				this.navigationNextElement.innerText = 'ステップ2を見る';
				this.navigationPrevElement.style.display = 'none';
				this.spaceSlider.style.display = 'block';
				this.removeSlider.style.display = 'none';
				this.restrictionSlider.style.display = 'none';
				this.indicatorStep1.classList.add('step-indicator--state_active');
				this.indicatorStep2.classList.remove('step-indicator--state_active');
				this.indicatorStep3.classList.remove('step-indicator--state_active');
				break;
			case '2':
				this.simulationStep1Element.style.display = 'none';
				this.simulationStep2Element.style.display = 'block';
				this.simulationStep3Element.style.display = 'none';
				this.navigationNextElement.style.display = 'block';
				this.navigationNextElement.innerText = 'ステップ3を見る';
				this.navigationPrevElement.style.display = 'block';
				this.navigationPrevElement.innerText = 'ステップ1を見る';
				this.spaceSlider.style.display = 'block';
				this.removeSlider.style.display = 'block';
				this.restrictionSlider.style.display = 'none';
				this.indicatorStep2.classList.add('step-indicator--state_active');
				this.indicatorStep1.classList.remove('step-indicator--state_active');
				this.indicatorStep3.classList.remove('step-indicator--state_active');
				break;
			case '3':
				this.simulationStep1Element.style.display = 'none';
				this.simulationStep2Element.style.display = 'none';
				this.simulationStep3Element.style.display = 'block';
				this.navigationNextElement.style.display = 'none';
				this.navigationPrevElement.style.display = 'block';
				this.navigationPrevElement.innerText = 'ステップ2を見る';
				this.spaceSlider.style.display = 'block';
				this.removeSlider.style.display = 'block';
				this.restrictionSlider.style.display = 'block';
				this.indicatorStep3.classList.add('step-indicator--state_active');
				this.indicatorStep1.classList.remove('step-indicator--state_active');
				this.indicatorStep2.classList.remove('step-indicator--state_active');
				break;
			default:
		}
	}
	public reset() {}
	public resize() {
		const buttonElWidth = this.buttonContainer.clientWidth;
		const dataElWidth = this.dataContainer.clientWidth;
		const dataElLeft = this.dataContainer.clientLeft;
		const dataElTop = this.dataContainer.clientTop;
		const { viewportWidth } = WindowManager.GET_SIZE();

		const customMargin = viewportWidth < breakpoint2 ? 75 : viewportWidth < breakpoint1 ? 100 : viewportWidth < breakpoint3 ? 100 : 125;
		const canvasWidth = viewportWidth - customMargin - buttonElWidth - dataElWidth;

		this.canvasWidth = canvasWidth;
		this.canvasHeight = this.simulationVisualizerEl.clientHeight;
		this.canvas.width = this.canvasWidth;
		this.canvas.height = this.canvasHeight;
		this.canvas.style.width = `${canvasWidth}px`;
		this.canvas.style.height = `${this.simulationVisualizerEl.clientHeight}px`;
		this.visualHeight = viewportWidth < breakpoint1 ? this.canvasHeight - 50 : viewportWidth < breakpoint3 ? this.canvasHeight - 30 : this.canvasHeight - 30;
	}
	public updateSimulationState(appState: string) {
		if (appState === SIMULATION.PAUSE) {
			this.playButton.classList.remove('simulation-visualizer-button--state_inactive');
			this.pauseButton.classList.add('simulation-visualizer-button--state_inactive');
		} else {
			this.pauseButton.classList.remove('simulation-visualizer-button--state_inactive');
			this.playButton.classList.add('simulation-visualizer-button--state_inactive');
		}
		this.simulationDoneButton.classList.add('simulation-visualizer-button--state_inactive');
	}
	public doneSimulation() {
		this.playAndPauseButton.style.cursor = 'default';
		this.playButton.classList.add('simulation-visualizer-button--state_inactive');
		this.pauseButton.classList.add('simulation-visualizer-button--state_inactive');
	}
	public startSimulation() {
		this.playAndPauseButton.style.cursor = 'pointer';
		// this.playAndPauseButton.style.opacity = '1';
	}
	private updateData(
		curTime: string = '0',
		sRate: string = '100',
		iRate: string = '0',
		rRate: string = '0'
	) {
		this.simulationItemSecondEl.innerText = curTime;
		this.simulationItemSEl.innerText = sRate;
		this.simulationItemIEl.innerText = iRate;
		this.simulationItemREl.innerText = rRate;
	}
	private addEvents() {
		this.playAndPauseButton.addEventListener('click', this.onClickPlayButtonHandler);
		this.resetButton.addEventListener('click', this.onClickResetButtonHandler);

		// space value
		this.spaceSimulationInput.addEventListener('change', () => {
			this.sliderSpaceValue.innerText = `${Number(this.spaceSimulationInput.value) + 50}`;
			// this.dispatchEvent({ type: UPDATE_SPACE_SIZE, value: this.spaceSimulationInput.value });
		});

		this.spaceSimulationInput.addEventListener('input', () => {
			this.sliderSpaceValue.innerText = `${Number(this.spaceSimulationInput.value) + 50}`;
			this.dispatchEvent({ type: UPDATE_SPACE_SIZE, value: this.spaceSimulationInput.value });
		});

		// restriction value
		this.restrictionSimulationInput.addEventListener('change', () => {
			this.sliderRestrictionValue.innerText = this.restrictionSimulationInput.value;
			// this.dispatchEvent({
			// 	type: UPDATE_RESTRICTION,
			// 	value: this.restrictionSimulationInput.value
			// });
		});

		this.restrictionSimulationInput.addEventListener('input', () => {
			this.sliderRestrictionValue.innerText = this.restrictionSimulationInput.value;
			this.dispatchEvent({
				type: UPDATE_RESTRICTION,
				value: this.restrictionSimulationInput.value
			});
		});

		// remove value
		this.removeSimulationInput.addEventListener('change', () => {
			this.sliderRemoveValue.innerText = this.removeSimulationInput.value;
			// this.dispatchEvent({
			// 	type: UPDATE_REMOVE,
			// 	value: this.removeSimulationInput.value
			// });
		});

		this.removeSimulationInput.addEventListener('input', () => {
			this.sliderRemoveValue.innerText = this.removeSimulationInput.value;
			this.dispatchEvent({
				type: UPDATE_REMOVE,
				value: this.removeSimulationInput.value
			});
		});

		this.navigationNextElement.addEventListener('click', () => {
			this.dispatchEvent({ type: MOVE_NEXT_STEP });
		});
		this.navigationPrevElement.addEventListener('click', () => {
			this.dispatchEvent({ type: MOVE_PREV_STEP });
		});
		this.indicatorStep1.addEventListener('click', () => {
			this.dispatchEvent({ type: UPDATE_STEP, step: '1' });
		});
		this.indicatorStep2.addEventListener('click', () => {
			this.dispatchEvent({ type: UPDATE_STEP, step: '2' });
		});
		this.indicatorStep3.addEventListener('click', () => {
			this.dispatchEvent({ type: UPDATE_STEP, step: '3' });
		});
	}
	private onClickPlayButtonHandler() {
		this.dispatchEvent({ type: CLICK_PLAY_PAUSE_BTN });
	}

	private onClickResetButtonHandler() {
		console.log('click');
		this.dispatchEvent({ type: CLICK_RESET_BTN });
	}
}
