import DOMPurify from "dompurify";
import { Marked } from "marked";
import type { OptionAction } from "./OptionAction";
import type { OptionCheckGroup } from "./OptionCheck";
import type { Dice } from "./dice";
import { get } from "svelte/store";
import { inventory, stats } from "$lib/stores/gamestate";

function randomFromDiceNotation(notation: string): number {
    let diceMin = parseInt(notation.split("d")[0]);
    let diceMax = diceMin * parseInt(notation.split("d")[1]);
    let result = Math.floor(Math.random() * (diceMax - diceMin + 1) + diceMin);
    return result;
}

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
        console.log("Executing:", this.executes);
        console.log(get(inventory));
        for (let group of this.executes) {
            let children = group.children;
            let success = true;
            for (let child of children) {
                let fail = false;
                // empty cases (case sensitive): changePage, changeItem, changeStat, itemRequired, dice, restart, alert
                switch (child.tagName) {
                    case "changePage": {
                        return child.getAttribute("id") ?? undefined;
                    }
                    case "changeItem": {
                        let inv = get(inventory);
                        for (let group of inv.groups) {
                            let added = false;
                            if (group.name == child.getAttribute("group")) {
                                let itemName = child.getAttribute("name");
                                if (!itemName) {
                                    alert("Item error");
                                    fail = true;
                                    break;
                                }
                                if (group.items[itemName]) {
                                    group.items[itemName] += parseInt(child.getAttribute("amount") ?? "1");
                                } else {
                                    group.items[itemName] = parseInt(child.getAttribute("amount") ?? "1");
                                }
                                for (let key in group.items) {
                                    if (group.items[key] <= 0) delete group.items[key];
                                }
                                added = true;
                            }
                            if (added) break;
                        }
                        inventory.set(inv);
                        break;
                    }
                    case "changeStat": {
                        let statList = get(stats);
                        let statName = child.getAttribute("name") ?? "";
                        let isMax = false;
                        if (statName.includes(".max")) {
                            statName = statName.replace(".max", "");
                            isMax = true;
                        }
                        const statIndex = statList.findIndex(stat => stat.name == statName);
                        if (statIndex == -1) {
                            alert("Stat error");
                            fail = true;
                            break;
                        }
                        let value = isMax ? statList[statIndex].maxValue : statList[statIndex].value;
                        if (child.hasAttribute("value")) {
                            const valueStr = child.getAttribute("value") ?? "0";
                            if (valueStr.startsWith("~")) {
                                value = randomFromDiceNotation(valueStr.substring(1));
                            } else {
                                value = parseInt(valueStr);
                            }
                        } else if (child.hasAttribute("increase") || child.hasAttribute("decrease")) {
                            const changeStr = child.getAttribute("increase") ?? child.getAttribute("decrease") ?? "1";
                            const isDecrease = child.hasAttribute("decrease");
                            if (changeStr.startsWith("~")) {
                                value += randomFromDiceNotation(changeStr.substring(1)) * (isDecrease ? -1 : 1);
                            } else {
                                value += parseInt(changeStr) * (isDecrease ? -1 : 1);
                            }
                        }

                        if (isMax) {
                            statList[statIndex].maxValue = value;
                            if (statList[statIndex].maxValue <= 0) {
                                statList[statIndex].maxValue = 1;
                            }
                            if (statList[statIndex].value > statList[statIndex].maxValue) {
                                statList[statIndex].value = statList[statIndex].maxValue;
                            }
                        } else {
                            statList[statIndex].value = value;
                            if (statList[statIndex].value > statList[statIndex].maxValue) {
                                statList[statIndex].value = statList[statIndex].maxValue;
                            }

                            if (statList[statIndex].value < statList[statIndex].minValue) {
                                statList[statIndex].value = statList[statIndex].minValue;
                            }
                        }

                        stats.set(statList);
                        break;
                    }
                    case "itemRequired": {
                        const inventoryGroups = get(inventory).groups;
                        const itemName = child.getAttribute("name");
                        let foundCount = 0;
                        let found = false;
                        for (let group of inventoryGroups) {
                            for (let key in group.items) {
                                if (key == itemName) {
                                    found = true;
                                    foundCount = group.items[key];
                                    break;
                                }
                            }
                            if (found) break;
                        }
                        if (!child.hasAttribute("max")) {
                            // Van item?
                            if (!found) {
                                fail = true;
                            }
                        } else {
                            // Az item darabja maximum "max"?
                            if (foundCount > parseInt(child.getAttribute("max")!) ?? 1) {
                                fail = true;
                            }
                        }
                        break;
                    }
                    case "dice": {
                        const statAttr = child.getAttribute("stat");
                        if (!statAttr) {
                            alert("Dice error, no stat");
                            fail = true;
                            break;
                        }
                        if (!this.dice) {
                            alert("Dice error, no dice");
                            fail = true;
                            break;
                        }
                        const result = await this.dice.roll(child.getAttribute("type") ?? "1d6");
                        const stat = get(stats).find(stat => stat.name == statAttr);

                        if (!isNaN(statAttr as any)) {
                            const value = parseInt(statAttr);
                            if (value < result) {
                                fail = true;
                            }
                        } else {
                            if (!stat) {
                                alert("Dice error, no such stat as " + statAttr ?? "");
                                fail = true;
                                break;
                            }
                            if (stat.value < result) {
                                fail = true;
                            }
                        }
                        break;
                    }
                    case "restart": {
                        document.location.reload();
                        break;
                    }
                    case "alert": {
                        alert(child.getAttribute("text") ?? "");
                        break;
                    }
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
