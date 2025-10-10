<script lang="ts">
  import { setContext } from "svelte";
  import { FORM_CONTEXT_KEY } from "../lib/svelte-hook-form";

  let { form, children }: any = $props();

  setContext(FORM_CONTEXT_KEY, form);
</script>

{@render children()}
