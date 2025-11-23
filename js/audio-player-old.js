const playButton = document.querySelector("#playButton")
const playButtonIcon = document.querySelector("#playButtonIcon")
const waveform = document.querySelector("#waveform")
const volumeIcon = document.querySelector("#volumeIcon")
const volumeSlider = document.querySelector("#volumeSlider")
const currentTime = document.querySelector("#currentTime")
const totalDuration = document.querySelector("#totalDuration")
const title = document.querySelector("#trackTitle")

const playButtonIconElem = document.getElementById("#playButtonIcon")
const cachedPlayButtonBG = playButton.style.background

// --------------------------------------------------------- //
/**
 * Initialize Wavesurfer
 * @returns a new Wavesurfer instance
 */
const initializeWavesurfer = () => {
  return WaveSurfer.create({
    container: "#waveform",
    responsive: true,
    height: 80,
    waveColor: "#864e13",
    progressColor: "#FF8F00",
  })
}

const play = () => {
  wavesurfer.play()
  playButtonIcon.src = "assets/icons/pause.png"
}

const togglePlay = () => {
  const isPlaying = wavesurfer.isPlaying()
  wavesurfer.playPause()
  if (isPlaying) {
    playButtonIcon.src = "assets/icons/continue.png"
  } else {
    playButtonIcon.src = "assets/icons/pause.png"
  }
}
/**
 * Handles changing the volume slider input
 * @param {event} e
 */
const handleVolumeChange = e => {
  // Set volume as input value divided by 100
  // NB: Wavesurfer only excepts volume value between 0 - 1
  const volume = e.target.value / 100
  wavesurfer.setVolume(volume)
  // Save the value to local storage so it persists between page reloads
  localStorage.setItem("audio-player-volume", volume)
}
/**
 * Retrieves the volume value from local storage and sets the volume slider
 */
const setVolumeFromLocalStorage = () => {
  // Retrieves the volume from local storage, or falls back to default value of 50
  const volume = localStorage.getItem("audio-player-volume") * 100 || 50
  volumeSlider.value = volume
}
/**
 * Formats time as HH:MM:SS
 * @param {number} seconds
 * @returns time as HH:MM:SS
 */
const formatTimecode = seconds => {
  return new Date(seconds * 1000).toISOString().substr(11, 8)
}
/**
 * Toggles mute/unmute of the Wavesurfer volume
 * Also changes the volume icon and disables the volume slider
 */
const toggleMute = () => {
  wavesurfer.toggleMute()
  const isMuted = wavesurfer.getMute()
  if (isMuted) {
    volumeIcon.src = "assets/icons/mute.png"
    volumeSlider.disabled = true
  } else {
    volumeSlider.disabled = false
    volumeIcon.src = "assets/icons/volume.png"
  }
}

const wavesurfer = initializeWavesurfer()

let pendingMusicSetData = {}

window.addEventListener("load", setVolumeFromLocalStorage)
playButton.addEventListener("click", togglePlay)
volumeIcon.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", handleVolumeChange)

// --------------------------------------------------------- //
// Wavesurfer event listeners
wavesurfer.on("ready", () => {
  // Set wavesurfer volume
  wavesurfer.setVolume(volumeSlider.value / 100)
  // Set audio track total duration
  const duration = wavesurfer.getDuration()
  totalDuration.innerHTML = formatTimecode(duration)
  play()

  title.innerHTML = pendingMusicSetData.title
  if (pendingMusicSetData.img) {
    playButton.style.background = 
    'linear-gradient(rgba(255,255,255,0),rgba(0,0,0,.3)), url("'+pendingMusicSetData.img+'")'
  }
  else
    playButton.style.background = "transparent"
})

// Sets the timecode current timestamp as audio plays
wavesurfer.on("audioprocess", () => {
  const time = wavesurfer.getCurrentTime()
  currentTime.innerHTML = formatTimecode(time)
})
// Resets the play button icon after audio ends
wavesurfer.on("finish", () => {
  playButtonIcon.src = "assets/icons/continue.png"
})

document.addEventListener("setMusic", e => { 
  const ctx = e.detail
  if (ctx) {
    wavesurfer.stop()
    wavesurfer.load(ctx.url)
    pendingMusicSetData.img = ctx.img
    pendingMusicSetData.title = ctx.title
  }
})
