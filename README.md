# Svelte Hook Form

A lightweight form management library for Svelte that provides form state management, validation, and form handling with a React Hook Form-like API. Built with TypeScript for excellent developer experience.

## Installation

```bash
npm install svelte-form-hook
yarn add svelte-form-hook
```

## Usage

```svelte
<script lang="ts">
  import { useForm } from "svelte-form-hook";

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
  <input {...register("name")} />
  <input {...register("email")} />
  <input {...register("password")} />
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
  import { useForm, zodResolver  } from "svelte-form-hook";

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
    <input {...register("name")} />
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

  const {
    register,
    errors: { subscribe: errors },
  } = useFormContext();

  $: emailError = $errors?.email?.message;
</script>

<label>
  Email
  <input type="email" use:register={'email'} />
</label>
{#if emailError}
  <span class="error">{emailError}</span>
{/if}
```

```svelte
<!-- PasswordInput.svelte -->
<script lang="ts">
  import { useFormContext } from 'svelte-form-hook';

  const {
    register,
    errors: { subscribe: errors },
  } = useFormContext();

  $: passwordError = $errors?.password?.message;
</script>

<label>
  Password
  <input type="password" use:register={'password'} />
</label>
{#if passwordError}
  <span class="error">{passwordError}</span>
{/if}
```

## License

MIT License © Suraj Adhikari
