import { EventDispatcher } from 'three';
import { FOOTER_HEIGHT, PIXEL_RATIO } from './constants';
import { RESIZE } from './eventNames';

export class WindowManager extends EventDispatcher {
	private static instance: WindowManager;
	private viewWidth: number;
	private viewHeight: number;
	private canvasWidth: number;
	private canvasHeight: number;
	private viewportWidth: number;
	private viewportHeight: number;

	private constructor() {
		super();

		window.addEventListener('resize', () => {
			this.setSize(window.innerWidth, window.innerHeight);
		});
		this.setSize(window.innerWidth, window.innerHeight);
	}

	public static GET_INSTANCE() {
		if (!WindowManager.instance) {
			WindowManager.instance = new WindowManager();
			// ... any one time initialization goes here ...
		}

		return WindowManager.instance;
	}

	public static GET_SIZE() {
		if (!WindowManager.instance) {
			WindowManager.instance = new WindowManager();
			// ... any one time initialization goes here ...
		}

		return WindowManager.instance.getSize();
	}

	public setSize(width: number, height: number) {
		this.viewportWidth = width;;
		this.viewportHeight = height - this.getFooterHeight();

		this.canvasWidth = this.viewportWidth * PIXEL_RATIO; 
		this.canvasHeight = this.viewportHeight * PIXEL_RATIO;

		this.dispatchEvent({ type: RESIZE });
	}

	public getSize() {
		return {
			canvasWidth: this.canvasWidth,
			canvasHeight: this.canvasHeight,
			viewportWidth: this.viewportWidth,
			viewportHeight: this.viewportHeight
		};
	}

	private getFooterHeight() {
		return FOOTER_HEIGHT;
	}
}
