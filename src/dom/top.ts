import { EventDispatcher } from 'three';
import { CLICK_RULE_BTN, CLICK_SIM_BTN } from '../threejs/utils/eventNames';

export class Top extends EventDispatcher {
	public el: HTMLElement;
	constructor() {
		super();

		this.el = document.getElementById('top');
		const ruleBtn = this.el.querySelector('.button-rule');
		const simulationBtn = this.el.querySelector('.button-simulation');

		ruleBtn.addEventListener('click', () => {
			this.dispatchEvent({ type: CLICK_RULE_BTN });
		});
		simulationBtn.addEventListener('click', () => {
			this.dispatchEvent({ type: CLICK_SIM_BTN });
		});
	}

	public show() {
		this.el.style.display = 'block';
	}

	public hide() {
		this.el.style.display = 'none';
	}
}
