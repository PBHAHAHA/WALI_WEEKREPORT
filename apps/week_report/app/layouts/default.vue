<template>
  <div class="flex min-h-screen bg-[#FDFDFD]">
    <Sidebar />
    <main class="flex-1 ml-16 relative z-0">
      <!-- Background pattern placeholder -->
      <div class="absolute inset-0 z-[-1] opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <slot />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '~/components/Sidebar.vue'
</script>
