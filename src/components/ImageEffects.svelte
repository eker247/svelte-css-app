<script>
  let mountains = ["mt1", "mt2", "mt3", "mt4"];
  let effects = [
    "blur",
    "brightness-up",
    "brightness-down",
    "contrast-up",
    "contrast-down",
    "drop-shadow",
    "grayscale",
    "hue-rotate",
    "invert",
    "opacity",
    "saturate-up",
    "saturate-down",
    "sepia"
  ];
</script>

<style>
  .img {
    width: 12rem;
    height: 12rem;
    background-size: auto 100%;
  }

  .effect-container {
    display: flex;
    flex-wrap: nowrap;
  }

  .effect-container *:not(:last-child) {
    margin-right: 0.5rem;
  }

  .blur {
    -webkit-filter: blur(3px);
    filter: blur(3px);
  }

  .brightness-up {
    -webkit-filter: brightness(200%);
    filter: brightness(200%);
  }

  .brightness-down {
    -webkit-filter: brightness(50%);
    filter: brightness(50%);
  }

  .contrast-up {
    -webkit-filter: contrast(200%);
    filter: contrast(200%);
  }

  .contrast-down {
    -webkit-filter: contrast(50%);
    filter: contrast(50%);
  }

  /* // /////// */
  .drop-shadow {
    -webkit-filter: drop-shadow(5px 10px 4px);
    filter: drop-shadow(5px 10px 4px);
  }

  .grayscale {
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
  }

  .hue-rotate {
    -webkit-filter: hue-rotate(60deg);
    filter: hue-rotate(60deg);
  }

  .invert {
    -webkit-filter: invert(100%);
    filter: invert(100%);
  }

  .opacity {
    -webkit-filter: opacity(0.5);
    filter: opacity(0.5);
  }

  .saturate-up {
    -webkit-filter: saturate(200%);
    filter: saturate(200%);
  }

  .saturate-down {
    -webkit-filter: saturate(50%);
    filter: saturate(50%);
  }

  .sepia {
    -webkit-filter: sepia(100%);
    filter: sepia(100%);
  }
</style>

<h1>Image Effects</h1>

<h2>Let's try image filters</h2>

{#each effects as effect}
  <div>
    <h3>{effect}</h3>

    <div class="effect-container">
      {#each mountains as mtX}
        <div class="img {mtX} {effect}" />
      {/each}
    </div>
  </div>
{/each}
