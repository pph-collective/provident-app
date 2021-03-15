<template>

  <section class="container">
    <div>

      <div class="homepage-header" >
        <video-bg :sources="['homepage-video.mp4']" 
      v-lazy:background-image="'/images/home.jpg'"
      class="homeVideoBg">

      </video-bg>
        
        <h1 class="title">This is our <br/>home for ending <br/>the opioid crisis</h1>
      </div>
      
      <div class="homepage-greeting">
        <div class="body-copy">
          <p>On this website, you will find our latest data and helpful resources on overdose. You can also learn where to get naloxone, how to get into treatment, or what events are happening near you.</p>

          <p>We all have a role to play in ending the overdose crisis. <br/>What’s yours?</p>
        </div>

        <div class="get-help-box">
          <h6>Get Help</h6>
          <br/>
          <p>Call to connect with a licensed counselor, 24 hours a day, seven days a week. Hablamos español.</p>
          <p class="telephone"><strong>(401) 414-LINK (5465)</strong></p>
        </div>
      </div>

      <div class="homepage-action-plan">
        <div class="left-col inverted-text">
          <h6>Our action plan</h6>
          <h2>We have one goal: <br>to save lives</h2>
          <p>Rhode Island is a leader in the overdose crisis. In 2015, we created our first statewide <a href="/our-action-plan">Overdose Prevention Action Plan</a> for how our state was going to end the crisis and save lives. The Action Plan is a statewide effort to stop deadly overdoses and to help people get the support they need to stay safe. We updated the plan in 2019 to build on what we have learned.</p>
          
        </div>
      </div>
      <div class="homepage-action-plan-pillars">
        <h2>Here&#8217;s how our state is saving lives <br/>and ending the overdose crisis.</h2>
        <div class="homepage-action-plan-columns action-plan-columns">
          <div class="action-plan-columns-pillar">
            <img class="action-plan-pillar-image" src="/graphic-prevention.png">
            <div class="pillar-copy">
              <h3>Prevention</h3>
              <p>The way we can stop the harm of drug use is to provide support to people as early as possible.</p>
            </div>
            <div class="fact-box">
              <p><strong>FACT:</strong> This means we're teaching people how to keep their opioid prescriptions safe and get rid of the old ones. We're also promoting alternatives to opioid pain medications, like massage, physical therapy, and acupuncture.</p>
            </div>
          </div>
          <div class="action-plan-columns-pillar">
            <img class="action-plan-pillar-image" src="/graphic-rescue.png">
            <div class="pillar-copy">
              <h3>Rescue</h3>
              <p>Everyone can learn how to use naloxone and carry it with them to help stop an opioid overdose.</p>
            </div>
            <div class="fact-box">
              <p><strong>FACT:</strong> This means we are giving out more naloxone than ever in our state. We have community trainings every month for anyone who wants to learn how to use naloxone.</p>
            </div>
          </div>
          <div class="action-plan-columns-pillar">
            <img class="action-plan-pillar-image" src="/graphic-treatment.png">
            <div class="pillar-copy">
              <h3>Treatment</h3>
              <p>We will help by making sure that anyone who is ready for treatment can get help when they are ready.</p>
            </div>
            <div class="fact-box">
              <p><strong>FACT:</strong> This means we have a 24-hour support line and crisis center called BH Link, where anyone can call and get help for themselves or a loved one.</p>
            </div>
          </div>
          <div class="action-plan-columns-pillar">
            <img class="action-plan-pillar-image" src="/graphic-recovery.png">
            <div class="pillar-copy">
              <h3>Recovery</h3>
              <p>We know that recovery from addiction is possible for everyone and we have more recovery support services than ever in our state.</p>
            </div>
            <div class="fact-box">
              <p><strong>FACT:</strong> This means we're teaching people how to keep their opioid prescriptions safe and get rid of the old ones. We're also promoting alternatives to opioid pain medications, like massage, physical therapy, and acupuncture.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="homepage-article-list article-list">  
        <div class="article-list-item">
          <img class="article-image" src="/illustration-what-are-opioids.jpg">
          <div class="article-copy">
            <h3>What are opioids?</h3>
            <p>Opioids are the drugs that are causing deadly overdoses in our state. Learn more about the types of opioids and how to stay safe when using them.</p>
            <p><a href="#">Learn More</a></p>
          </div>
        </div>
        <div class="article-list-item">
          <img class="article-image" src="/illustration-preventing-opioid-overdoses.jpg">
          <div class="article-copy">
            <h3>Preventing opioid overdoses</h3>
            <p>When a person survives an overdose, it’s because someone knew what an overdose looked like and how to take action. Call 9-1-1 immediately if you think someone is overdosing.</p>
            <p><a href="#">Learn More</a></p>
          </div>
        </div>
      
    </div>

    <div class="homepage-video-block">
      <h6>Latest Campaign</h6>

      <iframe class="video-carousel-example-video" width="560" height="315" src="https://www.youtube.com/embed/aRu6wwNB1Hc?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

      <div class="carousel-items"><div class="active"></div><div></div><div></div></div>

      <h2>Naloxone</h2>
      <p>An overdose doesn’t mean it’s over. Naloxone saves lives and you can get it at any pharmacy. This video was made not just to create awareness of the overdose crisis, but to show everyone that even when it seems like it’s too late, they can still help prevent an overdose.</p>


    </div>


    <div class="homepage-article-list article-list">  
        <div class="article-list-item">
          <img class="article-image" src="/illustration-community.jpg">
          <div class="article-copy">
            <h3>Community</h3>
            <p>You can help us prevent opioid use in our communities.</p>
            <p><a href="#">Learn what you can do to help</a></p>
          </div>
        </div>
        <div class="article-list-item">
          <img class="article-image" src="/illustration-providers.png">
          <div class="article-copy">
            <h3>Providers</h3>
            <p>You can support our guidelines for safe and responsible prescribing to help make opioid use safer.</p>
            <p><a href="#">Learn what you can do to help</a></p>
          </div>
        </div>
      
    </div>
    <div class="footer">
      <div class="footer-inner">
        
        <div class="left-col footer-mission">
          <p>This website is an initiative of the Rhode Island Governor Gina Raimondo’s Overdose Prevention and Intervention Task Force, in collaboration with the RI Department of Health (RIDOH), the RI Department of Behavioral Healthcare, Developmental Disabilities and Hospitals (BHDDH), and Brown University School of Public Health.</p>
        </div>
        <div class="right-col footer-search">
          <input type="text" class="footer-search-field" placeholder="Search">
          <p>&copy; 2019 Prevent Overdose RI</p>
        </div>
        <div class="footer-logos">
          <img class="footer-logo footer-logo-pori" src="/logo_footer.png">
          <img class="footer-logo" src="/logo-brown.png">
          <img class="footer-logo" src="/logo-ridoh.png">
          <img class="footer-logo" src="/logo-ri.png">
          <img class="footer-logo" src="/logo-bhddh.png">
        </div>
      </div>
      
    </div>
    </div>
    
    
  </section>
</template>

<script>

</script>

<style type="text/css">
    .homeVideoBg {
    width: 100vw;
    height: 100vh !important;
    z-index: 0;
    transition: 200ms all ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (--narrow) {
      width: 100vw;
      height: 80vh;
      margin-top: 18vw;
    }
    @media (--wide) {


    }
    &:hover {
      opacity: 1;
    }
  }

</style>

