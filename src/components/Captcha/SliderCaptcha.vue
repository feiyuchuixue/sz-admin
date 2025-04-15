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
        <div class="sliderBox_text">向右滑动，完成验证</div>
        <!-- 滑块轨迹显示 -->
        <div class="sliderBox_track" :style="{ width: trackWidth + 'px' }" />
        <!-- 滑块按钮 -->
        <div class="sliderBox_btn" ref="slider" 
          @mousedown="onMouseDown" 
          @touchstart="onTouchStart">&gt;</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { getImageCodeApi, verifyImageCodeApi } from '@/api/modules/system/captcha';
import { aesEncrypt } from '@/utils';

// 定义组件选项
defineOptions({
  name: 'SliderCaptcha'
});

const dialogVisible = ref(false); // 控制对话框可见性

// 定义滑动验证数据结构
const slideData = reactive({
  big: '',
  small: '',
  requestId: '',
  posY: 0,
  isSuccess: false,
  bigWidth: 320,
  secretKey: ''
});

const slider = ref<HTMLDivElement | null>(null); // 滑块元素引用
const wrap = ref<HTMLDivElement | null>(null); // 滑动容器引用
const imgK = ref<HTMLImageElement | null>(null); // 小图元素引用
const trackWidth = ref(0); // 滑动轨迹宽度
const overlayMessage = ref(''); // 验证结果提示信息
const overlayVisible = ref(false); // 验证结果提示可见性
const isVerifying = ref(false); // 是否正在验证标志
const emit = defineEmits(['success', 'close']);

// 鼠标拖动相关变量
let isDragging = false;
let startX = 0;
let startLeft = 0;

// 接收父组件的参数并初始化滑动验证
const acceptParams = () => {
  fetchSlideData();
};

// 获取滑动验证数据
const fetchSlideData = async () => {
  try {
    const { data } = await getImageCodeApi();
    // 将API返回的数据赋值给滑动验证数据
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
    
    // 在下一个DOM更新周期后设置小图位置
    setTimeout(() => {
      resetSliderPosition();
    }, 50);
  } catch (error) {
    console.error('获取验证码失败:', error);
  }
};

// 刷新滑动验证
const refreshSlider = async () => {
  slideData.isSuccess = false;
  overlayVisible.value = false;
  overlayMessage.value = '';
  await fetchSlideData();
};

// 关闭滑动验证对话框
const closeSlider = () => {
  dialogVisible.value = false;
  resetSlider();
  emit('close');
};

// 重置滑块数据
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

// 重置滑块位置
const resetSliderPosition = () => {
  if (slider.value && imgK.value) {
    slider.value.style.left = '0px';
    imgK.value.style.left = '0px';
    ensureImageYPosition();
    trackWidth.value = 0;
  }
};

// 鼠标按下事件
const onMouseDown = (e: MouseEvent) => {
  if (!slider.value || !wrap.value || isVerifying.value) return;
  e.preventDefault();
  startDrag(e.clientX);
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// 触摸开始事件
const onTouchStart = (e: TouchEvent) => {
  if (!slider.value || !wrap.value || isVerifying.value) return;
  e.preventDefault();
  if (e.touches.length === 1) {
    startDrag(e.touches[0].clientX);
    
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
  }
};

// 开始拖动
const startDrag = (clientX: number) => {
  isDragging = true;
  startX = clientX;
  startLeft = parseInt(slider.value!.style.left || '0');
};

// 鼠标移动事件
const onMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  moveSlider(e.clientX);
};

// 触摸移动事件
const onTouchMove = (e: TouchEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  if (e.touches.length === 1) {
    moveSlider(e.touches[0].clientX);
  }
};

// 移动滑块
const moveSlider = (clientX: number) => {
  if (!slider.value || !imgK.value || !wrap.value) return;
  
  const moveX = clientX - startX;
  const newLeft = Math.max(0, Math.min(startLeft + moveX, wrap.value.offsetWidth - slider.value.offsetWidth));
  
  // 设置X轴位置
  slider.value.style.left = `${newLeft}px`;
  imgK.value.style.left = `${newLeft}px`;
  
  // 确保Y轴位置不变
  ensureImageYPosition();
  
  trackWidth.value = newLeft;
};

// 鼠标松开事件
const onMouseUp = async (e: MouseEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  endDrag();
  
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};

// 触摸结束事件
const onTouchEnd = async (e: TouchEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  endDrag();
  
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
};

// 确保小图Y轴位置正确
const ensureImageYPosition = () => {
  if (imgK.value && slideData.posY !== undefined && slideData.posY !== null) {
    const yPos = parseInt(String(slideData.posY));
    imgK.value.style.top = `${yPos}px`;
    return yPos;
  }
  return 0;
};

// 结束拖动
const endDrag = async () => {
  if (!slider.value || !imgK.value) return;
  
  isDragging = false;
  const currentLeft = parseInt(slider.value.style.left || '0');
  
  // 确保Y轴位置正确
  ensureImageYPosition();
  
  if (currentLeft > 0) {
    try {
      isVerifying.value = true;
      const startTime = Date.now();
      const { iv, encryptedData } = await aesEncrypt(currentLeft + '', slideData.secretKey);
      await verifyImageCode({
        requestId: slideData.requestId,
        startTime,
        moveEncrypted: encryptedData,
        iv: iv
      });
    } catch (error) {
      console.error('验证失败:', error);
      handleVerificationFailure();
    } finally {
      isVerifying.value = false;
    }
  }
};

// 验证滑动结果
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

// 处理验证失败
const handleVerificationFailure = () => {
  slideData.isSuccess = false;
  overlayMessage.value = '验证失败';
  overlayVisible.value = true;
  resetSliderPosition();
  setTimeout(() => {
    refreshSlider();
  }, 1000);
};

// 组件卸载前清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
});

// 对话框打开后处理
const onDialogOpened = () => {
  // 确保在对话框完全打开后再次设置小图位置
  setTimeout(() => {
    ensureImageYPosition();
    console.log('对话框打开后设置小图Y轴位置:', imgK.value?.style.top);
  }, 100);
};

// 公开的组件方法
defineExpose({
  acceptParams,
  dialogVisible
});
</script>

<style scoped lang="scss">
@use 'index.scss';
</style>
