<script lang="ts">
    class Stat {
        name: string = "";
        value: number = 0;
        maxValue: number | undefined = undefined;

        constructor(name: string, value: number, maxValue: number | undefined) {
            this.name = name;
            this.value = value;
            this.maxValue = maxValue;
        }
    }

    export let stats: Array<Stat>;
    export let inventory: Object;
</script>

<div class="status-notepad">
    <div id="stat-display">
        {#each stats as stat}
            {#if stat.maxValue != undefined}
                <p>TODO</p>
            {:else}
                <p>{stat.name}: {stat.value}</p>
            {/if}
        {/each}
    </div>
    <div id="inventory-display">
        <p>TODO</p>
    </div>
</div>
