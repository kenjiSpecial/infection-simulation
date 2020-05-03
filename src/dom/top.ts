

export class Top {
    public el: HTMLElement;
    constructor() {
        this.el = document.getElementById('top');
    }

    public show(){
        this.el.style.display = 'block';
    }

    public hide(){
        this.el.style.display = 'none';
    }
}