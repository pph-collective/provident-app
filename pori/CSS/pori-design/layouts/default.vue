<template>
  <div>
    <div class="nav" :class="{ 'nav--hidden': !showNavbar }">
      <a class="nav-logo" href="/"><span>Prevent Overdose RI</span></a>
      <ul class="nav-primary">
        <li><a href="/about">About</a>
        <ul class="nav-dropdown">
            <li><a href="">What is Prevent Overdose RI?</a></li>
            <li><a href="/our-action-plan">Our Action Plan</a></li>
            <li><a href="">ROAAR Archive</a></li>
            <li><a href="">The Task Force</a></li>
            <li><a href="">Presentation Archive</a></li>
            <li><a href="">Member Login</a></li>
            <li><a href="">Jurisdictional Plan</a></li>
          </ul></li>
        <li><a href="/learn-more">Learn More</a>
          <ul class="nav-dropdown">
            <li><a href="">Opioids</a></li>
            <li><a href="/fentanyl">Fentanyl</a></li>
            <li><a href="">Help a Loved One</a></li>
            <li><a href="">Addiction</a></li>
            <li><a href="">Treatment</a></li>
            <li><a href="">Recovery</a></li>
          </ul>
        </li>
        <li><a href="/prevent-an-overdose">Prevent an Overdose</a>
          <ul class="nav-dropdown">
            <li><a href="">Get Naloxone</a></li>
            <li><a href="">Safer Drug Use Practices</a></li>
            <li><a href="/fentanyl-test-strips">Fentanyl Test Strips</a></li>
            <li><a href="">Respond to Overdose</a></li>
            <li><a href="">Get Rid of Medications Safely</a></li>
            <li><a href="">Deshágase de la medicina</a></li>
          </ul>
        </li>
        <li><a href="/see-the-data">See the Data</a>
        <ul class="nav-dropdown">
            <li><a href="">Emerging Trends in RI Data</a></li>
            <li><a href="">Track our Action Plan</a></li>
            <li><a href="">Overdose Deaths</a></li>
            <li><a href="">Emergency Department Visits</a></li>
            <li><a href="">Medication Assisted Therapy</a></li>
            <li><a href="">Naloxone Data</a></li>
            <li><a href="">Opioid Prescribing Data</a></li>
          </ul>
        </li>
        <li><a href="/find-resources">Find Resources</a>
        <ul class="nav-dropdown">
            <li><a href="">Safer Drug Use Resources</a></li>
            <li><a href="">Families &amp; Teachers</a></li>
            <li><a href="">Providers</a></li>
            <li><a href="">First Responders</a></li>
            <li><a href="">Overdose Research Library</a></li>
            <li><a href="">Campaign Resources</a></li>
          </ul>
        </li>
        <li><a href="">Get Involved</a></li>
        <li><a href="" class="search-form"></a></li>
      </ul>

      <ul class="nav-secondary">
        <li><a class="blue-button" href="/get-help">Get Help</a></li>
      </ul>
      <div id="searchFormDropdown" class="search-form-dropdown" :class="{ active: isActive }">
        <input class="search-field" type="text" placeholder="Search">
      </div>
    </div>
    <nuxt/>
  </div>
</template>

<style>
html {
  font-family: 'Lora', serif;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: border-box;
  margin: 0;
}

  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 7vh;
    display: block;
    z-index: 100;
    background: rgba(255,255,255,1);
    transform: translate3d(0, 0, 0);
    transition: 0.1s all ease-out;
  }

  .nav.nav--hidden {

  }

  .nav ul {
    list-style: none;
    margin: 0;
    padding: 0;

  }
  .nav ul li {
    float: left;
    position: relative;
  }

  .nav ul li a {
    text-decoration: none;
    color: #2b3564;
    font-weight: bold;
    transition: 100ms all ease-in-out;
    padding: 1vh;
  }

  .nav ul li a:hover {
    color: #76b452;
  }

  .nav ul.nav-primary {
    font-size: calc(7px + 0.7vw);
    position: absolute;
    bottom: 2.2vh;
    right: 10vw;
  }

  .nav ul.nav-primary li {
    padding: 0px 0.5vw;
  }

  .nav ul.nav-secondary {
    position: absolute;
    top: 2.5vh;
    font-family: 'Lora', sans-serif;
    position: absolute;
    right: 1vw;
    font-size: calc(9px + 0.4vw);
  }


  .nav ul li:hover {

  }


  .nav ul li ul.nav-dropdown {
    transition: 300ms all ease-in-out;
    opacity: 0;
    display: none;
    background: #fff;
    position: absolute;
    margin: 0;
    padding: 0;
    width: 300px;
    font-family: 'Lora', serif;
    font-size: calc(9px + 0.4vw);
    left: -1vw;
    top: 3.5vh;
    padding: 3vh 1vw;
    box-shadow: 0px 10px 20px rgba(24,24,24,0.4);
  }

  .nav ul.nav-primary li:hover ul.nav-dropdown {
    display: block;
    opacity: 1;
  }

  .nav ul li ul.nav-dropdown li {
    display: block;
  }

  .nav ul li ul.nav-dropdown li a {
    display: block !important;
    width: 260px;
  }

  .nav ul li ul.nav-dropdown li:hover {
    background: #fff;
    color: #2b3564;
  }

  .nav ul.nav-secondary li {
    padding: 0px 2vw;
  }

  .nav-logo {
    background: url(/logo.png);
    background-size: contain;
    background-position: bottom left;
    background-repeat: no-repeat;
    width: 14vw;
    height: 5vw;
    display: block;
    position: absolute;
    left: 9.5vw;
    bottom: 1.5vh;
    max-width: 260px;

  }

  .nav-logo span {
    width: 0px;
    overflow: hidden;
    display: block;
  }

  .blue-button {
    background: #2b3564;
    color: #fff !important;
    padding: 4px 12px;
    text-transform: uppercase;
    font-family: 'futura-pt', sans-serif;
  }

  .blue-button:hover {
    background: #fec200;
  }

  .search-form-dropdown {
    width: 100vw;
    height: 10vh;
    background: #fff;
    top: 7vh;
    position: relative;
    z-index: -1;
    display: none;
  }

  .search-form-dropdown input {
    font-family: 'Lora';
    font-size: calc(16px + 1vw);
    position: relative;
    left: 9vw;
    top: 2vh;
  }



</style>
<script>
export default {

  data () {
    return {
      showNavbar: true,
      lastScrollPosition: 0,
      scrollValue: 0
    }
  },

  mounted () {
    this.lastScrollPosition = window.pageYOffset
    window.addEventListener('scroll', this.onScroll)
    const viewportMeta = document.createElement('meta')
    viewportMeta.name = 'viewport'
    viewportMeta.content = 'width=device-width, initial-scale=1'
    document.head.appendChild(viewportMeta)
  },

  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll)
  },

  methods: {
    onScroll () {
      if (window.pageYOffset < 0) {
        return
      }
      if (Math.abs(window.pageYOffset - this.lastScrollPosition) < 60) {
        return
      }
      this.showNavbar = window.pageYOffset < this.lastScrollPosition
      this.lastScrollPosition = window.pageYOffset
    }
  }
}
</script>
