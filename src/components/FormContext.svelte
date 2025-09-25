<script lang="ts">
  import { setContext } from "svelte";
  import { FORM_CONTEXT_KEY } from "../lib/svelte-hook-form";

  export let form: any;

  setContext(FORM_CONTEXT_KEY, form);
</script>

<slot />
