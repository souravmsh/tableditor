/**
 * @name TableEditor - v1.0.0
 * @description Inline editor for HTML tables compatible with Bootstrap 
 * @author Shohrab Hossain <sourav.diubd@gmail.com>
 * @version 1.0.0
 * @copyright (c) 2024 
 * @inspiredBy https://github.com/markcell/jQuery-Tabledit
 */


if (typeof jQuery === "undefined") {
    throw new Error("TableEditor requires jQuery library.");
}

(function ($) {
    "use strict";

    $.fn.TableEditor = function (options) {
        if (!this.is("table")) {
            throw new Error(
                "TableEditor only works when applied to a table."
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
            columns: {
                identifier: [0, 'id'],
                editable: [ 
                ]
            }, 
            onSuccess: function() { return; },
            onFail: function() { return; },
            onAlways: function() { return; },
            onAjax: function() { return; }
        };

        var settings = $.extend(true, defaults, options);
        var $isEditable = false;

        /**
         * Draw TableEditor structure (identifier column, editable columns).
         *
         * @type {object}
         */
        var Draw = {
            columns: {
                identifier: function() { 
                    $table.find('thead th:nth-child(1)').html(`<input type="checkbox" class="editable-check-all" value="all"/>`);

                    var $td = $table.find('tbody td:nth-child(' + (parseInt(settings.columns.identifier[0]) + 1) + ')');

                    if ($td.length <= 1) {
                        return false;
                    }
                    
                    $td.each(function() {
                        // Create hidden input with row identifier.
                        var input = '<input class="editable-identifier editable-check" type="checkbox" name="' + settings.columns.identifier[1] + '[]" value="' + $(this).closest('tr').data('id') + '" >';
                        // Add elements to table cell.
                        $(this).html(input); 
                    });
                },
                editable: function() {
                    for (var i = 0; i < settings.columns.editable.length; i++) {
                        var $td = $table.find('tbody td:nth-child(' + (parseInt(settings.columns.editable[i][0]) + 1) + ')');

                        $td.each(function() {
                            // Get text of this cell.
                            var text = $(this).text();

                            // Add pointer as cursor.
                            if (!settings.editButton) {
                                $(this).css('cursor', 'pointer');
                            }

                            // Create span element.
                            var span = '<span class="editable-span" data-name="' + settings.columns.editable[i][1] + '">' + text + '</span>';

                            // Check if exists the third parameter of editable array.
                            if (typeof settings.columns.editable[i][2] !== 'undefined') {
                                // Create select element.
                                var input = '<select class="editable-input ' + settings.inputClass + '" name="' + settings.columns.editable[i][1] + '" style="display: none;" disabled>';

                                // Create options for select element.
                                $.each(jQuery.parseJSON(settings.columns.editable[i][2]), function(index, value) {
                                    if (text === value) {
                                        input += '<option value="' + index + '" selected>' + value + '</option>';
                                    } else {
                                        input += '<option value="' + index + '">' + value + '</option>';
                                    }
                                });

                                // Create last piece of select element.
                                input += '</select>';
                            } else {
                                // Create text input element.
                                var input = '<input class="editable-input ' + settings.inputClass + '" type="text" name="' + settings.columns.editable[i][1] + '" value="' + $(this).text() + '" style="display: none;" autocomplete="off" disabled>';
                            }

                            // Add elements and class "view" to table cell.
                            $(this).html(span + input);
                            $(this).addClass('editable-view-mode');
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
                $(td).find('.editable-input').blur().hide().prop('disabled', true);
                // Show span element.
                $(td).find('.editable-span').show();
                // Add "view" class and remove "edit" class in td element.
                $(td).addClass('editable-view-mode').removeClass('editable-edit-mode'); 
            },
            edit: function(td) {
                // Get table row.
                var $tr = $(td).parent('tr');
                // Hide span element.
                $(td).find('.editable-span').hide();
                // Get input element.
                var $input = $(td).find('.editable-input');
                // Enable and show input element.
                $input.prop('disabled', false).show();
                // Focus on input element.
                if (settings.autoFocus) {
                    $input.focus();
                }
                // Add "edit" class and remove "view" class in td element.
                $(td).addClass('editable-edit-mode').removeClass('editable-view-mode'); 
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
                    var $input = $(this).find('.editable-input');
                    // Get span text.
                    var text = $(this).find('.editable-span').text();
                    // Set input/select value with span text.
                    if ($input.is('select')) {
                        $input.find('option').filter(function() {
                            return $.trim($(this).text()) === text;
                        }).attr('selected', true);
                    } else {
                        $input.val(text);
                    }
                    // Change to view mode.
                    Mode.view(this);
                });
            },
            submit: function(action) {

                var $data = [];
                if (action == 'delete') {
                    $table.find('.editable-check:checked').each(function() {
                        var item = {};
                        item[settings.columns.identifier[1]] = $(this).val();
                        $data.push(item);
                    }); 
                } else if (action == 'edit') {
                    $table.find('.editable-check:checked:disabled').each(function() {
                        var $row = $(this).closest('tr');
                        var item = {};
                        item[settings.columns.identifier[1]] = $(this).val();
                        $row.find('td').each(function(i, td) {
                            var $editableSpan = $(td).find('.editable-span');
                            if ($editableSpan.length > 0) {
                                var name  = $editableSpan.data('name');
                                var value = $editableSpan.text().trim();
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
                    // $lastEditedRow.removeClass(settings.dangerClass).addClass(settings.warningClass);
                    // setTimeout(function() {
                    //     $table.find('tr.' + settings.dangerClass).removeClass(settings.dangerClass);
                    // }, 1400);
                }
                settings.onSuccess(response, textStatus, jqXHR);
            }, 'json');


            // jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
            //     if (action === 'delete') {
            //         $lastDeletedRow.removeClass(settings.mutedClass).addClass(settings.dangerClass);
            //         $lastDeletedRow.find('.tabledit-toolbar button').attr('disabled', false);
            //         $lastDeletedRow.find('.tabledit-toolbar .tabledit-restore-button').hide();
            //     } else if (action === 'edit') {
            //         $lastEditedRow.addClass(settings.dangerClass);
            //     }

            //     settings.onFail(jqXHR, textStatus, errorThrown);
            // });

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
        $table.on(settings.eventType, 'td.editable-view-mode', function(event) {
            if (event.handled !== true) {
                event.preventDefault();

                // Reset all td's in edit mode.
                Form.reset($table.find('td.editable-edit-mode'));

                // Change to edit mode.
                Mode.edit(this);

                event.handled = true;
            }
        });

        /**
         * Change event when input is a select element.
         */
        $table.on('change', 'select.editable-input:visible', function(event) {
            if (event.handled !== true) {
                // update the column.
                var $td = $(this).parent('td'); 
                event.handled = true;

                // set the value of input element
                $td.find('.editable-input').val(event.target.value);
                $td.find('.editable-span').text(event.target.value); 
                $td.closest('tr').addClass(settings.dangerClass);
                $td.closest('tr').find('input.editable-check').prop('checked', true).prop('disabled', true);
                $isEditable = true;
                Buttons.edit();
            }
        });

        /**
         * Click event on document element.
         *
         * @param {object} event
         */
        $(document).on('click', function(event) {
            var $editMode = $table.find('.editable-edit-mode');
            // Reset visible edit mode column.
            if (!$editMode.is(event.target) && $editMode.has(event.target).length === 0) {
                Form.reset($table.find('.editable-input:visible').parent('td'));
            }
        });

        /**
         * Keyup event on table element.
         * 
         * @param {object} event
         */
        $table.on('keyup', function(event) {
            // Get input element with focus or confirmation button.
            var $input = $table.find('.editable-input:visible');
            var $button = $table.find('.editable-confirm-button');

            if ($input.length > 0) {
                var $td = $input.parents('td');
            } else if ($button.length > 0) {
                var $td = $button.parents('td');
            } else {
                return;
            }

            // set the value of input element
            $td.find('.editable-input').val(event.target.value);
            $td.find('.editable-span').text(event.target.value); 
            $td.closest('tr').addClass(settings.dangerClass);
            $td.closest('tr').find('input.editable-check').prop('checked', true).prop('disabled', true);
            $isEditable = true;
            Buttons.edit();

            // Key?
            switch (event.keyCode) {
                case 9:  // Tab.
                    Mode.edit($td.closest('td').next());
                    break;
                case 27: // Escape.
                    Form.reset($td);
                    break;
            }
        });


        /**
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
                var checked = $table.find('input.editable-check:checked').length;
                this.updateButton(settings.editBtnClass, `Update ${checked} Items`, checked);
            },
            delete: function() {
                var checked = $table.find('input.editable-check:checked').length;
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
        var checkAll = $table.find('input.editable-check-all');
        var checkboxes = $table.find('input.editable-check');
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
