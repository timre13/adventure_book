import DOMPurify from "dompurify";
import { Marked } from "marked";
import type { OptionAction } from "./OptionAction";
import type { OptionCheckGroup } from "./OptionCheck";

export class Option {
    public text: string;
    public tooltip: string;
    public disabled: boolean;
    public actions: Array<OptionAction>;
    public checks: Array<OptionCheckGroup>;

    constructor(
        text: string,
        tooltip?: string,
        disabled?: boolean,
        actions?: Array<OptionAction>,
        checks?: Array<OptionCheckGroup>
    ) {
        this.text = text;
        this.tooltip = tooltip ?? "";
        this.disabled = disabled ?? false;
        this.actions = actions ?? [];
        this.checks = checks ?? [];
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

type PageInitAction = OptionAction;

export class Page {
    constructor(public text: string, public buttons: Array<Option>, public onInit?: PageInitAction) {}

    public async getTextAsHtml(): Promise<string> {
        let marked = new Marked();
        return DOMPurify.sanitize(await marked.parse(this.text));
    }
}
