# Svelte Hook Form

A lightweight form management library for Svelte or SvelteKit that provides form state management, validation, and form handling with a React Hook Form-like API. Built with TypeScript for excellent developer experience.

## Installation

```bash
npm install svelte-form-hook
yarn add svelte-form-hook
```

## Usage

To use this package, you must (this is required, if you do not create this component, this package will not work) create a Input components as below. you can modify other required props as required but below export are necessary (required).

```svelte
<script lang="ts">
  export let value: string | number = "";
  export let name: string | undefined = undefined;
  export let onInput: ((e: Event) => void) | undefined = undefined;
  export let onBlur: ((e: FocusEvent) => void) | undefined = undefined;
</script>

<div class="float-label-wrapper">
  <input
    {name}
    bind:value
    on:input={onInput}
    on:blur={onBlur}
  />

</div>
```

Then use above Input Components as

```svelte
<script lang="ts">
  import { useForm } from "svelte-form-hook";
  import Input from "./Input.svelte";

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };
</script>

<form onsubmit={handleSubmit(onSubmit)}>
  <Input {...register("name")} />
  <Input {...register("email")} />
  <Input {...register("password")} />
  <button type="submit">Submit</button>
</form>
```

## Define Types

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(4, { message: "Password is required" }),
  form: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

## Usage with Types, validation and Form Provider

```svelte
<script lang="ts">
  import { useForm } from "svelte-form-hook";
  import { zodResolver } from "svelte-form-hook/zod-resolver";
  import { FormProvider } from "svelte-form-hook/components";
  import Input from "./Input.svelte";

  const form = useForm<LoginFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const { register, handleSubmit, formState } = form;

  const onSubmit = (data: any) => {
    console.log(data);
  };
</script>

<FormProvider {form}>
    <form onsubmit={handleSubmit(onSubmit)}>
    <Input {...register("name")} />
    <EmailInput />
    <PasswordInput />
    <button type="submit">Submit</button>
    </form>
</FormProvider>
```

```svelte
<!-- EmailInput.svelte -->
<script lang="ts">
  import { useFormContext } from 'svelte-form-hook';
  import Input from "./Input.svelte";

  const {
    register,
    errors,
  } = useFormContext();

  $: emailError = $errors?.email?.message;
</script>

<label>
  Email
  <Input type="email" use:register={'email'} />
</label>
{#if emailError}
  <span class="error">{emailError}</span>
{/if}
```

```svelte
<!-- PasswordInput.svelte -->
<script lang="ts">
  import { useFormContext } from 'svelte-form-hook';
  import Input from "./Input.svelte";

  const {
    register,
    errors,
  } = useFormContext();

  $: passwordError = $errors?.password?.message;
</script>

<label>
  Password
  <Input type="password" use:register={'password'} />
</label>
{#if passwordError}
  <span class="error">{passwordError}</span>
{/if}
```

## other Features

```svelte
| **Name**        | **Example Usage**                                         | **Type**   | **Description**                                        |
| --------------- | --------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `register`      | `register("email")`<br>`<Input {...register("email")} />` | `Function` | Registers an input or select element into the form.    |
| `handleSubmit`  | `<form onSubmit={handleSubmit(onSubmit)}>`                | `Function` | Handles form submission, including validation.         |
| `setValue`      | `setValue("email", "test@example.com")`                   | `Function` | Dynamically set a field's value.                       |
| `setError`      | `setError("email",  "Email is required" )`                | `Function` | Manually set an error on a field.                      |
| `clearErrors`   | `clearErrors("email")`<br>`clearErrors()`                 | `Function` | Clear errors on specific or all fields.                |
| `trigger`       | `trigger("email")`<br>`trigger(["email", "password"])`    | `Function` | Trigger validation on one or more fields.              |
| `reset`         | `reset()`<br>`reset({ email: "", password: "" })`         | `Function` | Reset form values and errors.                          |
| `formState`     | `formState.isSubmitting`<br>`formState.isValid`           | `Object`   | Contains form state such as `isDirty`, `isValid`, etc. |
| `values`        | `$values.email`, `$values.password`                       | `Object`   | Contains form values, similar to the `watch` method.   |
| `errors`        | `$errors.email?.message`                                  | `Object`   | Contains field-specific errors after validation.       |
| `isSubmitting`  | `$formState.isSubmitting`                                 | `boolean`  | Indicates if the form is currently submitting.         |
| `defaultValues` | `useForm({ defaultValues: { email: "" } })`               | `Object`   | Initial values provided to the form.                   |


<script lang="ts">
  import { useForm } from "svelte-form-hook";
  const {
      register,
      handleSubmit,
      setValue,
      setError,
      clearErrors,
      trigger,
      reset,
      formState,
      values,
      errors,
      isSubmitting,
      defaultValues,
    } = useForm();

</script>
```

## Nested Values Support

```svelte
<script lang="ts">
  import { useForm } from "svelte-form-hook";
  import Input from "./Input.svelte";

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      user: {
        name: "",
        email: "",
        password: "",
      },
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };
</script>

<form onsubmit={handleSubmit(onSubmit)}>
  <Input {...register("user.name")} />
  <Input {...register("user.email")} />
  <Input {...register("user.password")} />
  <button type="submit">Submit</button>
</form>
```

## Type

we have three different types exported from the package which you can use as,

```ts
import { FormValues, FieldErrors, Resolver } from "svelte-form-hook/types";
```

## License

MIT License © Suraj Adhikari
