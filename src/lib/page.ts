import DOMPurify from "dompurify";
import { Marked } from "marked";

export class Option {
    public tooltip: string = "";
    public disabled: boolean = false;

    constructor(public text: string, tooltip?: string, disabled?: boolean) {
        this.tooltip = tooltip ?? "";
        this.disabled = disabled ?? false;
    }

    getTooltipHtml() {
        let tooltipHtml: Promise<string>;
        let marked = new Marked();
        let parsed = marked.parse(this.tooltip);
        if (typeof parsed == "string") {
            tooltipHtml = (async _ => DOMPurify.sanitize(parsed as string))();
            // console.log("string", DOMPurify.sanitize(parsed as string));
        } else {
            tooltipHtml = new Promise(async _ => DOMPurify.sanitize(await parsed));
            // console.log("promise");
        }
        // console.log(tooltipHtml);
        return tooltipHtml;
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
