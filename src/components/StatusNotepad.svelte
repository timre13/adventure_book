<script lang="ts">
    import type { Stat } from "$lib/status";

    export let stats: Array<Stat>;
    export let inventory: Record<string, number>;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<div class="status-notepad">
    <img src="/notepad.png" />
    <div class="content">
        <div id="stat-display">
            <p><b>Státusz</b></p>
            {#each stats as stat}
                {#if stat.maxValue}
                    <p>{stat.name}: {stat.value}/{stat.maxValue}</p>
                {:else}
                    <p>{stat.name}: {stat.value}</p>
                {/if}
            {/each}
        </div>
        <div id="inventory-display">
            <p><b>Tárgyak</b></p>
            {#each Object.entries(inventory) as [item, cnt]}
                <p>{item}: {cnt} db</p>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Caveat&display=swap");

    .status-notepad {
        position: relative;
        width: 480px;
        height: 620px;
        align-self: center;
        font-family: "Caveat", cursive;
        font-size: 26px;

        img {
            position: absolute;
            top: 0;
            left: 0;
        }

        .content {
            position: absolute;
            left: 20px;
            top: 49px;
            background-color: rgb(204, 201, 181);
            width: 451px;
            height: 561px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
    }
</style>
