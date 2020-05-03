import { BoxGeometry, EventDispatcher, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry, Scene, Vector2 } from 'three';
import { IBase } from '../app';

export class Boundary extends EventDispatcher implements IBase {
	private plane: Mesh;
	private size: Vector2 = new Vector2(100, 100);

	constructor() {
		super();

		this.plane = new Mesh(new BoxGeometry(1, 1, 1), new MeshPhongMaterial({ color: 0xd0d0d0 }));
		this.reset();
	}

	public addScene(scene: Scene) {
		scene.add(this.plane);
	}

	public addSize(width: number, height: number) {
		this.size.set(width, height);
		this.reset();
    }
    

	public getSize() {
		return this.size;
	}

	public reset() {
		
		this.plane.scale.set(this.size.x, 5, this.size.y);
		this.plane.position.y = -2.51;
		// this.plane.scale.set(this.size.x, this.size.y, 10);
	}

	public getBoundary() {
		const maxX = this.size.x / 2 - 0.5;
		const minX = -this.size.x / 2 + 0.5;
		const maxZ = this.size.y / 2- 0.5;
		const minZ = -this.size.y / 2+ 0.5;

		return { minX, maxX, minZ, maxZ };
	}
}
