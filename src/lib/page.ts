import DOMPurify from "dompurify";
import { Marked } from "marked";

export class Button {
    public tooltip: string = "";
    public disabled: boolean = false;

    constructor(public text: string, tooltip?: string, disabled?: boolean) {
        this.tooltip = tooltip ?? "";
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
