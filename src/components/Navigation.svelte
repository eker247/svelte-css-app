<script>
  import { link } from "svelte-routing";
</script>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  @keyframes background-effect {
    0% {
      background-color: #0f00;
    }
    50% {
      background-color: #0f08;
    }
    100% {
      background-color: #0f00;
    }
  }

  li:hover {
    animation: background-effect 300ms;
  }

  a,
  a:visited,
  a:hover {
    color: var(--green-dark);
    text-decoration: none;
  }
</style>

<nav>
  <ul>
    <li>
      <a href="/" use:link>Home</a>
    </li>
    <li>
      <a href="about" use:link>About</a>
    </li>
    <li>
      <a href="animation" use:link>Animations</a>
    </li>
    <li>
      <a href="image-effects" use:link>Image Effects</a>
    </li>
    <li>
      <a href="image-cutting" use:link>Image Cutting</a>
    </li>
    <li>
      <a href="parallax" use:link>Parallax</a>
    </li>
    <li>
      <a href="testing" use:link>Testing</a>
    </li>
  </ul>
</nav>
