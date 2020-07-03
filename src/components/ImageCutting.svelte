<script>

</script>

<style>
  :root {
    --size-half: 3rem;
    --size-md: 6rem;
  }

  .example-container {
    display: flex;
    flex-wrap: wrap;
  }

  .example {
    border: 1px solid #444;
    border-radius: 0.5rem;
    text-align: center;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .example:not(:last-child) {
    margin-right: 1rem;
  }

  .img {
    background-size: auto 100%;
    height: var(--size-md);
    width: var(--size-md);
  }

  .shape-circle {
    clip-path: circle(50% at 50% 50%);
  }

  .shape-ellipse {
    clip-path: ellipse(50% 30% at 50% 50%);
  }

  .shape-triangle {
    clip-path: polygon(0 100%, 38% 0, 100% 100%);
  }

  .shape-square {
  }

  .shape-pentagon {
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  }

  .shape-arrow {
    clip-path: polygon(
      0% 20%,
      60% 20%,
      60% 0%,
      100% 50%,
      60% 100%,
      60% 80%,
      0% 80%
    );
  }

  .text-container {
    width: 20rem;
  }

  .dot-shape {
    float: left;
    shape-outside: circle(3rem at 4rem 9rem);
    -webkit-shape-outside: circle(3rem at 4rem 9rem);
    -webkit-clip-path: circle(3rem at 3rem 9rem);
    clip-path: circle(3rem at 3rem 9rem);
    width: 7rem;
    height: 12rem;
  }

  .paragraph {
    margin: 0;
    max-width: 20rem;
    text-align: justify;
  }

  .text-image {
    font-size: 2rem;
    font-weight: 900;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    color: blueviolet;
  }

  .half-image {
    background-image: linear-gradient(135deg, #fffc 0 44%, transparent 75%),
      url("/img/mountains1.jpg");
    background-size: 100% auto;
    height: 22rem;
  }

  .half-image-shape {
    height: 100%;
    width: 100%;
    shape-outside: polygon(70% 0, 100% 0, 100% 100%, 30% 100%);
    -webkit-shape-outside: polygon(70% 0, 100% 0, 100% 100%, 30% 100%);
    -webkit-clip-path: polygon(70% 0, 100% 0, 100% 100%, 30% 100%);
    clip-path: polygon(70% 0, 100% 0, 100% 100%, 30% 100%);
    float: right;
  }

  .half-image-text {
    padding: .1rem 0 .5rem 1rem;
    text-align: left;
  }
</style>

<h1>Image Cutting</h1>

<h2>Let's test some image shapes...</h2>

<div class="example-container">
  <div class="example">
    <h3>Circle</h3>
    <div class="shape-circle img mt1" />
  </div>

  <div class="example">
    <h3>Ellipse</h3>
    <div class="shape-ellipse img mt1" />
  </div>

  <div class="example">
    <h3>Triangle</h3>
    <div class="shape-triangle img mt2" />
  </div>

  <div class="example">
    <h3>Square</h3>
    <div class="shape-square img mt3" />
  </div>

  <div class="example">
    <h3>Pentagon</h3>
    <div class="shape-pentagon img mt4" />
  </div>

  <div class="example">
    <h3>Arrow</h3>
    <div class="shape-arrow img mt3" />
  </div>
</div>

<h2>Text around the image</h2>

<div class="example text-container">
  <div class="dot-shape img shape-circle mt4" />
  <p class="paragraph">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic quae minima
    sunt quos accusantium cupiditate amet doloribus voluptatum sapiente qui,
    sequi nihil suscipit pariatur repellendus, id quasi fugiat omnis
    perferendis! Maxime ab doloribus non cupiditate, similique id repudiandae
    eaque asperiores deleniti assumenda quos eveniet quasi fuga ullam magnam
    facere molestias dicta cum quidem, vitae sed! Modi molestiae error ab sed?
    Quaerat, laborum accusamus quia modi consectetur magni incidunt eos vero at
    pariatur eum sapiente hic nemo sit quod excepturi, qui tenetur! Natus porro
    eos quaerat non obcaecati libero sint laudantium!
  </p>
</div>

<h2>Image in the text</h2>

<p class="text-image gradient">GRADIENT inside the text</p>
<p class="text-image mt1">IMAGE inside the text</p>

<h2>Image in half container</h2>

<div class="example">
  <div class="half-image">
    <div class="half-image-shape" />
    <div class="half-image-text">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit explicabo
        soluta sunt voluptatum illo, temporibus expedita maiores reiciendis
        vitae, earum reprehenderit commodi repellendus architecto. Doloremque
        accusamus exercitationem quasi quas? Qui.
      </p>

      <p>
        Quae, consequatur eaque! Ducimus maiores possimus iusto. Sequi dolorem
        blanditiis fuga, placeat consequatur distinctio magni eveniet, magnam
        ducimus voluptate nobis molestiae dignissimos facere neque maxime quia
        explicabo eos odio corrupti.
      </p>

      <p>
        Voluptate dolore ut, earum perferendis, fugit est illo voluptatem
        mollitia nulla laboriosam suscipit magnam amet reprehenderit atque. Non
        voluptatibus quod vero ratione, eaque ab corrupti perferendis rerum
        fugiat exercitationem expedita.
      </p>
    </div>
  </div>
</div>

<h5>Usefull links</h5>

<ul>
  <li>
    <a href="https://bennettfeely.com/clippy/">Create easaly any shape</a>
  </li>
  <li>
    <a href="https://css-tricks.com/how-to-do-knockout-text/">
      Image in the text (css-tricks.com)
    </a>
  </li>
</ul>
