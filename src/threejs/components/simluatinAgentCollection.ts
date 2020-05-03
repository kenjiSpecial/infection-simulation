import { EventDispatcher, MathUtils, Scene, Vec2, Vector2 } from 'three';
import { IBase, IComponentBase } from '../app';
import { AgentModel } from '../models/agentModel';
import { GLAppModel } from '../models/glAppModel';
import { AGENT_STATE, COLLIDE_DIS } from '../utils/constants';
import { Agent } from './agent';
import { AgentFactory } from './agentFactory';

export class SimluatinAgentCollection extends EventDispatcher {
	private agentFactory: AgentFactory;
	private agentArr: Agent[] = [];
	private agentRateArr: number[] = [];
	private row: number = 20;
	private col: number = 20;
	constructor(agentFactory: AgentFactory) {
		super();

		this.agentFactory = agentFactory;

		this.createAgents();
	}
	public update(
		dt: number,
		infectionDuration: number,
		infectionDistance: number,
		infectiousProbability: number,
		removeRate: number
	) {
		for (const agent of this.agentArr) {
			agent.update(dt, infectionDuration);
		}

		for (let i = 0; i < this.agentArr.length; i = i + 1) {
			const agentModelA = this.agentArr[i].getModel();
			for (let j = i + 1; j < this.agentArr.length; j = j + 1) {
				const agentModelB = this.agentArr[j].getModel();

				if (!agentModelA.getIsRemoved() && !agentModelB.getIsRemoved()) {
					this.calcCollide(
						dt,
						agentModelA,
						agentModelB,
						infectionDistance,
						infectiousProbability,
						removeRate
					);
				}
			}
		}

		this.calcAgentRate();
	}
	public setBoundary(boundary: { minX: number; maxX: number; minZ: number; maxZ: number }) {
		for (const agent of this.agentArr) {
			agent.setBondary(boundary);
		}
	}
	public reset(boundarySize: Vector2, step: string, restrictRate: number) {
		function shuffle(array) {
			array.sort(() => Math.random() - 0.5);
		}

		const margin = 2;

		const dX = (boundarySize.x - margin * 2) / (this.row - 1 + 0.5);
		const dZ = (boundarySize.y - margin * 2) / (this.col - 1);
		const minX = -boundarySize.x / 2 + margin;
		const minZ = -boundarySize.y / 2 + margin;

		const randIndex = MathUtils.randInt(0, this.agentArr.length);

		const agentSize = this.agentArr.length;

		shuffle(this.agentArr);
		for (let ii = 0; ii < this.agentArr.length; ii = ii + 1) {
			const rate = step === '3' ? ii / agentSize : 1.01;
			this.agentArr[ii].updateOrderRate(rate);
		}
		shuffle(this.agentArr);
		for (let ii = 0; ii < this.agentArr.length; ii = ii + 1) {
			const rate = step === '1' ? 1.01 : ii / agentSize;
			this.agentArr[ii].updateRemoveRate(rate);
		}
		shuffle(this.agentArr);

		for (let xx = 0; xx < this.row; xx = xx + 1) {
			for (let zz = 0; zz < this.col; zz = zz + 1) {
				const index = xx + zz * this.row;
				const xpos = zz % 2 === 0.0 ? minX + xx * dX : minX + (xx + 0.5) * dX;
				const zpos = minZ + zz * dZ;

				this.agentArr[index].setPosition(xpos, 0, zpos);
				this.agentArr[index].resetLook();

				if (index === randIndex) {
					this.agentArr[index].setInfection();
				} else {
					this.agentArr[index].setSusceptible();
				}
			}
		}

		for (const agent of this.agentArr) {
			agent.resetModel(step, restrictRate);
		}
	}
	public getAgentRate() {
		return this.agentRateArr;
	}
	public removeScene(scene: Scene) {
		for (const agent of this.agentArr) {
			agent.removeScene(scene);
		}
	}
	public addScene(scene: Scene) {
		for (const agent of this.agentArr) {
			agent.addScene(scene);
		}
	}

	private createAgents() {
		const agentSize = this.row * this.col;
		for (let ii = 0; ii < agentSize; ii = ii + 1) {
			const agent = this.agentFactory.createAgent();
			this.agentArr.push(agent);
		}

		this.calcAgentRate();
	}

	private calcCollide(
		dt: number,
		modelA: AgentModel,
		modelB: AgentModel,
		infectionDistance: number,
		infectiousProbability: number,
		removeRate: number
	) {
		const posA = modelA.getPosition();
		const posB = modelB.getPosition();
		const dX = posA.x - posB.x;
		const dZ = posA.z - posB.z;
		const distance = Math.sqrt(dX * dX + dZ * dZ);

		if (distance < infectionDistance) {
			const modelAVel = modelA.velocity.clone();
			const modelBVel = modelB.velocity.clone();

			modelA.collide(dt, modelB, modelBVel, infectiousProbability, removeRate);
			modelB.collide(dt, modelA, modelAVel, infectiousProbability, removeRate);
		}
	}

	private calcAgentRate() {
		const agentSize = this.agentArr.length;
		for (let ii = 0; ii < 3; ii = ii + 1) {
			this.agentRateArr[ii] = 0;
		}

		const dRate = 1 / agentSize;

		for (let ii = 0; ii < agentSize; ii = ii + 1) {
			const agentModelState = this.agentArr[ii].getModel().state;

			if (agentModelState === AGENT_STATE.S) {
				this.agentRateArr[0] = this.agentRateArr[0] + dRate;
			} else if (agentModelState === AGENT_STATE.I) {
				this.agentRateArr[1] = this.agentRateArr[1] + dRate;
			} else {
				this.agentRateArr[2] = this.agentRateArr[2] + dRate;
			}
		}
	}
}
