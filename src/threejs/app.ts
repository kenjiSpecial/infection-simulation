import { GUI, GUIController } from 'dat.gui';
import { gsap } from 'gsap';
import {
	AmbientLight,
	BoxGeometry,
	BufferGeometry,
	DirectionalLight,
	EventDispatcher,
	Geometry,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Scene,
	Vector3,
	Vector4
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { AgentFactory } from './components/agentFactory';
import { Bg } from './components/Bg';
import { Boundary } from './components/Boudary';
import { Renderer } from './components/renderer';
import { RuleAgentCollection } from './components/ruleAgentCollection';
import { SimluatinAgentCollection } from './components/simluatinAgentCollection';
import { GLAppModel } from './models/glAppModel';
import { SCENE, SIMULATION } from './utils/constants';
import {
	ASSETS_LOADED,
	DONE_SIMULATION,
	RESIZE,
	UPDATE_AGENT_RATE,
	UPDATE_APP_STATE
} from './utils/eventNames';
import { WindowManager } from './utils/WindowManager';

export interface IBase {
	reset(): void;
}

export interface IComponentBase {
	update(): void;
}

export class ThreeJsApp extends EventDispatcher implements IBase {
	private renderer: Renderer;
	private scene: Scene = new Scene();
	private camera: PerspectiveCamera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	private gui?: GUI;
	private playAndStopGui?: GUIController;
	private isDebug: boolean = false;
	private agentGeometry: BufferGeometry;
	private simulationAgentCollection: SimluatinAgentCollection;
	private ruleAgentCollection: RuleAgentCollection;
	private boudary: Boundary = new Boundary();
	private bg: Bg = new Bg();
	private glAppModel: GLAppModel = new GLAppModel();
	constructor() {
		super();
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;

		this.onUpdateAppStateHandler = this.onUpdateAppStateHandler.bind(this);
		this.loop = this.loop.bind(this);

		this.renderer = new Renderer(canvas);
		this.boudary.addScene(this.scene);

		this.bg.addScene(this.scene);

		this.addEvents();
		this.resize();
		this.addLight();
		this.resetCamera();
		this.loop();

		if (this.isDebug) {
			this.setupDebug();
		}
	}

	/**
	 * アセットロード後に呼び出される
	 */
	public resetAgents() {
		switch (this.glAppModel.scene) {
			case SCENE.SIMULATION:
				this.simulationAgentCollection.reset(
					this.boudary.getSize(),
					this.glAppModel.simulationStep,
					this.glAppModel.restrictRate
				);
				this.simulationAgentCollection.addScene(this.scene);
				break;
			case SCENE.RULE:
				this.simulationAgentCollection.removeScene(this.scene);
				this.ruleAgentCollection.addScene(this.scene);
				break;
			case SCENE.TOP:
				this.simulationAgentCollection.reset(this.boudary.getSize(), '3', 1);
				this.simulationAgentCollection.addScene(this.scene);
				break;
			default:
		}
	}

	public startTick() {
		this.glAppModel.startTick();
	}

	public pauseTick() {
		this.glAppModel.pauseTick();
	}

	public getAgentRate() {
		return this.glAppModel.getAgentRate();
	}
	public getTotalTime() {
		return this.glAppModel.getTotalTime();
	}
	public getSimulationState() {
		return this.glAppModel.simulationState;
	}
	public getSimulationStep() {
		return this.glAppModel.simulationStep;
	}

	public getRuleStep() {
		return this.glAppModel.ruleStep;
	}

	public getScene() {
		return this.glAppModel.scene;
	}

	public getAppState() {
		return this.glAppModel.appState;
	}

	public getIsLoaded() {
		return this.glAppModel.getIsLoad();
	}

	public getSpaceSize() {
		return this.boudary.getSize().x;
	}

	public getRemoveRate() {
		return this.glAppModel.removeRate;
	}

	public getRestrictionRate() {
		return this.glAppModel.restrictRate;
	}

	public updateBoudarySize(size: number) {
		this.boudary.addSize(size, size);
	}

	public updateRestriction(value: number) {
		this.glAppModel.setRestriction(value);
	}

	public updateRemove(value: number) {
		this.glAppModel.setRemove(value);
	}

	public resize() {
		const { viewportWidth, viewportHeight } = WindowManager.GET_SIZE();
		this.camera.aspect = viewportWidth / viewportHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.resize(viewportWidth, viewportHeight);
	}

	public destroy() {}

	public startToLoad() {
		const objURLDir = 'model/poly_agent.obj';
		const loader = new OBJLoader();

		loader.load(
			objURLDir,
			(object: Object3D) => {
				this.agentGeometry = (object.children[0] as Mesh).geometry as BufferGeometry;
				this.createAgents();
				this.glAppModel.loaded();
			},
			xhr => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			error => {
				console.log('An error happened');
			}
		);
	}

	public playAndPause() {
		this.glAppModel.togglePlay();
	}

	public resetSimulationApp(scene: string) {
		this.simulationAgentCollection.setBoundary(this.boudary.getBoundary());
		this.simulationAgentCollection.reset(
			this.boudary.getSize(),
			this.glAppModel.simulationStep,
			this.glAppModel.restrictRate
		);
		this.glAppModel.reset();
	}

	public render() {
		this.renderer.render(this.scene, this.camera);
	}

	public forceAppStatePlayable() {
		this.glAppModel.forceAppStatePlayable();
	}

	public showTop() {
		this.glAppModel.updateSceneTop();


		if (this.ruleAgentCollection) {
			this.ruleAgentCollection.removeScene(this.scene);
		}

		if (this.simulationAgentCollection) {
		this.simulationAgentCollection.reset(this.boudary.getSize(), '1', 0);
			this.simulationAgentCollection.addScene(this.scene);
		}
	}

	public showRule(step: string) {
		this.glAppModel.updateSceneRule(step);

		if (this.simulationAgentCollection) {
			this.simulationAgentCollection.removeScene(this.scene);
		}

		if (this.ruleAgentCollection) {
			this.ruleAgentCollection.addScene(this.scene);
		}
	}

	public updateRuleAgent() {
		this.ruleAgentCollection.showRule(this.glAppModel.ruleStep);
	}

	public showSimulation(step: string) {
		this.glAppModel.doSimulation(step);

		if (this.ruleAgentCollection) {
			this.ruleAgentCollection.removeScene(this.scene);
		}
		if (this.simulationAgentCollection) {
			this.simulationAgentCollection.addScene(this.scene);
		}
	}

	public moveCamera() {
		switch (this.glAppModel.scene) {
			case SCENE.RULE:
				gsap.to(this.camera.position, {
					duration: 2,
					z: 50,
					y: 20,
					onUpdate: () => {
						this.camera.lookAt(new Vector3());
					},
					ease: 'power2.inOut'
				});
				break;
			default:
		}
	}

	public play() {
		if (this.glAppModel.simulationState === SIMULATION.PLAY) {
			return;
		}

		this.glAppModel.startTick();
	}

	private resetCamera() {
		this.camera.position.z = 200;
		this.camera.position.y = 75;
		this.camera.lookAt(new Vector3(0, 0, 0));
	}

	private createAgents() {
		const agent = new AgentFactory(this.agentGeometry);
		this.simulationAgentCollection = new SimluatinAgentCollection(agent);
		this.simulationAgentCollection.setBoundary(this.boudary.getBoundary());
		this.glAppModel.setAgentRate(this.simulationAgentCollection.getAgentRate());

		this.ruleAgentCollection = new RuleAgentCollection(agent);
	}

	private setupDebug() {
		this.playAndStop = this.playAndStop.bind(this);
		this.gui = new GUI();
		this.playAndStopGui = this.gui.add(this, 'playAndStop').name('pause');
		// this.gui.add(this, 'appState').listen();
	}

	private playAndStop() {
		if (this.glAppModel.simulationState === SIMULATION.PLAY) {
			this.glAppModel.pauseTick();
		} else if (this.glAppModel.simulationState === SIMULATION.PAUSE) {
			this.glAppModel.startTick();
		}
	}

	private simulationDone() {
		this.glAppModel.done();
		this.dispatchEvent({ type: DONE_SIMULATION });
	}

	private loop() {
		this.glAppModel.update();

		if (this.glAppModel.scene === SCENE.SIMULATION) {
			if (this.simulationAgentCollection) {
				this.simulationAgentCollection.update(
					this.glAppModel.getDt(),
					this.glAppModel.infectionDuration,
					this.glAppModel.infectionDistance,
					this.glAppModel.infectiousProbability,
					this.glAppModel.removeRate
				);
				this.glAppModel.setAgentRate(this.simulationAgentCollection.getAgentRate());

				if (this.simulationAgentCollection.getAgentRate()[1] === 0) {
					this.simulationDone();
				}

				this.dispatchEvent({ type: UPDATE_AGENT_RATE });
			}
		}
		this.render();
	}

	private addEvents() {
		this.glAppModel.addEventListener(UPDATE_APP_STATE, this.onUpdateAppStateHandler);
		this.glAppModel.addEventListener(ASSETS_LOADED, () => {
			this.dispatchEvent({ type: ASSETS_LOADED });
		});
	}

	private onUpdateAppStateHandler() {
		if (this.glAppModel.simulationState === SIMULATION.PLAY) {
			gsap.ticker.add(this.loop);
			if (this.playAndStopGui) {
				this.playAndStopGui.name('pause');
			}
		} else if (this.glAppModel.simulationState === SIMULATION.PAUSE) {
			gsap.ticker.remove(this.loop);
			if (this.playAndStopGui) {
				this.playAndStopGui.name('play');
			}
		}
		this.dispatchEvent({ type: UPDATE_APP_STATE });
	}

	private addLight() {
		const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.2);
		hemiLight.position.set(0, 50, 0);
		this.scene.add(hemiLight);
		const dirLight = new DirectionalLight(0xffffff, 0.3);
		dirLight.position.set(0, 2, 0.1);
		dirLight.position.multiplyScalar(20);
		this.scene.add(dirLight);

		const light = new AmbientLight(0xbbbbbb); // soft white light
		this.scene.add(light);
	}
}
