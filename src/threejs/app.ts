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
import { APP_STATE, SCENE, SIMULATION } from './utils/constants';
import {
	ASSETS_LOADED,
	DONE_SIMULATION,
	FORCE_UPDATE_SIMULATION,
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
	private normalCameraPos: Vector3 = new Vector3();
	private activeCameraPos: Vector3 = new Vector3();
	private gui?: GUI;
	private playAndStopGui?: GUIController;
	private isDebug: boolean = false;
	private agentGeometry: BufferGeometry;
	private simulationAgentCollection: SimluatinAgentCollection;
	private ruleAgentCollection: RuleAgentCollection;
	private boudary: Boundary = new Boundary();
	private bg: Bg = new Bg();
	private glAppModel: GLAppModel = new GLAppModel();
	private closeDistance: number = 10;
	private closeCos: number = Math.cos((15 / 180) * Math.PI);
	private closeSin: number = Math.sin((15 / 180) * Math.PI);
	private baseDistance: number = 100;
	private baseCos: number = Math.cos((20 / 180) * Math.PI);
	private baseSin: number = Math.sin((20 / 180) * Math.PI);
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

		this.resetCamera();
		this.renderer.resize(viewportWidth, viewportHeight);

		if (this.glAppModel.simulationState === SIMULATION.PAUSE) {
			this.render();
			this.dispatchEvent({ type: FORCE_UPDATE_SIMULATION });
		}
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
		this.boudary.hideBed();
	}

	public showRule(step: string) {
		this.glAppModel.updateSceneRule(step);

		if (this.simulationAgentCollection) {
			this.simulationAgentCollection.removeScene(this.scene);
		}

		if (this.ruleAgentCollection) {
			this.ruleAgentCollection.addScene(this.scene);
		}
		this.boudary.hideBed();
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

		if (step === '1') {
			this.boudary.hideBed();
		} else {
			this.boudary.showBed();
		}
	}

	public moveCamera(isAnimation: boolean = true) {
		if (isAnimation) {
			gsap.killTweensOf(this.camera.position);
			switch (this.glAppModel.scene) {
				case SCENE.RULE:
					gsap.to(this.camera.position, {
						duration: 2,
						z: this.closeDistance * this.closeCos,
						y: this.closeDistance * this.closeSin,
						onUpdate: () => {
							this.camera.lookAt(new Vector3());
						},
						ease: 'power2.inOut'
					});
					break;
				default:
					gsap.to(this.camera.position, {
						duration: 2,
						z: this.baseDistance * this.baseCos,
						y: this.baseDistance * this.baseSin,
						onUpdate: () => {
							this.camera.lookAt(new Vector3());
						},
						ease: 'power2.inOut'
					});
			}
		} else {
			switch (this.glAppModel.scene) {
				case SCENE.RULE:
					this.camera.position.set(
						0,
						this.closeDistance * this.closeSin,
						this.closeDistance * this.closeCos
					);
					break;
				default:
					this.camera.position.z = this.baseDistance * this.baseCos;
					this.camera.position.y = this.baseDistance * this.baseSin;
			}
			this.camera.lookAt(new Vector3());
		}
	}

	public play() {
		if (this.glAppModel.simulationState === SIMULATION.PLAY) {
			return;
		}

		this.glAppModel.startTick();
	}

	private resetCamera() {
		const targetPos = new Vector4(50, 0, 50, 1);
		let baseDis = this.baseDistance;
		let baseDis2 = this.baseDistance;
		let targetWindowPosX = 0.6;

		for (let ii = 0; ii < 10; ii = ii + 1) {
			this.camera.position.z = baseDis * this.baseCos;
			this.camera.position.y = baseDis * this.baseSin;
			this.camera.lookAt(new Vector3(0, 0, 0));

			this.camera.updateMatrixWorld(true);
			const projectedPos = targetPos
				.clone()
				.applyMatrix4(this.camera.matrixWorldInverse)
				.applyMatrix4(this.camera.projectionMatrix);
			const scaledXBefore = projectedPos.x / projectedPos.w;

			this.camera.position.z = (baseDis + 1) * this.baseCos;
			this.camera.position.y = (baseDis + 1) * this.baseSin;
			this.camera.lookAt(new Vector3(0, 0, 0));
			this.camera.updateMatrixWorld(true);
			const projectedPos2 = targetPos
				.clone()
				.applyMatrix4(this.camera.matrixWorldInverse)
				.applyMatrix4(this.camera.projectionMatrix);
			const scaledXAfter = projectedPos2.x / projectedPos2.w;

			const moveDis = (targetWindowPosX - scaledXBefore) / (scaledXAfter - scaledXBefore);
			baseDis = baseDis + moveDis;
			if (baseDis < 0) {
				baseDis = baseDis2;
				baseDis2 = baseDis2 -= 1;
				targetWindowPosX *= 0.95;
			}
		}
		this.baseDistance = baseDis;

		const targetPos2 = new Vector4(10, 0, 0, 1);
		targetWindowPosX = 0.3;
		for (let ii = 0; ii < 10; ii = ii + 1) {
			this.camera.position.z = this.closeDistance * this.closeCos;
			this.camera.position.y = this.closeDistance * this.closeSin;
			this.camera.lookAt(new Vector3(0, 0, 0));
			this.camera.updateMatrixWorld(true);
			const projectedPos = targetPos2
				.clone()
				.applyMatrix4(this.camera.matrixWorldInverse)
				.applyMatrix4(this.camera.projectionMatrix);
			const scaledXBefore = projectedPos.x / projectedPos.w;

			this.camera.position.z = (this.closeDistance + 1) * this.closeCos;
			this.camera.position.y = (this.closeDistance + 1) * this.closeSin;
			this.camera.lookAt(new Vector3(0, 0, 0));
			this.camera.updateMatrixWorld(true);
			const projectedPos2 = targetPos2
				.clone()
				.applyMatrix4(this.camera.matrixWorldInverse)
				.applyMatrix4(this.camera.projectionMatrix);
			const scaledXAfter = projectedPos2.x / projectedPos2.w;

			const moveDis = (targetWindowPosX - scaledXBefore) / (scaledXAfter - scaledXBefore);
			this.closeDistance = this.closeDistance + moveDis;
		}

		if (this.glAppModel.scene === SCENE.RULE) {
			this.camera.position.z = this.closeDistance * this.baseCos;
			this.camera.position.y = this.closeDistance * this.baseSin;
		} else {
			this.camera.position.z = this.baseDistance * this.baseCos;
			this.camera.position.y = this.baseDistance * this.baseSin;
		}

		this.camera.lookAt(new Vector3(0, 0, 0));

		// this.closeDistance = baseDis3;
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
