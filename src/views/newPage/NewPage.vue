<template>
  <div>
    <p>new page</p>
  </div>
</template>

<script>
export default {
  name: 'NewPage',
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    bordered: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="less" scoped>
@import "~ant-design-vue/es/style/themes/default.less";

</style>
