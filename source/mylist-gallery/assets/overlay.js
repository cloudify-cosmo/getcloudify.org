<script type="text/javascript">
  function showOverlay() {
     jQuery('html, body').animate(
        { scrollTop: 0 },
        {
            duration: 300,
            easing: 'swing'
            // try using 'swing' too
            // 'easeInOutExpo' is supported with jQuery UI
        }
    );
    jQuery( ".overlay-bg" ).addClass( "show-overlay-bg" );
    jQuery( ".overlay" ).addClass( "show-overlay" );
    jQuery( ".overlay-wrap" ).addClass( "show-overlay-wrap" );
  }
  function closeOverlay() {
    jQuery( ".overlay-bg" ).removeClass( "show-overlay-bg" );
    jQuery( ".overlay" ).removeClass( "show-overlay" );
    jQuery( ".overlay-wrap" ).removeClass( "show-overlay-wrap" );
    jQuery('.overlay-content').html("<div class='loading'><img src='/wp-content/themes/wpportfolio/images/bx_loader.gif'><p>loading</p></div>");
  }
  function sticky_relocate() {
    var window_top = jQuery(window).scrollTop();
    var div_top = jQuery('#sticky-anchor').offset().top;
    if (window_top > div_top) {
        jQuery('.top-overlay-bar').addClass('stick');
    } else {
        jQuery('.top-overlay-bar').removeClass('stick');
    }
  }

  // $(function () {
  jQuery(document).ready(function($) {
      $(window).scroll(sticky_relocate);
      sticky_relocate();
  });
</script>