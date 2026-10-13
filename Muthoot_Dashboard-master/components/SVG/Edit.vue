<template>
    <svg :width="width * 0.75 || size  * 0.75"
      :height="height * 0.75 || size  * 0.75" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.5238 38.8095H48.5714V43.5714H29.5238V38.8095ZM34.2857 57.8571H24.7619V19.7619H41.4286V31.6667H53.3333V39.0476L58.0952 34.2857V29.2857L43.8095 15H24.7619C23.499 15 22.2878 15.5017 21.3947 16.3947C20.5017 17.2878 20 18.499 20 19.7619V57.8571C20 59.1201 20.5017 60.3313 21.3947 61.2243C22.2878 62.1173 23.499 62.619 24.7619 62.619H34.2857V57.8571ZM29.5238 53.0952H39.2857L41.4286 50.9524V48.3333H29.5238V53.0952ZM58.5714 41.1905C58.8095 41.1905 59.2857 41.4286 59.5238 41.6667L62.619 44.7619C63.0952 45.2381 63.0952 46.1905 62.619 46.6667L60.2381 49.0476L55.2381 44.0476L57.619 41.6667C57.8571 41.4286 58.0952 41.1905 58.5714 41.1905ZM58.5714 50.4762L44.0476 65H39.0476V60L53.5714 45.4762L58.5714 50.4762Z" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
</svg>
</template>
<script>

export default {
  props: {
    size: {
      type: String,
      default() {
        return '40'
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