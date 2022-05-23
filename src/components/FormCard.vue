<template>
  <div class="columns is-mobile is-centered">
    <div class="column card form-card my-6">
      <div class="card-image">
        <figure class="image is-128x128 provident-logo">
          <img
            src="../assets/images/pori-provident-logo.png"
            alt="PROVIDENT logo"
          />
        </figure>
      </div>
      <div class="card-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style>
.form-card {
  max-width: 500px;
}

.provident-logo {
  height: 100%;
  margin: auto;
}
</style>
