import { lazy, Suspense } from "react";
const Slider = lazy(() => import("./components/Slider"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Slider />
    </Suspense>
  );
}

export default App;
