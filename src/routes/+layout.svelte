<script lang="ts">
    //@ts-ignore
    let files: FileList = new Array();

    let showForm = true;
    $: {
        if (files.length > 0 && files[0].name.endsWith(".xml")) {
            handleFileLoad();
            showForm = false;
        }
    }

    async function handleFileLoad() {
        console.log(await files[0].text());
    }
</script>

<div id="main-container">
    <slot />
</div>
<div id="form-container" class={showForm ? "show" : ""}>
    <form action="">
        <h1>Fálj betöltése</h1>
        <input type="file" name="config" id="config" bind:files />
        <span>*Csak a megfelelő XML fájl elfogadott</span>
    </form>
</div>

<style lang="scss">
    #form-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        pointer-events: none;
        display: grid;
        place-items: center;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

        form {
            width: 25rem;
            padding: 2rem;
            background-color: #eeeeee;
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0;
            transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
            gap: 1rem;

            input[type="file"] {
                display: block;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                border: 2px solid hsl(219, 100%, 65%);
                border-radius: 10px;
                font-size: 1.2rem;

                &::file-selector-button {
                    background-color: none;
                    border: 1px solid hsl(219, 100%, 65%);
                    border-radius: 5px;
                    padding: 0.2rem;
                    outline: none;

                    &:hover {
                        cursor: pointer;
                        background-color: #00000011;
                    }
                }

                &:focus {
                    outline: none;
                    &::file-selector-button {
                        border: 2px solid hsl(219, 100%, 65%);
                    }
                }
            }
        }

        &.show {
            pointer-events: all;
            form {
                opacity: 1;
            }
        }
    }
</style>
