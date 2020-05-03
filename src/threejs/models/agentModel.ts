import gsap from 'gsap';
import { Color, EventDispatcher, MathUtils, Vector3 } from 'three';
import { IBase } from '../app';
import { AGENT_COLOR, AGENT_STATE } from '../utils/constants';
import { REMOVED_AGENT, UPDATE_POSITION, UPDATE_STATE, WILL_REMOVE_AGENT } from '../utils/eventNames';

export interface IModel {
	id: string;
	velocity: Vector3;
	state: string;
	setPosition(x: number, y: number, z: number): void;
	getPosition(): Vector3;
	update(dt: number, infectionDuration: number): void;
	reset(scene: string, restrictRate: number): void;
	setBoundary(boundary: { minX: number; maxX: number; minZ: number; maxZ: number }): void;
}

const minVel = -20;
const maxVel = 20;
export class AgentModel extends EventDispatcher implements IModel {
	public id: string = Math.random()
		.toString(36)
		.substr(2, 9);
	public velocity: Vector3 = new Vector3(
		MathUtils.randFloat(minVel, maxVel),
		0,
		MathUtils.randFloat(minVel, maxVel)
	);
	public state: string = AGENT_STATE.S;
	public color: Color;
	private position: Vector3 = new Vector3();
	private infectionTime: number = 0;
	private orderRate: number;
	private removeRate: number;
	private boundary: { minX: number; maxX: number; minZ: number; maxZ: number } = {
		minX: 0,
		maxX: 0,
		minZ: 0,
		maxZ: 0
	};
	private isRemoved: boolean = false;
	private delayedCall1: gsap.core.Tween;

	constructor() {
		super();

		this.color = AGENT_COLOR[this.state].clone();
	}

	public setBoundary(boundary: { minX: number; maxX: number; minZ: number; maxZ: number }) {
		this.boundary = boundary;
	}

	public setInfection(removeRate: number) {
		if (this.state === AGENT_STATE.I) {
			return;
		}
		this.state = AGENT_STATE.I;
		this.color = AGENT_COLOR[this.state].clone();

		if (this.removeRate < removeRate) {
			gsap.killTweensOf(this.position, 'x,y,z');

			this.delayedCall1 = gsap.delayedCall(0.0, () => {
				this.isRemoved = true;
			});
			gsap.to(this.position, {
				duration: 1.2,
				y: 5,
				onUpdate: () => {
					this.dispatchEvent({ type: UPDATE_POSITION });
				},
				onComplete: () => {
					this.isRemoved = true;
				},
				ease: 'power4.inOut'
			});
			
			this.dispatchEvent({ type: WILL_REMOVE_AGENT });
		}

		this.dispatchEvent({ type: UPDATE_STATE });
	}

	public setSusceptible() {
		if (this.state === AGENT_STATE.S) {
			return;
		}
		this.state = AGENT_STATE.S;
		this.color = AGENT_COLOR[this.state].clone();
		this.dispatchEvent({ type: UPDATE_STATE });
	}

	public setRecover() {
		if (this.state === AGENT_STATE.R) {
			return;
		}
		this.state = AGENT_STATE.R;
		this.color = AGENT_COLOR[this.state].clone();

		this.dispatchEvent({ type: UPDATE_STATE });

		if (this.isRemoved) {
			gsap.killTweensOf(this.position, 'x,y,z');
			gsap.to(this.position, {
				duration: 1.2,
				y: 0,
				onUpdate: () => {
					this.dispatchEvent({ type: UPDATE_POSITION });
				},
				onComplete: () => {
					this.isRemoved = true;
				},
				ease: 'power4.inOut'
			});

			this.dispatchEvent({type: REMOVED_AGENT})
		}
	}

	public collide(
		dt: number,
		otherModel: AgentModel,
		otherModelVelocity: Vector3,
		infectiousProbability: number,
		removeRate: number
	) {
		const posX = this.position.x - this.velocity.x * dt;
		const posY = this.position.y - this.velocity.y * dt;
		const posZ = this.position.z - this.velocity.z * dt;

		this.setPosition(posX, posY, posZ);

		this.velocity.set(this.velocity.x * -1, 0, this.velocity.z * -1);

		if (this.state === AGENT_STATE.S && otherModel.state === AGENT_STATE.I) {
			if (Math.random() < infectiousProbability) {
				this.setInfection(removeRate);
			}
		}
	}

	public update(dt: number, infectionDuration: number) {
		this.updateInfectious(dt, infectionDuration);

		if (this.isRemoved) {
			return;
		}

		let posX = this.position.x + this.velocity.x * dt;
		const posY = this.position.y + this.velocity.y * dt;
		let posZ = this.position.z + this.velocity.z * dt;

		if (posX > this.boundary.maxX) {
			posX = this.boundary.maxX;
			this.velocity.x = this.velocity.x * -1;
		} else if (posX < this.boundary.minX) {
			posX = this.boundary.minX;
			this.velocity.x = this.velocity.x * -1;
		}

		if (posZ > this.boundary.maxZ) {
			posZ = this.boundary.maxZ;
			this.velocity.z = this.velocity.z * -1;
		} else if (posZ < this.boundary.minZ) {
			posZ = this.boundary.minZ;
			this.velocity.z = this.velocity.z * -1;
		}

		this.setPosition(posX, posY, posZ);
	}

	public reset(scene: string, restrictRate: number) {
		gsap.killTweensOf(this.position, 'x,y,z');
		if (this.delayedCall1) {
			this.delayedCall1.kill();
		}

		if (this.orderRate < restrictRate && this.state !== AGENT_STATE.I) {
			this.velocity.set(0, 0, 0);
		} else {
			this.velocity.set(
				MathUtils.randFloat(minVel, maxVel),
				0,
				MathUtils.randFloat(minVel, maxVel)
			);
		}

		this.infectionTime = 0;
		this.isRemoved = false;
	}

	public setPosition(x: number, y: number, z: number) {
		this.position.set(x, y, z);
		this.dispatchEvent({ type: UPDATE_POSITION });
	}

	public updateOrderRate(orderRate: number) {
		this.orderRate = orderRate;
	}

	public updateRemoveRate(removeRate: number) {
		this.removeRate = removeRate;
	}

	public getPosition() {
		return this.position;
	}

	public getIsRemoved() {
		return this.isRemoved;
	}

	private updateInfectious(dt: number, infectionDuration: number) {
		if (this.state === AGENT_STATE.I) {
			this.infectionTime = this.infectionTime + dt;
			if (this.infectionTime >= infectionDuration) {
				this.setRecover();
			}
		}
	}
}
