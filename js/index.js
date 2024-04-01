// https://www.zhangxinxu.com/study/202310/js-audio-concat-merge-demo.php

const wrap = document.querySelector("#result");
const concatWrap = document.querySelector("#concat");
const mergeWrap = document.querySelector("#merge");
const sliceWrap = document.querySelector("#slice");
const insertWrap = document.querySelector("#insert");

/**
 * 拼接
 */
async function concat() {
  concatWrap.innerHTML = `<span class="loading">处理中，请勿重复点击...</span>`;
  const audioSrc = ["../assets/1.wav", "../assets/2.wav"];
  const blob = await audioUtils.concat(audioSrc);
  const src = URL.createObjectURL(blob);
  concatWrap.innerHTML = `<audio src="${src}" controls></audio>`;
}

/**
 * 合成
 */
async function merge() {
  mergeWrap.innerHTML = `<span class="loading">处理中，请勿重复点击...</span>`;
  const audioSrc = ["../assets/bg1.wav", "../assets/bg2.wav"];
  const blob = await audioUtils.merge(audioSrc);
  const src = URL.createObjectURL(blob);
  mergeWrap.innerHTML = `<audio src="${src}" controls></audio>`;
}

/**
 * 截取
 */
async function slice() {
  sliceWrap.innerHTML = `<span class="loading">处理中，请勿重复点击...</span>`;
  const blob = await audioUtils.slice("../assets/viper.mp3", 0, 3);
  const src = URL.createObjectURL(blob);
  sliceWrap.innerHTML = `<audio src="${src}" controls></audio>`;
}

/**
 * 插入音效
 */
async function insert() {
  insertWrap.innerHTML = `<span class="loading">处理中，请勿重复点击...</span>`;
  // -- 异常处理
  const bgmSrc = "../assets/bg2.wav";
  const blob = await audioUtils.insertEffects(bgmSrc, [
    { src: "../assets/Hit.ogg", duration: 2, startTime: 4 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 6.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 7 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 7.25 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 7.5 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 7.75 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 8 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 8.5 },
    { src: "../assets/Hit.ogg", duration: 1.25, startTime: 8.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 10.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 11 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 11.25 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 11.5 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 11.75 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 12 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 12.5 },
    { src: "../assets/Hit.ogg", duration: 1.25, startTime: 12.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 14.75 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 15 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 15.5 },
    { src: "../assets/Hit.ogg", duration: 2, startTime: 16 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 18.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 19 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 19.25 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 19.5 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 19.75 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 20 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 20.5 },
    { src: "../assets/Hit.ogg", duration: 1.25, startTime: 20.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 22.75 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 23 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 23.5 },
    { src: "../assets/Hit.ogg", duration: 1.75, startTime: 24 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 25.75 },
    { src: "../assets/Hit.ogg", duration: 0.75, startTime: 26 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 26.75 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 27 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 27.5 },
    { src: "../assets/Hit.ogg", duration: 2, startTime: 28 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 30.75 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 31 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 31.25 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 31.5 },
    { src: "../assets/Hit.ogg", duration: 0.25, startTime: 31.75 },
    { src: "../assets/Hit.ogg", duration: 2, startTime: 32 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 35 },
    { src: "../assets/Hit.ogg", duration: 0.5, startTime: 35.5 },
    { src: "../assets/Hit.ogg", duration: 4, startTime: 36 },
  ]);

  const src = URL.createObjectURL(blob);
  insertWrap.innerHTML = `<audio src="${src}" controls></audio>`;
}

/**
 * 音符音效
 */
async function mergeNotes() {
  wrap.innerHTML = `<span class="loading">处理中，请勿重复点击...</span>`;
  const blob = await audioUtils.mergeNotes([
    { midi: 60, duration: 0.05 },
    { midi: 62, duration: 0.05 },
    { midi: 63, duration: 0.05 },
    { midi: 61, duration: 0.25 },
    { midi: 62, duration: 0.25 },
    { midi: 65, duration: 0.25 },
    { midi: 67, duration: 0.25 },
    { midi: 62, duration: 0.25 },
    { midi: 66, duration: 0.25 },
    { midi: 61, duration: 0.25 },
    { midi: 65, duration: 0.25 },
  ]);
  const src = URL.createObjectURL(blob);
  wrap.innerHTML = `<audio src="${src}" controls></audio>`;
}

async function ontap() {
  // 获取音频上下文
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let buffer = await audioUtils._getAudioBuffer("..../assets/Hit.ogg");
  const new_buffer = audioCtx.createBuffer(2, buffer.length, buffer.sampleRate);

  new_buffer.copyToChannel(buffer.getChannelData(0), 0);
  new_buffer.copyToChannel(buffer.getChannelData(1), 1);

  const volume = 0.9543;
  for (let channel = 0; channel < new_buffer.numberOfChannels; channel++) {
    const channelData = new_buffer.getChannelData(channel);
    for (let sample = 0; sample < channelData.length; sample++) {
      channelData[sample] = channelData[sample] * volume;
    }
  }

  const src = URL.createObjectURL(audioUtils._bufferToWave(new_buffer, new_buffer.length));
  wrap.innerHTML = `<audio src="${src}" controls></audio>`;
}

function applyCompressor(buffer, threshold, knee, ratio, attack, release, volume) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
