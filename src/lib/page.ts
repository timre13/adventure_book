import DOMPurify from "dompurify";
import { Marked } from "marked";

export class Button {
    public disabled: boolean = false;

    constructor(public text: string, disabled?: boolean) {
        this.disabled = disabled ?? false;
    }
}

export class Enemy {
    constructor(public name: string) {}
}

export class Page {
    constructor(public text: string, public enemies: Array<Enemy>, public buttons: Array<Button>) {}

    public async getTextAsHtml(): Promise<string> {
        let marked = new Marked();
        return DOMPurify.sanitize(await marked.parse(this.text));
    }
}
