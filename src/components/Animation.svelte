<script>
  let mountains = ["mt1", "mt2", "mt3", "mt4"];
  let animations = ["shake", "zoom-in", "zoom-out"];

  function zoomIn(selector) {
    const img1 = document.querySelector(`.img.${selector}.transition`);
    const size = (img1.style.backgroundSize || "100% auto").split("%")[0];
    img1.style.backgroundSize = `${size * 1.2}% auto`;
  }

  function zoomOut(selector) {
    const img1 = document.querySelector(`.img.${selector}.transition`);
    const size = (img1.style.backgroundSize || "100% auto").split("%")[0];
    img1.style.backgroundSize = `${size / 1.2}% auto`;
  }

  function getPosition(element) {
    const positionX = parseInt(
      (element.style.backgroundPosition || "50% 50%").match(/^(-?[0-9]+)%/)[1],
      10
    );
    const positionY = parseInt(
      (element.style.backgroundPosition || "50% 50%").match(/(-?[0-9]+)%$/)[1],
      10
    );
    return { positionX, positionY };
  }

  function increase(value) {
    const increased = value + 10;
    return increased < 100 ? increased : 100;
  }

  function decrease(value) {
    const decreased = value - 10;
    return decreased > 0 ? decreased : 0;
  }

  function moveLeft(selector) {
    const img1 = document.querySelector(`.img.${selector}.transition`);
    const { positionX, positionY } = getPosition(img1);
    img1.style.backgroundPosition = `${decrease(positionX)}% ${positionY}%`;
  }

  function moveRight(selector) {
    const img1 = document.querySelector(`.img.${selector}.transition`);
    const { positionX, positionY } = getPosition(img1);
    img1.style.backgroundPosition = `${increase(positionX)}% ${positionY}%`;
  }

  function moveUp(selector) {
    const img1 = document.querySelector(`.img.${selector}.transition`);
    const { positionX, positionY } = getPosition(img1);
    img1.style.backgroundPosition = `${positionX}% ${decrease(positionY)}%`;
  }

  function moveDown(selector) {
    const img1 = document.querySelector(`.img.${selector}.transition`);
    const { positionX, positionY } = getPosition(img1);
    img1.style.backgroundPosition = `${positionX}% ${increase(positionY)}%`;
  }

  function play() {
    const el = document.querySelector('.big-zoom');
    el.style.backgroundSize = '300% auto';
  }

  function pause() {

  }

  function reset() {

  }
</script>

<style>
  footer {
    min-height: 4rem;
  }

  .img {
    width: 12rem;
    height: 6.5rem;
    background-size: 100% auto;
    background-position: center;
  }

  .animation {
    animation-duration: 0.3s;
  }

  .animation-container {
    display: flex;
  }

  .animation-container *:not(:last-child) {
    margin-right: 0.5rem;
  }

  @keyframes shake-animation {
    0% {
      left: 0;
    }
    12.5% {
      left: -0.5rem;
    }
    37.5% {
      left: 0.5rem;
    }
    50% {
      left: 0;
    }
    62.5% {
      left: -0.5rem;
    }
    87.5% {
      left: 0.5rem;
    }
    100% {
      left: 0;
    }
  }

  .shake:hover {
    position: relative;
    left: 0;
    animation-name: shake-animation;
  }

  @keyframes zoom-in-animation {
    0% {
      background-size: 120% auto;
    }
    100% {
      background-size: 140% auto;
    }
  }

  .zoom-in:hover {
    background-size: 140% auto;
    animation-name: zoom-in-animation;
  }

  @keyframes zoom-out-animation {
    0% {
      background-size: 120% auto;
    }
    100% {
      background-size: 100% auto;
    }
  }

  .zoom-out {
    background-size: 140% auto;
  }

  .zoom-out:hover {
    background-size: 100% auto;
    animation-name: zoom-out-animation;
  }

  @keyframes grow-animation {
    0% {
      left: 0;
      top: 0;
      width: 12rem;
      height: 6.5rem;
    }
    100% {
      left: -3rem;
      top: -1.875rem;
      width: 18rem;
      height: 9.75rem;
    }
  }

  .position-relative {
    width: 12rem;
    height: 6.5rem;
    position: relative;
  }

  .grow:hover {
    position: absolute;
    left: -3rem;
    top: -1.875rem;
    width: 18rem;
    height: 9.75rem;
    animation-name: grow-animation;
    z-index: 1;
  }

  .transition {
    transition: 0.5s all;
  }

  .position-relative:hover .control-btn {
    opacity: 0.8;
  }

  .control-btn {
    position: absolute;
    opacity: 0;
    background-color: transparent;
    border: 1px solid white;
    border-radius: 0.25rem;
    color: white;
    text-shadow: 0 0 4px #000;
    box-shadow: 0 0 4px #000;
    transition: 0.5s all;
    width: 2rem;
    height: 2rem;
    box-sizing: border-box;
    padding: 0;
  }

  .btn-in {
    top: 0.25rem;
    left: 0.25rem;
  }

  .btn-out {
    top: 0.25rem;
    right: 4.75rem;
  }

  .arrow-left {
    top: 2.5rem;
    left: 0.25rem;
  }

  .arrow-left:after {
    content: "←";
  }

  .arrow-up {
    top: 0.25rem;
    left: 2.5rem;
  }

  .arrow-up:after {
    content: "↑";
  }

  .arrow-down {
    top: 2.5rem;
    left: 2.5rem;
  }

  .arrow-down:after {
    content: "↓";
  }

  .arrow-right {
    top: 2.5rem;
    left: 4.75rem;
  }

  .arrow-right:after {
    content: "→";
  }
</style>

<h1>Animations</h1>

<h2>Several different animations</h2>

{#each animations as animationName}
  <div>
    <h3>{animationName}</h3>

    <div class="animation-container">
      {#each mountains as mtX}
        <div class="img {mtX} animation {animationName}" />
      {/each}
    </div>
  </div>
{/each}

<div>
  <h3>grow</h3>

  <div class="animation-container ">
    {#each mountains as mtX}
      <div class="position-relative">
        <div class="img {mtX} animation grow" />
      </div>
    {/each}
  </div>
</div>

<h2>Controlling transitions</h2>

<div class="animation-container">
  {#each mountains as mtX}
    <div class="position-relative">
      <div class="img {mtX} transition zoom-in-transition" />
      <button class="control-btn btn-in" on:click={() => zoomIn(mtX)}>+</button>
      <button class="control-btn btn-out" on:click={() => zoomOut(mtX)}>
        -
      </button>
      <button class="control-btn arrow-left" on:click={() => moveLeft(mtX)} />
      <button class="control-btn arrow-up" on:click={() => moveUp(mtX)} />
      <button class="control-btn arrow-down" on:click={() => moveDown(mtX)} />
      <button class="control-btn arrow-right" on:click={() => moveRight(mtX)} />
    </div>
  {/each}
</div>

<div class="animation-container">
  <div class="img mt1 transition big-zoom" />
  <button class="" on:click={() => pause()}>Pause</button>
  <button class="" on:click={() => play()}>Play</button>
  <button class="" on:click={() => reset()}>Reset</button>
</div>

<footer>
  <h5>Usefull links</h5>

  <ul>
    <li>
      <a
        href="https://css-tricks.com/controlling-css-animations-transitions-javascript/">
        Controlling transitions (css-tricks.com)
      </a>
    </li>
  </ul>
</footer>
