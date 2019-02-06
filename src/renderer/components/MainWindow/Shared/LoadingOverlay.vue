<template>
  <div>
    <div class='overlay'>
      <div class="animated" :class="randAnimation">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="128px" height="128px" viewBox="0 0 312.414 312.414" style="enable-background:new 0 0 312.414 312.414;" xml:space="preserve">
            <g>
            	<g>
            		<path d="M309.12,105.072l-52.682-22.331c-19.86-9.45-45.525-35.105-45.779-35.363c-1.239-1.242-3.011-1.804-4.746-1.511    c-1.734,0.3-3.211,1.424-3.96,3.019c-8.828,18.721-34.504,24.271-35.1,24.405L3.969,118.069c-2.096,0.58-3.641,2.349-3.921,4.498    c-0.287,2.151,0.752,4.266,2.618,5.363l87.109,51.1c0.836,0.49,1.78,0.743,2.732,0.743c0.517,0,1.042-0.074,1.55-0.227    l214.502-64.339c2.184-0.653,3.718-2.603,3.84-4.875C312.526,108.06,311.213,105.958,309.12,105.072z M93.209,168.53    L19.17,125.095l150.198-41.304c1.145-0.232,25.714-5.472,38.66-23.944c8.817,8.29,27.627,24.97,43.985,32.745l39.113,16.577    L93.209,168.53z" fill="#FFFFFF"/>
            		<path d="M305.465,126.466L93.214,190.13L8.133,140.22c-2.566-1.511-5.88-0.646-7.388,1.922c-1.511,2.57-0.648,5.882,1.922,7.388    l89.14,52.292l216.754-65.014c2.858-0.857,4.482-3.866,3.623-6.724C311.329,127.234,308.318,125.625,305.465,126.466z" fill="#FFFFFF"/>
            		<path d="M305.465,148.067L93.214,211.73L8.133,161.817c-2.566-1.514-5.88-0.644-7.388,1.925c-1.511,2.568-0.648,5.88,1.922,7.389    l89.14,52.291l216.754-65.014c2.858-0.857,4.482-3.865,3.623-6.724C311.329,148.833,308.318,147.215,305.465,148.067z" fill="#FFFFFF"/>
            		<path d="M305.465,169.664L93.214,233.33L8.133,183.417c-2.566-1.514-5.88-0.639-7.388,1.924c-1.511,2.568-0.648,5.881,1.922,7.389    l89.14,52.291l216.754-65.016c2.858-0.854,4.482-3.865,3.623-6.724C311.329,170.434,308.318,168.82,305.465,169.664z" fill="#FFFFFF"/>
            		<path d="M305.465,191.264L93.214,254.93L8.133,205.017c-2.566-1.514-5.88-0.644-7.388,1.925c-1.511,2.568-0.648,5.88,1.922,7.388    l89.14,52.292l216.754-65.017c2.858-0.854,4.482-3.865,3.623-6.724C311.329,192.034,308.318,190.415,305.465,191.264z" fill="#FFFFFF"/>
            	</g>
            </g>
          </svg>
        </div>
        <h3 class="is-3 title loading-msg">
          <p class="loading" title="The computer gnomes are fetching your data and creating a search catalog, sorry for the delay">Collating<span>.</span><span>.</span><span>.</span></p>
        </h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loading-overlay',
  computed: {
    randAnimation () {
      let animations = [
        'infinite pulse',
        'infinite swing',
        'tada',
        'infinite bounce',
        'hinge',
        'rollin',
        'bounceIn',
        'flip',
        'rotateIn',
        'zoomIn',
        'slideInUp'
      ]
      return animations[Math.floor(Math.random() * animations.length)]
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../../../variables.scss";

  .overlay {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    background-color: $primary;
  }
  .icon {
    -webkit-user-select: none;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading-msg {
    cursor: default;
    -webkit-user-select: none;
    text-align: center;
    vertical-align: middle;
    margin-top: 50px;
    color: $text-dark;
  }

  @keyframes blink {
    0% {
      opacity: .2;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: .2;
    }
  }
  .loading span {
    animation-name: blink;
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
  }
  .loading span:nth-child(2) {
    animation-delay: .2s;
  }
  .loading span:nth-child(3) {
    animation-delay: .4s;
  }
</style>
