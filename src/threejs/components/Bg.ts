import { EventDispatcher, Mesh, PlaneGeometry, RawShaderMaterial, Scene } from 'three';

export class Bg extends EventDispatcher {
	private mat: RawShaderMaterial;
	private mesh: Mesh;
	constructor() {
		super();

		this.mat = new RawShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		});
		this.mesh = new Mesh(new PlaneGeometry(1, 1), this.mat);
	}

	public addScene(scene: Scene) {
		scene.add(this.mesh);
	}
}

const vertexShader = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){
    vUv = uv;
    gl_Position = vec4( position, 1.0);
	gl_Position.w = 0.5;
	gl_Position.z = 0.499;
}
`;

// ==================

const fragmentShader = `
precision highp float;
varying vec2 vUv;
void main(){
	vec3 color = mix(vec3(1.0), vec3(0.88), vUv.y);
    gl_FragColor = vec4(color, 1.0);
}
`;
