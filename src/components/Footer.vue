<template>
  <footer
    id="site_footer"
    class="
      has-background-primary has-text-light
      is-family-secondary is-flex is-justify-content-center
    "
  >
    <div class="footer-content mt-6">
      <div
        class="
          is-flex
          is-flex-direction-row
          is-flex-wrap
          is-justify-content-center
          is-align-items-center
          py-4
        "
      >
        <a
          href="http://www.brown.edu"
          class="image is-128x128 m-3 is-flex is-align-items-center"
          target="_blank"
          rel="noopener"
          ><img
            class="footer-logo"
            src="https://preventoverdoseri.org/wp-content/uploads/2019/10/logo-footer-Brown.png"
            title="Brown"
            alt="Brown"
        /></a>
        <a
          href="https://health.ri.gov/"
          class="image is-128x128 m-3 is-flex is-align-items-center"
          target="_blank"
          rel="noopener"
          ><img
            class="footer-logo"
            src="https://preventoverdoseri.org/wp-content/uploads/2019/10/logo-footer-RIDOH.png"
            title="RIDOH"
            alt="RIDOH"
        /></a>
      </div>

      <div class="py-4">
        <p class="is-uppercase has-text-weight-bold">What is this site?</p>
        <br />
        <p>
          This website is an initiative of the Rhode Island Governor's
          Prevention and Intervention Task Force, in collaboration with the RI
          Department of Health (RIDOH), the RI Department of Behavioral
          Healthcare and Developmental Disabilities and Hospitals (BHDDH), and
          Brown University School of Public Health.
        </p>
        <br />
        <p>
          If you have an issue to report or a suggestion, please
          <a
            href="mailto:preventoverdoseri@brown.edu?subject=PROVIDENT Question"
            class="has-text-link-light is-underlined"
            >contact us</a
          >.
        </p>
      </div>

      <p class="has-text-centered mb-6 is-size-7">©2021 Prevent Overdose, RI</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style lang="scss" scoped>
.footer-content {
  max-width: 80%;
}
</style>
