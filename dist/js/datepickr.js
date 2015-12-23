(function(){

	/* Days Between Dates ( http://stackoverflow.com/a/4413721/5305938 ) */

	Date.prototype.addDays = function(days) {
		var date = new Date(this.valueOf())
		date.setDate(date.getDate() + days);
		return date;
	}

	Date.prototype.removeDays = function(days) {
		var date = new Date(this.valueOf())
		date.setDate(date.getDate() - days);
		return date;
	}

	function getDates(startDate, stopDate){
		var dateArray = new Array();
		var currentDate = startDate;
		while (currentDate < stopDate){
			currentDate = currentDate.addDays(1);
			var thisDate = new Date(currentDate);
			dateArray.push({
				day: thisDate.getDate(),
				month: thisDate.getMonth(),
				year: thisDate.getFullYear()
			});
		}
		return dateArray;
	}

	$.each(['show', 'hide'], function(index, event){
        var element = $.fn[event];
        $.fn[event] = function(){
          	this.trigger(event);
          	return element.apply(this, arguments);
        };
    });

	var selectedElements = [];
	var selectedElement = [];

	jQuery.extend( jQuery.fn, {
		// Name of our method & one argument (the parent selector)
		within: function( pSelector ) {
			// Returns a subset of items using jQuery.filter
			return this.filter(function(){
				// Return truthy/falsey based on presence in parent
				return $(this).closest( pSelector ).length;
			});
		}
	});

	$.fn.DatePickr = function(options){

		var options = $.extend({

			datemin: "1 Jan 1995",
			datemax: "31 Dec 2035",
			draggable: false,
			showDragNote: true,
			dragNoteText: "Hold <kbd>shift</kbd> to continue selection on another month.",
			dragKey: 16,
			onChange: function(){},
			onHide: function(){},
			onShow: function(){},
			onBeforeMonthChange: function(){},
			onMonthChange: function(){},
			position: "bottom"

		}, options);

		var original = this;

		var isInput = original.is("input");

		var pickrid = $(".datepickr").length;

		if(!isInput){

			original.css({
				display: "inline-block"
			});

			original.append("<div class='datepickr' data-pickr-id='" + pickrid + "'></div>");

			var datepickr = original.find(".datepickr[data-pickr-id='" + pickrid + "']");

		} else{

			original.after("<div class='datepickr' data-pickr-id='" + pickrid + "'></div>");

			var datepickr = original.next(".datepickr[data-pickr-id='" + pickrid + "']");

		}

		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var now = new Date();

		var currentMonth = now.getMonth();

		var currentYear = now.getFullYear();

		if((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0){
			var isCurrentLeapYear = true;
		} else{
			var isCurrentLeapYear = false;
		}

		var daysInCurrentMonth = [31, (isCurrentLeapYear ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][currentMonth];

		var datemin = new Date();
		var datemax = new Date().addDays(1);

		selectedElements[pickrid] = [];
		selectedElement[pickrid] = 0;

		if(typeof options.datemin == "string"){
			datemin = Date.parse(options.datemin);
		} else if(typeof options.datemin == "object"){
			datemin = new Date(options.datemin.getFullYear(), options.datemin.getMonth(), options.datemin.getDate());
		}
		if(typeof options.datemax == "string"){
			datemax = Date.parse(options.datemax);
		} else if(typeof options.datemax == "object"){
			datemax = new Date(options.datemax.getFullYear(), options.datemax.getMonth(), options.datemax.getDate());
		}

		var _calendarDate = new Date(currentYear, currentMonth, 1);
		var _calendarDate_ = new Date(currentYear, currentMonth, daysInCurrentMonth + 1);

		if(_calendarDate_ < datemin){
			loadDayCalendar(datemin.getFullYear(), datemin.getMonth());
		} else if(_calendarDate_ > datemax){
			loadDayCalendar(datemax.getFullYear(), datemax.getMonth());
		} else{
			loadDayCalendar(currentYear, currentMonth);
		}

		if(isInput){
			function datepickrPosition(){
				datepickr.css("position", "absolute");
				if(options.position == "bottom"){
					datepickr.css({
						top: original.offset().top + original.outerHeight() + 10,
						left: original.offset().left
					});
				} else if(options.position == "top"){
					datepickr.css({
						bottom: original.offset().bottom + original.outerHeight() + 10,
						left: original.offset().left
					});
				} else if(options.position == "right"){
					datepickr.css({
						top: original.offset().top,
						left: original.offset().left + original.outerWidth() + 10
					});
				} else if(options.position == "left"){
					datepickr.css({
						top: original.offset().top,
						right: original.offset().right + original.outerWidth() + 10
					});
				} else{
					datepickr.css({
						top: original.offset().top + original.outerHeight() + 10,
						left: original.offset().left
					});
				}
			}
			datepickrPosition();
			$("*").on("show", function(){
				datepickrPosition();
			});
			datepickr.hide();
			original.on("focus", function(){
				var event = {
					element: datepickr
				};
				var div = datepickr.show();
				options.onShow(event);
				$(document).bind("focusin.datepickr click.datepickr", function(e){
					if($(e.target).closest("[data-pickr-id='" + pickrid + "']").length || $(e.target).closest(original).length) return;
					$(document).unbind(".datepickr");
					var event = {
						element: datepickr
					};
					div.hide();
					options.onHide(event);
				});
			});
		}

		function loadDayCalendar(year, month){

			datepickr.empty();

			datepickr.append("<div class='datepickr-top'><span class='datepickr-left'>&lt;</span><span class='datepickr-date'><span class='datepickr-month'></span> <span class='datepickr-year'></span></span><span class='datepickr-right'>&gt;</span></div><div class='datepickr-weekdays'></div><div class='datepickr-days'></div>");

			if(options.showDragNote && options.draggable){
				datepickr.append("<div class='datepickr-dragnote'></div>");
				datepickr.find(".datepickr-dragnote")
						 .html(options.dragNoteText);
			}

			var weekdays = datepickr.find(".datepickr-weekdays");

			var weekdaysCharacters = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

			for(var weekday = 0; weekday < weekdaysCharacters.length; weekday++){
				weekdays.append("<span class='datepickr-weekday'>" + weekdaysCharacters[weekday] + "</span>");
			}

			if((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0){
				var isLeapYear = true;
			} else{
				var isLeapYear = false;
			}

			var daysInMonth = [31, (isLeapYear ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];

			var daysInPreviousMonth = new Date(year, month, 0).getDate();

			var firstDayOfWeekOfMonth = new Date(year, month, 1).getDay();

			if(firstDayOfWeekOfMonth == 0){
				var itemsBefore = 6;
			} else{
				var itemsBefore = firstDayOfWeekOfMonth - 1;
			}
			var itemsAfter = 42 - daysInMonth - itemsBefore;

			datepickr.find(".datepickr-month")
					 .append(months[month]);

			datepickr.find(".datepickr-year")
					 .append(year);

			var datemin = new Date();
			var datemax = new Date().addDays(1);

			if(typeof options.datemin == "string"){
				datemin = Date.parse(options.datemin);
			} else if(typeof options.datemin == "object"){
				datemin = new Date(options.datemin.getFullYear(), options.datemin.getMonth(), options.datemin.getDate());
			}
			if(typeof options.datemax == "string"){
				datemax = Date.parse(options.datemax);
			} else if(typeof options.datemax == "object"){
				datemax = new Date(options.datemax.getFullYear(), options.datemax.getMonth(), options.datemax.getDate());
			}

			for(var day = daysInPreviousMonth - itemsBefore; day < (daysInPreviousMonth + 1); day++){
				var previousYear = (month == 0 ? (year - 1): year);
				var previousMonth = (month == 0 ? 11: (month - 1));
				var previousDate = new Date(previousYear, previousMonth, day);
				if(previousDate >= datemin){
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day datepickr-disabled datepickr-previous' data-day='" + day + "' data-month='" + previousMonth + "' data-year='" + previousYear + "'>" + day + "</span>");
				} else{
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day datepickr-disabled' data-day='" + day + "' data-month='" + previousMonth + "' data-year='" + previousYear + "'>" + day + "</span>");
				}
			}

			for(var day = 1; day < (daysInMonth + 1); day++){
				var thisDate_ = new Date(year, month, day);
				if(thisDate_ >= datemin && thisDate_ <= datemax){
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day' data-day='" + day + "' data-month='" + month + "' data-year='" + year + "'>" + day + "</span>");
				} else if(thisDate_ <= datemin){
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day datepickr-disabled' data-day='" + day + "' data-month='" + previousMonth + "' data-year='" + previousYear + "'>" + day + "</span>");
				} else if(thisDate_ >= datemax){
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day datepickr-disabled' data-day='" + day + "' data-month='" + previousMonth + "' data-year='" + previousYear + "'>" + day + "</span>");
				}
			}

			for(var day = 1; day < itemsAfter; day++){
				var nextYear = (month == 11 ? (year + 1): year);
				var nextMonth = (month == 11 ? 0: (month + 1));
				var nextDate = new Date(nextYear, nextMonth, day);
				if(nextDate <= datemax){
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day datepickr-disabled datepickr-next' data-day='" + day + "' data-month='" + nextMonth + "' data-year='" + nextYear + "'>" + day + "</span>");
				} else{
					datepickr.find(".datepickr-days")
							 .append("<span class='datepickr-day datepickr-disabled' data-day='" + day + "' data-month='" + nextMonth + "' data-year='" + nextYear + "'>" + day + "</span>");
				}
			}

			$(".datepickr-disabled:not(.datepickr-next, .datepickr-previous)").css({
				cursor: "auto"
			});

			if(selectedElements[pickrid].length > 0){
				var tempElements = $.grep(selectedElements[pickrid], function(element){
					return element.month == month && element.year == year;
				});
				$.each(tempElements, function(index, element){
					datepickr.find(".datepickr-day[data-day='" + element.day + "']:not(.datepickr-disabled)")
							 .addClass("datepickr-highlighted");
				});
				var tempElements = false;
			} else if(typeof selectedElement[pickrid] == "object"){
				if(selectedElement[pickrid].month == month && selectedElement[pickrid].year == year){
					datepickr.find(".datepickr-day[data-day='" + selectedElement[pickrid].day + "']:not(.datepickr-disabled)")
							 .addClass("datepickr-highlighted");
				}
			}

			var mouseDown = false;
			var lastSelection;
			var isHighlighted;
			var shiftPressed = false;

			$(window)
					 .keydown(function(e){
						var code = e.keyCode || e.which;
						if(code == options.dragKey){
							shiftPressed = true;
						}
					 })
					 .keyup(function(e){
						var code = e.keyCode || e.which;
						if(code == options.dragKey){
							shiftPressed = false;
						}
					 });

			function sortSelectedElements(){
				selectedElements[pickrid].sort(function(element1, element2){
					return new Date(element2.year, element2.month, element2.day) - new Date(element1.year, element1.month, element1.day);
				});
			}

			datepickr.find(".datepickr-day:not(.datepickr-disabled)")
					 .on("mousedown", function(e){

						if(e.which !== 1) return true;

						mouseDown = true;

						if(!shiftPressed){

							$(this).nextAll(".datepickr-highlighted")
								   .removeClass("datepickr-highlighted");

							$(this).prevAll(".datepickr-highlighted")
								   .removeClass("datepickr-highlighted");

							selectedElements[pickrid] = [];

						} else{

							if($(this).prevAll(".datepickr-highlighted").length > 0){

								$(this).prevUntil(".datepickr-highlighted").addClass("datepickr-highlighted datepickr-dragging");

							}

							if($(this).nextAll(".datepickr-highlighted").length > 0){

								$(this).nextUntil(".datepickr-highlighted").addClass("datepickr-highlighted datepickr-dragging");

							}

							sortSelectedElements();

							var thisDay = $(this).data("day");
							var thisMonth = $(this).data("month");
							var thisYear = $(this).data("year");
							var thisDate = new Date(thisYear, thisMonth, thisDay);

							var selectedElementsLast = selectedElements[pickrid][selectedElements[pickrid].length - 1];
							var selectedElementsLastDay = selectedElementsLast.day;
							var selectedElementsLastMonth = selectedElementsLast.month;
							var selectedElementsLastYear = selectedElementsLast.year;
							var selectedElementsLastDate = new Date(selectedElementsLastYear, selectedElementsLastMonth, selectedElementsLastDay);

							if(thisDate > selectedElementsLastDate){
								selectedElements[pickrid] = selectedElements[pickrid].concat(getDates(selectedElementsLastDate, thisDate));
							} else{
								selectedElements[pickrid] = selectedElements[pickrid].concat(getDates(thisDate.removeDays(1), selectedElementsLastDate));
							}

							loadDayCalendar(year, month);

						}

						$(this).addClass("datepickr-highlighted datepickr-dragging");

						if(isInput){
							datepickr.show();
						}

						return false;
					 })
					 .on("mouseover", function(){

						if(mouseDown){

							if($(this).prevAll(".datepickr-highlighted").length > 0){

								$(this).prevUntil(".datepickr-highlighted").addClass("datepickr-highlighted datepickr-dragging");
								$(this).nextAll(".datepickr-highlighted").removeClass("datepickr-highlighted datepickr-dragging");

							}

							if($(this).nextAll(".datepickr-highlighted").length > 0){

								$(this).nextUntil(".datepickr-highlighted").addClass("datepickr-highlighted datepickr-dragging");
								$(this).prevAll(".datepickr-highlighted").removeClass("datepickr-highlighted datepickr-dragging");

							}

							$(this).addClass("datepickr-highlighted datepickr-dragging");

						}
					 });

			$(document).on("mouseup", function(){
				if(mouseDown){

					$(".datepickr-dragging").each(function(){
						var thisDay = $(this).data("day");
						var thisMonth = $(this).data("month");
						var thisYear = $(this).data("year");
						selectedElements[pickrid].push({
							day: thisDay,
							month: thisMonth,
							year: thisYear
						});
					});

					$(".datepickr-dragging").removeClass("datepickr-dragging");

					if(isInput){
						if(selectedElements[pickrid].length > 1){
							sortSelectedElements();
							var firstElement = selectedElements[pickrid][0];
							var firstDate = firstElement.day + " " + months[firstElement.month] + " " + firstElement.year;
							var lastElement = selectedElements[pickrid][selectedElements[pickrid].length - 1];
							var lastDate = lastElement.day + " " + months[lastElement.month] + " " + lastElement.year;
							original.val(lastDate + " - " + firstDate);
						} else if(selectedElements[pickrid].length == 1){
							var firstElement = selectedElements[pickrid][0];
							var firstDate = firstElement.day + " " + months[firstElement.month] + " " + firstElement.year;
							original.val(firstDate);
						}
					}

					var event = {
							element: datepickr,
							date: selectedElements[pickrid]
						};
						options.onChange(event);

					datepickr.trigger("datepickr:select", [selectedElements[pickrid]]);
					original.trigger("datepickr:select", [selectedElements[pickrid]]);

					datepickr.trigger("change", [selectedElements[pickrid]]);
					original.trigger("change", [selectedElements[pickrid]]);

				}
				mouseDown = false;
			});

			if(!options.draggable){
				$(document).off("mouseup");
				datepickr.find(".datepickr-day:not(.datepickr-disabled)")
						 .off("mousedown")
						 .off("mouseover")
						 .on("mousedown", function(){

							$(".datepickr-highlighted").within(datepickr)
													   .removeClass("datepickr-highlighted");
							$(this).addClass("datepickr-highlighted");

							selectedElement[pickrid] = {
								day: $(this).data("day"),
								month: $(this).data("month"),
								year: $(this).data("year")
							};
							if(isInput){
								var firstDate = selectedElement[pickrid].day + " " + months[selectedElement[pickrid].month] + " " + selectedElement[pickrid].year;
								original.val(firstDate);
							}

							var event = {
								element: datepickr,
								date: selectedElement[pickrid]
							};
							options.onChange(event);

							datepickr.trigger("datepickr:select", [selectedElement[pickrid]]);
							original.trigger("datepickr:select", [selectedElement[pickrid]]);

							datepickr.trigger("change", [selectedElement[pickrid]]);
							original.trigger("change", [selectedElement[pickrid]]);

						 });
			}

			datepickr.find(".datepickr-left, .datepickr-previous")
					 .click(function(){
						if(month == 0){
							month = 11;
							year = year - 1;
						} else{
							month = month - 1;
						}
						var event = {
							element: datepickr,
							month: month,
							year: year,
							direction: -1
						};
						options.onBeforeMonthChange(event);
						loadDayCalendar(year, month);
						datepickr.show();
						options.onMonthChange(event);
					 });

			datepickr.find(".datepickr-right, .datepickr-next")
					 .click(function(){
						if(month == 11){
							month = 0;
							year = year + 1;
						} else{
							month = month + 1;
						}
						var event = {
							element: datepickr,
							month: month,
							year: year,
							direction: 1
						};
						options.onBeforeMonthChange(event);
						loadDayCalendar(year, month);
						datepickr.show();
						options.onMonthChange(event);
					 });

		}

	};

	$(document).ready(function(){
		$("[data-datepickr]").each(function(){
			var data = $(this).data;
			$(this).DatePickr({
				datemin: data("datemin") || "1 Jan 1995",
				datemax: data("datemax") || "1 Dec 2035",
				draggable: $(this).is("[data-draggable]"),
				position: data("position") || "bottom"
			});
		});
	});

}());
