class AudioUtils {
  audioCtx = null;

  /**
   * 获取音频上下文
   * @returns
   */
  getAudioCtx() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  /**
   * 单声道转立体声
   * @param {*} audioBuffer
   * @returns
   */
  monoToStereo(audioBuffer) {
    const audioCtx = this.getAudioCtx();
    const stereoBuffer = audioCtx.createBuffer(2, audioBuffer.length, audioBuffer.sampleRate);

    // 设置音量增益系数，这里设置为0.7071即减少3dB
    const volume = 0.7071;

    // 从单声道复制数据到立体声左右声道
    stereoBuffer.copyToChannel(audioBuffer.getChannelData(0), 0); // 复制单声道数据到左声道
    stereoBuffer.copyToChannel(audioBuffer.getChannelData(0), 1); // 复制单声道数据到右声道

    // 对立体声数据应用音量
    stereoBuffer.copyFromChannel(
      stereoBuffer.getChannelData(0).map((sample) => sample * volume),
      0
    ); // 左声道应用音量
    stereoBuffer.copyFromChannel(
      stereoBuffer.getChannelData(1).map((sample) => sample * volume),
      1
    ); // 右声道应用音量

    return stereoBuffer;
  }

  /**
   * 增益
   * @param {*} buffer
   * @param {*} volume
   */
  applyGain(buffer, volume = 0.8) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let sample = 0; sample < channelData.length; sample++) {
        channelData[sample] = channelData[sample] * volume;
      }
    }
  }
  /**
   * 将动态压缩效果应用于提供的 AudioBuffer。
   * @param {AudioBuffer} buffer - 要应用压缩效果的输入 AudioBuffer
   * @param {number} threshold - 压缩开始的阈值，以 dB 为单位，默认值 -3
   * @param {number} knee - 过渡区的范围，在此范围内压缩会平滑增加，默认值 40
   * @param {number} ratio - 在阈值以上应用于音频的压缩量，默认值 20
   * @param {number} attack - 压缩器达到最大压缩级别所需的时间，以秒为单位，默认值 0
   * @param {number} release - 压缩器释放增益减少的时间，以秒为单位，默认值 0.2
   * @param {number} volume - 应用于压缩后音频的音量增益，默认值 0.9543
   * @returns {AudioBuffer} - 应用了压缩效果的输出 AudioBuffer
   */
  applyCompressor(buffer, threshold = -3, knee = 40, ratio = 20, attack = 0, release = 0.2, volume = 0.9543) {
    const audioCtx = this.getAudioCtx();

    var numberOfChannels = buffer.numberOfChannels;
    var sampleRate = buffer.sampleRate;
    var newBuffer = audioCtx.createBuffer(numberOfChannels, buffer.length, sampleRate);

    for (var channel = 0; channel < numberOfChannels; channel++) {
      var inputData = buffer.getChannelData(channel);
      var outputData = newBuffer.getChannelData(channel);

      // 初始化动态压缩器参数
      var envelope = 0;
      var envelopeMax = 0;

      for (var i = 0; i < buffer.length; i++) {
        var input = inputData[i];

        // 计算当前样本的振幅
        envelope = Math.max(Math.abs(input), envelope * attack);

        // 更新最大振幅值
        envelopeMax = Math.max(envelopeMax, envelope);

        // 根据动态压缩器参数调整振幅
        var compression = 1;
        if (envelopeMax > threshold) {
          if (envelope < threshold + knee) {
            compression = 1 + (envelope - threshold) / knee;
          } else {
            compression = 1 + ((envelope - threshold) * (1 / ratio - 1)) / knee;
          }
        }

        // 应用压缩
        var compressedInput = input * compression;

        // 应用音量
        outputData[i] = compressedInput * volume;

        // 衰减振幅
        envelope *= release;
      }
    }

    return newBuffer;
  }

  /**
   * 将 AudioBuffer 转换为 WAV 格式的 blob。
   * @param {AudioBuffer} abuffer - 要转换的 AudioBuffer 对象。
   * @param {number} len - 音频数据的长度（以采样点数为单位）。
   * @returns {Blob} - 包含 WAV 格式音频数据的 Blob 对象。
   */
  bufferToWave(abuffer, len) {
    var numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0;

    // 写入 WAVE 头部
    // "RIFF"
    setUint32(0x46464952);
    // 文件长度 - 8
    setUint32(length - 8);
    // "WAVE"
    setUint32(0x45564157);
    // "fmt " chunk
    setUint32(0x20746d66);
    // 长度 = 16
    setUint32(16);
    // PCM (无压缩)
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    // 平均字节/秒
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    // 块对齐
    setUint16(numOfChan * 2);
    // 16位（在此示例中硬编码）
    setUint16(16);
    // "data" - chunk
    setUint32(0x61746164);
    // chunk 长度
    setUint32(length - pos - 4);

    // 获取所有声道数据
    for (i = 0; i < numOfChan; i++) channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      // 交错通道数据
      for (i = 0; i < numOfChan; i++) {
        // 截断并缩放到16位有符号整数
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        // 写入16位样本
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++; // 下一个源样本
    }

    // 创建 Blob
    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  /**
   * 获取 audioBuffer
   * @param {*} src
   * @returns
   */
  async getAudioBuffer(src) {
    const audioCtx = this.getAudioCtx();
    const arrayBuffer = await fetch(src).then((response) => response.arrayBuffer());
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // 检查音频是否为单声道
    if (audioBuffer.numberOfChannels === 1) {
      // 如果是单声道，则转换为立体声
      return this.monoToStereo(audioBuffer);
    } else {
      // 如果不是单声道，则直接返回原始的 AudioBuffer
      return audioBuffer;
    }
  }

  /**
   * 将多个音频文件连接成一个音频文件。
   * @param {string[]} urls - 包含音频文件 URL 的数组。
   * @returns {Blob} - 表示连接后的音频文件的 Blob 对象。
   */
  async concat(urls) {
    // -- 获取音频上下文
    const audioCtx = this.getAudioCtx();
    // -- 获取所有音频文件的 AudioBuffer
    const audioBuffers = await Promise.all(urls.map((src) => this.getAudioBuffer(src)));
    // -- 计算所需的参数
    const maxChannelNumber = Math.max(...audioBuffers.map((audioBuffer) => audioBuffer.numberOfChannels));
    const maxSampleRate = Math.max(...audioBuffers.map((audioBuffer) => audioBuffer.sampleRate));
    const totalLength = audioBuffers.map((buffer) => buffer.length).reduce((lenA, lenB) => lenA + lenB, 0);

    // -- 创建新的 AudioBuffer
    const newAudioBuffer = audioCtx.createBuffer(maxChannelNumber, totalLength, maxSampleRate);
    // -- 将所有 AudioBuffer 的数据拷贝到新的 AudioBuffer 中
    let offset = 0;
    audioBuffers.forEach((audioBuffer) => {
      // 拷贝左声道数据到新的 AudioBuffer 的 0 号声道
      newAudioBuffer.copyToChannel(audioBuffer.getChannelData(0), 0, offset);
      // 拷贝右声道数据到新的 AudioBuffer 的 1 号声道
      newAudioBuffer.copyToChannel(audioBuffer.getChannelData(1), 1, offset);
      offset += audioBuffer.length;
    });
    // -- 动态压缩
    this.applyGain(newAudioBuffer);
    // -- 返回 blob
    return this.bufferToWave(newAudioBuffer, newAudioBuffer.length);
  }

  /**
   * 合成音频
   * @param {string[]} urls
   * @returns
   */
  async merge(urls) {
    // -- 获取音频上下文
    const audioCtx = this.getAudioCtx();
    // -- 获取 audioBuffers
    const audioBuffers = await Promise.all(urls.map((src) => this.getAudioBuffer(src)));
    // -- 计算所需的参数
    const maxDuration = Math.max(...audioBuffers.map((audioBuffer) => audioBuffer.duration));
    const maxChannelNumber = Math.max(...audioBuffers.map((audioBuffer) => audioBuffer.numberOfChannels));
    const maxSampleRate = Math.max(...audioBuffers.map((audioBuffer) => audioBuffer.sampleRate));
    // -- 创建一个新的 AudioBuffer
    const newAudioBuffer = audioCtx.createBuffer(maxChannelNumber, audioBuffers[0].sampleRate * maxDuration, maxSampleRate);
    // -- 将所有的 AudioBuffer 的数据合并到新的 AudioBuffer 中
    audioBuffers.forEach((audioBuffer) => {
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const outputData = newAudioBuffer.getChannelData(channel);
        const bufferData = audioBuffer.getChannelData(channel);
        for (let i = audioBuffer.getChannelData(channel).length - 1; i >= 0; i--) {
          outputData[i] += bufferData[i];
        }
        newAudioBuffer.getChannelData(channel).set(outputData);
      }
    });

    // -- 动态压缩
    this.applyGain(newAudioBuffer);
    // -- 返回 blob
    return this.bufferToWave(newAudioBuffer, newAudioBuffer.length);
  }

  /**
   * 截取音频
   * @param {string} url 音频地址
   * @param {number} offset 截取位置
   * @param {number} duration 截取长度，单位秒
   * @returns
   */
  async slice(url, offset, duration) {
    // -- 获取音频上下文
    const audioCtx = this.getAudioCtx();
    // -- 获取 audioBuffer
    const audioBuffer = await this.getAudioBuffer(url);
    // -- 根据音符持续时间截取音效的长度
    const length = Math.floor(audioBuffer.sampleRate * duration);
    // -- 创建一个新的 AudioBuffer
    const newAudioBuffer = audioCtx.createBuffer(audioBuffer.numberOfChannels, length, audioBuffer.sampleRate);
    // -- 截取音频
    newAudioBuffer.copyToChannel(audioBuffer.getChannelData(0).subarray(0, length), 0, offset);
    newAudioBuffer.copyToChannel(audioBuffer.getChannelData(1).subarray(0, length), 1, offset);

    // -- 动态压缩
    this.applyGain(newAudioBuffer);
    // -- 返回 blob
    return this.bufferToWave(newAudioBuffer, newAudioBuffer.length);
  }

  /**
   * 合并音符
   * @param {Array<{ duration: number, midi: number }>} notes - 包含音符信息的数组
   */
  async mergeNotes(notes) {
    // -- 获取音频上下文
    const audioCtx = this.getAudioCtx();
    // -- 声道数
    const channels = 2;
    // -- 持续时间
    const totalTime = notes.reduce((prev, { duration }) => prev + duration, 0);
    const length = Math.ceil(audioCtx.sampleRate * totalTime); // 将总时长转换为帧数，并向上取整
    const newAudioBuffer = audioCtx.createBuffer(channels, length, audioCtx.sampleRate);

    // -- 使用 for...of 循环确保等待异步操作完成
    let offset = 0;
    for (const { midi, duration: noteDuration } of notes) {
      const src = `../assets/midis/${midi}.ogg`;
      const buffer = await this.getAudioBuffer(src);
      // 根据音符持续时间截取音效的长度
      const copyLength = Math.floor(noteDuration * audioCtx.sampleRate);
      // 复制音频数据到新缓冲区中的正确位置
      newAudioBuffer.copyToChannel(buffer.getChannelData(0).subarray(0, copyLength), 0, offset);
      newAudioBuffer.copyToChannel(buffer.getChannelData(1).subarray(0, copyLength), 1, offset);
      offset += copyLength;
    }

    // -- 动态压缩
    this.applyGain(newAudioBuffer);
    // -- 返回 blob
    return this.bufferToWave(newAudioBuffer, newAudioBuffer.length);
  }

  /**
   * 插入音效
   * @param {*} bgmSrc
   * @param {*} effects
   */
  async insertEffects(bgmSrc, effects) {
    // -- 获取音频上下文
    const audioCtx = this.getAudioCtx();

    // -- 加载背景音乐
    const bgmBuffer = await this.getAudioBuffer(bgmSrc);
    // -- 创建新的音频缓冲区用于存储合并后的音频数据
    const newBuffer = audioCtx.createBuffer(bgmBuffer.numberOfChannels, bgmBuffer.length, bgmBuffer.sampleRate);
    // -- 复制背景音乐数据到新的缓冲区
    newBuffer.copyToChannel(bgmBuffer.getChannelData(0), 0);
    newBuffer.copyToChannel(bgmBuffer.getChannelData(1), 1);

    // -- 循环遍历每个音效
    for (const effect of effects) {
      // -- 加载音效
      const effectBuffer = await this.getAudioBuffer(effect.src);

      // -- 截取音效的前 duration 秒
      const slicedEffectBuffer = audioCtx.createBuffer(effectBuffer.numberOfChannels, effectBuffer.sampleRate * effect.duration, effectBuffer.sampleRate);
      slicedEffectBuffer.copyToChannel(effectBuffer.getChannelData(0).slice(0, effectBuffer.sampleRate * effect.duration), 0);
      slicedEffectBuffer.copyToChannel(effectBuffer.getChannelData(1).slice(0, effectBuffer.sampleRate * effect.duration), 1);
      // -- 将截取的音效合并到音频的指定位置
      for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
        const outputData = newBuffer.getChannelData(channel);
        const soundEffectData = slicedEffectBuffer.getChannelData(channel);
        const offset = bgmBuffer.sampleRate * effect.startTime;
        for (let i = 0; i < soundEffectData.length; i++) {
          outputData[i + Math.round(offset)] += soundEffectData[i];
        }
      }
    }

    // -- 动态压缩
    this.applyGain(newBuffer);
    // -- 返回 blob
    return this.bufferToWave(newBuffer, newBuffer.length);
  }
}

const audioUtils = new AudioUtils();
