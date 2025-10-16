<template>
  <el-dialog
    v-model="dialogVisible"
    :style="{ width: slideData.bigWidth + 70 + 'px' }"
    :close-on-click-modal="false"
    @close="closeSlider"
    @opened="onDialogOpened"
    align-center
    destroy-on-close
    :close-on-press-escape="false"
  >
    <div class="sliderBox">
      <div class="sliderBox_content">
        <!-- 大图显示 -->
        <img v-show="slideData.big" :src="'data:image/png;base64,' + slideData.big" class="bigImg" alt="验证码主图" />
        <span class="sliderBox_refresh" @click="refreshSlider">
          <el-icon class="el-input__icon"><refresh /></el-icon>
        </span>
        <!-- 小图显示 -->
        <img
          v-show="slideData.small"
          :src="'data:image/png;base64,' + slideData.small"
          class="smallImg"
          ref="imgK"
          alt="验证码拼图"
        />
        <!-- 验证结果提示 -->
        <div v-if="overlayVisible" class="overlay" :class="{ success: slideData.isSuccess, failure: !slideData.isSuccess }">
          <span>{{ overlayMessage }}</span>
        </div>
      </div>
      <div class="btnBox" ref="wrap">
        <div class="sliderBox_text">
          <span v-if="!isDragging && !slideData.isSuccess">向右滑动，完成验证</span>
          <span v-if="isDragging">正在滑动，请松开完成验证</span>
          <span v-if="slideData.isSuccess">验证通过</span>
        </div>
        <!-- 滑块轨迹显示 -->
        <div class="sliderBox_track" :style="{ width: trackWidth + 'px' }" />
        <!-- 滑块按钮 -->
        <div class="sliderBox_btn" ref="slider" @mousedown="onMouseDown" @touchstart="onTouchStart" tabindex="0">&gt;</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, computed } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { getImageCodeApi, verifyImageCodeApi } from '@/api/modules/system/captcha';
import { aesEncrypt } from '@/utils';

defineOptions({ name: 'SliderCaptcha' });

const dialogVisible = ref(false);
const slideData = reactive({
  big: '',
  small: '',
  requestId: '',
  posY: 0,
  isSuccess: false,
  bigWidth: 320,
  secretKey: ''
});
const slider = ref<HTMLDivElement | null>(null);
const wrap = ref<HTMLDivElement | null>(null);
const imgK = ref<HTMLImageElement | null>(null);
const trackWidth = ref(0);
const overlayMessage = ref('');
const overlayVisible = ref(false);
const isVerifying = ref(false);
const emit = defineEmits(['success', 'close']);

let isDragging = false;
let startX = 0;
let startLeft = 0;

const acceptParams = () => {
  fetchSlideData();
};

const fetchSlideData = async () => {
  try {
    const { data } = await getImageCodeApi();
    Object.assign(slideData, {
      big: data.bigImageBase64,
      small: data.smallImageBase64,
      posY: data.posY,
      requestId: data.requestId,
      bigWidth: data.bigWidth,
      isSuccess: false,
      secretKey: data.secretKey
    });
    overlayVisible.value = false;
    overlayMessage.value = '';
    trackWidth.value = 0;
    dialogVisible.value = true;
    setTimeout(resetSliderPosition, 50);
  } catch (error) {
    console.error('验证失败:', error);
    overlayVisible.value = true;
    overlayMessage.value = '获取验证码失败，请刷新重试';
  }
};

const refreshSlider = async () => {
  slideData.isSuccess = false;
  overlayVisible.value = false;
  overlayMessage.value = '';
  await fetchSlideData();
};

const closeSlider = () => {
  dialogVisible.value = false;
  resetSlider();
  emit('close');
};

const resetSlider = () => {
  slideData.big = '';
  slideData.small = '';
  slideData.requestId = '';
  slideData.posY = 0;
  slideData.isSuccess = false;
  slideData.secretKey = '';
  slideData.bigWidth = 320;
  resetSliderPosition();
};

const resetSliderPosition = () => {
  if (slider.value && imgK.value) {
    slider.value.style.left = '0px';
    imgK.value.style.left = '0px';
    ensureImageYPosition();
    trackWidth.value = 0;
  }
};

const onMouseDown = (e: MouseEvent) => {
  if (!slider.value || !wrap.value || isVerifying.value || slideData.isSuccess) return;
  e.preventDefault();
  startDrag(e.clientX);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const onTouchStart = (e: TouchEvent) => {
  if (!slider.value || !wrap.value || isVerifying.value || slideData.isSuccess) return;
  e.preventDefault();
  if (e.touches.length === 1) {
    startDrag(e.touches[0].clientX);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
  }
};

let startTime = 0; // 用于记录滑动开始时间
const startDrag = (clientX: number) => {
  isDragging = true;
  startX = clientX;
  startLeft = parseInt(slider.value!.style.left || '0');
  startTime = Date.now(); // 在滑动开始时记录时间
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  moveSlider(e.clientX);
};
const onTouchMove = (e: TouchEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  if (e.touches.length === 1) moveSlider(e.touches[0].clientX);
};
const moveSlider = (clientX: number) => {
  if (!slider.value || !imgK.value || !wrap.value) return;
  const moveX = clientX - startX;
  const newLeft = Math.max(0, Math.min(startLeft + moveX, wrap.value.offsetWidth - slider.value.offsetWidth));
  slider.value.style.left = `${newLeft}px`;
  imgK.value.style.left = `${newLeft}px`;
  ensureImageYPosition();
  trackWidth.value = newLeft;
};

const onMouseUp = async () => {
  if (!isDragging) return;
  endDrag();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};
const onTouchEnd = async () => {
  if (!isDragging) return;
  endDrag();
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
};

const ensureImageYPosition = () => {
  if (imgK.value && slideData.posY !== undefined && slideData.posY !== null) {
    const yPos = parseInt(String(slideData.posY));
    imgK.value.style.top = `${yPos}px`;
    return yPos;
  }
  return 0;
};

const endDrag = async () => {
  if (!slider.value || !imgK.value) return;
  isDragging = false;
  const currentLeft = parseInt(slider.value.style.left || '0');
  ensureImageYPosition();
  if (currentLeft > 0) {
    try {
      isVerifying.value = true;
      const { iv, encryptedData } = await aesEncrypt(currentLeft + '', slideData.secretKey);
      await verifyImageCode({
        requestId: slideData.requestId,
        startTime,
        moveEncrypted: encryptedData,
        iv: iv
      });
    } catch (error) {
      console.error('endDrag err:', error);
      handleVerificationFailure();
    } finally {
      isVerifying.value = false;
    }
  }
};

const verifyImageCode = async (params: { requestId: string; startTime: number; moveEncrypted: string; iv: string }) => {
  try {
    const { code } = await verifyImageCodeApi(params);
    const duration = ((Date.now() - params.startTime) / 1000).toFixed(2);
    overlayVisible.value = true;
    if (code === '0000') {
      slideData.isSuccess = true;
      overlayMessage.value = `验证成功, 耗时${duration}s`;
      setTimeout(() => {
        emit('success');
        closeSlider();
      }, 1500);
    } else {
      handleVerificationFailure();
    }
  } catch {
    handleVerificationFailure();
  }
};

const handleVerificationFailure = () => {
  slideData.isSuccess = false;
  overlayMessage.value = '验证失败';
  overlayVisible.value = true;
  resetSliderPosition();
  setTimeout(refreshSlider, 1000);
};

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
});

const onDialogOpened = () => {
  setTimeout(() => {
    ensureImageYPosition();
  }, 100);
};

defineExpose({ acceptParams, dialogVisible, isSuccess: computed(() => slideData.isSuccess) });
</script>

<style scoped lang="scss">
@use 'index.scss';
</style>
