<script lang="ts">
    import { stats, inventory } from "$lib/stores/gamestate";
    import { Option } from "$lib/page";
    import { invalidate } from "$app/navigation";

    export let itemUseDefs: Record<string, NodeListOf<Element>>;

    function onItemClick(e: MouseEvent) {
        const itemName = (e.currentTarget as HTMLElement).dataset.itemname ?? "";
        const callbacks = itemUseDefs[itemName];
        if (!callbacks) return;
        console.log(callbacks);

        let opt = new Option("", "", false, callbacks);
        opt.execute();

        itemUseDefs = itemUseDefs;
    }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="status-notepad">
    <img src="/notepad.png" />
    <div class="content">
        <div id="stat-display">
            <p><b>Státusz</b></p>
            {#each $stats as stat}
                {#if stat.isSeparator}
                    <hr />
                {:else if stat.maxValue}
                    <p title="Érték: {stat.value}, min: {stat.minValue}, max: {stat.maxValue}">
                        {stat.name}: {stat.value}/{stat.maxValue}
                    </p>
                {:else}
                    <p title="Érték: {stat.value}, min: {stat.minValue}">{stat.name}: {stat.value}</p>
                {/if}
            {/each}
        </div>
        <hr id="notepad-separator" />
        <div id="inventory-display">
            <p><b>Tárgyak</b></p>
            {#each $inventory.groups as group}
                <p class="group-name">{group.name}</p>
                <div class="group-content">
                    {#each Object.entries(group.items) as [item, cnt]}
                        <p
                            class:consumable-item={Object.keys(itemUseDefs).includes(item)}
                            data-itemname={item}
                            title={Object.keys(itemUseDefs).includes(item) ? "Tárgy használata" : null}
                            on:click={onItemClick}
                        >
                            {item}: {cnt} db
                        </p>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Caveat&display=swap");

    hr {
        border: none;
        border-bottom: 1px solid black;
    }

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

            #stat-display {
                hr {
                    width: 10rem;
                }
            }

            #notepad-separator {
                border-bottom: 2px solid black;
            }

            #inventory-display {
                .group-name {
                    text-decoration: underline;
                }

                .group-content {
                    margin-left: 10px;

                    p::first-letter {
                        text-transform: uppercase;
                    }
                }

                .consumable-item {
                    color: blue;
                    cursor: pointer;
                }
            }
        }
    }
</style>
