import gsap from 'gsap';
import {
	BufferGeometry,
	CircleGeometry,
	Color,
	EventDispatcher,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	Object3D
} from 'three';

export class RuleAgent extends EventDispatcher {
	private agentObject: Object3D = new Object3D();
	private material: MeshBasicMaterial;
	private shadowMaterial: MeshBasicMaterial;
	private color: Color;
	private tl: gsap.core.Timeline;
	private delayedCall: gsap.core.Tween;
	constructor(agentBody: BufferGeometry, color: Color) {
		super();
		this.color = color;

		this.createAgentObject(agentBody);
	}

	public addContainer(container: Object3D) {
		container.add(this.agentObject);
	}

	public setPosition(xpos: number, ypos: number, zpos: number) {
		this.agentObject.position.set(xpos, ypos, zpos);
	}

	public repeatAnimation(delay: number) {
		this.tl = gsap.timeline({ repeat: -1, delay: 0.2 });
		this.agentObject.position.x = 0;
		this.tl
			.to(this.agentObject.position, { x: -4, duration: 1, ease: 'linear' })
			.to(this.agentObject.position, { x: 4, duration: 2, ease: 'linear' })
			.to(this.agentObject.position, { x: 0, duration: 1, ease: 'linear' });
	}
	public killRepeatAnimation() {
		if (this.tl) {
			this.tl.kill();
		}
	}
	public delayCall(duration: number, initColor: Color, afterColor: Color) {
		this.material.color = initColor;
		this.delayedCall = gsap.delayedCall(duration, () => {
			this.material.color = afterColor;
		});
	}
	public killedDelayedCall() {
		if (this.delayedCall) {
			this.delayedCall.kill();
		}
	}

	private createAgentObject(agentBody: BufferGeometry) {
		this.material = new MeshPhongMaterial({ color: this.color });
		const peopleMesh = new Mesh(agentBody, this.material);

		const circleGeometry = new CircleGeometry(0.6, 12);
		this.shadowMaterial = new MeshBasicMaterial({
			color: 0xdddddd,
			transparent: true,
			opacity: 1
		});
		const shadowMesh = new Mesh(circleGeometry, this.shadowMaterial);
		shadowMesh.rotation.x = -Math.PI / 2;

		this.agentObject.add(peopleMesh);
		this.agentObject.add(shadowMesh);
	}
}
