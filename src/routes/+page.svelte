<script lang="ts">
    import {conditionHandler, vars} from "$lib/index"

    conditionHandler("vars['B'] = 'A'") // létrehozok egy B változót A értékkel
    conditionHandler("vars['B'] == 'A'") // True értéket ad vissza


</script>



