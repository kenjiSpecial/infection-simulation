import { Camera, Scene, WebGLRenderer } from 'three';
import { IBase } from '../app';

export interface IRender {
	render(scene: Scene, camera: Camera): void;
	resize(width: number, height: number): void;
}

/**
 * execute rendering
 */
export class Renderer implements IRender, IBase {
	private renderer: WebGLRenderer;
	constructor(canvas: HTMLCanvasElement) {
		this.renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
		const PIXEL_RATIO = window.devicePixelRatio > 1 ? 1.5 : 1;
		this.renderer.setPixelRatio ( PIXEL_RATIO )
		this.reset();
	}
	public render(scene: Scene, camera: Camera) {
		this.renderer.clear();
		this.renderer.render(scene, camera);
	}
	public resize(width: number, height: number) {
		this.renderer.setSize(width, height);
	}
	public reset() {
		this.renderer.autoClear = false;
		this.renderer.setClearColor(0xaaaaaa, 1);
	}
}
