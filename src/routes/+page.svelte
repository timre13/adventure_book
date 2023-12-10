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

    let diceHandler: Dice;

    conditionHandler("vars['B'] = 'A'"); // létrehozok egy B változót A értékkel
    conditionHandler("vars['B'] == 'A'"); // True értéket ad vissza

    let stats: Array<Stat> = [];
    let inventory: Inventory = new Inventory();
    let pages: Record<string, Page> = {};

    let pageHistory: Array<Page> = Array(5);
    pageHistory.fill(
        new Page(
            "Lorem ipsum dolor sit, *amet consectetur* adipisicing elit. **Voluptate, maxime?** Officiis pariatur laborum cum aut totam quam tempore earum sequi non? Magni iure atque blanditiis impedit voluptatibus sunt quia distinctio!\n\n\
Iure eligendi reprehenderit enim cum debitis vitae ullam quo quis sunt accusamus ducimus et, consequuntur soluta suscipit est, architecto aperiam nostrum quasi. Officiis possimus facere laudantium ad enim eos illo.\n\n\
Tempore debitis odit beatae. Animi, autem rem voluptatibus modi corrupti enim iusto illo necessitatibus. Unde vitae dolor sed architecto, ex assumenda soluta natus iste cum culpa illum sequi magni modi.\n\n\
Praesentium facere tempore harum quos quis voluptatum? Adipisci exercitationem sint perspiciatis, nisi est rem vel nulla deserunt asperiores quas nihil beatae accusamus dolorum enim facilis obcaecati ipsum modi deleniti aut.\n\n\
At velit consectetur minima eum similique. Incidunt natus vitae quos nesciunt suscipit eos ipsum maxime. Consequatur saepe cupiditate repellat omnis quaerat accusantium a, quidem, dolore vel enim ab eos tenetur?",
            [
                new Option("Első", "Ez az **első** gomb"),
                new Option("Második"),
                new Option("Harmadik", "Ez a harmadik gomb", true),
                new Option("Negyedik", "Ez a negyedik gomb")
            ]
        )
    );

    let xmlDoc: Document;
    file.subscribe(x => {
        console.log("File has been loaded:");
        let content = get(file);
        if (!content) {
            console.log("File is empty, ignoring");
            return;
        }
        let parser = new DOMParser();
        xmlDoc = parser.parseFromString(content, "text/xml");
        console.log("File has been parsed:", xmlDoc);

        // Stats betöltés
        (async () => {
            let stats_: Array<Stat> = [];
            let statNodes = xmlDoc.querySelectorAll("game > character > stats *");
            statNodes.forEach(async node => {
                if (node.nodeName == "stat") {
                    let name = node.getAttribute("name") || "";
                    let value = 0;
                    if (node.hasAttribute("value")) {
                        value = parseInt(node.getAttribute("value")!) || 0;
                    } else if (node.hasAttribute("dice")) {
                        let diceVal = node.getAttribute("dice")?.split(" ")[0] ?? "";
                        // FIXME
                        //value = await diceHandler.roll(diceVal);
                        // --- Workaround kezdete ---
                        let diceMin = parseInt(diceVal.split("d")[0]);
                        let diceMax = diceMin * parseInt(diceVal.split("d")[1]);
                        value = Math.floor(Math.random() * (diceMax - diceMin + 1) + diceMin);
                        // --- Workaround vége ---
                    }
                    // Nyilván nem lehet konzisztens az elnevezés (min / minValue)
                    let min = parseInt(node.getAttribute("min") || node.getAttribute("minValue") || "0") || 0;
                    let maxStr = node.getAttribute("max") || node.getAttribute("maxValue");
                    let max = maxStr == "value" || !maxStr ? value : parseInt(maxStr ?? "0") ?? 0;
                    stats_.push(new Stat(name, value, min, max));
                } else {
                    stats_.push(new StatSeparator());
                }
            });
            return stats_;
        })().then(x => (stats = x));

        // Inventory betöltés
        {
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
            inventory.groups = groups;
            inventory = inventory;
            console.log(inventory);
        }

        // Oldal betöltés
        {
            pages = {};

            let pageNodes = xmlDoc.querySelectorAll("game > pages page");
            pageNodes.forEach(pageNode => {
                let pageId = pageNode.getAttribute("id")!;
                let pageText = pageNode.querySelector("text")?.innerHTML ?? "";
                pageText = pageText.replaceAll(/^ +/gm, "");
                console.log(pageText);

                let options: Array<Option> = [];
                let optionNodes = pageNode.querySelectorAll("options > option");
                optionNodes.forEach(optionNode => {
                    let optionText = optionNode.querySelector("text")?.innerHTML ?? "";
                    // TODO: Execute betöltése
                    options.push(new Option(optionText, undefined, undefined, []));
                });

                let page = new Page(pageText, options);
                pages[pageId] = page;
            });

            pages = pages;
            console.log(pages);

            // Teszt
            console.log(pages["init"]);
            pageHistory.push(pages["init"]);
            pageHistory = pageHistory;
        }
    });

    async function getPageTexts(): Promise<Array<String>> {
        let pageTexts: Array<String> = [];
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
        console.log("Enter");
        let btnI = parseInt((x.currentTarget! as HTMLElement).dataset.index || "0");
        tooltip = pageHistory[pageHistory.length - 1].buttons[btnI].getTooltipHtml();
        console.log(tooltip.then(x => console.log(x)));
    }

    function tooltipHover(x: MouseEvent) {
        let elem: HTMLElement = (x.currentTarget! as HTMLElement).querySelector(".btn-tooltip") as HTMLElement;
        if (!elem) return;
        elem.style.left = x.offsetX + "px";
        elem.style.top = x.offsetY + "px";
        //console.log(x.clientX, x.clientY);
    }

    onMount(async () => {
        diceHandler = await createDice("#dice-box");
    });
    function TestRoll() {
        diceHandler.roll("2d6").then(res => {
            console.log(res);
        });
    }
</script>

<main>
    <div id="left-panel">
        <div id="dice-box" />
        <button on:click={TestRoll}>Testroll</button>
    </div>
    <div id="center-panel">
        <div id="center-panel-overlay" />
        <div id="pages">
            {#await pageTexts then pageTextsVal}
                {#each pageHistory as page, pageI}
                    <div class="page" use:scrollTo>
                        <div class="page-text">{@html pageTextsVal[pageI]}</div>
                        {#if pageI == pageHistory.length - 1}
                            <div id="page-buttons">
                                {#each page.buttons as button, i}
                                    <button
                                        disabled={button.disabled}
                                        on:mousemove={tooltipHover}
                                        on:mouseenter={buttonEnter}
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
    <div id="right-panel">
        <StatusNotepad {stats} {inventory} />
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
            background-image: url("wood-texture-bg.jpg");
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
                background-image: url("tiled-paper.webp");
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
                        background-image: url("button-texture.jpg");
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
            background-image: url("wood-texture-bg.jpg");
            background-repeat: no-repeat;
            background-position-x: right;
            background-size: cover;

            display: flex;
            flex-direction: column;
        }
    }
</style>
