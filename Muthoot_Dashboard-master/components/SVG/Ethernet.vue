<template>
    <svg :width="width * 0.03703703704 || size  * 0.03703703704"
      :height="height * 0.03846153846 || size  * 0.03846153846" viewBox="0 0 78 81" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="78" height="80.7857" rx="10" fill="currentColor" fill-opacity="0.1" style="fill:currentColor;fill:currentColor;fill-opacity:0.1;"/>
      <g clip-path="url(#clip0_113_1388)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M29.9434 15.7878C29.2826 16.4486 29.2826 32.8519 29.9434 33.5127C30.2357 33.8051 31.6883 33.9792 33.8304 33.9792H37.251V36.3114V38.6436H25.5899H13.9287V40.1985V41.7533H17.8158H21.7028V44.0855V46.4177H18.2822C16.1401 46.4177 14.6875 46.5919 14.3952 46.8842C13.7344 47.545 13.7344 63.9483 14.3952 64.6091C15.056 65.2699 31.4593 65.2699 32.1201 64.6091C32.454 64.2752 32.5866 61.7587 32.5866 55.7466C32.5866 49.7345 32.454 47.2181 32.1201 46.8842C31.8278 46.5919 30.3752 46.4177 28.2331 46.4177H24.8125V44.0855V41.7533H38.8058H52.7992V44.0855V46.4177H49.3786C47.2364 46.4177 45.7838 46.5919 45.4915 46.8842C45.1576 47.2181 45.0251 49.7345 45.0251 55.7466C45.0251 61.7587 45.1576 64.2752 45.4915 64.6091C45.8254 64.943 48.3458 65.0755 54.3715 65.0755C62.0286 65.0755 62.8429 65.0118 63.4283 64.3646C63.9853 63.7493 64.0716 62.5214 64.0716 55.2071C64.0716 50.0929 63.9021 47.0599 63.6829 47.1951C63.4839 47.3184 63.2382 47.0299 63.1037 46.8126C62.9677 46.593 61.3192 46.4177 59.3842 46.4177H55.9088V44.0991V41.7805H59.7958L63.6829 41.7533V40.0041V38.4493L52.234 38.5573L40.3606 38.6658V36.3223V33.9792H43.7812C45.9234 33.9792 47.376 33.8051 47.6683 33.5127C48.3291 32.8519 48.3291 16.4486 47.6683 15.7878C47.0075 15.127 30.6042 15.127 29.9434 15.7878ZM32.5866 24.6503V30.8696H38.8058H45.0251V24.6503V18.431H38.8058H32.5866V24.6503ZM14.0951 55.7466C14.0951 60.5568 14.1507 62.5248 14.2191 60.1195C14.2871 57.7146 14.2871 53.779 14.2191 51.3737C14.1507 48.9688 14.0951 50.9364 14.0951 55.7466ZM17.0384 55.7466V61.9659H23.2577H29.4769V55.7466V49.5274H23.2577H17.0384V55.7466ZM48.1347 55.7466V61.9659H54.354H60.5733V55.7466V49.5274H54.354H48.1347V55.7466Z" fill="currentColor" fill-opacity="0.3" style="fill:currentColor;fill:currentColor;fill-opacity:0.3;"/>
      </g>
      <rect x="29.088" y="15.3214" width="19.0465" height="18.6578" rx="4" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
      <rect x="13.9287" y="46.4177" width="19.0465" height="18.6578" rx="4" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
      <rect x="45.0251" y="46.4177" width="19.0465" height="18.6578" rx="4" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
      <defs>
        <clipPath id="clip0_113_1388">
          <rect width="49.7541" height="49.7541" fill="white" style="fill:white;fill:white;fill-opacity:1;" transform="translate(13.9287 15.3214)"/>
        </clipPath>
      </defs>
    </svg>
</template>
<script>

export default {
  props: {
    size: {
      type: String,
      default() {
        return '2106'
      },
    },
    width: {
      type: String,
      default() {
        return null
      },
    },
    height: {
      type: String,
      default() {
        return null
      },
    },
  },
}
</script>