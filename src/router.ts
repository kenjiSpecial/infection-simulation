// import * as Navigo from 'navigo';
// const Navigo = require('navigo');
import Navigo = require('navigo');
import { App } from '.';
import {
	MOVE_NEXT_STEP,
	MOVE_PREV_STEP,
	NAVIGATE_RULE,
	NAVIGATE_SIMULATION,
	NAVIGATE_TOP,
	UPDATE_RULE,
	UPDATE_STEP
} from './threejs/utils/eventNames';

export class Router {
	private router: Navigo;
	private app: App;
	constructor() {
		const useHash = true; // Defaults to: false
		const hash = '#!'; // Defaults to: '#'
		this.router = new Navigo(null, useHash, hash);
		this.app = new App();

		this.router
			.on({
				'/simulation/:step': params => {
					const step = params.step;
					this.app.showSimulation(step);
					gtag('config', 'GA_MEASUREMENT_ID', {'page_path': `/simulation/${step}`});
				},
				'/rule/:step': params => {
					const step = params.step;
					this.app.showRule(step);
					gtag('config', 'GA_MEASUREMENT_ID', {'page_path': `/rule/${step}`});
				},
				'*': () => {
					this.app.showTop();
					gtag('config', 'GA_MEASUREMENT_ID', {'page_path': '/'});
				}
			})
			.resolve();
		this.addEvents();
	}
	public startToLoad() {
		this.app.startToLoad();
	}
	private addEvents() {
		this.app.addEventListener(UPDATE_STEP, event => {
			this.router.navigate(`/simulation/${event.step}`);
		});
		this.app.addEventListener(NAVIGATE_TOP, () => {
			this.router.navigate(``);
		});
		this.app.addEventListener(NAVIGATE_RULE, () => {
			this.router.navigate(`/rule/1`);
		});
		this.app.addEventListener(NAVIGATE_SIMULATION, () => {
			this.router.navigate(`/simulation/1`);
		});
		this.app.addEventListener(UPDATE_RULE, event => {
			this.router.navigate(`/rule/${event.step}`);
		});
	}
}
