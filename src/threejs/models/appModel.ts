import { EventDispatcher } from "three";

export class AppModel extends EventDispatcher {
    public scene: string;
    constructor() {
        super();
    }
}