/*!
 * jQuery lightweight plugin largeDataScroll
 * Original author: @lsc
 */

;(function ( $, window, document, undefined ) {

  var pluginName = "largeDataScroll"
  var defaults = {
    data: [],
    setCell: (row) => {
      return ''
    }
  }

  function Plugin( element, options ) {
    this.element = element

    this.options = $.extend( {}, defaults, options)

    this._defaults = defaults
    this._name = pluginName

    this.list = null
    this.num = 0
    this.cellHeight = 20

    this.render = (n) => {
      let str = ''
      let first = Math.ceil(n / this.cellHeight)
      let leftData = this.options.data.slice(first-this.num, first)
      let centerData = this.options.data.slice(first, first + this.num)
      let rightData = this.options.data.slice(first + this.num, first + 2*this.num)
      let runData = [...leftData, ...centerData, ...rightData]
      for(let i = 0; i < runData.length; i ++) {
          str += this.options.setCell(runData[i])
      }
      // 替换数据，重新渲染
      this.list.innerHTML = str
      // 改变list在wrapper中的位置。用transform属性的translate不会回流，性能更好
      this.list.style.top = 0 + n - leftData.length * this.cellHeight + 'px'
      // 数据改变后，重置范围，在此范围内不替换数据，用list默认滚动
      this.scrollRange = [first-leftData.length, first+2*this.num]
    }

    this.init()
  }

  Plugin.prototype.init = function () {
    const _this = this
    const s1 = '<div class="background" style="width: 500px;position: absolute;top: 0;left: 0;"></div>'
    const s2 = '<div class="list" style="height: 100%;position: absolute;top: 0;left: 0;"></div>'
    // 外层盒子
    const wrapper = document.querySelector('#wrapper')
    wrapper.innerHTML = s1 + s2
    // 渲染数据用
    this.list = document.querySelector('.list')
    // 先计算每个cell的高度，要求固定，至少不要波动太大
    if(this.options.data.length) {
      const s = '<div id="getheight_20220608">' + this.options.setCell(this.options.data[0]) + '</div>'
      this.list.innerHTML = s
      const gh = document.querySelector('#getheight_20220608')
      this.cellHeight = gh.clientHeight || 20
      console.log('gh', this.cellHeight);
    }
    // 模拟滚动用
    const bg = document.querySelector('.background')
    bg.style.height = this.cellHeight * this.options.data.length + 'px'
    // 每行高度固定，当前页面在可视窗口能展示n条，当前页面上展示的第一条在数据中的位置是x，则范围就是[x-n, x+n]或x<n时就是[0，x+n]
    this.scrollRange = []
    // 每页展示多少条数据
    this.num = Math.ceil(wrapper.clientHeight / _this.cellHeight)
    // 渲染
    this.render(0)
    // 滚动的时候改变渲染的数据
    wrapper.onscroll = function(e) {
        // 滚动高度
        let n = e.target.scrollTop
        // 展示的第一条在数据中的位置
        let first = Math.ceil(n/_this.cellHeight)
        // 如果当前在范围中，则利用list的默认滚动，算是做了节流，也是为了能有滚动边界的效果，不然看到边界的数据是瞬变的
        if(first > _this.scrollRange[0] && first+_this.num < _this.scrollRange[1]) return
        // 到了临界点，再更新数据重新渲染
        _this.render(n)
    }
  }

  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if ( !$.data(this, "plugin_" + pluginName )) {
        $.data( this, "plugin_" + pluginName,
        new Plugin( this, options ))
      }
    })
  }

})( jQuery, window, document )