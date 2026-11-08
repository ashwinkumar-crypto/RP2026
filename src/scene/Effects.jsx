import { EffectComposer, Bloom, Vignette, ToneMapping, N8AO, Noise, SMAA } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'

/** Film pipeline: contact shadows (AO) → glow → grain → vignette → ACES tone-map → AA. */
export default function Effects({ quality }) {
  const high = quality.tier === 'high'
  return (
    <EffectComposer multisampling={0} disableNormalPass={!high}>
      {high && <N8AO aoRadius={1.1} distanceFalloff={1.2} intensity={2.4} quality="medium" halfRes />}
      <Bloom mipmapBlur intensity={high ? 0.6 : 0.55} luminanceThreshold={0.95} luminanceSmoothing={0.3} radius={0.7} />
      <Noise opacity={0.045} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.28} darkness={0.6} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  )
}
