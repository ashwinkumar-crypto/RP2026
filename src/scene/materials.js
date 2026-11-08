import * as THREE from 'three'
import { marbleSet, plasterSet } from './pbr'

const marble = marbleSet({ size: 512, repeat: [1, 1], tiles: 1 })
const plaster = plasterSet({ size: 512, repeat: [8, 3] })

/** Shared physically-based materials – created once, reused by every scene component. */
export const mats = {
  gold: new THREE.MeshPhysicalMaterial({
    color: '#f0c05a', metalness: 1, roughness: 0.22, clearcoat: 0.3, clearcoatRoughness: 0.25,
    emissive: '#3a2204', emissiveIntensity: 0.12, envMapIntensity: 1.3,
  }),
  marble: new THREE.MeshPhysicalMaterial({
    color: '#ffffff', map: marble.map, roughnessMap: marble.roughnessMap, normalMap: marble.normalMap,
    normalScale: new THREE.Vector2(0.4, 0.4), roughness: 1, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.15,
    emissive: '#2a1c0c', emissiveIntensity: 0.1,
  }),
  sandstone: new THREE.MeshStandardMaterial({
    color: '#e9cd96', map: plaster.map, roughnessMap: plaster.roughnessMap, normalMap: plaster.normalMap,
    normalScale: new THREE.Vector2(0.6, 0.6), roughness: 1, emissive: '#6a4410', emissiveIntensity: 0.22,
  }),
  sandstoneLight: new THREE.MeshStandardMaterial({
    color: '#f3dfb0', map: plaster.map, roughnessMap: plaster.roughnessMap, normalMap: plaster.normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5), roughness: 1, emissive: '#7a5214', emissiveIntensity: 0.28,
  }),
  wallCream: new THREE.MeshStandardMaterial({
    color: '#d9b080', map: plaster.map, roughnessMap: plaster.roughnessMap, normalMap: plaster.normalMap,
    normalScale: new THREE.Vector2(0.8, 0.8), roughness: 1, emissive: '#3a1c08', emissiveIntensity: 0.3,
  }),
  wood: new THREE.MeshPhysicalMaterial({ color: '#4f2812', roughness: 0.5, metalness: 0.05, clearcoat: 0.4, clearcoatRoughness: 0.4 }),
  burgundy: new THREE.MeshPhysicalMaterial({
    color: '#a01230', roughness: 0.75, metalness: 0, side: THREE.DoubleSide,
    sheen: 1, sheenColor: new THREE.Color('#ff7a8a'), sheenRoughness: 0.45,
    emissive: '#2a0410', emissiveIntensity: 0.25,
  }),
  burgundyDark: new THREE.MeshPhysicalMaterial({
    color: '#4a0c1c', roughness: 0.85, side: THREE.DoubleSide,
    sheen: 1, sheenColor: new THREE.Color('#c0485a'), sheenRoughness: 0.5,
    emissive: '#1a0309', emissiveIntensity: 0.35,
  }),
  beads: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, emissive: '#3a1a02', emissiveIntensity: 0.35 }),
  rose: new THREE.MeshPhysicalMaterial({
    color: '#ffffff', vertexColors: true, roughness: 0.55, side: THREE.DoubleSide,
    sheen: 1, sheenColor: new THREE.Color('#ff9aa8'), sheenRoughness: 0.4,
    emissive: '#200608', emissiveIntensity: 0.3,
  }),
  skin: new THREE.MeshStandardMaterial({ color: '#b97f5a', roughness: 0.65 }),
  skinBride: new THREE.MeshStandardMaterial({ color: '#c58d68', roughness: 0.65 }),
  hair: new THREE.MeshStandardMaterial({ color: '#150a08', roughness: 0.45 }),
}

/** Self-lit glow colours (animated by the scenes). */
export const glowBasic = (color = '#ffcf7a') => new THREE.MeshBasicMaterial({ color, toneMapped: false })
