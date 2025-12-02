<script setup lang="ts">
import Button from '~/components/ui/Button/Button.vue'
import Card from '~/components/ui/Card/Card.vue'
import Avatar from '~/components/ui/Avatar/Avatar.vue'
import ScriptInput from '~/components/ui/Input/ScriptInput.vue'
import { Plus, Home, Settings, Film, Sparkles, ChevronDown, CornerDownLeft } from 'lucide-vue-next'

const inputValue = ref('')
</script>

<template>
  <div class="p-12 space-y-12 bg-background min-h-screen">
    <h1 class="text-3xl font-bold text-text-main mb-8">Design System Playground</h1>

    <!-- Colors Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-main">Colors</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="space-y-2"><div class="h-16 w-full rounded bg-background border"></div><span class="text-xs">Background</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-sidebar border"></div><span class="text-xs">Sidebar</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-surface border"></div><span class="text-xs">Surface</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-input-bg border"></div><span class="text-xs">Input BG</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-primary"></div><span class="text-xs">Primary</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-text-main"></div><span class="text-xs text-white bg-black/50 px-1">Text Main</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-text-muted"></div><span class="text-xs">Text Muted</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-accent-green"></div><span class="text-xs">Accent Green</span></div>
        <div class="space-y-2"><div class="h-16 w-full rounded bg-status-online"></div><span class="text-xs">Status Online</span></div>
      </div>
    </section>

    <!-- Buttons Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-main">Buttons</h2>
      <div class="flex flex-wrap gap-4 items-center">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="icon"><Plus class="w-5 h-5" /></Button>
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="lg">Large</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </section>

    <!-- Inputs Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-main">Inputs</h2>
      <div class="w-full max-w-3xl">
        <ScriptInput v-model="inputValue" placeholder="Type your script idea here...">
           <template #actions-left>
             <Button variant="secondary" size="sm" class="gap-2">
               <Film class="w-3.5 h-3.5" />
               Movie Script
               <ChevronDown class="w-3 h-3 text-gray-400" />
             </Button>
           </template>
           <template #actions-right>
             <Button variant="secondary" size="icon" class="w-9 h-9 rounded-full text-gray-500">
                <Plus class="w-5 h-5" />
             </Button>
             <Button variant="primary" class="rounded-full pl-5 pr-4 py-2 bg-primary hover:bg-primary-hover text-white">
               <span class="text-sm font-medium">Start</span>
               <CornerDownLeft class="w-4 h-4 opacity-80" />
             </Button>
           </template>
        </ScriptInput>
      </div>
    </section>

    <!-- Avatars Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-main">Avatars</h2>
      <div class="flex items-center gap-4">
        <Avatar size="sm" initials="Z" status="online" />
        <Avatar size="md" initials="Pub" status="online" />
        <Avatar size="lg" initials="Pub" status="busy" />
        <Avatar size="lg" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" status="offline" />
      </div>
    </section>

    <!-- Cards Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-text-main">Cards</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card title="Project Title" description="This is a project description that might be long and needs to be truncated after a few lines." meta="12 Scenes" />
        <Card title="Another Project" description="Short description." meta="0 Scenes" />
      </div>
    </section>
  </div>
</template>
