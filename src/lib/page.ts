import DOMPurify from "dompurify";
import { Marked } from "marked";
import type { OptionAction } from "./OptionAction";
import type { OptionCheckGroup } from "./OptionCheck";
import type { Dice } from "./dice";
import { get } from "svelte/store";
import { inventory, stats } from "$lib/stores/gamestate";

export class Option {
    public text: string;
    public tooltip: string;
    public disabled: boolean;
    public executes?: NodeListOf<Element>;
    public dice?: Dice;

    constructor(text: string, tooltip?: string, disabled?: boolean, executes?: NodeListOf<Element>, dice?: Dice) {
        this.text = text;
        this.tooltip = tooltip ?? "";
        this.disabled = disabled ?? false;
        this.executes = executes;
        this.dice = dice;
    }

    //returns destination page
    public async execute(): Promise<string | undefined> {
        if (!this.executes) return;
        console.log(get(stats));
        for (let group of this.executes) {
            let children = group.children;
            let success = true;
            for (let child of children) {
                let fail = false;
                // empty cases (case sensitive): changePage, changeItem, changeStat, itemRequired, dice, restart, alert
                switch (child.tagName) {
                    case "changePage":
                        return child.getAttribute("id") ?? undefined;
                    case "changeItem":
                        break;
                    case "changeStat":
                        break;
                    case "itemRequired":
                        break;
                    case "dice":
                        if (!this.dice) {
                            alert("Dice error");
                            fail = true;
                            break;
                        }
                        let result = await this.dice.roll(child.getAttribute("type") ?? "1d6");
                        let stat = get(stats).find(stat => stat.name == child.getAttribute("stat"));
                        if (!stat) {
                            alert("Dice error");
                            fail = true;
                            break;
                        }
                        if (stat.value < result) {
                            fail = true;
                        }
                        break;
                    case "restart":
                        document.location.reload();
                        break;
                    case "alert":
                        alert(child.getAttribute("text") ?? "");
                        break;
                }
                if (fail) {
                    success = false;
                    break;
                }
            }
            if (success) break;
        }
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
