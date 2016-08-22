import $ from 'jquery';

var mouse = {x:0,y:0},
    offset = {x:-10, y:10};

$('body').on('mouseenter', '[data-tip]', function() {
  var tip = $(this).data('tip');
  $('.tooltip').html(tip).show();
  offset.x = -$('.tooltip').width()/2;
  clearTimeout(this.timer);
}).on('mouseleave', '[data-tip]', function() {
  this.timer = setTimeout(function() {
    $('.tooltip').hide();
  }, 10);
});

document.addEventListener('mousemove', function(e){
  mouse.x = e.pageX;
  mouse.y = e.pageY;
  $('.tooltip').css({
    left: (mouse.x + offset.x) - $('body').scrollLeft() + 'px',
    top: (mouse.y + offset.y) + 'px'
  });
});
