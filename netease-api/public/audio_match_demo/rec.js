/* AudioWorkletProcesser must be initialized as modules (i.e. seperate files)
 *  Ref : https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
 */
class TimedRecorder extends AudioWorkletProcessor {
  constructor(options) {
    super()
    this.max_length = 0
    this.recbuffer = new Float32Array()
    this.recording = false
    this.buf_index = 0
    this.port.onmessage = (event) => {
      switch (event.data.message) {
        case 'start':
          this.max_length = event.data.duration * 8000
          this.recbuffer = new Float32Array(this.max_length)
          this.buf_index = 0
          this.recording = true
          this.port.postMessage({ message: '[rec.js] Recording started' })
          break
      }
    }
  }
  process(inputs) {
    // Only take care of channel 0 (Left)
    if (this.recording) {
      let channelL = inputs[0][0]
      this.port.postMessage({
        message: 'bufferhealth',
        health: this.buf_index / this.max_length,
        recording: this.recbuffer,
      })
      if (this.buf_index + channelL.length > this.max_length) {
        this.port.postMessage({ message: '[rec.js] Recording finished' })
        this.recording = false
        this.buf_index = 0
        this.port.postMessage({
          message: 'finished',
          recording: this.recbuffer,
        })
      } else {
        this.recbuffer.set(channelL, this.buf_index)
        this.buf_index += channelL.length
      }
    }
    return true
  }
}

registerProcessor('timed-recorder', TimedRecorder)
