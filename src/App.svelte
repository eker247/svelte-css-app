<script>
  import { Router, Route, Link } from "svelte-routing";
  import Testing from "./components/Testing.svelte";
  import Navigation from "./components/Navigation.svelte";
  import About from "./components/About.svelte";
  import Animation from "./components/Animation.svelte";
  import ImageEffects from "./components/ImageEffects.svelte";
  import ImageCutting from "./components/ImageCutting.svelte";
  import Parallax from "./components/Parallax.svelte";
  export let url = "";

  const bundle = {
    firstName: "FN",
    lastName: "LN"
  };
</script>

<style>
  .layout {
    display: grid;
    grid-template-columns: 7rem auto;
  }
</style>

<div class="layout">
  <Router {url}>
    <Navigation />
    <main>
      <Route let:params path="about"><About /></Route>
      <Route let:params path="/"><Testing {...bundle} /></Route>
      <Route let:params path="animation"><Animation /></Route>
      <Route let:params path="image-effects"><ImageEffects /></Route>
      <Route let:params path="image-cutting"><ImageCutting /></Route>
      <Route let:params path="parallax"><Parallax /></Route>
    </main>
  </Router>
</div>
