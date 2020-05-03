import { EventDispatcher, Object3D, Scene } from 'three';
import { AGENT_COLOR } from '../utils/constants';
import { AgentFactory } from './agentFactory';
import { RuleAgent } from './ruleAgent';

export class RuleAgentCollection extends EventDispatcher {
	private ruleContainer: Object3D = new Object3D();
	private agentFactory: AgentFactory;
	private rule1Container: Object3D = new Object3D();
	private rule2Container: Object3D = new Object3D();
	private rule3Container: Object3D = new Object3D();
	private rule1AgentS: RuleAgent;
	private rule1AgentR: RuleAgent;
	private rule1AgentI: RuleAgent;
	private rule2AgentS: RuleAgent;
	private rule2AgentR: RuleAgent;
	private rule2AgentI: RuleAgent;
	private rule3AgentI: RuleAgent;
	private delayedCall1: gsap.core.Tween;
	constructor(agentFactory: AgentFactory) {
		super();
		this.agentFactory = agentFactory;

		this.createAgents();
	}

	public addScene(scene: Scene) {
		scene.add(this.ruleContainer);
	}
	public removeScene(scene: Scene) {
		scene.remove(this.ruleContainer);
	}

	public showRule(rule: string) {
		switch (rule) {
			case '1':
				this.setRule1();
				break;
			case '2':
				this.setRule2();
				break;
			case '3':
				this.setRule3();
				break;
			default:
		}
	}

	public setRule1() {
		this.ruleContainer.add(this.rule1Container);
		this.ruleContainer.remove(this.rule2Container);
		this.ruleContainer.remove(this.rule3Container);
		if (this.delayedCall1) {
			this.delayedCall1.kill();
		}
		this.rule2AgentI.killRepeatAnimation();
		this.rule2AgentS.killedDelayedCall();
	}

	public setRule2(delay: number) {
		this.ruleContainer.remove(this.rule1Container);
		this.ruleContainer.add(this.rule2Container);
		this.ruleContainer.remove(this.rule3Container);
		if (this.delayedCall1) {
			this.delayedCall1.kill();
		}
		this.rule2AgentI.repeatAnimation(delay);
		this.rule2AgentS.delayCall(1.2, AGENT_COLOR.S, AGENT_COLOR.I);
	}

	public setRule3() {
		this.ruleContainer.remove(this.rule1Container);
		this.ruleContainer.remove(this.rule2Container);
		this.ruleContainer.add(this.rule3Container);
		if (this.delayedCall1) {
			this.delayedCall1.kill();
		}
		this.rule2AgentI.killRepeatAnimation();
		this.rule2AgentS.killedDelayedCall();
		this.rule3AgentI.delayCall(2, AGENT_COLOR.I, AGENT_COLOR.R);
	}

	private createAgents() {
		this.rule1AgentS = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.S);
		this.rule1AgentS.setPosition(-6, 0, 0);
		this.rule1AgentI = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.I);
		this.rule1AgentI.setPosition(0, 0, 0);
		this.rule1AgentR = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.R);
		this.rule1AgentR.setPosition(6, 0, 0);
		this.rule1AgentS.addContainer(this.rule1Container);
		this.rule1AgentI.addContainer(this.rule1Container);
		this.rule1AgentR.addContainer(this.rule1Container);

		this.rule2AgentS = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.S);
		this.rule2AgentS.setPosition(-6, 0, 0);
		this.rule2AgentI = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.I);
		this.rule2AgentI.setPosition(0, 0, 0);
		this.rule2AgentR = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.R);
		this.rule2AgentR.setPosition(6, 0, 0);
		this.rule2AgentS.addContainer(this.rule2Container);
		this.rule2AgentI.addContainer(this.rule2Container);
		this.rule2AgentR.addContainer(this.rule2Container);

		this.rule3AgentI = new RuleAgent(this.agentFactory.getGeometry(), AGENT_COLOR.I);
		this.rule3AgentI.addContainer(this.rule3Container);
	}
}
