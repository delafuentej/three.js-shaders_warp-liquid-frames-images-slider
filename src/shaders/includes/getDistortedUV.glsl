vec2 getDistortedUV(vec2 uv, vec2 direction, float factor) {
  vec2 scaledDirection = direction;
  scaledDirection.y *= 2.0;
  return uv - scaledDirection * factor;
}