import { EventDispatcher } from 'three';
import { NAVIGATE_RULE, NAVIGATE_SIMULATION, NAVIGATE_TOP } from '../threejs/utils/eventNames';

export class Navigation extends EventDispatcher {
	private el: HTMLElement;
	private topEl: HTMLElement;
	private ruleEl: HTMLElement;
	private simulationEl: HTMLElement;
	constructor() {
		super();

		this.el = document.getElementById('navigation');
		this.topEl = this.el.querySelector('.navigation-element-top');
		this.ruleEl = this.el.querySelector('.navigation-element-rule');
		this.simulationEl = this.el.querySelector('.navigation-element-simulation');

		this.addEvents();
	}

	private addEvents() {
		this.topEl.addEventListener('click', () => {
			this.dispatchEvent({ type: NAVIGATE_TOP });
		});
		this.ruleEl.addEventListener('click', () => {
			this.dispatchEvent({ type: NAVIGATE_RULE });
		});
		this.simulationEl.addEventListener('click', () => {
			this.dispatchEvent({ type: NAVIGATE_SIMULATION });
		});
	}
}
