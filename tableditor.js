/**
 * @name TablEditor
 * @description Inline editor for HTML tables compatible with Bootstrap 
 * @author Shohrab Hossain <sourav.diubd@gmail.com>
 * @version 1.1.0
 * @copyright (c) 2024  
 */


if (typeof jQuery === "undefined") {
    throw new Error("TablEditor requires jQuery library.");
}

(function ($) {
    "use strict";

    $.fn.TablEditor = function (options) {
        if (!this.is("table")) {
            throw new Error(
                "TablEditor only works when applied to a table."
            );
        }

        var $table = this;

        var defaults = {
            url: window.location.href,
            inputClass: "form-control input-sm",
            groupClass: "btn-group btn-group-sm",
            dangerClass: "table-danger",
            warningClass: "table-warning",
            paginationClass: "page-link",
            deleteBtnClass: "",
            editBtnClass: "",
            refreshBtnClass: "",
            eventType: "click", 
            autoFocus: true,
            columns: {
                identifier: [0, 'id'],
                editable: []
            }, 
            onSuccess: function() { return; },
            onFail: function() { return; },
            onAlways: function() { return; },
            onAjax: function() { return; }
        };

        var settings = $.extend(true, defaults, options);
        var $isEditable = false;

        /**
         * Draw TablEditor structure (identifier column, editable columns).
         *
         * @type {object}
         */
        var Draw = {
            columns: {
                identifier: function() { 
                    $table.find('thead th:nth-child(1)').html(`<input type="checkbox" class="tableditable-check-all" value="all"/>`);

                    var $td = $table.find('tbody td:nth-child(' + (parseInt(settings.columns.identifier[0]) + 1) + ')');

                    if ($td.length < 0) {
                        return false;
                    }
                    
                    $td.each(function() {
                        // Create hidden input with row identifier.
                        var input = '<input class="editable-identifier tableditable-check" type="checkbox" name="' + settings.columns.identifier[1] + '[]" value="' + $(this).closest('tr').data('id') + '" >';
                        // Add elements to table cell.
                        $(this).html(input); 
                    });
                },
                editable: function() {
                    for (var i = 0; i < settings.columns.editable.length; i++) {
                        var $td = $table.find('tbody td:nth-child(' + (parseInt(settings.columns.editable[i][0]) + 1) + ')');

                        $td.each(function() {
                            // Get text of this cell.
                            var text = $(this).text().trim();

                            // Add pointer as cursor.
                            if (!settings.editButton) {
                                $(this).css('cursor', 'pointer');
                            }

                            // Create span element.
                            var span = '<span class="tableditable-span" data-name="' + settings.columns.editable[i][1] + '" data-value="'+ text +'">' + text + '</span>';
                            var input = '<input class="tableditable-input ' + settings.inputClass + '" type="text" name="' + settings.columns.editable[i][1] + '" value="' + text + '" style="max-width:160px;display: none;" disabled>';
                            var combobox = "";

                            // Check if exists the third parameter of editable array.
                            if (typeof settings.columns.editable[i][2] !== 'undefined') {
                                // Create select element.
                                combobox += '<div style="position:relative;display:block;width:100%;">';
                                combobox += '<ul class="tableditable-combobox" style="max-width:160px;max-height:150px;position:absolute;top:2px;left:0;box-sizing:border-box;border:1px solid #ccc;border-top:none;overflow-y:auto;background-color:white;z-index:1;display:none;margin: 0;padding:0;list-style:none">';
                                combobox += '<li style="padding:3px 6px;cursor:pointer"><input type="text" class="tableditable-filter ' + settings.inputClass + '" placeholder="Search..." style="width:100%;box-sizing:border-box;padding:3px 6px"></li>';

                                // Create options for select element.
                                $.each(jQuery.parseJSON(settings.columns.editable[i][2]), function(index, value) {
                                    if (text === value) {
                                        // overwrite input
                                        span = '<span class="tableditable-span" data-name="' + settings.columns.editable[i][1] + '"  data-value="'+ index +'">' + value + '</span>';
                                        input = '<input class="tableditable-input ' + settings.inputClass + '" type="text" name="' + settings.columns.editable[i][1] + '" value="' + value + '" style="max-width:160px;display: none;" disabled readonly>';

                                        combobox += '<li data-value="' + index + '" class="tableditable-li" style="padding:3px 6px;cursor:pointer;background:#e1e1e1" data-selected="true">'+ value +'</li>';
                                    } else {
                                        combobox += '<li data-value="' + index + '" class="tableditable-li" style="padding:3px 6px;cursor:pointer">'+ value +'</li>';
                                    }
                                });

                                // Create last piece of select element.
                                combobox += '</ul>';
                                combobox += '</div>';
                            } else {
                                var input = '<input class="tableditable-input ' + settings.inputClass + '" type="text" name="' + settings.columns.editable[i][1] + '" value="' + $(this).text() + '" style="max-width:160px;display: none;" autocomplete="off" disabled>';
                            }

                            // Add elements and class "view" to table cell.
                            $(this).html(span + input + combobox);
                            $(this).addClass('tableditable-view-mode');
                        });
                    }
                } 
            },
            modal: function(title, body, action) {
                // Create confirmation dialog elements with inline styles
                var confirmationDialog = $('<div class="editable-modal"><h4 style="color:#fff">' + title + '</h4><hr style="border-bottom:1px solid #fff"/>').css({
                    'position': 'fixed',
                    'top': '40%',
                    'left': '50%',
                    'transform': 'translate(-50%, -50%)',
                    'background-color': '#5156be',
                    'color': '#f3f8fb',
                    'padding': '20px',
                    'border': '1px solid #ccc',
                    'box-shadow': '0 0 10px rgba(0, 0, 0, 0.1)',
                    'z-index': '9999'
                });
                var message = $('<div>').css({
                    'margin-bottom': '10px'
                }).html(body);

                var buttons = $('<div class="buttons">').css({
                    'text-align': 'right'
                });
                var cancelButton = $('<button class="cancel">Cancel</button>').css({
                    'margin-left': '10px'
                });
                var continueButton = $('<button class="continue">Continue</button>');

                // Append elements to confirmation dialog
                buttons.append(continueButton, cancelButton);
                confirmationDialog.append(message, buttons);

                // Append dialog to body
                $('body').append(confirmationDialog);

                // Show confirmation dialog
                confirmationDialog.show();

                // Handle "Continue" button click
                continueButton.on('click', function() {
                    if (typeof action === 'function') {
                        action();
                    }
                    confirmationDialog.remove();
                });

                // Handle "Cancel" button click
                cancelButton.on('click', function() {
                    confirmationDialog.remove();
                });
            }
        }; 
        Draw.columns.identifier();
        Draw.columns.editable();

        /**
         * Change to view mode or edit mode with table td element as parameter.
         *
         * @type object
         */
        var Mode = {
            view: function(td) {
                // Get table row.
                var $tr = $(td).parent('tr');
                // Hide and disable input element.
                $(td).find('.tableditable-input').blur().hide();
                $(td).find('.tableditable-input').prop('disabled', true);
                $(td).find('.tableditable-combobox').blur().hide();
                // Show span element.
                $(td).find('.tableditable-span').show();
                // Add "view" class and remove "edit" class in td element.
                $(td).addClass('tableditable-view-mode').removeClass('tableditable-edit-mode'); 
            },
            edit: function(td) {
                // Get table row.
                var $tr = $(td).parent('tr');

                // Get input element.
                var $input = $(td).find('.tableditable-input');
                if ($input.length) {
                    // Enable and show input element.
                    $input.prop('disabled', false).show();

                    // Focus on input element.
                    if (settings.autoFocus) {
                        $input.focus();
                    }

                    // Hide span element.
                    $(td).find('.tableditable-span').hide();
                }

                var $combobox = $(td).find('.tableditable-combobox');
                if ($combobox.length) {
                    $combobox.show();
                    // $combobox.find('.tableditable-filter').focus();
                }

                // Add "edit" class and remove "view" class in td element.
                $(td).addClass('tableditable-edit-mode').removeClass('tableditable-view-mode'); 
            }
        };

        /**
         * Available actions for edit form function, with table td element as parameter or set of td elements.
         *
         * @type object
         */
        var Form = {
            reset: function(td) {
                $(td).each(function() {
                    // Get input element.
                    var $text   = $(this).find('.tableditable-span').text(); 
                    var $input  = $(this).find('.tableditable-input');
                    var $combobox = $(this).find('.tableditable-combobox');

                    if ($combobox.is('ul')) {
                        $(this).find('input').not('input.tableditable-filter').val($text.trim());
                    } else if ($input.is("input")) {
                        $input.val($text.trim());
                    }
                    // Change to view mode.
                    Mode.view(this);
                });
            },
            submit: function(action) {

                var $data = [];
                if (action == 'delete') {
                    $table.find('.tableditable-check:checked').each(function() {
                        var item = {};
                        item[settings.columns.identifier[1]] = $(this).val();
                        $data.push(item);
                    }); 
                } else if (action == 'edit') {
                    $table.find('.tableditable-check:checked:disabled').each(function() {
                        var $row = $(this).closest('tr');
                        var item = {};
                        item[settings.columns.identifier[1]] = $(this).val();
                        $row.find('td').each(function(i, td) {
                            var $editableSpan = $(td).find('.tableditable-span');
                            if ($editableSpan.length > 0) {
                                var name  = $editableSpan.data('name');
                                var value = $editableSpan.data('value');
                                item[name] = value;
                            }
                        });
                        $data.push(item);
                    }); 
                }

                // Send AJAX request to server.
                var ajaxResult = ajax(action, $data);

                if (ajaxResult === false) {
                    return;
                } 
            }
        };

        /**
         * Send AJAX request to server.
         *
         * @param {string} action
         */
        function ajax(action, request = [])
        { 
            if (!request) {
                return false;
            }

            var result = settings.onAjax(action, request);

            if (result === false) {
                return false;
            }

            var data = {
                action: action,
                data: request
            };
            
            var jqXHR = $.post(settings.url, data, function(response, textStatus, jqXHR) {
                if (action === 'edit') {
                    // 
                }
                settings.onSuccess(response, textStatus, jqXHR);
            }, 'json');


            jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
                if (action === 'delete') {
                    // 
                } else if (action === 'edit') {
                    // 
                }
                settings.onFail(jqXHR, textStatus, errorThrown);
            });

            jqXHR.always(function() {
                settings.onAlways();
            });
            
            return jqXHR;
        }

        /**
         * Change to edit mode on table td element.
         *
         * @param {object} event
         */
        $table.on(settings.eventType, 'td.tableditable-view-mode', function(event) {
            if (event.handled !== true) {
                event.preventDefault();
                // Reset all td's in edit mode.
                Form.reset($table.find('td.tableditable-edit-mode'));
                // Change to edit mode.
                Mode.edit(this);
                event.handled = true;
            }
        });


        /**
         * Click event on document element.
         *
         * @param {object} event
         */
        $(document).on('click', function(event) {
            var $editMode = $table.find('.tableditable-edit-mode');
            // Reset visible edit mode column.
            if (!$editMode.is(event.target) && $editMode.has(event.target).length === 0) {
                Form.reset($editMode.parent('td'));
                Form.reset($table.find('.tableditable-input:visible').parent('td'));
            }  
        });

        /**
         * Keyup event on table element.
         * 
         * @param {object} event
         */
        $table.on('keyup', function(event) {

            $isEditable = true;
            var $td = $(event.target).closest('td');
            var $combobox = $td.find('.tableditable-combobox');

            // set the value of input element
            if (!$combobox.length) {
                $td.find('.tableditable-input').val((event.target.value).trim());
                $td.find('.tableditable-span').text((event.target.value).trim());
                $td.find('.tableditable-span').attr("data-value", (event.target.value).trim());
            }

            $td.closest('tr').addClass(settings.dangerClass);
            $td.closest('tr').find('input.tableditable-check').prop('checked', true).prop('disabled', true);
            Buttons.edit();

            // Key?
            switch (event.keyCode) {
                case 9:  // Tab. 
                    Mode.view($td);
                    Mode.edit($td.next());
                    break; 
                case 27: // Escape.
                    Form.reset($td);
                    break;
            }
        });

        
        /**
         * Change event when input is a combobox element.
         */
        $table.on('keyup', 'ul.tableditable-combobox input.tableditable-filter', function() {
            const filter = $(this).val().toLowerCase();
            const listItems = $(this).closest('ul.tableditable-combobox').find('li.tableditable-li');
            listItems.each(function() {
                if ($(this).text().toLowerCase().indexOf(filter) > -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
        
        $table.on('click', 'ul.tableditable-combobox li.tableditable-li', function(event) {
            
            event.stopPropagation();

            if (event.handled !== true) {
                // set the value of input element
                event.handled = true;

                $(this).closest("ul").find("li").css("background","")

                // update the column.
                var $td = $(this).closest('td'); 
                var $text = $(this).text();
                var $value = $(this).data("value");
                $(this).css({'background':'#e1e1e1'})
                $td.find('.tableditable-span').text($text); 
                $td.find('.tableditable-span').attr("data-value", $value); 
                $td.find('input').not('input.tableditable-filter').val($text.trim());

                $td.closest('tr').addClass(settings.dangerClass);
                $td.closest('tr').find('input.tableditable-check').prop('checked', true).prop('disabled', true);

                // reset filter
                $(this).closest('ul').find('input.tableditable-filter').val('');
                $(this).closest('ul').find('li').show();

                $isEditable = true;
                Mode.view($td);
                Buttons.edit();
            }
        });

        /**
         * -------------------------------------------------------------------
         * EXTERNAL 
         * -------------------------------------------------------------------
         * Buttons
         * 
         * @param {object} event
         */ 
        var Buttons = {
            refresh: function() {
                if ($('.' + settings.refreshBtnClass).length) {
                    $('.' + settings.refreshBtnClass).prop('disabled', false);
                }
            },
            edit: function() {
                if (!$isEditable) {
                    return ;
                }
                var checked = $table.find('input.tableditable-check:checked').length;
                this.updateButton(settings.editBtnClass, `Update ${checked} Items`, checked);
            },
            delete: function() {
                var checked = $table.find('input.tableditable-check:checked').length;
                this.updateButton(settings.deleteBtnClass, `Delete ${checked} Items`, checked);
            },
            updateButton: function(btnClass, btnText, count) {
                if ($('.' + btnClass).length) {
                    $('.' + btnClass).text(btnText).prop('disabled', count === 0);
                }
            }
        };
        // load buttons
        Buttons.refresh();

        /**
         * Button Action
         * 
         * @param {object} event
         */ 
        $('body').on('click', '.' + settings.refreshBtnClass, function() {
            window.location.reload();
        });
        $('body').on('click', '.' + settings.deleteBtnClass, function() {
            var title = "Confirmation Required";
            var body = "Are you sure you want to delete these item?<br/>This action cannot be undone.";
            // load modal
            Draw.modal(title, body, function() {
                // submit form
                Form.submit('delete');
            }); 
        });
        $('body').on('click', '.' + settings.editBtnClass, function() {
            var title = "Confirmation Required";
            var body = "Are you sure you want to update these items?<br/>This action cannot be undone.";
            // load modal
            Draw.modal(title, body, function() {
                // submit form
                Form.submit('edit');
            }); 
        });
        
        /**
         * Check checkboxes
         * 
         * @param {object} event
         */ 
        var checkAll = $table.find('input.tableditable-check-all');
        var checkboxes = $table.find('input.tableditable-check');
        checkAll.on('change', function() {
            checkboxes.not(':disabled').prop('checked', $(this).prop('checked'));
            // update button
            Buttons.delete();
            
        });
        // Handle individual checkbox changes
        checkboxes.on('change', function() {
            checkAll.prop('checked', checkboxes.length === checkboxes.filter(':checked').length);
            // update button
            Buttons.delete();
        });

        /**
         * Prevent pagination when any field is editable
         * 
         * @param {object} event
         */ 
        $('body').on('click', settings.paginationClass ? '.' + settings.paginationClass : '', function(e) {
            if ($isEditable) {
                e.preventDefault();
                e.stopPropagation(); 

                var title = "Are you sure?";
                var body = "You have unsaved changes to " + checkboxes.filter(':checked').length + " items. Please save before leaving.<br/>Click \"Continue\" to proceed without saving, or \"Cancel\" to stay and save changes.";

                // load modal
                Draw.modal(title, body, function() {
                    window.location.href = e.target.href;
                });
            }
        });

        return this;
    };
})(jQuery);
