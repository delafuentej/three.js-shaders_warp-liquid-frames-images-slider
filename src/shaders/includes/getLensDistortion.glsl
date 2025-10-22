struct LensDistortion {
  vec2 distortedUV;
  float inside;
};

LensDistortion getLensDistortion(
  vec2 p,
  vec2 uv,
  vec2 sphereCenter,
  float sphereRadius,
  float focusFactor
) {
  vec2 dir = normalize(p - sphereCenter);
  float focusRadius = sphereRadius * focusFactor;
  float focusStrength = sphereRadius / 3000.0;

  float distToCenter = length(sphereCenter - p);
  float focusSdf = distToCenter - focusRadius;
  float sphereSdf = distToCenter - sphereRadius;

  float inside = smoothstep(0.0, 1.0, -sphereSdf / (sphereRadius * 0.001));

  float mFactor = clamp(focusSdf / (sphereRadius - focusRadius) * inside, 0.0, 1.0);
  mFactor = pow(mFactor, 5.0);

  vec2 distortedUV = getDistortedUV(uv, dir, mFactor * focusStrength);
  return LensDistortion(distortedUV, inside);
}
