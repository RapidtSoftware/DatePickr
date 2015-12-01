$(document).ready(function(){
	$("pre").show(function(){
		$(window).scroll(function(){
			var scrollTop = $(window).scrollTop() + 40;
			var usage = $("#usage").offset().top;
			var examples = $("#examples").offset().top;
			if(scrollTop < usage){
				$("#nav").css("background", "#FFFFFF").find("a").css({borderRight: "1px solid #CCCCCC", color: "#111111"});
			} else if(scrollTop < examples){
				$("#nav").css("background", "#9C2E25").find("a").css({borderRight: "1px solid #9B2E25", color: "#FFFFFF"});
			} else{
				$("#nav").css("background", "#FFFFFF").find("a").css({borderRight: "1px solid #CCCCCC", color: "#111111"});
			}
		});
	});
	$(".scrollto").click(function(e){
		var id = $(this).attr("href");
		$("html, body").animate({
			scrollTop: $(id).offset().top
		}, 800);
		return false;
	});
});
