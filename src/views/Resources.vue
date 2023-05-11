<template>
  <section class="section">
    <!-- VIDEOS -->
    <h1 class="title">Section: Videos</h1>
    <h2 class="subtitle">
      A simple container to divide your page into <strong>sections</strong>,
      like the one you're currently reading.
    </h2>
    <div class="tile is-ancestor is-vertical">
      <div class="tile is-parent">
        <div class="tile is-child box is-4">
          <p class="title">One</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
        <div class="tile is-child box is-4">
          <p class="title">Two</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
        <div class="tile is-child box is-4">
          <p class="title">Three</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
      </div>
      <div class="tile is-parent">
        <div class="tile is-child box is-4">
          <p class="title">Four</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
        <div class="tile is-child box is-4">
          <p class="title">Five</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
        <div class="tile is-child box is-4">
          <p class="title">Six</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Downloads -->
  <section class="section">
    <h1 class="title">Section: Downloads</h1>
    <h2 class="subtitle">
      A simple container to divide your page into <strong>sections</strong>,
      like the one you're currently reading.
    </h2>
    <div class="tile is-ancestor is-vertical">
      <div class="tile is-parent">
        <div class="tile is-child box is-4">
          <p class="title">One</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
        <div class="tile is-child box is-4">
          <p class="title">Two</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
        <div class="tile is-child box is-4">
          <p class="title">Three</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ornare magna eros, eu pellentesque tortor vestibulum ut. Maecenas
            non massa sem. Etiam finibus odio quis feugiat facilisis.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Links -->
  <section class="section">
    <h1 class="title">Section: Links</h1>
    <h2 class="subtitle">
      A simple container to divide your page into <strong>sections</strong>,
      like the one you're currently reading.
    </h2>

    <div class="card">
      <div class="card-content">
        <p class="title">
          “There are two hard things in computer science: cache invalidation,
          naming things, and off-by-one errors.”
        </p>
        <p class="subtitle">Jeff Atwood</p>
      </div>
      <footer class="card-footer">
        <p class="card-footer-item">
          <span>
            View on
            <a href="https://twitter.com/codinghorror/status/506010907021828096"
              >Twitter</a
            >
          </span>
        </p>
        <p class="card-footer-item">
          <span> Share on <a href="#">Facebook</a> </span>
        </p>
      </footer>
    </div>
  </section>

  <!-- Glossary -->
  <section class="section">
    <h1 class="title">Section: Glossary</h1>
    <h2 class="subtitle">
      A simple container to divide your page into <strong>sections</strong>,
      like the one you're currently reading.
    </h2>

    <div class="container">
      <div class="card">
        <div class="card-content">
          <div class="content">
            Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros.
            Donec id elit non mi porta gravida at eget metus. Cum sociis natoque
            penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Cras mattis consectetur purus sit amet fermentum.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Card from "@/components/dashboard/Card.vue";
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";
</style>
