import { BufferGeometry, EventDispatcher, Vector3 } from 'three';
import { Agent } from './agent';

export class AgentFactory extends EventDispatcher {
	private geometry: BufferGeometry;
	constructor(geometry: BufferGeometry) {
		super();

		this.geometry = geometry;
	}

	public createAgent() {
		return new Agent(this.geometry, 0, 0, 0);
	}

	public getGeometry(){
		return this.geometry;
	}
}
