<script lang="ts">
  import { setContext } from "svelte";
  import { FORM_CONTEXT_KEY } from "./svelte-hook-form";
  import type { UseFormReturn } from "./types";

  export let form: UseFormReturn;

  setContext(FORM_CONTEXT_KEY, form);
</script>

<slot />
