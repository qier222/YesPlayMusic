<script setup lang="ts">
import { useQueryProvider } from 'vue-query'
import { usePlayerProvider } from '@renderer/hooks/usePlayer'

const store = useStore()
useQueryProvider()
usePlayerProvider()
</script>

<template>
  <div id="layout" class="grid select-none grid-cols-[16rem_auto]">
    <Sidebar v-if="store.settings.showSidebar" />
    <div
      id="mainContainer"
      ref="mainContainer"
      class="relative flex h-screen max-h-screen flex-grow flex-col overflow-y-auto bg-white dark:bg-black"
    >
      <Topbar />
      <main id="main" class="mb-24 flex-grow px-8">
        <router-view />
      </main>
    </div>
    <Player />

    <!-- Debug info -->
    <!-- <Debug /> -->
  </div>
</template>
