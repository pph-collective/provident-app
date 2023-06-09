<template>
  <div class="columns wrapper">
    <div class="sidebar column is-narrow pl-5 pt-5">
      <div class="has-text-right is-hidden-mobile">
        <button type="button" class="button is-text bars" @click="toggle">
          <i v-if="showSidebar" class="fas fa-times" />
          <i v-else class="fas fa-bars" />
        </button>
      </div>
      <div class="sidebar-body">
        <p v-if="showSidebar" class="menu-label">Resources</p>
        <ul class="menu-list">
          <li>
            <a href="#videos">
              <i class="fas fa-video mr-1" />
              <span v-if="showSidebar">Videos</span>
            </a>
            <a href="#downloads">
              <i class="fas fa-download mr-1" />
              <span v-if="showSidebar">Downloads</span>
            </a>
            <a href="#links">
              <i class="fas fa-link mr-1" />
              <span v-if="showSidebar">Links</span>
            </a>
            <a href="#glossary">
              <i class="fas fa-book mr-1" />
              <span v-if="showSidebar">Glossary</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="main column">
      <section id="videos" class="section">
        <!-- VIDEOS -->
        <h1 class="title">Videos</h1>
        <h2 class="subtitle">
          Watch these videos to get a step-by-step walkthorugh of the PROVIDENT
          web tool.
        </h2>

        <div class="columns is-multiline">
          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/scZopMpFpxg"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">What is PROVIDENT?</p>
                    <p class="subtitle is-6">
                      <a
                        href="https://www.youtube.com/@peopleplacehealthcollectiv5405"
                        target="_blank"
                        >@pphcollective on YouTube</a
                      >
                    </p>
                  </div>
                </div>

                <div class="content">
                  Learn more about the PROVIDENT research project and why Rhode
                  Island is a national leader in overdose prevention innovation.
                  <br />
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/YE7VzlLtp-4"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">John Smith</p>
                    <p class="subtitle is-6">@johnsmith</p>
                  </div>
                </div>

                <div class="content">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                  <a href="#">#css</a>
                  <a href="#">#responsive</a>
                  <br />
                  <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/YE7VzlLtp-4"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">John Smith</p>
                    <p class="subtitle is-6">@johnsmith</p>
                  </div>
                </div>

                <div class="content">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                  <a href="#">#css</a>
                  <a href="#">#responsive</a>
                  <br />
                  <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/YE7VzlLtp-4"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">John Smith</p>
                    <p class="subtitle is-6">@johnsmith</p>
                  </div>
                </div>

                <div class="content">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                  <a href="#">#css</a>
                  <a href="#">#responsive</a>
                  <br />
                  <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/YE7VzlLtp-4"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">John Smith</p>
                    <p class="subtitle is-6">@johnsmith</p>
                  </div>
                </div>

                <div class="content">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                  <a href="#">#css</a>
                  <a href="#">#responsive</a>
                  <br />
                  <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/YE7VzlLtp-4"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">John Smith</p>
                    <p class="subtitle is-6">@johnsmith</p>
                  </div>
                </div>

                <div class="content">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                  <a href="#">#css</a>
                  <a href="#">#responsive</a>
                  <br />
                  <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Downloads -->
      <section id="downloads" class="section">
        <h1 class="title">Guides and downloads</h1>
        <h2 class="subtitle"></h2>

        <div class="columns is-multiline">
          <div class="column is-one-third">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <span class="icon is-large">
                      <i class="fas fa-3x fa-file-pdf"></i>
                    </span>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">Web Tool User Guide</p>
                    <p class="subtitle is-6">PDF</p>
                  </div>
                </div>

                <div class="content">
                  Learn about how to access and use the PROVIDENT Web Tool with
                  this step-by-step tutorial.
                  <br />
                </div>

                <footer class="card-footer">
                  <a
                    href="https://preventoverdoseri.org/wp-content/uploads/2023/06/PROVIDENT-Web-Tool-User-Guide.pdf"
                    target="_blank"
                    class="card-footer-item"
                    >Download</a
                  >
                </footer>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <span class="icon is-large">
                      <i class="fas fa-3x fa-file-pdf"></i>
                    </span>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">PROVIDENT Overview</p>
                    <p class="subtitle is-6">PDF</p>
                  </div>
                </div>

                <div class="content">
                  This one-page document gives an overview of the PROVIDENT
                  study and the aims of our research.
                  <br />
                </div>

                <footer class="card-footer">
                  <a
                    href="https://preventoverdoseri.org/wp-content/uploads/2023/06/PROVIDENT-overview.pdf"
                    target="_blank"
                    class="card-footer-item"
                    >Download</a
                  >
                </footer>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <span class="icon is-large">
                      <i class="fas fa-3x fa-file-pdf"></i>
                    </span>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">What is a RCT?</p>
                    <p class="subtitle is-6">PDF</p>
                  </div>
                </div>

                <div class="content">
                  Learn why a Randomized Control Trial (RCT) is one of the best
                  ways to study new interventions.
                  <br />
                </div>

                <footer class="card-footer">
                  <a
                    href="https://preventoverdoseri.org/wp-content/uploads/2023/06/PROVIDENT-Randomization.pdf"
                    target="_blank"
                    class="card-footer-item"
                    >Download</a
                  >
                </footer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Links -->
      <section id="links" class="section">
        <h1 class="title">Learn more</h1>
        <h2 class="subtitle"></h2>

        <div class="columns is-multiline">
          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8904285/"
              title="PROVIDENT Protocol Article"
              subtitle="Learn about the methods behind PROVIDENT"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://ridoh-drug-overdose-surveillance-iss-rihealth.hub.arcgis.com/"
              title="Rhode Island ROAAR Alerts"
              subtitle="Track weekly RI data"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://ridoh-overdose-surveillance-rihealth.hub.arcgis.com/search?sort=-created&tags=fatal%20heat%20maps%2Cems%20heat%20maps"
              title="Rhode Island Overdose Heat Maps"
              subtitle="Find the latest overdose maps"
            />
          </div>
        </div>
      </section>

      <!-- Glossary -->
      <section id="glossary" class="section">
        <h1 class="title">Glossary</h1>
        <h2 class="subtitle"></h2>

        <div class="container">
          <div class="card">
            <div class="card-content">
              <div class="content">
                <h4 class="title">Modelling Terms</h4>
                <strong>Prioritized</strong>: This means something
                <br />
                <strong>Eligible</strong>: This also means something
                <br />
              </div>
            </div>
          </div>
          <br />
          <div class="card">
            <div class="card-content">
              <div class="content">
                <h4 class="title">Modelling Terms</h4>
                <strong>Prioritized</strong>: This means something
                <br />
                <strong>Eligible</strong>: This also means something
                <br />
              </div>
            </div>
          </div>

          <br />
          <div class="card">
            <div class="card-content">
              <div class="content">
                <h4 class="title">Modelling Terms</h4>
                <strong>Prioritized</strong>: This means something
                <br />
                <strong>Eligible</strong>: This also means something
                <br />
              </div>
            </div>
          </div>

          <br />
          <div class="card">
            <div class="card-content">
              <div class="content">
                <h4 class="title">Modelling Terms</h4>
                <strong>Prioritized</strong>: This means something
                <br />
                <strong>Eligible</strong>: This also means something
                <br />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import ExternalLinkBig from "@/components/ExternalLinkBig.vue";
import { useMobileListener } from "@/composables/useMobileListener";

const { isMobile } = useMobileListener();
const desktopCollapsed = ref(false);
const showSidebar = computed(() => {
  return isMobile.value || (!isMobile.value && desktopCollapsed.value);
});

const toggle = () => {
  desktopCollapsed.value = !desktopCollapsed.value;
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.wrapper {
  background-color: whitesmoke;
}

.main {
  border-left: 1px solid #a4b1bf;
}

.sidebar {
  max-height: 200px;

  @media (min-width: 961px) {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
  }
}
</style>
