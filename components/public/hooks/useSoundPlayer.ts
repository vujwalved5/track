'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export type SoundTrackId = 'rain' | 'piano' | 'focus'

export interface SoundPlayerControls {
  activeTrack: SoundTrackId
  isPlaying: boolean
  volume: number
  togglePlay: () => void
  selectTrack: (track: SoundTrackId) => void
  setVolume: (volume: number) => void
}

/**
 * Procedurally synthesize Brownian (red) noise for DEEP FOCUS in-memory.
 * Uses a leaky integrator on white noise with a circular boundary crossfade
 * over 2000 samples to produce a sample-perfect, seamless 6-second loop.
 */
function generateBrownianNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate || 44100
  const durationSeconds = 6
  const totalSamples = Math.floor(sampleRate * durationSeconds)
  const crossfadeSamples = 2000
  const rawLength = totalSamples + crossfadeSamples
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const channelData = buffer.getChannelData(ch)
    const raw = new Float32Array(rawLength)
    let last = 0.0

    for (let i = 0; i < rawLength; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      raw[i] = last * 3.5
    }

    for (let i = 0; i < totalSamples; i++) {
      if (i < crossfadeSamples) {
        const t = i / crossfadeSamples
        channelData[i] = (1 - t) * raw[totalSamples + i] + t * raw[i]
      } else {
        channelData[i] = raw[i]
      }
    }
  }

  return buffer
}

/**
 * Procedurally synthesize soft pink noise for RAIN fallback.
 * Uses Paul Kellet's filter method with boundary crossfade for seamless looping.
 */
function generatePinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate || 44100
  const durationSeconds = 6
  const totalSamples = Math.floor(sampleRate * durationSeconds)
  const crossfadeSamples = 2000
  const rawLength = totalSamples + crossfadeSamples
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const channelData = buffer.getChannelData(ch)
    const raw = new Float32Array(rawLength)
    let b0 = 0
    let b1 = 0
    let b2 = 0
    let b3 = 0
    let b4 = 0
    let b5 = 0
    let b6 = 0

    for (let i = 0; i < rawLength; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
      raw[i] = pink
    }

    for (let i = 0; i < totalSamples; i++) {
      if (i < crossfadeSamples) {
        const t = i / crossfadeSamples
        channelData[i] = (1 - t) * raw[totalSamples + i] + t * raw[i]
      } else {
        channelData[i] = raw[i]
      }
    }
  }

  return buffer
}

export function useSoundPlayer(): SoundPlayerControls {
  const [activeTrack, setActiveTrack] = useState<SoundTrackId>('rain')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolumeState] = useState<number>(0.75)

  const volumeRef = useRef<number>(0.75)
  const activeTrackRef = useRef<SoundTrackId>('rain')
  const isPlayingRef = useRef<boolean>(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const currentFadeGainRef = useRef<GainNode | null>(null)
  const bufferCacheRef = useRef<Map<SoundTrackId, AudioBuffer>>(new Map())
  const sessionIdRef = useRef<number>(0)

  // Keep refs in sync with state
  volumeRef.current = volume
  activeTrackRef.current = activeTrack
  isPlayingRef.current = isPlaying

  const getOrCreateAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null

    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null

      const ctx = new AudioCtx()
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(volumeRef.current, ctx.currentTime)
      masterGain.connect(ctx.destination)

      audioContextRef.current = ctx
      masterGainRef.current = masterGain
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {})
    }

    return audioContextRef.current
  }, [])

  const loadTrackBuffer = useCallback(
    async (track: SoundTrackId, ctx: AudioContext): Promise<AudioBuffer | null> => {
      const cached = bufferCacheRef.current.get(track)
      if (cached) return cached

      if (track === 'focus') {
        const buf = generateBrownianNoiseBuffer(ctx)
        bufferCacheRef.current.set(track, buf)
        return buf
      }

      if (track === 'rain') {
        try {
          const res = await fetch('/audio/rain.ogg')
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const ab = await res.arrayBuffer()
          const audioBuffer = await ctx.decodeAudioData(ab)
          bufferCacheRef.current.set(track, audioBuffer)
          return audioBuffer
        } catch {
          // Graceful fallback to synthesized soft pink noise without UI errors
          const fallbackBuf = generatePinkNoiseBuffer(ctx)
          bufferCacheRef.current.set(track, fallbackBuf)
          return fallbackBuf
        }
      }

      if (track === 'piano') {
        try {
          const res = await fetch('/audio/piano.ogg')
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const ab = await res.arrayBuffer()
          const audioBuffer = await ctx.decodeAudioData(ab)
          bufferCacheRef.current.set(track, audioBuffer)
          return audioBuffer
        } catch {
          // Stay silent / inactive on failure without UI errors
          return null
        }
      }

      return null
    },
    []
  )

  const stopActiveNodes = useCallback((smooth = true) => {
    const oldSource = currentSourceRef.current
    const oldFade = currentFadeGainRef.current
    const ctx = audioContextRef.current

    currentSourceRef.current = null
    currentFadeGainRef.current = null

    if (!oldFade || !ctx) {
      if (oldSource) {
        try {
          oldSource.stop()
          oldSource.disconnect()
        } catch {}
      }
      return
    }

    const now = ctx.currentTime
    if (smooth) {
      oldFade.gain.cancelScheduledValues(now)
      oldFade.gain.setValueAtTime(oldFade.gain.value, now)
      oldFade.gain.linearRampToValueAtTime(0, now + 0.12)
      setTimeout(() => {
        try {
          oldSource?.stop()
          oldSource?.disconnect()
          oldFade.disconnect()
        } catch {}
      }, 130)
    } else {
      try {
        oldSource?.stop()
        oldSource?.disconnect()
        oldFade.disconnect()
      } catch {}
    }
  }, [])

  const startTrack = useCallback(
    async (track: SoundTrackId) => {
      const sessionId = ++sessionIdRef.current
      const ctx = getOrCreateAudioContext()
      if (!ctx || !masterGainRef.current) return

      // Smoothly fade out existing track if one was active
      stopActiveNodes(true)

      const buffer = await loadTrackBuffer(track, ctx)
      // Check if session changed while loading or if playback was stopped
      if (sessionIdRef.current !== sessionId || !isPlayingRef.current) {
        return
      }

      if (!buffer) {
        // Track unavailable (e.g. failed piano download); stay silent
        return
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const fadeGain = ctx.createGain()
      const startTime = ctx.currentTime
      fadeGain.gain.setValueAtTime(0, startTime)
      fadeGain.gain.linearRampToValueAtTime(1, startTime + 0.12)

      source.connect(fadeGain)
      fadeGain.connect(masterGainRef.current)

      source.start(startTime)

      currentSourceRef.current = source
      currentFadeGainRef.current = fadeGain
    },
    [getOrCreateAudioContext, loadTrackBuffer, stopActiveNodes]
  )

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      setIsPlaying(false)
      isPlayingRef.current = false
      sessionIdRef.current++
      stopActiveNodes(true)
    } else {
      setIsPlaying(true)
      isPlayingRef.current = true
      startTrack(activeTrackRef.current)
    }
  }, [startTrack, stopActiveNodes])

  const selectTrack = useCallback(
    (track: SoundTrackId) => {
      setActiveTrack(track)
      activeTrackRef.current = track

      if (isPlayingRef.current) {
        startTrack(track)
      }
    },
    [startTrack]
  )

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clamped)
    volumeRef.current = clamped

    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      masterGainRef.current.gain.cancelScheduledValues(now)
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now)
      masterGainRef.current.gain.linearRampToValueAtTime(clamped, now + 0.05)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionIdRef.current++
      stopActiveNodes(false)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [stopActiveNodes])

  return {
    activeTrack,
    isPlaying,
    volume,
    togglePlay,
    selectTrack,
    setVolume,
  }
}
