<script lang="ts">
    import { conditionHandler, vars } from "$lib/index";
    import StatusNotepad from "../components/StatusNotepad.svelte";
    import { Stat } from "$lib/status";

    conditionHandler("vars['B'] = 'A'"); // létrehozok egy B változót A értékkel
    conditionHandler("vars['B'] == 'A'"); // True értéket ad vissza

    //let parser = new DOMParser();
    //let xmlDoc = parser.parseFromString("<game><pages><page/><page/></pages></game>", "text/xml");

    let stats: Array<Stat> = [new Stat("Életerő", 85, 100), new Stat("Szerencse", 40), new Stat("Ügyesség", 22)];
    let inventory: Record<string, number> = { Alma: 12, Kulcs: 3, Kard: 1 };
</script>

<main>
    <div id="left-panel" />
    <div id="center-panel" />
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

        #left-panel {
        }

        #center-panel {
            border: 2px solid black;
            height: 100%;
        }

        #right-panel {
            display: flex;
            flex-direction: column;
        }
    }
</style>
