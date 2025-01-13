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
            <a href="#guides">
              <i class="fas fa-book mr-1" />
              <span v-if="showSidebar">Guides</span>
            </a>
            <a href="#publications">
              <i class="fas fa-download mr-1" />
              <span v-if="showSidebar">Publications</span>
            </a>
            <a href="#links">
              <i class="fas fa-link mr-1" />
              <span v-if="showSidebar">Links</span>
            </a>
            <a href="#videos">
              <i class="fas fa-video mr-1" />
              <span v-if="showSidebar">Videos</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="main column">
      <!-- Downloads -->
      <section id="guides" class="section">
        <h1 class="title">User Guides</h1>
        <h2 class="subtitle">
          These guides and infographics give a broad overview of the PROVIDENT
          project.
        </h2>

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
                    <p class="title is-4">Randomized Control Trials</p>
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

      <!-- Downloads -->
      <section id="publications" class="section">
        <h1 class="title">Publications</h1>
        <h2 class="subtitle">
          Read articles that have been published about the PROVIDENT project.
          Research articles give more details about how the PROVIDENT project
          and models were developed, and how they have been used.
        </h2>

        <div class="columns is-multiline">
          <div class="column is-one-half">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <span class="icon is-large">
                      <i class="fas fa-3x fa-link"></i>
                    </span>
                  </div>
                  <div class="media-content">
                    <p class="title is-5">
                      Preventing Overdose Using Information and Data from the
                      Environment (PROVIDENT): protocol for a randomized,
                      population-based, community intervention trial
                    </p>
                    <p class="subtitle is-6">Research Article</p>
                  </div>
                </div>

                <div class="content">
                  Learn about the PROVIDENT randomized control trial, the
                  project that led to the creation of this web tool. This
                  article contains an overview of the objectives of the project,
                  the research design and modelling approach, an outline of the
                  datasets that were used, and study procedures.
                  <br />
                </div>

                <footer class="card-footer">
                  <a
                    href="https://doi.org/10.1111/add.15731"
                    target="_blank"
                    class="card-footer-item"
                    >Read Article</a
                  >
                </footer>
              </div>
            </div>
          </div>

          <div class="column is-one-half">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <span class="icon is-large">
                      <i class="fas fa-3x fa-link"></i>
                    </span>
                  </div>
                  <div class="media-content">
                    <p class="title is-5">
                      Development and Validation of a Machine Learning Model to
                      Predict Neighborhood-level Overdose Risk in Rhode Island
                    </p>
                    <p class="subtitle is-6">Research Article</p>
                  </div>
                </div>

                <div class="content">
                  This article describes the development of an ensemble machine
                  learning model to predict neighborhood-level fatal overdose
                  risk in Rhode Island. The article described how the PROVIDENT
                  model is capable of identifying the 20% of Rhode Island
                  neighborhoods containing at least 40% of statewide overdose
                  deaths.
                  <br />
                </div>

                <footer class="card-footer">
                  <a
                    href="https://doi.org/10.1097/EDE.0000000000001695"
                    target="_blank"
                    class="card-footer-item"
                    >Read Article</a
                  >
                </footer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Links -->
      <section id="links" class="section">
        <h1 class="title">Links</h1>
        <h2 class="subtitle">
          Find other resources for overdose data in Rhode Island
        </h2>

        <div class="columns is-multiline">
          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://ridoh-drug-overdose-surveillance-iss-rihealth.hub.arcgis.com/"
              title="Rhode Island ROAAR Alerts"
              subtitle="Track weekly Rhode Island data"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://ridoh-overdose-surveillance-rihealth.hub.arcgis.com/search?sort=-created&tags=fatal%20heat%20maps%2Cems%20heat%20maps"
              title="Rhode Island Overdose Heat Maps"
              subtitle="Find the latest overdose maps"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://preventoverdoseri.org"
              title="PreventOverdoseRI.org"
              subtitle="See more Rhode Island data"
            />
          </div>
        </div>
      </section>

      <!-- Videos -->
      <section id="videos" class="section">
        <h1 class="title">Videos</h1>
        <h2 class="subtitle">
          Watch these videos to get a step-by-step walkthrough of the PROVIDENT
          web tool.
        </h2>

        <div class="columns is-multiline">
          <div class="column is-one-fourth">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/VlO9JB9Tk20"
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
                  Learn more about the PROVIDENT research project and how it can
                  help us prevent future drug overdoses.
                  <br />
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-fourth">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/g79TQA7SbG0"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">Registering and Logging in</p>
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
                  Learn how to register to gain access to the PROVIDENT web
                  tool.
                  <br />
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-fourth">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/nhpXXfk9a7o"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">The map interface</p>
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
                  Learn how to navigate the PROVIDENT web tool and map
                  interface.
                  <br />
                </div>
              </div>
            </div>
          </div>

          <div class="column is-one-fourth">
            <div class="card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <iframe
                    class="has-ratio"
                    width="640"
                    height="360"
                    src="https://www.youtube.com/embed/A1AuYh-lgrY"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">Exploring neighborhoods</p>
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
                  Dive into the web tool and learn to explore neighborhoods and
                  get more insights.
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
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
