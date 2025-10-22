import { SplitText } from "gsap/all";
import gsap from "gsap";

import { Slider } from "./components";

gsap.registerPlugin(SplitText);

function App() {
  return (
    <div>
      <Slider />
    </div>
  );
}

export default App;
