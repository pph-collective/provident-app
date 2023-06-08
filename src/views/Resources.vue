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
        <h1 class="title">Section: Videos</h1>
        <h2 class="subtitle">
          A simple container to divide your page into <strong>sections</strong>,
          like the one you're currently reading.
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
        <h1 class="title">Section: Downloads</h1>
        <h2 class="subtitle">
          A simple container to divide your page into <strong>sections</strong>,
          like the one you're currently reading.
        </h2>

        <div class="columns is-multiline">
          <div class="column is-one-third">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <figure class="image is-128x128">
                      <img
                        src="https://bulma.io/images/placeholders/256x256.png"
                      />
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">File Name</p>
                    <p class="subtitle is-6">May 12, 2023</p>
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

                <footer class="card-footer">
                  <a href="#" class="card-footer-item">Download</a>
                </footer>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <figure class="image is-128x128">
                      <img
                        src="https://bulma.io/images/placeholders/256x256.png"
                      />
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">File Name</p>
                    <p class="subtitle is-6">May 12, 2023</p>
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

                <footer class="card-footer">
                  <a href="#" class="card-footer-item">Download</a>
                </footer>
              </div>
            </div>
          </div>

          <div class="column is-one-third">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <figure class="image is-128x128">
                      <img
                        src="https://bulma.io/images/placeholders/256x256.png"
                      />
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">File Name</p>
                    <p class="subtitle is-6">May 12, 2023</p>
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

                <footer class="card-footer">
                  <a href="#" class="card-footer-item">Download</a>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Links -->
      <section id="links" class="section">
        <h1 class="title">Section: Links</h1>
        <h2 class="subtitle">
          A simple container to divide your page into <strong>sections</strong>,
          like the one you're currently reading.
        </h2>

        <div class="columns is-multiline">
          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.google.com/maps"
              title="Google Maps"
              subtitle="Geography woo~"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.google.com/maps"
              title="Google Maps"
              subtitle="Geography woo~"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.google.com/maps"
              title="Google Maps"
              subtitle="Geography woo~"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.google.com/maps"
              title="Google Maps"
              subtitle="Geography woo~"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.google.com/maps"
              title="Google Maps"
              subtitle="Geography woo~"
            />
          </div>

          <div class="column is-one-third">
            <ExternalLinkBig
              href="https://www.google.com/maps"
              title="Google Maps"
              subtitle="Geography woo~"
            />
          </div>
        </div>
      </section>

      <!-- Glossary -->
      <section id="glossary" class="section">
        <h1 class="title">Section: Glossary</h1>
        <h2 class="subtitle">
          A simple container to divide your page into <strong>sections</strong>,
          like the one you're currently reading.
        </h2>

        <div class="container">
          <div class="card">
            <div class="card-content">
              <div class="content">
                Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at
                eros. Donec id elit non mi porta gravida at eget metus. Cum
                sociis natoque penatibus et magnis dis parturient montes,
                nascetur ridiculus mus. Cras mattis consectetur purus sit amet
                fermentum.
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
