float getBubbleMask(vec2 p, vec2 center, float radius) {
  return step(radius, length(p - center));
}
