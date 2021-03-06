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


window.dataLayer = window.dataLayer || [];
function gtag() {
	dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-42485016-4');

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
					gtag('config', 'UA-42485016-4', { page_path: `/simulation/${step}` });
				},
				'/rule/:step': params => {
					const step = params.step;
					this.app.showRule(step);
					gtag('config', 'UA-42485016-4', { page_path: `/rule/${step}` });
				},
				'*': () => {
					this.app.showTop();
					gtag('config', 'UA-42485016-4', { page_path: '/' });
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
