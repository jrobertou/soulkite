(function(){
	$(document).on('change', '#country-input', function(){
  	var $all = $("#all-states")
  		,	$ca = $("#ca-states")
  		,	$us = $("#us-states")
  		,	$statesChoices = $(".states-choices")
  		,	val = $(this).val();

	  $statesChoices.removeClass('hide').prop('disabled', true).hide();
  	switch(val) {
		case "CA":
	  		$ca.prop('disabled', false).show();
		  break;
		case "US":
	  		$us.prop('disabled', false).show();
		  break;
		default:
		  	$all.prop('disabled', false).show();
		  break;
		}

	});
})();