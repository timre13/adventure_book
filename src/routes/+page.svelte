<script lang="ts">
    import { conditionHandler, vars } from "$lib/index";
    import StatusNotepad from "../components/StatusNotepad.svelte";
    import { Stat } from "$lib/status";
    import { Button, Page } from "$lib/page";
    import { onMount } from "svelte";

    conditionHandler("vars['B'] = 'A'"); // létrehozok egy B változót A értékkel
    conditionHandler("vars['B'] == 'A'"); // True értéket ad vissza

    //let parser = new DOMParser();
    //let xmlDoc = parser.parseFromString("<game><pages><page/><page/></pages></game>", "text/xml");

    let stats: Array<Stat> = [new Stat("Életerő", 85, 100), new Stat("Szerencse", 40), new Stat("Ügyesség", 22)];
    let inventory: Record<string, number> = { Alma: 12, Kulcs: 3, Kard: 1 };
    let pageHistory: Array<Page> = Array(1);
    pageHistory.fill(
        new Page(
            "Lorem ipsum dolor sit, *amet consectetur* adipisicing elit. **Voluptate, maxime?** Officiis pariatur laborum cum aut totam quam tempore earum sequi non? Magni iure atque blanditiis impedit voluptatibus sunt quia distinctio!\n\n\
Iure eligendi reprehenderit enim cum debitis vitae ullam quo quis sunt accusamus ducimus et, consequuntur soluta suscipit est, architecto aperiam nostrum quasi. Officiis possimus facere laudantium ad enim eos illo.\n\n\
Tempore debitis odit beatae. Animi, autem rem voluptatibus modi corrupti enim iusto illo necessitatibus. Unde vitae dolor sed architecto, ex assumenda soluta natus iste cum culpa illum sequi magni modi.\n\n\
Praesentium facere tempore harum quos quis voluptatum? Adipisci exercitationem sint perspiciatis, nisi est rem vel nulla deserunt asperiores quas nihil beatae accusamus dolorum enim facilis obcaecati ipsum modi deleniti aut.\n\n\
At velit consectetur minima eum similique. Incidunt natus vitae quos nesciunt suscipit eos ipsum maxime. Consequatur saepe cupiditate repellat omnis quaerat accusantium a, quidem, dolore vel enim ab eos tenetur?",
            [],
            [
                new Button("Első", "Ez az első gomb"),
                new Button("Második"),
                new Button("Harmadik", "Ez a harmadik gomb", true),
                new Button("Negyedik", "Ez a negyedik gomb")
            ]
        )
    );

    async function getPageTexts(): Promise<Array<String>> {
        let pageTexts: Array<String> = [];
        for (let i = 0; i < pageHistory.length; ++i) {
            let result = await pageHistory[i].getTextAsHtml();
            pageTexts.push(result);
        }
        return pageTexts;
    }

    let pageTexts = getPageTexts();

    function scrollToLatestPage() {
        document.querySelector(".page:last-of-type")?.scrollIntoView();
    }

    onMount(scrollToLatestPage);

    function tooltipHover(x: MouseEvent) {
        let elem: HTMLElement = (x.currentTarget! as HTMLElement).querySelector(".btn-tooltip") as HTMLElement;
        elem.style.left = x.offsetX + "px";
        elem.style.top = x.offsetY + "px";
        console.log(x.clientX, x.clientY);
    }
</script>

<main>
    <div id="left-panel" />
    <div id="center-panel">
        <div id="center-panel-overlay" />
        <div id="pages">
            {#await pageTexts then pageTextsVal}
                {#each pageHistory as page, pageI}
                    <div class="page">
                        <div class="page-text">
                            <p>{@html pageTextsVal[pageI]}</p>
                        </div>
                        {#if pageI == pageHistory.length - 1}
                            <div id="page-buttons">
                                {#each page.buttons as button}
                                    <button disabled={button.disabled} on:mousemove={tooltipHover}
                                        >{button.text}
                                        {#if button.tooltip}
                                            <div class="btn-tooltip">{button.tooltip}</div>
                                        {/if}
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
            scroll-snap-type: y mandatory;
            scroll-snap-stop: always;

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
                            filter: brightness(120%) saturate(120%);
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
