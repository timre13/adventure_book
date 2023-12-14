<script lang="ts">
    import { conditionHandler, vars } from "$lib/index";
    import StatusNotepad from "../components/StatusNotepad.svelte";
    import { Stat, StatSeparator } from "$lib/status";
    import { Option, Page } from "$lib/page";
    import { onMount } from "svelte";
    import { Dice, createDice } from "$lib/dice";
    import { file } from "$lib/stores/file";
    import { get } from "svelte/store";
    import { Inventory, InventoryGroup } from "$lib/Inventory";
    import { inventory, stats } from "$lib/stores/gamestate";
    import { base } from "$app/paths";

    let diceHandler: Dice;

    let pages: Record<string, Page> = {};
    let itemUseDefs: Record<string, NodeListOf<Element>> = {};
    let pageHistory: Array<Page> = [];

    async function getPageTexts(): Promise<Array<String>> {
        let pageTexts: Array<String> = [];
        console.log("Page history len:", pageHistory.length);
        for (let i = 0; i < pageHistory.length; ++i) {
            let result = await pageHistory[i].getTextAsHtml();
            pageTexts.push(result);
        }
        return pageTexts;
    }

    let pageTexts = getPageTexts();
    let tooltip: Promise<String> = new Promise(_ => "");

    $: pageHistory &&
        (() => {
            pageTexts = getPageTexts();
        })();

    function scrollTo(node: HTMLElement) {
        node.scrollIntoView();
    }

    function buttonEnter(x: MouseEvent) {
        let btnI = parseInt((x.currentTarget! as HTMLElement).dataset.index || "0");
        tooltip = pageHistory[pageHistory.length - 1].buttons[btnI].getTooltipHtml();
    }

    function tooltipHover(x: MouseEvent) {
        let elem: HTMLElement = (x.currentTarget! as HTMLElement).querySelector(".btn-tooltip") as HTMLElement;
        if (!elem) return;
        elem.style.left = x.offsetX + "px";
        elem.style.top = x.offsetY + "px";
    }

    onMount(async () => {
        diceHandler = await createDice("#dice-box");

        {
            console.log("File has been loaded:");
            let content = get(file);
            if (!content) {
                console.log("File is empty, ignoring");
                return;
            }
            let parser = new DOMParser();

            let xmlDoc = parser.parseFromString(content, "text/xml");
            console.log("File has been parsed:", xmlDoc);

            // Stats betöltés
            {
                let stats_: Array<Stat> = [];
                let statNodes = xmlDoc.querySelectorAll("game > character > stats *");
                statNodes.forEach(async node => {
                    if (node.nodeName == "stat") {
                        let name = node.getAttribute("name") || "";
                        let value = 0;
                        if (node.hasAttribute("value")) {
                            value = parseInt(node.getAttribute("value")!) || 0;
                        } else if (node.hasAttribute("dice")) {
                            const diceVal = node.getAttribute("dice")?.split(" ")[0] ?? "";
                            const diceMin = parseInt(diceVal.split("d")[0]);
                            const diceMax = diceMin * parseInt(diceVal.split("d")[1]);
                            value = Math.floor(Math.random() * (diceMax - diceMin + 1) + diceMin);
                        }
                        let min = parseInt(node.getAttribute("min") || node.getAttribute("minValue") || "0") || 0;
                        let maxStr = node.getAttribute("max") || node.getAttribute("maxValue");
                        let max = maxStr == "value" || !maxStr ? value : parseInt(maxStr ?? "0") ?? 0;
                        stats_.push(new Stat(name, value, min, max));
                    } else {
                        stats_.push(new StatSeparator());
                    }
                });
                stats.set(stats_);
            }

            // Inventory betöltés
            {
                let inventory_: Inventory = new Inventory();
                let groupNodes = xmlDoc.querySelectorAll("game > character > inventory > group");
                let groups: Array<InventoryGroup> = [];
                groupNodes.forEach(groupNode => {
                    let groupName = groupNode.getAttribute("name") || "";
                    let group = new InventoryGroup(groupName);

                    let itemNodes = groupNode.querySelectorAll("item");
                    itemNodes.forEach(item => {
                        let itemName = item.getAttribute("name") ?? "???";
                        let itemCount = Math.max(parseInt(item.getAttribute("amount") ?? "1"), 1);
                        group.items[itemName] = itemCount;
                    });

                    groups.push(group);
                });
                inventory_.groups = groups;
                console.log(inventory_);
                inventory.set(inventory_);
            }

            // Item use def betöltés
            {
                let itemUseDefNodes = xmlDoc.querySelectorAll("itemUseDefinitions itemUseDefinition");
                console.log(itemUseDefNodes);
                itemUseDefNodes.forEach(node => {
                    let itemName = node.getAttribute("item") ?? "";
                    itemUseDefs[itemName] = node.querySelectorAll("*");
                });
            }

            // Oldal betöltés
            {
                pages = {};
                let firstPage: Page | undefined = undefined;

                let pageNodes = xmlDoc.querySelectorAll("game > pages page");
                pageNodes.forEach(pageNode => {
                    let pageId = pageNode.getAttribute("id")!;
                    let pageText = pageNode.querySelector("text")?.innerHTML ?? "";
                    pageText = pageText.replaceAll(/^ +/gm, "");

                    let options: Array<Option> = [];
                    let optionNodes = pageNode.querySelectorAll("options > option");
                    optionNodes.forEach(optionNode => {
                        let optionText = optionNode.querySelector("text")?.innerHTML ?? "";
                        options.push(
                            new Option(
                                optionText,
                                undefined,
                                undefined,
                                optionNode.querySelectorAll("execute"),
                                diceHandler
                            )
                        );
                    });

                    let page = new Page(pageText, options);
                    if (!firstPage) {
                        firstPage = page;
                    }
                    pages[pageId] = page;
                });

                pages = pages;
                pageHistory = [firstPage!];
            }
        }
    });

    function TestRoll() {
        diceHandler.roll("2d6").then(res => {
            console.log(res);
        });
    }

    async function buttonClick(page: Page, optionIndex: number) {
        let destination = await page.buttons[optionIndex].execute();
        if (!destination) return;
        console.log(pages[destination]);
        let history = [...pageHistory];
        history.push(pages[destination]);
        pageHistory = history;
    }
</script>

<main>
    <div id="left-panel" style="background-image: url('{base}/wood-texture-bg.jpg')">
        <div id="dice-box" />
        <button on:click={TestRoll}>Testroll</button>
    </div>
    <div id="center-panel" style="background-image: url('{base}/tiled-paper.webp');">
        <div id="pages" style="background-image: url('{base}/tiled-paper.webp');">
            {#await pageTexts then pageTextsVal}
                {#each pageHistory as page, pageI}
                    <div class="page" use:scrollTo>
                        <div class="page-text">{@html pageTextsVal[pageI]}</div>
                        {#if pageI == pageHistory.length - 1}
                            <div id="page-buttons">
                                {#each page.buttons as button, i}
                                    <button
                                        disabled={button.disabled}
                                        style=" background-image: url('{base}/button-texture.jpg');"
                                        on:mousemove={tooltipHover}
                                        on:mouseenter={buttonEnter}
                                        on:click={() => buttonClick(page, i)}
                                        data-index={i}
                                        >{button.text}
                                        {#await tooltip then tooltipVal}
                                            {#if tooltipVal}
                                                <div class="btn-tooltip">
                                                    {@html tooltipVal}
                                                </div>
                                            {/if}
                                        {/await}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    {#if pageI != pageHistory.length - 1}
                        <hr class="page-separator" />
                    {/if}
                {/each}
            {/await}
        </div>
    </div>
    <div id="right-panel" style="background-image: url('{base}/wood-texture-bg.jpg');">
        <StatusNotepad {itemUseDefs} />
    </div>
</main>

<style lang="scss">
    @import "../lib/styles/variables.scss";

    main {
        display: grid;
        grid-template-columns: 1fr 50% 1fr;
        height: 100vh;
        background-color: $main-bg-color;
        font-family: Arial, Helvetica, sans-serif;
        position: relative;

        #left-panel {
            background-repeat: no-repeat;
            background-size: cover;
        }

        #center-panel {
            border: 2px solid black;
            max-height: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow-y: scroll;
            scrollbar-color: #71593c #b0a68a;
            //scroll-snap-type: y mandatory;
            //scroll-snap-stop: always;

            #pages {
                background-repeat: repeat;
            }

            &::-webkit-scrollbar {
                background: #b0a68a;
                width: 0.5rem;
            }

            &::-webkit-scrollbar-thumb {
                background: #71593c;
            }

            #center-panel-overlay {
                height: 200px;
                width: 50%;
                background-image: linear-gradient($main-bg-color, transparent);
                mask-image: linear-gradient(black, transparent);
                -webkit-mask-image: linear-gradient(black, transparent);
                backdrop-filter: blur(5px);
                position: absolute;
                pointer-events: none;
            }

            .page {
                scroll-snap-align: end;
                margin-left: 5rem;
                margin-right: 5rem;
                margin-top: 3rem;
                margin-bottom: 3rem;
                padding-top: 2rem;
                padding-bottom: 2rem;

                #page-buttons {
                    margin-top: 4rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                    padding-bottom: 2rem;

                    button {
                        font-size: 1.2rem;
                        color: white;
                        background-color: #725738;
                        border: none;
                        width: 30rem;
                        padding: 1rem;
                        cursor: pointer;
                        border-radius: 15px;

                        background-repeat: repeat;
                        background-size: cover;
                        position: relative;
                        filter: none;

                        .btn-tooltip {
                            display: none;
                            position: absolute;
                            left: 0;
                            top: 0;
                            z-index: 9999;
                            pointer-events: none;
                            width: max-content;
                            margin: 15px;
                            padding: 0.5rem;
                            font-size: smaller;
                            color: rgb(65, 53, 15);
                            border-radius: 5px;
                            background-color: #b0a68a;
                        }

                        &:hover {
                            .btn-tooltip {
                                display: inline;
                            }

                            &::before {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background-color: #fff3;
                                border-radius: 15px;
                                content: "";
                            }
                        }

                        &:disabled {
                            cursor: initial;

                            &::before {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background-color: #0007;
                                border-radius: 15px;
                                content: "";
                            }
                        }
                    }
                }

                .page-text {
                    flex: 1;
                    font-size: 1.4rem;
                    font-weight: 500;
                    line-height: 120%;
                    text-align: justify;
                    color: #422104;

                    :global(p) {
                        margin-bottom: 1rem;
                    }

                    :global(h1) {
                        font-size: 2rem;
                        font-weight: normal;
                        margin-bottom: 1rem;
                        text-align: left;
                    }
                }
            }

            .page-separator {
                width: 60%;
                margin: auto;
                border: 1px solid rgb(48, 33, 12);
            }
        }

        #right-panel {
            background-repeat: no-repeat;
            background-position-x: right;
            background-size: cover;

            display: flex;
            flex-direction: column;
        }
    }
</style>
