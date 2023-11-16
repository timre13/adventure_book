<script lang="ts">
</script>

<main>
    <div id="left-panel" />
    <div id="center-panel" />
    <div id="right-panel" />
</main>

<style lang="scss">
    :global(*) {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

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
        }
    }
</style>
