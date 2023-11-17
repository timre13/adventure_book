<script lang="ts">
    import { conditionHandler, vars } from "$lib/index";
    import StatusNotepad from "../components/StatusNotepad.svelte";
    import { Stat } from "$lib/status";
    import { Button, Page } from "$lib/page";

    conditionHandler("vars['B'] = 'A'"); // létrehozok egy B változót A értékkel
    conditionHandler("vars['B'] == 'A'"); // True értéket ad vissza

    //let parser = new DOMParser();
    //let xmlDoc = parser.parseFromString("<game><pages><page/><page/></pages></game>", "text/xml");

    let stats: Array<Stat> = [new Stat("Életerő", 85, 100), new Stat("Szerencse", 40), new Stat("Ügyesség", 22)];
    let inventory: Record<string, number> = { Alma: 12, Kulcs: 3, Kard: 1 };
    let page: Page = new Page(
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptate, maxime? Officiis pariatur laborum cum aut totam quam tempore earum sequi non? Magni iure atque blanditiis impedit voluptatibus sunt quia distinctio!\n\
Iure eligendi reprehenderit enim cum debitis vitae ullam quo quis sunt accusamus ducimus et, consequuntur soluta suscipit est, architecto aperiam nostrum quasi. Officiis possimus facere laudantium ad enim eos illo.\n\
Tempore debitis odit beatae. Animi, autem rem voluptatibus modi corrupti enim iusto illo necessitatibus. Unde vitae dolor sed architecto, ex assumenda soluta natus iste cum culpa illum sequi magni modi.\n\
Praesentium facere tempore harum quos quis voluptatum? Adipisci exercitationem sint perspiciatis, nisi est rem vel nulla deserunt asperiores quas nihil beatae accusamus dolorum enim facilis obcaecati ipsum modi deleniti aut.\n\
At velit consectetur minima eum similique. Incidunt natus vitae quos nesciunt suscipit eos ipsum maxime. Consequatur saepe cupiditate repellat omnis quaerat accusantium a, quidem, dolore vel enim ab eos tenetur?",
        [],
        [new Button("Első"), new Button("Második"), new Button("Harmadik")]
    );
</script>

<main>
    <div id="left-panel" />
    <div id="center-panel">
        <div class="page-text">
            <p>{page.text}</p>
        </div>
        <div id="page-buttons">
            {#each page.buttons as button}
                <button>{button.text}</button>
            {/each}
        </div>
    </div>
    <div id="right-panel">
        <StatusNotepad {stats} {inventory} />
    </div>
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        height: 100vh;
        background-color: #e4d9bb;
        font-family: Arial, Helvetica, sans-serif;

        #left-panel {
        }

        #center-panel {
            border: 2px solid black;
            height: 100%;
            display: flex;
            flex-direction: column;

            #page-buttons {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                align-items: center;
                padding-bottom: 2rem;

                button {
                    font-size: larger;
                    color: white;
                    background-color: #725738;
                    border: none;
                    width: 30rem;
                    padding: 1rem;
                    cursor: pointer;
                    border-radius: 15px;

                    &:hover {
                        background-color: #8d6a42;
                    }
                }
            }

            .page-text {
                flex: 1;
                text-align: justify;
                margin: 5rem;
            }
        }

        #right-panel {
            display: flex;
            flex-direction: column;
        }
    }
</style>
