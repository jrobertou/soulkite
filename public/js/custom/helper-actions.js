(function(){
	$(document).on('click', '[data-type="action-group"]', function(){
  	$($(this).data('group')).hide();
  	$($(this).data('target')).show();
  	$('*[data-type="action-group"]').removeClass('active');
  	$(this).addClass('active');
	});
})();