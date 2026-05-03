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
      <div class="sliderBox_content" :style="{ width: slideData.bigWidth + 'px', height: slideData.bigHeight + 'px' }">
        <!-- 大图：后端已烧录缺口 -->
        <img v-show="slideData.big" :src="'data:image/png;base64,' + slideData.big" class="bgImg" />
        <!-- 小图：跟随滑块水平移动，Y 轴由后端 posY 定位 -->
        <img v-show="slideData.small" :src="'data:image/png;base64,' + slideData.small" class="puzzleImg" ref="puzzleImgRef" />
        <span class="sliderBox_refresh" @click="refreshSlider">
          <el-icon><refresh /></el-icon>
        </span>
        <!-- 验证结果提示 -->
        <div v-if="overlayVisible" class="overlay" :class="{ success: slideData.isSuccess, failure: !slideData.isSuccess }">
          <span>{{ overlayMessage }}</span>
        </div>
      </div>
      <div class="btnBox" ref="wrap">
        <div class="sliderBox_text" :class="{ 'text-light': trackWidth > 64, 'text-dragging': isDragging }">
          <span v-if="!isDragging && !isVerifying && !slideData.isSuccess">拖动滑块完成验证</span>
          <span v-if="isDragging">释放后完成验证</span>
          <span v-if="isVerifying && !slideData.isSuccess">正在验证...</span>
          <span v-if="slideData.isSuccess">验证通过</span>
        </div>
        <div class="sliderBox_track" :style="{ width: trackWidth + 'px' }" />
        <div class="sliderBox_btn" ref="slider" @mousedown="onMouseDown" @touchstart="onTouchStart" tabindex="0">
          <el-icon><d-arrow-right /></el-icon>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, computed } from 'vue';
import { Refresh, DArrowRight } from '@element-plus/icons-vue';
import { getImageCodeApi, verifyImageCodeApi } from '@/api/modules/system/captcha';
import { aesEncrypt } from '@/utils';

defineOptions({ name: 'SliderCaptcha' });

const TRACK_PADDING = 4;
// 拼图初始左侧偏移（避免贴边，单位 px）
const PUZZLE_INIT_LEFT = 8;

const dialogVisible = ref(false);

const slideData = reactive({
  big: '',
  small: '',
  requestId: '',
  posY: 0,
  isSuccess: false,
  bigWidth: 360,
  bigHeight: 180,
  smallWidth: 50,
  smallHeight: 50,
  secretKey: ''
});

const wrap = ref<HTMLDivElement | null>(null);
const slider = ref<HTMLDivElement | null>(null);
const puzzleImgRef = ref<HTMLImageElement | null>(null);
const trackWidth = ref(0);
const overlayMessage = ref('');
const overlayVisible = ref(false);
const isVerifying = ref(false);
const isDragging = ref(false);
const emit = defineEmits(['success', 'close']);

let startX = 0;
let startLeft = 0;
let startTime = 0;
let currentSliderLeft = TRACK_PADDING;

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
      bigHeight: data.bigHeight,
      smallWidth: data.smallWidth,
      smallHeight: data.smallHeight,
      isSuccess: false,
      secretKey: data.secretKey
    });
    overlayVisible.value = false;
    overlayMessage.value = '';
    trackWidth.value = 0;
    currentSliderLeft = TRACK_PADDING;
    dialogVisible.value = true;
    setTimeout(initPositions, 80);
  } catch (error) {
    console.error('获取验证码失败:', error);
    overlayVisible.value = true;
    overlayMessage.value = '验证码加载失败，请重试';
  }
};

const refreshSlider = async () => {
  slideData.isSuccess = false;
  overlayVisible.value = false;
  overlayMessage.value = '';
  isDragging.value = false;
  trackWidth.value = 0;
  currentSliderLeft = TRACK_PADDING;
  try {
    const { data } = await getImageCodeApi();
    Object.assign(slideData, {
      big: data.bigImageBase64,
      small: data.smallImageBase64,
      posY: data.posY,
      requestId: data.requestId,
      bigWidth: data.bigWidth,
      bigHeight: data.bigHeight,
      smallWidth: data.smallWidth,
      smallHeight: data.smallHeight,
      isSuccess: false,
      secretKey: data.secretKey
    });
    setTimeout(initPositions, 80);
  } catch (error) {
    console.error('刷新验证码失败:', error);
    overlayVisible.value = true;
    overlayMessage.value = '验证码加载失败，请重试';
  }
};

/**
 * 初始化小图和滑块位置
 */
function initPositions() {
  if (slider.value) slider.value.style.left = `${TRACK_PADDING}px`;
  currentSliderLeft = TRACK_PADDING;
  trackWidth.value = 0;
  setPuzzlePosition(PUZZLE_INIT_LEFT);
}

/**
 * 设置小图水平位置（left）和垂直位置（top = posY）
 */
function setPuzzlePosition(x: number) {
  if (!puzzleImgRef.value) return;
  puzzleImgRef.value.style.left = `${x}px`;
  puzzleImgRef.value.style.top = `${slideData.posY}px`;
}

// ─── 拖动逻辑 ────────────────────────────────────────────────────────────────

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

const startDrag = (clientX: number) => {
  isDragging.value = true;
  startX = clientX;
  startLeft = currentSliderLeft;
  startTime = Date.now();
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  e.preventDefault();
  moveSlider(e.clientX);
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  e.preventDefault();
  if (e.touches.length === 1) moveSlider(e.touches[0].clientX);
};

const moveSlider = (clientX: number) => {
  if (!slider.value || !wrap.value) return;
  const moveX = clientX - startX;
  const maxLeft = wrap.value.offsetWidth - slider.value.offsetWidth - TRACK_PADDING;
  const newLeft = Math.max(TRACK_PADDING, Math.min(startLeft + moveX, maxLeft));
  const travel = newLeft - TRACK_PADDING;
  slider.value.style.left = `${newLeft}px`;
  currentSliderLeft = newLeft;
  setPuzzlePosition(PUZZLE_INIT_LEFT + travel);
  trackWidth.value = travel + slider.value.offsetWidth;
};

const onMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  endDrag();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};

const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  endDrag();
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
};

const endDrag = async () => {
  if (currentSliderLeft <= TRACK_PADDING) return;
  // submitX = 初始偏移 + travel，对齐后端 posX
  const submitX = PUZZLE_INIT_LEFT + (currentSliderLeft - TRACK_PADDING);
  try {
    isVerifying.value = true;
    const encX = await aesEncrypt(submitX + '', slideData.secretKey);
    await verifyImageCode({
      requestId: slideData.requestId,
      startTime,
      moveEncrypted: encX.encryptedData,
      iv: encX.iv
    });
  } catch (error) {
    console.error('endDrag err:', error);
    handleVerificationFailure();
  } finally {
    isVerifying.value = false;
  }
};

const verifyImageCode = async (params: { requestId: string; startTime: number; moveEncrypted: string; iv: string }) => {
  try {
    const { code } = await verifyImageCodeApi(params);
    const duration = ((Date.now() - params.startTime) / 1000).toFixed(2);
    if (code === '0000') {
      slideData.isSuccess = true;
      overlayVisible.value = true;
      overlayMessage.value = `验证通过，耗时 ${duration}s`;
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
  overlayVisible.value = true;
  overlayMessage.value = '验证未通过，请重试';
  setTimeout(() => {
    resetSliderPosition();
    setTimeout(refreshSlider, 300);
  }, 600);
};

const resetSliderPosition = () => {
  if (slider.value) slider.value.style.left = `${TRACK_PADDING}px`;
  currentSliderLeft = TRACK_PADDING;
  trackWidth.value = 0;
  setPuzzlePosition(PUZZLE_INIT_LEFT);
};

const closeSlider = () => {
  dialogVisible.value = false;
  emit('close');
};

const onDialogOpened = () => {
  setTimeout(initPositions, 100);
};

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
});

defineExpose({ acceptParams, dialogVisible, isSuccess: computed(() => slideData.isSuccess) });
</script>

<style scoped lang="scss">
@use 'index.scss';
</style>
