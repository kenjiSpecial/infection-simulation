import gsap from 'gsap';
import { EventDispatcher } from 'three';
import {
	MOVE_NEXT_STEP,
	MOVE_PREV_STEP,
	NAVIGATE_RULE,
	NAVIGATE_SIMULATION,
	NAVIGATE_TOP,
	UPDATE_RULE
} from '../threejs/utils/eventNames';

export class Rule extends EventDispatcher {
	private el: HTMLElement;
	private rule1El: HTMLElement;
	private rule2El: HTMLElement;
	private rule3El: HTMLElement;
	private rule1ContentEl: HTMLElement;
	private rule2ContentEl: HTMLElement;
	private rule3ContentEl: HTMLElement;
	private nextEl: HTMLElement;
	private prevEl: HTMLElement;
	private indicatorStep1: HTMLElement;
	private indicatorStep2: HTMLElement;
	private indicatorStep3: HTMLElement;
	private sliderBase: HTMLElement;
	private progress: number = 0;
	constructor() {
		super();

		this.el = document.getElementById('rule');
		this.rule1El = this.el.querySelector('.rule-container_one');
		this.rule2El = this.el.querySelector('.rule-container_two');
		this.rule3El = this.el.querySelector('.rule-container_three');
		this.nextEl = this.el.querySelector('.step-navigation_next');
		this.prevEl = this.el.querySelector('.step-navigation_prev');
		this.rule1ContentEl = this.el.querySelector('.rule-one-content');
		this.rule2ContentEl = this.el.querySelector('.rule-two-content');
		this.rule3ContentEl = this.el.querySelector('.rule-three-content');
		this.indicatorStep1 = this.el.querySelector('.step-indicator--step_1');
		this.indicatorStep2 = this.el.querySelector('.step-indicator--step_2');
		this.indicatorStep3 = this.el.querySelector('.step-indicator--step_3');
		this.sliderBase = this.el.querySelector('.parameter-container')

		this.addEvents();
	}
	public show() {
		if (this.el.style.display === 'block') {
			return;
		}
		this.el.style.display = 'block';
	}
	public hide(){
		if (this.el.style.display === 'none') {
			return;
		}
		this.el.style.display = 'none';
	}
	public updateRule(rule: string) {
		switch (rule) {
			case '1':
				this.showRule1();
				break;
			case '2':
				this.showRule2();
				break;
			case '3':
				this.showRule3();
				break;
			default:
		}
	}
	private addEvents() {
		this.nextEl.addEventListener('click', () => {
			this.dispatchEvent({ type: MOVE_NEXT_STEP });
		});
		this.prevEl.addEventListener('click', () => {
			this.dispatchEvent({ type: MOVE_PREV_STEP });
		});
		this.indicatorStep1.addEventListener('click', ()=>{
			this.dispatchEvent({ type: UPDATE_RULE, step: '1'})
		});
		this.indicatorStep2.addEventListener('click', ()=>{
			this.dispatchEvent({ type: UPDATE_RULE, step: '2'})
		});
		this.indicatorStep3.addEventListener('click', ()=>{
			this.dispatchEvent({ type: UPDATE_RULE, step: '3'})
		});
	}
	private showRule1() {
		this.rule1El.style.display = 'block';
		this.rule2El.style.display = 'none';
		this.rule3El.style.display = 'none';

		this.rule1ContentEl.style.display = 'block';
		this.rule2ContentEl.style.display = 'none';
		this.rule3ContentEl.style.display = 'none';

		this.nextEl.style.display = 'block';
		this.prevEl.style.display = 'none';
		this.nextEl.innerText = "ルール2を見る"

		this.indicatorStep1.classList.add('step-indicator--state_active');
		this.indicatorStep2.classList.remove('step-indicator--state_active');
		this.indicatorStep3.classList.remove('step-indicator--state_active');
		gsap.killTweensOf(this, 'progress');
	}
	private showRule2() {
		this.rule1El.style.display = 'none';
		this.rule2El.style.display = 'block';
		this.rule3El.style.display = 'none';

		this.rule1ContentEl.style.display = 'none';
		this.rule2ContentEl.style.display = 'block';
		this.rule3ContentEl.style.display = 'none';

		this.nextEl.style.display = 'block';
		this.nextEl.innerText = "ルール3を見る"
		this.prevEl.style.display = 'block';
		this.prevEl.innerText = "ルール1を見る"

		this.indicatorStep2.classList.add('step-indicator--state_active');
		this.indicatorStep1.classList.remove('step-indicator--state_active');
		this.indicatorStep3.classList.remove('step-indicator--state_active');
		gsap.killTweensOf(this, 'progress');
	}
	private showRule3() {
		this.rule1El.style.display = 'none';
		this.rule2El.style.display = 'none';
		this.rule3El.style.display = 'block';

		this.rule1ContentEl.style.display = 'none';
		this.rule2ContentEl.style.display = 'none';
		this.rule3ContentEl.style.display = 'block';

		this.nextEl.style.display = 'none';
		this.prevEl.style.display = 'block';
		this.prevEl.innerText = "ルール2を見る"

		this.indicatorStep3.classList.add('step-indicator--state_active');
		this.indicatorStep1.classList.remove('step-indicator--state_active');
		this.indicatorStep2.classList.remove('step-indicator--state_active');

		gsap.fromTo(this, {progress: 0}, {progress: 1, onUpdate: ()=>{
			this.sliderBase.style.width = `${this.progress * 100}%`
		}, duration: 1.8, delay: 0.2});
	}
}
