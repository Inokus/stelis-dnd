<script lang="ts" setup>
defineProps<{
  heading: string;
  formLabel: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>

<template>
  <div class="flex min-h-full flex-col justify-center p-6">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2>{{ heading }}</h2>

      <div class="mt-10">
        <form
          class="space-y-8"
          :aria-label="formLabel"
          @submit.prevent="$emit('submit')"
          novalidate
        >
          <slot />
        </form>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
