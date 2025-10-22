import { SplitText } from "gsap/all";
import gsap from "gsap";

import { Slider } from "./components";

gsap.registerPlugin(SplitText);

function App() {
  return (
    <h1 class="text-3xl font-bold underline">
      <Slider />
    </h1>
  );
}

export default App;
