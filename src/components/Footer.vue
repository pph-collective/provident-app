<template>
  <footer class="footer has-background-dark has-text-light">
    <div class="level py-4">
      <a href="www.google.com" class="level-item">
        <img
          src="https://bulma.io/images/bulma-logo.png"
          width="112"
          height="28"
        />
      </a>
      <a href="www.google.com" class="level-item">
        <img
          src="https://bulma.io/images/bulma-logo.png"
          width="112"
          height="28"
        />
      </a>
      <a href="www.google.com" class="level-item">
        <img
          src="https://bulma.io/images/bulma-logo.png"
          width="112"
          height="28"
        />
      </a>
    </div>
    <div class="content has-text-centered pt-6">
      <p>
        Built by the
        <a href="www.pphcwebsite.com">People, Place &amp; Health Collective</a>
        for 01-GRANTNUMBERHERE, {{ new Date().getFullYear() }}.
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer"
};
</script>
