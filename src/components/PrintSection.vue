<template>
  <slot></slot>
  <teleport to="body">
    <div class="printable">
      <slot></slot>
    </div>
  </teleport>
</template>
