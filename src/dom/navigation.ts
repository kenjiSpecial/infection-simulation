import { EventDispatcher } from 'three';
import { SCENE } from '../threejs/utils/constants';
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

	public update(scene: string){
		switch(scene){
			case SCENE.TOP:
				this.topEl.classList.add('navigation-element--state_active');
				this.ruleEl.classList.remove('navigation-element--state_active');
				this.simulationEl.classList.remove('navigation-element--state_active');
				break;
			case SCENE.SIMULATION:
				this.topEl.classList.remove('navigation-element--state_active');
				this.ruleEl.classList.remove('navigation-element--state_active');
				this.simulationEl.classList.add('navigation-element--state_active');
				break;
			case SCENE.RULE:
				this.topEl.classList.remove('navigation-element--state_active');
				this.ruleEl.classList.add('navigation-element--state_active');
				this.simulationEl.classList.remove('navigation-element--state_active');
				break;
			default:
		}
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
