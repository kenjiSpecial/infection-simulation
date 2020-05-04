import gsap from 'gsap';
import {
	BoxGeometry,
	EventDispatcher,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PlaneGeometry,
	Scene,
	Vector2
} from 'three';
import { IBase } from '../app';

export class Boundary extends EventDispatcher implements IBase {
	private plane: Mesh;
	private removedPlace: Mesh;
	private size: Vector2 = new Vector2(100, 100);
	private willRemovePlaceShow: boolean = false;

	constructor() {
		super();

		this.plane = new Mesh(new BoxGeometry(1, 1, 1), new MeshPhongMaterial({ color: 0xd0d0d0 }));
		this.removedPlace = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshPhongMaterial({ color: 0xd0d0d0, transparent: true, opacity: 0 })
		);
		this.removedPlace.visible = false;
		this.reset();
	}

	public addScene(scene: Scene) {
		scene.add(this.plane);
		scene.add(this.removedPlace);
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

		this.removedPlace.scale.set(this.size.x, 1, this.size.y);
		this.removedPlace.position.y = -30.5;
	}

	public getBoundary() {
		const maxX = this.size.x / 2 - 0.5;
		const minX = -this.size.x / 2 + 0.5;
		const maxZ = this.size.y / 2 - 0.5;
		const minZ = -this.size.y / 2 + 0.5;

		return { minX, maxX, minZ, maxZ };
	}
	public showBed() {
		if(this.willRemovePlaceShow){
			return;
		}

		this.willRemovePlaceShow = true;
		gsap.killTweensOf(this.removedPlace.material);
		this.removedPlace.visible = true;
		gsap.to(this.removedPlace.material, { opacity: 1.2, duration: 1, ease: 'power4.inOut' });
	}
	public hideBed() {
		if(!this.willRemovePlaceShow){
			return;
		}

		this.willRemovePlaceShow = false;
		gsap.killTweensOf(this.removedPlace.material);

		gsap.to(this.removedPlace.material, {
			opacity: 0,
			duration: 1.2,
			ease: 'power4.inOut',
			onComplete: () => {
				this.removedPlace.visible = false;
			}
		});
	}
}
