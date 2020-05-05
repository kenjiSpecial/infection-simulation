import gsap from 'gsap';
import {
	BufferGeometry,
	CircleGeometry,
	EventDispatcher,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	Object3D,
	Scene,
	Vector3
} from 'three';
import { AgentModel } from '../models/agentModel';
import {
	REMOVED_AGENT,
	UPDATE_COLOR,
	UPDATE_POSITION,
	UPDATE_STATE,
	WILL_REMOVE_AGENT
} from '../utils/eventNames';

export class Agent extends EventDispatcher {
	private model: AgentModel = new AgentModel();
	private agentObject: Object3D = new Object3D();
	private material: MeshBasicMaterial;
	private shadowMaterial: MeshBasicMaterial;
	constructor(agentBody: BufferGeometry, x: number, y: number, z: number) {
		super();
		this.onUpdatePositionHandler = this.onUpdatePositionHandler.bind(this);
		this.onUpdateStateHandler = this.onUpdateStateHandler.bind(this);
		this.onWillRemoveAgentHandler = this.onWillRemoveAgentHandler.bind(this);
		this.onRemovedAgentHandler = this.onRemovedAgentHandler.bind(this);

		this.createAgentObject(agentBody);
		this.model.addEventListener(UPDATE_POSITION, this.onUpdatePositionHandler);
		this.model.addEventListener(UPDATE_STATE, this.onUpdateStateHandler);
		this.model.addEventListener(WILL_REMOVE_AGENT, this.onWillRemoveAgentHandler);
		this.model.addEventListener(REMOVED_AGENT, this.onRemovedAgentHandler);

		this.model.setPosition(x, y, z);
	}

	public update(dt: number = 0, infectionDuration: number) {
		this.model.update(dt, infectionDuration);
	}

	public updateRemoveRate(rate: number) {
		this.model.updateRemoveRate(rate);
	}

	public updateOrderRate(rate: number) {
		this.model.updateOrderRate(rate);
	}

	public addScene(scene: Scene) {
		scene.add(this.agentObject);
	}

	public removeScene(scene: Scene) {
		scene.remove(this.agentObject);
	}

	public setBondary(boudary: { minX: number; maxX: number; minZ: number; maxZ: number }) {
		this.model.setBoundary(boudary);
	}

	public setInfection(removeRate: number) {
		this.model.setInfection(removeRate);
	}

	public setSusceptible() {
		this.model.setSusceptible();
	}

	public setPosition(xx: number, yy: number, zz: number) {
		this.model.setPosition(xx, yy, zz);
	}

	public getModel() {
		return this.model;
	}

	public resetModel(scene: string, restrictRate: number) {
		this.model.reset(scene, restrictRate);
	}

	public resetLook() {
		this.shadowMaterial.opacity = 1;
	}

	public savePosition(){
		this.model.savePosition();
	}

	public saveState(){
		this.model.saveState();
	}

	public findIndex(index: number){
		this.model.findIndex(index);
	}

	private createAgentObject(agentBody: BufferGeometry) {
		this.material = new MeshPhongMaterial({ color: this.model.color });
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

	private onUpdatePositionHandler() {
		const modelPosition = this.model.getPosition();
		this.agentObject.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
	}

	private onUpdateStateHandler() {
		// console.log(this.model.color);
		this.material.color = this.model.color;
	}

	private onWillRemoveAgentHandler() {
		gsap.killTweensOf(this.shadowMaterial, 'opacity');
		gsap.to(this.shadowMaterial, { duration: 1.2, opacity: 0, ease: 'power4.out' });
	}

	private onRemovedAgentHandler() {
		gsap.killTweensOf(this.shadowMaterial, 'opacity');
		gsap.to(this.shadowMaterial, { duration: 1.2, opacity: 1, ease: 'power4.in' });
	}
}
